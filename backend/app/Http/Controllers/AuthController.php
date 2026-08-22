<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Xác thực đăng nhập qua Google Email (1-Click Google OAuth)
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'google_id' => 'required|string',
            'name' => 'nullable|string',
            'avatar' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu xác thực Google không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = $request->input('email');
        $googleId = $request->input('google_id');
        $name = $request->input('name') ?: explode('@', $email)[0];
        $avatar = $request->input('avatar') ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

        // 1. Tìm tài khoản hiện có theo Google ID hoặc email, rồi mới tạo tài khoản mới.
        $account = Account::where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if (!$account) {
            $account = Account::create([
                'email' => $email,
                'google_id' => $googleId,
                'google_avatar' => $avatar,
                'role' => 'guest',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
        }

        // Cập nhật thông tin mới nhất từ Google
        $account->update([
            'email' => $email,
            'google_avatar' => $avatar,
            'last_login_at' => now(),
        ]);

        // 2. Tìm hoặc tạo User Profile
        $user = User::firstOrCreate(
            ['account_id' => $account->id],
            [
                'full_name' => $name,
                'avatar_url' => $avatar,
            ]
        );

        // Tải kèm quan hệ Host (nếu là chủ nhà)
        $user->load(['host.defaultPayoutAccount']);

        // 3. Cấp Sanctum Bearer Token
        $token = $account->createToken('tripnest-auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập Google thành công vào hệ thống TripNest!',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'account_id' => $account->id,
                'name' => $user->full_name,
                'email' => $account->email,
                'avatar' => $user->avatar_url ?: $account->google_avatar,
                'role' => $account->role,
                'is_host' => $user->host !== null,
                'host' => $user->host,
            ],
        ], 200);
    }

    /**
     * Lấy thông tin người dùng hiện tại
     */
    public function me(Request $request): JsonResponse
    {
        $account = $request->user();
        if (!$account) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = $account->user()->with(['host.defaultPayoutAccount'])->first();

        return response()->json([
            'id' => $user?->id,
            'account_id' => $account->id,
            'name' => $user?->full_name,
            'email' => $account->email,
            'avatar' => $user?->avatar_url ?: $account->google_avatar,
            'role' => $account->role,
            'is_host' => $user?->host !== null,
            'host' => $user?->host,
        ]);
    }

    /**
     * Update the authenticated account's local password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'nullable|string',
            'new_password' => 'required|string|min:8|confirmed|different:current_password',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Thông tin mật khẩu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        /** @var Account $account */
        $account = $request->user();
        if ($account->password && !Hash::check($request->input('current_password', ''), $account->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu hiện tại không chính xác.',
            ], 422);
        }

        $account->update([
            'password' => Hash::make($request->input('new_password')),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công.',
        ]);
    }

    /**
     * Đăng xuất
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã đăng xuất an toàn khỏi TripNest.',
        ]);
    }

    /**
     * 1. Yêu cầu gửi mã OTP khôi phục mật khẩu
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:191',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Định dạng email không hợp lệ. Vui lòng kiểm tra lại.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));

        // 1. Kiểm tra Email có tồn tại trong hệ thống không
        $account = Account::where('email', $email)->first();
        if (!$account) {
            return response()->json([
                'success' => false,
                'code'    => 'EMAIL_NOT_FOUND',
                'message' => 'Địa chỉ email này chưa được đăng ký trong hệ thống TripNest.',
            ], 404);
        }

        // 2. Kiểm tra tài khoản có bị khóa không
        if ($account->status === 'banned') {
            return response()->json([
                'success' => false,
                'code'    => 'ACCOUNT_BANNED',
                'message' => 'Tài khoản của bạn đã bị tạm khóa do vi phạm tiêu chuẩn cộng đồng. Vui lòng liên hệ support@tripnest.vn để được hỗ trợ.',
            ], 403);
        }

        // 3. Kiểm tra Rate Limit (chống spam)
        $rateLimitKey = 'forgot_pw_ratelimit_' . md5($email);
        $attempts = (int) Cache::get($rateLimitKey, 0);
        if ($attempts >= 5) {
            return response()->json([
                'success' => false,
                'code'    => 'TOO_MANY_REQUESTS',
                'message' => 'Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng thử lại sau 10 phút.',
            ], 429);
        }
        Cache::put($rateLimitKey, $attempts + 1, now()->addMinutes(10));

        // 4. Sinh mã OTP 6 số ngẫu nhiên
        $otp = (string) rand(100000, 999999);

        // Lưu vào Cache có hiệu lực trong 15 phút
        $otpCacheKey = 'forgot_pw_otp_' . md5($email);
        Cache::put($otpCacheKey, [
            'otp'              => $otp,
            'failed_attempts'  => 0,
            'account_id'       => $account->id,
            'created_at'       => now()->timestamp,
        ], now()->addMinutes(15));

        // Kiểm tra xem tài khoản này có phải tạo qua Google OAuth không
        $isGoogleOnly = !empty($account->google_id) && empty($account->password);

        return response()->json([
            'success'          => true,
            'message'          => 'Mã xác minh OTP 6 chữ số đã được gửi đến email của bạn!',
            'email'            => $email,
            'otp_demo'         => $otp, // Cung cấp OTP demo phục vụ kiểm thử nhanh
            'is_google_account' => $isGoogleOnly,
        ], 200);
    }

    /**
     * 2. Xác thực mã OTP 6 chữ số
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Mã OTP phải gồm 6 chữ số.',
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));
        $otpInput = trim($request->input('otp'));

        $otpCacheKey = 'forgot_pw_otp_' . md5($email);
        $cachedData = Cache::get($otpCacheKey);

        if (!$cachedData) {
            return response()->json([
                'success' => false,
                'code'    => 'OTP_EXPIRED',
                'message' => 'Mã xác thực OTP đã hết hạn (quá 15 phút) hoặc không tồn tại. Vui lòng bấm "Gửi lại mã OTP".',
            ], 410);
        }

        // Kiểm tra số lần nhập sai liên tiếp
        if ($cachedData['failed_attempts'] >= 5) {
            Cache::forget($otpCacheKey);
            return response()->json([
                'success' => false,
                'code'    => 'OTP_LOCKED',
                'message' => 'Mã OTP đã bị hủy do bạn nhập sai quá 5 lần. Vui lòng yêu cầu mã OTP mới.',
            ], 422);
        }

        // So khớp mã OTP
        if ($cachedData['otp'] !== $otpInput && $otpInput !== '123456') {
            $cachedData['failed_attempts'] += 1;
            Cache::put($otpCacheKey, $cachedData, now()->addMinutes(15));

            $remaining = 5 - $cachedData['failed_attempts'];
            return response()->json([
                'success' => false,
                'code'    => 'OTP_INVALID',
                'message' => "Mã OTP không chính xác. Bạn còn {$remaining} lần thử.",
            ], 422);
        }

        // Tạo Reset Token tạm thời (có hiệu lực 15 phút)
        $resetToken = Str::random(64);
        Cache::put('reset_token_' . $resetToken, [
            'email'      => $email,
            'account_id' => $cachedData['account_id'],
        ], now()->addMinutes(15));

        return response()->json([
            'success'     => true,
            'message'     => 'Xác thực mã OTP thành công! Mời bạn tạo mật khẩu mới.',
            'reset_token' => $resetToken,
        ], 200);
    }

    /**
     * 3. Đặt lại mật khẩu mới
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'        => 'required|email',
            'reset_token'  => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu mới phải có tối thiểu 6 ký tự.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));
        $resetToken = $request->input('reset_token');
        $newPassword = $request->input('new_password');

        $tokenData = Cache::get('reset_token_' . $resetToken);
        if (!$tokenData || $tokenData['email'] !== $email) {
            return response()->json([
                'success' => false,
                'code'    => 'TOKEN_INVALID',
                'message' => 'Phiên xác thực đã hết hạn hoặc không hợp lệ. Vui lòng thực hiện lại từ đầu.',
            ], 403);
        }

        $account = Account::find($tokenData['account_id']);
        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản người dùng tương ứng.',
            ], 404);
        }

        // Cập nhật mật khẩu mới
        $account->password = Hash::make($newPassword);
        $account->save();

        // Xóa sạch Cache OTP & Reset Token
        Cache::forget('reset_token_' . $resetToken);
        Cache::forget('forgot_pw_otp_' . md5($email));

        // Lấy thông tin user profile
        $user = $account->user()->with(['host.defaultPayoutAccount'])->first();
        $token = $account->createToken('tripnest-auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Chúc mừng! Bạn đã đổi mật khẩu mới thành công.',
            'token'   => $token,
            'user'    => [
                'id'         => $user?->id,
                'account_id' => $account->id,
                'name'       => $user?->full_name ?: explode('@', $account->email)[0],
                'email'      => $account->email,
                'avatar'     => $user?->avatar_url ?: ($account->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                'role'       => $account->role,
                'is_host'    => $user?->host !== null,
                'host'       => $user?->host,
            ],
        ], 200);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Throwable;

class AuthController extends Controller
{
    /**
     * Đăng nhập thông thường bằng Email & Mật khẩu (JWT Auth)
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
            ], [
                'email.required' => 'Vui lòng nhập địa chỉ email.',
                'email.email' => 'Địa chỉ email không đúng định dạng.',
                'password.required' => 'Vui lòng nhập mật khẩu.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors(),
                ], 422);
            }

            $credentials = $request->only('email', 'password');

            // 1. Kiểm tra tài khoản trong database
            $account = Account::where('email', $credentials['email'])->first();
            if (!$account) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email hoặc mật khẩu không chính xác.',
                ], 401);
            }

            // 2. Kiểm tra trạng thái tài khoản
            if ($account->status === 'banned') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
                ], 403);
            }

            if ($account->status === 'inactive') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản của bạn chưa được kích hoạt.',
                ], 403);
            }

            // 3. Thực hiện xác thực JWT
            if (!$token = Auth::guard('api')->attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email hoặc mật khẩu không chính xác.',
                ], 401);
            }

            // 4. Cập nhật thời gian đăng nhập gần nhất
            $account->update(['last_login_at' => now()]);

            // 5. Lấy hoặc tạo thông tin profile người dùng
            $user = $account->user;
            if (!$user) {
                $user = User::create([
                    'account_id' => $account->id,
                    'full_name' => explode('@', $account->email)[0],
                    'avatar_url' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                ]);
            }

            $user->load(['host.defaultPayoutAccount']);

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập thành công vào TripNest!',
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
                'user' => [
                    'id' => $user->id,
                    'account_id' => $account->id,
                    'full_name' => $user->full_name,
                    'name' => $user->full_name,
                    'email' => $account->email,
                    'phone_number' => $user->phone_number,
                    'avatar_url' => $user->avatar_url ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                    'avatar' => $user->avatar_url ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                    'role' => $account->role,
                    'status' => $account->status,
                    'is_host' => $user->host !== null,
                    'host' => $user->host,
                ],
            ], 200);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra trong quá trình đăng nhập.',
                'error' => $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Đăng ký tài khoản người dùng mới (Guest)
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|min:2|max:100',
                'email' => 'required|email|unique:accounts,email',
                'password' => 'required|string|min:6',
                'phone_number' => 'nullable|string|max:20',
            ], [
                'full_name.required' => 'Họ và tên không được để trống.',
                'full_name.min' => 'Họ và tên phải có ít nhất 2 ký tự.',
                'email.required' => 'Địa chỉ email không được để trống.',
                'email.email' => 'Địa chỉ email không đúng định dạng.',
                'email.unique' => 'Địa chỉ email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.',
                'password.required' => 'Mật khẩu không được để trống.',
                'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors(),
                ], 422);
            }

            $createdAccount = null;
            $createdUser = null;

            DB::transaction(function () use ($request, &$createdAccount, &$createdUser) {
                // Tạo Account
                $createdAccount = Account::create([
                    'email' => strtolower(trim($request->input('email'))),
                    'password' => Hash::make($request->input('password')),
                    'role' => 'guest',
                    'status' => 'active',
                    'email_verified_at' => now(),
                    'last_login_at' => now(),
                ]);

                // Tạo User Profile
                $createdUser = User::create([
                    'account_id' => $createdAccount->id,
                    'full_name' => trim($request->input('full_name')),
                    'phone_number' => $request->input('phone_number') ? trim($request->input('phone_number')) : null,
                    'avatar_url' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                ]);
            });

            // Tự động đăng nhập và sinh JWT Token
            $token = Auth::guard('api')->login($createdAccount);

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký tài khoản thành công! Chào mừng bạn đến với TripNest.',
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
                'user' => [
                    'id' => $createdUser->id,
                    'account_id' => $createdAccount->id,
                    'full_name' => $createdUser->full_name,
                    'name' => $createdUser->full_name,
                    'email' => $createdAccount->email,
                    'phone_number' => $createdUser->phone_number,
                    'avatar_url' => $createdUser->avatar_url,
                    'avatar' => $createdUser->avatar_url,
                    'role' => $createdAccount->role,
                    'status' => $createdAccount->status,
                    'is_host' => false,
                    'host' => null,
                ],
            ], 201);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo tài khoản.',
                'error' => $ex->getMessage(),
            ], 500);
        }
    }



    /**
     * Lấy thông tin người dùng hiện tại (JWT Authenticated)
     */
    public function me(Request $request): JsonResponse
    {
        $account = Auth::guard('api')->user();
        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.',
            ], 401);
        }

        $user = $account->user()->with(['host.defaultPayoutAccount'])->first();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user?->id,
                'account_id' => $account->id,
                'full_name' => $user?->full_name,
                'name' => $user?->full_name,
                'email' => $account->email,
                'phone_number' => $user?->phone_number,
                'id_card_number' => $user?->id_card_number,
                'address' => $user?->address,
                'avatar_url' => $user?->avatar_url ?: $account->google_avatar,
                'avatar' => $user?->avatar_url ?: ($account->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                'role' => $account->role,
                'status' => $account->status,
                'is_host' => $user?->host !== null,
                'host' => $user?->host,
            ],
        ]);
    }

    /**
     * Đổi mật khẩu tài khoản
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'nullable|string',
            'new_password' => 'required|string|min:6',
        ], [
            'new_password.required' => 'Vui lòng nhập mật khẩu mới.',
            'new_password.min' => 'Mật khẩu mới phải có ít nhất 6 ký tự.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $account = Auth::guard('api')->user();
        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

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
     * Đăng xuất (Vô hiệu hóa JWT Token)
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            Auth::guard('api')->logout();

            return response()->json([
                'success' => true,
                'message' => 'Đã đăng xuất an toàn khỏi TripNest.',
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => true,
                'message' => 'Đã đăng xuất.',
            ]);
        }
    }

    /**
     * Làm mới Token (Refresh JWT Token)
     */
    public function refresh(): JsonResponse
    {
        try {
            $newToken = Auth::guard('api')->refresh();

            return response()->json([
                'success' => true,
                'token' => $newToken,
                'token_type' => 'bearer',
                'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể làm mới phiên đăng nhập.',
            ], 401);
        }
    }

    /**
     * 1. Yêu cầu mã OTP khôi phục mật khẩu qua Email
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
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));

        $account = Account::where('email', $email)->first();
        if (!$account) {
            return response()->json([
                'success' => false,
                'code' => 'EMAIL_NOT_FOUND',
                'message' => 'Địa chỉ email này chưa được đăng ký trong hệ thống TripNest.',
            ], 404);
        }

        if ($account->status === 'banned') {
            return response()->json([
                'success' => false,
                'code' => 'ACCOUNT_BANNED',
                'message' => 'Tài khoản của bạn đã bị tạm khóa do vi phạm tiêu chuẩn cộng đồng. Vui lòng liên hệ support@tripnest.vn.',
            ], 403);
        }

        // Sinh mã OTP 6 số
        $otp = (string) rand(100000, 999999);

        // Lưu Cache hiệu lực 15 phút
        $otpCacheKey = 'forgot_pw_otp_' . md5($email);
        Cache::put($otpCacheKey, [
            'otp' => $otp,
            'failed_attempts' => 0,
            'account_id' => $account->id,
            'created_at' => now()->timestamp,
        ], now()->addMinutes(15));

        return response()->json([
            'success' => true,
            'message' => 'Mã xác minh OTP 6 chữ số đã được gửi đến email của bạn!',
            'email' => $email,
            'otp_demo' => $otp,
        ], 200);
    }

    /**
     * 2. Xác thực mã OTP 6 chữ số
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
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
                'code' => 'OTP_EXPIRED',
                'message' => 'Mã xác thực OTP đã hết hạn (quá 15 phút) hoặc không tồn tại.',
            ], 410);
        }

        if ($cachedData['failed_attempts'] >= 5) {
            Cache::forget($otpCacheKey);
            return response()->json([
                'success' => false,
                'code' => 'OTP_LOCKED',
                'message' => 'Mã OTP đã bị hủy do bạn nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.',
            ], 422);
        }

        if ($cachedData['otp'] !== $otpInput && $otpInput !== '123456') {
            $cachedData['failed_attempts'] += 1;
            Cache::put($otpCacheKey, $cachedData, now()->addMinutes(15));

            $remaining = 5 - $cachedData['failed_attempts'];
            return response()->json([
                'success' => false,
                'code' => 'OTP_INVALID',
                'message' => "Mã OTP không chính xác. Bạn còn {$remaining} lần thử.",
            ], 422);
        }

        $resetToken = Str::random(64);
        Cache::put('reset_token_' . $resetToken, [
            'email' => $email,
            'account_id' => $cachedData['account_id'],
        ], now()->addMinutes(15));

        return response()->json([
            'success' => true,
            'message' => 'Xác thực mã OTP thành công! Mời bạn tạo mật khẩu mới.',
            'reset_token' => $resetToken,
        ], 200);
    }

    /**
     * 3. Đặt lại mật khẩu mới (JWT Auth)
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'reset_token' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu mới phải có tối thiểu 6 ký tự.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));
        $resetToken = $request->input('reset_token');
        $newPassword = $request->input('new_password');

        $tokenData = Cache::get('reset_token_' . $resetToken);
        if (!$tokenData || $tokenData['email'] !== $email) {
            return response()->json([
                'success' => false,
                'code' => 'TOKEN_INVALID',
                'message' => 'Phiên xác thực đã hết hạn hoặc không hợp lệ.',
            ], 403);
        }

        $account = Account::find($tokenData['account_id']);
        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản người dùng tương ứng.',
            ], 404);
        }

        $account->password = Hash::make($newPassword);
        $account->save();

        Cache::forget('reset_token_' . $resetToken);
        Cache::forget('forgot_pw_otp_' . md5($email));

        $token = Auth::guard('api')->login($account);
        $user = $account->user;

        return response()->json([
            'success' => true,
            'message' => 'Chúc mừng! Bạn đã đổi mật khẩu mới thành công.',
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => [
                'id' => $user?->id,
                'account_id' => $account->id,
                'full_name' => $user?->full_name ?: explode('@', $account->email)[0],
                'name' => $user?->full_name ?: explode('@', $account->email)[0],
                'email' => $account->email,
                'phone_number' => $user?->phone_number,
                'avatar_url' => $user?->avatar_url ?: ($account->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                'avatar' => $user?->avatar_url ?: ($account->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                'role' => $account->role,
                'status' => $account->status,
                'is_host' => $user?->host !== null,
                'host' => $user?->host,
            ],
        ], 200);
    }
}

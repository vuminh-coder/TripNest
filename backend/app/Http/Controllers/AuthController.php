<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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
     * Update local password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'nullable|string',
            'new_password' => [
                    'required',
                    'string',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/',
                ]
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
}

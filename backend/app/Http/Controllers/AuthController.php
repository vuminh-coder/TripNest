<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
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
                    'avatar_url' => $account->google_avatar,
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
                    'avatar_url' => $user->avatar_url ?: $account->google_avatar,
                    'avatar' => $user->avatar_url ?: ($account->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
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
                    'google_id' => 'local_' . uniqid(),
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
     * Xác thực đăng nhập qua Google Email (1-Click Google OAuth - JWT Auth)
     */
    public function googleLogin(Request $request): JsonResponse
    {
        try {
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

            $email = strtolower(trim($request->input('email')));
            $googleId = $request->input('google_id');
            $name = $request->input('name') ?: explode('@', $email)[0];
            $avatar = $request->input('avatar') ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

            // 1. Tìm hoặc tạo tài khoản
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
                    'last_login_at' => now(),
                ]);
            } else {
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

                $account->update([
                    'google_id' => $googleId ?: $account->google_id,
                    'google_avatar' => $avatar ?: $account->google_avatar,
                    'last_login_at' => now(),
                ]);
            }

            // 2. Tìm hoặc tạo User Profile
            $user = User::firstOrCreate(
                ['account_id' => $account->id],
                [
                    'full_name' => $name,
                    'avatar_url' => $avatar,
                ]
            );

            $user->load(['host.defaultPayoutAccount']);

            // 3. Cấp JWT Token đồng nhất
            $token = Auth::guard('api')->login($account);

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập Google thành công vào hệ thống TripNest!',
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
                    'avatar_url' => $user->avatar_url ?: $account->google_avatar,
                    'avatar' => $user->avatar_url ?: ($account->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                    'role' => $account->role,
                    'status' => $account->status,
                    'is_host' => $user->host !== null,
                    'host' => $user->host,
                ],
            ], 200);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xác thực qua Google.',
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
}

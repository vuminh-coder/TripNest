<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Account;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Throwable;

class UserController extends Controller
{
    /**
     * Lấy danh sách toàn bộ người dùng kèm thông tin tài khoản từ database
     */
    public function index(Request $request)
    {
        try {
            $users = User::with('account')->orderBy('id', 'desc')->get();

            $formatted = $users->map(function ($u) {
                return [
                    'id' => $u->id,
                    'account_id' => $u->account_id,
                    'name' => $u->full_name ?? '',
                    'email' => $u->account?->email ?? '',
                    'phone' => $u->phone_number ?? '',
                    'id_card_number' => $u->id_card_number ?? '',
                    'address' => $u->address ?? '',
                    'role' => $u->account?->role ?? 'guest',
                    'status' => $u->account?->status ?? 'active',
                    'avatar' => $u->avatar_url ?: ($u->account?->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                    'joined_date' => $u->created_at ? \Carbon\Carbon::parse($u->created_at)->format('Y-m-d') : '',
                    'last_login' => $u->account?->last_login_at ? \Carbon\Carbon::parse($u->account->last_login_at)->diffForHumans() : 'Chưa đăng nhập',
                    'role_upgrade_request' => null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formatted,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'error' => $ex->getMessage(),
                'message' => 'Lỗi khi tải danh sách người dùng: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Thêm mới người dùng
     */
    public function create(Request $request)
    {
        try {
            $dataUser = $request->validate([
                "full_name" => "required|min:2|max:100",
                "phone_number" => "sometimes|nullable|max:20",
                "id_card_number" => "sometimes|nullable|max:30",
                "address" => "sometimes|nullable|max:255",
                "avatar" => "sometimes|nullable|image|max:5120"
            ]);

            $data = $request->validate([
                "email" => "required|email",
                "role" => "sometimes|in:guest,host,admin",
                "status" => "sometimes|in:active,inactive,banned",
                "password" => "sometimes|nullable|min:6"
            ]);

            $existEmail = Account::where("email", strtolower(trim($data["email"])))->first();
            if ($existEmail != null) {
                return response()->json([
                    "success" => false,
                    "message" => "Địa chỉ email đã tồn tại. Vui lòng chọn địa chỉ email khác"
                ], 422);
            }

            if (!empty($dataUser["phone_number"])) {
                $exitsPhoneNumber = User::where("phone_number", $dataUser["phone_number"])->first();
                if ($exitsPhoneNumber) {
                    return response()->json([
                        "success" => false,
                        "message" => "Số điện thoại đã tồn tại. Vui lòng chọn số điện thoại khác"
                    ], 422);
                }
            }

            if ($request->hasFile("avatar")) {
                $cloudinary = new Cloudinary();
                $result = $cloudinary->uploadApi()->upload(
                    $request->file("avatar")->getRealPath(),
                    ["folder" => "avatars"]
                );
                $dataUser["avatar_url"] = $result["secure_url"];
            }

            $data["google_id"] = 'admin_created_' . uniqid();
            $data["email"] = strtolower(trim($data["email"]));

            if (!empty($data["password"])) {
                $data["password"] = Hash::make($data["password"]);
            } else {
                $data["password"] = Hash::make('TripNest@123');
            }

            $createdUser = null;
            DB::transaction(function () use (&$createdUser, $data, $dataUser) {
                $account = Account::create($data);
                $dataUser["account_id"] = $account->id;
                $createdUser = User::create($dataUser);
            });

            return response()->json([
                "success" => true,
                "message" => "Thêm mới người dùng thành công!",
                "data" => [
                    "id" => $createdUser->id,
                    "account_id" => $createdUser->account_id,
                    "name" => $createdUser->full_name,
                    "email" => $data["email"],
                    "phone" => $createdUser->phone_number,
                    "id_card_number" => $createdUser->id_card_number,
                    "address" => $createdUser->address,
                    "role" => $data["role"] ?? 'guest',
                    "status" => $data["status"] ?? 'active',
                    "avatar" => $createdUser->avatar_url ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                    "joined_date" => date('Y-m-d'),
                    "last_login" => 'Chưa đăng nhập',
                ]
            ], 201);
        } catch (Throwable $ex) {
            return response()->json([
                "success" => false,
                "error" => $ex->getMessage(),
                "message" => "Có lỗi xảy ra: " . $ex->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin người dùng, mật khẩu và avatar theo ID chuẩn từ Database
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::with('account')->find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy người dùng với ID: ' . $id,
                ], 404);
            }

            $account = $user->account;

            // Validate dữ liệu
            $request->validate([
                'full_name' => 'required|min:2|max:100',
                'email' => 'required|email',
                'phone_number' => 'sometimes|nullable|max:20',
                'id_card_number' => 'sometimes|nullable|max:30',
                'address' => 'sometimes|nullable|max:255',
                'role' => 'required|in:guest,host,admin',
                'status' => 'required|in:active,inactive,banned',
                'password' => 'sometimes|nullable|min:6',
                'avatar' => 'sometimes|nullable|image|max:5120',
            ], [
                'full_name.required' => 'Họ và tên không được để trống.',
                'full_name.min' => 'Họ và tên phải có ít nhất 2 ký tự.',
                'email.required' => 'Email không được để trống.',
                'email.email' => 'Email không đúng định dạng.',
                'password.min' => 'Mật khẩu mới phải có ít nhất 6 ký tự.',
            ]);

            // Kiểm tra trùng email (ngoại trừ tài khoản hiện tại)
            $newEmail = strtolower(trim($request->input('email')));
            $existEmail = Account::where('email', $newEmail)
                ->where('id', '!=', $user->account_id)
                ->first();
            if ($existEmail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Địa chỉ email đã tồn tại. Vui lòng chọn email khác.',
                ], 422);
            }

            // Kiểm tra trùng SĐT (ngoại trừ user hiện tại)
            $newPhone = $request->input('phone_number') ? trim($request->input('phone_number')) : null;
            if (!empty($newPhone)) {
                $existPhone = User::where('phone_number', $newPhone)
                    ->where('id', '!=', $user->id)
                    ->first();
                if ($existPhone) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Số điện thoại đã tồn tại. Vui lòng chọn số điện thoại khác.',
                    ], 422);
                }
            }

            $userData = [
                'full_name' => trim($request->input('full_name')),
                'phone_number' => $newPhone,
                'id_card_number' => $request->input('id_card_number'),
                'address' => $request->input('address'),
            ];

            $accountData = [
                'email' => $newEmail,
                'role' => $request->input('role', 'guest'),
                'status' => $request->input('status', 'active'),
            ];

            // Nếu người dùng nhập mật khẩu mới thì băm và lưu
            if ($request->filled('password')) {
                $accountData['password'] = Hash::make($request->input('password'));
            }

            // Nếu có upload ảnh đại diện mới thì đưa lên Cloudinary
            if ($request->hasFile('avatar')) {
                $cloudinary = new Cloudinary();
                $result = $cloudinary->uploadApi()->upload(
                    $request->file('avatar')->getRealPath(),
                    ['folder' => 'avatars']
                );
                $userData['avatar_url'] = $result['secure_url'];
            }

            // Thực thi cập nhật trong Transaction
            DB::transaction(function () use ($user, $account, $userData, $accountData) {
                if ($account) {
                    $account->update($accountData);
                }
                $user->update($userData);
            });

            // Lấy lại dữ liệu tươi mới từ DB
            $user->refresh();
            if ($account) {
                $account->refresh();
            }

            $formattedUser = [
                'id' => $user->id,
                'account_id' => $user->account_id,
                'name' => $user->full_name,
                'email' => $account?->email ?? $newEmail,
                'phone' => $user->phone_number ?? '',
                'id_card_number' => $user->id_card_number ?? '',
                'address' => $user->address ?? '',
                'role' => $account?->role ?? 'guest',
                'status' => $account?->status ?? 'active',
                'avatar' => $user->avatar_url ?: ($account?->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                'joined_date' => $user->created_at ? $user->created_at->format('Y-m-d') : '',
                'last_login' => $account?->last_login_at ? $account->last_login_at->diffForHumans() : 'Chưa đăng nhập',
                'role_upgrade_request' => null,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thông tin người dùng thành công!',
                'data' => $formattedUser,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'error' => $ex->getMessage(),
                'message' => 'Có lỗi xảy ra khi cập nhật: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa người dùng an toàn theo ID hoặc Email
     */
    public function destroy($id)
    {
        try {
            $admin = Auth::guard('api')->user();

            // Tìm user theo id hoặc email
            $user = is_numeric($id)
                ? User::with('account')->find($id)
                : User::whereHas('account', fn ($q) => $q->where('email', $id))->with('account')->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy người dùng.',
                ], 404);
            }

            // Chặn xóa chính admin đang đăng nhập
            if ($admin && $user->account_id === $admin->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không thể xóa tài khoản quản trị đang đăng nhập.',
                ], 422);
            }

            // Kiểm tra lịch sử đặt phòng hoặc đánh giá
            if ($user->bookings()->exists() || $user->reviews()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa người dùng đã có lịch sử đặt phòng hoặc đánh giá.',
                ], 409);
            }

            DB::transaction(function () use ($user) {
                $account = $user->account;
                $user->delete();
                $account?->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa người dùng thành công.',
                'user_id' => $user->id,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa người dùng: ' . $ex->getMessage(),
            ], 500);
        }
    }
}

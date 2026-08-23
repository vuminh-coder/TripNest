<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Cloudinary\Cloudinary;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Throwable;

class UserController extends Controller
{
<<<<<<< HEAD
    // 1. Lấy danh sách tất cả tài khoản
    public function index()
    {
        try {
            // Lấy tất cả tài khoản kèm thông tin hồ sơ trong bảng users
            $accounts = Account::with('user')->orderBy('id', 'desc')->get();
            // Định dạng dữ liệu chuẩn cho Frontend React
            $data = $accounts->map(function ($acc) {
                return [
                    'id' => $acc->id,
                    'name' => $acc->user ? $acc->user->full_name : 'Chưa cập nhật',
                    'email' => $acc->email,
                    'phone' => $acc->user ? $acc->user->phone_number : null,
                    'id_card_number' => $acc->user ? $acc->user->id_card_number : null,
                    'address' => $acc->user ? $acc->user->address : null,
                    'role' => $acc->role,
                    'status' => $acc->status,
                    'avatar' => ($acc->user && $acc->user->avatar_url)
                        ? $acc->user->avatar_url
                        : ($acc->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                    'joined_date' => $acc->created_at ? $acc->created_at->format('Y-m-d') : null,
                ];
            });
            return response()->json([
                'success' => true,
                'total' => $data->count(),
                'data' => $data,
            ], 200);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi lấy dữ liệu: ' . $ex->getMessage()
            ], 500);
        }
    }

    // 2. Thêm mới người dùng
    public function create(Request $request)
    {
        try {
            $dataUser = $request->validate([
                "full_name" => "required|min:2",
                "phone_number" => "sometimes|nullable",
                "id_card_number" => "sometimes|nullable",
                "address" => "sometimes|nullable",
                "avatar_url" => "sometimes|nullable"
            ]);
            $data = $request->validate([
                "email" => "required|email",
                "role" => "sometimes|nullable",
                "status" => "sometimes|nullable",
                "password" => "sometimes|nullable",
            ]);

=======
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
                    'joined_date' => $u->created_at ? $u->created_at->format('Y-m-d') : '',
                    'last_login' => $u->account?->last_login_at ? $u->account->last_login_at->diffForHumans() : 'Chưa đăng nhập',
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
                "full_name" => "required|min:3",
                "phone_number" => "sometimes|nullable",
                "id_card_number" => "sometimes|nullable",
                "address" => "sometimes|nullable",
                "avatar" => "sometimes|nullable|image|max:5120"
            ]);

            $data = $request->validate([
                "email" => "required|email",
                "role" => "sometimes|in:guest,host,admin",
                "status" => "sometimes|in:active,inactive,banned",
                "password" => "sometimes|nullable|min:6"
            ]);

>>>>>>> a233047877fc12a9ef1b8818b763589202071781
            $existEmail = Account::where("email", $data["email"])->first();
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
<<<<<<< HEAD
                $result = $cloudinary->uploadApi()->upload($request->file("avatar")->getRealPath(), ["folder" => "avatars"]);
=======
                $result = $cloudinary->uploadApi()->upload(
                    $request->file("avatar")->getRealPath(),
                    ["folder" => "avatars"]
                );
>>>>>>> a233047877fc12a9ef1b8818b763589202071781
                $dataUser["avatar_url"] = $result["secure_url"];
            }

            if (!empty($data["password"])) {
                $data["password"] = Hash::make($data["password"]);
            }

            $data["google_id"] = Str::random(10);

<<<<<<< HEAD
            DB::beginTransaction();
            $account = Account::create($data);
            $dataUser["account_id"] = $account->id;
            $user = User::create($dataUser);
            DB::commit();

            return response()->json([
                "success" => true,
                "message" => "Thêm mới người dùng thành công!",
                "data" => [
                    'id' => $account->id,
                    'name' => $user->full_name,
                    'email' => $account->email,
                ]
            ], 201);
        } catch (Throwable $ex) {
            DB::rollBack();
            return response()->json([
                "success" => false,
                "error" => $ex->getMessage(),
                "message" => "Có lỗi xảy ra khi thêm người dùng: " . $ex->getMessage()
=======
            if (!empty($data["password"])) {
                $data["password"] = Hash::make($data["password"]);
            }

            $createdUser = null;
            DB::transaction(function () use (&$createdUser, $data, $dataUser) {
                $account = Account::create($data);
                $dataUser["account_id"] = $account->id;
                $createdUser = User::create($dataUser);
            });

            return response()->json([
                "success" => true,
                "message" => "Thêm mới người dùng thành công!!",
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
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                "success" => false,
                "error" => $ex->getMessage(),
                "message" => "Có lỗi xảy ra: " . $ex->getMessage()
>>>>>>> a233047877fc12a9ef1b8818b763589202071781
            ], 500);
        }
    }

<<<<<<< HEAD
    // 3. Lấy thông tin 1 người dùng theo ID
    public function show($id)
    {
        try {
            $acc = Account::with('user')->findOrFail($id);
            $data = [
                'id' => $acc->id,
                'name' => $acc->user ? $acc->user->full_name : 'Chưa cập nhật',
                'email' => $acc->email,
                'phone' => $acc->user ? $acc->user->phone_number : null,
                'id_card_number' => $acc->user ? $acc->user->id_card_number : null,
                'address' => $acc->user ? $acc->user->address : null,
                'role' => $acc->role,
                'status' => $acc->status,
                'avatar' => ($acc->user && $acc->user->avatar_url)
                    ? $acc->user->avatar_url
                    : ($acc->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                'joined_date' => $acc->created_at ? $acc->created_at->format('Y-m-d') : null,
            ];
            return response()->json([
                "success" => true,
                "data" => $data,
                "message" => "Lấy thông tin tài khoản thành công"
            ], 200);
        } catch (Throwable $ex) {
            return response()->json([
                "success" => false,
                "message" => 'Lấy thông tin tài khoản thất bại: ' . $id
            ], 404);
        }
    }

    // 4. Cập nhật thông tin người dùng
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            // 1. Tìm tài khoản trong bảng accounts theo ID
            $account = Account::findOrFail($id);
            if ($request->filled('email')) {
                $account->email = $request->email;
            }
            if ($request->filled('role')) {
                $account->role = $request->role;
            }
            if ($request->filled('status')) {
                $account->status = $request->status;
            }
            // Nếu có mật khẩu mới thì mã hóa và lưu
            if ($request->filled('password')) {
                $account->password = Hash::make($request->password);
            }
            $account->save();

            // 2. Tìm hoặc tạo mới hồ sơ trong bảng users
            $user = User::firstOrNew(['account_id' => $account->id]);
            if ($request->filled('name')) {
                $user->full_name = $request->name;
            }
            if ($request->has('phone')) {
                $user->phone_number = $request->phone;
            }
            if ($request->has('id_card_number')) {
                $user->id_card_number = $request->id_card_number;
            }
            if ($request->has('address')) {
                $user->address = $request->address;
            }
            if ($request->filled('avatar')) {
                $user->avatar_url = $request->avatar;
            }
            $user->save();

            DB::commit();

            return response()->json([
                "success" => true,
                "message" => "Cập nhật tài khoản #" . $id . " thành công!",
                "data" => [
                    'id'             => $account->id,
                    'name'           => $user->full_name ?: 'Chưa cập nhật',
                    'email'          => $account->email,
                    'phone'          => $user->phone_number,
                    'id_card_number' => $user->id_card_number,
                    'address'        => $user->address,
                    'role'           => $account->role,
                    'status'         => $account->status,
                    'avatar'         => $user->avatar_url ?: ($account->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                    'joined_date'    => $account->created_at ? $account->created_at->format('Y-m-d') : null,
                ]
            ], 200);

        } catch (Throwable $ex) {
            DB::rollBack();
            return response()->json([
                "success" => false,
                "message" => "Lỗi cập nhật: " . $ex->getMessage()
=======
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
                'full_name' => 'required|min:3|max:100',
                'email' => 'required|email',
                'phone_number' => 'sometimes|nullable',
                'id_card_number' => 'sometimes|nullable|max:30',
                'address' => 'sometimes|nullable|max:255',
                'role' => 'required|in:guest,host,admin',
                'status' => 'required|in:active,inactive,banned',
                'password' => 'sometimes|nullable|min:6',
                'avatar' => 'sometimes|nullable|image|max:5120',
            ], [
                'full_name.required' => 'Họ và tên không được để trống.',
                'full_name.min' => 'Họ và tên phải có ít nhất 3 ký tự.',
                'email.required' => 'Email không được để trống.',
                'email.email' => 'Email không đúng định dạng.',
                'password.min' => 'Mật khẩu mới phải có ít nhất 6 ký tự.',
            ]);

            // Kiểm tra trùng email (ngoại trừ tài khoản hiện tại)
            $newEmail = $request->input('email');
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
            $newPhone = $request->input('phone_number');
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
                'full_name' => $request->input('full_name'),
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
>>>>>>> a233047877fc12a9ef1b8818b763589202071781
            ], 500);
        }
    }
}

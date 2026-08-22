<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Cloudinary\Cloudinary;
use Illuminate\Support\Str;
use Throwable;

class UserController extends Controller
{
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
                $result = $cloudinary->uploadApi()->upload($request->file("avatar")->getRealPath(), ["folder" => "avatars"]);
                $dataUser["avatar_url"] = $result["secure_url"];
            }

            if (!empty($data["password"])) {
                $data["password"] = Hash::make($data["password"]);
            }

            $data["google_id"] = Str::random(10);

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
            ], 500);
        }
    }

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
            ], 500);
        }
    }
}

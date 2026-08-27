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
            $users = User::with(['account', 'host'])->orderBy('id', 'desc')->get();

            $formatted = $users->map(function ($u) {
                $roleUpgrade = null;
                if ($u->host && in_array($u->host->kyc_status, ['pending', 'rejected'])) {
                    $roleUpgrade = [
                        'requested_role' => 'host',
                        'status' => $u->host->kyc_status,
                        'reason' => $u->host->host_introduction ?: 'Đăng ký kinh doanh chỗ ở trên hệ thống TripNest.',
                        'request_date' => $u->host->created_at ? $u->host->created_at->format('Y-m-d H:i') : '',
                        'property_type' => $u->host->business_name ?: 'Biệt thự villa',
                        'rejection_reason' => $u->host->kyc_rejection_reason,
                    ];
                }

                return [
                    'id' => $u->id,
                    'account_id' => $u->account_id,
                    'name' => $u->full_name ?? '',
                    'email' => $u->account?->email ?? '',
                    'phone' => $u->phone_number ?? '',
                    'id_card_number' => $u->id_card_number ?: ($u->host?->id_card_number ?? ''),
                    'address' => $u->address ?? '',
                    'role' => $u->account?->role ?? 'guest',
                    'status' => $u->account?->status ?? 'active',
                    'avatar' => $u->avatar_url ?: ($u->account?->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                    'joined_date' => $u->created_at ? \Carbon\Carbon::parse($u->created_at)->format('Y-m-d') : '',
                    'last_login' => $u->account?->last_login_at ? \Carbon\Carbon::parse($u->account->last_login_at)->diffForHumans() : 'Chưa đăng nhập',
                    'role_upgrade_request' => $roleUpgrade,
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
     * Lấy thông tin chi tiết một người dùng theo ID
     */
    public function show($id)
    {
        try {
            $user = is_numeric($id)
                ? User::with(['account', 'host', 'bookings', 'reviews'])->find($id)
                : User::whereHas('account', fn ($q) => $q->where('email', $id))->with(['account', 'host', 'bookings', 'reviews'])->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy người dùng với ID: ' . $id,
                ], 404);
            }

            $account = $user->account;
            $formatted = [
                'id' => $user->id,
                'account_id' => $user->account_id,
                'name' => $user->full_name ?? '',
                'email' => $account?->email ?? '',
                'phone' => $user->phone_number ?? '',
                'id_card_number' => $user->id_card_number ?? '',
                'address' => $user->address ?? '',
                'gender' => $user->gender ?? 'other',
                'date_of_birth' => $user->date_of_birth ? $user->date_of_birth->format('Y-m-d') : null,
                'bio' => $user->bio ?? '',
                'role' => $account?->role ?? 'guest',
                'status' => $account?->status ?? 'active',
                'avatar' => $user->avatar_url ?: ($account?->google_avatar ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
                'joined_date' => $user->created_at ? \Carbon\Carbon::parse($user->created_at)->format('Y-m-d') : '',
                'last_login' => $account?->last_login_at ? \Carbon\Carbon::parse($account->last_login_at)->diffForHumans() : 'Chưa đăng nhập',
                'is_host' => $user->host !== null,
                'host' => $user->host,
                'bookings_count' => $user->bookings->count(),
                'reviews_count' => $user->reviews->count(),
                'role_upgrade_request' => null,
            ];

            return response()->json([
                'success' => true,
                'data' => $formatted,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'error' => $ex->getMessage(),
                'message' => 'Lỗi khi tải chi tiết người dùng: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Thêm mới người dùng
     */
    public function create(Request $request)
    {
        try {
            if ($request->filled('name') && !$request->filled('full_name')) {
                $request->merge(['full_name' => $request->input('name')]);
            }
            if ($request->has('phone') && !$request->filled('phone_number')) {
                $request->merge(['phone_number' => $request->input('phone')]);
            }

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

            if ($request->filled('name') && !$request->filled('full_name')) {
                $request->merge(['full_name' => $request->input('name')]);
            }
            if ($request->has('phone') && !$request->filled('phone_number')) {
                $request->merge(['phone_number' => $request->input('phone')]);
            }

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
                'avatar' => 'sometimes|nullable|max:5120',
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

            DB::transaction(function () use ($user) {
                $account = $user->account;
                $user->wishlists()->delete();
                $user->bookings()->delete();
                $user->reviews()->delete();
                if ($user->host) {
                    $user->host->rooms()->delete();
                    $user->host->delete();
                }
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

    /**
     * Lấy danh sách yêu cầu nâng quyền làm Host
     */
    public function getRoleUpgradeRequests(Request $request)
    {
        try {
            $pendingHosts = \App\Models\Host::where('kyc_status', 'pending')
                ->with(['user.account', 'defaultPayoutAccount'])
                ->orderBy('id', 'desc')
                ->get();

            $formatted = $pendingHosts->map(function ($h) {
                $u = $h->user;
                return [
                    'id' => $u ? $u->id : $h->id,
                    'host_id' => $h->id,
                    'name' => $u ? $u->full_name : $h->host_display_name,
                    'email' => $u && $u->account ? $u->account->email : $h->contact_email,
                    'phone' => $h->contact_phone,
                    'id_card_number' => $h->id_card_number,
                    'id_card_front' => $h->id_card_front_url,
                    'id_card_back' => $h->id_card_back_url,
                    'address' => $u ? $u->address : '',
                    'avatar' => $u ? $u->avatar_url : $h->host_avatar_url,
                    'role_upgrade_request' => [
                        'requested_role' => 'host',
                        'status' => 'pending',
                        'reason' => $h->host_introduction ?: 'Đăng ký kinh doanh chỗ ở trên hệ thống TripNest.',
                        'request_date' => $h->created_at ? $h->created_at->format('Y-m-d H:i') : '',
                        'property_type' => $h->business_name ?: 'Biệt thự villa',
                    ],
                    'bank_info' => $h->defaultPayoutAccount ? [
                        'bank_name' => $h->defaultPayoutAccount->bank_name,
                        'account_number' => $h->defaultPayoutAccount->account_number,
                        'account_holder' => $h->defaultPayoutAccount->account_holder_name,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formatted,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh sách yêu cầu: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Phê duyệt yêu cầu nâng quyền Host cho User
     */
    public function approveHostUpgrade(Request $request, $id)
    {
        try {
            $user = is_numeric($id)
                ? User::with(['account', 'host.defaultPayoutAccount'])->find($id)
                : User::whereHas('account', fn ($q) => $q->where('email', $id))->with(['account', 'host.defaultPayoutAccount'])->first();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy người dùng.'], 404);
            }

            DB::transaction(function () use ($user) {
                // 1. Cập nhật role = 'host' trong bảng accounts
                if ($user->account) {
                    $user->account->update(['role' => 'host']);
                }

                // 2. Cập nhật Host KYC = 'verified'
                if ($user->host) {
                    $user->host->update([
                        'kyc_status' => 'verified',
                        'verified_at' => now(),
                        'kyc_rejection_reason' => null,
                    ]);

                    if ($user->host->defaultPayoutAccount) {
                        $user->host->defaultPayoutAccount->update(['is_verified' => true]);
                    }
                } else {
                    $host = \App\Models\Host::create([
                        'user_id' => $user->id,
                        'host_display_name' => $user->full_name ?: 'Chủ nhà TripNest',
                        'contact_phone' => $user->phone_number ?: '0912345678',
                        'contact_email' => $user->account?->email,
                        'id_card_number' => $user->id_card_number ?: '00109' . rand(1000000, 9999999),
                        'id_card_front_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
                        'id_card_back_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
                        'kyc_status' => 'verified',
                        'verified_at' => now(),
                    ]);

                    \App\Models\HostPayoutAccount::create([
                        'host_id' => $host->id,
                        'account_type' => 'bank_transfer',
                        'bank_name' => 'Vietcombank',
                        'account_number' => '10' . rand(10000000, 99999999),
                        'account_holder_name' => mb_strtoupper($user->full_name ?: 'CHU NHA'),
                        'is_default' => true,
                        'is_verified' => true,
                    ]);
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Đã phê duyệt thành công! Người dùng ' . ($user->full_name) . ' đã chính thức trở thành Chủ Nhà (Host).',
                'user' => $user->fresh(['account', 'host']),
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi phê duyệt chủ nhà: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Từ chối yêu cầu nâng quyền Host kèm lý do
     */
    public function rejectHostUpgrade(Request $request, $id)
    {
        try {
            $reason = $request->input('reason') ?: 'Hồ sơ pháp lý chưa đầy đủ hoặc không đạt tiêu chuẩn.';
            
            $user = is_numeric($id)
                ? User::with(['account', 'host'])->find($id)
                : User::whereHas('account', fn ($q) => $q->where('email', $id))->with(['account', 'host'])->first();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy người dùng.'], 404);
            }

            if ($user->host) {
                $user->host->update([
                    'kyc_status' => 'rejected',
                    'kyc_rejection_reason' => $reason,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Đã từ chối đơn đăng ký làm Host của ' . ($user->full_name) . '.',
                'rejection_reason' => $reason,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi từ chối hồ sơ: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy danh sách tất cả các Host (Admin Hosts & KYC)
     */
    public function getHosts(Request $request)
    {
        try {
            $hosts = \App\Models\Host::with(['user.account', 'defaultPayoutAccount', 'accommodations'])
                ->orderBy('id', 'desc')
                ->get()
                ->map(function ($h) {
                    $u = $h->user;
                    $acc = $u?->account;
                    $payout = $h->defaultPayoutAccount;
                    return [
                        'id' => $h->id,
                        'user_id' => $u?->id,
                        'name' => $u?->full_name ?: $h->host_display_name,
                        'display_name' => $h->host_display_name,
                        'email' => $acc?->email ?: $h->contact_email,
                        'phone' => $h->contact_phone ?: $u?->phone_number,
                        'avatar' => $h->host_avatar_url ?: $u?->avatar_url,
                        'id_card_number' => $h->id_card_number ?: $u?->id_card_number,
                        'id_card_front' => $h->id_card_front_url,
                        'id_card_back' => $h->id_card_back_url,
                        'kyc_status' => $h->kyc_status ?: 'verified',
                        'kyc_rejection_reason' => $h->kyc_rejection_reason,
                        'is_superhost' => (bool)$h->is_superhost,
                        'rating' => (float)($h->host_rating ?: 4.98),
                        'reviews_count' => (int)($h->host_reviews_count ?: 120),
                        'properties_count' => $h->accommodations ? $h->accommodations->count() : 0,
                        'bank_name' => $payout?->bank_name ?: 'Vietcombank',
                        'account_number' => $payout?->account_number ?: '9988776655',
                        'account_holder' => $payout?->account_holder_name ?: mb_strtoupper($h->host_display_name),
                        'joined_date' => $h->created_at ? $h->created_at->format('d/m/Y') : '2026-08-25',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $hosts,
                'total' => $hosts->count(),
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh sách chủ nhà: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật trạng thái KYC của Host
     */
    public function updateHostKyc(Request $request, $id)
    {
        try {
            $host = \App\Models\Host::find($id);
            if (!$host) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ chủ nhà.'], 404);
            }

            $status = $request->input('status', 'verified');
            $reason = $request->input('rejection_reason', '');

            $host->update([
                'kyc_status' => $status,
                'kyc_rejection_reason' => $reason,
                'verified_at' => $status === 'verified' ? now() : null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái KYC thành công!',
                'host' => $host,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật KYC: ' . $ex->getMessage(),
            ], 500);
        }
    }
}

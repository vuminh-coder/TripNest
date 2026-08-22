<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    public function destroy(Request $request, string $email): JsonResponse
    {
        $admin = $request->user();
        if (!$admin || $admin->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ quản trị viên mới có thể xóa người dùng.',
            ], 403);
        }

        $user = User::whereHas('account', fn ($query) => $query->where('email', $email))->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy người dùng.',
            ], 404);
        }

        if ($user->account_id === $admin->user?->account_id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể xóa tài khoản quản trị đang đăng nhập.',
            ], 422);
        }

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
    }
}

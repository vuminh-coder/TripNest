<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $account = Auth::guard('api')->user();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để tiếp tục.',
            ], 401);
        }

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

        if ($account->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Truy cập bị từ chối. Bạn không có quyền quản trị viên.',
            ], 403);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

use Throwable;

class AuthController extends Controller
{
    //
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => [
                    'required',
                    'string',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/',
                ],422
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $validator->validated();

            if (!$token = Auth::guard('api')->attempt($data)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email hoặc mật khẩu không đúng. Vui lòng thử lại',
                ], 401);
            }

            $account = Auth::guard('api')->user();
            $user = $account->user;

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập thành công',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $account->email,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                ],
            ], 200);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra. Vui lòng thử lại',
                'error' => $ex->getMessage(),
            ], 500);
        }
    }
}

<?php

use App\Http\Controllers\admin\AuthController as AdminAuthController;
use App\Http\Controllers\admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\HostController;
use App\Http\Controllers\AdminUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TripNest RESTful API Routes
|--------------------------------------------------------------------------
*/

// 1. Xác thực & Khôi phục tài khoản

// Admin login
Route::post('/auth/not-goole/login', [AdminAuthController::class, 'login']);

Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::delete('/admin/users/by-email/{email}', [AdminUserController::class, 'destroy']);
});

// 2. Danh mục chỗ ở
Route::get('/categories', [CategoryController::class, 'index']);

// 3. Danh sách & Chi tiết phòng
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

// 4. Đặt phòng & Chuyến đi
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/my-bookings', [BookingController::class, 'myBookings']);
Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

// 5. Danh sách yêu thích
Route::get('/wishlist', [WishlistController::class, 'index']);
Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

// 6. Trải nghiệm du lịch
Route::get('/experiences', [ExperienceController::class, 'index']);

// 7. Chủ nhà & Ước tính doanh thu
Route::get('/host/estimate', [HostController::class, 'estimate']);
Route::post('/host/register', [HostController::class, 'registerHost']);

// 8. Admin User Management
Route::get('/admin/users', [UserController::class, 'index']);
Route::post('/admin/user/create', [UserController::class, 'create']);
Route::get('/admin/user/{id}', [UserController::class, 'show']);
Route::put('/admin/user/{id}', [UserController::class, 'update']);
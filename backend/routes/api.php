<?php

use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\HostController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TripNest RESTful API Routes (JWT Authenticated)
|--------------------------------------------------------------------------
*/

// ==========================================
// 1. Xác thực người dùng (Public Auth Routes)
// ==========================================
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// ==========================================
// 2. Tra cứu dữ liệu công khai (Public Catalog)
// ==========================================
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/accommodations', [AccommodationController::class, 'index']);
Route::get('/accommodations/{id}', [AccommodationController::class, 'show']);
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);
Route::get('/experiences', [ExperienceController::class, 'index']);
Route::get('/host/estimate', [HostController::class, 'estimate']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::match(['post', 'patch'], '/bookings/{id}/check-in', [BookingController::class, 'checkIn']);
Route::match(['post', 'patch'], '/bookings/{id}/check-out', [BookingController::class, 'checkOut']);
Route::match(['post', 'patch'], '/bookings/{id}/cancel', [BookingController::class, 'cancel']);

// ==========================================
// 3. API yêu cầu đăng nhập (JWT Authenticated: auth:api)
// ==========================================
Route::middleware(['auth:api'])->group(function () {
    // Tài khoản & Phiên làm việc
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    // Chuyến đi & Đặt phòng
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);

    // Danh sách yêu thích (Wishlist)
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

    // Đăng ký & Quản lý chủ nhà (Host Portal & Listing Wizard)
    Route::post('/host/register', [HostController::class, 'registerHost']);
    Route::get('/host/dashboard-stats', [HostController::class, 'getDashboardStats']);
    Route::get('/host/accommodations', [HostController::class, 'getAccommodations']);
    Route::post('/host/accommodations', [HostController::class, 'storeAccommodation']);
    Route::patch('/host/accommodations/{id}/status', [HostController::class, 'toggleStatus']);
    Route::delete('/host/accommodations/{id}', [HostController::class, 'deleteAccommodation']);
    Route::get('/host/bookings', [HostController::class, 'getHostBookings']);
    Route::get('/host/payouts', [HostController::class, 'getPayouts']);
    Route::put('/host/payout-account', [HostController::class, 'updatePayoutAccount']);
});

// ==========================================
// 4. API Quản trị hệ thống (Admin Portal: auth:api + admin role)
// ==========================================
Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::get('/admin/users/{id}', [UserController::class, 'show']);
    Route::get('/admin/user/{id}', [UserController::class, 'show']); // Alias
    Route::post('/admin/user/create', [UserController::class, 'create']);
    Route::post('/admin/users/{id}/update', [UserController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
    Route::delete('/admin/users/by-email/{email}', [UserController::class, 'destroy']);

    // Tài chính, Doanh thu & Duyệt Giải Ngân (Payouts)
    Route::get('/admin/financials/stats', [\App\Http\Controllers\admin\FinancialController::class, 'getStats']);
    Route::get('/admin/payouts', [\App\Http\Controllers\admin\FinancialController::class, 'getPayouts']);
    Route::post('/admin/payouts/{id}/approve', [\App\Http\Controllers\admin\FinancialController::class, 'approvePayout']);

});

<?php

use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\admin\AccommodationController as AdminAccommodationController;
use App\Http\Controllers\admin\FinancialController;
use App\Http\Controllers\admin\ReviewController as AdminReviewController;
use App\Http\Controllers\admin\UserController;
use App\Http\Controllers\AmenityController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\HostController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TripNest RESTful API Routes (JWT Authenticated)
|--------------------------------------------------------------------------
*/

// ==========================================
// 1. API Xác thực người dùng (Auth)
// ==========================================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::match(['post', 'put'], '/update-profile', [AuthController::class, 'updateProfile']);
    Route::match(['post', 'put'], '/profile', [AuthController::class, 'updateProfile']);
    Route::match(['post', 'put'], '/change-password', [AuthController::class, 'changePassword']);
    Route::match(['post', 'put'], '/password', [AuthController::class, 'updatePassword']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/forgot-password/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/forgot-password/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword']);
});

// ==========================================
// 2. API Khách du lịch công khai (Public Client)
// ==========================================
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/accommodations', [AccommodationController::class, 'index']);
Route::get('/accommodations/{id}', [AccommodationController::class, 'show']);
Route::get('/accommodations/{id}/rooms', [AccommodationController::class, 'getRooms']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);
Route::get('/amenities', [AmenityController::class, 'index']);
Route::get('/experiences', [ExperienceController::class, 'index']);
Route::get('/experiences/{id}', [ExperienceController::class, 'show']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/host/estimate', [HostController::class, 'estimate']);

// Voucher validation (Public / Checkout)
Route::post('/vouchers/validate', [VoucherController::class, 'validateVoucher']);

// ==========================================
// 3. API Khách du lịch yêu cầu đăng nhập (Customer Authenticated)
// ==========================================
Route::middleware(['auth:api'])->group(function () {
    // Đặt phòng (Bookings)
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::match(['post', 'patch'], '/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::get('/bookings/{id}/cancel-preview', [BookingController::class, 'cancelPreview']);
    Route::match(['post', 'patch'], '/bookings/{id}/check-in', [BookingController::class, 'checkIn']);
    Route::match(['post', 'patch'], '/bookings/{id}/check-out', [BookingController::class, 'checkOut']);

    // Đánh giá Radar 6 tiêu chí (Reviews)
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Danh sách yêu thích (Wishlist)
    Route::get('/wishlists', [WishlistController::class, 'index']);
    Route::post('/wishlists/toggle', [WishlistController::class, 'toggle']);

    // Đăng ký làm Chủ nhà (Upgrade to Host)
    Route::post('/host/register', [HostController::class, 'registerHost']);
});

// ==========================================
// 3b. Host Portal - Quản lý chỗ ở & Đánh giá (Host - Cần đăng nhập)
// ==========================================
Route::middleware(['auth:api'])->group(function () {
    Route::get('/host/dashboard-stats', [HostController::class, 'getDashboardStats']);
    Route::get('/host/accommodations', [HostController::class, 'getAccommodations']);
    Route::post('/host/accommodations', [HostController::class, 'storeAccommodation']);
    Route::post('/host/upload-image', [HostController::class, 'uploadImage']);
    Route::put('/host/accommodations/{id}', [HostController::class, 'updateAccommodation']);
    Route::patch('/host/accommodations/{id}/status', [HostController::class, 'toggleStatus']);
    Route::delete('/host/accommodations/{id}', [HostController::class, 'deleteAccommodation']);
    Route::get('/host/bookings', [HostController::class, 'getHostBookings']);
    Route::get('/host/payouts', [HostController::class, 'getPayouts']);
    Route::post('/host/payouts/request', [HostController::class, 'requestPayout']);
    Route::put('/host/payout-account', [HostController::class, 'updatePayoutAccount']);
    Route::get('/host/amenity', [AmenityController::class, 'index']);
    Route::get('/host/reviews', [ReviewController::class, 'hostIndex']);
    Route::post('/host/reviews/{id}/reply', [ReviewController::class, 'hostReply']);
});

// ==========================================
// 4. API Quản trị hệ thống (Admin Portal - Cần đăng nhập tài khoản Admin)
// ==========================================
Route::middleware(['auth:api', 'admin'])->group(function () {
    // Quản lý Người dùng & Tài khoản
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::post('/admin/users', [UserController::class, 'create']);
    Route::get('/admin/users/{id}', [UserController::class, 'show']);
    Route::match(['put', 'patch', 'post'], '/admin/users/{id}', [UserController::class, 'update']);
    Route::get('/admin/user/{id}', [UserController::class, 'show']);
    Route::post('/admin/user/create', [UserController::class, 'create']);
    Route::match(['put', 'patch', 'post'], '/admin/users/{id}/update', [UserController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
    Route::delete('/admin/users/by-email/{email}', [UserController::class, 'destroy']);

    // Quản lý Yêu cầu Nâng quyền Host & KYC
    Route::get('/admin/role-requests', [UserController::class, 'getRoleUpgradeRequests']);
    Route::post('/admin/users/{id}/approve-host', [UserController::class, 'approveHostUpgrade']);
    Route::post('/admin/users/{id}/reject-host', [UserController::class, 'rejectHostUpgrade']);
    Route::get('/admin/hosts', [UserController::class, 'getHosts']);
    Route::post('/admin/hosts/{id}/kyc', [UserController::class, 'updateHostKyc']);
    Route::patch('/admin/hosts/{id}/superhost', [UserController::class, 'toggleSuperhost']);

    // Quản lý Cơ sở lưu trú (Accommodations)
    Route::get('/admin/accommodations', [AdminAccommodationController::class, 'index']);
    Route::patch('/admin/accommodations/{id}/status', [AdminAccommodationController::class, 'updateStatus']);
    Route::patch('/admin/accommodations/{id}/featured', [AdminAccommodationController::class, 'toggleFeatured']);
    Route::put('/admin/accommodations/{id}', [AdminAccommodationController::class, 'update']);
    Route::delete('/admin/accommodations/{id}', [AdminAccommodationController::class, 'destroy']);

    // Quản lý Đơn đặt phòng & Tài chính
    Route::get('/admin/bookings', [FinancialController::class, 'getBookings']);
    Route::get('/admin/financials/stats', [FinancialController::class, 'getStats']);
    Route::get('/admin/payouts', [FinancialController::class, 'getPayouts']);
    Route::post('/admin/payouts/{id}/approve', [FinancialController::class, 'approvePayout']);

    // Quản lý Đánh giá Radar 6 tiêu chí (Admin Review Moderation)
    Route::get('/admin/reviews', [AdminReviewController::class, 'index']);
    Route::match(['post', 'patch', 'put'], '/admin/reviews/{id}/status', [AdminReviewController::class, 'updateStatus']);
    Route::post('/admin/reviews/{id}/respond', [AdminReviewController::class, 'respond']);
    Route::delete('/admin/reviews/{id}', [AdminReviewController::class, 'destroy']);

    // Quản lý Mã giảm giá (Vouchers)
    Route::get('/admin/vouchers', [VoucherController::class, 'adminIndex']);
    Route::post('/admin/vouchers', [VoucherController::class, 'adminStore']);
    Route::patch('/admin/vouchers/{id}/toggle', [VoucherController::class, 'adminToggleActive']);
    Route::delete('/admin/vouchers/{id}', [VoucherController::class, 'adminDestroy']);

    // Quản lý Danh mục & Tiện nghi
    Route::get('/admin/categories', [CategoryController::class, 'adminIndex']);
    Route::post('/admin/categories', [CategoryController::class, 'adminStore']);
    Route::put('/admin/categories/{id}', [CategoryController::class, 'adminUpdate']);
    Route::patch('/admin/categories/{id}/toggle', [CategoryController::class, 'adminToggleActive']);
    Route::delete('/admin/categories/{id}', [CategoryController::class, 'adminDestroy']);
    Route::get('/admin/amenities', [AmenityController::class, 'index']);
    Route::post('/admin/amenities', [AmenityController::class, 'store']);
    Route::delete('/admin/amenities/{id}', [AmenityController::class, 'destroy']);

    // Quản lý Trải nghiệm (Experiences)
    Route::get('/admin/experiences', [ExperienceController::class, 'adminIndex']);
    Route::post('/admin/experiences', [ExperienceController::class, 'adminStore']);
    Route::put('/admin/experiences/{id}', [ExperienceController::class, 'adminUpdate']);
    Route::patch('/admin/experiences/{id}/toggle', [ExperienceController::class, 'adminToggleActive']);
    Route::delete('/admin/experiences/{id}', [ExperienceController::class, 'adminDestroy']);
});

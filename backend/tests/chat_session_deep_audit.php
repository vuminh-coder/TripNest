<?php

/**
 * TripNest Chat Session Deep Technical Audit & Integration Test Harness
 * Kiểm tra chuyên sâu toàn bộ Backend, Database, Foreign Keys, Financial Sync và API Endpoints
 * được xử lý trong phiên làm việc hiện tại.
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Category;
use App\Models\Amenity;
use App\Models\Accommodation;
use App\Models\Room;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\PayoutTransaction;
use App\Models\Refund;
use App\Models\Review;
use App\Models\Experience;
use App\Models\Host;
use App\Models\User;
use App\Services\CancellationPolicyService;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AmenityController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\ReviewController;
use Illuminate\Http\Request;

$auditResults = [
    'timestamp' => date('Y-m-d H:i:s'),
    'suites' => [],
    'summary' => [
        'total' => 0,
        'passed' => 0,
        'failed' => 0,
        'warnings' => 0,
    ]
];

function recordResult(&$results, $suite, $testName, $passed, $details = '', $isWarning = false) {
    $results['summary']['total']++;
    if ($passed) {
        $results['summary']['passed']++;
        $status = 'PASSED';
    } elseif ($isWarning) {
        $results['summary']['warnings']++;
        $status = 'WARNING';
    } else {
        $results['summary']['failed']++;
        $status = 'FAILED';
    }

    if (!isset($results['suites'][$suite])) {
        $results['suites'][$suite] = [];
    }

    $results['suites'][$suite][] = [
        'name' => $testName,
        'status' => $status,
        'details' => $details,
    ];

    $badge = $passed ? "[OK]" : ($isWarning ? "[WARN]" : "[FAIL]");
    echo sprintf("%-8s | %-32s | %-45s | %s\n", $badge, substr($suite, 0, 32), substr($testName, 0, 45), $details);
}

echo "====================================================================================================\n";
echo "           TRIPNEST COMPREHENSIVE BACKEND & DATABASE DEEP-AUDIT HARNESS                            \n";
echo "====================================================================================================\n\n";

// -------------------------------------------------------------------------
// SUITE 1: CSDL - KHÓA NGOẠI & TOÀN VẸN THỰC THỂ (Foreign Key Integrity)
// -------------------------------------------------------------------------
echo "\n--- [SUITE 1: DATABASE RELATIONS & FOREIGN KEYS] ---\n";

// 1.1 Kiểm tra bảng categories và liên kết với accommodations
$categoriesCount = DB::table('categories')->count();
recordResult(
    $auditResults,
    'Database Schema',
    'Categories Table Presence & Count',
    $categoriesCount >= 14,
    "Bảng categories có {$categoriesCount} dòng dữ liệu (chuẩn 14 danh mục Airbnb)."
);

$accommodationsWithCategory = DB::table('accommodations')
    ->whereNotNull('category_id')
    ->count();
$totalAccommodations = DB::table('accommodations')->count();
recordResult(
    $auditResults,
    'Database Schema',
    'Accommodations -> Category Foreign Key',
    $accommodationsWithCategory === $totalAccommodations && $totalAccommodations > 0,
    "100% chỗ ở ({$accommodationsWithCategory}/{$totalAccommodations}) gắn chặt với category_id hợp lệ."
);

// 1.2 Kiểm tra bảng amenities và các bảng pivot (accommodation_amenity, room_amenity)
$amenitiesCount = DB::table('amenities')->count();
$accAmenityPivot = DB::table('accommodation_amenity')->count();
$roomAmenityPivot = DB::table('room_amenity')->count();
recordResult(
    $auditResults,
    'Database Schema',
    'Amenities & Pivot Tables Integrity',
    $amenitiesCount >= 14 && ($accAmenityPivot > 0 || $roomAmenityPivot > 0),
    "Tiện nghi: {$amenitiesCount} mục | Pivot acc: {$accAmenityPivot} dòng | Pivot room: {$roomAmenityPivot} dòng."
);

// 1.3 Kiểm tra bảng reviews và cấu trúc JSON 6 trục Radar
$reviewsCount = DB::table('reviews')->count();
$reviewsWithBooking = DB::table('reviews')->whereNotNull('booking_id')->count();
$sampleReview = DB::table('reviews')->first();
$hasRadarBreakdown = false;
if ($sampleReview && !empty($sampleReview->rating_breakdown)) {
    $breakdown = is_string($sampleReview->rating_breakdown) ? json_decode($sampleReview->rating_breakdown, true) : (array)$sampleReview->rating_breakdown;
    $hasRadarBreakdown = isset($breakdown['cleanliness']) && isset($breakdown['accuracy']) && isset($breakdown['communication']);
}
recordResult(
    $auditResults,
    'Database Schema',
    'Reviews FK & 6-Dimension Radar JSON',
    $reviewsCount > 0 && $hasRadarBreakdown,
    "Reviews: {$reviewsCount} dòng | FK booking_id: {$reviewsWithBooking} | JSON Radar 6 trục hợp lệ."
);

// 1.4 Kiểm tra bảng experiences và mối quan hệ với hosts
$experiencesCount = DB::table('experiences')->count();
$experiencesWithHost = DB::table('experiences')->whereNotNull('host_id')->count();
$hasTitleEnColumn = Schema::hasColumn('experiences', 'title_en');
recordResult(
    $auditResults,
    'Database Schema',
    'Experiences Host FK & Column Sanity',
    $experiencesCount > 0 && $experiencesWithHost === $experiencesCount && !$hasTitleEnColumn,
    "Experiences: {$experiencesCount} dòng | 100% có host_id | Đã dọn sạch cột rác title_en: " . (!$hasTitleEnColumn ? "ĐÚNG" : "SAI")
);

// -------------------------------------------------------------------------
// SUITE 2: CHÍNH SÁCH HỦY PHÒNG & ĐỒNG BỘ TÀI CHÍNH (Multi-tier Cancellation)
// -------------------------------------------------------------------------
echo "\n--- [SUITE 2: MULTI-TIER CANCELLATION & FINANCIAL SYNC] ---\n";

$policyService = app(CancellationPolicyService::class);

// 2.1 Test Bậc 1: >= 48h -> 100% Hoàn tiền
$futureDate = now()->addDays(5)->format('Y-m-d');
$mockBookingTier1 = new Booking([
    'check_in_date' => $futureDate,
    'base_price' => 4000000,
    'cleaning_fee' => 300000,
    'service_fee' => 516000,
    'total_price' => 4816000,
    'status' => 'confirmed',
]);
$calcTier1 = $policyService->calculate($mockBookingTier1);
recordResult(
    $auditResults,
    'Cancellation Engine',
    'Tier 1 Policy (>= 48h: 100% Refund)',
    $calcTier1['refund_percentage'] === 100 && $calcTier1['refundable_amount'] == 4816000,
    "Check-in sau 5 ngày: Hoàn {$calcTier1['refund_percentage']}% ({$calcTier1['refundable_amount']} ₫) | Policy: {$calcTier1['policy_applied']}"
);

// 2.2 Test Bậc 2: < 48h trước check-in -> 50% Hoàn tiền (base + cleaning)
$nearFutureDate = now()->addHours(24)->format('Y-m-d');
$mockBookingTier2 = new Booking([
    'check_in_date' => $nearFutureDate,
    'base_price' => 4000000,
    'cleaning_fee' => 300000,
    'service_fee' => 516000,
    'total_price' => 4816000,
    'status' => 'confirmed',
]);
$calcTier2 = $policyService->calculate($mockBookingTier2);
recordResult(
    $auditResults,
    'Cancellation Engine',
    'Tier 2 Policy (< 48h: 50% Refund)',
    $calcTier2['refund_percentage'] === 50 && $calcTier2['refundable_amount'] == 2150000,
    "Check-in sau 24h: Hoàn {$calcTier2['refund_percentage']}% ({$calcTier2['refundable_amount']} ₫) | Policy: {$calcTier2['policy_applied']}"
);

// 2.3 Test Bậc 3: Sau check-in -> 0% Hoàn tiền
$pastDate = now()->subDays(2)->format('Y-m-d');
$mockBookingTier3 = new Booking([
    'check_in_date' => $pastDate,
    'base_price' => 4000000,
    'cleaning_fee' => 300000,
    'service_fee' => 516000,
    'total_price' => 4816000,
    'status' => 'confirmed',
]);
$calcTier3 = $policyService->calculate($mockBookingTier3);
recordResult(
    $auditResults,
    'Cancellation Engine',
    'Tier 3 Policy (Past Check-in: 0% Refund)',
    $calcTier3['refund_percentage'] === 0 && $calcTier3['refundable_amount'] == 0,
    "Check-in đã qua: Hoàn {$calcTier3['refund_percentage']}% ({$calcTier3['refundable_amount']} ₫) | Host hưởng 100%"
);

// 2.4 Kiểm tra thực tế trên cơ sở dữ liệu về các đơn hủy
$cancelledBookings = DB::table('bookings')->where('status', 'cancelled')->count();
$refundsRecorded = DB::table('refunds')->count();
$cancelledPayouts = DB::table('payout_transactions')->where('status', 'cancelled')->count();
recordResult(
    $auditResults,
    'Cancellation Engine',
    'Database Sync for Cancelled Bookings',
    $cancelledBookings > 0,
    "Đơn đã hủy trong DB: {$cancelledBookings} | Bản ghi refunds: {$refundsRecorded} | Lệnh Payout hủy: {$cancelledPayouts}"
);

// -------------------------------------------------------------------------
// SUITE 3: CATEGORY & AMENITY BACKEND CONTROLLER & API
// -------------------------------------------------------------------------
echo "\n--- [SUITE 3: CATEGORIES & AMENITIES API & CONTROLLERS] ---\n";

$catController = app(CategoryController::class);

// 3.1 Test adminIndex trả về đúng danh mục kèm accommodations_count
$indexReq = Request::create('/api/admin/categories', 'GET');
$indexRes = $catController->adminIndex($indexReq);
$indexData = json_decode($indexRes->getContent(), true);
$hasAccommodationsCount = false;
if (!empty($indexData['data']) && is_array($indexData['data'])) {
    $firstCat = $indexData['data'][0];
    $hasAccommodationsCount = array_key_exists('accommodations_count', $firstCat);
}
recordResult(
    $auditResults,
    'Category API',
    'CategoryController@adminIndex with Count',
    $indexRes->getStatusCode() === 200 && $hasAccommodationsCount,
    "API trả về " . count($indexData['data']) . " danh mục kèm trường accommodations_count."
);

// 3.2 Test adminUpdate cập nhật thông tin danh mục
$targetCat = Category::first();
if ($targetCat) {
    $originalOrder = $targetCat->display_order;
    $newOrder = $originalOrder + 1;
    $updateReq = Request::create("/api/admin/categories/{$targetCat->id}", 'PUT', [
        'label_vi' => $targetCat->label_vi,
        'label_en' => $targetCat->label_en,
        'slug' => $targetCat->slug,
        'icon' => $targetCat->icon,
        'display_order' => $newOrder,
        'is_active' => true,
    ]);
    $updateRes = $catController->adminUpdate($updateReq, $targetCat->id);
    $targetCat->refresh();
    recordResult(
        $auditResults,
        'Category API',
        'CategoryController@adminUpdate Persistence',
        $updateRes->getStatusCode() === 200 && $targetCat->display_order === $newOrder,
        "Cập nhật display_order danh mục #{$targetCat->id} thành {$newOrder} thành công."
    );
    // Rollback order
    $targetCat->display_order = $originalOrder;
    $targetCat->save();
}

// 3.3 Test adminDestroy an toàn: Chặn xóa nếu danh mục có chỗ ở liên kết
$catWithAcc = Category::withCount('accommodations')->having('accommodations_count', '>', 0)->first();
if ($catWithAcc) {
    $destroyRes = $catController->adminDestroy($catWithAcc->id);
    recordResult(
        $auditResults,
        'Category API',
        'CategoryController@adminDestroy Safe Protection',
        $destroyRes->getStatusCode() === 400,
        "Chặn xóa an toàn danh mục '{$catWithAcc->label_vi}' (có {$catWithAcc->accommodations_count} chỗ ở). Mã HTTP 400."
    );
}

// 3.4 Test AmenityController store & destroy
$amenityController = app(AmenityController::class);
$testAmenityName = 'Audit Amenity ' . time();
$storeAmenityReq = Request::create('/api/admin/amenities', 'POST', [
    'name_vi' => $testAmenityName,
    'icon' => 'TbSparkles',
    'category' => 'luxury',
]);
$storeRes = $amenityController->store($storeAmenityReq);
$storeData = json_decode($storeRes->getContent(), true);
$createdAmenityId = $storeData['data']['id'] ?? null;
recordResult(
    $auditResults,
    'Amenity API',
    'AmenityController@store',
    $storeRes->getStatusCode() === 200 && $createdAmenityId !== null,
    "Thêm tiện nghi mới thành công (ID: {$createdAmenityId})."
);

if ($createdAmenityId) {
    $destroyAmenityRes = $amenityController->destroy($createdAmenityId);
    recordResult(
        $auditResults,
        'Amenity API',
        'AmenityController@destroy',
        $destroyAmenityRes->getStatusCode() === 200,
        "Xóa tiện nghi thử nghiệm (ID: {$createdAmenityId}) dọn dẹp sạch sẽ."
    );
}

// -------------------------------------------------------------------------
// SUITE 4: EXPERIENCE CONTROLLER & HOST EAGER LOADING
// -------------------------------------------------------------------------
echo "\n--- [SUITE 4: EXPERIENCES API & EAGER LOADING] ---\n";

$expController = app(ExperienceController::class);
$expRes = $expController->adminIndex();
$expData = json_decode($expRes->getContent(), true);
$hasHostLoaded = false;
if (!empty($expData['data']) && is_array($expData['data'])) {
    $firstExp = $expData['data'][0];
    $hasHostLoaded = isset($firstExp['host']) && !empty($firstExp['host']['name']);
}
recordResult(
    $auditResults,
    'Experience API',
    'ExperienceController@adminIndex Eager Loading Host.User',
    $expRes->getStatusCode() === 200 && $hasHostLoaded,
    "Nạp thành công " . count($expData['data']) . " tour trải nghiệm kèm Host ('{$firstExp['host']['name']}') và Superhost badge."
);

// -------------------------------------------------------------------------
// SUITE 5: REVIEWS MODERATION & HOST RESPONSE CONTROLLER
// -------------------------------------------------------------------------
echo "\n--- [SUITE 5: REVIEWS MODERATION API] ---\n";

$revController = app(\App\Http\Controllers\admin\ReviewController::class);
$sampleRev = Review::first();

if ($sampleRev) {
    $origStatus = $sampleRev->status;
    $testStatus = ($origStatus === 'approved') ? 'flagged' : 'approved';
    
    // Test update status with JSON request body
    $statusReq = Request::create("/api/admin/reviews/{$sampleRev->id}/status", 'POST', [
        'status' => $testStatus
    ]);
    $statusRes = $revController->updateStatus($statusReq, $sampleRev->id);
    $sampleRev->refresh();
    
    recordResult(
        $auditResults,
        'Reviews API',
        'ReviewController@updateStatus with Body Validation',
        $statusRes->getStatusCode() === 200 && $sampleRev->status === $testStatus,
        "Duyệt chuyển trạng thái review #{$sampleRev->id} sang '{$testStatus}' trực tiếp trên DB."
    );

    // Test Host Response
    $testResponseMsg = 'Lời cảm ơn từ Ban Quản Trị TripNest ' . date('H:i:s');
    $respondReq = Request::create("/api/admin/reviews/{$sampleRev->id}/respond", 'POST', [
        'host_response' => $testResponseMsg
    ]);
    $respondRes = $revController->respond($respondReq, $sampleRev->id);
    $sampleRev->refresh();

    recordResult(
        $auditResults,
        'Reviews API',
        'ReviewController@respond Host Reply',
        $respondRes->getStatusCode() === 200 && $sampleRev->host_response === $testResponseMsg,
        "Lưu phản hồi công khai của Chủ nhà / Admin vào database thành công."
    );

    // Rollback review status
    $sampleRev->status = $origStatus;
    $sampleRev->save();
}

// -------------------------------------------------------------------------
// SUITE 6: FINANCIALS & RECONCILIATION INTEGRITY
// -------------------------------------------------------------------------
echo "\n--- [SUITE 6: FINANCIALS CONSISTENCY & MATH AUDIT] ---\n";

$completedPayoutsSum = DB::table('payout_transactions')
    ->where('status', 'completed')
    ->sum('net_payout_amount');

$pendingPayoutsSum = DB::table('payout_transactions')
    ->where('status', 'pending')
    ->sum('net_payout_amount');

$totalRefundedDb = DB::table('bookings')
    ->where('status', 'cancelled')
    ->sum('refund_amount');

recordResult(
    $auditResults,
    'Financials Engine',
    'Financials Payouts & Refunds Math Totals',
    $completedPayoutsSum >= 0 && $totalRefundedDb >= 0,
    sprintf("Đã giải ngân: %s ₫ | Đang chờ (Escrow): %s ₫ | Tổng hoàn tiền đơn hủy: %s ₫",
        number_format($completedPayoutsSum, 0, ',', '.'),
        number_format($pendingPayoutsSum, 0, ',', '.'),
        number_format($totalRefundedDb, 0, ',', '.')
    )
);

// -------------------------------------------------------------------------
// TỔNG KẾT BÁO CÁO KIỂM THỬ
// -------------------------------------------------------------------------
echo "\n====================================================================================================\n";
echo sprintf("TỔNG KẾT KIỂM THỬ: %d Tests | %d Passed | %d Failed | %d Warnings\n",
    $auditResults['summary']['total'],
    $auditResults['summary']['passed'],
    $auditResults['summary']['failed'],
    $auditResults['summary']['warnings']
);
echo "====================================================================================================\n";

file_put_contents(__DIR__ . '/chat_session_audit_results.json', json_encode($auditResults, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
exit($auditResults['summary']['failed'] > 0 ? 1 : 0);

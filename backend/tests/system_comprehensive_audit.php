<?php

/**
 * TripNest System Comprehensive Audit & Integrity Test Harness
 * Kiểm tra toàn diện Database, Logic tính tiền, Phân quyền & API Endpoints
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Account;
use App\Models\User;
use App\Models\Host;
use App\Models\Accommodation;
use App\Models\Room;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\PayoutTransaction;
use App\Models\Voucher;
use App\Models\Category;
use App\Models\Amenity;
use App\Http\Controllers\admin\FinancialController;
use App\Http\Controllers\admin\UserController;
use App\Http\Controllers\admin\AccommodationController as AdminAccommodationController;
use App\Http\Controllers\HostController;
use App\Http\Controllers\AccommodationController;
use Illuminate\Http\Request;

$results = [
    'suites' => [],
    'summary' => [
        'total_tests' => 0,
        'passed' => 0,
        'failed' => 0,
        'warnings' => 0,
    ]
];

function recordAssertion(&$results, $suiteName, $testName, $passed, $details = '', $isWarning = false) {
    $results['summary']['total_tests']++;
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

    if (!isset($results['suites'][$suiteName])) {
        $results['suites'][$suiteName] = [];
    }

    $results['suites'][$suiteName][] = [
        'test' => $testName,
        'status' => $status,
        'details' => $details,
    ];
}

echo "========================================================================\n";
echo "   TRIPNEST COMPREHENSIVE SYSTEM AUDIT & DATABASE INTEGRITY TEST\n";
echo "========================================================================\n\n";

// =========================================================================
// SUITE 1: DATABASE STRUCTURE & RECORD COUNTS
// =========================================================================
$suite1 = "1. Cấu Trúc Database & Dữ Liệu Nền Tảng";

$tables = [
    'accounts' => Account::count(),
    'users' => User::count(),
    'hosts' => Host::count(),
    'accommodations' => Accommodation::count(),
    'rooms' => Room::count(),
    'categories' => Category::count(),
    'amenities' => Amenity::count(),
    'bookings' => Booking::count(),
    'payments' => Payment::count(),
    'payout_transactions' => PayoutTransaction::count(),
    'vouchers' => Voucher::count(),
];

foreach ($tables as $table => $count) {
    recordAssertion($results, $suite1, "Bảng `{$table}` có dữ liệu hợp lệ", $count > 0, "Số lượng bản ghi: {$count}");
}

// =========================================================================
// SUITE 2: FINANCIAL ACCURACY & MONEY AUDIT (SOI TIỀN CHUẨN)
// =========================================================================
$suite2 = "2. Kiểm Tra Tài Chính, Phí Hoa Hồng & Tiền Host";

// 2.1 Kiểm tra công thức giá Booking
$bookings = Booking::where('status', '!=', 'cancelled')->get();
$bookingFormulaMismatches = 0;
$sampleCheck = null;

foreach ($bookings as $b) {
    $expectedTotal = (float)$b->base_price + (float)$b->cleaning_fee + (float)$b->service_fee - (float)$b->discount_amount;
    $actualTotal = (float)$b->total_price;
    
    // Dung sai nhỏ do làm tròn số tiền VND
    if (abs($expectedTotal - $actualTotal) > 100) {
        $bookingFormulaMismatches++;
    }

    if (!$sampleCheck && $b->service_fee > 0) {
        $sampleCheck = $b;
    }
}

recordAssertion(
    $results,
    $suite2,
    "Công thức tổng tiền Booking (Base + Cleaning + Service - Discount == Total)",
    $bookingFormulaMismatches === 0,
    "Khớp 100% trên {$bookings->count()} đơn đặt phòng (Lỗi lệch: {$bookingFormulaMismatches})"
);

// 2.2 Kiểm tra tỷ lệ phí hoa hồng nền tảng (Service Fee / Base Price)
if ($sampleCheck) {
    $commissionRate = round(((float)$sampleCheck->service_fee / (float)$sampleCheck->base_price) * 100, 1);
    recordAssertion(
        $results,
        $suite2,
        "Tỷ lệ hoa hồng dịch vụ sàn TripNest (chuẩn ~12%)",
        $commissionRate >= 10 && $commissionRate <= 15,
        "Đơn mẫu {$sampleCheck->booking_code}: Base " . number_format($sampleCheck->base_price) . "đ, Phí sàn " . number_format($sampleCheck->service_fee) . "đ (Tỷ lệ: {$commissionRate}%)"
    );
}

// 2.3 Kiểm tra bảng Payout Transactions (Tiền Gross, Hoa hồng trừ, Tiền Net về Host)
$payouts = PayoutTransaction::all();
$payoutFormulaMismatches = 0;
$samplePayout = null;

foreach ($payouts as $p) {
    $gross = (float)$p->gross_amount;
    $commission = (float)$p->platform_commission_fee;
    $net = (float)$p->net_payout_amount;

    if (abs(($gross - $commission) - $net) > 50) {
        $payoutFormulaMismatches++;
    }

    if (!$samplePayout && $commission > 0) {
        $samplePayout = $p;
    }
}

recordAssertion(
    $results,
    $suite2,
    "Công thức lệnh giải ngân Host (Gross - Commission == Net Payout)",
    $payoutFormulaMismatches === 0,
    "Khớp 100% trên {$payouts->count()} lệnh giải ngân Payout (Lỗi lệch: {$payoutFormulaMismatches})"
);

if ($samplePayout) {
    recordAssertion(
        $results,
        $suite2,
        "Số tiền thực nhận của Host sau khi trừ phí hoa hồng",
        $samplePayout->net_payout_amount > 0 && $samplePayout->net_payout_amount < $samplePayout->gross_amount,
        "Lệnh {$samplePayout->payout_code}: Gross " . number_format($samplePayout->gross_amount) . "đ - Phí sàn " . number_format($samplePayout->platform_commission_fee) . "đ = Net Host nhận " . number_format($samplePayout->net_payout_amount) . "đ"
    );
}

// 2.4 Kiểm tra đối soát tài chính Admin KPI (FinancialController::getStats)
$finController = new FinancialController();
$statsResponse = $finController->getStats();
$statsData = $statsResponse->getData(true);

$expectedGMV = (float)Booking::whereIn('status', ['confirmed', 'checked_in', 'completed'])->sum('total_price');
$expectedCommission = (float)Booking::whereIn('status', ['confirmed', 'checked_in', 'completed'])->sum('service_fee');
$expectedPendingEscrow = (float)PayoutTransaction::where('status', 'pending')->sum('net_payout_amount');
$expectedCompletedPayouts = (float)PayoutTransaction::where('status', 'completed')->sum('net_payout_amount');

recordAssertion(
    $results,
    $suite2,
    "Chỉ số GMV thu hộ trong Admin Financials khớp chuẩn với Database",
    abs($statsData['totalRevenueVND'] - $expectedGMV) < 1,
    "GMV Admin: " . number_format($statsData['totalRevenueVND']) . "đ | DB Sum: " . number_format($expectedGMV) . "đ"
);

recordAssertion(
    $results,
    $suite2,
    "Doanh thu hoa hồng sàn thu được khớp chuẩn với Database",
    abs($statsData['commissionRevenueVND'] - $expectedCommission) < 1,
    "Doanh thu hoa hồng: " . number_format($statsData['commissionRevenueVND']) . "đ"
);

recordAssertion(
    $results,
    $suite2,
    "Quỹ tạm giữ Escrow chờ giải ngân khớp chuẩn lệnh Pending",
    abs($statsData['escrowPendingVND'] - $expectedPendingEscrow) < 1,
    "Quỹ tạm giữ: " . number_format($statsData['escrowPendingVND']) . "đ (" . $statsData['pendingPayoutsCount'] . " lệnh chờ)"
);

// =========================================================================
// SUITE 3: AUTHENTICATION, REGISTRATION & ROLE UPGRADE TO HOST
// =========================================================================
$suite3 = "3. Xác Thực, Đăng Ký & Nâng Quyền Làm Host (KYC)";

// 3.1 Kiểm tra tài khoản Admin Demo
$adminAccount = Account::where('email', 'admin@tripnest.vn')->first();
recordAssertion(
    $results,
    $suite3,
    "Tài khoản Quản trị viên tồn tại (admin@tripnest.vn)",
    $adminAccount !== null && $adminAccount->role === 'admin',
    "Role: " . ($adminAccount?->role ?? 'N/A') . " | Status: " . ($adminAccount?->status ?? 'N/A')
);

if ($adminAccount) {
    $passValid = Hash::check('123456', $adminAccount->password);
    recordAssertion(
        $results,
        $suite3,
        "Mật khẩu Admin đã cập nhật chuẩn '123456' (Bcrypt Hash)",
        $passValid,
        "Hash verify: " . ($passValid ? 'Thành công' : 'Thất bại')
    );
}

// 3.2 Kiểm tra luồng tạo người dùng & đồng bộ 2 bảng accounts + users
Account::where('email', 'like', 'auto_test_%')->delete();
User::where('full_name', 'Nguyễn Văn Kiểm Thử')->delete();

$testEmail = 'auto_test_' . time() . '@tripnest.vn';
$createdAccount = Account::create([
    'email' => $testEmail,
    'password' => Hash::make('password123'),
    'role' => 'guest',
    'status' => 'active',
]);

$createdUser = User::create([
    'account_id' => $createdAccount->id,
    'full_name' => 'Nguyễn Văn Kiểm Thử',
    'phone_number' => '0977889900',
    'id_card_number' => '079095999888',
    'address' => 'Hà Nội, Việt Nam',
]);

recordAssertion(
    $results,
    $suite3,
    "Đồng bộ liên kết 1-1 giữa bảng `accounts` và `users`",
    $createdAccount->user->id === $createdUser->id && $createdUser->account->email === $testEmail,
    "User ID: {$createdUser->id} <-> Account ID: {$createdAccount->id}"
);

// 3.3 Kiểm tra gửi đơn đăng ký làm Host (KYC pending)
$testHost = Host::create([
    'user_id' => $createdUser->id,
    'host_display_name' => 'Homestay Kiểm Thử Đạt Chuẩn',
    'contact_phone' => '0977889900',
    'contact_email' => $testEmail,
    'host_introduction' => 'Cơ sở lưu trú test tự động hệ thống.',
    'business_name' => 'Biệt thự villa',
    'id_card_number' => '079095999888',
    'id_card_front_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
    'id_card_back_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
    'kyc_status' => 'pending',
]);

recordAssertion(
    $results,
    $suite3,
    "Tạo đơn xin lên Host với trạng thái KYC `pending` trong Database",
    $testHost->kyc_status === 'pending' && $createdAccount->role === 'guest',
    "Host ID: {$testHost->id} | KYC Status: pending | Account Role: guest"
);

// 3.4 Kiểm tra Admin phê duyệt Host Upgrade
$adminUserController = new UserController();
$approveRequest = new Request();
$approveResponse = $adminUserController->approveHostUpgrade($approveRequest, $createdUser->id);
$approveData = $approveResponse->getData(true);

$createdAccount->refresh();
$testHost->refresh();

recordAssertion(
    $results,
    $suite3,
    "Admin phê duyệt: Chuyển role `guest` -> `host` & KYC `pending` -> `verified`",
    $createdAccount->role === 'host' && $testHost->kyc_status === 'verified',
    "Kết quả: Role=" . $createdAccount->role . ", KYC=" . $testHost->kyc_status
);

// Dọn dẹp dữ liệu test tự động
$testHost->delete();
$createdUser->delete();
$createdAccount->delete();

// =========================================================================
// SUITE 4: ACCOMMODATIONS, ROOMS & AMENITIES RELATIONSHIPS
// =========================================================================
$suite4 = "4. Cơ Sở Lưu Trú, Phòng Nghỉ & Tiện Nghi";

// 4.1 Kiểm tra tất cả chỗ ở đều có Host hợp lệ
$orphanAccommodations = Accommodation::whereDoesntHave('host')->count();
recordAssertion(
    $results,
    $suite4,
    "Tất cả Cơ sở lưu trú đều thuộc về Chủ nhà (Host) hợp lệ",
    $orphanAccommodations === 0,
    "Số cơ sở mồ côi: {$orphanAccommodations}"
);

// 4.2 Kiểm tra tất cả chỗ ở đều có Danh mục (Category)
$orphanCategories = Accommodation::whereDoesntHave('category')->count();
recordAssertion(
    $results,
    $suite4,
    "Tất cả Cơ sở lưu trú đều có Danh mục phân loại chuẩn",
    $orphanCategories === 0,
    "Số cơ sở thiếu danh mục: {$orphanCategories}"
);

// 4.3 Kiểm tra tất cả chỗ ở đều có Phòng (Rooms) với giá > 0
$accWithoutRooms = Accommodation::whereDoesntHave('rooms')->count();
$roomsWithZeroPrice = Room::where('price_per_night', '<=', 0)->count();

recordAssertion(
    $results,
    $suite4,
    "Cơ sở lưu trú có đầy đủ cấu hình phòng nghỉ (Rooms)",
    $accWithoutRooms === 0,
    "Cơ sở không có phòng: {$accWithoutRooms}"
);

recordAssertion(
    $results,
    $suite4,
    "Giá phòng nghỉ hợp lệ (> 0 VND/đêm)",
    $roomsWithZeroPrice === 0,
    "Số phòng có giá <= 0: {$roomsWithZeroPrice}"
);

// 4.4 Kiểm tra bảng pivot Tiện nghi (accommodation_amenity)
$pivotCount = DB::table('accommodation_amenity')->count();
$invalidPivot = DB::table('accommodation_amenity')
    ->whereNotExists(fn($q) => $q->select(DB::raw(1))->from('accommodations')->whereColumn('accommodations.id', 'accommodation_amenity.accommodation_id'))
    ->orWhereNotExists(fn($q) => $q->select(DB::raw(1))->from('amenities')->whereColumn('amenities.id', 'accommodation_amenity.amenity_id'))
    ->count();

recordAssertion(
    $results,
    $suite4,
    "Bảng liên kết Tiện ích - Chỗ ở (accommodation_amenity) toàn vẹn",
    $pivotCount > 0 && $invalidPivot === 0,
    "Tổng số tiện ích gán: {$pivotCount} | Liên kết sai: {$invalidPivot}"
);

// =========================================================================
// SUITE 5: MANAGEMENT PORTALS API CONTROLLER INTEGRATION
// =========================================================================
$suite5 = "5. Kiểm Tra Kết Nối Dữ Liệu API Các Trang Quản Lý";

// 5.1 Admin Users Management Controller
try {
    $uReq = new Request();
    $uRes = (new UserController())->index($uReq);
    $uData = $uRes->getData(true);
    $uCount = count($uData['data'] ?? []);
    recordAssertion(
        $results,
        $suite5,
        "API Trang Quản Lý Tài Khoản (Admin Users)",
        $uRes->getStatusCode() === 200 && $uCount > 0,
        "HTTP 200 OK | Trả về {$uCount} người dùng từ Database"
    );
} catch (\Throwable $e) {
    recordAssertion($results, $suite5, "API Trang Quản Lý Tài Khoản (Admin Users)", false, $e->getMessage());
}

// 5.2 Admin Role Requests Controller
try {
    $rRes = (new UserController())->getRoleUpgradeRequests(new Request());
    $rData = $rRes->getData(true);
    $rCount = count($rData['data'] ?? []);
    recordAssertion(
        $results,
        $suite5,
        "API Trang Duyệt Yêu Cầu Làm Host (Role Upgrade Requests)",
        $rRes->getStatusCode() === 200,
        "HTTP 200 OK | Số đơn chờ duyệt: {$rCount}"
    );
} catch (\Throwable $e) {
    recordAssertion($results, $suite5, "API Trang Duyệt Yêu Cầu Làm Host", false, $e->getMessage());
}

// 5.3 Admin Accommodations Controller
try {
    $aRes = (new AdminAccommodationController())->index(new Request());
    $aData = $aRes->getData(true);
    $aCount = count($aData['data'] ?? []);
    recordAssertion(
        $results,
        $suite5,
        "API Trang Quản Lý Cơ Sở Lưu Trú (Admin Accommodations)",
        $aRes->getStatusCode() === 200 && $aCount > 0,
        "HTTP 200 OK | Trả về {$aCount} cơ sở lưu trú từ Database"
    );
} catch (\Throwable $e) {
    recordAssertion($results, $suite5, "API Trang Quản Lý Cơ Sở Lưu Trú (Admin Accommodations)", false, $e->getMessage());
}

// 5.4 Admin Financials & Payouts Controller
try {
    $pRes = (new FinancialController())->getPayouts(new Request());
    $pData = $pRes->getData(true);
    $pCount = count($pData ?? []);
    recordAssertion(
        $results,
        $suite5,
        "API Trang Quản Lý Giải Ngân & Tài Chính (Admin Payouts)",
        $pRes->getStatusCode() === 200 && $pCount > 0,
        "HTTP 200 OK | Trả về {$pCount} lệnh giải ngân từ Database"
    );
} catch (\Throwable $e) {
    recordAssertion($results, $suite5, "API Trang Quản Lý Giải Ngân & Tài Chính (Admin Payouts)", false, $e->getMessage());
}

// 5.5 Client Accommodations Public API
try {
    $cRes = (new AccommodationController())->index(new Request());
    $cData = $cRes->getData(true);
    $cCount = is_array($cData) ? (isset($cData['data']) ? count($cData['data']) : count($cData)) : 0;
    recordAssertion(
        $results,
        $suite5,
        "API Trang Khách Hàng Tìm Phòng & Chỗ Ở (Client Accommodations)",
        $cRes->getStatusCode() === 200 && $cCount > 0,
        "HTTP 200 OK | Trả về {$cCount} chỗ nghỉ hiển thị trên trang chủ & tìm kiếm"
    );
} catch (\Throwable $e) {
    recordAssertion($results, $suite5, "API Trang Khách Hàng Tìm Phòng & Chỗ Ở", false, $e->getMessage());
}

// =========================================================================
// SUITE 6: DATABASE INTEGRITY & ORPHANED CHECKS
// =========================================================================
$suite6 = "6. Toàn Vẹn Khóa Ngoại & Quét Dữ Liệu Mồ Côi";

// 6.1 Users không có Account
$orphanedUsers = User::whereDoesntHave('account')->count();
recordAssertion(
    $results,
    $suite6,
    "Không có bản ghi người dùng mồ côi (Users without Account)",
    $orphanedUsers === 0,
    "Số bản ghi: {$orphanedUsers}"
);

// 6.2 Bookings không có Room hoặc User
$orphanedBookings = Booking::whereDoesntHave('room')->orWhereDoesntHave('user')->count();
recordAssertion(
    $results,
    $suite6,
    "Không có đơn đặt phòng mồ côi (Bookings without Room/User)",
    $orphanedBookings === 0,
    "Số bản ghi: {$orphanedBookings}"
);

// 6.3 Payouts không có Booking hoặc Host
$orphanedPayouts = PayoutTransaction::whereDoesntHave('booking')->orWhereDoesntHave('host')->count();
recordAssertion(
    $results,
    $suite6,
    "Không có lệnh giải ngân mồ côi (Payouts without Booking/Host)",
    $orphanedPayouts === 0,
    "Số bản ghi: {$orphanedPayouts}"
);

// =========================================================================
// IN KẾT QUẢ ĐÁNH GIÁ DẠNG BẢNG
// =========================================================================
echo "\n========================================================================\n";
echo "                      BẢNG KẾT QUẢ ĐÁNH GIÁ TOÀN DIỆN\n";
echo "========================================================================\n";

foreach ($results['suites'] as $suiteTitle => $tests) {
    echo "\n>>> {$suiteTitle}\n";
    echo str_repeat('-', 72) . "\n";
    printf("%-45s | %-8s | %s\n", "HẠNG MỤC KIỂM THỬ", "KẾT QUẢ", "CHI TIẾT DATABASE / LOGIC");
    echo str_repeat('-', 72) . "\n";
    foreach ($tests as $t) {
        $statusStr = $t['status'] === 'PASSED' ? "[ ĐẠT ]" : ($t['status'] === 'WARNING' ? "[CẢNH BÁO]" : "[ THẤT BẠI ]");
        printf("%-45s | %-8s | %s\n", mb_substr($t['test'], 0, 45), $statusStr, $t['details']);
    }
}

echo "\n" . str_repeat('=', 72) . "\n";
echo "TỔNG KẾT: ";
echo "Tổng số kiểm thử: {$results['summary']['total_tests']} | ";
echo "ĐẠT: {$results['summary']['passed']} | ";
echo "THẤT BẠI: {$results['summary']['failed']} | ";
echo "CẢNH BÁO: {$results['summary']['warnings']}\n";
echo str_repeat('=', 72) . "\n";

// Xuất file JSON kết quả cho Agent đọc và phân tích
file_put_contents(__DIR__ . '/audit_results.json', json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;
use App\Models\Payment;
use App\Models\PayoutTransaction;
use Illuminate\Support\Facades\DB;

echo "Bắt đầu reset dữ liệu Đơn đặt phòng & Tiền tệ về 0...\n";

DB::statement('SET FOREIGN_KEY_CHECKS=0;');
PayoutTransaction::truncate();
Payment::truncate();
Booking::truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

echo "✅ ĐÃ XÓA TOÀN BỘ ĐƠN ĐẶT PHÒNG (bookings = 0)\n";
echo "✅ ĐÃ XÓA TOÀN BỘ THANH TOÁN (payments = 0)\n";
echo "✅ ĐÃ XÓA TOÀN BỘ LỆNH GIẢI NGÂN (payout_transactions = 0)\n";
echo "✅ TOÀN BỘ DOANH THU & TIỀN CỦA ADMIN / HOST ĐÃ VỀ 0 ₫!\n";

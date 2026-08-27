<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;
use App\Models\Payment;
use App\Models\PayoutTransaction;
use App\Models\User;

echo "=== 1. BẢNG BOOKINGS (ĐẶT PHÒNG) ===" . PHP_EOL;
$bookings = Booking::with('user', 'room.accommodation')->get();
foreach ($bookings as $b) {
    echo "ID: {$b->id} | Mã: {$b->booking_code} | Phòng: {$b->room?->room_name_vi} | Khách: {$b->user?->full_name} | Check-in: {$b->check_in_date->format('Y-m-d')} | Check-out: {$b->check_out_date->format('Y-m-d')} | Giá phòng: " . number_format($b->base_price) . " ₫ | Dọn dẹp: " . number_format($b->cleaning_fee) . " ₫ | Phí sàn: " . number_format($b->service_fee) . " ₫ | TỔNG CỘNG: " . number_format($b->total_price) . " ₫ | Trạng thái: {$b->status}" . PHP_EOL;
}

echo PHP_EOL . "=== 2. BẢNG PAYMENTS (THANH TOÁN CỦA KHÁCH) ===" . PHP_EOL;
$payments = Payment::with('booking')->get();
foreach ($payments as $p) {
    echo "ID: {$p->id} | Mã GD: {$p->transaction_code} | Booking ID: {$p->booking_id} | Phương thức: {$p->payment_method} | Số tiền: " . number_format($p->amount) . " ₫ | Trạng thái: {$p->status} | Lúc: {$p->paid_at}" . PHP_EOL;
}

echo PHP_EOL . "=== 3. BẢNG PAYOUT_TRANSACTIONS (GIẢI NGÂN / ESCROW CHỦ NHÀ) ===" . PHP_EOL;
$payouts = PayoutTransaction::with('host', 'booking')->get();
foreach ($payouts as $po) {
    echo "ID: {$po->id} | Mã Payout: {$po->payout_code} | Host: {$po->host?->host_display_name} | Booking ID: {$po->booking_id} | Tổng tiền: " . number_format($po->gross_amount) . " ₫ | Hoa hồng sàn: " . number_format($po->platform_commission_fee) . " ₫ | Host thực nhận: " . number_format($po->net_payout_amount) . " ₫ | Trạng thái: {$po->status}" . PHP_EOL;
}

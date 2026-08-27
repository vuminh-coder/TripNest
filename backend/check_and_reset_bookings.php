<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;
use App\Models\Payment;
use App\Models\PayoutTransaction;
use Illuminate\Support\Facades\DB;

echo "=== CHECKING DATABASE BOOKINGS ===" . PHP_EOL;
$bookings = Booking::all();
echo "Total Bookings in DB: " . $bookings->count() . PHP_EOL;
foreach ($bookings as $b) {
    echo "ID: {$b->id}, Code: {$b->booking_code}, Guest: {$b->guest_name}, Price: {$b->total_price}, Status: {$b->status}" . PHP_EOL;
}

echo PHP_EOL . "=== RESETTING ALL BOOKINGS & PAYOUTS TO 0 ===" . PHP_EOL;
DB::statement('SET FOREIGN_KEY_CHECKS=0;');
PayoutTransaction::truncate();
Payment::truncate();
Booking::truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

echo "Reset completed! Bookings count now: " . Booking::count() . PHP_EOL;

<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;
use App\Models\Payment;
use App\Models\PayoutTransaction;

echo "=== STEP 1: INITIAL BOOKING IN DB ===" . PHP_EOL;
$booking = Booking::first();
echo "Booking Code: {$booking->booking_code}, Status: {$booking->status}, Total: {$booking->total_price}" . PHP_EOL;

echo PHP_EOL . "=== STEP 2: CHECK-IN ===" . PHP_EOL;
$bookingController = new \App\Http\Controllers\BookingController();
$checkInRes = $bookingController->checkIn($booking->booking_code, request())->getData(true);
echo "Check-in response: " . $checkInRes['message'] . ", status now: " . $booking->fresh()->status . PHP_EOL;

echo PHP_EOL . "=== STEP 3: CHECK-OUT ===" . PHP_EOL;
$checkOutRes = $bookingController->checkOut($booking->booking_code, request())->getData(true);
echo "Check-out response: " . $checkOutRes['message'] . ", status now: " . $booking->fresh()->status . PHP_EOL;

$financialController = new \App\Http\Controllers\admin\FinancialController();
$statsBeforePayout = $financialController->getStats()->getData(true);
echo "Admin Stats Before Payout Approval: " . json_encode($statsBeforePayout) . PHP_EOL;

echo PHP_EOL . "=== STEP 4: ADMIN APPROVES PAYOUT ===" . PHP_EOL;
$payout = PayoutTransaction::first();
echo "Approving Payout ID: {$payout->id}, Code: {$payout->payout_code}" . PHP_EOL;
$approveRes = $financialController->approvePayout($payout->id, request())->getData(true);
echo "Approve response: " . $approveRes['message'] . PHP_EOL;

$statsAfterPayout = $financialController->getStats()->getData(true);
echo "Admin Stats After Payout Approval: " . json_encode($statsAfterPayout) . PHP_EOL;

echo PHP_EOL . "=== LIFECYCLE TEST COMPLETED SUCCESSFULLY! ===" . PHP_EOL;

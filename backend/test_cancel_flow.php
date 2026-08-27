<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;
use App\Models\Payment;
use App\Models\PayoutTransaction;

echo "=== TEST CANCELLATION & REFUND FLOW ===" . PHP_EOL;
$booking = Booking::first();
$bookingController = new \App\Http\Controllers\BookingController();
$cancelRes = $bookingController->cancel($booking->booking_code, request())->getData(true);

echo "Cancel response: " . $cancelRes['message'] . PHP_EOL;
echo "Booking Status: " . $booking->fresh()->status . PHP_EOL;
echo "Payment Status: " . Payment::where('booking_id', $booking->id)->first()->status . PHP_EOL;
echo "Payout Status: " . PayoutTransaction::where('booking_id', $booking->id)->first()->status . PHP_EOL;

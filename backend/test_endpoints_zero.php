<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;
use App\Models\Payment;
use App\Models\PayoutTransaction;

echo "1. Bookings count in DB: " . Booking::count() . PHP_EOL;
echo "2. Payments count in DB: " . Payment::count() . PHP_EOL;
echo "3. Payouts count in DB: " . PayoutTransaction::count() . PHP_EOL;

$financialController = new \App\Http\Controllers\admin\FinancialController();
$stats = $financialController->getStats()->getData(true);
echo "4. Admin Financial Stats: " . json_encode($stats) . PHP_EOL;

$adminBookings = $financialController->getBookings(request())->getData(true);
echo "5. Admin Bookings total: " . $adminBookings['total'] . PHP_EOL;

$hostController = new \App\Http\Controllers\HostController();
$hostStats = $hostController->getDashboardStats(request())->getData(true);
echo "6. Host Dashboard Stats: " . json_encode($hostStats['kpis']) . ", recentBookings count: " . count($hostStats['recentBookings']) . PHP_EOL;

<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Account;
use Illuminate\Http\Request;
use App\Http\Controllers\HostController;

// Lấy tài khoản host Minh Hoàng
$account = Account::where('email', 'minhhoang.dalat@gmail.com')->first();
$token = auth('api')->login($account);
echo "Token: " . substr($token, 0, 20) . "...\n";

// Giả lập payload từ Listing Wizard (entire_place)
$payload = [
    'nameVi' => 'Villa Mây Ngàn Hoàng Hôn Đà Lạt Test 2026',
    'accommodationType' => 'villa',
    'rentalMode' => 'entire_place',
    'categoryId' => 1,
    'city' => 'Đà Lạt',
    'district' => 'Phường 3',
    'address' => '12 Đường Khe Sanh, Đà Lạt',
    'description' => 'Biệt thự sân vườn view mây ngàn hoàng hôn thung lũng Đà Lạt cực đẹp.',
    'houseRules' => 'Không hút thuốc trong phòng, giữ yên tĩnh sau 22h.',
    'cancellationPolicy' => 'Hủy miễn phí 100% trước 48h.',
    'images' => [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80'
    ],
    'amenities' => ['Hồ bơi riêng', 'WiFi tốc độ cao', 'Bếp nấu ăn đầy đủ'],
    'rooms' => [
        [
            'roomNameVi' => 'Toàn bộ Biệt thự Nghỉ dưỡng Nguyên căn',
            'spaceType' => 'entire_place',
            'priceVND' => 4500000,
            'cleaningFeeVND' => 400000,
            'maxGuests' => 8,
            'bedrooms' => 4,
            'beds' => 5,
            'bathrooms' => 4,
            'roomSizeM2' => 250,
            'totalInventory' => 1,
            'description' => 'Toàn bộ không gian biệt thự nguyên căn.',
        ]
    ],
    'priceVND' => 4500000,
    'cleaningFeeVND' => 400000,
    'maxGuests' => 8,
    'bedrooms' => 4,
    'beds' => 5,
    'bathrooms' => 4,
    'roomSizeM2' => 250,
];

$request = Request::create('/api/host/accommodations', 'POST', $payload);
$request->headers->set('Authorization', 'Bearer ' . $token);

$controller = new HostController();
$response = $controller->storeAccommodation($request);

echo "Response status: " . $response->getStatusCode() . "\n";
echo "Response content: " . $response->getContent() . "\n";

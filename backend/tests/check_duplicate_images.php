<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== KIỂM TRA TRÙNG LẶP ẢNH ACCOMMODATION_IMAGES ===\n";
$accImages = DB::table('accommodation_images')
    ->select('image_url', DB::raw('count(*) as count'))
    ->groupBy('image_url')
    ->having('count', '>', 1)
    ->orderByDesc('count')
    ->get();

echo "Số lượng URL bị trùng lặp: " . $accImages->count() . "\n";
foreach ($accImages->take(10) as $img) {
    echo "  - {$img->count} lần: {$img->image_url}\n";
}

echo "\n=== KIỂM TRA TRÙNG LẶP ẢNH ROOM_IMAGES ===\n";
$roomImages = DB::table('room_images')
    ->select('image_url', DB::raw('count(*) as count'))
    ->groupBy('image_url')
    ->having('count', '>', 1)
    ->orderByDesc('count')
    ->get();

echo "Số lượng URL bị trùng lặp: " . $roomImages->count() . "\n";
foreach ($roomImages->take(10) as $img) {
    echo "  - {$img->count} lần: {$img->image_url}\n";
}

echo "\n=== KIỂM TRA THUMBNAIL CHỖ Ở (ẢNH ĐẠI DIỆN TRANG CHỦ) ===\n";
$thumbs = DB::table('accommodation_images')
    ->where('is_thumbnail', 1)
    ->select('image_url', DB::raw('count(*) as count'))
    ->groupBy('image_url')
    ->having('count', '>', 1)
    ->orderByDesc('count')
    ->get();

echo "Số lượng Thumbnail bị trùng: " . $thumbs->count() . "\n";
foreach ($thumbs as $th) {
    echo "  - {$th->count} chỗ ở dùng chung thumbnail: {$th->image_url}\n";
}

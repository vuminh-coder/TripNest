<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$accImages = DB::table('accommodation_images')->distinct()->pluck('image_url')->toArray();
$roomImages = DB::table('room_images')->distinct()->pluck('image_url')->toArray();
$expImages = DB::table('experiences')->distinct()->pluck('image_url')->toArray();

echo "Distinct in accommodation_images: " . count($accImages) . "\n";
echo "Distinct in room_images: " . count($roomImages) . "\n";
echo "Distinct in experiences: " . count($expImages) . "\n";

$allDistinct = array_unique(array_merge($accImages, $roomImages, $expImages));
echo "Total unique images across DB: " . count($allDistinct) . "\n";

file_put_contents(__DIR__ . '/db_distinct_images.json', json_encode($allDistinct, JSON_PRETTY_PRINT));

<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=======================================================\n";
echo "   TOÀN DIỆN AUDIT HỆ THỐNG DỮ LIỆU & HÌNH ẢNH        \n";
echo "=======================================================\n\n";

// 1. Audit accommodation thumbnail duplicates
$thumbDups = DB::table('accommodation_images')
    ->where('is_thumbnail', 1)
    ->select('image_url', DB::raw('count(*) as c'))
    ->groupBy('image_url')
    ->having('c', '>', 1)
    ->orderByDesc('c')
    ->get();

$totalAccs = DB::table('accommodations')->count();
$totalThumbnails = DB::table('accommodation_images')->where('is_thumbnail', 1)->count();
echo "1. THUMBNAILS CHỖ Ở:\n";
echo "   - Tổng số chỗ ở: {$totalAccs}\n";
echo "   - Tổng số ảnh gắn is_thumbnail=1: {$totalThumbnails}\n";
echo "   - Số ảnh thumbnail bị trùng lặp: " . $thumbDups->count() . "\n";
foreach ($thumbDups as $d) {
    echo "     * {$d->c} chỗ ở trùng ảnh: {$d->image_url}\n";
}

// 2. Audit all accommodation images
$accImageDups = DB::table('accommodation_images')
    ->select('image_url', DB::raw('count(*) as c'))
    ->groupBy('image_url')
    ->having('c', '>', 1)
    ->orderByDesc('c')
    ->get();
$totalAccImages = DB::table('accommodation_images')->count();
echo "\n2. TẤT CẢ ẢNH CHỖ Ở (accommodation_images):\n";
echo "   - Tổng số bản ghi ảnh: {$totalAccImages}\n";
echo "   - Số URL bị dùng lại nhiều chỗ ở: " . $accImageDups->count() . "\n";
foreach ($accImageDups->take(5) as $d) {
    echo "     * {$d->c} lần: {$d->image_url}\n";
}

// 3. Audit room images
$roomImageDups = DB::table('room_images')
    ->select('image_url', DB::raw('count(*) as c'))
    ->groupBy('image_url')
    ->having('c', '>', 1)
    ->orderByDesc('c')
    ->get();
$totalRooms = DB::table('rooms')->count();
$totalRoomImages = DB::table('room_images')->count();
echo "\n3. ẢNH PHÒNG (room_images):\n";
echo "   - Tổng số phòng: {$totalRooms}\n";
echo "   - Tổng số bản ghi ảnh phòng: {$totalRoomImages}\n";
echo "   - Số URL phòng bị trùng lặp: " . $roomImageDups->count() . "\n";
foreach ($roomImageDups->take(5) as $d) {
    echo "     * {$d->c} lần: {$d->image_url}\n";
}

// 4. Audit experiences images
$exps = DB::table('experiences')->select('id', 'title_vi', 'city', 'image_url')->get();
$expImageDups = DB::table('experiences')
    ->select('image_url', DB::raw('count(*) as c'))
    ->groupBy('image_url')
    ->having('c', '>', 1)
    ->orderByDesc('c')
    ->get();
$totalExps = $exps->count();
echo "\n4. TRẢI NGHIỆM (experiences):\n";
echo "   - Tổng số trải nghiệm: {$totalExps}\n";
echo "   - Số URL trải nghiệm trùng: " . $expImageDups->count() . "\n";
foreach ($exps as $e) {
    echo "     * [ID {$e->id}] {$e->title_vi} ({$e->city}) => {$e->image_url}\n";
}

// 5. Audit accommodation titles
$accNameDups = DB::table('accommodations')
    ->select('name_vi', DB::raw('count(*) as c'))
    ->groupBy('name_vi')
    ->having('c', '>', 1)
    ->get();
echo "\n5. TÍNH ĐỘC BẢN CỦA TÊN CHỖ Ở:\n";
echo "   - Số tên bị trùng: " . $accNameDups->count() . "\n";
foreach ($accNameDups as $d) {
    echo "     * {$d->c} lần: {$d->name_vi}\n";
}

// 6. Audit accommodation locations
$accCities = DB::table('accommodations')
    ->select('city', DB::raw('count(*) as c'))
    ->groupBy('city')
    ->orderByDesc('c')
    ->get();
echo "\n6. PHÂN BỐ THÀNH PHỐ CỦA CHỖ Ở:\n";
foreach ($accCities as $city) {
    echo "   - {$city->city}: {$city->c} chỗ ở\n";
}

// 7. Audit types
$accTypes = DB::table('accommodations')
    ->select('accommodation_type', DB::raw('count(*) as c'))
    ->groupBy('accommodation_type')
    ->orderByDesc('c')
    ->get();
echo "\n7. PHÂN BỐ LOẠI HÌNH (type):\n";
foreach ($accTypes as $t) {
    echo "   - {$t->accommodation_type}: {$t->c}\n";
}

// 8. Categories
$catCounts = DB::table('categories')
    ->select('id', 'label_vi', 'slug', 'icon')
    ->get();
echo "\n8. DANH MỤC CATEGORIES:\n";
foreach ($catCounts as $cat) {
    $count = DB::table('accommodations')->where('category_id', $cat->id)->count();
    echo "   - [ID {$cat->id}] {$cat->label_vi} ({$cat->slug}): {$count} chỗ ở\n";
}

// 9. Accommodations missing thumbnail
$missingThumbs = DB::table('accommodations as a')
    ->leftJoin('accommodation_images as ai', function($join) {
        $join->on('a.id', '=', 'ai.accommodation_id')->where('ai.is_thumbnail', 1);
    })
    ->whereNull('ai.id')
    ->select('a.id', 'a.name_vi', 'a.city')
    ->get();
echo "\n9. CHỖ Ở THIẾU THUMBNAIL (is_thumbnail = 1):\n";
echo "   - Số lượng: " . $missingThumbs->count() . "\n";
foreach ($missingThumbs as $mt) {
    echo "     * ID {$mt->id}: {$mt->name_vi} ({$mt->city})\n";
}

// 10. Accommodations without rooms
$accWithoutRooms = DB::table('accommodations as a')
    ->leftJoin('rooms as r', 'a.id', '=', 'r.accommodation_id')
    ->whereNull('r.id')
    ->select('a.id', 'a.name_vi')
    ->get();
echo "\n10. CHỖ Ở KHÔNG CÓ PHÒNG (0 rooms):\n";
echo "   - Số lượng: " . $accWithoutRooms->count() . "\n";


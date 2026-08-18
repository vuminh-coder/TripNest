<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TripNest RESTful API Routes
|--------------------------------------------------------------------------
*/

// Danh mục phân loại chỗ ở
Route::get('/categories', function () {
    return response()->json([
        ['id' => 'all', 'label' => 'Tất cả chỗ ở', 'labelEn' => 'All Homes', 'icon' => 'TbHomeCheck'],
        ['id' => 'beachfront', 'label' => 'Bãi biển', 'labelEn' => 'Beachfront', 'icon' => 'TbBeach'],
        ['id' => 'mansions', 'label' => 'Biệt thự sang trọng', 'labelEn' => 'Mansions', 'icon' => 'TbBuildingCastle'],
        ['id' => 'views', 'label' => 'Tầm nhìn tuyệt đẹp', 'labelEn' => 'Amazing views', 'icon' => 'TbMountain'],
        ['id' => 'pools', 'label' => 'Hồ bơi vô cực', 'labelEn' => 'Amazing pools', 'icon' => 'TbPool'],
        ['id' => 'cabins', 'label' => 'Nhà gỗ & Rừng thông', 'labelEn' => 'Cabins', 'icon' => 'TbHome2'],
        ['id' => 'trending', 'label' => 'Thịnh hành nhất', 'labelEn' => 'Trending', 'icon' => 'TbFlame'],
        ['id' => 'countryside', 'label' => 'Miền quê yên bình', 'labelEn' => 'Countryside', 'icon' => 'TbTrees'],
        ['id' => 'lakefront', 'label' => 'Ven hồ lãng mạn', 'labelEn' => 'Lakefront', 'icon' => 'TbSailboat'],
        ['id' => 'camping', 'label' => 'Cắm trại & Glamping', 'labelEn' => 'Camping', 'icon' => 'TbCampfire'],
        ['id' => 'tropical', 'label' => 'Miền nhiệt đới', 'labelEn' => 'Tropical', 'icon' => 'TbSun'],
        ['id' => 'iconic_cities', 'label' => 'Thành phố biểu tượng', 'labelEn' => 'Iconic cities', 'icon' => 'TbBuildingSkyscraper'],
        ['id' => 'luxe', 'label' => 'Đẳng cấp Luxe', 'labelEn' => 'Luxe Stays', 'icon' => 'TbCrown'],
        ['id' => 'experiences', 'label' => 'Trải nghiệm du lịch', 'labelEn' => 'Experiences', 'icon' => 'TbCompass'],
    ]);
});

// Danh sách phòng và tìm kiếm lọc
Route::get('/rooms', function (Request $request) {
    $category = $request->query('category');
    $search = $request->query('search');
    $minPrice = $request->query('minPrice');
    $maxPrice = $request->query('maxPrice');
    $guests = $request->query('guests');

    $sampleRooms = [
        [
            'id' => 1,
            'title' => 'Biệt Thự Đỉnh Đồi View Rừng Thông & Mây Ngàn',
            'titleEn' => 'Hilltop Pine Forest Villa & Cloud View',
            'category' => 'views',
            'type' => 'Entire villa',
            'location' => 'Đà Lạt, Lâm Đồng, Việt Nam',
            'city' => 'Đà Lạt',
            'country' => 'Việt Nam',
            'distance' => 'Cách trung tâm 4.2 km',
            'dates' => 'Ngày 12 - 17 tháng 10',
            'priceUSD' => 115,
            'priceVND' => 2850000,
            'rating' => 4.96,
            'reviewsCount' => 128,
            'isGuestFavorite' => true,
            'isSuperhost' => true,
            'specs' => ['guests' => 8, 'bedrooms' => 4, 'beds' => 5, 'bathrooms' => 4],
            'amenities' => ['Wifi tốc độ cao', 'Bếp nấu đầy đủ', 'Hồ bơi nước ấm', 'BBQ ngoài trời', 'Lò sưởi', 'Chỗ đỗ xe', 'Điều hòa', 'Máy giặt'],
        ],
        [
            'id' => 2,
            'title' => 'Luxury Beachfront Villa - Bãi Dài Phú Quốc',
            'titleEn' => 'Luxury Beachfront Villa - Long Beach',
            'category' => 'beachfront',
            'type' => 'Entire villa',
            'location' => 'Bãi Dài, Phú Quốc, Kiên Giang',
            'city' => 'Phú Quốc',
            'country' => 'Việt Nam',
            'distance' => 'Ngay sát mặt biển',
            'dates' => 'Ngày 20 - 25 tháng 10',
            'priceUSD' => 185,
            'priceVND' => 4600000,
            'rating' => 4.98,
            'reviewsCount' => 94,
            'isGuestFavorite' => true,
            'isSuperhost' => true,
            'specs' => ['guests' => 6, 'bedrooms' => 3, 'beds' => 3, 'bathrooms' => 3],
            'amenities' => ['Lối đi ra bãi biển riêng', 'Bể bơi tràn bờ', 'Wifi', 'Đưa đón sân bay', 'Bữa sáng tận phòng'],
        ],
        [
            'id' => 3,
            'title' => 'Du Thuyền Panorama Ngắm Vịnh Hạ Long',
            'titleEn' => 'Panorama Yacht Cruise - Ha Long Bay',
            'category' => 'lakefront',
            'type' => 'Entire cabin/boat',
            'location' => 'Vịnh Hạ Long, Quảng Ninh',
            'city' => 'Hạ Long',
            'country' => 'Việt Nam',
            'distance' => 'Trên vịnh di sản',
            'dates' => 'Ngày 15 - 18 tháng 10',
            'priceUSD' => 140,
            'priceVND' => 3450000,
            'rating' => 4.92,
            'reviewsCount' => 156,
            'isGuestFavorite' => false,
            'isSuperhost' => true,
            'specs' => ['guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 2],
            'amenities' => ['3 bữa ăn hải sản', 'Jacuzzi boong tàu', 'Kayak hang động', 'Lounge tầng thượng', 'Điều hòa'],
        ]
    ];

    return response()->json($sampleRooms);
});

// Đặt phòng mới
Route::post('/bookings', function (Request $request) {
    $bookingId = 'TN-' . rand(100000, 999999);
    $data = $request->all();
    $data['id'] = $bookingId;
    $data['status'] = 'confirmed';
    $data['createdAt'] = now()->toISOString();

    return response()->json([
        'success' => true,
        'message' => 'Đặt phòng thành công trên hệ thống TripNest!',
        'booking' => $data,
    ], 201);
});

// Danh sách chuyến đi đã đặt
Route::get('/my-bookings', function () {
    return response()->json([]);
});

// Mock xác thực người dùng
Route::post('/auth/login', function (Request $request) {
    return response()->json([
        'user' => [
            'name' => 'Demo User',
            'email' => $request->input('email', 'demo@tripnest.com'),
        ],
        'token' => 'mock-api-token-' . uniqid(),
    ]);
});

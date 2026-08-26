<?php

namespace Database\Seeders;

use App\Models\Accommodation;
use App\Models\AccommodationImage;
use App\Models\Amenity;
use App\Models\Category;
use App\Models\Host;
use App\Models\Review;
use App\Models\Room;
use App\Models\RoomImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class HotelFullDatasetSeeder extends Seeder
{
    /**
     * Run the database seeds for 50 hotels & 250 images.
     */
    public function run(): void
    {
        $hosts = Host::all();
        $categories = Category::all()->keyBy('slug');
        $amenities = Amenity::all()->keyBy('code');
        $sampleUsers = User::take(10)->get();

        $jsonPath = __DIR__ . '/hotels_dataset.json';
        if (!file_exists($jsonPath)) {
            $this->command->error("hotels_dataset.json not found!");
            return;
        }

        $hotelsData = json_decode(file_get_contents($jsonPath), true);

        $cityConfigs = [
            'Đà Lạt' => [
                'category' => 'views',
                'type' => 'resort',
                'addresses' => [
                    '02 Trần Phú, Phường 3, Đà Lạt, Lâm Đồng',
                    'Đường Lê Lai, Phường 5, Đà Lạt, Lâm Đồng',
                    'Khu du lịch Hồ Tuyền Lâm, Phường 4, Đà Lạt, Lâm Đồng',
                    'Số 01 Hùng Vương, Phường 10, Đà Lạt, Lâm Đồng',
                    'Phan Bội Châu, Phường 1, Đà Lạt, Lâm Đồng'
                ],
                'hostIndex' => 0
            ],
            'Phú Quốc' => [
                'category' => 'beachfront',
                'type' => 'resort',
                'addresses' => [
                    'Bãi Khem, An Thới, Phú Quốc, Kiên Giang',
                    'Bãi Trường, Dương Tơ, Phú Quốc, Kiên Giang',
                    'Mũi Ông Đội, An Thới, Phú Quốc, Kiên Giang',
                    'Bãi Khem, An Thới, Phú Quốc, Kiên Giang',
                    'Bãi Dài, Gành Dầu, Phú Quốc, Kiên Giang'
                ],
                'hostIndex' => 1
            ],
            'Hội An' => [
                'category' => 'countryside',
                'type' => 'resort',
                'addresses' => [
                    'Bãi biển Hà My, Điện Bàn, Hội An, Quảng Nam',
                    'Biển Cửa Đại, Hội An, Quảng Nam',
                    'Quần thể Hoiana, Duy Xuyên, Hội An, Quảng Nam',
                    '01 Phạm Hồng Thái, Cẩm Châu, Hội An, Quảng Nam',
                    '09 Phan Bội Châu, Cẩm Châu, Hội An, Quảng Nam'
                ],
                'hostIndex' => 2
            ],
            'Nha Trang' => [
                'category' => 'beachfront',
                'type' => 'resort',
                'addresses' => [
                    '32-34 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa',
                    'Đường Phạm Văn Đồng, Vĩnh Hòa, Nha Trang, Khánh Hòa',
                    'Đảo Hòn Tre, Vĩnh Nguyên, Nha Trang, Khánh Hòa',
                    'Bãi Đông, Cam Hải Đông, Cam Lâm, Nha Trang, Khánh Hòa',
                    'Nguyễn Tất Thành, Cam Hải Đông, Cam Ranh, Khánh Hòa'
                ],
                'hostIndex' => 3
            ],
            'Sa Pa' => [
                'category' => 'cabins',
                'type' => 'hotel',
                'addresses' => [
                    '01 Hoàng Liên, Thị xã Sa Pa, Lào Cai',
                    'Đồi Quan Sứ, Thị xã Sa Pa, Lào Cai',
                    'Bản Lếch, Thanh Kim, Sa Pa, Lào Cai',
                    'Đường Mường Hoa, Thị xã Sa Pa, Lào Cai',
                    '036 Mường Hoa, Thị xã Sa Pa, Lào Cai'
                ],
                'hostIndex' => 4
            ],
            'Đà Nẵng' => [
                'category' => 'beachfront',
                'type' => 'resort',
                'addresses' => [
                    'Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng',
                    '101 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng',
                    '05 Trường Sa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng',
                    'Đường Trường Sa, Ngũ Hành Sơn, Đà Nẵng',
                    'Khu du lịch Xuân Thiều, Nguyễn Tất Thành, Liên Chiểu, Đà Nẵng'
                ],
                'hostIndex' => 5
            ],
            'Hạ Long' => [
                'category' => 'lakefront',
                'type' => 'resort',
                'addresses' => [
                    'Đảo Rều, Bãi Cháy, TP. Hạ Long, Quảng Ninh',
                    'Đồi Cột 3 - Cột 8, Hồng Hà, TP. Hạ Long, Quảng Ninh',
                    'Lô H30-H32 Bán đảo 2, Hùng Thắng, TP. Hạ Long, Quảng Ninh',
                    'Bán đảo 2, Đô thị Halong Marina, Hùng Thắng, Hạ Long, Quảng Ninh',
                    'Đường Hạ Long, Bãi Cháy, TP. Hạ Long, Quảng Ninh'
                ],
                'hostIndex' => 6
            ],
            'Hà Nội' => [
                'category' => 'iconic_cities',
                'type' => 'hotel',
                'addresses' => [
                    '15 Ngô Quyền, Hoàn Kiếm, Hà Nội',
                    '05 Từ Hoa, Tây Hồ, Hà Nội',
                    '01 Thanh Niên, Ba Đình, Hà Nội',
                    '94 Hàng Trống, Hoàn Kiếm, Hà Nội',
                    'B7 Giảng Võ, Ba Đình, Hà Nội'
                ],
                'hostIndex' => 7
            ],
            'Quy Nhơn' => [
                'category' => 'beachfront',
                'type' => 'resort',
                'addresses' => [
                    'Khu 4, Nhơn Lý - Bãi Dài, TP. Quy Nhơn, Bình Định',
                    'Bãi Dài, Ghềnh Ráng, TP. Quy Nhơn, Bình Định',
                    'Quốc lộ 1D, Bãi Xép, Ghềnh Ráng, Quy Nhơn, Bình Định',
                    'Khu dã ngoại Trung Lương, Cát Tiến, Phù Cát, Bình Định',
                    '44 An Dương Vương, Nguyễn Văn Cừ, TP. Quy Nhơn, Bình Định'
                ],
                'hostIndex' => 8
            ],
            'Vũng Tàu' => [
                'category' => 'beachfront',
                'type' => 'resort',
                'addresses' => [
                    '159 Thùy Vân, Phường Thắng Tam, TP. Vũng Tàu, Bà Rịa - Vũng Tàu',
                    '15 Thi Sách, Phường Thắng Tam, TP. Vũng Tàu, Bà Rịa - Vũng Tàu',
                    '179 Thùy Vân, Phường 8, TP. Vũng Tàu, Bà Rịa - Vũng Tàu',
                    '115 Trần Phú, Phường 5, TP. Vũng Tàu, Bà Rịa - Vũng Tàu',
                    'Tỉnh lộ 44A, Phước Hải, Đất Đỏ, Bà Rịa - Vũng Tàu'
                ],
                'hostIndex' => 9
            ]
        ];

        $priceRanges = [2250000, 2650000, 3100000, 3550000, 4200000, 4800000, 5400000, 6200000];

        foreach ($hotelsData as $idx => $h) {
            $city = $h['city'];
            $cfg = $cityConfigs[$city] ?? [
                'category' => 'views',
                'type' => 'resort',
                'addresses' => ['Trung tâm thành phố, ' . $city],
                'hostIndex' => 0
            ];

            $host = $hosts[$cfg['hostIndex'] % count($hosts)] ?? $hosts->first();
            $category = $categories[$cfg['category']] ?? $categories->first();
            $address = $cfg['addresses'][$idx % count($cfg['addresses'])];

            $roomImageRecord = collect($h['images'])->firstWhere('image_type', 'room') ?? $h['images'][1] ?? $h['images'][0];
            $roomTitle = $roomImageRecord['image_description'] ?? ($h['hotel_name'] . ' - Phòng Nghỉ Dưỡng Cao Cấp');

            $accom = Accommodation::create([
                'id' => $h['hotel_id'],
                'host_id' => $host->id,
                'category_id' => $category->id,
                'name_vi' => $h['hotel_name'],
                'name_en' => $h['hotel_name'],
                'accommodation_type' => $cfg['type'],
                'star_rating' => 5,
                'description' => $h['hotel_name'] . ' mang đến không gian nghỉ dưỡng sang trọng bậc nhất tại ' . $city . '. Tận hưởng kỳ nghỉ trọn vẹn với các tiện nghi tiêu chuẩn 5 sao quốc tế, ẩm thực phong phú và view tuyệt mỹ.',
                'address' => $address,
                'city' => $city,
                'distance_description' => 'Vị trí đắc địa tại ' . $city . ' · Cách trung tâm ' . (rand(5, 45) / 10) . ' km',
                'is_featured' => ($idx % 3 === 0),
                'status' => 'published',
            ]);

            $basePrice = $priceRanges[$idx % count($priceRanges)];

            // Define 3 realistic child room types for this accommodation
            $roomTypesTemplate = [
                [
                    'suffix_vi' => 'Phòng Deluxe Giường King Hướng Vườn & Ban Công',
                    'suffix_en' => 'Deluxe King Garden View Room',
                    'code' => 'deluxe_king',
                    'space_type' => 'private_room',
                    'desc' => 'Không gian phòng Deluxe tinh tế với giường King êm ái, ban công thoáng đãng ngắm cảnh, phòng tắm đứng vòi sen cao cấp và tiện nghi 5 sao.',
                    'price_factor' => 1.0,
                    'cleaning_fee' => 250000,
                    'max_guests' => 2,
                    'bedrooms' => 1,
                    'beds' => 1,
                    'baths' => 1.0,
                    'size' => rand(38, 48),
                    'amenity_codes' => ['wifi', 'ac', 'parking', 'workspace'],
                ],
                [
                    'suffix_vi' => ($city === 'Đà Lạt' || $city === 'Sa Pa')
                        ? 'Suite Cao Cấp View Thung Lũng & Bồn Sục Jacuzzi'
                        : 'Suite Hướng Biển Panorama & Ban Công Riêng',
                    'suffix_en' => 'Executive Ocean & Panorama View Suite',
                    'code' => 'executive_suite',
                    'space_type' => 'entire_place',
                    'desc' => 'Hạng Suite thượng hạng với phòng khách riêng biệt, bồn tắm ngâm Jacuzzi view panorama cực đẹp, minibar miễn phí và dịch vụ phòng 24/7.',
                    'price_factor' => 1.45,
                    'cleaning_fee' => 350000,
                    'max_guests' => 3,
                    'bedrooms' => 1,
                    'beds' => 2,
                    'baths' => 1.5,
                    'size' => rand(65, 85),
                    'amenity_codes' => ['wifi', 'ac', 'parking', 'jacuzzi', 'kitchen'],
                ],
                [
                    'suffix_vi' => 'Villa Gia Đình 2 Phòng Ngủ Hồ Bơi Riêng (Private Pool Villa)',
                    'suffix_en' => '2-Bedroom Luxury Private Pool Villa',
                    'code' => 'pool_villa',
                    'space_type' => 'entire_place',
                    'desc' => 'Biệt thự nghỉ dưỡng riêng tư trọn gói với hồ bơi nước ấm riêng, sân nướng BBQ ngoài trời, bếp nấu ăn gia đình và phòng khách rộng rãi.',
                    'price_factor' => 2.2,
                    'cleaning_fee' => 500000,
                    'max_guests' => 6,
                    'bedrooms' => 2,
                    'beds' => 3,
                    'baths' => 2.0,
                    'size' => rand(120, 180),
                    'amenity_codes' => ['wifi', 'ac', 'parking', 'pool', 'bbq', 'kitchen', 'washer'],
                ]
            ];

            // 1. Insert images for accommodation (exterior, pool, lobby, etc.)
            foreach ($h['images'] as $img) {
                AccommodationImage::create([
                    'accommodation_id' => $accom->id,
                    'image_url' => $img['image_url'],
                    'image_type' => $img['image_type'],
                    'google_search_link' => $img['google_search_link'],
                    'caption' => $img['image_description'],
                    'display_order' => $img['image_order'],
                    'is_thumbnail' => ($img['image_order'] === 1),
                ]);
            }

            // Sync general amenities for Accommodation
            $accomAmenities = ['wifi', 'ac', 'parking', 'pool'];
            if ($city === 'Đà Lạt' || $city === 'Sa Pa') {
                $accomAmenities[] = 'fireplace';
            } else {
                $accomAmenities[] = 'private_beach';
            }
            $accomAmenityIds = collect($accomAmenities)->map(fn($code) => $amenities[$code]->id ?? null)->filter()->unique();
            $accom->amenities()->sync($accomAmenityIds);

            // 2. Create 3 child rooms under this accommodation
            foreach ($roomTypesTemplate as $rIdx => $rt) {
                $pricePerNight = round($basePrice * $rt['price_factor'], -4); // round to 10k VND
                $roomTitle = $h['hotel_name'] . ' - ' . $rt['suffix_vi'];

                $room = Room::create([
                    'accommodation_id' => $accom->id,
                    'room_name_vi' => $roomTitle,
                    'room_name_en' => $h['hotel_name'] . ' - ' . $rt['suffix_en'],
                    'room_type_code' => $rt['code'],
                    'space_type' => $rt['space_type'],
                    'description' => $rt['desc'],
                    'price_per_night' => $pricePerNight,
                    'cleaning_fee' => $rt['cleaning_fee'],
                    'service_fee_percent' => 12.00,
                    'max_guests' => $rt['max_guests'],
                    'bedrooms_count' => $rt['bedrooms'],
                    'beds_count' => $rt['beds'],
                    'bathrooms_count' => $rt['baths'],
                    'room_size_m2' => $rt['size'],
                    'rating' => round(4.88 + (rand(0, 11) / 100), 2),
                    'reviews_count' => rand(25, 180),
                    'is_guest_favorite' => ($rIdx === 0 && $idx % 2 === 0),
                    'status' => 'available',
                ]);

                // Attach room images (offset to give different photos)
                $imgCount = count($h['images']);
                for ($k = 0; $k < $imgCount; $k++) {
                    $imgPick = $h['images'][($k + $rIdx) % $imgCount];
                    RoomImage::create([
                        'room_id' => $room->id,
                        'image_url' => $imgPick['image_url'],
                        'image_type' => $imgPick['image_type'],
                        'google_search_link' => $imgPick['google_search_link'],
                        'caption' => $imgPick['image_description'],
                        'display_order' => $k + 1,
                        'is_thumbnail' => ($k === 0),
                    ]);
                }

                // Attach amenities for this child room
                $roomAmenityIds = collect($rt['amenity_codes'])->map(fn($code) => $amenities[$code]->id ?? null)->filter()->unique();
                $room->amenities()->sync($roomAmenityIds);

                // Seed Reviews for this child room
                if ($sampleUsers->isNotEmpty()) {
                    $reviewer = $sampleUsers[($idx + $rIdx) % count($sampleUsers)];
                    Review::create([
                        'room_id' => $room->id,
                        'user_id' => $reviewer->id,
                        'booking_id' => null,
                        'rating' => 5.0,
                        'rating_breakdown' => [
                            'cleanliness' => 5.0,
                            'accuracy' => 5.0,
                            'communication' => 5.0,
                            'location' => 5.0,
                            'checkin' => 5.0,
                            'value' => 4.9,
                        ],
                        'comment' => 'Trải nghiệm tuyệt vời tại hạng ' . $rt['suffix_vi'] . ' của ' . $h['hotel_name'] . '! Phòng ốc sạch đẹp, tiện nghi chuẩn 5 sao và nhân viên rất chu đáo.',
                        'host_response' => 'Cảm ơn quý khách đã tin chọn ' . $h['hotel_name'] . '. Chúng tôi rất hân hạnh được phục vụ bạn!',
                        'host_responded_at' => now(),
                        'status' => 'approved',
                    ]);
                }
            }
        }

        // =========================================================================
        // 3. THÊM CÁC CƠ SỞ LƯU TRÚ ĐẶC THÙ: BIỆT THỰ NGUYÊN CĂN, HOMESTAY, CABIN, DU THUYỀN
        // =========================================================================
        $specialAccommodations = [
            [
                'id' => 51,
                'name_vi' => 'Sun Valley Luxury Private Villa Đà Lạt',
                'name_en' => 'Sun Valley Luxury Private Villa Dalat',
                'category_slug' => 'villas',
                'type' => 'villa',
                'city' => 'Đà Lạt',
                'address' => 'Đường Đặng Thái Thân, Phường 3, TP. Đà Lạt, Lâm Đồng',
                'distance' => 'Biệt thự đồi thông riêng tư · Cách trung tâm 2.8 km',
                'description' => 'Biệt thự nghỉ dưỡng cao cấp nguyên căn nằm giữa rừng thông Đà Lạt. Sở hữu hồ bơi nước ấm riêng, sân vườn tiệc nướng BBQ 200m², phòng chiếu phim gia đình, phòng khách sang trọng và tầm nhìn thung lũng săn mây tuyệt mỹ.',
                'star_rating' => 5,
                'images' => [
                    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
                ],
                'amenity_codes' => ['wifi', 'ac', 'parking', 'pool', 'bbq', 'kitchen', 'fireplace', 'washer', 'jacuzzi'],
                'room' => [
                    'title' => 'Sun Valley Luxury Private Villa - Trọn Căn Biệt Thự 4 Phòng Ngủ Hồ Bơi Riêng',
                    'code' => 'entire_villa',
                    'space_type' => 'entire_place',
                    'desc' => 'Thuê trọn gói toàn bộ biệt thự sang trọng 4 phòng ngủ riêng biệt, hồ bơi nước ấm 4 mùa, sân nướng BBQ, nhà bếp chuẩn Master Chef và phòng khách hiện đại.',
                    'price' => 7800000,
                    'cleaning_fee' => 500000,
                    'guests' => 10,
                    'bedrooms' => 4,
                    'beds' => 5,
                    'baths' => 4.5,
                    'size' => 280,
                    'rating' => 4.99,
                    'reviews_count' => 84,
                ]
            ],
            [
                'id' => 52,
                'name_vi' => 'Oceanfront Sunset Pool Villa Phú Quốc',
                'name_en' => 'Oceanfront Sunset Pool Villa Phu Quoc',
                'category_slug' => 'beachfront',
                'type' => 'villa',
                'city' => 'Phú Quốc',
                'address' => 'Bãi Trường, Xã Dương Tơ, TP. Phú Quốc, Kiên Giang',
                'distance' => 'Mặt biển ngắm hoàng hôn · Cách sân bay 6 km',
                'description' => 'Biệt thự nghỉ dưỡng hướng biển trực diện với bãi cát riêng dài 50m. Hồ bơi vô cực sát mép sóng biển, khu vực quầy bar ngoài trời, phòng ngủ view kính 360 độ đón trọn vẹn hoàng hôn Phú Quốc.',
                'star_rating' => 5,
                'images' => [
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200',
                    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
                ],
                'amenity_codes' => ['wifi', 'ac', 'parking', 'pool', 'bbq', 'kitchen', 'private_beach', 'washer'],
                'room' => [
                    'title' => 'Oceanfront Sunset Pool Villa - Trọn Căn Biệt Thự Mặt Biển 3 Phòng Ngủ',
                    'code' => 'entire_villa',
                    'space_type' => 'entire_place',
                    'desc' => 'Trọn căn biệt thự mặt biển 3 phòng ngủ King-size, hồ bơi vô cực, bãi cát riêng tư và dịch vụ quản gia 24/7.',
                    'price' => 6950000,
                    'cleaning_fee' => 450000,
                    'guests' => 8,
                    'bedrooms' => 3,
                    'beds' => 4,
                    'baths' => 3.5,
                    'size' => 220,
                    'rating' => 4.98,
                    'reviews_count' => 112,
                ]
            ],
            [
                'id' => 53,
                'name_vi' => 'Pine Hill Cozy Wooden Homestay Đà Lạt',
                'name_en' => 'Pine Hill Cozy Wooden Homestay Dalat',
                'category_slug' => 'cabins',
                'type' => 'homestay',
                'city' => 'Đà Lạt',
                'address' => 'Đường Triệu Việt Vương, Phường 4, TP. Đà Lạt, Lâm Đồng',
                'distance' => 'Gần Hồ Tuyền Lâm · Cách trung tâm 3.5 km',
                'description' => 'Ngôi nhà gỗ mộc ấm cúng nép mình bên sườn đồi thông. Không gian yên bình với lò sưởi đốt củi thật, ban công uống trà ngắm sương mù buổi sớm và vườn hoa cẩm tú cầu nở rộ.',
                'star_rating' => 4,
                'images' => [
                    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
                    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200',
                    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
                    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200',
                ],
                'amenity_codes' => ['wifi', 'kitchen', 'fireplace', 'parking', 'bbq'],
                'room' => [
                    'title' => 'Pine Hill Wooden Homestay - Trọn Căn Nhà Gỗ Mộc 2 Phòng Ngủ Lò Sưởi',
                    'code' => 'entire_homestay',
                    'space_type' => 'entire_place',
                    'desc' => 'Thuê trọn căn nhà gỗ mộc 2 phòng ngủ ấm áp, bếp nấu ăn tự do, lò sưởi củi và sân vườn nướng BBQ chill ngắm mây trời.',
                    'price' => 1850000,
                    'cleaning_fee' => 200000,
                    'guests' => 5,
                    'bedrooms' => 2,
                    'beds' => 3,
                    'baths' => 2.0,
                    'size' => 95,
                    'rating' => 4.96,
                    'reviews_count' => 145,
                ]
            ],
            [
                'id' => 54,
                'name_vi' => 'Mây Sa Pa Cloud View Glass Cabin',
                'name_en' => 'May Sa Pa Cloud View Glass Cabin',
                'category_slug' => 'views',
                'type' => 'cabin',
                'city' => 'Sa Pa',
                'address' => 'Bản Tả Van, Thị xã Sa Pa, Lào Cai',
                'distance' => 'Tầm nhìn đỉnh Fansipan · Cách trung tâm Sa Pa 5 km',
                'description' => 'Cabin kính độc đáo nhìn ra thung lũng Mường Hoa và ruộng bậc thang tầng tầng lớp lớp. Tận hưởng cảm giác thức giấc giữa biển mây bồng bềnh và ngâm mình trong bồn tắm gỗ pơ-mu thảo mộc người Dao đỏ.',
                'star_rating' => 5,
                'images' => [
                    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200',
                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
                    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
                    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200',
                ],
                'amenity_codes' => ['wifi', 'ac', 'fireplace', 'jacuzzi', 'workspace', 'parking'],
                'room' => [
                    'title' => 'Mây Sa Pa Glass Cabin - Trọn Căn Cabin Kính View Biển Mây & Bồn Tắm Thảo Mộc',
                    'code' => 'entire_cabin',
                    'space_type' => 'entire_place',
                    'desc' => 'Trọn căn cabin kính panoramic 360 độ ngắm trọn thung lũng Mường Hoa, bồn tắm gỗ pơ-mu ngâm thảo mộc và lò sưởi ấm cúng.',
                    'price' => 2150000,
                    'cleaning_fee' => 200000,
                    'guests' => 3,
                    'bedrooms' => 1,
                    'beds' => 2,
                    'baths' => 1.5,
                    'size' => 65,
                    'rating' => 4.97,
                    'reviews_count' => 176,
                ]
            ],
            [
                'id' => 55,
                'name_vi' => 'Du Thuyền Heritage Grand Cruises 5 Sao Hạ Long',
                'name_en' => 'Heritage Grand Cruises 5-Star Halong Bay',
                'category_slug' => 'lakefront',
                'type' => 'yacht',
                'city' => 'Hạ Long',
                'address' => 'Cảng tàu khách quốc tế Tuần Châu, TP. Hạ Long, Quảng Ninh',
                'distance' => 'Du ngoạn vịnh di sản UNESCO · Bến cảng Tuần Châu',
                'description' => 'Du thuyền sang trọng bậc nhất trên vịnh Hạ Long & Lan Hạ với hải trình đẳng cấp. Thưởng thức ẩm thực fine-dining thượng hạng, chèo thuyền kayak qua hang động kỳ vĩ và ngắm bình minh trên boong tàu sundeck 360 độ.',
                'star_rating' => 5,
                'images' => [
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
                    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200',
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
                ],
                'amenity_codes' => ['wifi', 'ac', 'jacuzzi', 'pool'],
                'room' => [
                    'title' => 'Heritage Grand Cruises - Cabin VIP Ocean Suite Ban Công Riêng View Vịnh',
                    'code' => 'yacht_suite',
                    'space_type' => 'private_room',
                    'desc' => 'Phòng nghỉ VIP trên du thuyền 5 sao bao gồm trọn gói 4 bữa ăn hải sản cao cấp, chèo thuyền kayak và vé tham quan danh thắng.',
                    'price' => 5600000,
                    'cleaning_fee' => 300000,
                    'guests' => 2,
                    'bedrooms' => 1,
                    'beds' => 1,
                    'baths' => 1.0,
                    'size' => 45,
                    'rating' => 4.99,
                    'reviews_count' => 210,
                ]
            ],
            [
                'id' => 56,
                'name_vi' => 'Skyline Sea View Penthouse Nha Trang',
                'name_en' => 'Skyline Sea View Penthouse Nha Trang',
                'category_slug' => 'iconic_cities',
                'type' => 'apartment',
                'city' => 'Nha Trang',
                'address' => '02 Trần Phú, Phường Lộc Thọ, TP. Nha Trang, Khánh Hòa',
                'distance' => 'Mặt đường Trần Phú · Trực diện bãi biển Nha Trang',
                'description' => 'Căn hộ Penthouse tầng 38 đẳng cấp với tầm nhìn ôm trọn vịnh biển Nha Trang và đảo Hòn Tre. Nội thất phong cách Scandinavian sang trọng, bồn tắm sục kính view biển và ban công đón gió biển trong lành.',
                'star_rating' => 5,
                'images' => [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
                    'https://images.unsplash.com/photo-1502005229762-ee1b2b8ba98f?w=1200',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
                ],
                'amenity_codes' => ['wifi', 'ac', 'kitchen', 'washer', 'parking', 'jacuzzi'],
                'room' => [
                    'title' => 'Skyline Penthouse - Trọn Căn Hộ Cao Cấp 3 Phòng Ngủ Tầng 38 View Biển',
                    'code' => 'entire_apartment',
                    'space_type' => 'entire_place',
                    'desc' => 'Thuê trọn căn Penthouse 3 phòng ngủ sang trọng tầng 38, bếp nấu nướng đầy đủ, bồn tắm ngâm Jacuzzi ngắm vịnh biển Nha Trang.',
                    'price' => 4500000,
                    'cleaning_fee' => 350000,
                    'guests' => 6,
                    'bedrooms' => 3,
                    'beds' => 3,
                    'baths' => 3.0,
                    'size' => 165,
                    'rating' => 4.95,
                    'reviews_count' => 98,
                ]
            ],
        ];

        foreach ($specialAccommodations as $sa) {
            $host = $hosts->random() ?? $hosts->first();
            $category = $categories[$sa['category_slug']] ?? $categories->first();

            $specAccom = Accommodation::create([
                'id' => $sa['id'],
                'host_id' => $host->id,
                'category_id' => $category->id,
                'name_vi' => $sa['name_vi'],
                'name_en' => $sa['name_en'],
                'accommodation_type' => $sa['type'],
                'star_rating' => $sa['star_rating'],
                'description' => $sa['description'],
                'address' => $sa['address'],
                'city' => $sa['city'],
                'distance_description' => $sa['distance'],
                'is_featured' => true,
                'status' => 'published',
            ]);

            // Insert images
            foreach ($sa['images'] as $imgIdx => $imgUrl) {
                AccommodationImage::create([
                    'accommodation_id' => $specAccom->id,
                    'image_url' => $imgUrl,
                    'image_type' => ($imgIdx === 0 ? 'exterior' : 'room'),
                    'caption' => $sa['name_vi'] . ' - Hình ảnh ' . ($imgIdx + 1),
                    'display_order' => $imgIdx + 1,
                    'is_thumbnail' => ($imgIdx === 0),
                ]);
            }

            // Sync amenities
            $specAmenityIds = collect($sa['amenity_codes'])->map(fn($code) => $amenities[$code]->id ?? null)->filter()->unique();
            $specAccom->amenities()->sync($specAmenityIds);

            // Create room
            $rData = $sa['room'];
            $specRoom = Room::create([
                'accommodation_id' => $specAccom->id,
                'room_name_vi' => $rData['title'],
                'room_name_en' => $rData['title'],
                'room_type_code' => $rData['code'],
                'space_type' => $rData['space_type'],
                'description' => $rData['desc'],
                'price_per_night' => $rData['price'],
                'cleaning_fee' => $rData['cleaning_fee'],
                'service_fee_percent' => 12.00,
                'max_guests' => $rData['guests'],
                'bedrooms_count' => $rData['bedrooms'],
                'beds_count' => $rData['beds'],
                'bathrooms_count' => $rData['baths'],
                'room_size_m2' => $rData['size'],
                'rating' => $rData['rating'],
                'reviews_count' => $rData['reviews_count'],
                'is_guest_favorite' => true,
                'status' => 'available',
            ]);

            // Attach room images
            foreach ($sa['images'] as $imgIdx => $imgUrl) {
                RoomImage::create([
                    'room_id' => $specRoom->id,
                    'image_url' => $imgUrl,
                    'image_type' => 'room',
                    'caption' => $rData['title'] . ' - Ảnh ' . ($imgIdx + 1),
                    'display_order' => $imgIdx + 1,
                    'is_thumbnail' => ($imgIdx === 0),
                ]);
            }

            // Attach room amenities
            $specRoom->amenities()->sync($specAmenityIds);

            // Seed review
            if ($sampleUsers->isNotEmpty()) {
                Review::create([
                    'room_id' => $specRoom->id,
                    'user_id' => $sampleUsers->first()->id,
                    'booking_id' => null,
                    'rating' => 5.0,
                    'rating_breakdown' => [
                        'cleanliness' => 5.0,
                        'accuracy' => 5.0,
                        'communication' => 5.0,
                        'location' => 5.0,
                        'checkin' => 5.0,
                        'value' => 5.0,
                    ],
                    'comment' => 'Trải nghiệm trên cả tuyệt vời tại ' . $sa['name_vi'] . '! Không gian riêng tư trọn vẹn, cảnh quan hùng vĩ và mọi thứ đều hoàn hảo.',
                    'host_response' => 'Cảm ơn quý khách đã tin chọn ' . $sa['name_vi'] . '. Hân hạnh được phục vụ bạn lần sau!',
                    'host_responded_at' => now(),
                    'status' => 'approved',
                ]);
            }
        }
    }
}

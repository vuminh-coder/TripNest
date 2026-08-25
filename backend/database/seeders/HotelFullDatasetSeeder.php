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

            $price = $priceRanges[$idx % count($priceRanges)];
            $room = Room::create([
                'id' => $h['hotel_id'],
                'accommodation_id' => $accom->id,
                'room_name_vi' => $roomTitle,
                'room_name_en' => $h['hotel_name'] . ' - Deluxe Room',
                'room_type_code' => 'luxury_suite',
                'space_type' => 'entire_place',
                'description' => 'Không gian phòng nghỉ tinh tế với đầy đủ tiện nghi hiện đại tại ' . $h['hotel_name'] . '. Tầm nhìn thoáng đãng ngắm cảnh đẹp của ' . $city . ', giường ngủ cao cấp êm ái, bồn tắm thư giãn và dịch vụ phòng 24/7.',
                'price_per_night' => $price,
                'cleaning_fee' => 350000.00,
                'service_fee_percent' => 12.00,
                'max_guests' => rand(2, 6),
                'bedrooms_count' => rand(1, 3),
                'beds_count' => rand(1, 4),
                'bathrooms_count' => rand(1, 3),
                'room_size_m2' => rand(45, 120),
                'rating' => round(4.85 + (rand(0, 14) / 100), 2),
                'reviews_count' => rand(48, 260),
                'is_guest_favorite' => ($idx % 2 === 0),
                'status' => 'available',
            ]);

            // 1. Insert 5 images for accommodation
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

                // 2. Insert 5 images for room
                RoomImage::create([
                    'room_id' => $room->id,
                    'image_url' => $img['image_url'],
                    'image_type' => $img['image_type'],
                    'google_search_link' => $img['google_search_link'],
                    'caption' => $img['image_description'],
                    'display_order' => $img['image_order'],
                    'is_thumbnail' => ($img['image_order'] === 1),
                ]);
            }

            // 3. Attach amenities
            $roomAmenities = ['wifi', 'ac', 'parking'];
            if ($city === 'Đà Lạt' || $city === 'Sa Pa') {
                $roomAmenities[] = 'fireplace';
                $roomAmenities[] = 'pool';
            } else {
                $roomAmenities[] = 'private_beach';
                $roomAmenities[] = 'pool';
            }
            $roomAmenities[] = 'kitchen';
            $roomAmenities[] = 'jacuzzi';

            $amenityIds = collect($roomAmenities)->map(fn($code) => $amenities[$code]->id ?? null)->filter()->unique();
            $room->amenities()->sync($amenityIds);
            $accom->amenities()->sync($amenityIds);

            // 4. Seed Reviews with JSON rating_breakdown
            if ($sampleUsers->isNotEmpty()) {
                $reviewer = $sampleUsers[$idx % count($sampleUsers)];
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
                    'comment' => 'Kỳ nghỉ tuyệt vời tại ' . $h['hotel_name'] . '! Phòng ốc sạch sẽ, nhân viên phục vụ tận tình và cảnh quan xung quanh rất đẹp. Nhất định sẽ quay lại lần sau!',
                    'host_response' => 'Cảm ơn bạn đã lựa chọn ' . $h['hotel_name'] . '. Rất mong được đón tiếp bạn trong những chuyến du lịch tiếp theo!',
                    'host_responded_at' => now(),
                    'status' => 'approved',
                ]);
            }
        }
    }
}

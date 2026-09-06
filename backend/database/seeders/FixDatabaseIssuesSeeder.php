<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * FixDatabaseIssuesSeeder
 * 
 * Sửa 6 vấn đề database được phát hiện:
 * 1. Room images xoay vòng từ accommodation → thay bằng ảnh riêng cho mỗi hạng phòng
 * 2. house_rules & cancellation_policy trống → điền data
 * 3. Amenities 13-20 trùng lặp → merge vào 1-12 (giữ smart_tv riêng)
 * 4. Reviews thiếu đa dạng → đa dạng hóa rating & comment
 * 5. star_rating = 0 cho cơ sở test → sửa
 * 6. Pool Villa thêm ảnh phòng ngủ phụ (6 ảnh thay vì 5)
 */
class FixDatabaseIssuesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🔧 Bắt đầu sửa 6 vấn đề database...');

        // === TASK 1.4: MERGE AMENITIES ===
        $this->mergeAmenities();

        // === TASK 1.3: FILL HOUSE_RULES & CANCELLATION_POLICY ===
        $this->fillAccommodationFields();

        // === TASK 1.6: FIX TEST ACCOMMODATIONS ===
        $this->fixTestAccommodations();

        // === TASK 1.2: UPDATE ROOM IMAGES ===
        $this->updateRoomImages();

        // === TASK 1.5: DIVERSIFY REVIEWS ===
        $this->diversifyReviews();

        $this->command->info('✅ Hoàn thành sửa 6 vấn đề database!');
    }

    // ================================================================
    // TASK 1.4: Merge Amenities 13-20 into 1-12
    // ================================================================
    private function mergeAmenities(): void
    {
        $this->command->info('📦 Task 1.4: Merge amenities trùng lặp...');

        // Mapping: old_id => new_id
        $mapping = [
            13 => 3,   // ho-boi-rieng → pool
            14 => 1,   // wifi-toc-do-cao → wifi
            15 => 2,   // bep-nau-an-day-du → kitchen
            16 => 6,   // bai-do-xe-mien-phi → parking
            17 => 7,   // dieu-hoa-2-chieu → ac
            // 18: smart-tv-4k → Giữ riêng (user quyết định)
            19 => 11,  // bon-tam → jacuzzi
            20 => 4,   // bep-nuong-bbq → bbq
        ];

        foreach ($mapping as $oldId => $newId) {
            // Update accommodation_amenity pivot
            $existingPairs = DB::table('accommodation_amenity')
                ->where('amenity_id', $oldId)
                ->get();

            foreach ($existingPairs as $pair) {
                // Check if new pair already exists
                $exists = DB::table('accommodation_amenity')
                    ->where('accommodation_id', $pair->accommodation_id)
                    ->where('amenity_id', $newId)
                    ->exists();

                if (!$exists) {
                    DB::table('accommodation_amenity')
                        ->where('id', $pair->id)
                        ->update(['amenity_id' => $newId]);
                } else {
                    DB::table('accommodation_amenity')
                        ->where('id', $pair->id)
                        ->delete();
                }
            }

            // Update room_amenity pivot
            $existingRoomPairs = DB::table('room_amenity')
                ->where('amenity_id', $oldId)
                ->get();

            foreach ($existingRoomPairs as $pair) {
                $exists = DB::table('room_amenity')
                    ->where('room_id', $pair->room_id)
                    ->where('amenity_id', $newId)
                    ->exists();

                if (!$exists) {
                    DB::table('room_amenity')
                        ->where('id', $pair->id)
                        ->update(['amenity_id' => $newId]);
                } else {
                    DB::table('room_amenity')
                        ->where('id', $pair->id)
                        ->delete();
                }
            }

            // Delete old amenity
            DB::table('amenities')->where('id', $oldId)->delete();
        }

        // Rename amenity 18 (smart-tv-4k) to have proper English-style code
        DB::table('amenities')
            ->where('id', 18)
            ->update([
                'code' => 'smart_tv',
                'name_vi' => 'Smart TV 4K 55 inch',
                'name_en' => 'Smart TV 4K 55 inch',
                'icon' => 'TbDeviceTv',
                'target_type' => 'room',
                'category' => 'standout',
            ]);

        $this->command->info('  ✅ Đã merge 7 amenities trùng lặp, giữ smart_tv riêng');
    }

    // ================================================================
    // TASK 1.3: Fill house_rules & cancellation_policy
    // ================================================================
    private function fillAccommodationFields(): void
    {
        $this->command->info('📝 Task 1.3: Điền house_rules & cancellation_policy...');

        $houseRules = "• Không hút thuốc trong phòng và khu vực kín\n• Giữ yên lặng sau 22:00 — trước 7:00 sáng\n• Xuất trình CMND/CCCD/Passport khi check-in\n• Không tổ chức tiệc hoặc sự kiện không được phép\n• Bảo quản tài sản cơ sở — hư hỏng sẽ bồi thường theo quy định\n• Không mang theo vật nuôi trừ khi cơ sở cho phép";

        $policies = [
            'flexible' => "Chính sách hủy linh hoạt:\n• Miễn phí hủy trước 24 giờ check-in\n• Hủy trong vòng 24 giờ: hoàn 50% tổng tiền phòng\n• Không đến (No-show): không hoàn tiền",
            'moderate' => "Chính sách hủy vừa phải:\n• Miễn phí hủy trước 5 ngày check-in\n• Hủy trong 5 ngày: hoàn 50% tổng tiền phòng\n• Hủy trong 48 giờ hoặc không đến: không hoàn tiền",
            'strict' => "Chính sách hủy nghiêm ngặt:\n• Miễn phí hủy trước 14 ngày check-in\n• Hủy trong 14 ngày: hoàn 50% phí phòng (không bao gồm phí dịch vụ)\n• Hủy trong 7 ngày hoặc không đến: không hoàn tiền",
        ];

        // Resort/Hotel → moderate
        DB::table('accommodations')
            ->whereIn('accommodation_type', ['resort', 'hotel'])
            ->where(function ($q) {
                $q->whereNull('house_rules')->orWhere('house_rules', '');
            })
            ->update([
                'house_rules' => $houseRules,
                'cancellation_policy' => $policies['moderate'],
            ]);

        // Homestay, Cabin → flexible
        DB::table('accommodations')
            ->whereIn('accommodation_type', ['homestay', 'cabin'])
            ->where(function ($q) {
                $q->whereNull('house_rules')->orWhere('house_rules', '');
            })
            ->update([
                'house_rules' => $houseRules,
                'cancellation_policy' => $policies['flexible'],
            ]);

        // Villa, Yacht, Apartment → strict
        DB::table('accommodations')
            ->whereIn('accommodation_type', ['villa', 'yacht', 'apartment'])
            ->where(function ($q) {
                $q->whereNull('house_rules')->orWhere('house_rules', '');
            })
            ->update([
                'house_rules' => $houseRules,
                'cancellation_policy' => $policies['strict'],
            ]);

        $this->command->info('  ✅ Đã điền house_rules & cancellation_policy cho tất cả accommodations');
    }

    // ================================================================
    // TASK 1.6: Fix test accommodations
    // ================================================================
    private function fixTestAccommodations(): void
    {
        $this->command->info('🔧 Task 1.6: Sửa cơ sở test...');

        DB::table('accommodations')->where('id', 59)->update(['star_rating' => 4]);
        DB::table('accommodations')->where('id', 60)->update(['star_rating' => 5]);

        $this->command->info('  ✅ Đã sửa star_rating cho accommodations 59 (→4★) và 60 (→5★)');
    }

    // ================================================================
    // TASK 1.2: Update room images with distinct photos per room type
    // ================================================================
    private function updateRoomImages(): void
    {
        $this->command->info('🖼️ Task 1.2: Cập nhật ảnh phòng riêng cho 150 rooms...');

        // 4 bộ ảnh biến thể cho mỗi hạng phòng
        $deluxeKingSets = [
            // Set A - Warm/Classic tone
            [
                ['url' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200', 'type' => 'room', 'caption' => 'Phòng Deluxe King - Toàn cảnh'],
                ['url' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200', 'type' => 'bedroom', 'caption' => 'Giường King cỡ lớn êm ái'],
                ['url' => 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm đứng hiện đại'],
                ['url' => 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200', 'type' => 'view', 'caption' => 'View từ ban công phòng'],
                ['url' => 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', 'type' => 'detail', 'caption' => 'Bàn làm việc & tiện nghi'],
            ],
            // Set B - Modern/Bright tone
            [
                ['url' => 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200', 'type' => 'room', 'caption' => 'Phòng Deluxe King - Không gian sang trọng'],
                ['url' => 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200', 'type' => 'bedroom', 'caption' => 'Giường King êm ái view đẹp'],
                ['url' => 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm sang trọng'],
                ['url' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200', 'type' => 'view', 'caption' => 'Tầm nhìn từ phòng'],
                ['url' => 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200', 'type' => 'detail', 'caption' => 'Nội thất tinh tế'],
            ],
            // Set C - Minimalist/Natural
            [
                ['url' => 'https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=1200', 'type' => 'room', 'caption' => 'Phòng Deluxe King - Thiết kế tối giản'],
                ['url' => 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', 'type' => 'bedroom', 'caption' => 'Không gian ngủ ấm cúng'],
                ['url' => 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm tối giản hiện đại'],
                ['url' => 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200', 'type' => 'view', 'caption' => 'View cảnh quan'],
                ['url' => 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200', 'type' => 'detail', 'caption' => 'Chi tiết nội thất'],
            ],
            // Set D - Luxury/Dark tone
            [
                ['url' => 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200', 'type' => 'room', 'caption' => 'Phòng Deluxe King - Đẳng cấp'],
                ['url' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200', 'type' => 'bedroom', 'caption' => 'Giường King cao cấp'],
                ['url' => 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm đẳng cấp'],
                ['url' => 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200', 'type' => 'view', 'caption' => 'View panorama'],
                ['url' => 'https://images.unsplash.com/photo-1560185008-b033106af5c4?w=1200', 'type' => 'detail', 'caption' => 'Tiện nghi trong phòng'],
            ],
        ];

        $executiveSuiteSets = [
            // Set A
            [
                ['url' => 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200', 'type' => 'room', 'caption' => 'Suite Cao Cấp - Phòng khách rộng rãi'],
                ['url' => 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200', 'type' => 'bedroom', 'caption' => 'Phòng ngủ Master Suite'],
                ['url' => 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'type' => 'bathroom', 'caption' => 'Bồn tắm Jacuzzi sang trọng'],
                ['url' => 'https://images.unsplash.com/photo-1582719508461-905c673771eb?w=1200', 'type' => 'view', 'caption' => 'View panorama từ suite'],
                ['url' => 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', 'type' => 'detail', 'caption' => 'Khu vực ăn uống & minibar'],
            ],
            // Set B
            [
                ['url' => 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200', 'type' => 'room', 'caption' => 'Suite - Không gian sống đẳng cấp'],
                ['url' => 'https://images.unsplash.com/photo-1560185008-b033106af5c4?w=1200', 'type' => 'bedroom', 'caption' => 'Phòng ngủ Suite view đẹp'],
                ['url' => 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm Suite cao cấp'],
                ['url' => 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200', 'type' => 'view', 'caption' => 'Tầm nhìn tuyệt đẹp'],
                ['url' => 'https://images.unsplash.com/photo-1560449752-3fd4bdbe8df0?w=1200', 'type' => 'detail', 'caption' => 'Khu vực ăn uống riêng'],
            ],
            // Set C
            [
                ['url' => 'https://images.unsplash.com/photo-1598928506311-c55lez637e739?w=1200', 'type' => 'room', 'caption' => 'Suite - Thiết kế hiện đại'],
                ['url' => 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', 'type' => 'bedroom', 'caption' => 'Phòng ngủ ấm cúng'],
                ['url' => 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm thiết kế Nhật'],
                ['url' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200', 'type' => 'view', 'caption' => 'View resort từ suite'],
                ['url' => 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', 'type' => 'detail', 'caption' => 'Nội thất sang trọng'],
            ],
            // Set D
            [
                ['url' => 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200', 'type' => 'room', 'caption' => 'Suite - Phong cách hoàng gia'],
                ['url' => 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200', 'type' => 'bedroom', 'caption' => 'Phòng ngủ Master sang trọng'],
                ['url' => 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200', 'type' => 'bathroom', 'caption' => 'Bồn tắm ngâm thư giãn'],
                ['url' => 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200', 'type' => 'view', 'caption' => 'View thung lũng/biển'],
                ['url' => 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200', 'type' => 'detail', 'caption' => 'Minibar & tiện nghi'],
            ],
        ];

        $poolVillaSets = [
            // Set A - Tropical Villa
            [
                ['url' => 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', 'type' => 'room', 'caption' => 'Villa - Tổng quan & hồ bơi riêng'],
                ['url' => 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200', 'type' => 'bedroom', 'caption' => 'Phòng ngủ Master Villa'],
                ['url' => 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200', 'type' => 'bedroom2', 'caption' => 'Phòng ngủ phụ gia đình'],
                ['url' => 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm Villa sang trọng'],
                ['url' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'type' => 'view', 'caption' => 'Sân vườn & khuôn viên Villa'],
                ['url' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'type' => 'detail', 'caption' => 'Bếp & khu BBQ ngoài trời'],
            ],
            // Set B - Modern Villa
            [
                ['url' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200', 'type' => 'room', 'caption' => 'Villa hiện đại & hồ bơi vô cực'],
                ['url' => 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200', 'type' => 'bedroom', 'caption' => 'Phòng ngủ chính rộng rãi'],
                ['url' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200', 'type' => 'bedroom2', 'caption' => 'Phòng ngủ 2 cho gia đình'],
                ['url' => 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm Master Villa'],
                ['url' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', 'type' => 'view', 'caption' => 'Ngoại cảnh Villa'],
                ['url' => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', 'type' => 'detail', 'caption' => 'Phòng khách & bếp mở'],
            ],
            // Set C - Tropical Resort Villa
            [
                ['url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 'type' => 'room', 'caption' => 'Villa nhiệt đới & hồ bơi'],
                ['url' => 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200', 'type' => 'bedroom', 'caption' => 'Phòng ngủ Master thoáng mát'],
                ['url' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200', 'type' => 'bedroom2', 'caption' => 'Phòng ngủ phụ view vườn'],
                ['url' => 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm mở thiên nhiên'],
                ['url' => 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200', 'type' => 'view', 'caption' => 'Khuôn viên xanh mát'],
                ['url' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200', 'type' => 'detail', 'caption' => 'Khu vực thư giãn'],
            ],
            // Set D - Mountain/Countryside Villa
            [
                ['url' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'type' => 'room', 'caption' => 'Villa view núi & hồ bơi ấm'],
                ['url' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200', 'type' => 'bedroom', 'caption' => 'Phòng ngủ ấm cúng view thung lũng'],
                ['url' => 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', 'type' => 'bedroom2', 'caption' => 'Phòng ngủ 2 phong cách gỗ'],
                ['url' => 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200', 'type' => 'bathroom', 'caption' => 'Phòng tắm bồn ngâm'],
                ['url' => 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200', 'type' => 'view', 'caption' => 'View thiên nhiên hùng vĩ'],
                ['url' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'type' => 'detail', 'caption' => 'Bếp nấu & khu BBQ'],
            ],
        ];

        // Get all rooms from seeded accommodations (1-50), grouped by accommodation
        $rooms = DB::table('rooms')
            ->whereIn('accommodation_id', range(1, 50))
            ->orderBy('accommodation_id')
            ->orderBy('id')
            ->get();

        // Delete existing room images for these rooms
        $roomIds = $rooms->pluck('id')->toArray();
        DB::table('room_images')->whereIn('room_id', $roomIds)->delete();
        $this->command->info('  🗑️ Đã xóa ' . count($roomIds) . ' bộ ảnh phòng cũ');

        $insertCount = 0;
        $currentAccomId = null;
        $roomIndexInAccom = 0;
        $accomIndex = 0;

        foreach ($rooms as $room) {
            if ($room->accommodation_id !== $currentAccomId) {
                $currentAccomId = $room->accommodation_id;
                $roomIndexInAccom = 0;
                $accomIndex++;
            }

            // Determine which image set to use based on accommodation index
            $setIndex = ($accomIndex - 1) % 4;

            // Select correct image set based on room_type_code
            switch ($room->room_type_code) {
                case 'deluxe_king':
                    $imageSet = $deluxeKingSets[$setIndex];
                    break;
                case 'executive_suite':
                    $imageSet = $executiveSuiteSets[$setIndex];
                    break;
                case 'pool_villa':
                    $imageSet = $poolVillaSets[$setIndex];
                    break;
                default:
                    $imageSet = $deluxeKingSets[$setIndex];
            }

            // Insert new room images
            foreach ($imageSet as $order => $img) {
                DB::table('room_images')->insert([
                    'room_id' => $room->id,
                    'image_url' => $img['url'],
                    'image_type' => $img['type'],
                    'caption' => $img['caption'],
                    'display_order' => $order + 1,
                    'is_thumbnail' => ($order === 0) ? 1 : 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $insertCount++;
            }

            $roomIndexInAccom++;
        }

        $this->command->info("  ✅ Đã insert {$insertCount} ảnh phòng mới (riêng biệt cho mỗi hạng phòng)");
    }

    // ================================================================
    // TASK 1.5: Diversify Reviews
    // ================================================================
    private function diversifyReviews(): void
    {
        $this->command->info('⭐ Task 1.5: Đa dạng hóa reviews...');

        // Get all seeded reviews (those without booking_id, ID > 150)
        $seededReviews = DB::table('reviews')
            ->whereNull('booking_id')
            ->where('id', '>', 150)
            ->get();

        $comments = [
            'Không gian rừng thông tĩnh lặng, sáng sớm mở cửa ban công là sương mù bay vào tận phòng. Lò sưởi phòng ngủ ấm áp buổi tối, bữa sáng buffet rất phong phú.',
            'Villa thiết kế phong cách Pháp cổ điển rất có gu. Sân vườn hoa cẩm tú cầu ngập tràn sắc hương, ngồi uống trà chiều ngắm hoàng hôn thật lãng mạn.',
            'Phòng ốc thơm mùi tinh dầu gỗ thông tự nhiên, nệm êm ái ngủ một mạch tới sáng. Nước nóng mạnh và ổn định, WiFi nhanh.',
            'Vị trí yên tĩnh cách xa tiếng còi xe trung tâm, view thung lũng đèn lồng lung linh huyền ảo về đêm. Nhân viên rất thân thiện và nhiệt tình.',
            'Vị trí sát bờ biển cát trắng tuyệt đẹp, chỉ bước vài bước chân là ra đến bãi tắm riêng sạch tinh. Bồ câu bay lượn trên nền trời xanh ngắt.',
            'Hồ bơi vô cực ngắm hoàng hôn đẹp xuất sắc, không gian riêng tư đẳng cấp quốc tế. Nhân viên đón tiếp rất chuyên nghiệp và chu đáo.',
            'Phòng ngủ view ôm trọn đại dương bao la, thức dậy nghe tiếng sóng vỗ rì rào rất thư thái. Đồ ăn nhà hàng đa dạng và ngon miệng.',
            'Cơ sở nằm cạnh cánh đồng lúa xanh mượt thanh bình, mượn xe đạp dạo quanh làng quê tuyệt vời. Bữa sáng đậm vị truyền thống Việt Nam.',
            'Cảm giác bình yên tách biệt hoàn toàn với phố thị xô bồ. Bữa sáng với món đặc sản chuẩn vị truyền thống rất ngon.',
            'Hồ sen trước ban công thơm ngát, nhân viên thân thiện mỉm cười chào hỏi mỗi khi ra vào. Một nơi lưu trú tuyệt vời.',
            'Trải nghiệm tuyệt vời! Phòng sạch sẽ, view đẹp, dịch vụ chuyên nghiệp. Sẽ quay lại vào dịp tới.',
            'Resort rất đẹp, nhân viên phục vụ tận tâm. Hồ bơi sạch, phòng gym đầy đủ thiết bị. Bữa tối hải sản tươi sống ngon tuyệt.',
            'Kiến trúc villa hài hòa với thiên nhiên, kayak trên biển ngắm bình minh là trải nghiệm không thể quên.',
            'Phòng rộng rãi sạch sẽ, trang thiết bị hiện đại. Đặc biệt ấn tượng với dịch vụ spa và bồn tắm nước nóng khoáng thiên nhiên.',
        ];

        $positivePoints = [
            'Khung cảnh sớm mai thơ mộng, không khí trong lành và hoa cẩm tú cầu nở rực rỡ.',
            'Sân vườn rộng rãi, tiệc BBQ ngoài trời ấm cúng và sự hiếu khách của chủ nhà.',
            'Giường nệm êm ái chuẩn 5 sao, bồn tắm view đồi thông thư giãn tuyệt đối.',
            'Cảnh đêm thung lũng ngập tràn ánh đèn và bữa sáng ấm nóng.',
            'Bãi biển riêng sạch cát mịn, hồ bơi vô cực nước ấm ngắm trọn hoàng hôn.',
            'Dịch vụ chuẩn mực 5 sao, nước dừa tươi đón tiếp và hồ bơi vô cực hướng biển.',
            'Tiếng sóng biển thư thái, phong cách ấm tối và bữa tối hải sản tươi sống.',
            'Xe đạp miễn phí đi dạo phố cổ, không gian thanh bình ngát hương lúa.',
            'Bữa sáng đậm đà phong vị bản xứ và sự hiếu khách nồng hậu.',
            'Hương sen thanh tao đầu mùa và nụ cười ấm áp của đội ngũ phục vụ.',
            'Dịch vụ spa thư giãn tuyệt vời và view biển hoàng hôn tuyệt đẹp.',
            'Trải nghiệm chèo SUP ngắm bình minh trên biển và cảnh quan nhiệt đới xanh mát.',
        ];

        $updated = 0;
        foreach ($seededReviews as $index => $review) {
            // Randomize rating between 4.2 and 5.0
            $rating = round(rand(42, 50) / 10, 1);
            if ($rating > 5.0) $rating = 5.0;

            // Randomize breakdown
            $breakdown = [
                'cleanliness' => round(rand(42, 50) / 10, 1),
                'accuracy' => round(rand(45, 50) / 10, 1),
                'communication' => round(rand(45, 50) / 10, 1),
                'location' => round(rand(42, 50) / 10, 1),
                'checkin' => round(rand(45, 50) / 10, 1),
                'value' => round(rand(40, 50) / 10, 1),
                'positive_point' => $positivePoints[$index % count($positivePoints)],
            ];

            // Cap all values at 5.0
            foreach (['cleanliness', 'accuracy', 'communication', 'location', 'checkin', 'value'] as $key) {
                if ($breakdown[$key] > 5.0) $breakdown[$key] = 5.0;
            }

            // Recalculate average rating from breakdown
            $avgRating = round(
                ($breakdown['cleanliness'] + $breakdown['accuracy'] + $breakdown['communication'] +
                 $breakdown['location'] + $breakdown['checkin'] + $breakdown['value']) / 6,
                2
            );

            DB::table('reviews')
                ->where('id', $review->id)
                ->update([
                    'rating' => $avgRating,
                    'comment' => $comments[$index % count($comments)],
                    'rating_breakdown' => json_encode($breakdown),
                ]);
            $updated++;
        }

        // Also update room rating/reviews_count to more realistic values
        $rooms = DB::table('rooms')->whereIn('accommodation_id', range(1, 50))->get();
        foreach ($rooms as $room) {
            $roomReviews = DB::table('reviews')->where('room_id', $room->id)->get();
            if ($roomReviews->count() > 0) {
                $avgRating = round($roomReviews->avg('rating'), 2);
                DB::table('rooms')->where('id', $room->id)->update([
                    'rating' => $avgRating,
                    'reviews_count' => $roomReviews->count(),
                ]);
            }
        }

        $this->command->info("  ✅ Đã cập nhật {$updated} reviews với rating & comment đa dạng hơn");
    }
}

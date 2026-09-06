<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Room;
use App\Models\RoomImage;
use App\Models\Accommodation;
use App\Models\Amenity;

/**
 * UpdateDynamicRoomsSeeder
 * 
 * Tái cấu trúc số lượng hạng phòng trong Database:
 * - 1 phòng (Nguyên căn): Villa, Homestay, Cabin, Penthouse, Du thuyền (ID 51-56, 59...)
 * - 2 phòng: Khách sạn nội đô Hà Nội, Đà Lạt, Quy Nhơn, Vũng Tàu, Boutique hotels (IDs 4, 5, 10, 15, 21, 24, 25, 35, 36, 37, 38, 39, 40, 43, 44, 45, 48, 49)
 * - 3 phòng: Khách sạn 4-5 sao vừa, Eco-lodge, Resort vừa (IDs 3, 9, 12, 14, 17, 19, 20, 22, 23, 27, 29, 30, 32, 33, 42, 47, 50, 60)
 * - 4 phòng: Resort 5 sao cao cấp (IDs 1, 2, 8, 13, 16, 18, 28, 31, 34, 41, 46)
 * - 5 phòng: Flagship Mega Resorts Quốc Tế (IDs 6, 7, 11, 26)
 * - Homestay nhiều phòng riêng: Thêm/Cập nhật 1 Homestay có 3 phòng riêng (phòng mộc, phòng áp mái, phòng view đồi)
 */
class UpdateDynamicRoomsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Bắt đầu tái cấu trúc số lượng hạng phòng động trong Database...');

        // 1. Kho ảnh Unsplash chất lượng cao cho từng loại hạng phòng
        $imageSets = $this->getImageSets();

        // 2. Định nghĩa cấu hình phòng cho các nhóm cơ sở lưu trú
        $this->configureFlagshipMegaResorts($imageSets);   // 5 phòng: IDs 6, 7, 11, 26
        $this->configureLuxuryResorts($imageSets);          // 4 phòng: IDs 1, 2, 8, 13, 16, 18, 28, 31, 34, 41, 46
        $this->configureStandardResorts($imageSets);        // 3 phòng: IDs 3, 9, 12, 14, 17, 19, 20, 22, 23, 27, 29, 30, 32, 33, 42, 47, 50, 60
        $this->configureCityBoutiqueHotels($imageSets);     // 2 phòng: IDs 4, 5, 10, 15, 21, 24, 25, 35, 36, 37, 38, 39, 40, 43, 44, 45, 48, 49
        $this->configureMultiRoomHomestay($imageSets);      // Homestay 3 phòng riêng

        $this->command->info('✅ Hoàn thành tái cấu trúc hạng phòng động!');
    }

    /**
     * Danh mục bộ ảnh Unsplash cho từng loại phòng
     */
    private function getImageSets(): array
    {
        return [
            // Hạng phòng tiêu chuẩn / Superior / Classic
            'superior' => [
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop&q=80',
            ],
            // Hạng phòng Deluxe King
            'deluxe' => [
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&auto=format&fit=crop&q=80',
            ],
            // Hạng phòng Suite Cao Cấp
            'suite' => [
                'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
            ],
            // Hạng biệt thự hồ bơi riêng (Pool Villa)
            'pool_villa' => [
                'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80',
            ],
            // Hạng Biệt thự mặt biển / Lagoon Villa 2-3 phòng ngủ
            'beachfront_villa' => [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
            ],
            // Hạng Penthouse / Presidential Suite đẳng cấp nguyên tầng
            'presidential' => [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop&q=80',
            ],
            // Phòng Homestay phong cách mộc gỗ ấm cúng
            'homestay_cozy' => [
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=80',
            ],
        ];
    }

    /**
     * Flagship Mega Resorts: 5 hạng phòng (IDs: 6, 7, 11, 26)
     */
    private function configureFlagshipMegaResorts(array $images): void
    {
        $flagships = [
            6 => [
                'name' => 'JW Marriott Phu Quoc Resort',
                'rooms' => [
                    ['code' => 'deluxe_emerald', 'name' => 'Phòng Deluxe King Ban Công View Vịnh Ngọc', 'size' => 54, 'price' => 5800000, 'guests' => 2, 'beds' => 1, 'baths' => 1, 'inv' => 12, 'img' => $images['superior']],
                    ['code' => 'premier_ocean', 'name' => 'Phòng Premier Ocean King View Biển Trực Diện', 'size' => 68, 'price' => 7500000, 'guests' => 2, 'beds' => 1, 'baths' => 1, 'inv' => 8, 'img' => $images['deluxe']],
                    ['code' => 'emerald_suite', 'name' => 'Executive Suite 1 Phòng Ngủ Bồn Tắm View Biển', 'size' => 110, 'price' => 12500000, 'guests' => 3, 'beds' => 1, 'baths' => 1.5, 'inv' => 4, 'img' => $images['suite']],
                    ['code' => 'lagoon_pool_villa', 'name' => 'Biệt Thự 1 Phòng Ngủ Hồ Bơi Riêng Bên Bờ Biển', 'size' => 180, 'price' => 22000000, 'guests' => 2, 'beds' => 1, 'baths' => 2, 'inv' => 3, 'img' => $images['pool_villa']],
                    ['code' => 'presidential_villa', 'name' => 'Biệt Thự Tổng Thống Lamarck 3 Phòng Ngủ Sân Vườn Biển', 'size' => 450, 'price' => 65000000, 'guests' => 8, 'beds' => 4, 'baths' => 4, 'inv' => 1, 'img' => $images['beachfront_villa']],
                ]
            ],
            7 => [
                'name' => 'Regent Phu Quoc Resort',
                'rooms' => [
                    ['code' => 'ocean_suite', 'name' => 'Ocean View Suite Ban Công Toàn Cảnh', 'size' => 78, 'price' => 8200000, 'guests' => 2, 'beds' => 1, 'baths' => 1, 'inv' => 10, 'img' => $images['superior']],
                    ['code' => 'garden_pool_suite', 'name' => 'Garden Pool Suite Hồ Bơi Nước Ấm Sân Vườn', 'size' => 120, 'price' => 13500000, 'guests' => 2, 'beds' => 1, 'baths' => 1.5, 'inv' => 6, 'img' => $images['suite']],
                    ['code' => 'sky_pool_villa', 'name' => 'Sky Pool Villa Tầng Cao View Hoàng Hôn Bãi Dài', 'size' => 165, 'price' => 21000000, 'guests' => 3, 'beds' => 2, 'baths' => 2, 'inv' => 4, 'img' => $images['pool_villa']],
                    ['code' => 'lagoon_villa_2br', 'name' => 'Lagoon Pool Villa 2 Phòng Ngủ Lối Xuống Hồ Bơi Riêng', 'size' => 280, 'price' => 36000000, 'guests' => 5, 'beds' => 3, 'baths' => 3, 'inv' => 2, 'img' => $images['beachfront_villa']],
                    ['code' => 'beach_residence_4br', 'name' => 'Grand Beachfront Residence 4 Phòng Ngủ Hồ Bơi Vô Cực', 'size' => 650, 'price' => 95000000, 'guests' => 10, 'beds' => 5, 'baths' => 5, 'inv' => 1, 'img' => $images['presidential']],
                ]
            ],
            11 => [
                'name' => 'Four Seasons The Nam Hai Hoi An',
                'rooms' => [
                    ['code' => 'one_br_villa', 'name' => 'Biệt Thự 1 Phòng Ngủ Sân Vườn Nhiệt Đới', 'size' => 80, 'price' => 9500000, 'guests' => 2, 'beds' => 1, 'baths' => 1, 'inv' => 8, 'img' => $images['deluxe']],
                    ['code' => 'one_br_ocean_villa', 'name' => 'Biệt Thự 1 Phòng Ngủ Hướng Biển Hà My', 'size' => 80, 'price' => 12800000, 'guests' => 2, 'beds' => 1, 'baths' => 1, 'inv' => 6, 'img' => $images['superior']],
                    ['code' => 'one_br_pool_villa', 'name' => 'Biệt Thự 1 Phòng Ngủ Hồ Bơi Nước Ấm Riêng Biệt', 'size' => 125, 'price' => 18500000, 'guests' => 2, 'beds' => 1, 'baths' => 1.5, 'inv' => 4, 'img' => $images['pool_villa']],
                    ['code' => 'two_br_pool_villa', 'name' => 'Biệt Thự Gia Đình 2 Phòng Ngủ Hồ Bơi Sân Vườn', 'size' => 250, 'price' => 32000000, 'guests' => 5, 'beds' => 3, 'baths' => 2.5, 'inv' => 3, 'img' => $images['beachfront_villa']],
                    ['code' => 'three_br_ocean_pool', 'name' => 'Grand Beachfront Pool Villa 3 Phòng Ngủ Sát Biển', 'size' => 520, 'price' => 78000000, 'guests' => 8, 'beds' => 4, 'baths' => 4, 'inv' => 1, 'img' => $images['presidential']],
                ]
            ],
            26 => [
                'name' => 'InterContinental Danang Sun Peninsula Resort',
                'rooms' => [
                    ['code' => 'classic_ocean', 'name' => 'Phòng Classic King Oceanview Ban Công Đồi Sơn Trà', 'size' => 70, 'price' => 7900000, 'guests' => 2, 'beds' => 1, 'baths' => 1, 'inv' => 10, 'img' => $images['superior']],
                    ['code' => 'sontra_terrace', 'name' => 'Son Tra Terrace Suite Ban Công Rộng View Vịnh Biển', 'size' => 84, 'price' => 11500000, 'guests' => 2, 'beds' => 1, 'baths' => 1.5, 'inv' => 6, 'img' => $images['suite']],
                    ['code' => 'club_penthouse', 'name' => 'Club InterContinental Penthouse Tầng Thượng View 180°', 'size' => 170, 'price' => 24000000, 'guests' => 3, 'beds' => 1, 'baths' => 2, 'inv' => 3, 'img' => $images['presidential']],
                    ['code' => 'villa_on_rocks', 'name' => 'Seaside Villa On The Rocks Hồ Bơi Riêng Trên Ghềnh Đá', 'size' => 220, 'price' => 38000000, 'guests' => 4, 'beds' => 2, 'baths' => 2.5, 'inv' => 2, 'img' => $images['pool_villa']],
                    ['code' => 'sun_peninsula_residence', 'name' => 'Sun Peninsula Royal Residence 3 Phòng Ngủ Bãi Biển Riêng', 'size' => 700, 'price' => 110000000, 'guests' => 8, 'beds' => 4, 'baths' => 4, 'inv' => 1, 'img' => $images['beachfront_villa']],
                ]
            ],
        ];

        foreach ($flagships as $accId => $config) {
            $this->applyRoomsToAccommodation($accId, $config['rooms'], '5 Hạng phòng');
        }
    }

    /**
     * Luxury 5-Star Resorts: 4 hạng phòng (IDs: 1, 2, 8, 13, 16, 18, 28, 31, 34, 41, 46)
     */
    private function configureLuxuryResorts(array $images): void
    {
        $luxuryIds = [1, 2, 8, 13, 16, 18, 28, 31, 34, 41, 46];

        foreach ($luxuryIds as $accId) {
            $accom = DB::table('accommodations')->where('id', $accId)->first();
            if (!$accom) continue;

            $rooms = [
                [
                    'code' => 'superior_standard',
                    'name' => 'Phòng Superior Tiêu Chuẩn Giường King',
                    'size' => 42,
                    'price' => 2600000,
                    'guests' => 2,
                    'beds' => 1,
                    'baths' => 1,
                    'inv' => 10,
                    'img' => $images['superior']
                ],
                [
                    'code' => 'deluxe_balcony',
                    'name' => 'Phòng Deluxe Ban Công View Toàn Cảnh',
                    'size' => 52,
                    'price' => 3800000,
                    'guests' => 2,
                    'beds' => 1,
                    'baths' => 1,
                    'inv' => 8,
                    'img' => $images['deluxe']
                ],
                [
                    'code' => 'executive_suite',
                    'name' => 'Executive Suite 1 Phòng Ngủ & Phòng Khách Riêng',
                    'size' => 85,
                    'price' => 6200000,
                    'guests' => 3,
                    'beds' => 2,
                    'baths' => 1.5,
                    'inv' => 4,
                    'img' => $images['suite']
                ],
                [
                    'code' => 'presidential_villa',
                    'name' => ($accom->accommodation_type === 'resort' ? 'Biệt Thự Nghỉ Dưỡng Hồ Bơi Riêng 2 Phòng Ngủ' : 'Royal Heritage Penthouse Suite'),
                    'size' => 160,
                    'price' => 14500000,
                    'guests' => 5,
                    'beds' => 3,
                    'baths' => 2,
                    'inv' => 2,
                    'img' => ($accom->accommodation_type === 'resort' ? $images['pool_villa'] : $images['presidential'])
                ],
            ];

            $this->applyRoomsToAccommodation($accId, $rooms, '4 Hạng phòng');
        }
    }

    /**
     * Standard 4-Star Resorts & Hotels: 3 hạng phòng
     * IDs: 3, 9, 12, 14, 17, 19, 20, 22, 23, 27, 29, 30, 32, 33, 42, 47, 50, 60
     */
    private function configureStandardResorts(array $images): void
    {
        $standardIds = [3, 9, 12, 14, 17, 19, 20, 22, 23, 27, 29, 30, 32, 33, 42, 47, 50, 60];

        foreach ($standardIds as $accId) {
            $accom = DB::table('accommodations')->where('id', $accId)->first();
            if (!$accom) continue;

            $rooms = [
                [
                    'code' => 'deluxe_garden',
                    'name' => 'Phòng Deluxe Hướng Vườn & Đồi Thông',
                    'size' => 38,
                    'price' => 1950000,
                    'guests' => 2,
                    'beds' => 1,
                    'baths' => 1,
                    'inv' => 10,
                    'img' => $images['superior']
                ],
                [
                    'code' => 'premium_balcony',
                    'name' => 'Phòng Premium Ban Công Hướng Biển / Hồ',
                    'size' => 48,
                    'price' => 2850000,
                    'guests' => 2,
                    'beds' => 1,
                    'baths' => 1,
                    'inv' => 6,
                    'img' => $images['deluxe']
                ],
                [
                    'code' => 'family_suite',
                    'name' => 'Phòng Suite Gia Đình 2 Phòng Ngủ Bồn Tắm Sang Trọng',
                    'size' => 82,
                    'price' => 4800000,
                    'guests' => 4,
                    'beds' => 2,
                    'baths' => 2,
                    'inv' => 3,
                    'img' => $images['suite']
                ],
            ];

            $this->applyRoomsToAccommodation($accId, $rooms, '3 Hạng phòng');
        }
    }

    /**
     * City Hotels & Boutique Accommodations: 2 hạng phòng (Bỏ hẳn Pool Villa vô lý ở nội đô!)
     * IDs: 4, 5, 10, 15, 21, 24, 25, 35, 36, 37, 38, 39, 40, 43, 44, 45, 48, 49
     */
    private function configureCityBoutiqueHotels(array $images): void
    {
        $cityIds = [4, 5, 10, 15, 21, 24, 25, 35, 36, 37, 38, 39, 40, 43, 44, 45, 48, 49];

        foreach ($cityIds as $accId) {
            $accom = DB::table('accommodations')->where('id', $accId)->first();
            if (!$accom) continue;

            $isHanoiOrMetropole = in_array($accId, [36, 37, 38, 39, 40]);
            $isSapa = in_array($accId, [21, 24, 25]);

            if ($isHanoiOrMetropole) {
                $room1Name = 'Phòng Superior Classic Hướng Phố Cổ';
                $room2Name = 'Executive Suite 1 Phòng Ngủ Phong Cách Thuộc Địa Pháp';
            } elseif ($isSapa) {
                $room1Name = 'Phòng Deluxe King Ban Công View Thung Lũng Mường Hoa';
                $room2Name = 'Suite Hoàng Gia Tầng Cao View Đỉnh Fansipan';
            } else {
                $room1Name = 'Phòng Deluxe King Tiêu Chuẩn Hiện Đại';
                $room2Name = 'Phòng Executive Suite Ban Công Thành Phố';
            }

            $rooms = [
                [
                    'code' => 'deluxe_city',
                    'name' => $room1Name,
                    'size' => 36,
                    'price' => 1750000,
                    'guests' => 2,
                    'beds' => 1,
                    'baths' => 1,
                    'inv' => 15,
                    'img' => $images['superior']
                ],
                [
                    'code' => 'executive_city_suite',
                    'name' => $room2Name,
                    'size' => 65,
                    'price' => 3500000,
                    'guests' => 2,
                    'beds' => 1,
                    'baths' => 1.5,
                    'inv' => 5,
                    'img' => $images['suite']
                ],
            ];

            $this->applyRoomsToAccommodation($accId, $rooms, '2 Hạng phòng (Khách sạn nội đô)');
        }
    }

    /**
     * Thêm / Cấu hình Homestay có 3 phòng riêng (Cho thuê từng phòng riêng - Private Room)
     */
    private function configureMultiRoomHomestay(array $images): void
    {
        $homestay = DB::table('accommodations')
            ->where('accommodation_type', 'homestay')
            ->where('id', '!=', 53)
            ->first();

        if (!$homestay) {
            $hostId = DB::table('hosts')->value('id') ?? 1;
            $catId = DB::table('categories')->where('slug', 'homestay')->value('id') ?? 1;

            $newAccomId = DB::table('accommodations')->insertGetId([
                'host_id' => $hostId,
                'category_id' => $catId,
                'name_vi' => 'Tiệm Gỗ Mộc Homestay & Coffee Đà Lạt',
                'name_en' => 'Tiem Go Moc Homestay & Coffee Dalat',
                'accommodation_type' => 'homestay',
                'star_rating' => 4,
                'description' => 'Homestay gỗ mộc nép mình giữa triền đồi thông Đà Lạt. Mỗi phòng được thiết kế theo phong cách ấm cúng riêng biệt, phục vụ cà phê thủ công mỗi sáng và ban công ngắm mây mộng mơ.',
                'address' => '28 Đường Khởi Nghĩa Bắc Sơn, Phường 10, TP. Đà Lạt',
                'city' => 'Đà Lạt',
                'district' => 'Phường 10',
                'country' => 'Việt Nam',
                'latitude' => 11.9365,
                'longitude' => 108.4550,
                'distance_description' => 'Gần Dinh 2 · Cách trung tâm chợ đêm 2 km',
                'check_in_time' => '14:00:00',
                'check_out_time' => '12:00:00',
                'house_rules' => "• Không hút thuốc trong phòng kín\n• Giữ yên lặng chung sau 22:00\n• Không tổ chức tiệc ồn ào",
                'cancellation_policy' => 'Hủy miễn phí trước 48h nhận phòng.',
                'is_featured' => 1,
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $coverImgs = [
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200',
                'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200',
                'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200',
                'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200',
            ];
            foreach ($coverImgs as $oIdx => $url) {
                DB::table('accommodation_images')->insert([
                    'accommodation_id' => $newAccomId,
                    'image_url' => $url,
                    'caption' => 'Không gian Tiệm Gỗ Mộc',
                    'display_order' => $oIdx + 1,
                    'is_thumbnail' => ($oIdx === 0),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $targetId = $newAccomId;
        } else {
            $targetId = $homestay->id;
        }

        $rooms = [
            [
                'code' => 'phong_gac_mai',
                'name' => 'Phòng Gác Mái Mộc View Rừng Thông',
                'size' => 28,
                'price' => 750000,
                'guests' => 2,
                'beds' => 1,
                'baths' => 1,
                'inv' => 3,
                'space_type' => 'private_room',
                'img' => $images['homestay_cozy']
            ],
            [
                'code' => 'phong_cam_tu_cau',
                'name' => 'Phòng Ban Công Sân Vườn Hoa Cẩm Tú Cầu',
                'size' => 35,
                'price' => 950000,
                'guests' => 2,
                'beds' => 1,
                'baths' => 1,
                'inv' => 2,
                'space_type' => 'private_room',
                'img' => $images['superior']
            ],
            [
                'code' => 'phong_family_wood',
                'name' => 'Phòng Gia Đình Gỗ Ấm 2 Giường Đôi & Bếp Nhỏ',
                'size' => 50,
                'price' => 1500000,
                'guests' => 4,
                'beds' => 2,
                'baths' => 1,
                'inv' => 1,
                'space_type' => 'private_room',
                'img' => $images['suite']
            ],
        ];

        $this->applyRoomsToAccommodation($targetId, $rooms, 'Homestay 3 phòng riêng biệt');
    }

    /**
     * Áp dụng danh sách phòng cụ thể cho 1 Cơ sở lưu trú
     */
    private function applyRoomsToAccommodation(int $accommodationId, array $roomsConfig, string $label): void
    {
        $oldRoomIds = DB::table('rooms')->where('accommodation_id', $accommodationId)->pluck('id')->toArray();

        if (!empty($oldRoomIds)) {
            DB::table('room_images')->whereIn('room_id', $oldRoomIds)->delete();
            DB::table('room_amenity')->whereIn('room_id', $oldRoomIds)->delete();
            $bookedRoomIds = DB::table('bookings')->whereIn('room_id', $oldRoomIds)->pluck('room_id')->toArray();
            $safeToDelete = array_diff($oldRoomIds, $bookedRoomIds);
            if (!empty($safeToDelete)) {
                DB::table('rooms')->whereIn('id', $safeToDelete)->delete();
            }
        }

        $amenityIds = DB::table('amenities')->limit(6)->pluck('id')->toArray();

        foreach ($roomsConfig as $rIdx => $rItem) {
            $spaceType = $rItem['space_type'] ?? 'private_room';
            $roomId = DB::table('rooms')->insertGetId([
                'accommodation_id' => $accommodationId,
                'room_name_vi' => $rItem['name'],
                'room_name_en' => $rItem['name'],
                'room_type_code' => $rItem['code'],
                'space_type' => $spaceType,
                'description' => "Không gian {$rItem['name']} được trang bị đầy đủ tiện nghi cao cấp tiêu chuẩn, mang đến trải nghiệm nghỉ dưỡng hoàn hảo.",
                'room_size_m2' => $rItem['size'],
                'price_per_night' => $rItem['price'],
                'cleaning_fee' => round($rItem['price'] * 0.08, -4),
                'service_fee_percent' => 12.00,
                'max_guests' => $rItem['guests'],
                'bedrooms_count' => ($rItem['guests'] > 3 ? 2 : 1),
                'beds_count' => $rItem['beds'],
                'bathrooms_count' => $rItem['baths'],
                'total_inventory' => $rItem['inv'] ?? 2,
                'rating' => 4.95,
                'reviews_count' => rand(15, 60),
                'is_guest_favorite' => ($rIdx === 0),
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $photoUrls = $rItem['img'] ?? [];
            foreach ($photoUrls as $pIdx => $pUrl) {
                DB::table('room_images')->insert([
                    'room_id' => $roomId,
                    'image_url' => $pUrl,
                    'caption' => "{$rItem['name']} - Ảnh " . ($pIdx + 1),
                    'display_order' => $pIdx + 1,
                    'is_thumbnail' => ($pIdx === 0),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            foreach ($amenityIds as $aId) {
                DB::table('room_amenity')->insertOrIgnore([
                    'room_id' => $roomId,
                    'amenity_id' => $aId,
                ]);
            }
        }

        $this->command->line("  ✓ Accommodation #{$accommodationId}: Cập nhật thành công {$label} (" . count($roomsConfig) . " phòng)");
    }
}

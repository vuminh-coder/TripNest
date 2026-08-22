<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\User;
use App\Models\Host;
use App\Models\HostPayoutAccount;
use App\Models\Category;
use App\Models\Amenity;
use App\Models\Accommodation;
use App\Models\Room;
use App\Models\AccommodationImage;
use App\Models\RoomImage;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Wishlist;
use App\Models\Experience;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Categories (14 Danh mục)
        $categoriesData = [
            ['slug' => 'all', 'label_vi' => 'Tất cả chỗ ở', 'label_en' => 'All Homes', 'icon' => 'TbHomeCheck', 'display_order' => 1],
            ['slug' => 'beachfront', 'label_vi' => 'Bãi biển', 'label_en' => 'Beachfront', 'icon' => 'TbBeach', 'display_order' => 2],
            ['slug' => 'mansions', 'label_vi' => 'Biệt thự sang trọng', 'label_en' => 'Mansions', 'icon' => 'TbBuildingCastle', 'display_order' => 3],
            ['slug' => 'views', 'label_vi' => 'Tầm nhìn tuyệt đẹp', 'label_en' => 'Amazing views', 'icon' => 'TbMountain', 'display_order' => 4],
            ['slug' => 'pools', 'label_vi' => 'Hồ bơi vô cực', 'label_en' => 'Amazing pools', 'icon' => 'TbPool', 'display_order' => 5],
            ['slug' => 'cabins', 'label_vi' => 'Nhà gỗ & Rừng thông', 'label_en' => 'Cabins', 'icon' => 'TbHome2', 'display_order' => 6],
            ['slug' => 'trending', 'label_vi' => 'Thịnh hành nhất', 'label_en' => 'Trending', 'icon' => 'TbFlame', 'display_order' => 7],
            ['slug' => 'countryside', 'label_vi' => 'Miền quê yên bình', 'label_en' => 'Countryside', 'icon' => 'TbTrees', 'display_order' => 8],
            ['slug' => 'lakefront', 'label_vi' => 'Ven hồ lãng mạn', 'label_en' => 'Lakefront', 'icon' => 'TbSailboat', 'display_order' => 9],
            ['slug' => 'camping', 'label_vi' => 'Cắm trại & Glamping', 'label_en' => 'Camping', 'icon' => 'TbCampfire', 'display_order' => 10],
            ['slug' => 'tropical', 'label_vi' => 'Miền nhiệt đới', 'label_en' => 'Tropical', 'icon' => 'TbSun', 'display_order' => 11],
            ['slug' => 'iconic_cities', 'label_vi' => 'Thành phố biểu tượng', 'label_en' => 'Iconic cities', 'icon' => 'TbBuildingSkyscraper', 'display_order' => 12],
            ['slug' => 'luxe', 'label_vi' => 'Đẳng cấp Luxe', 'label_en' => 'Luxe Stays', 'icon' => 'TbCrown', 'display_order' => 13],
            ['slug' => 'experiences', 'label_vi' => 'Trải nghiệm du lịch', 'label_en' => 'Experiences', 'icon' => 'TbCompass', 'display_order' => 14],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[$c['slug']] = Category::create($c);
        }

        // 2. Seed Amenities (Danh mục tiện nghi)
        $amenitiesData = [
            ['code' => 'wifi', 'name_vi' => 'Wifi tốc độ cao (150 Mbps)', 'name_en' => 'Fast Wifi', 'icon' => 'TbWifi', 'target_type' => 'both', 'category' => 'basic'],
            ['code' => 'kitchen', 'name_vi' => 'Bếp nấu đầy đủ dụng cụ & gia vị', 'name_en' => 'Fully-equipped Kitchen', 'icon' => 'TbToolsKitchen2', 'target_type' => 'room', 'category' => 'basic'],
            ['code' => 'pool', 'name_vi' => 'Hồ bơi nước ấm vô cực', 'name_en' => 'Infinity Heated Pool', 'icon' => 'TbSwimming', 'target_type' => 'both', 'category' => 'luxury'],
            ['code' => 'bbq', 'name_vi' => 'Bếp nướng BBQ ngoài trời', 'name_en' => 'Outdoor BBQ Grill', 'icon' => 'TbFlame', 'target_type' => 'both', 'category' => 'standout'],
            ['code' => 'fireplace', 'name_vi' => 'Lò sưởi ấm cúng trong nhà', 'name_en' => 'Indoor Fireplace', 'icon' => 'TbFlame', 'target_type' => 'room', 'category' => 'standout'],
            ['code' => 'parking', 'name_vi' => 'Chỗ đỗ xe ô tô miễn phí tại chỗ', 'name_en' => 'Free Parking on Premises', 'icon' => 'TbCar', 'target_type' => 'accommodation', 'category' => 'basic'],
            ['code' => 'ac', 'name_vi' => 'Điều hòa & Máy sưởi hai chiều', 'name_en' => 'Air Conditioning & Heating', 'icon' => 'TbAirConditioning', 'target_type' => 'room', 'category' => 'basic'],
            ['code' => 'washer', 'name_vi' => 'Máy giặt & Máy sấy quần áo', 'name_en' => 'Washer & Dryer', 'icon' => 'TbWashMachine', 'target_type' => 'both', 'category' => 'basic'],
            ['code' => 'pet_friendly', 'name_vi' => 'Cho phép mang theo thú cưng', 'name_en' => 'Pet Friendly', 'icon' => 'TbPaw', 'target_type' => 'accommodation', 'category' => 'standout'],
            ['code' => 'workspace', 'name_vi' => 'Bàn làm việc chuyên dụng', 'name_en' => 'Dedicated Workspace', 'icon' => 'TbDeviceLaptop', 'target_type' => 'room', 'category' => 'basic'],
            ['code' => 'jacuzzi', 'name_vi' => 'Bồn tắm sục Jacuzzi ngoài trời', 'name_en' => 'Outdoor Hot Tub Jacuzzi', 'icon' => 'TbBath', 'target_type' => 'room', 'category' => 'luxury'],
            ['code' => 'private_beach', 'name_vi' => 'Lối đi thẳng ra bãi biển riêng', 'name_en' => 'Private Beach Access', 'icon' => 'TbBeach', 'target_type' => 'accommodation', 'category' => 'luxury'],
        ];

        $amenities = [];
        foreach ($amenitiesData as $a) {
            $amenities[$a['code']] = Amenity::create($a);
        }

        // 3. Seed Super Admin Account (Vũ Văn Minh)
        $adminAcc = Account::create([
            'email' => 'vuminh.admin@tripnest.vn',
            'password' => Hash::make('Admin@2026'),
            'google_id' => null,
            'google_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'account_id' => $adminAcc->id,
            'full_name' => 'Vũ Văn Minh',
            'phone_number' => '0988112233',
            'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'gender' => 'male',
            'date_of_birth' => '1996-08-15',
            'id_card_number' => '001098007788',
            'nationality' => 'Việt Nam',
            'address' => 'Hoàn Kiếm, Hà Nội',
            'bio' => 'Quản trị viên hệ thống nền tảng du lịch TripNest.',
        ]);

        // 4. Seed Guest Accounts
        $guestsData = [
            [
                'email' => 'thangbinh.travel@gmail.com',
                'password' => 'Guest@2026',
                'name' => 'Trịnh Thăng Bình',
                'phone' => '0903445566',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'id_card' => '079195004455',
                'address' => 'Quận 3, TP. Hồ Chí Minh',
                'status' => 'active',
                'bio' => 'Yêu thích du lịch trải nghiệm văn hóa và ẩm thực vùng miền.',
            ],
            [
                'email' => 'hoaian.vo@gmail.com',
                'password' => 'Guest@2026',
                'name' => 'Võ Hoài An',
                'phone' => '0938667788',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'id_card' => '031194002233',
                'address' => 'Vĩnh Hải, TP. Nha Trang',
                'status' => 'active',
                'bio' => 'Chuyên gia thiết kế nội thất và đam mê khám phá các homestay độc đáo.',
            ],
            [
                'email' => 'minhquan.banned@gmail.com',
                'password' => 'Guest@2026',
                'name' => 'Đỗ Minh Quân (Vi phạm)',
                'phone' => '0944889900',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                'id_card' => '001091008899',
                'address' => 'Cầu Giấy, Hà Nội',
                'status' => 'banned',
                'bio' => 'Tài khoản vi phạm quy chuẩn cộng đồng (Tạm khóa).',
            ],
        ];

        $createdGuests = [];
        foreach ($guestsData as $g) {
            $gAcc = Account::create([
                'email' => $g['email'],
                'password' => Hash::make($g['password']),
                'google_id' => null,
                'google_avatar' => $g['avatar'],
                'role' => 'guest',
                'status' => $g['status'],
                'email_verified_at' => now(),
            ]);

            $usr = User::create([
                'account_id' => $gAcc->id,
                'full_name' => $g['name'],
                'phone_number' => $g['phone'],
                'avatar_url' => $g['avatar'],
                'gender' => 'other',
                'id_card_number' => $g['id_card'],
                'nationality' => 'Việt Nam',
                'address' => $g['address'],
                'bio' => $g['bio'],
            ]);

            $createdGuests[] = $usr;
        }
        $guestUser = $createdGuests[0];

        // 5. Seed Verified Hosts with Bank Payout Accounts
        $hostsData = [
            [
                'email' => 'hoanglong.danang@gmail.com',
                'password' => 'Host@2026',
                'name' => 'Lê Hoàng Long',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Hoàng Long Ocean Villas',
                'phone' => '0915998877',
                'id_card' => '048192003344',
                'address' => 'Sơn Trà, TP. Đà Nẵng',
                'bio' => 'Hơn 8 năm quản lý và vận hành chuỗi biệt thự nghỉ dưỡng cao cấp view biển Đà Nẵng.',
                'rating' => 4.98,
                'reviews_count' => 345,
                'is_superhost' => true,
                'bank_name' => 'Vietcombank',
                'bank_code' => '970436',
                'bank_branch' => 'Chi nhánh Đà Nẵng',
                'account_number' => '0071009988776',
                'account_holder' => 'LE HOANG LONG',
            ],
            [
                'email' => 'bichphuong.sapa@gmail.com',
                'password' => 'Host@2026',
                'name' => 'Bùi Bích Phương',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Bích Phương Sapa Ecolodge',
                'phone' => '0972334455',
                'id_card' => '024196005566',
                'address' => 'TX. Sa Pa, Lào Cai',
                'bio' => 'Chủ chuỗi nhà gỗ sinh thái mộc mạc giữa thung lũng Mường Hoa Sa Pa.',
                'rating' => 4.96,
                'reviews_count' => 280,
                'is_superhost' => true,
                'bank_name' => 'Techcombank',
                'bank_code' => '970407',
                'bank_branch' => 'Chi nhánh Lào Cai',
                'account_number' => '1903388776655',
                'account_holder' => 'BUI BICH PHUONG',
            ],
            [
                'email' => 'thanhtruc.dalat@gmail.com',
                'password' => 'Host@2026',
                'name' => 'Phan Thanh Trúc',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Thanh Trúc Pine Villa Đà Lạt',
                'phone' => '0968112244',
                'id_card' => '001095033445',
                'address' => 'Phường 10, TP. Đà Lạt, Lâm Đồng',
                'bio' => 'Biệt thự đồi thông Đà Lạt với lò sưởi ấm cúng và sân vườn hoa cẩm tú cầu.',
                'rating' => 4.94,
                'reviews_count' => 195,
                'is_superhost' => true,
                'bank_name' => 'MB Bank',
                'bank_code' => '970422',
                'bank_branch' => 'Chi nhánh Đà Lạt',
                'account_number' => '0888666555444',
                'account_holder' => 'PHAN THANH TRUC',
            ],
            [
                'email' => 'minhtien.phuquoc@gmail.com',
                'password' => 'Host@2026',
                'name' => 'Đặng Minh Tiến',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Minh Tiến Sunset Beach Bungalow',
                'phone' => '0919223344',
                'id_card' => '091193005577',
                'address' => 'Bãi Trường, Dương Tơ, TP. Phú Quốc',
                'bio' => 'Trải nghiệm ngắm hoàng hôn tuyệt đẹp trên bờ biển cát trắng Phú Quốc.',
                'rating' => 4.92,
                'reviews_count' => 160,
                'is_superhost' => false,
                'bank_name' => 'ACB',
                'bank_code' => '970416',
                'bank_branch' => 'Chi nhánh Phú Quốc',
                'account_number' => '2345678988',
                'account_holder' => 'DANG MINH TIEN',
            ],
        ];

        $createdHosts = [];
        foreach ($hostsData as $h) {
            $acc = Account::create([
                'email' => $h['email'],
                'password' => Hash::make($h['password']),
                'google_id' => null,
                'google_avatar' => $h['avatar'],
                'role' => 'host',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $usr = User::create([
                'account_id' => $acc->id,
                'full_name' => $h['name'],
                'phone_number' => $h['phone'],
                'avatar_url' => $h['avatar'],
                'bio' => $h['bio'],
                'id_card_number' => $h['id_card'],
                'address' => $h['address'],
            ]);

            $host = Host::create([
                'user_id' => $usr->id,
                'host_display_name' => $h['display_name'],
                'host_avatar_url' => $h['avatar'],
                'host_introduction' => $h['bio'],
                'contact_phone' => $h['phone'],
                'contact_email' => $h['email'],
                'business_type' => 'individual',
                'id_card_number' => $usr->id_card_number,
                'id_card_front_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                'id_card_back_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                'kyc_status' => 'verified',
                'verified_at' => now(),
                'is_superhost' => $h['is_superhost'],
                'host_rating' => $h['rating'],
                'host_reviews_count' => $h['reviews_count'],
                'response_rate_percent' => 100,
                'response_time_text' => 'trong vòng 1 giờ',
                'terms_accepted_at' => now(),
            ]);

            HostPayoutAccount::create([
                'host_id' => $host->id,
                'account_type' => 'bank_transfer',
                'bank_name' => $h['bank_name'],
                'bank_code' => $h['bank_code'],
                'bank_branch' => $h['bank_branch'],
                'account_number' => $h['account_number'],
                'account_holder_name' => $h['account_holder'],
                'currency' => 'VND',
                'is_default' => true,
                'is_verified' => true,
            ]);

            $createdHosts[] = $host;
        }

        // 5. Seed 8 High-end Accommodations & Rooms with Real Images
        $accommodationsSeed = [
            [
                'host' => $createdHosts[0],
                'category' => $categories['views'],
                'name_vi' => 'Khu Nghỉ Dưỡng Biệt Thự Đỉnh Đồi Mây Ngàn Đà Lạt',
                'name_en' => 'Hilltop Pine Forest Cloud Villa Resort',
                'type' => 'villa',
                'city' => 'Đà Lạt',
                'address' => 'Đường Mimosa, Phường 10, Đà Lạt, Lâm Đồng',
                'distance' => 'Cách trung tâm 4.2 km',
                'star' => 5,
                'room' => [
                    'title_vi' => 'Biệt Thự Đỉnh Đồi View Rừng Thông & Mây Ngàn',
                    'title_en' => 'Hilltop Pine Forest Villa & Cloud View',
                    'type_code' => 'entire_villa',
                    'space_type' => 'entire_place',
                    'priceUSD' => 115,
                    'priceVND' => 2850000,
                    'rating' => 4.96,
                    'reviewsCount' => 128,
                    'isFavorite' => true,
                    'specs' => ['guests' => 8, 'bedrooms' => 4, 'beds' => 5, 'bathrooms' => 4.0],
                    'description' => 'Tọa lạc trên ngọn đồi yên bình bậc nhất Đà Lạt, căn biệt thự mang lối kiến trúc kính tràn viền giúp bạn đón bình minh cùng biển mây bồng bềnh mỗi sáng. Không gian riêng tư với sân vườn rộng rãi, khu BBQ ngoài trời và hồ bơi nước ấm thư giãn.',
                    'images' => [
                        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
                    ],
                    'amenity_codes' => ['wifi', 'kitchen', 'pool', 'bbq', 'fireplace', 'parking', 'ac', 'washer', 'pet_friendly', 'workspace'],
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 4.8, 'checkIn' => 5.0, 'value' => 4.9],
                ]
            ],
            [
                'host' => $createdHosts[1],
                'category' => $categories['beachfront'],
                'name_vi' => 'Thanh Hà Luxury Beachfront Resort & Spa Phú Quốc',
                'name_en' => 'Thanh Ha Luxury Beachfront Resort & Spa Phu Quoc',
                'type' => 'resort',
                'city' => 'Phú Quốc',
                'address' => 'Khu du lịch Bãi Dài, Gành Dầu, Phú Quốc, Kiên Giang',
                'distance' => 'Ngay sát mặt biển Bãi Dài',
                'star' => 5,
                'room' => [
                    'title_vi' => 'Luxury Beachfront Villa - Bãi Dài Phú Quốc',
                    'title_en' => 'Luxury Beachfront Villa - Long Beach',
                    'type_code' => 'entire_villa',
                    'space_type' => 'entire_place',
                    'priceUSD' => 185,
                    'priceVND' => 4600000,
                    'rating' => 4.98,
                    'reviewsCount' => 94,
                    'isFavorite' => true,
                    'specs' => ['guests' => 6, 'bedrooms' => 3, 'beds' => 3, 'bathrooms' => 3.0],
                    'description' => 'Tận hưởng vẻ đẹp nguyên sơ của biển Phú Quốc với biệt thự sang trọng sát biển. Từng góc nhỏ được bài trí tinh tế, hồ bơi riêng tư hướng trọn hoàng hôn buông lãng mạn.',
                    'images' => [
                        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop&q=80',
                    ],
                    'amenity_codes' => ['private_beach', 'pool', 'wifi', 'parking', 'ac', 'washer', 'jacuzzi'],
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 4.9, 'communication' => 5.0, 'location' => 5.0, 'checkIn' => 4.9, 'value' => 4.9],
                ]
            ],
            [
                'host' => $createdHosts[2],
                'category' => $categories['lakefront'],
                'name_vi' => 'Đội Tàu Du Thuyền Panorama Heritage Hạ Long',
                'name_en' => 'Panorama Heritage Cruise Fleet Ha Long',
                'type' => 'yacht',
                'city' => 'Hạ Long',
                'address' => 'Cảng tàu khách Quốc tế Tuần Châu, Hạ Long, Quảng Ninh',
                'distance' => 'Trên vịnh di sản thiên nhiên thế giới',
                'star' => 5,
                'room' => [
                    'title_vi' => 'Du Thuyền Panorama Ngắm Vịnh Hạ Long',
                    'title_en' => 'Panorama Yacht Cruise - Ha Long Bay',
                    'type_code' => 'entire_cabin',
                    'space_type' => 'entire_place',
                    'priceUSD' => 140,
                    'priceVND' => 3450000,
                    'rating' => 4.92,
                    'reviewsCount' => 156,
                    'isFavorite' => false,
                    'specs' => ['guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 2.0],
                    'description' => 'Trải nghiệm đẳng cấp nghỉ dưỡng 5 sao giữa kỳ quan thiên nhiên thế giới. Phòng ngủ có ban công kính ngắm trọn vẹn vẻ đẹp huyền ảo của Vịnh Hạ Long từ bình minh đến khi màn đêm buông xuống.',
                    'images' => [
                        'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&auto=format&fit=crop&q=80',
                    ],
                    'amenity_codes' => ['jacuzzi', 'ac', 'wifi', 'kitchen'],
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 4.9, 'communication' => 4.9, 'location' => 5.0, 'checkIn' => 4.9, 'value' => 4.8],
                ]
            ],
            [
                'host' => $createdHosts[3],
                'category' => $categories['mansions'],
                'name_vi' => 'Oia Sunset Cliff Cave Villas Santorini',
                'name_en' => 'Oia Sunset Cliff Cave Villas Santorini',
                'type' => 'villa',
                'city' => 'Santorini',
                'address' => 'Oia Village Cliffside, Santorini, Cyclades, Greece',
                'distance' => 'Vách đá Oia ngắm hoàng hôn Aegean',
                'star' => 5,
                'room' => [
                    'title_vi' => 'Santorini Sunset Cave Villa - Oia Cliff',
                    'title_en' => 'Santorini Sunset Cave Villa - Oia Cliff',
                    'type_code' => 'entire_cave_house',
                    'space_type' => 'entire_place',
                    'priceUSD' => 320,
                    'priceVND' => 7950000,
                    'rating' => 5.00,
                    'reviewsCount' => 88,
                    'isFavorite' => true,
                    'specs' => ['guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 2.0],
                    'description' => 'Căn biệt thự hang động biểu tượng nằm trên vách đá Oia tuyệt mỹ. Chiêm ngưỡng hoàng hôn trứ danh Santorini ngay từ bồn sục riêng tư của bạn với ly rượu vang địa phương thượng hạng.',
                    'images' => [
                        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&auto=format&fit=crop&q=80',
                    ],
                    'amenity_codes' => ['jacuzzi', 'wifi', 'kitchen', 'ac'],
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 5.0, 'checkIn' => 5.0, 'value' => 4.9],
                ]
            ],
            [
                'host' => $createdHosts[0],
                'category' => $categories['tropical'],
                'name_vi' => 'Ubud Rainforest Eco Bamboo Oasis',
                'name_en' => 'Ubud Rainforest Eco Bamboo Oasis',
                'type' => 'homestay',
                'city' => 'Bali',
                'address' => 'Jl. Raya Ubud, Gianyar, Bali, Indonesia',
                'distance' => 'Ẩn mình giữa rừng nhiệt đới Ubud',
                'star' => 5,
                'room' => [
                    'title_vi' => 'Eco Bamboo House & Private Waterfall Oasis',
                    'title_en' => 'Eco Bamboo House & Private Waterfall Oasis',
                    'type_code' => 'architectural_home',
                    'space_type' => 'entire_place',
                    'priceUSD' => 160,
                    'priceVND' => 3950000,
                    'rating' => 4.95,
                    'reviewsCount' => 215,
                    'isFavorite' => true,
                    'specs' => ['guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 2.0],
                    'description' => 'Ngôi nhà tre nghệ thuật độc bản nằm giữa thung lũng Ubud xanh mướt. Đắm mình trong bản hòa ca của thiên nhiên và dòng suối róc rách, tận hưởng sự thanh bình tuyệt đối.',
                    'images' => [
                        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
                    ],
                    'amenity_codes' => ['pool', 'wifi', 'kitchen', 'pet_friendly', 'workspace'],
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 4.9, 'checkIn' => 4.9, 'value' => 4.9],
                ]
            ],
            [
                'host' => $createdHosts[1],
                'category' => $categories['iconic_cities'],
                'name_vi' => 'Central Park Tower Panorama Luxury Penthouse',
                'name_en' => 'Central Park Tower Panorama Luxury Penthouse',
                'type' => 'apartment',
                'city' => 'New York',
                'address' => '217 W 57th St, Manhattan, New York, USA',
                'distance' => 'Tầm nhìn không giới hạn ôm trọn Central Park',
                'star' => 5,
                'room' => [
                    'title_vi' => 'Penthouse Manhattan Panorama - Central Park View',
                    'title_en' => 'Penthouse Manhattan Panorama - Central Park View',
                    'type_code' => 'entire_penthouse',
                    'space_type' => 'entire_place',
                    'priceUSD' => 450,
                    'priceVND' => 11200000,
                    'rating' => 4.97,
                    'reviewsCount' => 76,
                    'isFavorite' => false,
                    'specs' => ['guests' => 6, 'bedrooms' => 3, 'beds' => 3, 'bathrooms' => 3.5],
                    'description' => 'Căn Penthouse xa hoa bậc nhất trung tâm Manhattan với tầm nhìn không giới hạn ôm trọn Central Park và đường chân trời New York lộng lẫy về đêm.',
                    'images' => [
                        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80',
                    ],
                    'amenity_codes' => ['ac', 'wifi', 'parking', 'washer', 'workspace', 'jacuzzi'],
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 5.0, 'checkIn' => 5.0, 'value' => 4.8],
                ]
            ],
            [
                'host' => $createdHosts[2],
                'category' => $categories['cabins'],
                'name_vi' => 'H’Mông Valley Wooden Chalets Sa Pa',
                'name_en' => 'H’Mong Valley Wooden Chalets Sa Pa',
                'type' => 'cabin',
                'city' => 'Sa Pa',
                'address' => 'Bản Tả Van, Thị xã Sa Pa, Lào Cai',
                'distance' => 'View trực diện thung lũng ruộng bậc thang Mường Hoa',
                'star' => 5,
                'room' => [
                    'title_vi' => 'Nhà Gỗ Mộc Cổ Điển Rừng Thông Sa Pa',
                    'title_en' => 'Classic Wooden Chalet - Sa Pa Valley',
                    'type_code' => 'entire_chalet',
                    'space_type' => 'entire_place',
                    'priceUSD' => 85,
                    'priceVND' => 2100000,
                    'rating' => 4.94,
                    'reviewsCount' => 142,
                    'isFavorite' => true,
                    'specs' => ['guests' => 5, 'bedrooms' => 2, 'beds' => 3, 'bathrooms' => 2.0],
                    'description' => 'Chalet gỗ pơ mu cổ kính nằm e ấp bên sườn núi Tả Van, hướng thẳng ra thung lũng ruộng bậc thang Mường Hoa. Trải nghiệm tắm lá thuốc thư giãn và thưởng thức ẩm thực Tây Bắc chuẩn vị.',
                    'images' => [
                        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
                    ],
                    'amenity_codes' => ['fireplace', 'bbq', 'wifi', 'parking', 'pet_friendly'],
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 4.9, 'checkIn' => 5.0, 'value' => 4.9],
                ]
            ],
            [
                'host' => $createdHosts[3],
                'category' => $categories['countryside'],
                'name_vi' => 'Hội An Heritage Riverside Villa & Garden',
                'name_en' => 'Hoi An Heritage Riverside Villa & Garden',
                'type' => 'villa',
                'city' => 'Hội An',
                'address' => 'Cẩm Thanh, Thành phố Hội An, Quảng Nam',
                'distance' => 'Cách phố cổ Hội An 2 km',
                'star' => 5,
                'room' => [
                    'title_vi' => 'Hội An Heritage Riverside Villa & Garden',
                    'title_en' => 'Hoi An Heritage Riverside Villa & Garden',
                    'type_code' => 'heritage_villa',
                    'space_type' => 'entire_place',
                    'priceUSD' => 98,
                    'priceVND' => 2450000,
                    'rating' => 4.96,
                    'reviewsCount' => 165,
                    'isFavorite' => true,
                    'specs' => ['guests' => 6, 'bedrooms' => 3, 'beds' => 4, 'bathrooms' => 3.0],
                    'description' => 'Biệt thự kiến trúc Hội An truyền thống kết hợp tiện nghi hiện đại bên dòng sông êm đềm. Khám phá vẻ đẹp cổ kính với những chiếc xe đạp thong dong và khu vườn xanh mát.',
                    'images' => [
                        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80',
                    ],
                    'amenity_codes' => ['pool', 'wifi', 'kitchen', 'parking', 'ac', 'washer'],
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 4.9, 'communication' => 5.0, 'location' => 4.9, 'checkIn' => 5.0, 'value' => 4.9],
                ]
            ],
        ];

        $createdRooms = [];
        foreach ($accommodationsSeed as $item) {
            $accom = Accommodation::create([
                'host_id' => $item['host']->id,
                'category_id' => $item['category']->id,
                'name_vi' => $item['name_vi'],
                'name_en' => $item['name_en'],
                'accommodation_type' => $item['type'],
                'star_rating' => $item['star'],
                'description' => $item['room']['description'],
                'address' => $item['address'],
                'city' => $item['city'],
                'distance_description' => $item['distance'],
                'is_featured' => true,
                'status' => 'published',
            ]);

            $rData = $item['room'];
            $room = Room::create([
                'accommodation_id' => $accom->id,
                'room_name_vi' => $rData['title_vi'],
                'room_name_en' => $rData['title_en'],
                'room_type_code' => $rData['type_code'],
                'space_type' => $rData['space_type'],
                'description' => $rData['description'],
                'price_usd_per_night' => $rData['priceUSD'],
                'price_vnd_per_night' => $rData['priceVND'],
                'cleaning_fee_usd' => 30.00,
                'cleaning_fee_vnd' => 500000.00,
                'service_fee_percent' => 12.00,
                'max_guests' => $rData['specs']['guests'],
                'bedrooms_count' => $rData['specs']['bedrooms'],
                'beds_count' => $rData['specs']['beds'],
                'bathrooms_count' => $rData['specs']['bathrooms'],
                'rating' => $rData['rating'],
                'reviews_count' => $rData['reviewsCount'],
                'is_guest_favorite' => $rData['isFavorite'],
                'status' => 'available',
            ]);

            // Seed Room Images
            foreach ($rData['images'] as $idx => $imgUrl) {
                RoomImage::create([
                    'room_id' => $room->id,
                    'image_url' => $imgUrl,
                    'caption' => 'Góc nhìn ' . ($idx + 1) . ' - ' . $rData['title_vi'],
                    'display_order' => $idx + 1,
                    'is_thumbnail' => $idx === 0,
                ]);

                if ($idx < 2) {
                    AccommodationImage::create([
                        'accommodation_id' => $accom->id,
                        'image_url' => $imgUrl,
                        'caption' => 'Khuôn viên ' . $item['name_vi'],
                        'display_order' => $idx + 1,
                        'is_thumbnail' => $idx === 0,
                    ]);
                }
            }

            // Seed Amenities pivot
            foreach ($rData['amenity_codes'] as $code) {
                if (isset($amenities[$code])) {
                    $room->amenities()->attach($amenities[$code]->id);
                    $accom->amenities()->syncWithoutDetaching([$amenities[$code]->id]);
                }
            }

            $createdRooms[] = [
                'room' => $room,
                'radar' => $rData['radar'],
            ];
        }

        // 6. Seed Sample Bookings & Reviews for Demo User
        $firstRoom = $createdRooms[0]['room'];
        $firstRadar = $createdRooms[0]['radar'];

        $booking = Booking::create([
            'booking_code' => 'TN-892341',
            'user_id' => $guestUser->id,
            'room_id' => $firstRoom->id,
            'check_in_date' => '2026-10-15',
            'check_out_date' => '2026-10-20',
            'nights_count' => 5,
            'guests_count' => 4,
            'base_price' => $firstRoom->price_vnd_per_night * 5,
            'cleaning_fee' => 500000.00,
            'service_fee' => round($firstRoom->price_vnd_per_night * 5 * 0.12),
            'total_price' => ($firstRoom->price_vnd_per_night * 5) + 500000.00 + round($firstRoom->price_vnd_per_night * 5 * 0.12),
            'currency' => 'VND',
            'status' => 'confirmed',
            'special_requests' => 'Nhận phòng sớm nếu có thể, chuẩn bị thêm củi sưởi.',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'room_id' => $firstRoom->id,
            'user_id' => $guestUser->id,
            'rating_overall' => 5.0,
            'rating_cleanliness' => $firstRadar['cleanliness'],
            'rating_accuracy' => $firstRadar['accuracy'],
            'rating_communication' => $firstRadar['communication'],
            'rating_location' => $firstRadar['location'],
            'rating_checkin' => $firstRadar['checkIn'],
            'rating_value' => $firstRadar['value'],
            'comment' => 'Kỳ nghỉ trên cả tuyệt vời! View rừng thông và biển mây buổi sáng thực sự kỳ ảo. Chủ nhà Minh Hoàng rất nhiệt tình hỗ trợ.',
            'host_response' => 'Cảm ơn anh Đăng và gia đình đã tin tưởng lựa chọn biệt thự. Hẹn gặp lại anh trong chuyến đi Đà Lạt lần tới!',
            'host_responded_at' => now(),
        ]);

        // Seed Wishlists for Demo User
        Wishlist::create(['user_id' => $guestUser->id, 'room_id' => $createdRooms[0]['room']->id]);
        Wishlist::create(['user_id' => $guestUser->id, 'room_id' => $createdRooms[1]['room']->id]);
        Wishlist::create(['user_id' => $guestUser->id, 'room_id' => $createdRooms[3]['room']->id]);

        // 7. Seed 6 Experiences
        $experiencesData = [
            [
                'host_id' => $createdHosts[0]->id,
                'title_vi' => 'Tour Khám Phá Văn Hóa & Nghệ Thuật Ẩm Thực',
                'title_en' => 'Cultural Food Tour with Local Master Chefs',
                'caption' => 'Thưởng thức 8 món ăn đường phố di sản',
                'city' => 'Hà Nội & Phố Cổ',
                'country' => 'Việt Nam',
                'price_usd_per_person' => 45.00,
                'price_vnd_per_person' => 1100000.00,
                'rating' => 4.98,
                'reviews_count' => 240,
                'image_url' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 3.5,
            ],
            [
                'host_id' => $createdHosts[0]->id,
                'title_vi' => 'Lớp Học Pha Chế Cà Phê & Vẽ Tranh Nghệ Thuật',
                'title_en' => 'Coffee Brewing Masterclass & Paint & Sip',
                'caption' => 'Học pha cà phê Specialty và vẽ tranh canvas',
                'city' => 'Đà Lạt',
                'country' => 'Việt Nam',
                'price_usd_per_person' => 35.00,
                'price_vnd_per_person' => 850000.00,
                'rating' => 4.95,
                'reviews_count' => 180,
                'image_url' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 2.5,
            ],
            [
                'host_id' => $createdHosts[1]->id,
                'title_vi' => 'Tour Chèo SUP & Ngắm Hoàng Hôn Vịnh Biển',
                'title_en' => 'Sunset Paddleboarding & Coastal Hidden Caves',
                'caption' => 'Lặn ngắm san hô và chèo SUP hoàng hôn',
                'city' => 'Phú Quốc',
                'country' => 'Việt Nam',
                'price_usd_per_person' => 40.00,
                'price_vnd_per_person' => 990000.00,
                'rating' => 5.00,
                'reviews_count' => 310,
                'image_url' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 3.0,
            ],
            [
                'host_id' => $createdHosts[3]->id,
                'title_vi' => 'Lớp Học Nấu Ăn Ý & Rượu Vang Spritz Party',
                'title_en' => 'Italian Cooking Party & Authentic Spritz',
                'caption' => 'Tự tay làm Pasta tươi cùng đầu bếp Ý',
                'city' => 'Rome & Florence',
                'country' => 'Ý',
                'price_usd_per_person' => 65.00,
                'price_vnd_per_person' => 1600000.00,
                'rating' => 4.99,
                'reviews_count' => 450,
                'image_url' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 4.0,
            ],
            [
                'host_id' => $createdHosts[2]->id,
                'title_vi' => 'Đêm Kỳ Ảo: Ảo Thuật & Trò Chơi Mật Mã Tương Tác',
                'title_en' => 'Interactive Magic & Mystery Game Night',
                'caption' => 'Màn trình diễn ảo thuật tâm lý trực tiếp',
                'city' => 'London',
                'country' => 'Vương Quốc Anh',
                'price_usd_per_person' => 30.00,
                'price_vnd_per_person' => 750000.00,
                'rating' => 4.92,
                'reviews_count' => 190,
                'image_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 2.0,
            ],
            [
                'host_id' => $createdHosts[2]->id,
                'title_vi' => 'Khám Phá Kim Tự Tháp & Bí Ẩn Văn Minh Maya',
                'title_en' => 'Maya Civilization & Teotihuacan Exploration',
                'caption' => 'Chuyến phiêu lưu di tích lịch sử huyền bí',
                'city' => 'Mexico City',
                'country' => 'Mexico',
                'price_usd_per_person' => 55.00,
                'price_vnd_per_person' => 1350000.00,
                'rating' => 4.97,
                'reviews_count' => 160,
                'image_url' => 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 5.0,
            ],
        ];

        foreach ($experiencesData as $exp) {
            Experience::create($exp);
        }
    }
}

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
use App\Models\ExchangeRate;
use App\Models\Voucher;
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

        // 2.5 Seed Super Admin Account
        $adminAccount = Account::create([
            'email' => 'admin@tripnest.vn',
            'password' => Hash::make('123456'),
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $adminUser = User::create([
            'account_id' => $adminAccount->id,
            'full_name' => 'Quản Trị Viên TripNest',
            'phone_number' => '0988112233',
            'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'gender' => 'male',
            'date_of_birth' => '1990-01-01',
            'nationality' => 'Việt Nam',
            'id_card_number' => '001090000001',
            'address' => 'Hà Nội, Việt Nam',
            'bio' => 'Hệ thống Quản trị viên cấp cao của TripNest.',
        ]);

        // 3. Seed Demo Guest Account
        $guestAccount = Account::create([
            'email' => 'demo.traveler@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'guest',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $guestUser = User::create([
            'account_id' => $guestAccount->id,
            'full_name' => 'Nguyễn Hải Đăng',
            'phone_number' => '0912345678',
            'avatar_url' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            'gender' => 'male',
            'date_of_birth' => '1995-06-15',
            'nationality' => 'Việt Nam',
            'address' => 'Ba Đình, Hà Nội',
            'bio' => 'Người đam mê khám phá thiên nhiên và nhiếp ảnh du lịch.',
        ]);

        // 4. Seed Verified Hosts with Bank Payout Accounts
        // 4. Seed Verified Hosts across Vietnam regions
        $hostsData = [
            [
                'email' => 'minhhoang.dalat@gmail.com',
                'google_id' => 'google-host-100001',
                'name' => 'Minh Hoàng',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Minh Hoàng Đà Lạt',
                'phone' => '0987654321',
                'bio' => 'Yêu Đà Lạt và luôn mong muốn mang đến trải nghiệm nghỉ dưỡng ấm cúng nhất cho quý khách.',
                'rating' => 4.98,
                'reviews_count' => 310,
                'is_superhost' => true,
                'bank_name' => 'Vietcombank',
                'bank_code' => '970436',
                'bank_branch' => 'Chi nhánh Đà Lạt, Lâm Đồng',
                'account_number' => '0071001234567',
                'account_holder' => 'NGUYEN MINH HOANG',
            ],
            [
                'email' => 'thanhha.phuquoc@gmail.com',
                'google_id' => 'google-host-100002',
                'name' => 'Trần Thanh Hà',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Thanh Hà Resort Phú Quốc',
                'phone' => '0978901234',
                'bio' => 'Hệ thống biệt thự nghỉ dưỡng ven biển cao cấp tại đảo ngọc Phú Quốc.',
                'rating' => 4.97,
                'reviews_count' => 520,
                'is_superhost' => true,
                'bank_name' => 'Techcombank',
                'bank_code' => '970407',
                'bank_branch' => 'Chi nhánh Phú Quốc, Kiên Giang',
                'account_number' => '19033445566778',
                'account_holder' => 'TRAN THANH HA',
            ],
            [
                'email' => 'thuong.hoian@gmail.com',
                'google_id' => 'google-host-100003',
                'name' => 'Hoài Thương',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Hoài Thương Hội An',
                'phone' => '0981122334',
                'bio' => 'Đam mê bảo tồn kiến trúc cổ và văn hóa ẩm thực truyền thống Hội An.',
                'rating' => 4.99,
                'reviews_count' => 420,
                'is_superhost' => true,
                'bank_name' => 'VietinBank',
                'bank_code' => '970415',
                'bank_branch' => 'Chi nhánh Hội An, Quảng Nam',
                'account_number' => '102001928374',
                'account_holder' => 'LE HOAI THUONG',
            ],
            [
                'email' => 'hoangnam.nhatrang@gmail.com',
                'google_id' => 'google-host-100004',
                'name' => 'Hoàng Nam',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Hoàng Nam Nha Trang Stays',
                'phone' => '0971234888',
                'bio' => 'Cung cấp căn hộ & villa hướng vịnh biển Nha Trang thơ mộng.',
                'rating' => 4.95,
                'reviews_count' => 380,
                'is_superhost' => true,
                'bank_name' => 'BIDV',
                'bank_code' => '970418',
                'bank_branch' => 'Chi nhánh Nha Trang, Khánh Hòa',
                'account_number' => '60110000889922',
                'account_holder' => 'NGUYEN HOANG NAM',
            ],
            [
                'email' => 'haimy.sapa@gmail.com',
                'google_id' => 'google-host-100005',
                'name' => 'Hải My',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Hải My Sa Pa Ecolodges',
                'phone' => '0963334455',
                'bio' => 'Chuyên các khu nghỉ dưỡng nhà gỗ view thung lũng Mường Hoa Sa Pa.',
                'rating' => 4.96,
                'reviews_count' => 290,
                'is_superhost' => true,
                'bank_name' => 'Agribank',
                'bank_code' => '970405',
                'bank_branch' => 'Chi nhánh Sa Pa, Lào Cai',
                'account_number' => '8800205123456',
                'account_holder' => 'VUONG HAI MY',
            ],
            [
                'email' => 'ducthang.danang@gmail.com',
                'google_id' => 'google-host-100006',
                'name' => 'Đức Thắng',
                'avatar' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Đức Thắng Đà Nẵng Luxury',
                'phone' => '0935112233',
                'bio' => 'Đồng hành cùng trải nghiệm nghỉ dưỡng 5 sao bãi biển Mỹ Khê và Sơn Trà.',
                'rating' => 4.97,
                'reviews_count' => 460,
                'is_superhost' => true,
                'bank_name' => 'Techcombank',
                'bank_code' => '970407',
                'bank_branch' => 'Chi nhánh Đà Nẵng',
                'account_number' => '19022334455667',
                'account_holder' => 'TRAN DUC THANG',
            ],
            [
                'email' => 'quangvu.halong@gmail.com',
                'google_id' => 'google-host-100007',
                'name' => 'Quang Vũ',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Captain Quang Vũ Hạ Long',
                'phone' => '0961234567',
                'bio' => 'Thuyền trưởng 15 năm kinh nghiệm du thuyền 5 sao trên vịnh di sản Hạ Long.',
                'rating' => 4.93,
                'reviews_count' => 410,
                'is_superhost' => true,
                'bank_name' => 'MB Bank',
                'bank_code' => '970422',
                'bank_branch' => 'Chi nhánh Hạ Long, Quảng Ninh',
                'account_number' => '0888999777666',
                'account_holder' => 'VU QUANG VU',
            ],
            [
                'email' => 'thanhthuy.hanoi@gmail.com',
                'google_id' => 'google-host-100008',
                'name' => 'Thanh Thủy',
                'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Thanh Thủy Hà Nội Heritage',
                'phone' => '0918889900',
                'bio' => 'Khách sạn boutique & căn hộ phong cách Pháp cổ trung tâm thủ đô.',
                'rating' => 4.98,
                'reviews_count' => 510,
                'is_superhost' => true,
                'bank_name' => 'Vietcombank',
                'bank_code' => '970436',
                'bank_branch' => 'Chi nhánh Hoàn Kiếm, Hà Nội',
                'account_number' => '0011009988776',
                'account_holder' => 'NGUYEN THANH THUY',
            ],
            [
                'email' => 'nguyenphuong.quynhon@gmail.com',
                'google_id' => 'google-host-100009',
                'name' => 'Nguyên Phương',
                'avatar' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Nguyên Phương Quy Nhơn Beach',
                'phone' => '0945678123',
                'bio' => 'Khám phá thiên đường biển xanh Quy Nhơn cùng các resort cao cấp hàng đầu.',
                'rating' => 4.96,
                'reviews_count' => 330,
                'is_superhost' => true,
                'bank_name' => 'VPBank',
                'bank_code' => '970432',
                'bank_branch' => 'Chi nhánh Quy Nhơn, Bình Định',
                'account_number' => '1566889922',
                'account_holder' => 'LE NGUYEN PHUONG',
            ],
            [
                'email' => 'tuananh.vungtau@gmail.com',
                'google_id' => 'google-host-100010',
                'name' => 'Tuấn Anh',
                'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                'display_name' => 'Tuấn Anh Vũng Tàu Villas',
                'phone' => '0903332211',
                'bio' => 'Biệt thự nghỉ dưỡng view biển Bãi Sau và Long Hải tuyệt đẹp.',
                'rating' => 4.97,
                'reviews_count' => 405,
                'is_superhost' => true,
                'bank_name' => 'ACB',
                'bank_code' => '970416',
                'bank_branch' => 'Chi nhánh Vũng Tàu',
                'account_number' => '2244668899',
                'account_holder' => 'HOANG TUAN ANH',
            ]
        ];

        $createdHosts = [];
        foreach ($hostsData as $h) {
            $acc = Account::create([
                'email' => $h['email'],
                'password' => Hash::make('123456'),
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
                'id_card_number' => '0010950' . rand(10000, 99999),
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
                'account_number' => $h['account_number'],
                'account_holder_name' => $h['account_holder'],
                'is_default' => true,
                'is_verified' => true,
            ]);

            $createdHosts[] = $host;
        }

        // 5. Seed 50 Real Accommodations & 250 Images across Vietnam
        $this->call(HotelFullDatasetSeeder::class);

        // 5.5 Seed Sample Vouchers
        $voucherVip = Voucher::create([
            'code' => 'TRIPNESTVIP',
            'title' => 'Ưu đãi Đặc quyền Thành viên VIP TripNest',
            'description' => 'Giảm ngay 10% trên tổng tiền phòng cho đơn đặt phòng từ 1.000.000 ₫',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'min_booking_amount' => 1000000.00,
            'max_discount_amount' => 1000000.00,
            'usage_limit' => 500,
            'used_count' => 1,
            'start_date' => now()->subMonths(1)->toDateString(),
            'end_date' => now()->addMonths(6)->toDateString(),
            'is_active' => true,
        ]);

        $voucherWelcome = Voucher::create([
            'code' => 'WELCOME2026',
            'title' => 'Quà tặng chào mừng Khách hàng mới',
            'description' => 'Giảm trực tiếp 200.000 ₫ cho chuyến đi đầu tiên',
            'discount_type' => 'fixed',
            'discount_value' => 200000.00,
            'min_booking_amount' => 1500000.00,
            'usage_limit' => 1000,
            'used_count' => 0,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
            'is_active' => true,
        ]);

        // 6. Seed Sample Booking for Demo User
        $firstRoom = Room::first();
        if ($firstRoom) {
            $baseTotal = $firstRoom->price_per_night * 3;
            $discountAmount = $voucherVip->calculateDiscount($baseTotal);
            $serviceFee = round($baseTotal * 0.12);
            $cleaningFee = 350000.00;
            $totalPrice = $baseTotal + $cleaningFee + $serviceFee - $discountAmount;

            $booking = Booking::create([
                'booking_code' => 'TN-892341',
                'user_id' => $guestUser->id,
                'room_id' => $firstRoom->id,
                'check_in_date' => '2026-10-15',
                'check_out_date' => '2026-10-18',
                'nights_count' => 3,
                'guests_count' => 2,
                'price_per_night' => $firstRoom->price_per_night,
                'base_price' => $baseTotal,
                'cleaning_fee' => $cleaningFee,
                'service_fee' => $serviceFee,
                'discount_amount' => $discountAmount,
                'voucher_id' => $voucherVip->id,
                'total_price' => $totalPrice,
                'status' => 'confirmed',
                'special_requests' => 'Nhận phòng sớm nếu có thể, chuẩn bị phòng hoa chào mừng.',
            ]);

            // Seed Wishlists for Demo User
            Wishlist::create(['user_id' => $guestUser->id, 'room_id' => 1]);
            Wishlist::create(['user_id' => $guestUser->id, 'room_id' => 2]);
            Wishlist::create(['user_id' => $guestUser->id, 'room_id' => 6]);
        }

        // 7. Seed 6 Experiences
        $experiencesData = [
            [
                'host_id' => $createdHosts[0]->id,
                'title_vi' => 'Tour Khám Phá Văn Hóa & Nghệ Thuật Ẩm Thực',
                'caption' => 'Thưởng thức 8 món ăn đường phố di sản',
                'city' => 'Hà Nội & Phố Cổ',
                'price_per_person' => 1100000.00,
                'rating' => 4.98,
                'reviews_count' => 240,
                'image_url' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 3.5,
            ],
            [
                'host_id' => $createdHosts[0]->id,
                'title_vi' => 'Lớp Học Pha Chế Cà Phê & Vẽ Tranh Nghệ Thuật',
                'caption' => 'Học pha cà phê Specialty và vẽ tranh canvas',
                'city' => 'Đà Lạt',
                'price_per_person' => 850000.00,
                'rating' => 4.95,
                'reviews_count' => 180,
                'image_url' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 2.5,
            ],
            [
                'host_id' => $createdHosts[1]->id,
                'title_vi' => 'Tour Chèo SUP & Ngắm Hoàng Hôn Vịnh Biển',
                'caption' => 'Lặn ngắm san hô và chèo SUP hoàng hôn',
                'city' => 'Phú Quốc',
                'price_per_person' => 990000.00,
                'rating' => 5.00,
                'reviews_count' => 310,
                'image_url' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 3.0,
            ],
            [
                'host_id' => $createdHosts[3]->id,
                'title_vi' => 'Lớp Học Nấu Ăn Ý & Rượu Vang Spritz Party',
                'caption' => 'Tự tay làm Pasta tươi cùng đầu bếp Ý',
                'city' => 'Rome & Florence',
                'price_per_person' => 1600000.00,
                'rating' => 4.99,
                'reviews_count' => 450,
                'image_url' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 4.0,
            ],
            [
                'host_id' => $createdHosts[2]->id,
                'title_vi' => 'Đêm Kỳ Ảo: Ảo Thuật & Trò Chơi Mật Mã Tương Tác',
                'caption' => 'Màn trình diễn ảo thuật tâm lý trực tiếp',
                'city' => 'London',
                'price_per_person' => 750000.00,
                'rating' => 4.92,
                'reviews_count' => 190,
                'image_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 2.0,
            ],
            [
                'host_id' => $createdHosts[2]->id,
                'title_vi' => 'Khám Phá Kim Tự Tháp & Bí Ẩn Văn Minh Maya',
                'caption' => 'Chuyến phiêu lưu di tích lịch sử huyền bí',
                'city' => 'Mexico City',
                'price_per_person' => 1350000.00,
                'rating' => 4.97,
                'reviews_count' => 160,
                'image_url' => 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&auto=format&fit=crop&q=80',
                'duration_hours' => 5.0,
            ],
        ];

        foreach ($experiencesData as $exp) {
            Experience::create($exp);
        }

        // 8. Seed Exchange Rates (Tỷ giá quy đổi)
        ExchangeRate::create([
            'base_currency' => 'VND',
            'target_currency' => 'USD',
            'rate' => 25450.000000,
            'effective_date' => now()->toDateString(),
            'source' => 'manual',
            'is_active' => true,
        ]);
        ExchangeRate::create([
            'base_currency' => 'VND',
            'target_currency' => 'EUR',
            'rate' => 27800.000000,
            'effective_date' => now()->toDateString(),
            'source' => 'manual',
            'is_active' => true,
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\User;
use App\Models\Host;
use App\Models\HostPayoutAccount;
use App\Models\Accommodation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class HostAccountSeeder extends Seeder
{
    /**
     * Seed & chuẩn hóa toàn bộ 10 Đối tác Chủ nhà (Host) với mật khẩu 123456.
     */
    public function run(): void
    {
        $hostsData = [
            [
                'email' => 'minhhoang.dalat@gmail.com',
                'name' => 'Minh Hoàng',
                'display_name' => 'Minh Hoàng Đà Lạt',
                'phone' => '0987654321',
                'city' => 'Đà Lạt',
                'bio' => 'Yêu Đà Lạt và luôn mong muốn mang đến trải nghiệm nghỉ dưỡng ấm cúng nhất cho quý khách.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.98,
                'reviews_count' => 310,
                'is_superhost' => true,
                'bank_name' => 'Vietcombank',
                'account_number' => '0071001234567',
                'account_holder' => 'NGUYEN MINH HOANG',
            ],
            [
                'email' => 'thanhha.phuquoc@gmail.com',
                'name' => 'Trần Thanh Hà',
                'display_name' => 'Thanh Hà Resort Phú Quốc',
                'phone' => '0978901234',
                'city' => 'Phú Quốc',
                'bio' => 'Hệ thống biệt thự nghỉ dưỡng ven biển cao cấp tại đảo ngọc Phú Quốc.',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.97,
                'reviews_count' => 520,
                'is_superhost' => true,
                'bank_name' => 'Techcombank',
                'account_number' => '19033445566778',
                'account_holder' => 'TRAN THANH HA',
            ],
            [
                'email' => 'thuong.hoian@gmail.com',
                'name' => 'Hoài Thương',
                'display_name' => 'Hoài Thương Hội An',
                'phone' => '0981122334',
                'city' => 'Hội An',
                'bio' => 'Đam mê bảo tồn kiến trúc cổ và văn hóa ẩm thực truyền thống Hội An.',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.99,
                'reviews_count' => 420,
                'is_superhost' => true,
                'bank_name' => 'VietinBank',
                'account_number' => '102001928374',
                'account_holder' => 'LE HOAI THUONG',
            ],
            [
                'email' => 'hoangnam.nhatrang@gmail.com',
                'name' => 'Hoàng Nam',
                'display_name' => 'Hoàng Nam Nha Trang Stays',
                'phone' => '0971234888',
                'city' => 'Nha Trang',
                'bio' => 'Cung cấp căn hộ & villa hướng vịnh biển Nha Trang thơ mộng.',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.95,
                'reviews_count' => 380,
                'is_superhost' => true,
                'bank_name' => 'BIDV',
                'account_number' => '60110000889922',
                'account_holder' => 'NGUYEN HOANG NAM',
            ],
            [
                'email' => 'haimy.sapa@gmail.com',
                'name' => 'Hải My',
                'display_name' => 'Hải My Sa Pa Ecolodges',
                'phone' => '0963334455',
                'city' => 'Sa Pa',
                'bio' => 'Chuyên các khu nghỉ dưỡng nhà gỗ view thung lũng Mường Hoa Sa Pa.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.96,
                'reviews_count' => 290,
                'is_superhost' => true,
                'bank_name' => 'Agribank',
                'account_number' => '8800205123456',
                'account_holder' => 'VUONG HAI MY',
            ],
            [
                'email' => 'ducthang.danang@gmail.com',
                'name' => 'Đức Thắng',
                'display_name' => 'Đức Thắng Đà Nẵng Luxury',
                'phone' => '0935112233',
                'city' => 'Đà Nẵng',
                'bio' => 'Đồng hành cùng trải nghiệm nghỉ dưỡng 5 sao bãi biển Mỹ Khê và Sơn Trà.',
                'avatar' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.97,
                'reviews_count' => 460,
                'is_superhost' => true,
                'bank_name' => 'Techcombank',
                'account_number' => '19022334455667',
                'account_holder' => 'TRAN DUC THANG',
            ],
            [
                'email' => 'quangvu.halong@gmail.com',
                'name' => 'Quang Vũ',
                'display_name' => 'Captain Quang Vũ Hạ Long',
                'phone' => '0961234567',
                'city' => 'Hạ Long',
                'bio' => 'Thuyền trưởng 15 năm kinh nghiệm du thuyền 5 sao trên vịnh di sản Hạ Long.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.93,
                'reviews_count' => 410,
                'is_superhost' => true,
                'bank_name' => 'MB Bank',
                'account_number' => '0888999777666',
                'account_holder' => 'VU QUANG VU',
            ],
            [
                'email' => 'thanhthuy.hanoi@gmail.com',
                'name' => 'Thanh Thủy',
                'display_name' => 'Thanh Thủy Hà Nội Heritage',
                'phone' => '0918889900',
                'city' => 'Hà Nội',
                'bio' => 'Khách sạn boutique & căn hộ phong cách Pháp cổ trung tâm thủ đô.',
                'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.98,
                'reviews_count' => 510,
                'is_superhost' => true,
                'bank_name' => 'Vietcombank',
                'account_number' => '0011009988776',
                'account_holder' => 'NGUYEN THANH THUY',
            ],
            [
                'email' => 'nguyenphuong.quynhon@gmail.com',
                'name' => 'Nguyên Phương',
                'display_name' => 'Nguyên Phương Quy Nhơn Beach',
                'phone' => '0945678123',
                'city' => 'Quy Nhơn',
                'bio' => 'Khám phá thiên đường biển xanh Quy Nhơn cùng các resort cao cấp hàng đầu.',
                'avatar' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.96,
                'reviews_count' => 330,
                'is_superhost' => true,
                'bank_name' => 'VPBank',
                'account_number' => '1566889922',
                'account_holder' => 'LE NGUYEN PHUONG',
            ],
            [
                'email' => 'tuananh.vungtau@gmail.com',
                'name' => 'Tuấn Anh',
                'display_name' => 'Tuấn Anh Vũng Tàu Villas',
                'phone' => '0903332211',
                'city' => 'Vũng Tàu',
                'bio' => 'Biệt thự nghỉ dưỡng view biển Bãi Sau và Long Hải tuyệt đẹp.',
                'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.97,
                'reviews_count' => 405,
                'is_superhost' => true,
                'bank_name' => 'ACB',
                'account_number' => '2244668899',
                'account_holder' => 'HOANG TUAN ANH',
            ]
        ];

        DB::transaction(function () use ($hostsData) {
            foreach ($hostsData as $h) {
                // 1. Account (mật khẩu 123456)
                $account = Account::updateOrCreate(
                    ['email' => $h['email']],
                    [
                        'password' => Hash::make('123456'),
                        'role' => 'host',
                        'status' => 'active',
                        'email_verified_at' => now(),
                    ]
                );

                // 2. User
                $user = User::updateOrCreate(
                    ['account_id' => $account->id],
                    [
                        'full_name' => $h['name'],
                        'phone_number' => $h['phone'],
                        'avatar_url' => $h['avatar'],
                        'bio' => $h['bio'],
                        'id_card_number' => '0010950' . rand(10000, 99999),
                        'nationality' => 'Việt Nam',
                    ]
                );

                // 3. Host Profile (KYC verified)
                $host = Host::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'host_display_name' => $h['display_name'],
                        'host_avatar_url' => $h['avatar'],
                        'host_introduction' => $h['bio'],
                        'contact_phone' => $h['phone'],
                        'contact_email' => $h['email'],
                        'business_type' => 'individual',
                        'business_name' => $h['display_name'],
                        'id_card_number' => $user->id_card_number,
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
                    ]
                );

                // 4. Host Payout Account (STK Ngân Hàng)
                HostPayoutAccount::updateOrCreate(
                    ['host_id' => $host->id, 'is_default' => true],
                    [
                        'account_type' => 'bank_transfer',
                        'bank_name' => $h['bank_name'],
                        'account_number' => $h['account_number'],
                        'account_holder_name' => $h['account_holder'],
                        'is_default' => true,
                        'is_verified' => true,
                    ]
                );

                // 5. Liên kết các chỗ ở theo thành phố về host này
                Accommodation::where('city', $h['city'])->update(['host_id' => $host->id]);
            }

            // Đồng bộ toàn bộ mật khẩu tài khoản khác về 123456
            Account::where('status', 'active')->update(['password' => Hash::make('123456')]);
        });
    }
}

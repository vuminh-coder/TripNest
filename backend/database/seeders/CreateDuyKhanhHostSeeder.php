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

class CreateDuyKhanhHostSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Tạo hoặc cập nhật Account
            $account = Account::updateOrCreate(
                ['email' => 'duykhanh.halong@gmail.com'],
                [
                    'password' => Hash::make('Password@123'),
                    'role' => 'host',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            // 2. Tạo hoặc cập nhật User Profile
            $user = User::updateOrCreate(
                ['account_id' => $account->id],
                [
                    'full_name' => 'Duy Khánh',
                    'phone_number' => '0988668899',
                    'avatar_url' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                    'gender' => 'male',
                    'nationality' => 'Việt Nam',
                    'address' => 'Bãi Cháy, TP. Hạ Long, Quảng Ninh',
                    'bio' => 'Chủ nhà Siêu cấp với 10 năm kinh nghiệm vận hành biệt thự nghỉ dưỡng và du thuyền 5 sao tại Vịnh Hạ Long.',
                ]
            );

            // 3. Tạo hoặc cập nhật Host
            $host = Host::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'host_display_name' => 'Duy Khánh Hạ Long',
                    'host_avatar_url' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                    'host_introduction' => 'Chào mừng quý khách đến với kỳ quan thiên nhiên thế giới Vịnh Hạ Long!',
                    'languages_spoken' => ['Tiếng Việt', 'English'],
                    'contact_phone' => '0988668899',
                    'contact_email' => 'duykhanh.halong@gmail.com',
                    'emergency_phone' => '0988668899',
                    'business_type' => 'individual',
                    'id_card_number' => '001095089999',
                    'id_card_front_url' => 'https://example.com/kyc/duykhanh-front.jpg',
                    'id_card_back_url' => 'https://example.com/kyc/duykhanh-back.jpg',
                    'portrait_photo_url' => 'https://example.com/kyc/duykhanh-portrait.jpg',
                    'kyc_status' => 'verified',
                    'verified_at' => now(),
                    'is_superhost' => true,
                    'host_rating' => 4.99,
                    'host_reviews_count' => 186,
                    'response_rate_percent' => 100,
                    'response_time_text' => 'Trong vòng 15 phút',
                    'terms_accepted_at' => now(),
                ]
            );

            // 4. Tạo tài khoản nhận thanh toán Payout
            HostPayoutAccount::updateOrCreate(
                ['host_id' => $host->id, 'is_default' => true],
                [
                    'account_type' => 'bank_transfer',
                    'bank_name' => 'Vietcombank',
                    'account_number' => '0988668899',
                    'account_holder_name' => 'NGUYEN DUY KHANH',
                    'is_verified' => true,
                ]
            );

            // 5. Gán một số chỗ nghỉ ở Hạ Long cho Host Duy Khánh nếu chưa có
            $halongAccommodations = Accommodation::where('city', 'LIKE', '%Hạ Long%')
                ->orWhere('name_vi', 'LIKE', '%Hạ Long%')
                ->orWhere('name_vi', 'LIKE', '%Ha Long%')
                ->get();

            if ($halongAccommodations->isNotEmpty()) {
                foreach ($halongAccommodations as $accom) {
                    $accom->update(['host_id' => $host->id]);
                }
            }

            $this->command->info("Host duykhanh.halong@gmail.com created successfully with Host ID: {$host->id}");
        });
    }
}

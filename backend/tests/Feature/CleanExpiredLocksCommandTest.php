<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Account;
use App\Models\User;
use App\Models\Host;
use App\Models\Category;
use App\Models\Accommodation;
use App\Models\Room;
use App\Models\RoomLock;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CleanExpiredLocksCommandTest extends TestCase
{
    use DatabaseTransactions;

    protected $room;

    protected function setUp(): void
    {
        parent::setUp();

        $hostAccount = Account::create([
            'email' => 'host_clean_' . uniqid() . '@tripnest.vn',
            'role' => 'host',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $hostUser = User::create([
            'account_id' => $hostAccount->id,
            'full_name' => 'Host Clean Command',
            'phone_number' => '0988000111',
        ]);

        $host = Host::create([
            'user_id' => $hostUser->id,
            'host_display_name' => 'Host Clean Command',
            'contact_phone' => '0988000111',
            'id_card_number' => '001202005544',
            'id_card_front_url' => 'https://tripnest.vn/id_front.jpg',
            'id_card_back_url' => 'https://tripnest.vn/id_back.jpg',
            'kyc_status' => 'verified',
            'is_superhost' => true,
        ]);

        $category = Category::first() ?? Category::create([
            'label_vi' => 'Khách sạn',
            'label_en' => 'Hotel',
            'slug' => 'hotel-' . uniqid(),
            'icon' => 'TbBuilding',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $accommodation = Accommodation::create([
            'host_id' => $host->id,
            'category_id' => $category->id,
            'name_vi' => 'Khách Sạn Kiểm Thử Dọn Dẹp',
            'name_en' => 'Clean Command Hotel',
            'accommodation_type' => 'hotel',
            'star_rating' => 4,
            'description' => 'Khách sạn thử nghiệm lệnh dọn dẹp khóa phòng quá hạn',
            'status' => 'published',
            'city' => 'Hà Nội',
            'district' => 'Hoàn Kiếm',
            'country' => 'Việt Nam',
            'address' => '1 Phố Tràng Tiền',
        ]);

        $this->room = Room::create([
            'accommodation_id' => $accommodation->id,
            'room_name_vi' => 'Phòng Thử Nghiệm Clean Locks',
            'room_name_en' => 'Clean Locks Test Room',
            'description' => 'Mô tả phòng',
            'total_inventory' => 2,
            'price_per_night' => 1000000,
            'cleaning_fee' => 30000,
            'max_guests' => 2,
            'bedrooms_count' => 1,
            'beds_count' => 1,
            'bathrooms_count' => 1,
            'status' => 'available',
        ]);
    }

    /**
     * Test: Lệnh artisan tripnest:clean-expired-locks chỉ giải phóng các khóa đã quá hạn (expires_at < now())
     */
    public function test_clean_expired_locks_command_releases_only_expired_locks(): void
    {
        // 1. Tạo 1 lock ĐÃ HẾT HẠN (quá hạn 5 phút trước)
        $expiredLock = RoomLock::create([
            'room_id' => $this->room->id,
            'lock_token' => 'LOCK_EXP_' . uniqid(),
            'check_in_date' => '2026-10-01',
            'check_out_date' => '2026-10-03',
            'rooms_count' => 1,
            'expires_at' => now()->subMinutes(5),
            'status' => 'active',
        ]);

        // 2. Tạo 1 lock VẪN CÒN HẠN (còn 10 phút nữa mới hết hạn)
        $activeLock = RoomLock::create([
            'room_id' => $this->room->id,
            'lock_token' => 'LOCK_VALID_' . uniqid(),
            'check_in_date' => '2026-10-05',
            'check_out_date' => '2026-10-07',
            'rooms_count' => 1,
            'expires_at' => now()->addMinutes(10),
            'status' => 'active',
        ]);

        // 3. Thực thi command artisan
        $this->artisan('tripnest:clean-expired-locks')
            ->expectsOutputToContain('Đã quét và giải phóng')
            ->assertExitCode(0);

        // 4. Kiểm tra: lock quá hạn phải chuyển sang 'released'
        $expiredLock->refresh();
        $this->assertEquals('released', $expiredLock->status);

        // 5. Kiểm tra: lock còn hạn PHẢI giữ nguyên 'active'
        $activeLock->refresh();
        $this->assertEquals('active', $activeLock->status);
    }
}

<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Account;
use App\Models\User;
use App\Models\Host;
use App\Models\Category;
use App\Models\Accommodation;
use App\Models\Room;
use App\Models\Booking;
use App\Models\RoomLock;
use App\Services\RoomAvailabilityService;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class DynamicInventoryLimitTest extends TestCase
{
    use DatabaseTransactions;

    protected $room;
    protected $customer;
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(RoomAvailabilityService::class);

        $hostAccount = Account::create([
            'email' => 'host_inv_' . uniqid() . '@tripnest.vn',
            'role' => 'host',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $hostUser = User::create([
            'account_id' => $hostAccount->id,
            'full_name' => 'Host Inventory Test',
            'phone_number' => '0988555666',
        ]);

        $host = Host::create([
            'user_id' => $hostUser->id,
            'host_display_name' => 'Host Inventory Test',
            'contact_phone' => '0988555666',
            'id_card_number' => '001202004433',
            'id_card_front_url' => 'https://tripnest.vn/id_front.jpg',
            'id_card_back_url' => 'https://tripnest.vn/id_back.jpg',
            'kyc_status' => 'verified',
            'is_superhost' => true,
        ]);

        $category = Category::first() ?? Category::create([
            'label_vi' => 'Khách Sạn Sang Trọng',
            'label_en' => 'Luxury Hotel',
            'slug' => 'luxury-hotel-' . uniqid(),
            'icon' => 'TbBuilding',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $accommodation = Accommodation::create([
            'host_id' => $host->id,
            'category_id' => $category->id,
            'name_vi' => 'Khách Sạn Kiểm Thử Tồn Kho',
            'name_en' => 'Inventory Hotel',
            'accommodation_type' => 'hotel',
            'star_rating' => 5,
            'description' => 'Khách sạn kiểm thử giới hạn tồn kho động',
            'status' => 'published',
            'city' => 'TP. Hồ Chí Minh',
            'district' => 'Quận 1',
            'country' => 'Việt Nam',
            'address' => '100 Đường Lê Lợi',
        ]);

        $custAccount = Account::create([
            'email' => 'cust_inv_' . uniqid() . '@tripnest.vn',
            'role' => 'guest',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $this->customer = User::create([
            'account_id' => $custAccount->id,
            'full_name' => 'Khách Kiểm Thử Tồn Kho',
            'phone_number' => '0911777888',
        ]);

        // Phòng có tổng tồn kho 5 phòng
        $this->room = Room::create([
            'accommodation_id' => $accommodation->id,
            'room_name_vi' => 'Executive Suite 5 Phòng',
            'room_name_en' => 'Executive Suite 5 Units',
            'description' => 'Mô tả phòng có 5 tồn kho',
            'total_inventory' => 5,
            'price_per_night' => 3000000,
            'cleaning_fee' => 100000,
            'max_guests' => 3,
            'bedrooms_count' => 1,
            'beds_count' => 2,
            'bathrooms_count' => 1,
            'status' => 'available',
        ]);
    }

    /**
     * Test 1: Tồn kho khả dụng giảm chính xác khi có đơn booking confirmed
     */
    public function test_remaining_inventory_decreases_with_confirmed_bookings(): void
    {
        $checkIn = '2026-12-10';
        $checkOut = '2026-12-15';

        // Tạo 2 đơn booking confirmed
        Booking::create([
            'booking_code' => 'BK_' . substr(md5(uniqid()), 0, 10),
            'user_id' => $this->customer->id,
            'room_id' => $this->room->id,
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'nights_count' => 5,
            'guests_count' => 2,
            'price_per_night' => 3000000,
            'base_price' => 15000000,
            'total_price' => 15000000,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        Booking::create([
            'booking_code' => 'BK_' . substr(md5(uniqid()), 0, 10),
            'user_id' => $this->customer->id,
            'room_id' => $this->room->id,
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'nights_count' => 5,
            'guests_count' => 2,
            'price_per_night' => 3000000,
            'base_price' => 15000000,
            'total_price' => 15000000,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        // Kiểm tra availability: 5 - 2 = 3 phòng
        $avail = $this->service->checkRoomAvailability($this->room->id, $checkIn, $checkOut);

        $this->assertTrue($avail['is_available']);
        $this->assertEquals('available', $avail['status']);
        $this->assertEquals(5, $avail['total_inventory']);
        $this->assertEquals(2, $avail['booked_count']);
        $this->assertEquals(0, $avail['held_count']);
        $this->assertEquals(3, $avail['remaining_inventory']);
    }

    /**
     * Test 2: Tồn kho giảm đồng thời bởi cả booking confirmed và active hold lock
     */
    public function test_remaining_inventory_decreases_with_active_hold_locks(): void
    {
        $checkIn = '2026-12-20';
        $checkOut = '2026-12-23';

        // 1 confirmed booking
        Booking::create([
            'booking_code' => 'BK_' . substr(md5(uniqid()), 0, 10),
            'user_id' => $this->customer->id,
            'room_id' => $this->room->id,
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'nights_count' => 3,
            'guests_count' => 2,
            'price_per_night' => 3000000,
            'base_price' => 9000000,
            'total_price' => 9000000,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        // 2 active hold locks (mỗi lock giữ 1 phòng)
        RoomLock::create([
            'room_id' => $this->room->id,
            'lock_token' => 'LOCK_HOLD_1_' . uniqid(),
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'rooms_count' => 1,
            'expires_at' => now()->addMinutes(15),
            'status' => 'active',
        ]);

        RoomLock::create([
            'room_id' => $this->room->id,
            'lock_token' => 'LOCK_HOLD_2_' . uniqid(),
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'rooms_count' => 1,
            'expires_at' => now()->addMinutes(15),
            'status' => 'active',
        ]);

        // 5 - 1 (booking) - 2 (locks) = 2 remaining
        $avail = $this->service->checkRoomAvailability($this->room->id, $checkIn, $checkOut);

        $this->assertTrue($avail['is_available']);
        $this->assertEquals(2, $avail['remaining_inventory']);
        $this->assertEquals(1, $avail['booked_count']);
        $this->assertEquals(2, $avail['held_count']);
    }

    /**
     * Test 3: Cố gắng đặt hoặc giữ quá số lượng tồn kho còn lại sẽ bị từ chối
     */
    public function test_hold_fails_when_requesting_more_than_remaining_inventory(): void
    {
        $checkIn = '2026-12-25';
        $checkOut = '2026-12-28';

        // Giữ 4 phòng trước
        $this->service->createHoldLock(
            $this->room->id,
            $checkIn,
            $checkOut,
            $this->customer->id,
            4,
            15
        );

        // Tồn kho còn 1 (5 - 4). Khách khác yêu cầu 2 phòng -> Phải fail
        $avail = $this->service->checkRoomAvailability($this->room->id, $checkIn, $checkOut, null, null, 2);

        $this->assertFalse($avail['is_available']);
        $this->assertEquals(1, $avail['remaining_inventory']);
    }

    /**
     * Test 4: Trạng thái phòng chuyển sang 'held' khi toàn bộ số phòng còn lại bị chiếm bởi hold locks
     */
    public function test_room_status_becomes_held_when_all_rooms_are_locked(): void
    {
        $checkIn = '2027-01-05';
        $checkOut = '2027-01-10';

        // Khách khác tạm giữ toàn bộ 5 phòng
        $this->service->createHoldLock(
            $this->room->id,
            $checkIn,
            $checkOut,
            $this->customer->id,
            5,
            15
        );

        $avail = $this->service->checkRoomAvailability($this->room->id, $checkIn, $checkOut);

        $this->assertFalse($avail['is_available']);
        $this->assertEquals('held', $avail['status']);
        $this->assertEquals(0, $avail['remaining_inventory']);
        $this->assertGreaterThan(0, $avail['held_seconds_left']);
    }
}

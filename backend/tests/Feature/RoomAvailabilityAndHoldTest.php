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

class RoomAvailabilityAndHoldTest extends TestCase
{
    use DatabaseTransactions;

    protected $user;
    protected $category;
    protected $accommodation;
    protected $room;
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(RoomAvailabilityService::class);

        // 1. Host Account & User & Host model
        $hostAccount = Account::create([
            'email' => 'test_host_' . uniqid() . '@tripnest.vn',
            'role' => 'host',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $hostUser = User::create([
            'account_id' => $hostAccount->id,
            'full_name' => 'Chủ Nhà Kiểm Thử',
            'phone_number' => '0988111222',
        ]);

        $host = Host::create([
            'user_id' => $hostUser->id,
            'host_display_name' => 'Chủ Nhà Kiểm Thử',
            'contact_phone' => '0988111222',
            'id_card_number' => '001202009988',
            'id_card_front_url' => 'https://tripnest.vn/id_front.jpg',
            'id_card_back_url' => 'https://tripnest.vn/id_back.jpg',
            'kyc_status' => 'verified',
            'is_superhost' => true,
        ]);

        // 2. Customer Account & User
        $customerAccount = Account::create([
            'email' => 'test_customer_' . uniqid() . '@tripnest.vn',
            'role' => 'guest',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $this->user = User::create([
            'account_id' => $customerAccount->id,
            'full_name' => 'Khách Hàng Kiểm Thử',
            'phone_number' => '0911222333',
        ]);

        // 3. Category
        $this->category = Category::first() ?? Category::create([
            'label_vi' => 'Homestay Kiểm Thử',
            'label_en' => 'Homestay Test',
            'slug' => 'homestay-test-' . uniqid(),
            'icon' => 'TbHome',
            'display_order' => 1,
            'is_active' => true,
        ]);

        // 4. Accommodation
        $this->accommodation = Accommodation::create([
            'host_id' => $host->id,
            'category_id' => $this->category->id,
            'name_vi' => 'Chỗ ở kiểm thử phòng trống',
            'name_en' => 'Test Accommodation',
            'accommodation_type' => 'homestay',
            'star_rating' => 5,
            'description' => 'Không gian nghỉ dưỡng phục vụ bài test kiểm thử',
            'status' => 'published',
            'city' => 'Đà Lạt',
            'district' => 'Phường 10',
            'country' => 'Việt Nam',
            'address' => '123 Đường Hoa Hồng',
        ]);

        // 5. Room
        $this->room = Room::create([
            'accommodation_id' => $this->accommodation->id,
            'room_name_vi' => 'Phòng Deluxe Ban Công',
            'room_name_en' => 'Deluxe Balcony Room',
            'description' => 'Phòng cao cấp đầy đủ tiện nghi view đồi thông',
            'price_per_night' => 1500000.00,
            'cleaning_fee' => 50000.00,
            'max_guests' => 2,
            'total_inventory' => 1,
            'status' => 'available',
        ]);
    }

    public function test_room_is_available_when_no_bookings_or_holds_exist()
    {
        $result = $this->service->checkRoomAvailability(
            $this->room->id,
            '2026-10-10',
            '2026-10-15'
        );

        $this->assertTrue($result['is_available']);
        $this->assertEquals(1, $result['remaining_inventory']);
        $this->assertEquals('available', $result['status']);
        $this->assertEquals(0, $result['booked_count']);
        $this->assertEquals(0, $result['held_count']);
    }

    public function test_room_collision_detection_for_overlapping_dates()
    {
        // 1. Khách A đặt phòng từ ngày 10/10 đến 15/10
        Booking::create([
            'booking_code' => 'BK-' . rand(100000, 999999),
            'user_id' => $this->user->id,
            'room_id' => $this->room->id,
            'check_in_date' => '2026-10-10',
            'check_out_date' => '2026-10-15',
            'nights_count' => 5,
            'guests_count' => 2,
            'price_per_night' => 1500000,
            'base_price' => 7500000,
            'total_price' => 7500000,
            'status' => 'confirmed',
        ]);

        // 2. Khách B kiểm tra phòng ngày 12/10 đến 14/10 (Trùng ở giữa) -> Phải BÁO KÍN PHÒNG
        $resOverlap = $this->service->checkRoomAvailability(
            $this->room->id,
            '2026-10-12',
            '2026-10-14'
        );
        $this->assertFalse($resOverlap['is_available']);
        $this->assertEquals('booked', $resOverlap['status']);
        $this->assertEquals(0, $resOverlap['remaining_inventory']);

        // 3. Khách C kiểm tra ngày 05/10 đến 10/10 (Check-out trùng Check-in) -> Phải CÒN PHÒNG (Standard hotel overlap rule)
        $resBefore = $this->service->checkRoomAvailability(
            $this->room->id,
            '2026-10-05',
            '2026-10-10'
        );
        $this->assertTrue($resBefore['is_available']);

        // 4. Khách D kiểm tra ngày 15/10 đến 20/10 (Check-in trùng Check-out) -> Phải CÒN PHÒNG
        $resAfter = $this->service->checkRoomAvailability(
            $this->room->id,
            '2026-10-15',
            '2026-10-20'
        );
        $this->assertTrue($resAfter['is_available']);
    }

    public function test_hold_lock_prevents_race_condition_during_checkout()
    {
        // 1. Tạm khóa phòng 15 phút
        $hold = $this->service->createHoldLock(
            $this->room->id,
            '2026-11-01',
            '2026-11-05',
            $this->user->id,
            1,
            15
        );

        $this->assertTrue($hold['success']);
        $this->assertNotNull($hold['lock_token']);

        // 2. Khách khác vào kiểm tra ngày 02/11 đến 04/11 -> Phải báo đang giữ chỗ
        $res = $this->service->checkRoomAvailability(
            $this->room->id,
            '2026-11-02',
            '2026-11-04'
        );

        $this->assertFalse($res['is_available']);
        $this->assertEquals('held', $res['status']);
        $this->assertEquals(1, $res['held_count']);

        // 3. Nhả khóa phòng (Release hold)
        $released = $this->service->releaseLock($hold['lock_token']);
        $this->assertTrue($released);

        // 4. Kiểm tra lại -> Phòng đã mở trống trở lại
        $resAfterRelease = $this->service->checkRoomAvailability(
            $this->room->id,
            '2026-11-02',
            '2026-11-04'
        );
        $this->assertTrue($resAfterRelease['is_available']);
    }

    public function test_booking_store_endpoint_returns_409_on_collision()
    {
        // 1. Kiểm tra API công khai check-availability
        $checkRes = $this->postJson('/api/bookings/check-availability', [
            'room_id' => $this->room->id,
            'check_in_date' => '2026-12-01',
            'check_out_date' => '2026-12-05',
        ]);
        $checkRes->assertStatus(200);
        $checkRes->assertJson([
            'success' => true,
            'availability' => [
                'is_available' => true,
            ],
        ]);

        // 2. Đặt phòng ngày 2026-12-01 đến 2026-12-05
        Booking::create([
            'booking_code' => 'BK-' . rand(100000, 999999),
            'user_id' => $this->user->id,
            'room_id' => $this->room->id,
            'check_in_date' => '2026-12-01',
            'check_out_date' => '2026-12-05',
            'nights_count' => 4,
            'guests_count' => 2,
            'price_per_night' => 1500000,
            'base_price' => 6000000,
            'total_price' => 6000000,
            'status' => 'confirmed',
        ]);

        // 3. Kiểm tra lại qua check-availability -> Báo đã có khách đặt
        $checkResConflict = $this->postJson('/api/bookings/check-availability', [
            'room_id' => $this->room->id,
            'check_in_date' => '2026-12-02',
            'check_out_date' => '2026-12-04',
        ]);
        $checkResConflict->assertStatus(200);
        $checkResConflict->assertJson([
            'success' => true,
            'availability' => [
                'is_available' => false,
                'status' => 'booked',
            ],
        ]);

        // 4. Thử cố tình submit POST /api/bookings cho ngày trùng lặp -> Phải trả về 409 Conflict
        $token = auth('api')->login($this->user->account);

        $response = $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/bookings', [
            'user_id' => $this->user->id,
            'room_id' => $this->room->id,
            'check_in_date' => '2026-12-02',
            'check_out_date' => '2026-12-04',
            'rooms_count' => 1,
            'guests_count' => 2,
            'contact_name' => 'Khách Khác',
            'contact_email' => 'other@example.com',
            'contact_phone' => '0987654321',
            'payment_method' => 'vnpay',
        ]);

        $response->assertStatus(409);
        $response->assertJson([
            'success' => false,
            'code' => 'ROOM_ALREADY_BOOKED',
        ]);
    }
}

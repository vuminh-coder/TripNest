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
use App\Services\RoomAvailabilityService;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class MultiRoomHoldLockTest extends TestCase
{
    use DatabaseTransactions;

    protected $user;
    protected $category;
    protected $accommodation;
    protected $room1;
    protected $room2;
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(RoomAvailabilityService::class);

        $hostAccount = Account::create([
            'email' => 'host_multi_' . uniqid() . '@tripnest.vn',
            'role' => 'host',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $hostUser = User::create([
            'account_id' => $hostAccount->id,
            'full_name' => 'Host Multi Rooms',
            'phone_number' => '0988222333',
        ]);

        $host = Host::create([
            'user_id' => $hostUser->id,
            'host_display_name' => 'Host Multi Rooms',
            'contact_phone' => '0988222333',
            'id_card_number' => '001202008899',
            'id_card_front_url' => 'https://tripnest.vn/id_front.jpg',
            'id_card_back_url' => 'https://tripnest.vn/id_back.jpg',
            'kyc_status' => 'verified',
            'is_superhost' => true,
        ]);

        $customerAccount = Account::create([
            'email' => 'cust_multi_' . uniqid() . '@tripnest.vn',
            'role' => 'guest',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $this->user = User::create([
            'account_id' => $customerAccount->id,
            'full_name' => 'Khách Đặt Nhiều Phòng',
            'phone_number' => '0911333444',
        ]);

        $this->category = Category::first() ?? Category::create([
            'label_vi' => 'Khu Nghỉ Dưỡng Thử Nghiệm',
            'label_en' => 'Resort Test',
            'slug' => 'resort-test-' . uniqid(),
            'icon' => 'TbHome',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $this->accommodation = Accommodation::create([
            'host_id' => $host->id,
            'category_id' => $this->category->id,
            'name_vi' => 'Resort Ven Biển Cao Cấp',
            'name_en' => 'Luxury Beach Resort',
            'accommodation_type' => 'resort',
            'star_rating' => 5,
            'description' => 'Resort cao cấp phục vụ kiểm thử nhiều phòng đồng thời',
            'status' => 'published',
            'city' => 'Đà Nẵng',
            'district' => 'Ngũ Hành Sơn',
            'country' => 'Việt Nam',
            'address' => '88 Đường Võ Nguyên Giáp',
        ]);

        // Phòng 1: Tồn kho 3 phòng
        $this->room1 = Room::create([
            'accommodation_id' => $this->accommodation->id,
            'room_name_vi' => 'Deluxe Ocean View',
            'room_name_en' => 'Deluxe Ocean View',
            'description' => 'Phòng Deluxe view biển cao cấp',
            'total_inventory' => 3,
            'price_per_night' => 2000000,
            'cleaning_fee' => 50000,
            'max_guests' => 2,
            'bedrooms_count' => 1,
            'beds_count' => 1,
            'bathrooms_count' => 1,
            'status' => 'available',
        ]);

        // Phòng 2: Tồn kho 2 phòng
        $this->room2 = Room::create([
            'accommodation_id' => $this->accommodation->id,
            'room_name_vi' => 'Executive Suite',
            'room_name_en' => 'Executive Suite',
            'description' => 'Suite tổng thống sang trọng',
            'total_inventory' => 2,
            'price_per_night' => 3500000,
            'cleaning_fee' => 80000,
            'max_guests' => 4,
            'bedrooms_count' => 2,
            'beds_count' => 2,
            'bathrooms_count' => 2,
            'status' => 'available',
        ]);
    }

    /**
     * Test 1: Khóa giữ đồng thời nhiều phòng thành công và cùng chung 1 lock_token
     */
    public function test_can_hold_multiple_rooms_simultaneously(): void
    {
        $checkIn = date('Y-m-d', strtotime('+10 days'));
        $checkOut = date('Y-m-d', strtotime('+12 days'));

        $roomsPayload = [
            ['roomId' => $this->room1->id, 'quantity' => 2],
            ['roomId' => $this->room2->id, 'quantity' => 1],
        ];

        $result = $this->service->createHoldLockMulti(
            $roomsPayload,
            $checkIn,
            $checkOut,
            $this->user->id,
            15
        );

        $this->assertTrue($result['success']);
        $this->assertNotEmpty($result['lock_token']);
        $this->assertEquals(900, $result['seconds_left']);
        $this->assertCount(2, $result['rooms_locked']);

        // Kiểm tra trong DB có 2 bản ghi room_locks với cùng token
        $locksInDb = RoomLock::where('lock_token', $result['lock_token'])->get();
        $this->assertCount(2, $locksInDb);
        $this->assertEquals('active', $locksInDb[0]->status);
        $this->assertEquals('active', $locksInDb[1]->status);
    }

    /**
     * Test 2: Nếu 1 trong các phòng bị hết tồn kho thì rollback toàn bộ, không có lock nào được tạo
     */
    public function test_multi_room_hold_rolls_back_if_one_room_is_unavailable(): void
    {
        $checkIn = date('Y-m-d', strtotime('+15 days'));
        $checkOut = date('Y-m-d', strtotime('+17 days'));

        // Giữ phòng 2 chiếm hết tồn kho trước (room2 có 2 phòng)
        $this->service->createHoldLock(
            $this->room2->id,
            $checkIn,
            $checkOut,
            $this->user->id,
            2,
            15
        );

        // Khách khác cố gắng giữ phòng 1 (đủ) và phòng 2 (thiếu)
        $roomsPayload = [
            ['roomId' => $this->room1->id, 'quantity' => 1],
            ['roomId' => $this->room2->id, 'quantity' => 1], // Sẽ bị thiếu vì 2/2 đã bị giữ
        ];

        $result = $this->service->createHoldLockMulti(
            $roomsPayload,
            $checkIn,
            $checkOut,
            null,
            15
        );

        $this->assertFalse($result['success']);
        $this->assertEquals('ROOM_UNAVAILABLE', $result['code']);
        $this->assertEquals($this->room2->id, $result['conflicted_room_id']);

        // Đảm bảo không có lock rác nào của room1 được lưu lại (đã rollback an toàn)
        $room1Locks = RoomLock::where('room_id', $this->room1->id)
            ->where('check_in_date', $checkIn)
            ->count();
        $this->assertEquals(0, $room1Locks);
    }

    /**
     * Test 3: Giải phóng toàn bộ các phòng trong token khi gọi releaseLock
     */
    public function test_can_release_multi_room_hold_token(): void
    {
        $checkIn = date('Y-m-d', strtotime('+20 days'));
        $checkOut = date('Y-m-d', strtotime('+22 days'));

        $result = $this->service->createHoldLockMulti(
            [
                ['roomId' => $this->room1->id, 'quantity' => 1],
                ['roomId' => $this->room2->id, 'quantity' => 1],
            ],
            $checkIn,
            $checkOut,
            $this->user->id,
            15
        );

        $token = $result['lock_token'];
        $this->assertTrue($this->service->releaseLock($token));

        // Kiểm tra tất cả locks thuộc token đều chuyển sang 'released'
        $activeLocks = RoomLock::where('lock_token', $token)->where('status', 'active')->count();
        $this->assertEquals(0, $activeLocks);

        $releasedLocks = RoomLock::where('lock_token', $token)->where('status', 'released')->count();
        $this->assertEquals(2, $releasedLocks);
    }

    /**
     * Test 4: API POST /api/bookings/hold nhận payload mảng rooms và trả về đúng JSON contract
     */
    public function test_api_hold_endpoint_supports_rooms_array(): void
    {
        $checkIn = date('Y-m-d', strtotime('+25 days'));
        $checkOut = date('Y-m-d', strtotime('+27 days'));

        $response = $this->postJson('/api/bookings/hold', [
            'rooms' => [
                ['roomId' => $this->room1->id, 'quantity' => 1],
                ['roomId' => $this->room2->id, 'quantity' => 2],
            ],
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Đã khóa giữ chỗ phòng thành công trong 15 phút!',
            ])
            ->assertJsonStructure([
                'data' => [
                    'lock_token',
                    'expires_at',
                    'seconds_left',
                    'rooms_locked',
                ]
            ]);
    }
}

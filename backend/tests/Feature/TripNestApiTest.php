<?php

namespace Tests\Feature;

use App\Models\Room;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripNestApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Test lấy danh sách danh mục chỗ ở
     */
    public function test_can_get_categories(): void
    {
        $response = $this->getJson('/api/categories');
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'label', 'labelEn', 'icon']
                 ]);
    }

    /**
     * Test lấy danh sách phòng & lọc
     */
    public function test_can_get_rooms(): void
    {
        $response = $this->getJson('/api/rooms');
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'title', 'city', 'priceUSD', 'priceVND', 'rating', 'specs', 'images', 'host']
                 ]);
    }

    /**
     * Test đăng nhập bằng Email và Mật khẩu
     */
    public function test_can_login_with_email_and_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'demo.traveler@gmail.com',
            'password' => '123456',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'token',
                     'user' => ['id', 'name', 'email', 'avatar', 'role']
                 ]);
    }

    /**
     * Test tạo đơn đặt phòng mới
     */
    public function test_can_create_booking(): void
    {
        $account = \App\Models\Account::first();
        $room = Room::first();

        $response = $this->actingAs($account, 'api')->postJson('/api/bookings', [
            'roomId' => $room->id,
            'checkIn' => date('Y-m-d', strtotime('+10 days')),
            'checkOut' => date('Y-m-d', strtotime('+15 days')),
            'guests' => 2,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'booking' => ['id', 'roomId', 'roomTitle', 'checkIn', 'checkOut', 'totalPrice', 'status']
                 ]);
    }

    /**
     * Test tạo đơn đặt phòng mới có áp dụng Voucher
     */
    public function test_can_create_booking_with_voucher(): void
    {
        $account = \App\Models\Account::first();
        $room = Room::first();

        $response = $this->actingAs($account, 'api')->postJson('/api/bookings', [
            'roomId' => $room->id,
            'checkIn' => date('Y-m-d', strtotime('+10 days')),
            'checkOut' => date('Y-m-d', strtotime('+15 days')),
            'guests' => 2,
            'voucherCode' => 'TRIPNESTVIP',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'booking' => ['id', 'roomId', 'roomTitle', 'checkIn', 'checkOut', 'totalPrice', 'status']
                 ]);
    }

    /**
     * Test lấy chi tiết phòng kèm Radar Reviews Breakdown
     */
    public function test_can_get_room_detail_with_radar_breakdown(): void
    {
        $room = Room::first();
        $response = $this->getJson("/api/rooms/{$room->id}");
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'id',
                     'title',
                     'priceVND',
                     'priceUSD',
                     'rating',
                     'reviewsBreakdown' => ['cleanliness', 'accuracy', 'communication', 'location', 'checkIn', 'value'],
                 ]);
    }

    /**
     * Test admin lấy danh sách đánh giá từ database
     */
    public function test_admin_can_get_reviews_from_database(): void
    {
        $response = $this->getJson('/api/admin/reviews');
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'total',
                     'reviews' => [
                         '*' => [
                             'id',
                             'guest_name',
                             'guest_avatar',
                             'room_name',
                             'rating_overall',
                             'radar' => ['cleanliness', 'accuracy', 'communication', 'location', 'checkin', 'value'],
                             'comment',
                             'status',
                             'created_at',
                         ]
                     ]
                 ]);
    }

    /**
     * Test xác thực Voucher API
     */
    public function test_can_validate_voucher(): void
    {
        $response = $this->postJson('/api/vouchers/validate', [
            'code' => 'TRIPNESTVIP',
            'base_price' => 5000000,
        ]);
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'valid' => true,
                 ]);
    }

    /**
     * Test khách gửi đánh giá 6 tiêu chí Radar và Host xem danh sách đánh giá
     */
    public function test_can_submit_and_moderate_review(): void
    {
        $booking = \App\Models\Booking::first();
        if ($booking) {
            $response = $this->postJson('/api/reviews', [
                'booking_id' => $booking->id,
                'rating_cleanliness' => 5,
                'rating_accuracy' => 5,
                'rating_communication' => 4.8,
                'rating_location' => 5,
                'rating_checkin' => 5,
                'rating_value' => 4.9,
                'comment' => 'Kỳ nghỉ tuyệt vời, phòng ốc sạch sẽ và tiện nghi xuất sắc!',
            ]);

            $response->assertStatus(200)
                     ->assertJson(['success' => true]);
        }

        // Host reviews
        $hostRes = $this->getJson('/api/host/reviews');
        $hostRes->assertStatus(200)
                ->assertJsonStructure(['success', 'data']);

        // Admin reviews
        $adminRes = $this->getJson('/api/admin/reviews');
        $adminRes->assertStatus(200)
                 ->assertJsonStructure(['success', 'data']);
    }

    /**
     * Test admin cập nhật trạng thái đánh giá (ẩn/hiển thị)
     */
    public function test_admin_can_update_review_status(): void
    {
        $review = \App\Models\Review::first();
        if ($review) {
            $response = $this->match(['post', 'patch', 'put'], "/api/admin/reviews/{$review->id}/status", [
                'status' => 'hidden'
            ]);

            $response->assertStatus(200)
                     ->assertJson([
                         'success' => true,
                     ]);
        }
    }
}


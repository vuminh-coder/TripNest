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
     * Test đăng nhập 1 chạm bằng Google Email
     */
    public function test_can_login_with_google_email(): void
    {
        $response = $this->postJson('/api/auth/google', [
            'email' => 'test.google.user@gmail.com',
            'google_id' => 'google-sub-999888777',
            'name' => 'Test Google User',
            'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
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
        $room = Room::first();

        $response = $this->postJson('/api/bookings', [
            'roomId' => $room->id,
            'checkIn' => date('Y-m-d', strtotime('+10 days')),
            'checkOut' => date('Y-m-d', strtotime('+15 days')),
            'guests' => 2,
            'currency' => 'VND',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'booking' => ['id', 'roomId', 'roomTitle', 'checkIn', 'checkOut', 'totalPrice', 'status']
                 ]);
    }

    /**
     * Test lấy danh sách trải nghiệm
     */
    public function test_can_get_experiences(): void
    {
        $response = $this->getJson('/api/experiences');
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'title', 'city', 'rentUSD', 'rentVND', 'background']
                 ]);
    }
}

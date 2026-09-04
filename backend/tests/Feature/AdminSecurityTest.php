<?php

namespace Tests\Feature;

use App\Models\Account;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * 1. Khách vãng lai chưa đăng nhập gọi API admin -> Bị từ chối HTTP 401
     */
    public function test_unauthenticated_user_cannot_access_admin_endpoints(): void
    {
        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(401);
    }

    /**
     * 2. Khách du lịch (role: guest) gọi API admin -> Bị chặn HTTP 403 Forbidden
     */
    public function test_guest_user_cannot_access_admin_endpoints(): void
    {
        // Login as demo guest
        $loginRes = $this->postJson('/api/auth/login', [
            'email' => 'demo.traveler@gmail.com',
            'password' => '123456',
        ]);
        $token = $loginRes->json('token');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/admin/users');

        $response->assertStatus(403)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Truy cập bị từ chối. Bạn không có quyền quản trị viên.',
                 ]);
    }

    /**
     * 3. Đối tác chủ nhà (role: host) gọi API admin -> Bị chặn HTTP 403 Forbidden
     */
    public function test_host_user_cannot_access_admin_endpoints(): void
    {
        // Login as host
        $loginRes = $this->postJson('/api/auth/login', [
            'email' => 'minhhoang.dalat@gmail.com',
            'password' => '123456',
        ]);
        $token = $loginRes->json('token');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/admin/users');

        $response->assertStatus(403)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Truy cập bị từ chối. Bạn không có quyền quản trị viên.',
                 ]);
    }

    /**
     * 4. Quản trị viên (role: admin) gọi API admin -> Cho phép HTTP 200 OK
     */
    public function test_admin_user_can_access_admin_endpoints(): void
    {
        // Login as admin
        $loginRes = $this->postJson('/api/auth/login', [
            'email' => 'admin@tripnest.vn',
            'password' => '123456',
        ]);
        $token = $loginRes->json('token');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/admin/users');

        $response->assertStatus(200);
    }
}

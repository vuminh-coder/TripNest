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
use Illuminate\Foundation\Testing\DatabaseTransactions;

class SearchAvailabilityFilterTest extends TestCase
{
    use DatabaseTransactions;

    protected $host;
    protected $category;
    protected $fullyBookedAccom;
    protected $availableAccom;
    protected $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $hostAccount = Account::create([
            'email' => 'host_search_' . uniqid() . '@tripnest.vn',
            'role' => 'host',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $hostUser = User::create([
            'account_id' => $hostAccount->id,
            'full_name' => 'Host Search Test',
            'phone_number' => '0977111222',
        ]);

        $this->host = Host::create([
            'user_id' => $hostUser->id,
            'host_display_name' => 'Host Search Test',
            'contact_phone' => '0977111222',
            'id_card_number' => '001202007788',
            'id_card_front_url' => 'https://tripnest.vn/id_front.jpg',
            'id_card_back_url' => 'https://tripnest.vn/id_back.jpg',
            'kyc_status' => 'verified',
            'is_superhost' => true,
        ]);

        $custAccount = Account::create([
            'email' => 'cust_search_' . uniqid() . '@tripnest.vn',
            'role' => 'guest',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $this->customer = User::create([
            'account_id' => $custAccount->id,
            'full_name' => 'Khách Tìm Phòng',
            'phone_number' => '0911555666',
        ]);

        $this->category = Category::first() ?? Category::create([
            'label_vi' => 'Biệt Thự Biển',
            'label_en' => 'Beach Villa',
            'slug' => 'beach-villa-' . uniqid(),
            'icon' => 'TbHome',
            'display_order' => 1,
            'is_active' => true,
        ]);

        // Cơ sở lưu trú 1: Sẽ bị kín 100% phòng
        $this->fullyBookedAccom = Accommodation::create([
            'host_id' => $this->host->id,
            'category_id' => $this->category->id,
            'name_vi' => 'Villa Hết Phòng Hoàn Toàn',
            'name_en' => 'Sold Out Villa',
            'accommodation_type' => 'villa',
            'star_rating' => 5,
            'description' => 'Villa thử nghiệm kín 100% phòng',
            'status' => 'published',
            'city' => 'Nha Trang',
            'district' => 'Vĩnh Hải',
            'country' => 'Việt Nam',
            'address' => '12 Đường Trần Phú',
        ]);

        // Phòng của cơ sở 1: Chỉ có 1 phòng tồn kho 1
        $room1 = Room::create([
            'accommodation_id' => $this->fullyBookedAccom->id,
            'room_name_vi' => 'Phòng Duy Nhất Đã Kín',
            'room_name_en' => 'Only Room Booked',
            'description' => 'Mô tả phòng đã kín',
            'total_inventory' => 1,
            'price_per_night' => 1800000,
            'cleaning_fee' => 50000,
            'max_guests' => 2,
            'bedrooms_count' => 1,
            'beds_count' => 1,
            'bathrooms_count' => 1,
            'status' => 'available',
        ]);

        // Đặt kín phòng này từ ngày 2026-11-10 đến 2026-11-15
        Booking::create([
            'booking_code' => 'BK_' . substr(md5(uniqid()), 0, 10),
            'user_id' => $this->customer->id,
            'room_id' => $room1->id,
            'check_in_date' => '2026-11-10',
            'check_out_date' => '2026-11-15',
            'nights_count' => 5,
            'guests_count' => 2,
            'price_per_night' => 1800000,
            'base_price' => 9000000,
            'total_price' => 9000000,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        // Cơ sở lưu trú 2: Còn phòng trống
        $this->availableAccom = Accommodation::create([
            'host_id' => $this->host->id,
            'category_id' => $this->category->id,
            'name_vi' => 'Resort Vẫn Còn Phòng Trống',
            'name_en' => 'Available Resort',
            'accommodation_type' => 'resort',
            'star_rating' => 5,
            'description' => 'Resort thử nghiệm còn phòng trống',
            'status' => 'published',
            'city' => 'Nha Trang',
            'district' => 'Lộc Thọ',
            'country' => 'Việt Nam',
            'address' => '99 Đường Trần Phú',
        ]);

        // Phòng của cơ sở 2: Tồn kho 5 phòng (chưa ai đặt)
        Room::create([
            'accommodation_id' => $this->availableAccom->id,
            'room_name_vi' => 'Phòng Superior Còn Trống',
            'room_name_en' => 'Available Superior Room',
            'description' => 'Mô tả phòng còn trống',
            'total_inventory' => 5,
            'price_per_night' => 2500000,
            'cleaning_fee' => 80000,
            'max_guests' => 2,
            'bedrooms_count' => 1,
            'beds_count' => 1,
            'bathrooms_count' => 1,
            'status' => 'available',
        ]);
    }

    /**
     * Test 1: Khi không truyền ngày, cả 2 chỗ nghỉ đều xuất hiện bình thường
     */
    public function test_accommodations_index_returns_all_when_no_dates_provided(): void
    {
        $response = $this->getJson('/api/accommodations?city=Nha Trang');
        $response->assertStatus(200);

        $accomNames = collect($response->json())->pluck('nameVi')->all();
        $this->assertContains('Villa Hết Phòng Hoàn Toàn', $accomNames);
        $this->assertContains('Resort Vẫn Còn Phòng Trống', $accomNames);
    }

    /**
     * Test 2: Khi tìm kiếm theo ngày (trùng khoảng ngày phòng bị kín), chỗ ở hết phòng bị loại khỏi kết quả
     */
    public function test_accommodations_with_zero_available_rooms_are_excluded_from_search(): void
    {
        // Tìm kiếm từ 2026-11-11 đến 2026-11-14 (nằm trong khoảng 10-15/11 đã kín phòng của cơ sở 1)
        $response = $this->getJson('/api/accommodations?city=Nha Trang&checkIn=2026-11-11&checkOut=2026-11-14');
        $response->assertStatus(200);

        $accomNames = collect($response->json())->pluck('nameVi')->all();

        // Cơ sở 1 hết 100% phòng -> KHÔNG ĐƯỢC XUẤT HIỆN
        $this->assertNotContains('Villa Hết Phòng Hoàn Toàn', $accomNames);

        // Cơ sở 2 còn phòng trống -> PHẢI XUẤT HIỆN
        $this->assertContains('Resort Vẫn Còn Phòng Trống', $accomNames);
    }

    /**
     * Test 3: Phòng bị tạm giữ bởi khách khác (Hold Lock active) cũng làm giảm tồn kho và loại bỏ cơ sở nếu hết phòng
     */
    public function test_active_hold_locks_reduce_inventory_and_exclude_sold_out_accommodations(): void
    {
        $testAccom = Accommodation::create([
            'host_id' => $this->host->id,
            'category_id' => $this->category->id,
            'name_vi' => 'Khách Sạn Bị Giữ Chỗ Hết',
            'name_en' => 'Fully Held Hotel',
            'accommodation_type' => 'hotel',
            'star_rating' => 4,
            'description' => 'Khách sạn bị hold lock',
            'status' => 'published',
            'city' => 'Nha Trang',
            'district' => 'Lộc Thọ',
            'country' => 'Việt Nam',
            'address' => '33 Đường Hùng Vương',
        ]);

        $singleRoom = Room::create([
            'accommodation_id' => $testAccom->id,
            'room_name_vi' => 'Phòng Standard Bị Hold',
            'room_name_en' => 'Standard Room Held',
            'description' => 'Mô tả phòng bị hold',
            'total_inventory' => 1,
            'price_per_night' => 1200000,
            'cleaning_fee' => 30000,
            'max_guests' => 2,
            'bedrooms_count' => 1,
            'beds_count' => 1,
            'bathrooms_count' => 1,
            'status' => 'available',
        ]);

        // Tạm giữ phòng 15 phút
        RoomLock::create([
            'room_id' => $singleRoom->id,
            'lock_token' => 'LOCK_SEARCH_TEST_' . uniqid(),
            'check_in_date' => '2026-12-01',
            'check_out_date' => '2026-12-05',
            'rooms_count' => 1,
            'expires_at' => now()->addMinutes(15),
            'status' => 'active',
        ]);

        // Tìm kiếm vào đúng khoảng ngày đang bị giữ
        $response = $this->getJson('/api/accommodations?city=Nha Trang&checkIn=2026-12-02&checkOut=2026-12-04');
        $response->assertStatus(200);

        $accomNames = collect($response->json())->pluck('nameVi')->all();
        $this->assertNotContains('Khách Sạn Bị Giữ Chỗ Hết', $accomNames);
    }
}

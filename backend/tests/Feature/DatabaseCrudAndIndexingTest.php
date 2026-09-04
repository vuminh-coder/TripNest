<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Account;
use App\Models\Host;
use App\Models\HostPayoutAccount;
use App\Models\Category;
use App\Models\Amenity;
use App\Models\Accommodation;
use App\Models\Room;
use App\Models\AccommodationImage;
use App\Models\RoomImage;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Wishlist;
use App\Models\Experience;
use App\Models\Payment;
use App\Models\PayoutTransaction;
use App\Models\Voucher;
use App\Models\ExchangeRate;

class DatabaseCrudAndIndexingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Test 1: User & Account CRUD and Indexing
     */
    public function test_user_crud_and_indexing()
    {
        $testEmail = 'test_crud_user_' . time() . '@tripnest.vn';
        
        // 1. Create
        $account = Account::create([
            'email' => $testEmail,
            'role' => 'guest',
            'status' => 'active',
            'password' => bcrypt('Secret123!'),
        ]);

        $user = User::create([
            'account_id' => $account->id,
            'full_name' => 'Nguyễn Kiểm Thử',
            'phone_number' => '0988776655',
            'id_card_number' => '001202009988',
            'gender' => 'male',
        ]);

        $this->assertDatabaseHas('accounts', ['email' => $testEmail]);
        $this->assertDatabaseHas('users', ['id_card_number' => '001202009988']);

        // 2. Read with Index
        $foundAccount = Account::where('email', $testEmail)->with('user')->first();
        $this->assertNotNull($foundAccount);
        $this->assertEquals('Nguyễn Kiểm Thử', $foundAccount->user->full_name);

        // 3. Update
        $user->update(['full_name' => 'Nguyễn Kiểm Thử Đã Sửa', 'phone_number' => '0911223344']);
        $account->update(['status' => 'inactive']);
        $this->assertDatabaseHas('users', ['full_name' => 'Nguyễn Kiểm Thử Đã Sửa', 'phone_number' => '0911223344']);
        $this->assertDatabaseHas('accounts', ['email' => $testEmail, 'status' => 'inactive']);

        // 4. Force Delete (Permanent cleanup)
        $user->delete();
        $account->forceDelete();
        $this->assertDatabaseMissing('users', ['id_card_number' => '001202009988']);
        $this->assertDatabaseMissing('accounts', ['email' => $testEmail]);
    }

    /**
     * Test 2: Host & KYC & Host Payout Accounts CRUD
     */
    public function test_host_kyc_and_payout_account_crud()
    {
        $testEmail = 'host_crud_' . time() . '@tripnest.vn';
        $account = Account::create([
            'email' => $testEmail,
            'role' => 'host',
            'status' => 'active',
        ]);
        $user = User::create([
            'account_id' => $account->id,
            'full_name' => 'Chủ Nhà VIP',
            'phone_number' => '0933445566',
        ]);

        // 1. Create Host Profile
        $host = Host::create([
            'user_id' => $user->id,
            'host_display_name' => 'Minh Hoàng Host',
            'host_introduction' => 'Chuyên cung cấp villa nghỉ dưỡng cao cấp.',
            'contact_phone' => '0933445566',
            'contact_email' => $testEmail,
            'host_rating' => 4.98,
            'host_reviews_count' => 15,
            'is_superhost' => false,
            'kyc_status' => 'pending',
            'id_card_number' => '079201004455',
            'id_card_front_url' => 'https://tripnest.vn/cccd_front.jpg',
            'id_card_back_url' => 'https://tripnest.vn/cccd_back.jpg',
        ]);

        $this->assertDatabaseHas('hosts', ['user_id' => $user->id, 'kyc_status' => 'pending']);

        // 2. Create Payout Account
        $payoutAcc = HostPayoutAccount::create([
            'host_id' => $host->id,
            'account_type' => 'bank_transfer',
            'bank_name' => 'Vietcombank',
            'account_number' => '1020304050',
            'account_holder_name' => 'CHU NHA VIP',
            'is_default' => true,
            'is_verified' => true,
        ]);

        $this->assertDatabaseHas('host_payout_accounts', ['account_number' => '1020304050']);

        // 3. Update KYC & Superhost
        $host->update([
            'kyc_status' => 'verified',
            'is_superhost' => true,
        ]);
        $this->assertDatabaseHas('hosts', ['id' => $host->id, 'kyc_status' => 'verified', 'is_superhost' => true]);

        // Cleanup
        $payoutAcc->delete();
        $host->delete();
        $user->delete();
        $account->forceDelete();
    }

    /**
     * Test 3: Categories & Amenities CRUD
     */
    public function test_categories_and_amenities_crud()
    {
        $uniqueSlug = 'phong-cach-thu-nghiem-' . time();
        $uniqueAmenityCode = 'AMENITY_TEST_' . time();

        // 1. Create Category
        $cat = Category::create([
            'label_vi' => 'Phong Cách Thử Nghiệm',
            'label_en' => 'Experimental Style',
            'slug' => $uniqueSlug,
            'description' => 'Danh mục phục vụ kiểm thử',
            'icon' => 'TbSparkles',
            'display_order' => 99,
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('categories', ['slug' => $uniqueSlug]);

        // 2. Create Amenity
        $amenity = Amenity::create([
            'code' => $uniqueAmenityCode,
            'name_vi' => 'Bồn Tắm Nước Nóng Jacuzzi',
            'name_en' => 'Hot Tub Jacuzzi',
            'icon' => 'TbBath',
            'target_type' => 'room',
            'category' => 'standout',
        ]);
        $this->assertDatabaseHas('amenities', ['code' => $uniqueAmenityCode]);

        // 3. Update
        $cat->update(['label_vi' => 'Phong Cách Đã Cập Nhật']);
        $this->assertDatabaseHas('categories', ['slug' => $uniqueSlug, 'label_vi' => 'Phong Cách Đã Cập Nhật']);

        // Cleanup
        $cat->delete();
        $amenity->delete();
    }

    /**
     * Test 4: Accommodation, Room, Images & Pivot Amenities CRUD
     */
    public function test_accommodation_room_and_pivots_crud()
    {
        $cat = Category::first();
        $host = Host::first();

        // 1. Create Accommodation
        $acc = Accommodation::create([
            'host_id' => $host->id,
            'category_id' => $cat->id,
            'name_vi' => 'Biệt Thự Sunset Cloud Đà Lạt',
            'name_en' => 'Sunset Cloud Villa',
            'accommodation_type' => 'villa',
            'star_rating' => 5,
            'description' => 'Biệt thự sân vườn view rừng thông thơ mộng.',
            'city' => 'Đà Lạt',
            'district' => 'Phường 10',
            'country' => 'Vietnam',
            'address' => '45 Khe Sanh, Phường 10',
            'latitude' => 11.940419,
            'longitude' => 108.458313,
            'is_featured' => true,
            'status' => 'published',
        ]);

        $this->assertDatabaseHas('accommodations', ['name_vi' => 'Biệt Thự Sunset Cloud Đà Lạt']);

        // 2. Create Room
        $room = Room::create([
            'accommodation_id' => $acc->id,
            'room_name_vi' => 'Phòng Tổng Thống VIP',
            'room_name_en' => 'Presidential VIP Room',
            'room_type_code' => 'entire_villa',
            'space_type' => 'entire_place',
            'description' => 'Không gian nghỉ dưỡng sang trọng bậc nhất.',
            'room_size_m2' => 120,
            'price_per_night' => 3500000,
            'price_vnd_per_night' => 3500000,
            'price_usd_per_night' => 140,
            'cleaning_fee' => 300000,
            'service_fee_percent' => 5,
            'max_guests' => 6,
            'bedrooms_count' => 3,
            'beds_count' => 3,
            'bathrooms_count' => 3,
            'total_inventory' => 1,
            'is_guest_favorite' => true,
            'status' => 'available',
        ]);

        $this->assertDatabaseHas('rooms', ['room_name_vi' => 'Phòng Tổng Thống VIP']);
        $this->assertEquals(3500000, (int) $room->fresh()->price_per_night);

        // 3. Create Images
        $accImg = AccommodationImage::create([
            'accommodation_id' => $acc->id,
            'image_url' => 'https://tripnest.vn/villa_main.jpg',
            'image_type' => 'exterior',
            'is_thumbnail' => true,
        ]);

        $roomImg = RoomImage::create([
            'room_id' => $room->id,
            'image_url' => 'https://tripnest.vn/room_bed.jpg',
            'image_type' => 'bedroom',
            'is_thumbnail' => true,
        ]);

        $this->assertDatabaseHas('accommodation_images', ['accommodation_id' => $acc->id]);
        $this->assertDatabaseHas('room_images', ['room_id' => $room->id]);

        // 4. Attach Pivot Amenity
        $amenity = Amenity::first();
        DB::table('accommodation_amenity')->insert([
            'accommodation_id' => $acc->id,
            'amenity_id' => $amenity->id,
        ]);
        DB::table('room_amenity')->insert([
            'room_id' => $room->id,
            'amenity_id' => $amenity->id,
        ]);

        $this->assertDatabaseHas('accommodation_amenity', ['accommodation_id' => $acc->id, 'amenity_id' => $amenity->id]);
        $this->assertDatabaseHas('room_amenity', ['room_id' => $room->id, 'amenity_id' => $amenity->id]);

        // 5. Update Status & Feature Flags
        $acc->update(['status' => 'paused', 'is_featured' => false]);
        $this->assertDatabaseHas('accommodations', ['id' => $acc->id, 'status' => 'paused', 'is_featured' => false]);

        // Cleanup
        DB::table('accommodation_amenity')->where('accommodation_id', $acc->id)->delete();
        DB::table('room_amenity')->where('room_id', $room->id)->delete();
        $roomImg->delete();
        $accImg->delete();
        $room->delete();
        $acc->delete();
    }

    /**
     * Test 5: Voucher, Booking, Payment, Payout & 6-Radar Review Flow
     */
    public function test_booking_voucher_payment_payout_review_flow()
    {
        $user = User::first();
        $room = Room::first();
        $host = Host::first();
        $payoutAcc = HostPayoutAccount::first();

        // 1. Create Voucher
        $vCode = 'TEST_VOUCHER_' . time();
        $voucher = Voucher::create([
            'code' => $vCode,
            'title' => 'Voucher 200k Test',
            'description' => 'Giảm 200k cho đơn thử nghiệm',
            'discount_type' => 'fixed',
            'discount_value' => 200000,
            'min_booking_amount' => 1000000,
            'usage_limit' => 50,
            'used_count' => 0,
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(30),
        ]);

        $this->assertDatabaseHas('vouchers', ['code' => $vCode]);

        // 2. Create Booking
        $bCode = 'BK-TEST-' . time();
        $booking = Booking::create([
            'booking_code' => $bCode,
            'user_id' => $user->id,
            'room_id' => $room->id,
            'voucher_id' => $voucher->id,
            'check_in_date' => now()->addDays(2)->toDateString(),
            'check_out_date' => now()->addDays(4)->toDateString(),
            'guests_count' => 2,
            'nights_count' => 2,
            'price_per_night' => 2500000,
            'base_price' => 5000000,
            'cleaning_fee' => 300000,
            'service_fee' => 250000,
            'discount_amount' => 200000,
            'total_price' => 5350000,
            'status' => 'confirmed',
        ]);

        $this->assertDatabaseHas('bookings', ['booking_code' => $bCode, 'discount_amount' => 200000]);

        // Increment voucher used_count
        $voucher->increment('used_count');
        $this->assertEquals(1, $voucher->fresh()->used_count);

        // 3. Create Payment
        $pCode = 'PAY-TEST-' . time();
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'bank_transfer',
            'amount' => 5350000,
            'status' => 'successful',
            'transaction_code' => $pCode,
            'paid_at' => now(),
        ]);

        $this->assertDatabaseHas('payments', ['transaction_code' => $pCode, 'status' => 'successful']);

        // 4. Booking Transitions (Check-in -> Check-out)
        $booking->update(['status' => 'checked_in']);
        $this->assertEquals('checked_in', $booking->fresh()->status);

        $booking->update(['status' => 'completed']);
        $this->assertEquals('completed', $booking->fresh()->status);

        // 5. Create Payout Transaction (Host receives gross - 12% platform commission)
        $gross = 5000000;
        $commission = round($gross * 0.12);
        $net = $gross - $commission;
        $poCode = 'PO-TEST-' . time();

        $payout = PayoutTransaction::create([
            'payout_code' => $poCode,
            'host_id' => $host->id,
            'booking_id' => $booking->id,
            'payout_account_id' => $payoutAcc->id,
            'gross_amount' => $gross,
            'platform_commission_fee' => $commission,
            'net_payout_amount' => $net,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('payout_transactions', [
            'payout_code' => $poCode,
            'platform_commission_fee' => $commission,
            'net_payout_amount' => $net,
            'status' => 'pending',
        ]);

        // Admin resolves payout with bank transaction ref
        $payout->update([
            'status' => 'completed',
            'transaction_reference' => 'FT2608298877',
            'transferred_at' => now(),
        ]);
        $this->assertDatabaseHas('payout_transactions', [
            'id' => $payout->id,
            'status' => 'completed',
            'transaction_reference' => 'FT2608298877',
        ]);

        // 6. 6-Radar Review & Host Reply & Admin Moderation
        $review = Review::create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'room_id' => $room->id,
            'rating' => 4.97,
            'rating_breakdown' => json_encode([
                'cleanliness' => 5.0,
                'accuracy' => 5.0,
                'communication' => 5.0,
                'location' => 4.8,
                'checkin' => 5.0,
                'value' => 5.0,
            ]),
            'comment' => 'Kỳ nghỉ trên cả tuyệt vời, villa sạch sẽ và view rừng thông rất đẹp!',
            'status' => 'approved',
        ]);

        $this->assertDatabaseHas('reviews', ['booking_id' => $booking->id, 'rating' => 4.97]);

        // Host replies
        $review->update(['host_response' => 'Cảm ơn quý khách đã tin tưởng TripNest!']);
        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'host_response' => 'Cảm ơn quý khách đã tin tưởng TripNest!']);

        // Admin moderates
        $review->update(['status' => 'hidden']);
        $this->assertEquals('hidden', $review->fresh()->status);

        // Cleanup
        $review->delete();
        $payout->delete();
        $payment->delete();
        $booking->delete();
        $voucher->delete();
    }

    /**
     * Test 6: Wishlist, Experience & Exchange Rate CRUD
     */
    public function test_wishlist_experience_and_exchange_rates_crud()
    {
        $user = User::first();
        $room = Room::first();
        $host = Host::first();

        // 1. Wishlist Add / Remove
        Wishlist::where('user_id', $user->id)->where('room_id', $room->id)->delete();
        $wishlist = Wishlist::create([
            'user_id' => $user->id,
            'room_id' => $room->id,
        ]);
        $this->assertDatabaseHas('wishlists', ['user_id' => $user->id, 'room_id' => $room->id]);
        $wishlist->delete();
        $this->assertDatabaseMissing('wishlists', ['user_id' => $user->id, 'room_id' => $room->id]);

        // 2. Experience CRUD
        $exp = Experience::create([
            'host_id' => $host->id,
            'title_vi' => 'Chèo SUP Bình Minh Vịnh Hạ Long',
            'caption' => 'Trải nghiệm ngắm bình minh trên vịnh di sản',
            'description' => 'Tour chèo thuyền SUP chuyên nghiệp có hướng dẫn viên.',
            'city' => 'Hạ Long',
            'price_per_person' => 450000,
            'duration_hours' => 3,
            'rating' => 4.95,
            'reviews_count' => 24,
            'image_url' => 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('experiences', ['title_vi' => 'Chèo SUP Bình Minh Vịnh Hạ Long', 'price_per_person' => 450000]);

        $exp->update(['is_active' => false]);
        $this->assertDatabaseHas('experiences', ['id' => $exp->id, 'is_active' => false]);
        $exp->delete();

        // 3. Exchange Rate CRUD
        $rate = ExchangeRate::where('base_currency', 'USD')->where('target_currency', 'VND')->first();
        if ($rate) {
            $this->assertGreaterThan(20000, $rate->rate);
            $convertedVND = 100 * $rate->rate;
            $this->assertGreaterThan(2000000, $convertedVND);
        }
    }
}

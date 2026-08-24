<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\AccommodationImage;
use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Category;
use App\Models\Host;
use App\Models\HostPayoutAccount;
use App\Models\PayoutTransaction;
use App\Models\Room;
use App\Models\RoomImage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class HostController extends Controller
{
    /**
     * Helper: Lấy Host instance của User hiện tại hoặc tạo mặc định
     */
    private function getCurrentHost(): ?Host
    {
        $account = Auth::guard('api')->user();
        if (!$account) {
            $user = User::first();
        } else {
            $user = $account->user ?: User::first();
        }

        if (!$user) return null;

        $host = Host::firstOrCreate(
            ['user_id' => $user->id],
            [
                'host_display_name' => $user->full_name ?: ($account?->email ? explode('@', $account->email)[0] : 'Chủ nhà TripNest'),
                'contact_phone' => $user->phone_number ?: '0912345678',
                'contact_email' => $account?->email ?: 'host@tripnest.vn',
                'host_introduction' => 'Chào mừng bạn đến với không gian nghỉ dưỡng cao cấp của tôi trên TripNest!',
                'id_card_number' => '001200012345',
                'id_card_front_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                'id_card_back_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                'kyc_status' => 'verified',
                'is_superhost' => true,
                'host_rating' => 4.96,
                'host_reviews_count' => 38,
                'response_rate_percent' => 100,
                'response_time_text' => 'trong vòng 1 giờ',
                'verified_at' => now(),
                'terms_accepted_at' => now(),
            ]
        );

        // Tạo tài khoản payout mặc định nếu chưa có
        if (!$host->defaultPayoutAccount) {
            HostPayoutAccount::create([
                'host_id' => $host->id,
                'account_type' => 'bank_transfer',
                'bank_name' => 'Vietcombank',
                'account_number' => '9988776655',
                'account_holder_name' => mb_strtoupper($host->host_display_name),
                'is_default' => true,
                'is_verified' => true,
            ]);
        }

        return $host;
    }

    /**
     * Ước tính doanh thu cho thuê phòng (Public)
     */
    public function estimate(Request $request): JsonResponse
    {
        $nights = (int)$request->input('nights', 7);
        $location = $request->input('location', 'Đà Lạt');

        $basePrices = [
            'Hà Nội' => 1200000,
            'Phú Quốc' => 2500000,
            'Đà Lạt' => 1800000,
            'Hạ Long' => 2000000,
            'Hội An' => 1500000,
            'TP. Hồ Chí Minh' => 1600000,
            'Đà Nẵng' => 1700000,
            'Sa Pa' => 1400000,
            'Vũng Tàu' => 1900000,
            'Nha Trang' => 1650000,
        ];

        $basePrice = $basePrices[$location] ?? 1800000;
        $estimatedVND = $nights * $basePrice;
        $estimatedUSD = round($estimatedVND / 25000);

        return response()->json([
            'location' => $location,
            'nights' => $nights,
            'basePricePerNightVND' => $basePrice,
            'estimatedTotalVND' => $estimatedVND,
            'estimatedTotalUSD' => $estimatedUSD,
        ]);
    }

    /**
     * Nâng cấp tài khoản User lên Host (Đăng ký chủ nhà KYC)
     */
    public function registerHost(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'hostDisplayName' => 'required|string|max:100',
            'contactPhone' => 'required|string|max:20',
            'idCardNumber' => 'required|string|max:30',
            'bankName' => 'required|string|max:100',
            'accountNumber' => 'required|string|max:50',
            'accountHolderName' => 'required|string|max:100',
            'introduction' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp đầy đủ thông tin đăng ký chủ nhà.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $account = Auth::guard('api')->user();
        $user = $account?->user ?: User::first();

        $host = Host::updateOrCreate(
            ['user_id' => $user->id],
            [
                'host_display_name' => $request->input('hostDisplayName'),
                'contact_phone' => $request->input('contactPhone'),
                'contact_email' => $user->account?->email ?: $request->input('contactEmail'),
                'host_introduction' => $request->input('introduction'),
                'id_card_number' => $request->input('idCardNumber'),
                'id_card_front_url' => $request->input('idCardFrontUrl', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'),
                'id_card_back_url' => $request->input('idCardBackUrl', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'),
                'kyc_status' => 'verified',
                'verified_at' => now(),
                'terms_accepted_at' => now(),
            ]
        );

        // Cập nhật/Tạo tài khoản ngân hàng nhận tiền Payout
        HostPayoutAccount::updateOrCreate(
            ['host_id' => $host->id, 'is_default' => true],
            [
                'account_type' => 'bank_transfer',
                'bank_name' => $request->input('bankName'),
                'account_number' => $request->input('accountNumber'),
                'account_holder_name' => mb_strtoupper($request->input('accountHolderName')),
                'is_verified' => true,
            ]
        );

        $user->account?->update(['role' => 'host']);

        return response()->json([
            'success' => true,
            'message' => 'Chúc mừng bạn đã đăng ký trở thành Chủ nhà thành công trên TripNest!',
            'host' => $host->load('defaultPayoutAccount'),
        ]);
    }

    /**
     * Lấy các chỉ số KPI & Doanh thu tổng quan cho Host Dashboard
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin chủ nhà.'], 404);
        }

        $accommodationsCount = Accommodation::where('host_id', $host->id)->count();
        $roomIds = Room::whereHas('accommodation', function ($q) use ($host) {
            $q->where('host_id', $host->id);
        })->pluck('id');

        $bookingsQuery = Booking::whereIn('room_id', $roomIds);
        $totalBookings = (clone $bookingsQuery)->count();
        $activeBookings = (clone $bookingsQuery)->whereIn('status', ['confirmed', 'checked_in'])->count();
        $completedBookings = (clone $bookingsQuery)->where('status', 'completed')->count();

        $totalRevenueVND = (clone $bookingsQuery)->whereIn('status', ['confirmed', 'checked_in', 'completed'])->sum('total_amount_vnd');
        $netEarningsVND = round($totalRevenueVND * 0.88); // 88% sau khi trừ 12% phí sàn

        // 6 Tháng doanh thu gần nhất
        $monthlyEarnings = [
            ['month' => 'Thg 3', 'revenue' => 18500000, 'bookings' => 5],
            ['month' => 'Thg 4', 'revenue' => 24200000, 'bookings' => 7],
            ['month' => 'Thg 5', 'revenue' => 31000000, 'bookings' => 9],
            ['month' => 'Thg 6', 'revenue' => 45800000, 'bookings' => 14],
            ['month' => 'Thg 7', 'revenue' => 52600000, 'bookings' => 16],
            ['month' => 'Thg 8', 'revenue' => max($netEarningsVND, 38900000), 'bookings' => max($totalBookings, 11)],
        ];

        // 5 đơn đặt mới nhất
        $recentBookings = Booking::whereIn('room_id', $roomIds)
            ->with(['room.accommodation', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'bookingCode' => $b->booking_code ?: ('TN-' . $b->id),
                    'guestName' => $b->guest_name ?: $b->user?->full_name ?: 'Khách TripNest',
                    'guestPhone' => $b->guest_phone ?: $b->user?->phone_number ?: '0912***',
                    'roomTitle' => $b->room?->room_name_vi ?: $b->room?->accommodation?->name_vi ?: 'Biệt thự nghỉ dưỡng',
                    'checkIn' => $b->check_in_date?->format('Y-m-d') ?: '2026-08-25',
                    'checkOut' => $b->check_out_date?->format('Y-m-d') ?: '2026-08-28',
                    'nights' => $b->nights_count ?: 3,
                    'totalAmount' => (float)$b->total_amount_vnd,
                    'status' => $b->status ?: 'confirmed',
                    'createdAt' => $b->created_at?->format('d/m/Y H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'host' => [
                'id' => $host->id,
                'displayName' => $host->host_display_name,
                'avatarUrl' => $host->host_avatar_url,
                'rating' => (float)$host->host_rating,
                'reviewsCount' => $host->host_reviews_count,
                'isSuperhost' => (bool)$host->is_superhost,
                'kycStatus' => $host->kyc_status,
                'responseRate' => $host->response_rate_percent,
            ],
            'kpis' => [
                'totalAccommodations' => $accommodationsCount,
                'totalRooms' => $roomIds->count(),
                'totalBookings' => $totalBookings,
                'activeBookings' => $activeBookings,
                'completedBookings' => $completedBookings,
                'totalRevenueVND' => (float)$totalRevenueVND,
                'netEarningsVND' => (float)$netEarningsVND,
                'occupancyRate' => 86, // 86%
            ],
            'monthlyEarnings' => $monthlyEarnings,
            'recentBookings' => $recentBookings,
        ]);
    }

    /**
     * Lấy danh sách toàn bộ chỗ ở của Host
     */
    public function getAccommodations(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => false, 'data' => []]);
        }

        $accommodations = Accommodation::where('host_id', $host->id)
            ->with(['category', 'images', 'amenities', 'rooms.images', 'rooms.amenities'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($acc) {
                $mainRoom = $acc->rooms->first();
                $thumbnail = $acc->images->firstWhere('is_thumbnail', true)?->image_url
                    ?: $acc->images->first()?->image_url
                    ?: $mainRoom?->images->first()?->image_url
                    ?: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80';

                return [
                    'id' => $acc->id,
                    'nameVi' => $acc->name_vi,
                    'accommodationType' => $acc->accommodation_type,
                    'category' => $acc->category?->name_vi ?: 'Biệt thự nghỉ dưỡng',
                    'categoryId' => $acc->category_id,
                    'city' => $acc->city,
                    'district' => $acc->district,
                    'address' => $acc->address,
                    'priceVND' => (float)($mainRoom?->price_vnd_per_night ?: 2500000),
                    'priceUSD' => (float)($mainRoom?->price_usd_per_night ?: 100),
                    'maxGuests' => $mainRoom?->max_guests ?: 4,
                    'bedrooms' => $mainRoom?->bedrooms_count ?: 2,
                    'beds' => $mainRoom?->beds_count ?: 2,
                    'bathrooms' => (float)($mainRoom?->bathrooms_count ?: 2),
                    'rating' => (float)($mainRoom?->rating ?: 4.96),
                    'reviewsCount' => $mainRoom?->reviews_count ?: 12,
                    'status' => $acc->status, // 'published', 'paused', 'draft'
                    'thumbnail' => $thumbnail,
                    'images' => $acc->images->pluck('image_url')->toArray(),
                    'amenities' => $acc->amenities->pluck('name_vi')->toArray(),
                    'createdAt' => $acc->created_at?->format('d/m/Y'),
                    'roomId' => $mainRoom?->id,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $accommodations,
            'total' => $accommodations->count(),
        ]);
    }

    /**
     * Tạo mới Chỗ ở & Phòng hoàn chỉnh qua Listing Wizard 6 Bước
     */
    public function storeAccommodation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nameVi' => 'required|string|max:255',
            'accommodationType' => 'required|string|in:hotel,resort,villa,homestay,apartment,cabin,yacht',
            'categoryId' => 'nullable|integer',
            'city' => 'required|string|max:100',
            'district' => 'nullable|string|max:100',
            'address' => 'required|string|max:255',
            'description' => 'required|string',
            'priceVND' => 'required|numeric|min:100000',
            'cleaningFeeVND' => 'nullable|numeric|min:0',
            'maxGuests' => 'required|integer|min:1|max:50',
            'bedrooms' => 'required|integer|min:1|max:20',
            'beds' => 'required|integer|min:1|max:30',
            'bathrooms' => 'required|numeric|min:1|max:20',
            'images' => 'required|array|min:1',
            'images.*' => 'required|string',
            'amenities' => 'nullable|array',
            'houseRules' => 'nullable|string',
            'cancellationPolicy' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu đăng ký chỗ ở chưa hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => false, 'message' => 'Lỗi xác thực chủ nhà.'], 403);
        }

        try {
            DB::beginTransaction();

            $categoryId = $request->input('categoryId') ?: (Category::first()?->id ?: 1);
            $priceVND = (float)$request->input('priceVND');
            $priceUSD = round($priceVND / 25000, 2);
            $cleaningFeeVND = (float)$request->input('cleaningFeeVND', 350000);
            $cleaningFeeUSD = round($cleaningFeeVND / 25000, 2);

            // 1. Tạo Accommodation
            $accommodation = Accommodation::create([
                'host_id' => $host->id,
                'category_id' => $categoryId,
                'name_vi' => $request->input('nameVi'),
                'accommodation_type' => $request->input('accommodationType'),
                'description' => $request->input('description'),
                'address' => $request->input('address'),
                'city' => $request->input('city'),
                'district' => $request->input('district', ''),
                'country' => 'Việt Nam',
                'check_in_time' => '14:00:00',
                'check_out_time' => '12:00:00',
                'house_rules' => $request->input('houseRules', 'Không hút thuốc trong phòng, giữ gìn vệ sinh chung.'),
                'cancellation_policy' => $request->input('cancellationPolicy', 'Hủy miễn phí 100% trước 48h nhận phòng.'),
                'status' => 'published',
                'is_featured' => true,
            ]);

            // 2. Thêm Album ảnh Accommodation
            $images = $request->input('images', []);
            foreach ($images as $index => $imgUrl) {
                AccommodationImage::create([
                    'accommodation_id' => $accommodation->id,
                    'image_url' => $imgUrl,
                    'caption' => 'Không gian ' . $accommodation->name_vi,
                    'display_order' => $index + 1,
                    'is_thumbnail' => ($index === 0),
                ]);
            }

            // 3. Gắn Tiện ích (Amenities)
            $amenityNames = $request->input('amenities', []);
            if (!empty($amenityNames)) {
                $amenityIds = [];
                foreach ($amenityNames as $aName) {
                    $amenity = Amenity::firstOrCreate(
                        ['name_vi' => $aName],
                        ['icon_name' => 'TbCheck', 'category' => 'general']
                    );
                    $amenityIds[] = $amenity->id;
                }
                $accommodation->amenities()->sync($amenityIds);
            }

            // 4. Tạo Room chính dưới Accommodation
            $room = Room::create([
                'accommodation_id' => $accommodation->id,
                'room_name_vi' => $accommodation->name_vi,
                'room_type_code' => $accommodation->accommodation_type,
                'space_type' => 'entire_place',
                'description' => $accommodation->description,
                'room_size_m2' => $request->input('roomSizeM2', 75.0),
                'price_vnd_per_night' => $priceVND,
                'price_usd_per_night' => $priceUSD,
                'cleaning_fee_vnd' => $cleaningFeeVND,
                'cleaning_fee_usd' => $cleaningFeeUSD,
                'service_fee_percent' => 12.00,
                'max_guests' => (int)$request->input('maxGuests'),
                'bedrooms_count' => (int)$request->input('bedrooms'),
                'beds_count' => (int)$request->input('beds'),
                'bathrooms_count' => (float)$request->input('bathrooms'),
                'total_inventory' => 1,
                'rating' => 5.00,
                'reviews_count' => 0,
                'is_guest_favorite' => true,
                'status' => 'available',
            ]);

            // 5. Thêm Album ảnh Room
            foreach ($images as $index => $imgUrl) {
                RoomImage::create([
                    'room_id' => $room->id,
                    'image_url' => $imgUrl,
                    'caption' => 'Ảnh phòng',
                    'display_order' => $index + 1,
                    'is_thumbnail' => ($index === 0),
                ]);
            }

            if (!empty($amenityIds)) {
                $room->amenities()->sync($amenityIds);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký chỗ nghỉ mới thành công! Phòng của bạn đã sẵn sàng đón khách.',
                'data' => [
                    'accommodationId' => $accommodation->id,
                    'roomId' => $room->id,
                    'nameVi' => $accommodation->name_vi,
                    'status' => $accommodation->status,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lưu chỗ nghỉ: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bật/Tắt trạng thái mở bán của chỗ ở (Toggle Active/Paused)
     */
    public function toggleStatus(Request $request, $id): JsonResponse
    {
        $host = $this->getCurrentHost();
        $accommodation = Accommodation::where('id', $id)->where('host_id', $host->id)->first();

        if (!$accommodation) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chỗ ở.'], 404);
        }

        $newStatus = $accommodation->status === 'published' ? 'paused' : 'published';
        $accommodation->update(['status' => $newStatus]);

        // Cập nhật trạng thái các phòng liên quan
        $roomStatus = $newStatus === 'published' ? 'available' : 'hidden';
        $accommodation->rooms()->update(['status' => $roomStatus]);

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'published' ? 'Đã kích hoạt mở bán chỗ ở thành công!' : 'Đã tạm dừng nhận khách cho chỗ ở này.',
            'status' => $newStatus,
        ]);
    }

    /**
     * Xóa / Lưu trữ chỗ ở
     */
    public function deleteAccommodation(Request $request, $id): JsonResponse
    {
        $host = $this->getCurrentHost();
        $accommodation = Accommodation::where('id', $id)->where('host_id', $host->id)->first();

        if (!$accommodation) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chỗ ở.'], 404);
        }

        $accommodation->rooms()->delete();
        $accommodation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa chỗ ở thành công.',
        ]);
    }

    /**
     * Lấy danh sách đơn đặt phòng của Host
     */
    public function getHostBookings(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        $roomIds = Room::whereHas('accommodation', function ($q) use ($host) {
            $q->where('host_id', $host->id);
        })->pluck('id');

        $status = $request->query('status');
        $query = Booking::whereIn('room_id', $roomIds)->with(['room.accommodation', 'user']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get()->map(function ($b) {
            return [
                'id' => $b->id,
                'bookingCode' => $b->booking_code ?: ('TN-' . $b->id),
                'guestName' => $b->guest_name ?: $b->user?->full_name ?: 'Khách TripNest',
                'guestEmail' => $b->guest_email ?: $b->user?->account?->email ?: 'guest@email.com',
                'guestPhone' => $b->guest_phone ?: $b->user?->phone_number ?: '0912345678',
                'roomTitle' => $b->room?->room_name_vi ?: $b->room?->accommodation?->name_vi ?: 'Biệt thự nghỉ dưỡng',
                'checkIn' => $b->check_in_date?->format('Y-m-d') ?: '2026-08-25',
                'checkOut' => $b->check_out_date?->format('Y-m-d') ?: '2026-08-28',
                'nights' => $b->nights_count ?: 3,
                'guests' => $b->guests_count ?: 2,
                'totalAmount' => (float)$b->total_amount_vnd,
                'hostPayoutAmount' => (float)($b->host_payout_amount_vnd ?: ($b->total_amount_vnd * 0.88)),
                'status' => $b->status ?: 'confirmed',
                'createdAt' => $b->created_at?->format('d/m/Y H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $bookings,
            'total' => $bookings->count(),
        ]);
    }

    /**
     * Lấy thông tin tài khoản Payout & Lịch sử nhận tiền
     */
    public function getPayouts(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        $payoutAccount = $host->defaultPayoutAccount;

        // Mock danh sách giao dịch chi trả nếu chưa có
        $transactions = PayoutTransaction::where('host_id', $host->id)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($transactions->isEmpty()) {
            $transactions = [
                [
                    'id' => 'PO-98214',
                    'amount' => 15200000,
                    'bankName' => $payoutAccount?->bank_name ?: 'Vietcombank',
                    'accountNumber' => $payoutAccount?->account_number ?: '9988776655',
                    'status' => 'completed',
                    'date' => '15/08/2026',
                    'note' => 'Quyết toán doanh thu tuần 2 tháng 8',
                ],
                [
                    'id' => 'PO-97451',
                    'amount' => 23680000,
                    'bankName' => $payoutAccount?->bank_name ?: 'Vietcombank',
                    'accountNumber' => $payoutAccount?->account_number ?: '9988776655',
                    'status' => 'completed',
                    'date' => '01/08/2026',
                    'note' => 'Quyết toán doanh thu tuần 1 tháng 8',
                ],
            ];
        }

        return response()->json([
            'success' => true,
            'payoutAccount' => $payoutAccount,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Cập nhật tài khoản ngân hàng nhận tiền Payout
     */
    public function updatePayoutAccount(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bankName' => 'required|string|max:100',
            'accountNumber' => 'required|string|max:50',
            'accountHolderName' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $host = $this->getCurrentHost();
        $account = HostPayoutAccount::updateOrCreate(
            ['host_id' => $host->id, 'is_default' => true],
            [
                'bank_name' => $request->input('bankName'),
                'account_number' => $request->input('accountNumber'),
                'account_holder_name' => mb_strtoupper($request->input('accountHolderName')),
                'is_verified' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật tài khoản ngân hàng nhận tiền thành công!',
            'payoutAccount' => $account,
        ]);
    }
}

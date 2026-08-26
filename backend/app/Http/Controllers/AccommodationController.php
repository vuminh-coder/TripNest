<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccommodationController extends Controller
{
    /**
     * Danh sách Cơ sở lưu trú (Accommodations) hiển thị trên Trang Chủ
     */
    public function index(Request $request): JsonResponse
    {
        $query = Accommodation::with([
            'host.user',
            'category',
            'images',
            'amenities',
            'rooms.images',
            'rooms.amenities',
            'rooms.reviews',
        ])->where('status', 'published');

        // 1. Lọc theo danh mục phong cách
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $categorySlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // 2. Tìm kiếm theo từ khóa (Tên cơ sở, Thành phố, Địa chỉ)
        if ($request->filled('search')) {
            $search = mb_strtolower($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name_vi', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // 3. Lọc theo loại hình (hotel, resort, villa, homestay...)
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('accommodation_type', $request->input('type'));
        }

        // 4. Lọc theo khoảng giá tối thiểu/tối đa
        if ($request->filled('minPrice')) {
            $minPrice = (float)$request->input('minPrice');
            $query->whereHas('rooms', function ($q) use ($minPrice) {
                $q->where('price_per_night', '>=', $minPrice);
            });
        }
        if ($request->filled('maxPrice')) {
            $maxPrice = (float)$request->input('maxPrice');
            $query->whereHas('rooms', function ($q) use ($maxPrice) {
                $q->where('price_per_night', '<=', $maxPrice);
            });
        }

        // 5. Lọc theo số lượng khách
        if ($request->filled('guests')) {
            $guests = (int)$request->input('guests');
            $query->whereHas('rooms', function ($q) use ($guests) {
                $q->where('max_guests', '>=', $guests);
            });
        }

        $accommodations = $query->get()->map(function ($accom) {
            return $this->formatAccommodationData($accom, false);
        });

        return response()->json($accommodations);
    }

    /**
     * Chi tiết 1 Cơ sở lưu trú KÈM toàn bộ danh sách các hạng phòng con
     */
    public function show($id): JsonResponse
    {
        $accommodation = Accommodation::with([
            'host.user',
            'category',
            'images',
            'amenities',
            'rooms.images',
            'rooms.amenities',
            'rooms.reviews.user',
        ])->find($id);

        if (!$accommodation) {
            return response()->json(['message' => 'Không tìm thấy cơ sở lưu trú.'], 404);
        }

        return response()->json($this->formatAccommodationData($accommodation, true));
    }

    /**
     * Format dữ liệu chuẩn hóa cho Frontend
     */
    private function formatAccommodationData(Accommodation $accom, bool $detailed = false): array
    {
        $host = $accom->host;
        $hostUser = $host?->user;

        $images = $accom->images->pluck('image_url')->toArray();
        if (empty($images)) {
            $images = ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'];
        }

        $amenityNames = $accom->amenities->pluck('name_vi')->toArray();

        $rooms = $accom->rooms->where('status', 'available');
        $minPrice = $rooms->min('price_per_night') ?? 2000000;
        $maxPrice = $rooms->max('price_per_night') ?? 5000000;
        $avgRating = $rooms->avg('rating') ?? 4.95;
        $totalReviews = $rooms->sum('reviews_count');

        $formattedRooms = $rooms->map(function ($r) {
            $rImages = $r->images->pluck('image_url')->toArray();
            if (empty($rImages)) {
                $rImages = ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'];
            }

            return [
                'id' => $r->id,
                'accommodationId' => $r->accommodation_id,
                'title' => $r->room_name_vi,
                'roomNameVi' => $r->room_name_vi,
                'roomNameEn' => $r->room_name_en,
                'roomTypeCode' => $r->room_type_code,
                'spaceType' => $r->space_type,
                'description' => $r->description,
                'pricePerNight' => (float)$r->price_per_night,
                'priceVND' => (float)$r->price_per_night,
                'priceUSD' => round((float)$r->price_per_night / 25450),
                'cleaningFee' => (float)$r->cleaning_fee,
                'serviceFeePercent' => (float)$r->service_fee_percent,
                'maxGuests' => $r->max_guests,
                'bedroomsCount' => $r->bedrooms_count,
                'bedsCount' => $r->beds_count,
                'bathroomsCount' => (float)$r->bathrooms_count,
                'roomSizeM2' => (float)$r->room_size_m2,
                'rating' => (float)$r->rating,
                'reviewsCount' => $r->reviews_count,
                'isGuestFavorite' => (bool)$r->is_guest_favorite,
                'images' => $rImages,
                'amenities' => $r->amenities->pluck('name_vi')->toArray(),
            ];
        })->values()->toArray();

        $allReviews = collect();
        foreach ($rooms as $r) {
            foreach ($r->reviews as $rev) {
                $allReviews->push([
                    'id' => $rev->id,
                    'userName' => $rev->user?->full_name ?? 'Khách du lịch TripNest',
                    'userAvatar' => $rev->user?->avatar_url ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    'nationality' => $rev->user?->nationality ?? 'Việt Nam',
                    'roomName' => $r->room_name_vi,
                    'rating' => (float)$rev->rating,
                    'score10' => round((float)$rev->rating * 2, 1),
                    'stayDuration' => '2 đêm · Tháng 08/2026',
                    'travelerType' => 'Cặp đôi',
                    'comment' => $rev->comment,
                    'positivePoint' => 'Phòng ốc cực kỳ sang trọng, view ngắm cảnh tuyệt đẹp và nhân viên phục vụ rất chu đáo tận tâm.',
                    'negativePoint' => null,
                    'createdAt' => $rev->created_at ? $rev->created_at->format('d/m/Y') : '26/08/2026',
                    'hostResponse' => $rev->host_response ?? 'Cảm ơn quý khách đã tin chọn nghỉ dưỡng tại ' . $accom->name_vi . '. Chúng tôi rất hân hạnh được phục vụ bạn!',
                ]);
            }
        }

        if ($allReviews->isEmpty()) {
            $allReviews->push([
                'id' => 1,
                'userName' => 'Nguyễn Thu Trang',
                'userAvatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
                'nationality' => 'Hà Nội, Việt Nam',
                'roomName' => $formattedRooms[0]['title'] ?? 'Phòng Deluxe 5 Sao',
                'rating' => 5.0,
                'score10' => 9.8,
                'stayDuration' => '3 đêm · Kỳ nghỉ lãng mạn',
                'travelerType' => 'Cặp đôi',
                'comment' => 'Kỳ nghỉ trên cả tuyệt vời tại ' . $accom->name_vi . '! Không gian sân vườn yên tĩnh, bữa sáng buffet phong phú và giường ngủ êm ái tuyệt đối.',
                'positivePoint' => 'Hồ bơi nước ấm ngắm cảnh đồi thông cực chill, nhân viên lễ tân hỗ trợ nhiệt tình 24/7.',
                'negativePoint' => null,
                'createdAt' => '25/08/2026',
                'hostResponse' => 'Cảm ơn chị Thu Trang đã dành thời gian đánh giá và ủng hộ cơ sở. Hẹn gặp lại quý khách vào kỳ nghỉ tiếp theo!',
            ]);
            $allReviews->push([
                'id' => 2,
                'userName' => 'Trần Minh Đức',
                'userAvatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                'nationality' => 'TP. Hồ Chí Minh, Việt Nam',
                'roomName' => $formattedRooms[1]['title'] ?? 'Suite Cao Cấp',
                'rating' => 4.9,
                'score10' => 9.5,
                'stayDuration' => '2 đêm · Chuyến công tác kết hợp nghỉ dưỡng',
                'travelerType' => 'Du khách một mình',
                'comment' => 'Dịch vụ chuẩn quốc tế 5 sao. Wifi tốc độ cao làm việc mượt mà, phòng tắm bồn Jacuzzi ngâm mình rất thư giãn.',
                'positivePoint' => 'Vị trí đắc địa dễ dàng di chuyển vào trung tâm và các điểm tham quan.',
                'negativePoint' => null,
                'createdAt' => '20/08/2026',
                'hostResponse' => 'TripNest rất vui vì mang lại trải nghiệm tiện nghi và thư thái cho anh Đức!',
            ]);
        }

        $bookingScore = round($avgRating * 2, 1);
        if ($bookingScore > 10) $bookingScore = 9.8;
        if ($bookingScore < 9.0) $bookingScore = 9.4;

        $surroundings = [
            ['name' => 'Trung tâm thành phố ' . $accom->city, 'distance' => '1.5 km', 'type' => 'center'],
            ['name' => 'Khu ẩm thực & Chợ đêm ' . $accom->city, 'distance' => '800 m', 'type' => 'food'],
            ['name' => 'Điểm ngắm cảnh / Bờ biển / Hồ nước trung tâm', 'distance' => '350 m', 'type' => 'nature'],
            ['name' => 'Sân bay / Ga xe buýt liên tỉnh', 'distance' => '25 km', 'type' => 'transport'],
        ];

        $data = [
            'id' => $accom->id,
            'accommodationId' => $accom->id,
            'title' => $accom->name_vi,
            'nameVi' => $accom->name_vi,
            'nameEn' => $accom->name_en,
            'accommodationType' => $accom->accommodation_type,
            'starRating' => $accom->star_rating ?? 5,
            'city' => $accom->city,
            'district' => $accom->district,
            'address' => $accom->address,
            'distance' => $accom->distance_description ?? ('Vị trí tuyệt vời · Cách trung tâm ' . $accom->city . ' 1.5 km'),
            'description' => $accom->description,
            'category' => $accom->category?->slug ?? 'all',
            'categoryLabel' => $accom->category?->label_vi ?? 'Nổi bật',
            'isFeatured' => (bool)$accom->is_featured,
            'isGuestFavorite' => true,
            'images' => $images,
            'amenities' => $amenityNames,
            'rating' => round($avgRating, 2),
            'reviewsCount' => (int)($totalReviews > 0 ? $totalReviews : 364),
            'bookingScore' => $bookingScore,
            'bookingScoreLabel' => $bookingScore >= 9.0 ? 'Xuất sắc' : 'Tuyệt vời',
            'reviewScoresBreakdown' => [
                'staff' => 9.7,
                'facilities' => 9.5,
                'cleanliness' => 9.8,
                'comfort' => 9.6,
                'value' => 9.3,
                'location' => 9.9,
                'freeWifi' => 9.7,
            ],
            'checkInTime' => '14:00 - 23:30',
            'checkOutTime' => '06:00 - 12:00',
            'houseRules' => [
                'Nhận phòng từ 14:00 - Xuất trình CMND/CCCD hoặc Hộ chiếu khi làm thủ tục',
                'Trả phòng trước 12:00 trưa',
                'Phù hợp cho mọi độ tuổi · Trẻ em dưới 6 tuổi lưu trú miễn phí',
                'Không hút thuốc trong phòng nghỉ (có khu vực hút thuốc riêng ngoài trời)',
                'Không mang thú cưng (hoặc liên hệ lễ tân để được hỗ trợ phòng chuyên biệt)',
                'Giữ yên tĩnh chung sau 22:00',
            ],
            'cancellationPolicy' => 'HỦY MIỄN PHÍ trước 48 giờ so với ngày nhận phòng. Đặt phòng hôm nay và thanh toán khi nhận phòng tại chỗ nghỉ.',
            'surroundings' => $surroundings,
            'reviewsList' => $allReviews->values()->toArray(),
            'priceFrom' => (float)$minPrice,
            'priceTo' => (float)$maxPrice,
            'priceVND' => (float)$minPrice,
            'priceUSD' => round((float)$minPrice / 25450),
            'roomsCount' => count($formattedRooms),
            'rooms' => $formattedRooms,
            'host' => [
                'id' => $host?->id ?? 1,
                'name' => $hostUser?->full_name ?? 'Chủ nhà TripNest',
                'displayName' => $host?->host_display_name ?? 'Chủ nhà TripNest',
                'avatar' => $hostUser?->avatar_url ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                'isSuperhost' => (bool)($host?->is_superhost ?? true),
                'rating' => (float)($host?->host_rating ?? 4.98),
                'reviewsCount' => (int)($host?->host_reviews_count ?? 150),
                'joinedDate' => $host ? $host->created_at->format('m/Y') : '06/2024',
                'responseTime' => $host?->response_time_text ?? 'trong vòng 1 giờ',
                'responseRate' => (int)($host?->response_rate_percent ?? 100),
                'bio' => $host?->host_introduction ?? 'Chào mừng quý khách đến với không gian nghỉ dưỡng tuyệt vời của chúng tôi!',
            ],
        ];

        return $data;
    }
}

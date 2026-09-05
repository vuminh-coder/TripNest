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
            'rooms.reviews.booking',
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

            $rReviews = $r->reviews->where('status', '!=', 'hidden')->map(function ($rev) use ($r) {
                return [
                    'id' => $rev->id,
                    'userName' => $rev->user?->full_name ?? 'Khách du lịch TripNest',
                    'userAvatar' => $rev->user?->avatar_url ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    'nationality' => $rev->user?->nationality ?? 'Việt Nam',
                    'roomName' => $r->room_name_vi,
                    'rating' => (float)$rev->rating,
                    'comment' => $rev->comment,
                    'createdAt' => $rev->created_at ? $rev->created_at->format('d/m/Y') : '26/08/2026',
                    'hostResponse' => $rev->host_response ?: null,
                ];
            })->values()->toArray();

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
                'cleaning_fee_vnd' => (float)$r->cleaning_fee,
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
                'reviewsList' => $rReviews,
            ];
        })->values()->toArray();

        $allReviews = collect();
        foreach ($rooms as $r) {
            foreach ($r->reviews as $rev) {
                if ($rev->status === 'hidden') continue;
                $radar = $rev->rating_breakdown ?: [];
                $nights = $rev->booking ? (int)$rev->booking->nights_count : 2;
                $monthYear = $rev->booking && $rev->booking->check_in_date 
                    ? $rev->booking->check_in_date->format('m/Y') 
                    : ($rev->created_at ? $rev->created_at->format('m/Y') : '08/2026');

                $allReviews->push([
                    'id' => $rev->id,
                    'userName' => $rev->user?->full_name ?? 'Khách du lịch TripNest',
                    'userAvatar' => $rev->user?->avatar_url ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    'nationality' => $rev->user?->nationality ?? 'Việt Nam',
                    'roomName' => $r->room_name_vi,
                    'rating' => (float)$rev->rating,
                    'score10' => round((float)$rev->rating * 2, 1),
                    'stayDuration' => "{$nights} đêm · Tháng {$monthYear}",
                    'travelerType' => 'Du khách thực tế',
                    'comment' => $rev->comment,
                    'radar' => $radar,
                    'cleanliness' => (float)($radar['cleanliness'] ?? $rev->rating),
                    'accuracy' => (float)($radar['accuracy'] ?? $rev->rating),
                    'communication' => (float)($radar['communication'] ?? $rev->rating),
                    'location' => (float)($radar['location'] ?? $rev->rating),
                    'checkin' => (float)($radar['checkin'] ?? $rev->rating),
                    'value' => (float)($radar['value'] ?? $rev->rating),
                    'positivePoint' => 'Phòng ốc chuẩn tiện nghi, không gian thoáng đãng và dịch vụ rất chu đáo.',
                    'negativePoint' => null,
                    'createdAt' => $rev->created_at ? $rev->created_at->format('d/m/Y') : '26/08/2026',
                    'rawCreatedAt' => $rev->created_at ? $rev->created_at->timestamp : 0,
                    'hostResponse' => $rev->host_response ?: null,
                ]);
            }
        }

        // Sắp xếp bài đánh giá mới nhất lên đầu (Newest First)
        $allReviews = $allReviews->sortByDesc('rawCreatedAt')->values();

        if ($allReviews->isNotEmpty()) {
            // Quy đổi sang thang điểm 10 chuẩn UX TripNest
            $cleanlinessScore = round(($allReviews->avg('cleanliness') ?: 4.9) * 2, 1);
            $locationScore = round(($allReviews->avg('location') ?: 4.9) * 2, 1);
            $accuracyScore = round(($allReviews->avg('accuracy') ?: 4.9) * 2, 1);
            $communicationScore = round(($allReviews->avg('communication') ?: 4.9) * 2, 1);
            $checkinScore = round(($allReviews->avg('checkin') ?: 4.9) * 2, 1);
            $valueScore = round(($allReviews->avg('value') ?: 4.9) * 2, 1);
            $realAvgRating = round($allReviews->avg('rating') ?: 4.98, 2);
            $realReviewsCount = $allReviews->count();
        } else {
            $cleanlinessScore = 9.8;
            $locationScore = 9.9;
            $accuracyScore = 9.6;
            $communicationScore = 9.7;
            $checkinScore = 9.7;
            $valueScore = 9.5;
            $realAvgRating = round($avgRating, 2);
            $realReviewsCount = (int)($totalReviews > 0 ? $totalReviews : 0);
        }

        $reviewScoresBreakdown = [
            'cleanliness' => min(10, max(5, $cleanlinessScore)),
            'location' => min(10, max(5, $locationScore)),
            'facilities' => min(10, max(5, $accuracyScore)),
            'accuracy' => min(10, max(5, $accuracyScore)),
            'comfort' => min(10, max(5, $checkinScore)),
            'staff' => min(10, max(5, $communicationScore)),
            'communication' => min(10, max(5, $communicationScore)),
            'value' => min(10, max(5, $valueScore)),
            'freeWifi' => 9.8,
        ];

        $bookingScore = round($realAvgRating * 2, 1);
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
            'latitude' => $accom->latitude ? (float)$accom->latitude : null,
            'longitude' => $accom->longitude ? (float)$accom->longitude : null,
            'distance' => $accom->distance_description ?? ('Vị trí tuyệt vời · Cách trung tâm ' . $accom->city . ' 1.5 km'),
            'description' => $accom->description,
            'category' => $accom->category?->slug ?? 'all',
            'categoryLabel' => $accom->category?->label_vi ?? 'Nổi bật',
            'specs' => [
                'guests' => (int)($rooms->max('max_guests') ?: 4),
                'bedrooms' => (int)($rooms->max('bedrooms_count') ?: 2),
                'beds' => (int)($rooms->max('beds_count') ?: 2),
                'bathrooms' => (float)($rooms->max('bathrooms_count') ?: 2.0),
                'size' => (float)($rooms->max('room_size_m2') ?: 75.0),
            ],
            'maxGuests' => (int)($rooms->max('max_guests') ?: 4),
            'location' => trim($accom->address . ($accom->district ? ', ' . $accom->district : '') . ', ' . $accom->city . ', Việt Nam'),
            'type' => $accom->accommodation_type === 'villa' ? 'Entire villa' : ucfirst($accom->accommodation_type),
            'dates' => 'Khả dụng cho mọi ngày nghỉ',
            'isFeatured' => (bool)$accom->is_featured,
            'isGuestFavorite' => true,
            'images' => $images,
            'amenities' => $amenityNames,
            'rating' => $realAvgRating,
            'reviewsCount' => $realReviewsCount,
            'bookingScore' => $bookingScore,
            'bookingScoreLabel' => $bookingScore >= 9.0 ? 'Xuất sắc' : 'Tuyệt vời',
            'reviewScoresBreakdown' => $reviewScoresBreakdown,
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
            'reviewsList' => $allReviews->toArray(),
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

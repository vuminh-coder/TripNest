<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Danh sách phòng và bộ lọc đa tiêu chí
     */
    public function index(Request $request): JsonResponse
    {
        $query = Room::with([
            'accommodation.host.user',
            'accommodation.category',
            'images',
            'amenities',
        ])->where('status', 'available');

        // 1. Lọc theo danh mục
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $categorySlug = $request->input('category');
            $query->whereHas('accommodation.category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // 2. Tìm kiếm từ khóa địa điểm / tên phòng
        if ($request->filled('search')) {
            $search = mb_strtolower($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('room_name_vi', 'like', "%{$search}%")
                  ->orWhere('room_name_en', 'like', "%{$search}%")
                  ->orWhereHas('accommodation', function ($sq) use ($search) {
                      $sq->where('city', 'like', "%{$search}%")
                         ->orWhere('address', 'like', "%{$search}%")
                         ->orWhere('name_vi', 'like', "%{$search}%");
                  });
            });
        }

        // 3. Lọc theo khoảng giá (VND — tiền tệ duy nhất trong DB)
        if ($request->filled('minPrice')) {
            $query->where('price_per_night', '>=', (float)$request->input('minPrice'));
        }
        if ($request->filled('maxPrice')) {
            $query->where('price_per_night', '<=', (float)$request->input('maxPrice'));
        }

        // 4. Lọc theo số lượng khách
        if ($request->filled('guests')) {
            $query->where('max_guests', '>=', (int)$request->input('guests'));
        }

        // 5. Lọc theo số phòng ngủ
        if ($request->filled('bedrooms') && $request->input('bedrooms') !== 'any') {
            $query->where('bedrooms_count', '>=', (int)$request->input('bedrooms'));
        }

        // 6. Lọc theo tiện ích (amenities)
        if ($request->filled('amenities') && is_array($request->input('amenities')) && count($request->input('amenities')) > 0) {
            foreach ($request->input('amenities') as $amenityKeyword) {
                $query->whereHas('amenities', function ($q) use ($amenityKeyword) {
                    $q->where('name_vi', 'like', "%{$amenityKeyword}%")
                      ->orWhere('code', 'like', "%{$amenityKeyword}%");
                });
            }
        }

        $rooms = $query->get()->map(function ($room) {
            return $this->formatRoomData($room);
        });

        return response()->json($rooms);
    }

    /**
     * Chi tiết 1 phòng
     */
    public function show($id): JsonResponse
    {
        $room = Room::with([
            'accommodation.host.user',
            'accommodation.category',
            'images',
            'amenities',
            'reviews.user',
        ])->find($id);

        if (!$room) {
            return response()->json(['message' => 'Không tìm thấy phòng.'], 404);
        }

        return response()->json($this->formatRoomData($room, true));
    }

    /**
     * Format dữ liệu phòng chuẩn hóa cho Frontend
     */
    private function formatRoomData(Room $room, bool $detailed = false): array
    {
        $accommodation = $room->accommodation;
        $host = $accommodation?->host;
        $hostUser = $host?->user;

        $images = $room->images->pluck('image_url')->toArray();
        if (empty($images)) {
            $images = ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80'];
        }

        $amenityNames = $room->amenities->pluck('name_vi')->toArray();

        // Tính radar reviews breakdown trung bình từ JSON rating_breakdown
        $reviews = $room->reviews;
        $cleanlinessAvg = $reviews->avg(fn($r) => $r->rating_breakdown['cleanliness'] ?? null);
        $accuracyAvg = $reviews->avg(fn($r) => $r->rating_breakdown['accuracy'] ?? null);
        $commAvg = $reviews->avg(fn($r) => $r->rating_breakdown['communication'] ?? null);
        $locAvg = $reviews->avg(fn($r) => $r->rating_breakdown['location'] ?? null);
        $checkinAvg = $reviews->avg(fn($r) => $r->rating_breakdown['checkin'] ?? null);
        $valueAvg = $reviews->avg(fn($r) => $r->rating_breakdown['value'] ?? null);

        $radar = [
            'cleanliness' => $cleanlinessAvg ? round($cleanlinessAvg, 1) : 4.9,
            'accuracy' => $accuracyAvg ? round($accuracyAvg, 1) : 5.0,
            'communication' => $commAvg ? round($commAvg, 1) : 5.0,
            'location' => $locAvg ? round($locAvg, 1) : 4.9,
            'checkIn' => $checkinAvg ? round($checkinAvg, 1) : 5.0,
            'value' => $valueAvg ? round($valueAvg, 1) : 4.9,
        ];

        // Giá VND là gốc, quy đổi USD qua bảng tỷ giá
        $priceVND = (float)$room->price_per_night;
        $cleaningFeeVND = (float)$room->cleaning_fee;

        $data = [
            'id' => $room->id,
            'accommodationId' => $accommodation?->id,
            'title' => $room->room_name_vi,
            'titleEn' => $room->room_name_en,
            'category' => $accommodation?->category?->slug ?: 'views',
            'type' => $room->space_type === 'entire_place' ? 'Entire ' . ($accommodation?->accommodation_type ?: 'villa') : 'Private room',
            'location' => $accommodation?->address . ', ' . $accommodation?->city . ', ' . $accommodation?->country,
            'city' => $accommodation?->city ?: 'Đà Lạt',
            'country' => $accommodation?->country ?: 'Việt Nam',
            'distance' => $accommodation?->distance_description ?: 'Cách trung tâm 4.2 km',
            'dates' => 'Ngày 12 - 17 tháng 10',
            'priceVND' => $priceVND,
            'priceUSD' => ExchangeRate::convert($priceVND, 'USD'),
            'cleaningFeeVND' => $cleaningFeeVND,
            'cleaningFeeUSD' => ExchangeRate::convert($cleaningFeeVND, 'USD'),
            'serviceFeePercent' => (float)$room->service_fee_percent,
            'rating' => (float)$room->rating,
            'reviewsCount' => (int)$room->reviews_count,
            'isGuestFavorite' => (bool)$room->is_guest_favorite,
            'isSuperhost' => (bool)($host?->is_superhost ?? true),
            'images' => $images,
            'host' => [
                'id' => $host?->id,
                'name' => $host?->host_display_name ?: 'Chủ nhà TripNest',
                'avatar' => $host?->host_avatar_url ?: $hostUser?->avatar_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'joined' => 'Tham gia tháng ' . ($host?->created_at ? $host->created_at->format('m/Y') : '3/2021'),
                'rating' => (float)($host?->host_rating ?? 4.98),
                'reviews' => (int)($host?->host_reviews_count ?? 310),
                'isSuperhost' => (bool)($host?->is_superhost ?? true),
                'responseTime' => $host?->response_time_text ?: 'trong vòng 1 giờ',
                'responseRate' => (int)($host?->response_rate_percent ?? 100),
            ],
            'specs' => [
                'guests' => (int)$room->max_guests,
                'bedrooms' => (int)$room->bedrooms_count,
                'beds' => (int)$room->beds_count,
                'bathrooms' => (float)$room->bathrooms_count,
                'roomSizeM2' => (float)$room->room_size_m2,
            ],
            'amenities' => $amenityNames,
            'description' => $room->description,
            'reviewsBreakdown' => $radar,
            'accommodation' => [
                'id' => $accommodation?->id,
                'nameVi' => $accommodation?->name_vi,
                'nameEn' => $accommodation?->name_en,
                'accommodationType' => $accommodation?->accommodation_type,
                'starRating' => $accommodation?->star_rating ?? 5,
                'address' => $accommodation?->address,
                'city' => $accommodation?->city,
                'images' => $accommodation?->images->pluck('image_url')->toArray() ?: [],
            ],
        ];

        if ($detailed) {
            $data['reviewsList'] = $reviews->map(function ($rev) {
                return [
                    'id' => $rev->id,
                    'userName' => $rev->user?->full_name ?: 'Khách du lịch',
                    'userAvatar' => $rev->user?->avatar_url,
                    'rating' => (float)$rev->rating,
                    'ratingBreakdown' => $rev->rating_breakdown,
                    'comment' => $rev->comment,
                    'createdAt' => $rev->created_at ? $rev->created_at->format('d/m/Y') : '',
                    'hostResponse' => $rev->host_response,
                ];
            });

            // Get sibling rooms in same accommodation
            if ($accommodation) {
                $data['siblingRooms'] = $accommodation->rooms()
                    ->where('id', '!=', $room->id)
                    ->where('status', 'available')
                    ->with('images', 'amenities')
                    ->get()
                    ->map(function ($sr) {
                        return [
                            'id' => $sr->id,
                            'title' => $sr->room_name_vi,
                            'pricePerNight' => (float)$sr->price_per_night,
                            'priceVND' => (float)$sr->price_per_night,
                            'priceUSD' => round((float)$sr->price_per_night / 25450),
                            'maxGuests' => $sr->max_guests,
                            'roomSizeM2' => (float)$sr->room_size_m2,
                            'rating' => (float)$sr->rating,
                            'images' => $sr->images->pluck('image_url')->toArray(),
                        ];
                    });
            }
        }

        return $data;
    }
}

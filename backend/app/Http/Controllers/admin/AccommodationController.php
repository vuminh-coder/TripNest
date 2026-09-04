<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Category;
use App\Models\Host;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class AccommodationController extends Controller
{
    /**
     * Danh sách tất cả cơ sở lưu trú cho Admin
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $accommodations = Accommodation::with([
                'host:id,user_id,host_display_name,is_superhost,host_rating,host_reviews_count',
                'host.user:id,full_name,avatar_url',
                'category:id,slug,label_vi',
                'images',
                'rooms.images',
                'rooms.amenities',
            ])->orderBy('id', 'desc')->get()->map(function ($acc) {
                $mainRoom = $acc->rooms->first();
                $thumbnail = $acc->images->firstWhere('is_thumbnail', true)?->image_url
                    ?: $acc->images->first()?->image_url
                    ?: $mainRoom?->images->first()?->image_url
                    ?: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800';

                $minPrice = $acc->rooms->min('price_per_night') ?: 2000000;
                $avgRating = $acc->rooms->avg('rating') ?: 4.95;
                $totalReviews = $acc->rooms->sum('reviews_count') ?: 0;

                return [
                    'id' => $acc->id,
                    'accommodationId' => $acc->id,
                    'name_vi' => $acc->name_vi,
                    'name_en' => $acc->name_en,
                    'title' => $acc->name_vi,
                    'type' => $acc->accommodation_type,
                    'accommodation_type' => $acc->accommodation_type,
                    'star_rating' => $acc->star_rating ?? 5,
                    'city' => $acc->city,
                    'district' => $acc->district,
                    'address' => $acc->address,
                    'description' => $acc->description,
                    'category' => $acc->category?->slug ?: 'views',
                    'category_name' => $acc->category?->label_vi ?: 'Khung cảnh tuyệt đẹp',
                    'status' => $acc->status,
                    'is_featured' => (bool)$acc->is_featured,
                    'is_verified' => true,
                    'thumbnail' => $thumbnail,
                    'images' => $acc->images->pluck('image_url')->toArray(),
                    'rooms_count' => $acc->rooms->count(),
                    'price_from' => (float)$minPrice,
                    'rating' => round((float)$avgRating, 2),
                    'reviews_count' => (int)$totalReviews,
                    'host_id' => $acc->host_id,
                    'host_name' => $acc->host?->host_display_name ?: $acc->host?->user?->full_name ?: 'Chủ nhà TripNest',
                    'host_avatar' => $acc->host?->user?->avatar_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                    'is_superhost' => (bool)($acc->host?->is_superhost ?? false),
                    'created_at' => $acc->created_at ? $acc->created_at->format('Y-m-d') : '',
                ];
            });

            return response()->json([
                'success' => true,
                'accommodations' => $accommodations,
                'data' => $accommodations,
            ]);
        } catch (Throwable $ex) {
            return response()->json(['success' => false, 'message' => $ex->getMessage()], 500);
        }
    }

    /**
     * Admin: Cập nhật trạng thái duyệt / mở bán / tạm dừng cơ sở lưu trú
     */
    public function updateStatus($id, Request $request): JsonResponse
    {
        $accommodation = Accommodation::find($id);
        if (!$accommodation) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy cơ sở lưu trú.'], 404);
        }

        $newStatus = $request->input('status');
        if (in_array($newStatus, ['published', 'paused', 'archived', 'draft'])) {
            $accommodation->update(['status' => $newStatus]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái chỗ nghỉ thành công!',
            'data' => $accommodation,
        ]);
    }

    /**
     * Admin: Bật/tắt huy hiệu Nổi bật (Featured)
     */
    public function toggleFeatured($id): JsonResponse
    {
        $accommodation = Accommodation::find($id);
        if (!$accommodation) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy cơ sở lưu trú.'], 404);
        }

        $accommodation->update(['is_featured' => !$accommodation->is_featured]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật trạng thái nổi bật!',
            'is_featured' => $accommodation->is_featured,
        ]);
    }

    /**
     * Admin: Cập nhật thông tin cơ sở lưu trú
     */
    public function update($id, Request $request): JsonResponse
    {
        $accommodation = Accommodation::find($id);
        if (!$accommodation) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy cơ sở lưu trú.'], 404);
        }

        $accommodation->update([
            'name_vi' => $request->input('name_vi') ?: $request->input('title') ?: $accommodation->name_vi,
            'name_en' => $request->input('name_en') ?: $accommodation->name_en,
            'accommodation_type' => $request->input('accommodation_type') ?: $request->input('type') ?: $accommodation->accommodation_type,
            'city' => $request->input('city') ?: $accommodation->city,
            'address' => $request->input('address') ?: $accommodation->address,
            'description' => $request->input('description') ?: $accommodation->description,
            'star_rating' => $request->filled('star_rating') ? (int)$request->input('star_rating') : $accommodation->star_rating,
            'status' => $request->input('status') ?: $accommodation->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật thông tin cơ sở lưu trú thành công!',
            'data' => $accommodation,
        ]);
    }

    /**
     * Admin: Xóa cơ sở lưu trú
     */
    public function destroy($id): JsonResponse
    {
        $accommodation = Accommodation::find($id);
        if (!$accommodation) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy cơ sở lưu trú.'], 404);
        }

        $accommodation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa cơ sở lưu trú thành công.',
        ]);
    }
}

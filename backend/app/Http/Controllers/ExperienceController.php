<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use App\Models\Experience;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class ExperienceController extends Controller
{
    /**
     * Public: Danh sách các hoạt động trải nghiệm du lịch
     */
    public function index(): JsonResponse
    {
        $experiences = Experience::where('is_active', true)
            ->get()
            ->map(function ($exp) {
                $priceVND = (float)$exp->price_per_person;
                return [
                    'id' => $exp->id,
                    'title' => $exp->title_vi,
                    'category' => 'experiences',
                    'city' => $exp->city,
                    'rating' => $exp->rating . ' (' . $exp->reviews_count . ')',
                    'rentVND' => $priceVND,
                    'rentUSD' => ExchangeRate::convert($priceVND, 'USD'),
                    'background' => $exp->image_url,
                    'caption' => $exp->caption,
                    'duration_hours' => (float)$exp->duration_hours,
                    'description' => $exp->description,
                ];
            });

        return response()->json($experiences);
    }

    /**
     * Admin: Lấy danh sách toàn bộ trải nghiệm
     */
    public function adminIndex(): JsonResponse
    {
        try {
            $experiences = Experience::orderBy('id', 'desc')->get()->map(function ($exp) {
                return [
                    'id' => $exp->id,
                    'title' => $exp->title_vi,
                    'title_en' => $exp->title_en,
                    'city' => $exp->city,
                    'caption' => $exp->caption,
                    'description' => $exp->description,
                    'price' => (float)$exp->price_per_person,
                    'rating' => (float)$exp->rating,
                    'reviews_count' => (int)$exp->reviews_count,
                    'image' => $exp->image_url,
                    'duration_hours' => (float)$exp->duration_hours,
                    'is_active' => (bool)$exp->is_active,
                    'status' => $exp->is_active ? 'active' : 'inactive',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $experiences,
            ]);
        } catch (Throwable $ex) {
            return response()->json(['success' => false, 'message' => $ex->getMessage()], 500);
        }
    }

    /**
     * Admin: Thêm trải nghiệm mới
     */
    public function adminStore(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.'], 422);
        }

        $exp = Experience::create([
            'title_vi' => $request->input('title'),
            'title_en' => $request->input('title_en') ?: $request->input('title'),
            'caption' => $request->input('caption') ?: 'Trải nghiệm hấp dẫn cùng chuyên gia địa phương',
            'description' => $request->input('description') ?: 'Khám phá văn hóa và ẩm thực độc đáo.',
            'city' => $request->input('city'),
            'price_per_person' => (float)$request->input('price'),
            'rating' => 5.0,
            'reviews_count' => 0,
            'image_url' => $request->input('image') ?: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            'duration_hours' => (float)($request->input('duration_hours') ?: 3.0),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo mới hoạt động trải nghiệm thành công!',
            'data' => $exp,
        ]);
    }

    /**
     * Admin: Bật/Tắt trạng thái hoạt động của trải nghiệm
     */
    public function adminToggleActive($id): JsonResponse
    {
        $exp = Experience::find($id);
        if (!$exp) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy trải nghiệm.'], 404);
        }

        $exp->update(['is_active' => !$exp->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật trạng thái trải nghiệm!',
            'data' => $exp,
        ]);
    }

    /**
     * Admin: Xóa trải nghiệm
     */
    public function adminDestroy($id): JsonResponse
    {
        $exp = Experience::find($id);
        if (!$exp) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy trải nghiệm.'], 404);
        }

        $exp->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa trải nghiệm thành công.',
        ]);
    }
}

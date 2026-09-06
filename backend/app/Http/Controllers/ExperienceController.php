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
     * Admin: Lấy danh sách toàn bộ trải nghiệm kèm thông tin Host & thống kê
     */
    public function adminIndex(): JsonResponse
    {
        try {
            $experiences = Experience::with(['host.user'])
                ->orderBy('id', 'desc')
                ->get()
                ->map(function ($exp) {
                    $price = (float)$exp->price_per_person;
                    $host = $exp->host;
                    $hostUser = $host?->user;

                    return [
                        'id' => $exp->id,
                        'host_id' => $exp->host_id,
                        'title' => $exp->title_vi,
                        'title_vi' => $exp->title_vi,
                        'city' => $exp->city,
                        'caption' => $exp->caption,
                        'description' => $exp->description,
                        'price' => $price,
                        'price_per_person' => $price,
                        'priceVND' => $price,
                        'rating' => (float)$exp->rating,
                        'reviews_count' => (int)$exp->reviews_count,
                        'image' => $exp->image_url,
                        'image_url' => $exp->image_url,
                        'duration_hours' => (float)($exp->duration_hours ?: 3.0),
                        'is_active' => (bool)$exp->is_active,
                        'status' => $exp->is_active ? 'active' : 'inactive',
                        'host' => [
                            'id' => $host?->id,
                            'name' => $host?->host_display_name ?: $hostUser?->name ?: 'Chủ tour địa phương',
                            'avatar' => $host?->host_avatar_url ?: $hostUser?->avatar ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
                            'is_superhost' => (bool)($host?->is_superhost),
                            'kyc_status' => $host?->kyc_status ?: 'verified',
                        ],
                    ];
                });

            $total = $experiences->count();
            $activeCount = $experiences->where('is_active', true)->count();
            $inactiveCount = $experiences->where('is_active', false)->count();
            $avgPrice = $total > 0 ? (float)round($experiences->avg('price')) : 0;

            return response()->json([
                'success' => true,
                'data' => $experiences,
                'stats' => [
                    'total' => $total,
                    'activeCount' => $activeCount,
                    'inactiveCount' => $inactiveCount,
                    'avgPrice' => $avgPrice,
                ],
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
            'title' => 'nullable|string|max:255',
            'title_vi' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'price_per_person' => 'nullable|numeric|min:0',
            'duration_hours' => 'nullable|numeric|min:0.5|max:48',
            'host_id' => 'nullable|exists:hosts,id',
        ]);

        $title = trim((string)($request->input('title_vi') ?: $request->input('title')));
        if (empty($title)) {
            return response()->json(['success' => false, 'message' => 'Vui lòng nhập tên hoạt động tour trải nghiệm.'], 422);
        }

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $hostId = $request->input('host_id');
        if (!$hostId) {
            $firstHost = \App\Models\Host::first();
            $hostId = $firstHost ? $firstHost->id : 1;
        }

        $price = (float)($request->input('price_per_person') ?? $request->input('price') ?? 500000);
        $duration = (float)($request->input('duration_hours') ?: 3.0);
        $image = $request->input('image_url') ?: $request->input('image') ?: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800';

        $exp = Experience::create([
            'host_id' => $hostId,
            'title_vi' => $title,
            'caption' => $request->input('caption') ?: 'Khám phá văn hóa và trải nghiệm bản địa đặc sắc',
            'description' => $request->input('description') ?: 'Hành trình cùng hướng dẫn viên bản địa đầy thú vị.',
            'city' => $request->input('city'),
            'price_per_person' => $price,
            'rating' => 5.0,
            'reviews_count' => 0,
            'image_url' => $image,
            'duration_hours' => $duration,
            'is_active' => true,
        ]);

        $exp->load('host.user');

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo mới hoạt động trải nghiệm thành công!',
            'data' => $exp,
        ]);
    }

    /**
     * Admin: Cập nhật thông tin trải nghiệm
     */
    public function adminUpdate(Request $request, $id): JsonResponse
    {
        $exp = Experience::find($id);
        if (!$exp) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy trải nghiệm.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'title_vi' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'price_per_person' => 'nullable|numeric|min:0',
            'duration_hours' => 'nullable|numeric|min:0.5|max:48',
            'host_id' => 'nullable|exists:hosts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $updates = [];
        $title = $request->input('title_vi') ?: $request->input('title');
        if (!empty($title)) {
            $updates['title_vi'] = trim((string)$title);
        }

        if ($request->has('city')) {
            $updates['city'] = trim((string)$request->input('city'));
        }

        if ($request->has('price_per_person') || $request->has('price')) {
            $updates['price_per_person'] = (float)($request->input('price_per_person') ?? $request->input('price'));
        }

        if ($request->has('duration_hours')) {
            $updates['duration_hours'] = (float)$request->input('duration_hours');
        }

        if ($request->has('image_url') || $request->has('image')) {
            $updates['image_url'] = $request->input('image_url') ?: $request->input('image');
        }

        if ($request->has('caption')) {
            $updates['caption'] = $request->input('caption');
        }

        if ($request->has('description')) {
            $updates['description'] = $request->input('description');
        }

        if ($request->has('host_id') && $request->input('host_id')) {
            $updates['host_id'] = $request->input('host_id');
        }

        if ($request->has('is_active')) {
            $updates['is_active'] = (bool)$request->input('is_active');
        }

        $exp->update($updates);
        $exp->load('host.user');

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật hoạt động trải nghiệm thành công!',
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
        $exp->load('host.user');

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

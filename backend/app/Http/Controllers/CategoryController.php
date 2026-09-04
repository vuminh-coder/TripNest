<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Public: Lấy toàn bộ danh mục phong cách chỗ nghỉ đang kích hoạt
     */
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->slug,
                    'slug' => $cat->slug,
                    'label' => $cat->label_vi,
                    'labelEn' => $cat->label_en,
                    'icon' => $cat->icon,
                    'is_active' => (bool)$cat->is_active,
                ];
            });

        return response()->json($categories);
    }

    /**
     * Admin: Lấy danh sách toàn bộ danh mục kèm trạng thái
     */
    public function adminIndex(): JsonResponse
    {
        $categories = Category::withCount('accommodations')
            ->orderBy('display_order', 'asc')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'slug' => $cat->slug,
                    'label' => $cat->label_vi,
                    'labelEn' => $cat->label_en,
                    'icon' => $cat->icon,
                    'description' => $cat->description,
                    'is_active' => (bool)$cat->is_active,
                    'accommodations_count' => $cat->accommodations_count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Admin: Thêm danh mục mới
     */
    public function adminStore(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'label_vi' => 'required|string|max:100',
            'icon' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.'], 422);
        }

        $slug = $request->input('slug') ?: Str::slug($request->input('label_vi'));

        $category = Category::create([
            'slug' => $slug,
            'label_vi' => $request->input('label_vi'),
            'label_en' => $request->input('label_en') ?: $request->input('label_vi'),
            'icon' => $request->input('icon'),
            'description' => $request->input('description'),
            'display_order' => (int)($request->input('display_order') ?: 0),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm danh mục mới thành công!',
            'data' => $category,
        ]);
    }

    /**
     * Admin: Bật/Tắt trạng thái hoạt động của danh mục
     */
    public function adminToggleActive($id): JsonResponse
    {
        $category = is_numeric($id) ? Category::find($id) : Category::where('slug', $id)->first();
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy danh mục.'], 404);
        }

        $category->update(['is_active' => !$category->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật trạng thái danh mục!',
            'data' => $category,
        ]);
    }

    /**
     * Admin: Xóa danh mục
     */
    public function adminDestroy($id): JsonResponse
    {
        $category = is_numeric($id) ? Category::find($id) : Category::where('slug', $id)->first();
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy danh mục.'], 404);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa danh mục thành công.',
        ]);
    }
}

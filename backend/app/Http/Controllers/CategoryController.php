<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Lấy toàn bộ danh mục chỗ ở
     */
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->slug,
                    'label' => $cat->label_vi,
                    'labelEn' => $cat->label_en,
                    'icon' => $cat->icon,
                ];
            });

        return response()->json($categories);
    }
}

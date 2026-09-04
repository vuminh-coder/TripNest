<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AmenityController extends Controller
{
    /**
     * Danh sách tất cả tiện nghi
     */
    public function index(): JsonResponse
    {
        $amenities = Amenity::orderBy('id', 'asc')->get()->map(function ($a) {
            return [
                'id' => $a->id,
                'code' => $a->code,
                'name_vi' => $a->name_vi,
                'name_en' => $a->name_en,
                'icon' => $a->icon,
                'category' => $a->category,
                'target_type' => $a->target_type,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $amenities,
        ]);
    }

    /**
     * Admin: Thêm tiện nghi mới
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name_vi' => 'required|string|max:100',
            'icon' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.'], 422);
        }

        $code = $request->input('code') ?: Str::slug($request->input('name_vi'), '_');

        $amenity = Amenity::create([
            'code' => $code,
            'name_vi' => $request->input('name_vi'),
            'name_en' => $request->input('name_en') ?: $request->input('name_vi'),
            'icon' => $request->input('icon'),
            'target_type' => $request->input('target_type') ?: 'both',
            'category' => $request->input('category') ?: 'basic',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm tiện nghi mới thành công!',
            'data' => $amenity,
        ]);
    }

    /**
     * Admin: Xóa tiện nghi
     */
    public function destroy($id): JsonResponse
    {
        $amenity = is_numeric($id) ? Amenity::find($id) : Amenity::where('code', $id)->first();
        if (!$amenity) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tiện nghi.'], 404);
        }

        $amenity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa tiện nghi thành công.',
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class VoucherController extends Controller
{
    /**
     * Khách hàng: Xác thực mã giảm giá trong luồng Checkout
     */
    public function validateVoucher(Request $request): JsonResponse
    {
        $code = strtoupper(trim($request->input('code') ?: $request->input('voucherCode') ?: $request->input('promoCode') ?: ''));
        $basePrice = (float)($request->input('base_price') ?: $request->input('basePrice') ?: $request->input('amount') ?: 0);

        if (empty($code)) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Vui lòng nhập mã giảm giá.',
            ], 422);
        }

        // Tự động kích hoạt mã mặc định TRIPNESTVIP nếu chưa có trong DB
        $voucher = Voucher::where('code', $code)->first();
        if (!$voucher && $code === 'TRIPNESTVIP') {
            $voucher = Voucher::create([
                'code' => 'TRIPNESTVIP',
                'title' => 'Ưu đãi Đặc Quyền Thành Viên VIP TripNest',
                'description' => 'Giảm 10% tối đa 1.000.000đ cho mọi đơn đặt phòng nghỉ dưỡng.',
                'discount_type' => 'percentage',
                'discount_value' => 10.00,
                'min_booking_amount' => 0.00,
                'max_discount_amount' => 1000000.00,
                'usage_limit' => 1000,
                'used_count' => 0,
                'start_date' => now()->subMonth(),
                'end_date' => now()->addYear(),
                'is_active' => true,
            ]);
        }

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Mã khuyến mãi không tồn tại trên hệ thống.',
            ], 404);
        }

        if (!$voucher->is_active) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Mã khuyến mãi này hiện đang tạm ngưng áp dụng.',
            ], 400);
        }

        if ($voucher->start_date && now()->toDateString() < $voucher->start_date->toDateString()) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Chương trình ưu đãi này chưa đến ngày bắt đầu (' . $voucher->start_date->format('d/m/Y') . ').',
            ], 400);
        }

        if ($voucher->end_date && now()->toDateString() > $voucher->end_date->toDateString()) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Mã khuyến mãi đã hết hạn sử dụng vào ngày ' . $voucher->end_date->format('d/m/Y') . '.',
            ], 400);
        }

        if ($voucher->usage_limit !== null && $voucher->used_count >= $voucher->usage_limit) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Mã khuyến mãi đã hết lượt sử dụng tối đa.',
            ], 400);
        }

        if ($basePrice > 0 && $basePrice < (float)$voucher->min_booking_amount) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Mã giảm giá này chỉ áp dụng cho đơn đặt phòng từ ' . number_format($voucher->min_booking_amount, 0, ',', '.') . ' ₫ trở lên.',
            ], 400);
        }

        $discountAmount = $voucher->calculateDiscount($basePrice > 0 ? $basePrice : 5000000);

        return response()->json([
            'success' => true,
            'valid' => true,
            'message' => 'Áp dụng mã ưu đãi thành công!',
            'discount_amount' => $discountAmount,
            'discountAmount' => $discountAmount,
            'voucher' => [
                'id' => $voucher->id,
                'code' => $voucher->code,
                'title' => $voucher->title,
                'description' => $voucher->description,
                'discount_type' => $voucher->discount_type,
                'discount_value' => (float)$voucher->discount_value,
                'min_booking_amount' => (float)$voucher->min_booking_amount,
                'max_discount_amount' => (float)$voucher->max_discount_amount,
            ],
        ]);
    }

    /**
     * Admin: Danh sách tất cả Voucher
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $vouchers = Voucher::orderBy('created_at', 'desc')->get()->map(function ($v) {
                return [
                    'id' => $v->id,
                    'code' => $v->code,
                    'title' => $v->title,
                    'description' => $v->description,
                    'discount_type' => $v->discount_type,
                    'discount_value' => (float)$v->discount_value,
                    'min_booking_amount' => (float)$v->min_booking_amount,
                    'max_discount_amount' => (float)$v->max_discount_amount,
                    'usage_limit' => $v->usage_limit,
                    'used_count' => $v->used_count,
                    'start_date' => $v->start_date ? $v->start_date->format('Y-m-d') : null,
                    'end_date' => $v->end_date ? $v->end_date->format('Y-m-d') : null,
                    'is_active' => (bool)$v->is_active,
                    'created_at' => $v->created_at ? $v->created_at->format('d/m/Y H:i') : '',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $vouchers,
            ]);
        } catch (Throwable $ex) {
            return response()->json(['success' => false, 'message' => $ex->getMessage()], 500);
        }
    }

    /**
     * Admin: Tạo mới Voucher
     */
    public function adminStore(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:vouchers,code',
            'title' => 'required|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $voucher = Voucher::create([
            'code' => strtoupper(trim($request->input('code'))),
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'discount_type' => $request->input('discount_type', 'percentage'),
            'discount_value' => (float)$request->input('discount_value'),
            'min_booking_amount' => (float)($request->input('min_booking_amount') ?: 0),
            'max_discount_amount' => $request->filled('max_discount_amount') ? (float)$request->input('max_discount_amount') : null,
            'usage_limit' => $request->filled('usage_limit') ? (int)$request->input('usage_limit') : null,
            'start_date' => $request->input('start_date') ?: now()->toDateString(),
            'end_date' => $request->input('end_date') ?: now()->addMonths(6)->toDateString(),
            'is_active' => $request->has('is_active') ? (bool)$request->input('is_active') : true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo mã ưu đãi mới thành công!',
            'data' => $voucher,
        ]);
    }

    /**
     * Admin: Bật/Tắt trạng thái kích hoạt Voucher
     */
    public function adminToggleActive($id): JsonResponse
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mã giảm giá.'], 404);
        }

        $voucher->update(['is_active' => !$voucher->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật trạng thái mã ưu đãi.',
            'data' => $voucher,
        ]);
    }

    /**
     * Admin: Xóa Voucher
     */
    public function adminDestroy($id): JsonResponse
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mã giảm giá.'], 404);
        }

        $voucher->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa mã ưu đãi thành công.',
        ]);
    }
}

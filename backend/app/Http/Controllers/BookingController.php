<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Tạo đơn đặt phòng mới (với Kiểm tra chống trùng lịch & Tính giá chuẩn server-side)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'roomId' => 'required|exists:rooms,id',
            'checkIn' => 'required|date|after_or_equal:today',
            'checkOut' => 'required|date|after:checkIn',
            'guests' => 'required|integer|min:1',
            'currency' => 'nullable|string|in:VND,USD,EUR',
            'specialRequests' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu đặt phòng không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $roomId = $request->input('roomId');
        $checkIn = Carbon::parse($request->input('checkIn'))->format('Y-m-d');
        $checkOut = Carbon::parse($request->input('checkOut'))->format('Y-m-d');
        $guests = (int)$request->input('guests');

        $room = Room::with('accommodation')->findOrFail($roomId);

        // 1. Kiểm tra sức chứa tối đa của phòng
        if ($guests > $room->max_guests) {
            return response()->json([
                'success' => false,
                'message' => "Số lượng khách ({$guests}) vượt quá sức chứa tối đa của phòng ({$room->max_guests} khách).",
            ], 422);
        }

        // 2. RÀNG BUỘC CHỐNG TRÙNG LỊCH ĐẶT PHÒNG (Overlapping Booking Guard)
        $isOverlapping = Booking::where('room_id', $roomId)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('check_in_date', '<', $checkOut)
            ->where('check_out_date', '>', $checkIn)
            ->exists();

        if ($isOverlapping) {
            return response()->json([
                'success' => false,
                'message' => 'Rất tiếc! Phòng này đã có khách đặt trong khoảng thời gian từ ' . $checkIn . ' đến ' . $checkOut . '. Vui lòng chọn khoảng thời gian khác.',
            ], 422);
        }

        // 3. Tính toán tài chính chuẩn xác (luôn dùng VND — tiền tệ duy nhất trong DB)
        $d1 = Carbon::parse($checkIn);
        $d2 = Carbon::parse($checkOut);
        $nights = $d1->diffInDays($d2);
        if ($nights < 1) $nights = 1;

        $pricePerNight = (float)$room->price_per_night;
        $baseTotal = $pricePerNight * $nights;
        $cleaningFee = (float)$room->cleaning_fee;
        $serviceFee = round($baseTotal * ((float)$room->service_fee_percent / 100));

        // Xử lý mã giảm giá Voucher
        $discountAmount = 0.00;
        $voucherId = null;
        if ($request->filled('voucherCode')) {
            $voucher = \App\Models\Voucher::where('code', strtoupper(trim($request->input('voucherCode'))))->first();
            if ($voucher) {
                $discountAmount = $voucher->calculateDiscount($baseTotal);
                if ($discountAmount > 0) {
                    $voucherId = $voucher->id;
                    $voucher->increment('used_count');
                }
            }
        } elseif ($request->filled('voucherId')) {
            $voucher = \App\Models\Voucher::find($request->input('voucherId'));
            if ($voucher) {
                $discountAmount = $voucher->calculateDiscount($baseTotal);
                if ($discountAmount > 0) {
                    $voucherId = $voucher->id;
                    $voucher->increment('used_count');
                }
            }
        }

        $grandTotal = max(0, $baseTotal + $cleaningFee + $serviceFee - $discountAmount);

        // 4. Lấy thông tin user từ JWT Token
        $account = \Illuminate\Support\Facades\Auth::guard('api')->user();
        $user = $account?->user;
        if (!$user) {
            $user = User::first(); // Fallback nếu chưa đăng nhập
        }

        // 5. Tạo mã đặt phòng duy nhất
        do {
            $bookingCode = 'TN-' . rand(100000, 999999);
        } while (Booking::where('booking_code', $bookingCode)->exists());

        // 6. Ghi vào CSDL (luôn lưu VND, lưu price_per_night và voucher_id)
        $booking = Booking::create([
            'booking_code' => $bookingCode,
            'user_id' => $user->id,
            'room_id' => $room->id,
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'nights_count' => $nights,
            'guests_count' => $guests,
            'price_per_night' => $pricePerNight,
            'base_price' => $baseTotal,
            'cleaning_fee' => $cleaningFee,
            'service_fee' => $serviceFee,
            'discount_amount' => $discountAmount,
            'voucher_id' => $voucherId,
            'total_price' => $grandTotal,
            'status' => 'confirmed',
            'special_requests' => $request->input('specialRequests'),
        ]);

        $firstImage = $room->images()->first()?->image_url ?: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80';

        return response()->json([
            'success' => true,
            'message' => 'Đặt phòng thành công trên hệ thống TripNest!',
            'booking' => [
                'id' => $booking->booking_code,
                'roomId' => $room->id,
                'roomTitle' => $room->room_name_vi,
                'roomCity' => $room->accommodation?->city ?: 'Việt Nam',
                'roomImage' => $firstImage,
                'checkIn' => $booking->check_in_date->format('Y-m-d'),
                'checkOut' => $booking->check_out_date->format('Y-m-d'),
                'nights' => $booking->nights_count,
                'guests' => $booking->guests_count,
                'totalPrice' => (float)$booking->total_price,
                'currency' => $booking->currency,
                'status' => $booking->status,
                'createdAt' => $booking->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Danh sách chuyến đi đã đặt của khách
     */
    public function myBookings(Request $request): JsonResponse
    {
        $account = \Illuminate\Support\Facades\Auth::guard('api')->user();
        $user = $account?->user;
        if (!$user) {
            $user = User::first();
        }

        $bookings = Booking::with(['room.accommodation', 'room.images'])
            ->where('user_id', $user?->id)
            ->whereIn('status', ['confirmed', 'completed', 'pending'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($b) {
                $firstImage = $b->room?->images?->first()?->image_url ?: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80';
                return [
                    'id' => $b->booking_code,
                    'bookingId' => $b->id,
                    'roomId' => $b->room_id,
                    'roomTitle' => $b->room?->room_name_vi ?: 'Chỗ ở TripNest',
                    'roomCity' => $b->room?->accommodation?->city ?: 'Việt Nam',
                    'roomImage' => $firstImage,
                    'checkIn' => $b->check_in_date->format('Y-m-d'),
                    'checkOut' => $b->check_out_date->format('Y-m-d'),
                    'nights' => (int)$b->nights_count,
                    'guests' => (int)$b->guests_count,
                    'totalPrice' => (float)$b->total_price,
                    'currency' => $b->currency,
                    'status' => $b->status,
                    'createdAt' => $b->created_at ? $b->created_at->toISOString() : '',
                ];
            });

        return response()->json($bookings);
    }

    /**
     * Hủy đơn đặt phòng
     */
    public function cancel($bookingCode, Request $request): JsonResponse
    {
        $booking = Booking::where('booking_code', $bookingCode)
            ->orWhere('id', $bookingCode)
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy đơn đặt phòng.'], 404);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->input('reason', 'Khách hàng yêu cầu hủy qua ứng dụng.'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã hủy đặt phòng thành công.',
        ]);
    }
}

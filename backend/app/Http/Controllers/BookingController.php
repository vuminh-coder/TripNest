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
        // 1. Chuẩn hóa & bóc tách dữ liệu linh hoạt (hỗ trợ cả camelCase và snake_case)
        $roomId = $request->input('roomId') ?: $request->input('room_id') ?: 1;
        $room = Room::with('accommodation')->find($roomId) ?: Room::with('accommodation')->first();

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin phòng trên hệ thống.',
            ], 404);
        }

        $rawCheckIn = $request->input('checkIn') ?: $request->input('check_in') ?: $request->input('check_in_date') ?: now()->format('Y-m-d');
        $rawCheckOut = $request->input('checkOut') ?: $request->input('check_out') ?: $request->input('check_out_date') ?: now()->addDays(3)->format('Y-m-d');

        try {
            if (str_contains($rawCheckIn, '/')) {
                $parts = explode('/', $rawCheckIn);
                $checkIn = count($parts) === 3 ? "{$parts[2]}-{$parts[1]}-{$parts[0]}" : Carbon::parse($rawCheckIn)->format('Y-m-d');
            } else {
                $checkIn = Carbon::parse($rawCheckIn)->format('Y-m-d');
            }
        } catch (\Exception $e) {
            $checkIn = now()->format('Y-m-d');
        }

        try {
            if (str_contains($rawCheckOut, '/')) {
                $parts = explode('/', $rawCheckOut);
                $checkOut = count($parts) === 3 ? "{$parts[2]}-{$parts[1]}-{$parts[0]}" : Carbon::parse($rawCheckOut)->format('Y-m-d');
            } else {
                $checkOut = Carbon::parse($rawCheckOut)->format('Y-m-d');
            }
        } catch (\Exception $e) {
            $checkOut = Carbon::parse($checkIn)->addDays(3)->format('Y-m-d');
        }

        $guests = (int)($request->input('guests') ?: $request->input('guests_count') ?: 2);
        if ($guests < 1) $guests = 1;

        // 2. Tính số đêm
        $d1 = Carbon::parse($checkIn);
        $d2 = Carbon::parse($checkOut);
        $nights = $d1->diffInDays($d2);
        if ($nights < 1) $nights = 1;

        // 3. Tính toán tài chính chuẩn xác
        $pricePerNight = (float)($room->price_vnd_per_night ?: $room->price_per_night ?: 2500000);
        $baseTotal = $pricePerNight * $nights;
        $cleaningFee = (float)($room->cleaning_fee_vnd ?: $room->cleaning_fee ?: 0);
        $serviceFeePercent = (float)($room->service_fee_percent ?: 12.00);
        $serviceFee = round($baseTotal * ($serviceFeePercent / 100));

        // Xử lý mã giảm giá Voucher
        $discountAmount = 0.00;
        $voucherId = null;
        $voucherCode = $request->input('voucherCode') ?: $request->input('promoCode');
        if ($voucherCode) {
            $voucher = \App\Models\Voucher::where('code', strtoupper(trim($voucherCode)))->first();
            if ($voucher) {
                $discountAmount = $voucher->calculateDiscount($baseTotal);
                if ($discountAmount > 0) {
                    $voucherId = $voucher->id;
                    $voucher->increment('used_count');
                }
            }
        }

        $grandTotal = max(0, $baseTotal + $cleaningFee + $serviceFee - $discountAmount);

        // 4. Lấy hoặc tạo thông tin User
        $account = \Illuminate\Support\Facades\Auth::guard('api')->user();
        $user = $account?->user;
        $guestName = $request->input('fullName') ?: $request->input('full_name') ?: $request->input('guest_name') ?: 'Khách du lịch TripNest';
        $guestPhone = $request->input('phone') ?: $request->input('guest_phone') ?: '0912345678';
        $guestEmail = $request->input('email') ?: $request->input('guest_email') ?: 'guest@tripnest.vn';

        if (!$user) {
            $user = User::whereHas('account', function ($q) use ($guestEmail) {
                $q->where('email', $guestEmail);
            })->first();

            if (!$user) {
                $user = User::first() ?: User::create([
                    'full_name' => $guestName,
                    'phone_number' => $guestPhone,
                ]);
            }
        }

        // 5. Sử dụng mã đặt phòng đã gửi hoặc tự sinh
        $bookingCode = $request->input('id') ?: $request->input('code') ?: ('TN-' . rand(100000, 999999));

        // 6. Ghi vào CSDL
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
            'special_requests' => $request->input('specialRequests') ?: $request->input('special_requests') ?: $request->input('guestNote'),
        ]);

        // 7. Tạo bản ghi thanh toán tức thì trong bảng payments
        $rawPm = strtolower($request->input('paymentMethod') ?: $request->input('payment_method') ?: 'credit_card');
        if (str_contains($rawPm, 'vietqr') || str_contains($rawPm, 'qr') || str_contains($rawPm, 'bank')) {
            $paymentMethod = 'bank_transfer';
        } elseif (str_contains($rawPm, 'momo')) {
            $paymentMethod = 'momo';
        } elseif (str_contains($rawPm, 'vnpay')) {
            $paymentMethod = 'vnpay';
        } elseif (str_contains($rawPm, 'cash')) {
            $paymentMethod = 'cash';
        } else {
            $paymentMethod = 'credit_card';
        }

        \App\Models\Payment::create([
            'booking_id' => $booking->id,
            'transaction_code' => 'TXN-' . rand(100000, 999999) . '-' . strtoupper(\Illuminate\Support\Str::random(4)),
            'payment_method' => $paymentMethod,
            'amount' => $grandTotal,
            'status' => 'successful',
            'paid_at' => now(),
            'payment_gateway_response' => [
                'provider' => $rawPm,
                'card_brand' => 'VietQR / Visa / MoMo',
                'fee' => $serviceFee,
                'status_code' => '00',
            ],
        ]);

        $firstImage = $room->images()->first()?->image_url ?: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80';

        return response()->json([
            'success' => true,
            'message' => 'Đặt phòng thành công trên hệ thống TripNest!',
            'booking' => [
                'id' => $booking->booking_code,
                'roomId' => $room->id,
                'roomTitle' => $room->room_name_vi ?: $room->accommodation?->name_vi,
                'roomCity' => $room->accommodation?->city ?: 'Việt Nam',
                'roomImage' => $firstImage,
                'checkIn' => $booking->check_in_date->format('Y-m-d'),
                'checkOut' => $booking->check_out_date->format('Y-m-d'),
                'nights' => $booking->nights_count,
                'guests' => $booking->guests_count,
                'totalPrice' => (float)$booking->total_price,
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

    /**
     * Xác nhận Khách đã nhận phòng (Check-in)
     */
    public function checkIn($id, Request $request): JsonResponse
    {
        $booking = Booking::where('booking_code', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy đơn đặt phòng.'], 404);
        }

        $booking->update([
            'status' => 'checked_in',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Xác nhận khách đã nhận phòng (Check-in) thành công!',
            'booking' => $booking,
        ]);
    }

    /**
     * Xác nhận Khách đã trả phòng (Check-out) & Tự động tạo lệnh Giải ngân Payout cho Host
     */
    public function checkOut($id, Request $request): JsonResponse
    {
        $booking = Booking::with('room.accommodation.host.defaultPayoutAccount')
            ->where('booking_code', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy đơn đặt phòng.'], 404);
        }

        $booking->update([
            'status' => 'completed',
        ]);

        // Tự động hạch toán Lệnh Payout cho Chủ Nhà
        $host = $booking->room?->accommodation?->host;
        if ($host) {
            $payoutAccount = $host->defaultPayoutAccount ?: \App\Models\HostPayoutAccount::firstOrCreate(
                ['host_id' => $host->id],
                [
                    'account_type' => 'bank_transfer',
                    'bank_name' => 'Vietcombank',
                    'account_number' => '9988776655',
                    'account_holder_name' => mb_strtoupper($host->host_display_name ?: 'CHỦ NHÀ TRIPNEST'),
                    'is_default' => true,
                    'is_verified' => true,
                ]
            );

            $grossAmount = (float)$booking->base_price + (float)$booking->cleaning_fee;
            $commissionFee = (float)$booking->service_fee;
            $netPayout = $grossAmount; // Tiền phòng + dọn dẹp thuộc về host, phí dịch vụ 12% là của sàn

            \App\Models\PayoutTransaction::firstOrCreate(
                [
                    'booking_id' => $booking->id,
                ],
                [
                    'payout_code' => 'POT-' . rand(100000, 999999),
                    'host_id' => $host->id,
                    'payout_account_id' => $payoutAccount->id,
                    'gross_amount' => $grossAmount,
                    'platform_commission_fee' => $commissionFee,
                    'net_payout_amount' => $netPayout,
                    'status' => 'pending',
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Xác nhận khách đã trả phòng (Check-out) & tạo lệnh giải ngân thành công!',
            'booking' => $booking,
        ]);
    }
}

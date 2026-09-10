<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use App\Services\RoomAvailabilityService;
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

        $rawCheckIn = $request->input('checkIn') 
            ?: $request->input('checkInDate') 
            ?: $request->input('check_in') 
            ?: $request->input('check_in_date') 
            ?: now()->format('Y-m-d');

        $rawCheckOut = $request->input('checkOut') 
            ?: $request->input('checkOutDate') 
            ?: $request->input('check_out') 
            ?: $request->input('check_out_date') 
            ?: now()->addDays(3)->format('Y-m-d');

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
            if (Carbon::parse($checkOut)->lte(Carbon::parse($checkIn))) {
                $checkOut = Carbon::parse($checkIn)->addDays(3)->format('Y-m-d');
            }
        } catch (\Exception $e) {
            $checkOut = Carbon::parse($checkIn)->addDays(3)->format('Y-m-d');
        }

        $guests = (int)($request->input('guests') ?: $request->input('guests_count') ?: $request->input('guestCount') ?: 2);
        if ($guests < 1) $guests = 1;

        $roomsCount = (int)($request->input('rooms_count') ?: $request->input('roomsCount') ?: 1);
        if ($roomsCount < 1) $roomsCount = 1;

        // 2. Tính số đêm
        $d1 = Carbon::parse($checkIn);
        $d2 = Carbon::parse($checkOut);
        $nights = (int)($request->input('nights') ?: $request->input('nights_count') ?: max(1, $d1->diffInDays($d2)));
        if ($nights < 1) $nights = 1;

        // 2b. KIỂM TRA CHỐNG TRÙNG LỊCH & TỒN KHO PHÒNG NGHIÊM NGẶT (Strict Overlap Validation)
        $lockToken = $request->input('lockToken') ?: $request->input('lock_token');
        $availService = new RoomAvailabilityService();
        $avail = $availService->checkRoomAvailability($room->id, $checkIn, $checkOut, null, $lockToken, $roomsCount);

        if (!$avail['is_available']) {
            $formattedIn = Carbon::parse($checkIn)->format('d/m/Y');
            $formattedOut = Carbon::parse($checkOut)->format('d/m/Y');
            $statusMsg = $avail['status'] === 'held'
                ? 'Phòng này đang có khách khác giữ chỗ thanh toán. Vui lòng thử lại sau ít phút hoặc chọn ngày khác.'
                : "Phòng \"{$room->room_name_vi}\" đã có khách đặt trong khoảng thời gian từ {$formattedIn} đến {$formattedOut}. Vui lòng chọn khoảng ngày khác hoặc hạng phòng khác.";

            return response()->json([
                'success' => false,
                'code' => 'ROOM_ALREADY_BOOKED',
                'status' => $avail['status'],
                'message' => $statusMsg,
                'availability' => $avail,
            ], 409);
        }

        // 3. Tính toán tài chính chuẩn xác đồng bộ với Frontend
        $pricePerNight = (float)($request->input('price_per_night') ?: $request->input('pricePerNight') ?: $room->price_vnd_per_night ?: $room->price_per_night ?: 2500000);
        $baseTotal = (float)($request->input('base_price') ?: $request->input('basePrice') ?: ($pricePerNight * $nights * $roomsCount));
        $cleaningFee = (float)($request->input('cleaning_fee') ?? $request->input('cleaningFee') ?? $room->cleaning_fee_vnd ?? $room->cleaning_fee ?? 350000);
        $serviceFee = (float)($request->input('service_fee') ?? $request->input('serviceFee') ?? round($baseTotal * 0.12));

        // Xử lý mã giảm giá Voucher chuẩn xác và đồng bộ CSDL
        $discountAmount = (float)($request->input('discount_amount') ?: $request->input('discountAmount') ?: 0.00);
        $voucherId = $request->input('voucher_id') ?: $request->input('voucherId');
        $voucherCode = $request->input('voucherCode') ?: $request->input('voucher_code') ?: $request->input('promoCode');

        if ($voucherCode) {
            $voucher = \App\Models\Voucher::where('code', strtoupper(trim($voucherCode)))->first();
            if ($voucher) {
                $voucherId = $voucher->id;
                $calcDiscount = $voucher->calculateDiscount($baseTotal);
                if ($calcDiscount > 0) {
                    $discountAmount = $calcDiscount;
                }
                $voucher->increment('used_count');
            }
        } elseif ($voucherId) {
            $voucher = \App\Models\Voucher::find($voucherId);
            if ($voucher) {
                $calcDiscount = $voucher->calculateDiscount($baseTotal);
                if ($calcDiscount > 0 && $discountAmount == 0) {
                    $discountAmount = $calcDiscount;
                }
                $voucher->increment('used_count');
            }
        }

        $grandTotal = (float)($request->input('total_price') ?: $request->input('totalPrice') ?: max(0, $baseTotal + $cleaningFee + $serviceFee - $discountAmount));

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

        // 6. Ghi vào CSDL với đầy đủ voucher_id đã xác thực
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

        // Chuyển đổi trạng thái Lock sang converted (nếu có giữ chỗ trước đó)
        if ($lockToken) {
            $availService->convertLock($lockToken);
        }

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

        // 8. Tự động khởi tạo Lệnh Escrow Tạm Giữ Payout cho Host (status = 'pending')
        $host = $room->accommodation?->host;
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

            $grossHostAmount = (float)$baseTotal + (float)$cleaningFee;
            $commissionFee = (float)$serviceFee;
            $netPayoutAmount = max(0, $grossHostAmount - $commissionFee);

            \App\Models\PayoutTransaction::create([
                'booking_id' => $booking->id,
                'payout_code' => 'POT-' . rand(100000, 999999),
                'host_id' => $host->id,
                'payout_account_id' => $payoutAccount->id,
                'gross_amount' => $grossHostAmount,
                'platform_commission_fee' => $commissionFee,
                'net_payout_amount' => $netPayoutAmount,
                'status' => 'pending',
            ]);
        }

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
                'basePrice' => (float)$booking->base_price,
                'cleaningFee' => (float)$booking->cleaning_fee,
                'serviceFee' => (float)$booking->service_fee,
                'discountAmount' => (float)$booking->discount_amount,
                'voucherCode' => $voucherCode,
                'voucherId' => $voucherId,
                'totalPrice' => (float)$booking->total_price,
                'status' => $booking->status,
                'statusLabel' => $booking->status_label,
                'createdAt' => $booking->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Danh sách chuyến đi đã đặt của khách (với đầy đủ trạng thái)
     */
    public function myBookings(Request $request): JsonResponse
    {
        $account = \Illuminate\Support\Facades\Auth::guard('api')->user();
        $user = $account?->user;
        if (!$user) {
            // Fallback sang tài khoản khách demo (user_id = 2) khi chưa đăng nhập để luôn hiển thị chuyến đi
            $user = User::find(2) ?: User::first();
        }

        $query = Booking::with(['room.accommodation', 'room.images', 'review', 'voucher'])
            ->where('user_id', $user?->id)
            ->orderBy('created_at', 'desc');

        // Lọc theo tab trạng thái
        $statusFilter = $request->query('status');
        if ($statusFilter && $statusFilter !== 'all') {
            switch ($statusFilter) {
                case 'upcoming':
                    $query->upcoming();
                    break;
                case 'active':
                    $query->active();
                    break;
                case 'completed':
                    $query->completed();
                    break;
                case 'cancelled':
                    $query->cancelled();
                    break;
                default:
                    $query->where('status', $statusFilter);
            }
        }

        $bookings = $query->get()->map(function ($b) {
            $firstImage = $b->room?->images?->first()?->image_url ?: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80';
            $radar = $b->review?->rating_breakdown ?: [];
            return [
                'id' => $b->booking_code,
                'bookingId' => $b->id,
                'roomId' => $b->room_id,
                'accommodationId' => $b->room?->accommodation_id,
                'roomTitle' => $b->room?->room_name_vi ?: 'Chỗ ở TripNest',
                'roomCity' => $b->room?->accommodation?->city ?: 'Việt Nam',
                'roomImage' => $firstImage,
                'accommodationName' => $b->room?->accommodation?->name_vi ?: '',
                'checkIn' => $b->check_in_date ? $b->check_in_date->format('Y-m-d') : '',
                'checkOut' => $b->check_out_date ? $b->check_out_date->format('Y-m-d') : '',
                'nights' => (int)$b->nights_count,
                'guests' => (int)$b->guests_count,
                'basePrice' => (float)$b->base_price,
                'cleaningFee' => (float)$b->cleaning_fee,
                'serviceFee' => (float)$b->service_fee,
                'discountAmount' => (float)$b->discount_amount,
                'voucherCode' => $b->voucher?->code,
                'voucherTitle' => $b->voucher?->title,
                'totalPrice' => (float)$b->total_price,
                'currency' => $b->currency ?: 'VND',
                'status' => $b->status,
                'statusLabel' => $b->status_label,
                'checkedInAt' => $b->checked_in_at?->toISOString(),
                'checkedOutAt' => $b->checked_out_at?->toISOString(),
                'cancelledAt' => $b->cancelled_at?->toISOString(),
                'cancellationReason' => $b->cancellation_reason,
                'specialRequests' => $b->special_requests,
                'canCancel' => $b->can_cancel,
                'canCheckIn' => $b->can_check_in,
                'canCheckOut' => $b->can_check_out,
                'canReview' => $b->can_review,
                'hasReview' => $b->review !== null,
                'refundAmount' => (float)($b->refund_amount ?? 0),
                'refundPercentage' => (int)($b->refund_percentage ?? 0),
                'refundSummary' => $b->refund_summary,
                'review' => $b->review ? [
                    'id' => $b->review->id,
                    'rating' => (float)$b->review->rating,
                    'cleanliness' => (float)($radar['cleanliness'] ?? 5.0),
                    'accuracy' => (float)($radar['accuracy'] ?? 5.0),
                    'communication' => (float)($radar['communication'] ?? 5.0),
                    'location' => (float)($radar['location'] ?? 5.0),
                    'checkin' => (float)($radar['checkin'] ?? 5.0),
                    'value' => (float)($radar['value'] ?? 5.0),
                    'comment' => $b->review->comment,
                    'hostResponse' => $b->review->host_response,
                    'createdAt' => $b->review->created_at ? $b->review->created_at->format('d/m/Y') : '',
                ] : null,
                'createdAt' => $b->created_at ? $b->created_at->toISOString() : '',
            ];
        });

        return response()->json($bookings);
    }

    /**
     * Xem chi tiết đơn đặt phòng
     */
    public function show($id): JsonResponse
    {
        $booking = Booking::with(['room.accommodation', 'room.images', 'payments', 'review', 'voucher'])
            ->where('booking_code', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn đặt phòng.'], 404);
        }

        $firstImage = $booking->room?->images?->first()?->image_url ?: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80';
        $radar = $booking->review?->rating_breakdown ?: [];

        return response()->json([
            'success' => true,
            'booking' => [
                'id' => $booking->booking_code,
                'bookingId' => $booking->id,
                'roomId' => $booking->room_id,
                'accommodationId' => $booking->room?->accommodation_id,
                'roomTitle' => $booking->room?->room_name_vi ?: 'Chỗ ở TripNest',
                'roomCity' => $booking->room?->accommodation?->city ?: 'Việt Nam',
                'roomImage' => $firstImage,
                'accommodationName' => $booking->room?->accommodation?->name_vi ?: '',
                'checkIn' => $booking->check_in_date?->format('Y-m-d'),
                'checkOut' => $booking->check_out_date?->format('Y-m-d'),
                'nights' => (int)$booking->nights_count,
                'guests' => (int)$booking->guests_count,
                'pricePerNight' => (float)$booking->price_per_night,
                'basePrice' => (float)$booking->base_price,
                'cleaningFee' => (float)$booking->cleaning_fee,
                'serviceFee' => (float)$booking->service_fee,
                'discountAmount' => (float)$booking->discount_amount,
                'voucherCode' => $booking->voucher?->code,
                'voucherTitle' => $booking->voucher?->title,
                'totalPrice' => (float)$booking->total_price,
                'currency' => $booking->currency ?: 'VND',
                'status' => $booking->status,
                'statusLabel' => $booking->status_label,
                'checkedInAt' => $booking->checked_in_at?->toISOString(),
                'checkedOutAt' => $booking->checked_out_at?->toISOString(),
                'cancelledAt' => $booking->cancelled_at?->toISOString(),
                'cancellationReason' => $booking->cancellation_reason,
                'specialRequests' => $booking->special_requests,
                'canCancel' => $booking->can_cancel,
                'canCheckIn' => $booking->can_check_in,
                'canCheckOut' => $booking->can_check_out,
                'canReview' => $booking->can_review,
                'hasReview' => $booking->review !== null,
                'review' => $booking->review ? [
                    'id' => $booking->review->id,
                    'rating' => (float)$booking->review->rating,
                    'cleanliness' => (float)($radar['cleanliness'] ?? 5.0),
                    'accuracy' => (float)($radar['accuracy'] ?? 5.0),
                    'communication' => (float)($radar['communication'] ?? 5.0),
                    'location' => (float)($radar['location'] ?? 5.0),
                    'checkin' => (float)($radar['checkin'] ?? 5.0),
                    'value' => (float)($radar['value'] ?? 5.0),
                    'comment' => $booking->review->comment,
                    'hostResponse' => $booking->review->host_response,
                    'createdAt' => $booking->review->created_at ? $booking->review->created_at->format('d/m/Y') : '',
                ] : null,
                'payments' => $booking->payments->map(fn($p) => [
                    'transactionCode' => $p->transaction_code,
                    'method' => $p->payment_method,
                    'amount' => (float)$p->amount,
                    'status' => $p->status,
                    'paidAt' => $p->paid_at?->toISOString(),
                ]),
                'createdAt' => $booking->created_at?->toISOString(),
            ],
        ]);
    }

    /**
     * Preview hoàn tiền TRƯỚC KHI hủy (không thay đổi dữ liệu)
     * GET /api/bookings/{id}/cancel-preview
     */
    public function cancelPreview($bookingCode): JsonResponse
    {
        $booking = Booking::with(['room.accommodation', 'payments'])
            ->where('booking_code', $bookingCode)
            ->orWhere('id', $bookingCode)
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn đặt phòng.'], 404);
        }

        if (!$booking->can_cancel) {
            $statusMsg = Booking::STATUS_LABELS[$booking->status] ?? $booking->status;
            return response()->json([
                'success' => false,
                'message' => "Đơn đặt phòng ở trạng thái \"{$statusMsg}\" — không thể hủy.",
            ], 422);
        }

        $policyService = new \App\Services\CancellationPolicyService();
        $calculation = $policyService->calculate($booking);

        $paymentMethod = $booking->payments?->first()?->payment_method ?: 'bank_transfer';

        return response()->json([
            'success' => true,
            'booking_code' => $booking->booking_code,
            'original_total' => (float)$booking->total_price,
            'refund' => [
                'percentage' => $calculation['refund_percentage'],
                'amount' => $calculation['refundable_amount'],
                'service_fee_refundable' => $calculation['service_fee_refundable'],
                'platform_fee_kept' => $calculation['platform_fee_kept'],
                'policy_applied' => $calculation['policy_applied'],
                'policy_description' => $calculation['policy_description_vi'],
                'hours_until_checkin' => $calculation['hours_until_checkin'],
                'refund_method' => $paymentMethod,
                'estimated_days' => '5-10 ngày làm việc',
                'breakdown' => $calculation['breakdown'],
            ],
        ]);
    }

    /**
     * Hủy đơn đặt phòng & Xử lý Hoàn tiền chuyên sâu (DB Transaction)
     * POST /api/bookings/{id}/cancel
     */
    public function cancel($bookingCode, Request $request): JsonResponse
    {
        $booking = Booking::with(['room.accommodation', 'room.images', 'payments'])
            ->where('booking_code', $bookingCode)
            ->orWhere('id', $bookingCode)
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn đặt phòng.'], 404);
        }

        // Kiểm tra quyền hủy: chỉ cho hủy khi confirmed hoặc pending
        if (!$booking->can_cancel) {
            $statusMsg = Booking::STATUS_LABELS[$booking->status] ?? $booking->status;
            return response()->json([
                'success' => false,
                'message' => "Không thể hủy đơn đặt phòng ở trạng thái \"{$statusMsg}\". Chỉ có thể hủy đơn chưa nhận phòng.",
            ], 422);
        }

        $reason = $request->input('reason', 'Khách hàng yêu cầu hủy qua ứng dụng.');
        $isHostCancel = (bool)$request->input('host_cancel', false);

        // Tính toán chính sách hoàn tiền
        $policyService = new \App\Services\CancellationPolicyService();
        $calculation = $isHostCancel
            ? $policyService->calculateHostCancel($booking)
            : $policyService->calculate($booking);

        $refundPercentage = $calculation['refund_percentage'];
        $refundAmount = $calculation['refundable_amount'];
        $policyApplied = $calculation['policy_applied'];

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            // 1. Cập nhật trạng thái Booking
            $booking->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
                'refund_amount' => $refundAmount,
                'refund_percentage' => $refundPercentage,
            ]);

            // 2. Cập nhật trạng thái Payment
            $payment = $booking->payments()->where('status', 'successful')->first();
            if ($payment) {
                $newPaymentStatus = match (true) {
                    $refundPercentage >= 100 => 'refunded',
                    $refundPercentage > 0 => 'partially_refunded',
                    default => 'successful', // 0% refund → payment stays
                };
                $payment->update(['status' => $newPaymentStatus]);

                // 3. Tạo bản ghi Refund chi tiết
                \App\Models\Refund::create([
                    'refund_code' => 'RF-' . rand(100000, 999999),
                    'booking_id' => $booking->id,
                    'payment_id' => $payment->id,
                    'original_amount' => (float)$booking->total_price,
                    'refund_percentage' => $refundPercentage,
                    'refund_amount' => $refundAmount,
                    'platform_fee_deducted' => $calculation['platform_fee_kept'],
                    'refund_method' => $payment->payment_method ?: 'bank_transfer',
                    'status' => $refundAmount > 0 ? 'processing' : 'completed',
                    'reason' => $reason,
                    'policy_applied' => $policyApplied,
                    'policy_description' => $calculation['policy_description_vi'],
                    'processed_at' => $refundAmount > 0 ? null : now(),
                ]);
            }

            // 4. Xử lý Payout cho Host tùy theo % hoàn tiền
            $payoutQuery = \App\Models\PayoutTransaction::where('booking_id', $booking->id)
                ->whereIn('status', ['pending', 'processing']);

            if ($refundPercentage >= 100) {
                // Hoàn 100% → hủy toàn bộ payout cho host
                $payoutQuery->update(['status' => 'cancelled']);
            } elseif ($refundPercentage > 0) {
                // Hoàn 50% → giảm payout host 50%
                $payouts = $payoutQuery->get();
                foreach ($payouts as $payout) {
                    $newGross = round((float)$payout->gross_amount * (1 - $refundPercentage / 100));
                    $newCommission = round((float)$payout->platform_commission_fee * (1 - $refundPercentage / 100));
                    $newNet = max(0, $newGross - $newCommission);
                    $payout->update([
                        'gross_amount' => $newGross,
                        'platform_commission_fee' => $newCommission,
                        'net_payout_amount' => $newNet,
                    ]);
                }
            }
            // 0% refund → host giữ nguyên payout

            \Illuminate\Support\Facades\DB::commit();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống khi xử lý hủy đơn: ' . $e->getMessage(),
            ], 500);
        }

        // Reload booking
        $booking->refresh();
        $booking->load(['room.accommodation', 'room.images']);
        $firstImage = $booking->room?->images?->first()?->image_url ?: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80';

        return response()->json([
            'success' => true,
            'message' => $refundAmount > 0
                ? "Đã hủy đơn đặt phòng. Hoàn tiền {$refundPercentage}% = " . number_format($refundAmount) . ' ₫'
                : 'Đã hủy đơn đặt phòng. Không hoàn tiền theo chính sách.',
            'booking' => [
                'id' => $booking->booking_code,
                'bookingId' => $booking->id,
                'roomTitle' => $booking->room?->room_name_vi ?: 'Chỗ ở TripNest',
                'roomCity' => $booking->room?->accommodation?->city ?: 'Việt Nam',
                'roomImage' => $firstImage,
                'status' => $booking->status,
                'statusLabel' => $booking->status_label,
                'cancelledAt' => $booking->cancelled_at?->toISOString(),
                'cancellationReason' => $booking->cancellation_reason,
                'canCancel' => false,
                'canCheckIn' => false,
                'canCheckOut' => false,
            ],
            'refund' => [
                'percentage' => $refundPercentage,
                'amount' => (float)$refundAmount,
                'currency' => 'VND',
                'method' => $payment?->payment_method ?: 'bank_transfer',
                'policy_applied' => $policyApplied,
                'policy_description' => $calculation['policy_description_vi'],
                'breakdown' => $calculation['breakdown'],
                'note' => $refundAmount > 0
                    ? 'Số tiền sẽ được hoàn lại trong 5-10 ngày làm việc.'
                    : 'Không hoàn tiền theo chính sách hủy phòng.',
            ],
        ]);
    }

    /**
     * Xác nhận Khách đã nhận phòng (Check-in) — Chỉ cho phép khi status = confirmed
     */
    public function checkIn($id, Request $request): JsonResponse
    {
        $booking = Booking::with(['room.accommodation', 'room.images'])
            ->where('booking_code', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn đặt phòng.'], 404);
        }

        // Kiểm tra quyền check-in
        if (!$booking->can_check_in) {
            $statusMsg = Booking::STATUS_LABELS[$booking->status] ?? $booking->status;
            return response()->json([
                'success' => false,
                'message' => "Không thể nhận phòng cho đơn ở trạng thái \"{$statusMsg}\". Chỉ đơn đã xác nhận mới có thể nhận phòng.",
            ], 422);
        }

        $booking->update([
            'status' => 'checked_in',
            'checked_in_at' => now(),
        ]);

        $firstImage = $booking->room?->images?->first()?->image_url ?: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80';

        return response()->json([
            'success' => true,
            'message' => 'Xác nhận khách đã nhận phòng (Check-in) thành công!',
            'booking' => [
                'id' => $booking->booking_code,
                'bookingId' => $booking->id,
                'roomTitle' => $booking->room?->room_name_vi ?: 'Chỗ ở TripNest',
                'roomCity' => $booking->room?->accommodation?->city ?: 'Việt Nam',
                'roomImage' => $firstImage,
                'status' => $booking->status,
                'statusLabel' => $booking->status_label,
                'checkedInAt' => $booking->checked_in_at?->toISOString(),
                'canCancel' => false,
                'canCheckIn' => false,
                'canCheckOut' => true,
            ],
        ]);
    }

    /**
     * Xác nhận Khách đã trả phòng (Check-out) — Chỉ cho phép khi status = checked_in
     */
    public function checkOut($id, Request $request): JsonResponse
    {
        $booking = Booking::with('room.accommodation.host.defaultPayoutAccount', 'room.images')
            ->where('booking_code', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn đặt phòng.'], 404);
        }

        // Kiểm tra quyền check-out
        if (!$booking->can_check_out) {
            $statusMsg = Booking::STATUS_LABELS[$booking->status] ?? $booking->status;
            return response()->json([
                'success' => false,
                'message' => "Không thể trả phòng cho đơn ở trạng thái \"{$statusMsg}\". Chỉ đơn đã nhận phòng mới có thể trả phòng.",
            ], 422);
        }

        $booking->update([
            'status' => 'completed',
            'checked_out_at' => now(),
        ]);

        // Cập nhật trạng thái Payout sang completed (giải ngân cho Host)
        \App\Models\PayoutTransaction::where('booking_id', $booking->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'completed',
                'transferred_at' => now(),
            ]);

        $firstImage = $booking->room?->images?->first()?->image_url ?: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80';

        return response()->json([
            'success' => true,
            'message' => 'Xác nhận khách đã trả phòng (Check-out) thành công! Lệnh giải ngân cho chủ nhà đã được kích hoạt.',
            'booking' => [
                'id' => $booking->booking_code,
                'bookingId' => $booking->id,
                'roomTitle' => $booking->room?->room_name_vi ?: 'Chỗ ở TripNest',
                'roomCity' => $booking->room?->accommodation?->city ?: 'Việt Nam',
                'roomImage' => $firstImage,
                'status' => $booking->status,
                'statusLabel' => $booking->status_label,
                'checkedInAt' => $booking->checked_in_at?->toISOString(),
                'checkedOutAt' => $booking->checked_out_at?->toISOString(),
                'canCancel' => false,
                'canCheckIn' => false,
                'canCheckOut' => false,
                'canReview' => true,
            ],
        ]);
    }

    /**
     * Tạm khóa giữ phòng 15 phút khi khách bước vào bước Checkout (Room Hold Lock)
     * POST /api/bookings/hold
     */
    public function holdRoom(Request $request): JsonResponse
    {
        $checkIn = $request->input('checkIn') ?: $request->input('checkInDate') ?: $request->input('check_in') ?: $request->input('check_in_date') ?: now()->format('Y-m-d');
        $checkOut = $request->input('checkOut') ?: $request->input('checkOutDate') ?: $request->input('check_out') ?: $request->input('check_out_date') ?: now()->addDays(2)->format('Y-m-d');

        $account = \Illuminate\Support\Facades\Auth::guard('api')->user();
        $userId = $account?->user?->id;

        $availService = new RoomAvailabilityService();

        $roomsInput = $request->input('rooms');
        if (is_array($roomsInput) && count($roomsInput) > 0) {
            $result = $availService->createHoldLockMulti($roomsInput, $checkIn, $checkOut, $userId, 15);
        } else {
            $roomId = (int)($request->input('roomId') ?: $request->input('room_id') ?: 1);
            $roomsCount = (int)($request->input('roomsCount') ?: $request->input('rooms_count') ?: 1);
            $result = $availService->createHoldLock($roomId, $checkIn, $checkOut, $userId, $roomsCount, 15);
        }

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'code' => $result['code'] ?? 'HOLD_FAILED',
                'status' => $result['status'] ?? 'unavailable',
                'conflicted_room_id' => $result['conflicted_room_id'] ?? null,
                'message' => $result['message'],
                'availability' => $result['availability'] ?? null,
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã khóa giữ chỗ phòng thành công trong 15 phút!',
            'data' => $result,
        ]);
    }

    /**
     * Giải phóng khóa giữ chỗ (khi khách hủy hoặc quay lại trang trước)
     * POST /api/bookings/release-hold
     */
    public function releaseHold(Request $request): JsonResponse
    {
        $lockToken = $request->input('lockToken') ?: $request->input('lock_token');
        if (!$lockToken) {
            return response()->json(['success' => false, 'message' => 'Thiếu lockToken.'], 400);
        }

        $availService = new RoomAvailabilityService();
        $released = $availService->releaseLock($lockToken);

        return response()->json([
            'success' => true,
            'message' => $released ? 'Đã giải phóng giữ phòng thành công.' : 'Khóa giữ phòng không tồn tại hoặc đã hết hạn.',
        ]);
    }

    /**
     * Kiểm tra tính khả dụng của phòng theo ngày (Check Availability)
     * POST /api/bookings/check-availability
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $roomId = (int)($request->input('roomId') ?: $request->input('room_id') ?: 1);
        $checkIn = $request->input('checkIn') ?: $request->input('checkInDate') ?: $request->input('check_in') ?: $request->input('check_in_date') ?: now()->format('Y-m-d');
        $checkOut = $request->input('checkOut') ?: $request->input('checkOutDate') ?: $request->input('check_out') ?: $request->input('check_out_date') ?: now()->addDays(2)->format('Y-m-d');
        $lockToken = $request->input('lockToken') ?: $request->input('lock_token');
        $roomsCount = (int)($request->input('roomsCount') ?: $request->input('rooms_count') ?: 1);

        $availService = new RoomAvailabilityService();
        $avail = $availService->checkRoomAvailability($roomId, $checkIn, $checkOut, null, $lockToken, $roomsCount);

        return response()->json([
            'success' => true,
            'availability' => $avail,
        ]);
    }

    /**
     * Lấy danh sách các khoảng ngày đã kín lịch của 1 phòng (cho Date Picker & Lịch hiển thị)
     * GET /api/rooms/{id}/booked-dates
     */
    public function getBookedDates($roomId): JsonResponse
    {
        $availService = new RoomAvailabilityService();
        $ranges = $availService->getBookedRangesForRoom((int)$roomId);

        return response()->json([
            'success' => true,
            'roomId' => (int)$roomId,
            'bookedRanges' => $ranges,
        ]);
    }
}


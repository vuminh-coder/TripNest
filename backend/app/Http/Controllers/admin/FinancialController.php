<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\PayoutTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialController extends Controller
{
    /**
     * Thống kê tổng thể tài chính nền tảng (Admin Dashboard & Financials)
     */
    public function getStats(): JsonResponse
    {
        // 1. Tổng GMV thu hộ từ các booking đã xác nhận / hoàn tất (loại trừ đơn hủy)
        $validBookingsQuery = Booking::whereIn('status', ['confirmed', 'checked_in', 'completed']);
        $totalGMVVND = (float)$validBookingsQuery->sum('total_price');
        $validBookingsCount = $validBookingsQuery->count();

        // 2. Hoa hồng nền tảng (phí dịch vụ 12%) từ các booking hợp lệ
        $commissionRevenueVND = (float)$validBookingsQuery->sum('service_fee');

        // 3. Quỹ tạm giữ Escrow chờ giải ngân (status = 'pending')
        $escrowPendingVND = (float)PayoutTransaction::where('status', 'pending')->sum('net_payout_amount');
        $pendingPayoutsCount = PayoutTransaction::where('status', 'pending')->count();

        // 4. Tổng tiền đã giải ngân cho Host (status = 'completed')
        $payoutsCompletedVND = (float)PayoutTransaction::where('status', 'completed')->sum('net_payout_amount');
        $completedPayoutsCount = PayoutTransaction::where('status', 'completed')->count();

        // 5. Số lượng lệnh hủy payout
        $cancelledPayoutsCount = PayoutTransaction::where('status', 'cancelled')->count();

        // 6. Tổng hoàn tiền (Refunds) & số lượng đơn hủy
        $totalRefundedVND = (float)Booking::where('status', 'cancelled')
            ->where('refund_amount', '>', 0)
            ->sum('refund_amount');
        $cancelledBookingsCount = Booking::where('status', 'cancelled')->count();
        $totalBookingsCount = Booking::count();

        return response()->json([
            'totalRevenueVND' => $totalGMVVND,
            'commissionRevenueVND' => $commissionRevenueVND,
            'escrowPendingVND' => $escrowPendingVND,
            'payoutsCompletedVND' => $payoutsCompletedVND,
            'pendingPayoutsCount' => $pendingPayoutsCount,
            'completedPayoutsCount' => $completedPayoutsCount,
            'cancelledPayoutsCount' => $cancelledPayoutsCount,
            'totalRefundedVND' => $totalRefundedVND,
            'cancelledBookingsCount' => $cancelledBookingsCount,
            'validBookingsCount' => $validBookingsCount,
            'totalBookings' => $totalBookingsCount,
            'totalBookingsCount' => $totalBookingsCount,
        ]);
    }

    /**
     * Danh sách tất cả các Lệnh Giải Ngân (Payouts)
     */
    public function getPayouts(Request $request): JsonResponse
    {
        $payouts = PayoutTransaction::with([
            'host.user',
            'host.defaultPayoutAccount',
            'booking.room.accommodation',
            'booking.voucher',
            'payoutAccount',
        ])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($p) {
            $host = $p->host;
            $account = $p->payoutAccount ?: $host?->defaultPayoutAccount;
            $booking = $p->booking;

                $gross = (float)$p->gross_amount;
                $commission = (float)$p->platform_commission_fee > 0 ? (float)$p->platform_commission_fee : round($gross * 0.12);
                $net = ((float)$p->net_payout_amount > 0 && (float)$p->net_payout_amount < $gross)
                    ? (float)$p->net_payout_amount
                    : max(0, $gross - $commission);

                return [
                    'id' => $p->payout_code ?: 'POT-' . $p->id,
                    'payoutId' => $p->id,
                    'host_id' => $p->host_id,
                    'host_name' => $host?->host_display_name ?: 'Chủ nhà TripNest',
                    'host_avatar' => $host?->user?->avatar_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                    'booking_code' => $booking?->booking_code ?: 'TN-000000',
                    'room_title' => $booking?->room?->room_name_vi ?: 'Không gian nghỉ dưỡng',
                    'gross_amount' => $gross,
                    'commission_fee' => $commission,
                    'net_payout' => $net,
                    'voucher_discount' => (float)($booking?->discount_amount ?: 0),
                    'voucher_code' => $booking?->voucher?->code,
                    'guest_paid' => (float)($booking?->total_price ?: ($gross + $commission)),
                'bank_name' => $account?->bank_name ?: 'Vietcombank',
                'account_number' => $account?->account_number ?: '9988776655',
                'account_holder' => $account?->account_holder_name ?: 'CHỦ NHÀ TRIPNEST',
                'status' => $p->status,
                'transaction_ref' => $p->transaction_reference,
                'created_at' => $p->created_at ? $p->created_at->format('d/m/Y H:i') : '',
                'transferred_at' => $p->transferred_at ? $p->transferred_at->format('d/m/Y H:i') : '',
            ];
        });

        return response()->json($payouts);
    }

    /**
     * Admin Duyệt & Thực hiện Giải Ngân Lệnh Payout
     */
    public function approvePayout($id, Request $request): JsonResponse
    {
        $payout = PayoutTransaction::where('payout_code', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$payout) {
            return response()->json(['message' => 'Không tìm thấy lệnh giải ngân.'], 404);
        }

        $ref = $request->input('transactionRef', 'VCB-' . rand(1000000, 9999999));

        $payout->update([
            'status' => 'completed',
            'transaction_reference' => $ref,
            'transferred_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã duyệt và giải ngân thành công cho Chủ nhà!',
            'payout' => $payout,
        ]);
    }

    /**
     * Danh sách tất cả đơn đặt phòng (Admin Bookings)
     */
    public function getBookings(Request $request): JsonResponse
    {
        $bookings = Booking::with(['user.account', 'room.accommodation.host', 'voucher'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->booking_code,
                    'bookingId' => $b->id,
                    'room_name' => $b->room?->room_name_vi ?: 'Chỗ nghỉ TripNest',
                    'room_id' => $b->room_id,
                    'guest_name' => $b->user?->full_name ?: 'Khách hàng',
                    'guest_email' => $b->user?->account?->email ?: '',
                    'guest_phone' => $b->user?->phone_number ?: '',
                    'host_name' => $b->room?->accommodation?->host?->host_display_name ?: 'Chủ nhà',
                    'check_in' => $b->check_in_date ? date('Y-m-d', strtotime($b->check_in_date)) : '',
                    'check_out' => $b->check_out_date ? date('Y-m-d', strtotime($b->check_out_date)) : '',
                    'nights' => $b->nights_count,
                    'guests_count' => $b->guests_count,
                    'base_price' => (float)$b->base_price,
                    'cleaning_fee' => (float)$b->cleaning_fee,
                    'service_fee' => (float)$b->service_fee,
                    'discount_amount' => (float)$b->discount_amount,
                    'voucher_code' => $b->voucher?->code ?: '',
                    'voucher_title' => $b->voucher?->title ?: '',
                    'total_price' => (float)$b->total_price,
                    'currency' => $b->currency ?: 'VND',
                    'payment_method' => 'Chuyển khoản / Cổng thanh toán',
                    'payment_status' => 'paid',
                    'status' => $b->status,
                    'cancellation_reason' => $b->cancellation_reason,
                    'cancelled_at' => $b->cancelled_at ? $b->cancelled_at->format('d/m/Y H:i') : '',
                    'refund_amount' => (float)($b->refund_amount ?? 0),
                    'refund_percentage' => (int)($b->refund_percentage ?? 0),
                    'created_at' => $b->created_at ? $b->created_at->format('d/m/Y H:i') : '',
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $bookings,
            'total' => $bookings->count(),
        ]);
    }
}

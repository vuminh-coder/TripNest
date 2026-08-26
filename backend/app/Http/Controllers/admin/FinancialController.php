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
        // 1. Tổng GMV thu hộ từ các booking đã xác nhận / hoàn tất
        $totalGMVVND = (float)Booking::whereIn('status', ['confirmed', 'checked_in', 'completed'])->sum('total_price');

        // 2. Hoa hồng nền tảng (12% phí dịch vụ)
        $commissionRevenueVND = (float)Booking::whereIn('status', ['confirmed', 'checked_in', 'completed'])->sum('service_fee');

        // 3. Quỹ tạm giữ Escrow chờ giải ngân (status = 'pending')
        $escrowPendingVND = (float)PayoutTransaction::where('status', 'pending')->sum('net_payout_amount');

        // 4. Tổng tiền đã giải ngân cho Host (status = 'completed')
        $payoutsCompletedVND = (float)PayoutTransaction::where('status', 'completed')->sum('net_payout_amount');

        // 5. Số lượng lệnh chờ giải ngân
        $pendingPayoutsCount = PayoutTransaction::where('status', 'pending')->count();

        return response()->json([
            'totalRevenueVND' => $totalGMVVND,
            'commissionRevenueVND' => $commissionRevenueVND,
            'escrowPendingVND' => $escrowPendingVND,
            'payoutsCompletedVND' => $payoutsCompletedVND,
            'pendingPayoutsCount' => $pendingPayoutsCount,
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
            'payoutAccount',
        ])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($p) {
            $host = $p->host;
            $account = $p->payoutAccount ?: $host?->defaultPayoutAccount;

            return [
                'id' => $p->payout_code ?: 'POT-' . $p->id,
                'payoutId' => $p->id,
                'host_id' => $p->host_id,
                'host_name' => $host?->host_display_name ?: 'Chủ nhà TripNest',
                'host_avatar' => $host?->user?->avatar_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                'booking_code' => $p->booking?->booking_code ?: 'TN-000000',
                'room_title' => $p->booking?->room?->room_name_vi ?: 'Không gian nghỉ dưỡng',
                'gross_amount' => (float)$p->gross_amount,
                'commission_fee' => (float)$p->platform_commission_fee,
                'net_payout' => (float)$p->net_payout_amount,
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
}

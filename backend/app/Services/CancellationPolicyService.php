<?php

namespace App\Services;

use App\Models\Booking;
use Carbon\Carbon;

class CancellationPolicyService
{
    /**
     * Tính toán chính sách hoàn tiền dựa trên thời điểm hủy vs check-in
     *
     * Quy tắc 3 bậc:
     * - ≥ 48h trước check-in (14:00) → Hoàn 100% (base + cleaning + service_fee)
     * - < 48h và trước check-in       → Hoàn 50%  (chỉ base + cleaning, không service_fee)
     * - Sau giờ check-in              → Hoàn 0%   (không hoàn tiền)
     *
     * @return array{
     *   refund_percentage: int,
     *   refundable_amount: float,
     *   platform_fee_kept: float,
     *   service_fee_refundable: bool,
     *   policy_applied: string,
     *   hours_until_checkin: float,
     *   policy_description_vi: string,
     *   breakdown: array,
     * }
     */
    public function calculate(Booking $booking): array
    {
        $checkInDateTime = Carbon::parse($booking->check_in_date)->setHour(14)->setMinute(0)->setSecond(0);
        $now = now();
        $hoursUntilCheckIn = $now->floatDiffInHours($checkInDateTime, false);

        $basePrice = (float)$booking->base_price;
        $cleaningFee = (float)$booking->cleaning_fee;
        $serviceFee = (float)$booking->service_fee;
        $discountAmount = (float)$booking->discount_amount;
        $totalPrice = (float)$booking->total_price;

        $roomSubtotal = $basePrice + $cleaningFee;

        if ($hoursUntilCheckIn >= 48) {
            // ≥ 48 giờ trước check-in → Hoàn 100%
            $refundableAmount = max(0, $totalPrice);
            return [
                'refund_percentage' => 100,
                'refundable_amount' => $refundableAmount,
                'platform_fee_kept' => 0,
                'service_fee_refundable' => true,
                'policy_applied' => 'full_48h',
                'hours_until_checkin' => round($hoursUntilCheckIn, 1),
                'policy_description_vi' => 'Hủy trước 48 giờ so với ngày nhận phòng: Hoàn tiền 100%',
                'breakdown' => [
                    'base_price_refund' => $basePrice,
                    'cleaning_fee_refund' => $cleaningFee,
                    'service_fee_refund' => $serviceFee,
                    'discount_deducted' => $discountAmount,
                    'total_refund' => $refundableAmount,
                ],
            ];
        } elseif ($hoursUntilCheckIn > 0) {
            // < 48h nhưng chưa tới giờ check-in → Hoàn 50% (chỉ phí phòng + vệ sinh)
            $halfRoomSubtotal = round($roomSubtotal * 0.5);
            $refundableAmount = max(0, $halfRoomSubtotal);
            $platformFeeKept = $serviceFee;

            return [
                'refund_percentage' => 50,
                'refundable_amount' => $refundableAmount,
                'platform_fee_kept' => $platformFeeKept,
                'service_fee_refundable' => false,
                'policy_applied' => 'partial_48h',
                'hours_until_checkin' => round($hoursUntilCheckIn, 1),
                'policy_description_vi' => 'Hủy trong vòng 48 giờ trước ngày nhận phòng: Hoàn 50% phí phòng',
                'breakdown' => [
                    'base_price_refund' => round($basePrice * 0.5),
                    'cleaning_fee_refund' => round($cleaningFee * 0.5),
                    'service_fee_refund' => 0,
                    'discount_deducted' => 0,
                    'total_refund' => $refundableAmount,
                ],
            ];
        } else {
            // Đã quá giờ check-in → Không hoàn tiền
            return [
                'refund_percentage' => 0,
                'refundable_amount' => 0,
                'platform_fee_kept' => $serviceFee,
                'service_fee_refundable' => false,
                'policy_applied' => 'non_refundable',
                'hours_until_checkin' => round($hoursUntilCheckIn, 1),
                'policy_description_vi' => 'Đã quá giờ nhận phòng (14:00): Không hoàn tiền',
                'breakdown' => [
                    'base_price_refund' => 0,
                    'cleaning_fee_refund' => 0,
                    'service_fee_refund' => 0,
                    'discount_deducted' => 0,
                    'total_refund' => 0,
                ],
            ];
        }
    }

    /**
     * Tính toán cho Host hủy — luôn hoàn 100% cho khách (lỗi thuộc Host)
     */
    public function calculateHostCancel(Booking $booking): array
    {
        $totalPrice = (float)$booking->total_price;

        return [
            'refund_percentage' => 100,
            'refundable_amount' => max(0, $totalPrice),
            'platform_fee_kept' => 0,
            'service_fee_refundable' => true,
            'policy_applied' => 'host_cancel',
            'hours_until_checkin' => 0,
            'policy_description_vi' => 'Chủ nhà hủy đơn: Hoàn tiền 100% cho khách',
            'breakdown' => [
                'base_price_refund' => (float)$booking->base_price,
                'cleaning_fee_refund' => (float)$booking->cleaning_fee,
                'service_fee_refund' => (float)$booking->service_fee,
                'discount_deducted' => (float)$booking->discount_amount,
                'total_refund' => max(0, $totalPrice),
            ],
        ];
    }
}

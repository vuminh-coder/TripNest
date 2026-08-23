<?php

namespace App\Http\Controllers;

use App\Models\Host;
use App\Models\HostPayoutAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HostController extends Controller
{
    /**
     * Ước tính doanh thu cho thuê phòng
     */
    public function estimate(Request $request): JsonResponse
    {
        $nights = (int)$request->input('nights', 7);
        $location = $request->input('location', 'Đà Lạt');

        $basePrices = [
            'Hà Nội' => 1200000,
            'Phú Quốc' => 2500000,
            'Đà Lạt' => 1800000,
            'Hạ Long' => 2000000,
            'Hội An' => 1500000,
            'TP. Hồ Chí Minh' => 1600000,
            'Đà Nẵng' => 1700000,
            'Sa Pa' => 1400000,
        ];

        $basePrice = $basePrices[$location] ?? 1800000;
        $estimatedVND = $nights * $basePrice;
        $estimatedUSD = round($estimatedVND / 25000);

        return response()->json([
            'location' => $location,
            'nights' => $nights,
            'basePricePerNightVND' => $basePrice,
            'estimatedTotalVND' => $estimatedVND,
            'estimatedTotalUSD' => $estimatedUSD,
        ]);
    }

    /**
     * Nâng cấp tài khoản User lên Host (Đăng ký chủ nhà KYC)
     */
    public function registerHost(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'hostDisplayName' => 'required|string|max:100',
            'contactPhone' => 'required|string|max:20',
            'idCardNumber' => 'required|string|max:30',
            'bankName' => 'required|string|max:100',
            'accountNumber' => 'required|string|max:50',
            'accountHolderName' => 'required|string|max:100',
            'introduction' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp đầy đủ thông tin đăng ký chủ nhà.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $account = \Illuminate\Support\Facades\Auth::guard('api')->user();
        $user = $account?->user ?: User::first();

        // Kiểm tra xem đã là Host chưa
        $host = Host::firstOrCreate(
            ['user_id' => $user->id],
            [
                'host_display_name' => $request->input('hostDisplayName'),
                'contact_phone' => $request->input('contactPhone'),
                'contact_email' => $user->account?->email,
                'host_introduction' => $request->input('introduction'),
                'id_card_number' => $request->input('idCardNumber'),
                'id_card_front_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                'id_card_back_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                'kyc_status' => 'verified',
                'verified_at' => now(),
                'terms_accepted_at' => now(),
            ]
        );

        // Tạo tài khoản ngân hàng nhận tiền Payout
        HostPayoutAccount::create([
            'host_id' => $host->id,
            'account_type' => 'bank_transfer',
            'bank_name' => $request->input('bankName'),
            'account_number' => $request->input('accountNumber'),
            'account_holder_name' => mb_strtoupper($request->input('accountHolderName')),
            'is_default' => true,
            'is_verified' => true,
        ]);

        // Cập nhật quyền role = 'host' trong accounts
        $user->account?->update(['role' => 'host']);

        return response()->json([
            'success' => true,
            'message' => 'Chúc mừng bạn đã đăng ký trở thành Chủ nhà thành công trên TripNest!',
            'host' => $host->load('defaultPayoutAccount'),
        ]);
    }
}

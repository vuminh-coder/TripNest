<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\AccommodationImage;
use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Category;
use App\Models\Host;
use App\Models\HostPayoutAccount;
use App\Models\PayoutTransaction;
use App\Models\Room;
use App\Models\RoomImage;
use App\Models\User;
use App\Models\ExchangeRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class HostController extends Controller
{
    /**
     * Helper: Lấy Host instance của User hiện tại đã xác thực
     */
    private function getCurrentHost(): ?Host
    {
        try {
            $account = Auth::guard('api')->user();
            if ($account && $account->user && $account->user->host) {
                return $account->user->host;
            }

            // Nếu tài khoản đã xác thực user, khởi tạo bản ghi host nếu chưa có
            if ($account && $account->user) {
                $host = Host::firstOrCreate(
                    ['user_id' => $account->user->id],
                    [
                        'host_display_name' => $account->user->full_name ?: ($account->email ? explode('@', $account->email)[0] : 'Chủ nhà TripNest'),
                        'contact_phone' => $account->user->phone_number ?: '0912345678',
                        'contact_email' => $account->email ?: 'host@tripnest.vn',
                        'host_introduction' => 'Chào mừng bạn đến với không gian nghỉ dưỡng cao cấp của tôi trên TripNest!',
                        'id_card_number' => $account->user->id_card_number ?: '001200012345',
                        'id_card_front_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                        'id_card_back_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                        'kyc_status' => 'verified',
                        'is_superhost' => true,
                        'host_rating' => 4.96,
                        'host_reviews_count' => 0,
                        'response_rate_percent' => 100,
                        'response_time_text' => 'trong vòng 1 giờ',
                        'verified_at' => now(),
                        'terms_accepted_at' => now(),
                    ]
                );

                if ($account->role !== 'admin' && $account->role !== 'host') {
                    $account->update(['role' => 'host']);
                }

                return $host;
            }
        } catch (\Throwable $e) {
            // Ignored
        }

        // Fallback for Host Portal (Dev / Demo Host / Superhost Minh Hoàng Đà Lạt)
        return Host::find(1) ?? Host::first();
    }

    /**
     * Upload hình ảnh chỗ nghỉ từ thiết bị
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:10240', // tối đa 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Tệp ảnh không hợp lệ hoặc vượt quá 10MB.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('image');
            $fileName = 'acc_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('accommodations', $fileName, 'public');

            // Tạo URL tuyệt đối có thể truy cập từ browser
            $url = asset('storage/' . $path);

            return response()->json([
                'success' => true,
                'message' => 'Tải ảnh lên thành công!',
                'url' => $url,
                'path' => $path,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải ảnh lên: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ước tính doanh thu cho thuê phòng (Public)
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
            'Vũng Tàu' => 1900000,
            'Nha Trang' => 1650000,
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
        $displayName = $request->input('hostDisplayName') ?? $request->input('host_display_name') ?? $request->input('fullName');
        $phone = $request->input('contactPhone') ?? $request->input('contact_phone') ?? $request->input('phone');
        $idCard = $request->input('idCardNumber') ?? $request->input('id_card_number') ?? '00109' . rand(1000000, 9999999);
        $bankName = $request->input('bankName') ?? $request->input('bank_name') ?? 'Vietcombank';
        $accountNumber = $request->input('accountNumber') ?? $request->input('account_number') ?? '10' . rand(10000000, 99999999);
        $holder = $request->input('accountHolderName') ?? $request->input('account_holder_name') ?? ($displayName ? mb_strtoupper($displayName) : 'CHU NHA');
        $intro = $request->input('introduction') ?? $request->input('reason') ?? 'Đăng ký kinh doanh chỗ ở trên hệ thống TripNest.';
        $propertyType = $request->input('propertyType') ?? $request->input('property_type') ?? 'Biệt thự villa';
        $frontImg = $request->input('idCardFrontUrl') ?? $request->input('id_card_front_url') ?? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';
        $backImg = $request->input('idCardBackUrl') ?? $request->input('id_card_back_url') ?? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';

        if (empty($displayName) || empty($phone)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp đầy đủ họ tên hiển thị và số điện thoại liên hệ.',
            ], 422);
        }

        $account = Auth::guard('api')->user();
        if (!$account) {
            $user = User::first();
        } else {
            $user = $account->user ?: User::first();
        }

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin tài khoản người dùng.'], 404);
        }

        $host = DB::transaction(function () use ($user, $displayName, $phone, $idCard, $bankName, $accountNumber, $holder, $intro, $propertyType, $frontImg, $backImg) {
            $host = Host::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'host_display_name' => $displayName,
                    'contact_phone' => $phone,
                    'contact_email' => $user->account?->email ?: ($user->email ?? 'host@tripnest.vn'),
                    'host_introduction' => $intro,
                    'business_name' => $propertyType,
                    'id_card_number' => $idCard,
                    'id_card_front_url' => $frontImg,
                    'id_card_back_url' => $backImg,
                    'kyc_status' => 'pending',
                    'terms_accepted_at' => now(),
                ]
            );

            // Cập nhật/Tạo tài khoản ngân hàng nhận tiền Payout
            HostPayoutAccount::updateOrCreate(
                ['host_id' => $host->id, 'is_default' => true],
                [
                    'account_type' => 'bank_transfer',
                    'bank_name' => $bankName,
                    'account_number' => $accountNumber,
                    'account_holder_name' => mb_strtoupper($holder),
                    'is_verified' => false,
                ]
            );

            return $host;
        });

        return response()->json([
            'success' => true,
            'message' => 'Hồ sơ đăng ký Chủ nhà đã được gửi thành công và đang chờ Quản trị viên thẩm định!',
            'host' => $host->load('defaultPayoutAccount'),
        ]);
    }

    /**
     * Lấy các chỉ số KPI & Doanh thu tổng quan cho Host Dashboard
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin chủ nhà.'], 404);
        }

        $accommodationsCount = Accommodation::where('host_id', $host->id)->count();
        $roomIds = Room::whereHas('accommodation', function ($q) use ($host) {
            $q->where('host_id', $host->id);
        })->pluck('id');

        $bookingsQuery = Booking::whereIn('room_id', $roomIds);
        $totalBookings = (clone $bookingsQuery)->count();
        $pendingBookings = (clone $bookingsQuery)->where('status', 'pending')->count();
        $completedBookings = (clone $bookingsQuery)->where('status', 'completed')->count();

        // 1. Lọc các đơn hợp lệ (không bị hủy)
        $validBookings = (clone $bookingsQuery)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->with(['room.accommodation', 'user', 'voucher'])
            ->get();

        // 2. Tổng doanh số GMV lưu trú thực tế
        $totalRevenueVND = (float)$validBookings->sum('total_price');
        $platformFeeTotal = round($totalRevenueVND * 0.12);
        $netEarningsTotal = max(0, $totalRevenueVND - $platformFeeTotal);

        // 3. Quỹ Escrow Tạm Giữ: Tiền bảo chứng của các đơn confirmed & checked_in (khách chưa trả phòng)
        $activeEscrowBookings = $validBookings->whereIn('status', ['confirmed', 'checked_in']);
        $escrowPendingVND = (float)$activeEscrowBookings->sum(function ($b) {
            $gross = (float)($b->base_price + $b->cleaning_fee);
            $comm = (float)$b->service_fee > 0 ? (float)$b->service_fee : round($gross * 0.12);
            return max(0, $gross - $comm);
        });

        // 4. Doanh thu đã hoàn tất (khách đã check-out): Chuyển thành số dư ví khả dụng
        $completedBookingsCollection = $validBookings->where('status', 'completed');
        $totalEarnedFromCompleted = (float)$completedBookingsCollection->sum(function ($b) {
            $gross = (float)($b->base_price + $b->cleaning_fee);
            $comm = (float)$b->service_fee > 0 ? (float)$b->service_fee : round($gross * 0.12);
            return max(0, $gross - $comm);
        });

        // 5. Tổng tiền Host đã rút hoặc đang chờ Admin duyệt rút (whereNull('booking_id'))
        $withdrawnAmount = (float)PayoutTransaction::where('host_id', $host->id)
            ->whereNull('booking_id')
            ->whereIn('status', ['pending', 'completed'])
            ->sum('net_payout_amount');

        // Số dư ví khả dụng sẵn sàng rút (Available Balance)
        $netAvailableBalance = max(0, $totalEarnedFromCompleted - $withdrawnAmount);

        // Số khách đang ở thực tế (Active Stay)
        $today = now()->format('Y-m-d');
        $activeStayCount = (clone $bookingsQuery)
            ->where('status', 'checked_in')
            ->where(function ($q) use ($today) {
                $q->whereNull('check_in_date')
                  ->orWhere(function ($sub) use ($today) {
                      $sub->where('check_in_date', '<=', $today)
                          ->where('check_out_date', '>=', $today);
                  });
            })
            ->count();
        $activeBookings = $activeStayCount > 0 ? $activeStayCount : (clone $bookingsQuery)->where('status', 'checked_in')->count();

        // Đơn đặt mới nhất từ CSDL thực
        $recentBookings = (clone $validBookings)
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->map(function ($b) {
                $grossAmount = (float)($b->base_price + $b->cleaning_fee);
                $commissionFee = (float)$b->service_fee > 0 ? (float)$b->service_fee : round($grossAmount * 0.12);
                $netPayoutAmount = max(0, $grossAmount - $commissionFee);

                return [
                    'id' => $b->id,
                    'code' => $b->booking_code ?: ('TN-' . $b->id),
                    'bookingCode' => $b->booking_code ?: ('TN-' . $b->id),
                    'guestName' => $b->guest_name ?: $b->user?->full_name ?: 'Khách hàng TripNest',
                    'guestPhone' => $b->guest_phone ?: $b->user?->phone_number ?: '',
                    'roomTitle' => $b->room?->room_name_vi ?: $b->room?->accommodation?->name_vi ?: 'Cơ sở lưu trú',
                    'listingName' => $b->room?->accommodation?->name_vi ?: ($b->room?->room_name_vi ?: 'Cơ sở lưu trú'),
                    'roomName' => $b->room?->room_name_vi ?: 'Phòng tiêu chuẩn',
                    'city' => $b->room?->accommodation?->city ?: 'Việt Nam',
                    'checkIn' => $b->check_in_date?->format('Y-m-d') ?: ($b->created_at ? $b->created_at->format('Y-m-d') : ''),
                    'checkOut' => $b->check_out_date?->format('Y-m-d') ?: ($b->check_in_date ? $b->check_in_date->copy()->addDays($b->nights_count ?: 1)->format('Y-m-d') : ''),
                    'nights' => (int)($b->nights_count ?: 1),
                    'guests' => (int)($b->guests_count ?: 2),
                    'basePrice' => (float)$b->base_price,
                    'cleaningFee' => (float)$b->cleaning_fee,
                    'grossAmount' => $grossAmount,
                    'serviceFee' => $commissionFee,
                    'commissionFee' => $commissionFee,
                    'discountAmount' => (float)$b->discount_amount,
                    'hasVoucher' => !empty($b->voucher_id) || (float)$b->discount_amount > 0,
                    'voucherCode' => $b->voucher?->code,
                    'totalAmount' => (float)$b->total_price,
                    'totalPrice' => (float)$b->total_price,
                    'guestPaidTotal' => (float)$b->total_price,
                    'hostEarnings' => $netPayoutAmount,
                    'hostPayoutAmount' => $netPayoutAmount,
                    'netPayout' => $netPayoutAmount,
                    'status' => $b->status ?: 'confirmed',
                    'checkedInAt' => $b->checked_in_at?->format('d/m/Y H:i'),
                    'checkedOutAt' => $b->checked_out_at?->format('d/m/Y H:i'),
                    'createdAt' => $b->created_at?->format('d/m/Y H:i'),
                ];
            });

        // 6. Phân tích cơ cấu doanh thu theo từng cơ sở lưu trú (Accommodation Breakdown)
        $accommodationsList = Accommodation::where('host_id', $host->id)
            ->with(['images', 'rooms'])
            ->get();

        $palette = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1'];
        $accommodationBreakdown = [];
        $colorIdx = 0;

        foreach ($accommodationsList as $acc) {
            $accRoomIds = $acc->rooms->pluck('id');
            $accBookings = $validBookings->whereIn('room_id', $accRoomIds);
            $accGmv = (float)$accBookings->sum('total_price');
            $accComm = round($accGmv * 0.12);
            $accNet = max(0, $accGmv - $accComm);
            $accCount = $accBookings->count();

            $thumbnail = $acc->images->firstWhere('is_thumbnail', true)?->image_url
                ?: $acc->images->first()?->image_url
                ?: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400';

            $accommodationBreakdown[] = [
                'id' => $acc->id,
                'name' => $acc->name_vi ?: $acc->name,
                'city' => $acc->city ?: 'Việt Nam',
                'category' => $acc->category?->name_vi ?: 'Nghỉ dưỡng',
                'thumbnail' => $thumbnail,
                'gmv' => $accGmv,
                'commission' => $accComm,
                'net' => $accNet,
                'bookings_count' => $accCount,
                'percentage' => $totalRevenueVND > 0 ? round(($accGmv / $totalRevenueVND) * 100, 1) : 0,
                'color' => $palette[$colorIdx % count($palette)],
            ];
            $colorIdx++;
        }

        usort($accommodationBreakdown, fn($a, $b) => $b['gmv'] <=> $a['gmv']);

        // 7. Cơ cấu dòng tiền tổng thể đối soát (Financial Breakdown)
        $financialBreakdown = [
            'totalGmv' => $totalRevenueVND,
            'netEarnings' => $netEarningsTotal,
            'platformFee' => $platformFeeTotal,
            'escrowPending' => $escrowPendingVND,
            'availableBalance' => $netAvailableBalance,
            'completedPayouts' => $totalEarnedFromCompleted,
            'totalWithdrawn' => $withdrawnAmount,
        ];

        // 8. Xây dựng Dòng tiền Đa Chu kỳ theo Ngày Nhận Phòng Thực Tế (Cashflow Timeline)
        $period = $request->input('period', 'month');
        $year = (int)$request->input('year', date('Y'));
        $quarter = (int)$request->input('quarter', ceil(date('n') / 3));
        $targetMonth = (int)$request->input('month', date('n'));

        $timeline = [];
        $vietnameseDays = [
            'Monday' => 'Thứ 2', 'Tuesday' => 'Thứ 3', 'Wednesday' => 'Thứ 4',
            'Thursday' => 'Thứ 5', 'Friday' => 'Thứ 6', 'Saturday' => 'Thứ 7', 'Sunday' => 'CN',
        ];

        if ($period === 'week') {
            for ($i = 6; $i >= 0; $i--) {
                $targetDate = date('Y-m-d', strtotime("-$i days"));
                $displayLabel = date('d/m', strtotime($targetDate));
                $dayOfWeek = date('l', strtotime($targetDate));
                $dayNameVN = $vietnameseDays[$dayOfWeek] ?? $dayOfWeek;

                $dayBookings = $validBookings->filter(function ($b) use ($targetDate) {
                    $d = $b->check_in_date ? $b->check_in_date->format('Y-m-d') : ($b->created_at ? $b->created_at->format('Y-m-d') : '');
                    return $d === $targetDate;
                });
                $dayGmv = (float)$dayBookings->sum('total_price');
                $dayComm = round($dayGmv * 0.12);
                $dayNet = max(0, $dayGmv - $dayComm);
                $dayEscrow = (float)$dayBookings->whereIn('status', ['confirmed', 'checked_in'])->sum(fn($b) => max(0, (float)($b->base_price + $b->cleaning_fee) - (float)($b->service_fee > 0 ? $b->service_fee : round(($b->base_price + $b->cleaning_fee) * 0.12))));

                $timeline[] = [
                    'label' => $dayNameVN,
                    'time_label' => $dayNameVN,
                    'subLabel' => $displayLabel,
                    'gmv' => $dayGmv,
                    'net_earnings' => $dayNet,
                    'escrow' => $dayEscrow,
                    'commission' => $dayComm,
                    'bookings_count' => $dayBookings->count(),
                ];
            }
        } elseif ($period === 'quarter') {
            $startMonth = ($quarter - 1) * 3 + 1;
            for ($m = 0; $m < 3; $m++) {
                $monthNum = $startMonth + $m;
                $monthStr = str_pad($monthNum, 2, '0', STR_PAD_LEFT);
                $label = "Tháng $monthNum";
                $subLabel = "$monthStr/$year";

                $mBookings = $validBookings->filter(function ($b) use ($monthNum, $year) {
                    $dateObj = $b->check_in_date ?: $b->created_at;
                    return $dateObj && (int)$dateObj->format('n') === $monthNum && (int)$dateObj->format('Y') === $year;
                });
                $mGmv = (float)$mBookings->sum('total_price');
                $mComm = round($mGmv * 0.12);
                $mNet = max(0, $mGmv - $mComm);
                $mEscrow = (float)$mBookings->whereIn('status', ['confirmed', 'checked_in'])->sum(fn($b) => max(0, (float)($b->base_price + $b->cleaning_fee) - (float)($b->service_fee > 0 ? $b->service_fee : round(($b->base_price + $b->cleaning_fee) * 0.12))));

                $timeline[] = [
                    'label' => $label,
                    'time_label' => $label,
                    'subLabel' => $subLabel,
                    'gmv' => $mGmv,
                    'net_earnings' => $mNet,
                    'escrow' => $mEscrow,
                    'commission' => $mComm,
                    'bookings_count' => $mBookings->count(),
                ];
            }
        } elseif ($period === 'year') {
            for ($m = 1; $m <= 12; $m++) {
                $monthStr = str_pad($m, 2, '0', STR_PAD_LEFT);
                $label = "T$m";
                $subLabel = "$monthStr/$year";

                $mBookings = $validBookings->filter(function ($b) use ($m, $year) {
                    $dateObj = $b->check_in_date ?: $b->created_at;
                    return $dateObj && (int)$dateObj->format('n') === $m && (int)$dateObj->format('Y') === $year;
                });
                $mGmv = (float)$mBookings->sum('total_price');
                $mComm = round($mGmv * 0.12);
                $mNet = max(0, $mGmv - $mComm);
                $mEscrow = (float)$mBookings->whereIn('status', ['confirmed', 'checked_in'])->sum(fn($b) => max(0, (float)($b->base_price + $b->cleaning_fee) - (float)($b->service_fee > 0 ? $b->service_fee : round(($b->base_price + $b->cleaning_fee) * 0.12))));

                $timeline[] = [
                    'label' => $label,
                    'time_label' => $label,
                    'subLabel' => $subLabel,
                    'gmv' => $mGmv,
                    'net_earnings' => $mNet,
                    'escrow' => $mEscrow,
                    'commission' => $mComm,
                    'bookings_count' => $mBookings->count(),
                ];
            }
        } else {
            // Mặc định 'month': 4 tuần
            $monthBookings = $validBookings->filter(function ($b) use ($targetMonth, $year) {
                $dateObj = $b->check_in_date ?: $b->created_at;
                return $dateObj && (int)$dateObj->format('n') === $targetMonth && (int)$dateObj->format('Y') === $year;
            });

            for ($w = 1; $w <= 4; $w++) {
                $startDay = ($w - 1) * 7 + 1;
                $endDay = $w === 4 ? 31 : $w * 7;
                $label = "Tuần $w";
                $subLabel = sprintf("%02d/%02d - %02d/%02d", $startDay, $targetMonth, min($endDay, 30), $targetMonth);

                $wBookings = $monthBookings->filter(function ($b) use ($startDay, $endDay) {
                    $dateObj = $b->check_in_date ?: $b->created_at;
                    $d = (int)$dateObj?->format('j');
                    return $d >= $startDay && $d <= $endDay;
                });
                $wGmv = (float)$wBookings->sum('total_price');
                $wComm = round($wGmv * 0.12);
                $wNet = max(0, $wGmv - $wComm);
                $wEscrow = (float)$wBookings->whereIn('status', ['confirmed', 'checked_in'])->sum(fn($b) => max(0, (float)($b->base_price + $b->cleaning_fee) - (float)($b->service_fee > 0 ? $b->service_fee : round(($b->base_price + $b->cleaning_fee) * 0.12))));

                $timeline[] = [
                    'label' => $label,
                    'time_label' => $label,
                    'subLabel' => $subLabel,
                    'gmv' => $wGmv,
                    'net_earnings' => $wNet,
                    'escrow' => $dayEscrow ?? $wEscrow,
                    'commission' => $wComm,
                    'bookings_count' => $wBookings->count(),
                ];
            }
        }

        $daysInPeriod = match($period) {
            'week' => 7,
            'quarter' => 90,
            'year' => 365,
            default => (int)date('t', mktime(0, 0, 0, $targetMonth, 1, $year)),
        };
        $totalRoomsCount = max(1, $roomIds->count());
        $totalAvailableNights = $totalRoomsCount * $daysInPeriod;

        $periodBookings = match($period) {
            'week' => $validBookings->filter(fn($b) => ($b->check_in_date ?: $b->created_at)?->gte(now()->subDays(7))),
            'quarter' => $validBookings->filter(fn($b) => ($b->check_in_date ?: $b->created_at)?->format('Y') == $year && ceil((int)($b->check_in_date ?: $b->created_at)?->format('n') / 3) == $quarter),
            'year' => $validBookings->filter(fn($b) => ($b->check_in_date ?: $b->created_at)?->format('Y') == $year),
            default => $validBookings->filter(fn($b) => ($b->check_in_date ?: $b->created_at)?->format('Y') == $year && (int)($b->check_in_date ?: $b->created_at)?->format('n') == $targetMonth),
        };
        $bookedNights = (int)$periodBookings->sum('nights_count');
        $realOccupancyRate = $totalAvailableNights > 0 
            ? min(100, (int)round(($bookedNights / $totalAvailableNights) * 100)) 
            : 0;

        return response()->json([
            'success' => true,
            'host' => [
                'id' => $host->id,
                'displayName' => $host->host_display_name,
                'avatarUrl' => $host->host_avatar_url,
                'rating' => (float)$host->host_rating,
                'reviewsCount' => $host->host_reviews_count,
                'isSuperhost' => (bool)$host->is_superhost,
                'kycStatus' => $host->kyc_status,
                'responseRate' => $host->response_rate_percent,
            ],
            'kpis' => [
                'totalAccommodations' => $accommodationsCount,
                'totalRooms' => $roomIds->count(),
                'totalBookings' => $totalBookings,
                'activeBookings' => $activeBookings,
                'pendingBookings' => $pendingBookings,
                'completedBookings' => $completedBookings,
                'totalRevenueVND' => (float)$totalRevenueVND,
                'netEarningsVND' => (float)$netAvailableBalance,
                'escrowPendingVND' => (float)$escrowPendingVND,
                'availableBalance' => (float)$netAvailableBalance,
                'totalWithdrawnVND' => (float)$withdrawnAmount,
                'occupancyRate' => $realOccupancyRate,
            ],
            'timeline' => $timeline,
            'accommodationBreakdown' => $accommodationBreakdown,
            'financialBreakdown' => $financialBreakdown,
            'recentBookings' => $recentBookings,
        ]);
    }

    /**
     * Lấy danh sách toàn bộ chỗ ở của Host
     */
    public function getAccommodations(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => false, 'data' => []]);
        }

        $accommodations = Accommodation::where('host_id', $host->id)
            ->with(['category', 'images', 'amenities', 'rooms.images', 'rooms.amenities'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($acc) {
                $mainRoom = $acc->rooms->first();
                $thumbnail = $acc->images->firstWhere('is_thumbnail', true)?->image_url
                    ?: $acc->images->first()?->image_url
                    ?: $mainRoom?->images->first()?->image_url
                    ?: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80';

                return [
                    'id' => $acc->id,
                    'nameVi' => $acc->name_vi,
                    'accommodationType' => $acc->accommodation_type,
                    'category' => $acc->category?->name_vi ?: 'Biệt thự nghỉ dưỡng',
                    'categoryId' => $acc->category_id,
                    'city' => $acc->city,
                    'district' => $acc->district,
                    'address' => $acc->address,
                    'description' => $acc->description,
                    'houseRules' => $acc->house_rules,
                    'cancellationPolicy' => $acc->cancellation_policy,
                    'priceVND' => (float)($mainRoom?->price_per_night ?: 2500000),
                    'priceUSD' => (float)ExchangeRate::convert($mainRoom?->price_per_night ?: 2500000, 'USD'),
                    'cleaningFeeVND' => (float)($mainRoom?->cleaning_fee ?: 350000),
                    'cleaningFeeUSD' => (float)ExchangeRate::convert($mainRoom?->cleaning_fee ?: 350000, 'USD'),
                    'maxGuests' => $mainRoom?->max_guests ?: 4,
                    'bedrooms' => $mainRoom?->bedrooms_count ?: 2,
                    'beds' => $mainRoom?->beds_count ?: 2,
                    'bathrooms' => (float)($mainRoom?->bathrooms_count ?: 2),
                    'roomSizeM2' => (float)($mainRoom?->room_size_m2 ?: 75.0),
                    'rating' => (float)($mainRoom?->rating ?: 4.96),
                    'reviewsCount' => $mainRoom?->reviews_count ?: 12,
                    'status' => $acc->status, // 'published', 'paused', 'draft'
                    'thumbnail' => $thumbnail,
                    'images' => $acc->images->pluck('image_url')->toArray(),
                    'amenities' => $acc->amenities->pluck('name_vi')->toArray(),
                    'createdAt' => $acc->created_at?->format('d/m/Y'),
                    'roomId' => $mainRoom?->id,
                    'roomsCount' => $acc->rooms->count(),
                    'rooms' => $acc->rooms->map(function ($r) {
                        return [
                            'id' => $r->id,
                            'roomNameVi' => $r->room_name_vi,
                            'spaceType' => $r->space_type,
                            'priceVND' => (float)$r->price_per_night,
                            'maxGuests' => $r->max_guests,
                            'images' => $r->images->pluck('image_url')->toArray(),
                        ];
                    })->values()->toArray(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $accommodations,
            'total' => $accommodations->count(),
        ]);
    }

    /**
     * Tạo mới Chỗ ở & Phòng hoàn chỉnh qua Listing Wizard 6 Bước
     */
    public function storeAccommodation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nameVi' => 'required|string|max:255',
            'accommodationType' => 'required|string|in:hotel,resort,villa,homestay,apartment,cabin,yacht',
            'roomTypeCode' => 'nullable|string|max:50',
            'categoryId' => 'nullable',
            'city' => 'required|string|max:100',
            'district' => 'nullable|string|max:100',
            'address' => 'required|string|max:255',
            'description' => 'required|string',
            'images' => 'required|array|min:1',
            'images.*' => 'required|string',
            'rooms' => 'nullable|array',
            'priceVND' => 'nullable|numeric|min:50000',
            'cleaningFeeVND' => 'nullable|numeric|min:0',
            'maxGuests' => 'nullable|integer|min:1|max:50',
            'bedrooms' => 'nullable|integer|min:1|max:20',
            'beds' => 'nullable|integer|min:1|max:30',
            'bathrooms' => 'nullable|numeric|min:1|max:20',
            'amenities' => 'nullable|array',
            'houseRules' => 'nullable|string',
            'cancellationPolicy' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu đăng ký chỗ ở chưa hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => false, 'message' => 'Lỗi xác thực chủ nhà.'], 403);
        }

        try {
            DB::beginTransaction();

            $rawCat = $request->input('categoryId') ?: $request->input('category');
            $catModel = null;
            if (is_numeric($rawCat)) {
                $catModel = Category::find($rawCat);
            } elseif (is_string($rawCat) && !empty($rawCat)) {
                $catModel = Category::where('slug', $rawCat)->first();
            }
            $categoryId = $catModel ? $catModel->id : (Category::first()?->id ?: 1);

            $cityCoordinates = [
                'Đà Lạt' => ['lat' => 11.9404, 'lng' => 108.4583, 'dist' => 'Cách trung tâm TP. Đà Lạt 2.5 km · Gần thung lũng & rừng thông'],
                'Phú Quốc' => ['lat' => 10.2899, 'lng' => 103.9840, 'dist' => 'Cách bãi biển 300 m · Cách sân bay Phú Quốc 15 km'],
                'Đà Nẵng' => ['lat' => 16.0544, 'lng' => 108.2022, 'dist' => 'Cách bãi biển Mỹ Khê 800 m · Trung tâm TP. Đà Nẵng'],
                'Hạ Long' => ['lat' => 20.9599, 'lng' => 107.0425, 'dist' => 'Tầm nhìn trực diện Vịnh Hạ Long · Cách cảng tàu 1.2 km'],
                'Hội An' => ['lat' => 15.8801, 'lng' => 108.3380, 'dist' => 'Cách Phố Cổ Hội An 1.5 km · Không gian yên bình ven sông'],
                'Vũng Tàu' => ['lat' => 10.3460, 'lng' => 107.0843, 'dist' => 'Cách Bãi Sau 400 m · Cách ngọn hải đăng Vũng Tàu 2 km'],
                'Hà Nội' => ['lat' => 21.0285, 'lng' => 105.8542, 'dist' => 'Khu vực trung tâm Thủ đô · Gần Hồ Hoàn Kiếm'],
                'TP. Hồ Chí Minh' => ['lat' => 10.8231, 'lng' => 106.6297, 'dist' => 'Trung tâm đô thị sầm uất · Thuận tiện di chuyển'],
                'Sa Pa' => ['lat' => 22.3364, 'lng' => 103.8438, 'dist' => 'View thung lũng Mường Hoa & đỉnh Fansipan hùng vĩ'],
                'Nha Trang' => ['lat' => 12.2388, 'lng' => 109.1967, 'dist' => 'Cách bờ biển Trần Phú 200 m · View vịnh biển'],
            ];

            $city = $request->input('city', 'Đà Lạt');
            $geo = $cityCoordinates[$city] ?? ['lat' => 11.9404, 'lng' => 108.4583, 'dist' => 'Cách trung tâm ' . $city . ' 2.0 km'];
            $latitude = $request->input('latitude') ?: $geo['lat'];
            $longitude = $request->input('longitude') ?: $geo['lng'];
            $distanceDesc = $request->input('distanceDescription') ?: $geo['dist'];

            $inputRooms = $request->input('rooms', []);
            $defaultPriceVND = (float)$request->input('priceVND', 1500000);
            if (!empty($inputRooms) && is_array($inputRooms)) {
                $minRoomPrice = min(array_map(fn($r) => (float)($r['priceVND'] ?? 1500000), $inputRooms));
                if ($minRoomPrice > 0) $defaultPriceVND = $minRoomPrice;
            }
            $cleaningFeeVND = (float)$request->input('cleaningFeeVND', 350000);

            // 1. Tạo Accommodation
            $accommodation = Accommodation::create([
                'host_id' => $host->id,
                'category_id' => $categoryId,
                'name_vi' => $request->input('nameVi'),
                'accommodation_type' => $request->input('accommodationType'),
                'description' => $request->input('description'),
                'address' => $request->input('address'),
                'city' => $city,
                'district' => $request->input('district', ''),
                'country' => 'Việt Nam',
                'latitude' => $latitude,
                'longitude' => $longitude,
                'distance_description' => $distanceDesc,
                'check_in_time' => '14:00:00',
                'check_out_time' => '12:00:00',
                'house_rules' => $request->input('houseRules', 'Không hút thuốc trong phòng, giữ gìn vệ sinh chung.'),
                'cancellation_policy' => $request->input('cancellationPolicy', 'Hủy miễn phí 100% trước 48h nhận phòng.'),
                'status' => 'published',
                'is_featured' => true,
            ]);

            // 2. Thêm Album ảnh Accommodation
            $images = $request->input('images', []);
            foreach ($images as $index => $imgUrl) {
                AccommodationImage::create([
                    'accommodation_id' => $accommodation->id,
                    'image_url' => $this->sanitizeImageUrl($imgUrl),
                    'caption' => 'Không gian ' . $accommodation->name_vi,
                    'display_order' => $index + 1,
                    'is_thumbnail' => ($index === 0),
                ]);
            }

            // 3. Gắn Tiện ích (Amenities)
            $amenityNames = $request->input('amenities', []);
            $amenityIds = [];
            if (!empty($amenityNames)) {
                foreach ($amenityNames as $aName) {
                    $amenity = Amenity::firstOrCreate(
                        ['name_vi' => $aName],
                        ['code' => \Illuminate\Support\Str::slug($aName), 'name_en' => $aName, 'icon' => 'TbCheck', 'category' => 'basic']
                    );
                    $amenityIds[] = $amenity->id;
                }
                $accommodation->amenities()->sync($amenityIds);
            }

            // 4. Tạo Danh sách Hạng phòng (Rooms)
            $createdRooms = [];

            if (is_array($inputRooms) && count($inputRooms) > 0) {
                // Chế độ Multi-room: lặp qua từng hạng phòng
                foreach ($inputRooms as $rIdx => $rItem) {
                    $rNameVi = !empty($rItem['roomNameVi']) ? $rItem['roomNameVi'] : ($accommodation->name_vi . ' - Hạng phòng ' . ($rIdx + 1));
                    $rPrice = (float)($rItem['priceVND'] ?? $defaultPriceVND);
                    $rCleaning = (float)($rItem['cleaningFeeVND'] ?? $cleaningFeeVND);
                    $rSpaceType = in_array($rItem['spaceType'] ?? '', ['entire_place', 'private_room', 'shared_room']) 
                        ? $rItem['spaceType'] 
                        : ($accommodation->accommodation_type === 'hotel' || $accommodation->accommodation_type === 'resort' ? 'private_room' : 'entire_place');
                    $rTypeCode = !empty($rItem['roomTypeCode']) ? $rItem['roomTypeCode'] : \Illuminate\Support\Str::slug($rNameVi);
                    $rMaxGuests = (int)($rItem['maxGuests'] ?? $request->input('maxGuests', 2));
                    $rBedrooms = (int)($rItem['bedrooms'] ?? $request->input('bedrooms', 1));
                    $rBeds = (int)($rItem['beds'] ?? $request->input('beds', 1));
                    $rBaths = (float)($rItem['bathrooms'] ?? $request->input('bathrooms', 1));
                    $rSize = (float)($rItem['roomSizeM2'] ?? $request->input('roomSizeM2', 40.0));
                    $rInventory = (int)($rItem['totalInventory'] ?? 1);
                    $rDesc = !empty($rItem['description']) ? $rItem['description'] : $accommodation->description;

                    $room = Room::create([
                        'accommodation_id' => $accommodation->id,
                        'room_name_vi' => $rNameVi,
                        'room_type_code' => $rTypeCode,
                        'space_type' => $rSpaceType,
                        'description' => $rDesc,
                        'room_size_m2' => $rSize,
                        'price_per_night' => $rPrice,
                        'cleaning_fee' => $rCleaning,
                        'service_fee_percent' => 12.00,
                        'max_guests' => $rMaxGuests,
                        'bedrooms_count' => $rBedrooms,
                        'beds_count' => $rBeds,
                        'bathrooms_count' => $rBaths,
                        'total_inventory' => $rInventory,
                        'rating' => 5.00,
                        'reviews_count' => 0,
                        'is_guest_favorite' => ($rIdx === 0),
                        'status' => 'available',
                    ]);

                    $roomImgs = [];
                    if (!empty($rItem['images']) && is_array($rItem['images'])) {
                        $roomImgs = array_values(array_filter($rItem['images']));
                    } elseif (!empty($rItem['imageUrl']) && is_string($rItem['imageUrl'])) {
                        $roomImgs = [trim($rItem['imageUrl'])];
                    }

                    if (empty($roomImgs)) {
                        // Fallback: Nếu không nhập ảnh riêng, gán 1 ảnh từ album cơ sở theo thứ tự
                        $roomImgs = !empty($images) ? [$images[$rIdx % count($images)]] : [];
                    }

                    foreach ($roomImgs as $index => $imgUrl) {
                        RoomImage::create([
                            'room_id' => $room->id,
                            'image_url' => $this->sanitizeImageUrl($imgUrl),
                            'caption' => $rNameVi,
                            'display_order' => $index + 1,
                            'is_thumbnail' => ($index === 0),
                        ]);
                    }

                    if (!empty($amenityIds)) {
                        $room->amenities()->sync($amenityIds);
                    }

                    $createdRooms[] = $room;
                }
            } else {
                // Chế độ Cho thuê nguyên căn hoặc single room
                $singleRoomName = $request->input('roomNameVi') ?: ($request->input('rentalMode') === 'entire_place' ? 'Toàn bộ chỗ nghỉ nguyên căn' : $accommodation->name_vi);
                $room = Room::create([
                    'accommodation_id' => $accommodation->id,
                    'room_name_vi' => $singleRoomName,
                    'room_type_code' => $request->input('roomTypeCode', $accommodation->accommodation_type),
                    'space_type' => $request->input('spaceType', 'entire_place'),
                    'description' => $accommodation->description,
                    'room_size_m2' => (float)$request->input('roomSizeM2', 75.0),
                    'price_per_night' => $defaultPriceVND,
                    'cleaning_fee' => $cleaningFeeVND,
                    'service_fee_percent' => 12.00,
                    'max_guests' => (int)$request->input('maxGuests', 4),
                    'bedrooms_count' => (int)$request->input('bedrooms', 2),
                    'beds_count' => (int)$request->input('beds', 2),
                    'bathrooms_count' => (float)$request->input('bathrooms', 2),
                    'total_inventory' => (int)$request->input('totalInventory', 1),
                    'rating' => 5.00,
                    'reviews_count' => 0,
                    'is_guest_favorite' => true,
                    'status' => 'available',
                ]);

                $singleRoomImages = [];
                if (!empty($request->input('roomImages')) && is_array($request->input('roomImages'))) {
                    $singleRoomImages = array_values(array_filter($request->input('roomImages')));
                } elseif (!empty($request->input('rooms')[0]['images']) && is_array($request->input('rooms')[0]['images'])) {
                    $singleRoomImages = array_values(array_filter($request->input('rooms')[0]['images']));
                } else {
                    $singleRoomImages = $images;
                }

                foreach ($singleRoomImages as $index => $imgUrl) {
                    RoomImage::create([
                        'room_id' => $room->id,
                        'image_url' => $this->sanitizeImageUrl($imgUrl),
                        'caption' => 'Ảnh không gian ' . $singleRoomName,
                        'display_order' => $index + 1,
                        'is_thumbnail' => ($index === 0),
                    ]);
                }

                if (!empty($amenityIds)) {
                    $room->amenities()->sync($amenityIds);
                }

                $createdRooms[] = $room;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký chỗ nghỉ mới thành công! ' . count($createdRooms) . ' hạng phòng đã sẵn sàng đón khách.',
                'data' => [
                    'accommodationId' => $accommodation->id,
                    'roomId' => $createdRooms[0]->id,
                    'roomsCount' => count($createdRooms),
                    'nameVi' => $accommodation->name_vi,
                    'status' => $accommodation->status,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lưu chỗ nghỉ: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin Chỗ ở & Phòng
     */
    public function updateAccommodation(Request $request, $id): JsonResponse
    {
        $host = $this->getCurrentHost();
        $accommodation = Accommodation::where('id', $id)->where('host_id', $host->id)->first();

        if (!$accommodation) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chỗ ở.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nameVi' => 'sometimes|required|string|max:255',
            'accommodationType' => 'nullable|string|in:hotel,resort,villa,homestay,apartment,cabin,yacht',
            'categoryId' => 'nullable|integer',
            'city' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'priceVND' => 'nullable|numeric|min:100000',
            'cleaningFeeVND' => 'nullable|numeric|min:0',
            'maxGuests' => 'nullable|integer|min:1|max:50',
            'bedrooms' => 'nullable|integer|min:1|max:20',
            'beds' => 'nullable|integer|min:1|max:30',
            'bathrooms' => 'nullable|numeric|min:1|max:20',
            'roomSizeM2' => 'nullable|numeric|min:5',
            'images' => 'nullable|array',
            'amenities' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu cập nhật chưa hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Cập nhật Accommodation
            $accData = [];
            if ($request->filled('nameVi')) $accData['name_vi'] = $request->input('nameVi');
            if ($request->filled('accommodationType')) $accData['accommodation_type'] = $request->input('accommodationType');
            if ($request->filled('categoryId')) $accData['category_id'] = $request->input('categoryId');
            if ($request->filled('city')) $accData['city'] = $request->input('city');
            if ($request->filled('district')) $accData['district'] = $request->input('district');
            if ($request->filled('address')) $accData['address'] = $request->input('address');
            if ($request->filled('description')) $accData['description'] = $request->input('description');
            if ($request->filled('houseRules')) $accData['house_rules'] = $request->input('houseRules');
            if ($request->filled('cancellationPolicy')) $accData['cancellation_policy'] = $request->input('cancellationPolicy');

            if (!empty($accData)) {
                $accommodation->update($accData);
            }

            // 2. Cập nhật ảnh nếu có
            if ($request->has('images') && is_array($request->input('images'))) {
                $images = $request->input('images');
                if (!empty($images)) {
                    $accommodation->images()->delete();
                    foreach ($images as $index => $imgUrl) {
                        AccommodationImage::create([
                            'accommodation_id' => $accommodation->id,
                            'image_url' => $this->sanitizeImageUrl($imgUrl),
                            'caption' => 'Không gian ' . $accommodation->name_vi,
                            'display_order' => $index + 1,
                            'is_thumbnail' => ($index === 0),
                        ]);
                    }
                }
            }

            // 3. Cập nhật Amenities nếu có
            if ($request->has('amenities') && is_array($request->input('amenities'))) {
                $amenityNames = $request->input('amenities');
                $amenityIds = [];
                foreach ($amenityNames as $aName) {
                    $amenity = Amenity::firstOrCreate(
                        ['name_vi' => $aName],
                        ['code' => \Illuminate\Support\Str::slug($aName), 'name_en' => $aName, 'icon' => 'TbCheck', 'category' => 'basic']
                    );
                    $amenityIds[] = $amenity->id;
                }
                $accommodation->amenities()->sync($amenityIds);
            }

            // 4. Cập nhật Hạng phòng (Rooms)
            $inputRooms = $request->input('rooms');
            if (is_array($inputRooms) && count($inputRooms) > 0) {
                $existingRoomIds = $accommodation->rooms()->pluck('id')->toArray();
                $updatedRoomIds = [];

                foreach ($inputRooms as $rIdx => $rItem) {
                    $rId = $rItem['id'] ?? null;
                    $room = null;

                    // Nếu ID là số hợp lệ và thuộc chỗ ở này thì cập nhật
                    if (is_numeric($rId) && in_array((int)$rId, $existingRoomIds)) {
                        $room = Room::find($rId);
                    }

                    if (!$room) {
                        $room = new Room();
                        $room->accommodation_id = $accommodation->id;
                        $room->rating = 5.00;
                        $room->reviews_count = 0;
                        $room->is_guest_favorite = ($rIdx === 0);
                        $room->status = 'available';
                    }

                    $rNameVi = !empty($rItem['roomNameVi']) ? $rItem['roomNameVi'] : (!empty($rItem['title']) ? $rItem['title'] : ($accommodation->name_vi . ' - Hạng phòng ' . ($rIdx + 1)));
                    $rSpaceType = in_array($rItem['spaceType'] ?? '', ['entire_place', 'private_room', 'shared_room'])
                        ? $rItem['spaceType']
                        : ($accommodation->accommodation_type === 'hotel' || $accommodation->accommodation_type === 'resort' ? 'private_room' : 'entire_place');

                    $room->room_name_vi = $rNameVi;
                    $room->room_type_code = !empty($rItem['roomTypeCode']) ? $rItem['roomTypeCode'] : \Illuminate\Support\Str::slug($rNameVi);
                    $room->space_type = $rSpaceType;
                    $room->description = !empty($rItem['description']) ? $rItem['description'] : $accommodation->description;
                    $room->room_size_m2 = (float)($rItem['roomSizeM2'] ?? 40.0);
                    $room->price_per_night = (float)($rItem['priceVND'] ?? $rItem['pricePerNight'] ?? 1500000);
                    $room->cleaning_fee = (float)($rItem['cleaningFeeVND'] ?? $rItem['cleaningFee'] ?? 150000);
                    $room->service_fee_percent = 12.00;
                    $room->max_guests = (int)($rItem['maxGuests'] ?? 2);
                    $room->bedrooms_count = (int)($rItem['bedrooms'] ?? $rItem['bedroomsCount'] ?? 1);
                    $room->beds_count = (int)($rItem['beds'] ?? $rItem['bedsCount'] ?? 1);
                    $room->bathrooms_count = (float)($rItem['bathrooms'] ?? $rItem['bathroomsCount'] ?? 1);
                    $room->total_inventory = (int)($rItem['totalInventory'] ?? 1);
                    $room->save();

                    $updatedRoomIds[] = $room->id;

                    // Cập nhật ảnh phòng
                    $roomImgs = [];
                    if (!empty($rItem['images']) && is_array($rItem['images'])) {
                        $roomImgs = array_values(array_filter($rItem['images']));
                    } elseif (!empty($rItem['imageUrl']) && is_string($rItem['imageUrl'])) {
                        $roomImgs = [trim($rItem['imageUrl'])];
                    }

                    if (empty($roomImgs) && !empty($images)) {
                        $roomImgs = [$images[$rIdx % count($images)]];
                    }

                    if (!empty($roomImgs)) {
                        $room->images()->delete();
                        foreach ($roomImgs as $index => $imgUrl) {
                            RoomImage::create([
                                'room_id' => $room->id,
                                'image_url' => $this->sanitizeImageUrl($imgUrl),
                                'caption' => $rNameVi,
                                'display_order' => $index + 1,
                                'is_thumbnail' => ($index === 0),
                            ]);
                        }
                    }

                    // Gắn tiện ích
                    if (!empty($amenityIds)) {
                        $room->amenities()->sync($amenityIds);
                    }
                }

                // Xóa các phòng đã bị gỡ khỏi danh sách
                $roomsToDelete = array_diff($existingRoomIds, $updatedRoomIds);
                if (!empty($roomsToDelete)) {
                    Room::whereIn('id', $roomsToDelete)->delete();
                }
            } else {
                // Fallback: Cập nhật Room chính (cho trường hợp form cũ)
                $mainRoom = $accommodation->rooms()->first();
                if ($mainRoom) {
                    $roomData = [];
                    if ($request->filled('nameVi')) $roomData['room_name_vi'] = $request->input('nameVi');
                    if ($request->filled('accommodationType')) $roomData['room_type_code'] = $request->input('accommodationType');
                    if ($request->filled('description')) $roomData['description'] = $request->input('description');
                    if ($request->filled('roomSizeM2')) $roomData['room_size_m2'] = (float)$request->input('roomSizeM2');
                    if ($request->filled('priceVND')) {
                        $roomData['price_per_night'] = (float)$request->input('priceVND');
                    }
                    if ($request->filled('cleaningFeeVND')) {
                        $roomData['cleaning_fee'] = (float)$request->input('cleaningFeeVND');
                    }
                    if ($request->filled('maxGuests')) $roomData['max_guests'] = (int)$request->input('maxGuests');
                    if ($request->filled('bedrooms')) $roomData['bedrooms_count'] = (int)$request->input('bedrooms');
                    if ($request->filled('beds')) $roomData['beds_count'] = (int)$request->input('beds');
                    if ($request->filled('bathrooms')) $roomData['bathrooms_count'] = (float)$request->input('bathrooms');

                    if (!empty($roomData)) {
                        $mainRoom->update($roomData);
                    }

                    if (isset($images) && !empty($images)) {
                        $mainRoom->images()->delete();
                        foreach ($images as $index => $imgUrl) {
                            RoomImage::create([
                                'room_id' => $mainRoom->id,
                                'image_url' => $this->sanitizeImageUrl($imgUrl),
                                'caption' => 'Ảnh phòng',
                                'display_order' => $index + 1,
                                'is_thumbnail' => ($index === 0),
                            ]);
                        }
                    }

                    if (isset($amenityIds) && !empty($amenityIds)) {
                        $mainRoom->amenities()->sync($amenityIds);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thông tin chỗ ở thành công!',
                'data' => [
                    'id' => $accommodation->id,
                    'nameVi' => $accommodation->name_vi,
                    'priceVND' => (float)($accommodation->rooms()->min('price_per_night') ?: 0),
                    'roomsCount' => $accommodation->rooms()->count(),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật chỗ ở: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bật/Tắt trạng thái mở bán của chỗ ở (Toggle Active/Paused)
     */
    public function toggleStatus(Request $request, $id): JsonResponse
    {
        $host = $this->getCurrentHost();
        $accommodation = Accommodation::where('id', $id)->where('host_id', $host->id)->first();

        if (!$accommodation) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chỗ ở.'], 404);
        }

        $newStatus = $accommodation->status === 'published' ? 'paused' : 'published';
        $accommodation->update(['status' => $newStatus]);

        // Cập nhật trạng thái các phòng liên quan
        $roomStatus = $newStatus === 'published' ? 'available' : 'hidden';
        $accommodation->rooms()->update(['status' => $roomStatus]);

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'published' ? 'Đã kích hoạt mở bán chỗ ở thành công!' : 'Đã tạm dừng nhận khách cho chỗ ở này.',
            'status' => $newStatus,
        ]);
    }

    /**
     * Xóa / Lưu trữ chỗ ở
     */
    public function deleteAccommodation(Request $request, $id): JsonResponse
    {
        $host = $this->getCurrentHost();
        $accommodation = Accommodation::where('id', $id)->where('host_id', $host->id)->first();

        if (!$accommodation) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy chỗ ở.'], 404);
        }

        $accommodation->rooms()->delete();
        $accommodation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa chỗ ở thành công.',
        ]);
    }

    /**
     * Lấy danh sách đơn đặt phòng của Host
     */
    public function getHostBookings(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => true, 'data' => [], 'total' => 0]);
        }

        $roomIds = Room::whereHas('accommodation', function ($q) use ($host) {
            $q->where('host_id', $host->id);
        })->pluck('id');

        $status = $request->query('status');
        $query = Booking::whereIn('room_id', $roomIds)->with(['room.accommodation', 'user', 'voucher']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get()->map(function ($b) {
            $grossAmount = (float)($b->base_price + $b->cleaning_fee);
            $commissionFee = (float)$b->service_fee;
            $netPayoutAmount = max(0, $grossAmount - $commissionFee);

            return [
                'id' => $b->id,
                'code' => $b->booking_code ?: ('TN-' . $b->id),
                'bookingCode' => $b->booking_code ?: ('TN-' . $b->id),
                'guestName' => $b->guest_name ?: $b->user?->full_name ?: 'Khách TripNest',
                'guestEmail' => $b->guest_email ?: $b->user?->account?->email ?: 'guest@email.com',
                'guestPhone' => $b->guest_phone ?: $b->user?->phone_number ?: '0912345678',
                'roomTitle' => $b->room?->room_name_vi ?: $b->room?->accommodation?->name_vi ?: 'Biệt thự nghỉ dưỡng',
                'listingName' => $b->room?->accommodation?->name_vi ?: ($b->room?->room_name_vi ?: 'Biệt thự nghỉ dưỡng'),
                'roomName' => $b->room?->room_name_vi ?: 'Phòng tiêu chuẩn',
                'city' => $b->room?->accommodation?->city ?: 'Đà Lạt',
                'checkIn' => $b->check_in_date?->format('Y-m-d') ?: '2026-08-25',
                'checkOut' => $b->check_out_date?->format('Y-m-d') ?: '2026-08-28',
                'nights' => (int)($b->nights_count ?: 3),
                'guests' => (int)($b->guests_count ?: 2),
                'basePrice' => (float)$b->base_price,
                'cleaningFee' => (float)$b->cleaning_fee,
                'grossAmount' => $grossAmount,
                'serviceFee' => $commissionFee,
                'commissionFee' => $commissionFee,
                'discountAmount' => (float)$b->discount_amount,
                'hasVoucher' => !empty($b->voucher_id) || (float)$b->discount_amount > 0,
                'voucherCode' => $b->voucher?->code,
                'totalAmount' => (float)$b->total_price,
                'totalPrice' => (float)$b->total_price,
                'guestPaidTotal' => (float)$b->total_price,
                'hostEarnings' => $netPayoutAmount,
                'hostPayoutAmount' => $netPayoutAmount,
                'netPayout' => $netPayoutAmount,
                'status' => $b->status ?: 'confirmed',
                'checkedInAt' => $b->checked_in_at?->format('d/m/Y H:i'),
                'checkedOutAt' => $b->checked_out_at?->format('d/m/Y H:i'),
                'cancelledAt' => $b->cancelled_at?->format('d/m/Y H:i'),
                'cancellationReason' => $b->cancellation_reason,
                'refundAmount' => (float)($b->refund_amount ?? 0),
                'refundPercentage' => (int)($b->refund_percentage ?? 0),
                'createdAt' => $b->created_at?->format('d/m/Y H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $bookings,
            'total' => $bookings->count(),
        ]);
    }

    /**
     * Chủ nhà phê duyệt đơn đặt phòng (pending -> confirmed)
     */
    public function approveBooking(Request $request, $id): JsonResponse
    {
        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin chủ nhà.'], 403);
        }

        $roomIds = Room::whereHas('accommodation', fn($q) => $q->where('host_id', $host->id))->pluck('id');

        $booking = Booking::whereIn('room_id', $roomIds)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('booking_code', $id);
            })
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn đặt phòng hoặc bạn không có quyền duyệt đơn này.',
            ], 404);
        }

        if ($booking->status === 'confirmed') {
            return response()->json([
                'success' => true,
                'message' => 'Đơn đặt phòng này đã được phê duyệt trước đó.',
                'booking' => [
                    'id' => $booking->id,
                    'code' => $booking->booking_code,
                    'status' => 'confirmed',
                ],
            ]);
        }

        if ($booking->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Đơn đặt phòng đang ở trạng thái "' . ($booking->status_label ?? $booking->status) . '" nên không thể phê duyệt.',
            ], 422);
        }

        $booking->update([
            'status' => 'confirmed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã phê duyệt đơn đặt phòng ' . ($booking->booking_code ?: ('#' . $booking->id)) . ' thành công!',
            'booking' => [
                'id' => $booking->id,
                'code' => $booking->booking_code,
                'status' => 'confirmed',
            ],
        ]);
    }

    /**
     * Bảng xếp hạng & Hiệu suất doanh thu chi tiết từng cơ sở lưu trú của Host
     */
    public function getRankings(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin chủ nhà.'], 404);
        }

        // Nhận tham số chu kỳ thời gian tương thích hoàn toàn với Dashboard
        $period = $request->input('period', 'all'); // 'all', 'month', 'quarter', 'year'
        $year = (int)$request->input('year', date('Y'));
        $quarter = (int)$request->input('quarter', ceil(date('n') / 3));
        $targetMonth = (int)$request->input('month', date('n'));

        $accommodations = Accommodation::where('host_id', $host->id)
            ->with(['images', 'category', 'rooms.images'])
            ->get();

        $rankedList = [];
        $totalGmvAll = 0;
        $totalCommissionAll = 0;
        $totalNetAll = 0;
        $totalEscrowAll = 0;
        $totalSettledAll = 0;

        $daysInPeriod = match($period) {
            'week' => 7,
            'quarter' => 90,
            'year' => 365,
            'month' => (int)date('t', mktime(0, 0, 0, $targetMonth, 1, $year)),
            default => 30, // 'all' default 30 days for ADR/RevPAR base
        };

        foreach ($accommodations as $acc) {
            $roomIds = $acc->rooms->pluck('id');
            $allValidBookingsQuery = Booking::whereIn('room_id', $roomIds)
                ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
                ->with(['user', 'room'])
                ->orderBy('created_at', 'desc');

            // Lọc theo chu kỳ được chọn
            $periodBookings = (clone $allValidBookingsQuery)->get()->filter(function ($b) use ($period, $year, $quarter, $targetMonth) {
                if ($period === 'all') return true;
                $dateObj = $b->check_in_date ?: $b->created_at;
                if (!$dateObj) return false;
                if ($period === 'week') {
                    $now = \Carbon\Carbon::now()->endOfDay();
                    $weekAgo = \Carbon\Carbon::now()->subDays(7)->startOfDay();
                    return $dateObj >= $weekAgo && $dateObj <= $now;
                }
                if ($period === 'year') {
                    return (int)$dateObj->format('Y') === $year;
                }
                if ($period === 'quarter') {
                    return (int)$dateObj->format('Y') === $year && (int)ceil((int)$dateObj->format('n') / 3) === $quarter;
                }
                if ($period === 'month') {
                    return (int)$dateObj->format('Y') === $year && (int)$dateObj->format('n') === $targetMonth;
                }
                return true;
            })->values();

            $gmv = (float)$periodBookings->sum('total_price');
            $commission = round($gmv * 0.12);
            $netEarnings = max(0, $gmv - $commission);
            $completedBookingsCount = $periodBookings->count();

            $totalGmvAll += $gmv;
            $totalCommissionAll += $commission;
            $totalNetAll += $netEarnings;

            // Phân bổ Escrow vs Settled (Khách chưa check-out vs đã check-out)
            $accEscrow = (float)$periodBookings->whereIn('status', ['confirmed', 'checked_in'])->sum(function ($b) {
                $gross = (float)($b->base_price + $b->cleaning_fee);
                $comm = (float)$b->service_fee > 0 ? (float)$b->service_fee : round($gross * 0.12);
                return max(0, $gross - $comm);
            });
            $accSettled = max(0, $netEarnings - $accEscrow);

            $totalEscrowAll += $accEscrow;
            $totalSettledAll += $accSettled;

            // Tính ADR chuẩn: Doanh thu phòng / Tổng số đêm đặt
            $totalRoomBaseRevenue = (float)$periodBookings->sum('base_price');
            $bookedNights = (int)$periodBookings->sum('nights_count');
            $adr = $bookedNights > 0 
                ? (int)round($totalRoomBaseRevenue / $bookedNights) 
                : (int)round((float)($acc->rooms->min('price_per_night') ?: 1500000));

            // Tính RevPAR chuẩn: Doanh thu phòng / (Tổng số phòng * Số ngày kỳ)
            $roomsCount = max(1, $acc->rooms->count());
            $availableRoomNights = $roomsCount * $daysInPeriod;
            $revpar = $availableRoomNights > 0 
                ? (int)round($totalRoomBaseRevenue / $availableRoomNights) 
                : 0;

            // Tỷ lệ lấp đầy chuẩn theo chu kỳ
            $occupancyRate = $availableRoomNights > 0 
                ? min(100, max(0, (int)round(($bookedNights / $availableRoomNights) * 100))) 
                : 0;

            // Đánh giá sao từ các phòng thuộc chỗ nghỉ này
            $avgRating = \App\Models\Review::whereIn('room_id', $roomIds)->whereIn('status', ['approved', 'visible'])->avg('rating') ?: 5.0;
            $reviewsCount = \App\Models\Review::whereIn('room_id', $roomIds)->whereIn('status', ['approved', 'visible'])->count();

            $thumbnail = $acc->images->firstWhere('is_thumbnail', true)?->image_url
                ?: $acc->images->first()?->image_url
                ?: $acc->rooms->first()?->images->first()?->image_url
                ?: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600';

            $bookingsList = $periodBookings->take(20)->map(function ($b) {
                $grossAmount = (float)($b->base_price + $b->cleaning_fee);
                $commissionFee = (float)$b->service_fee > 0 ? (float)$b->service_fee : round($grossAmount * 0.12);
                $netPayout = max(0, $grossAmount - $commissionFee);

                return [
                    'id' => $b->id,
                    'code' => $b->booking_code ?: ('TN-' . $b->id),
                    'guestName' => $b->guest_name ?: $b->user?->full_name ?: 'Khách du lịch',
                    'checkIn' => $b->check_in_date?->format('d/m/Y') ?: '',
                    'checkOut' => $b->check_out_date?->format('d/m/Y') ?: '',
                    'nights' => (int)($b->nights_count ?: 1),
                    'guests' => (int)($b->guests_count ?: 2),
                    'grossAmount' => $grossAmount,
                    'commissionFee' => $commissionFee,
                    'netPayout' => $netPayout,
                    'status' => $b->status ?: 'confirmed',
                ];
            });

            $rankedList[] = [
                'id' => $acc->id,
                'nameVi' => $acc->name_vi,
                'city' => $acc->city,
                'address' => $acc->address ?: ($acc->city . ', Việt Nam'),
                'accommodationType' => $acc->category?->name_vi ?: $acc->accommodation_type,
                'thumbnail' => $thumbnail,
                'status' => $acc->status,
                'priceVND' => (float)($acc->rooms->min('price_per_night') ?: 1500000),
                'total_gmv' => $gmv,
                'commission' => $commission,
                'net_earnings' => $netEarnings,
                'escrow' => $accEscrow,
                'available_payout' => $accSettled,
                'completed_bookings' => $completedBookingsCount,
                'booked_nights' => $bookedNights,
                'adr' => $adr,
                'revpar' => $revpar,
                'occupancy_rate' => $occupancyRate,
                'rating' => round((float)$avgRating, 2),
                'reviews_count' => $reviewsCount,
                'bookingsList' => $bookingsList,
            ];
        }

        // Sắp xếp thứ hạng theo GMV giảm dần
        usort($rankedList, fn($a, $b) => $b['total_gmv'] <=> $a['total_gmv']);

        // Gán thứ hạng rank & momentum
        foreach ($rankedList as $index => &$item) {
            $item['rank'] = $index + 1;
            $item['percentage'] = $totalGmvAll > 0 ? round(($item['total_gmv'] / $totalGmvAll) * 100, 1) : 0;
            // Rank momentum trend
            $item['rank_trend'] = $index === 0 ? 'up' : ($index === 1 ? 'same' : 'up');
            $item['rank_diff'] = $index === 0 ? 0 : 1;
        }

        return response()->json([
            'success' => true,
            'data' => $rankedList,
            'total' => count($rankedList),
            'top1' => $rankedList[0] ?? null,
            'top2' => $rankedList[1] ?? null,
            'top3' => $rankedList[2] ?? null,
            'period' => $period,
            'year' => $year,
            'quarter' => $quarter,
            'month' => $targetMonth,
            'summary' => [
                'totalAccommodations' => count($rankedList),
                'totalGmv' => $totalGmvAll,
                'totalNet' => $totalNetAll,
                'totalCommission' => $totalCommissionAll,
                'totalEscrow' => $totalEscrowAll,
                'totalSettled' => $totalSettledAll,
            ],
        ]);
    }

    /**
     * Lấy thông tin tài khoản Payout & Lịch sử nhận tiền (Đối soát đồng bộ)
     */
    public function getPayouts(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json([
                'success' => true,
                'payoutAccount' => null,
                'availableBalance' => 0,
                'pendingEscrowBalance' => 0,
                'transactions' => [],
                'payoutHistory' => [],
            ]);
        }

        $payoutAccount = $host->defaultPayoutAccount ?: $host->payoutAccounts()->first();

        // 1. Tính toán đối soát đồng bộ từ Valid Bookings
        $roomIds = Room::whereHas('accommodation', fn($q) => $q->where('host_id', $host->id))->pluck('id');
        $validBookings = Booking::whereIn('room_id', $roomIds)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->get();

        // Quỹ Escrow: Đơn confirmed & checked_in
        $pendingEscrowBalance = (float)$validBookings->whereIn('status', ['confirmed', 'checked_in'])->sum(function ($b) {
            $gross = (float)($b->base_price + $b->cleaning_fee);
            $comm = (float)$b->service_fee > 0 ? (float)$b->service_fee : round($gross * 0.12);
            return max(0, $gross - $comm);
        });

        // Doanh thu đã hoàn tất: Đơn completed
        $totalEarnedFromCompleted = (float)$validBookings->where('status', 'completed')->sum(function ($b) {
            $gross = (float)($b->base_price + $b->cleaning_fee);
            $comm = (float)$b->service_fee > 0 ? (float)$b->service_fee : round($gross * 0.12);
            return max(0, $gross - $comm);
        });

        // Tiền Host đã rút hoặc đang chờ duyệt (whereNull('booking_id'))
        $withdrawnAmount = (float)PayoutTransaction::where('host_id', $host->id)
            ->whereNull('booking_id')
            ->whereIn('status', ['pending', 'completed'])
            ->sum('net_payout_amount');

        // Số dư ví khả dụng thực tế
        $netAvailableBalance = max(0, $totalEarnedFromCompleted - $withdrawnAmount);

        // Danh sách giao dịch chi trả & rút tiền
        $transactions = PayoutTransaction::where('host_id', $host->id)
            ->with('booking.room.accommodation')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($po) {
                return [
                    'id' => $po->payout_code ?: ('POT-' . $po->id),
                    'payoutId' => $po->id,
                    'bookingCode' => $po->booking?->booking_code,
                    'date' => $po->created_at?->format('d/m/Y') ?: now()->format('d/m/Y'),
                    'amount' => (float)$po->net_payout_amount,
                    'grossAmount' => (float)$po->gross_amount,
                    'commissionFee' => (float)$po->platform_commission_fee,
                    'note' => $po->booking ? ('Doanh thu đơn ' . ($po->booking->booking_code ?: ('#' . $po->booking_id))) : 'Yêu cầu rút tiền về ngân hàng',
                    'status' => $po->status ?: 'pending',
                    'ref' => $po->transaction_reference,
                    'transferredAt' => $po->transferred_at ? $po->transferred_at->format('d/m/Y H:i') : null,
                ];
            });

        return response()->json([
            'success' => true,
            'payoutAccount' => $payoutAccount,
            'availableBalance' => $netAvailableBalance,
            'pendingEscrowBalance' => $pendingEscrowBalance,
            'transactions' => $transactions,
            'payoutHistory' => $transactions,
        ]);
    }

    /**
     * Tạo yêu cầu giải ngân số dư khả dụng của Host (Bảo vệ an toàn bằng DB Transaction)
     */
    public function requestPayout(Request $request): JsonResponse
    {
        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xác thực thông tin chủ nhà.',
            ], 403);
        }

        $payoutAccount = $host->defaultPayoutAccount ?: $host->payoutAccounts()->first();

        if (!$payoutAccount || empty($payoutAccount->account_number)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cập nhật và liên kết tài khoản ngân hàng nhận tiền trước khi rút tiền.',
            ], 422);
        }

        return DB::transaction(function () use ($host, $payoutAccount) {
            $roomIds = Room::whereHas('accommodation', fn($q) => $q->where('host_id', $host->id))->pluck('id');

            // Khóa dòng chống race condition
            $validCompletedBookings = Booking::whereIn('room_id', $roomIds)
                ->where('status', 'completed')
                ->lockForUpdate()
                ->get();

            $totalEarnedFromCompleted = (float)$validCompletedBookings->sum(function ($b) {
                $gross = (float)($b->base_price + $b->cleaning_fee);
                $comm = (float)$b->service_fee > 0 ? (float)$b->service_fee : round($gross * 0.12);
                return max(0, $gross - $comm);
            });

            $withdrawnAmount = (float)PayoutTransaction::where('host_id', $host->id)
                ->whereNull('booking_id')
                ->whereIn('status', ['pending', 'completed'])
                ->lockForUpdate()
                ->sum('net_payout_amount');

            $availableBalance = max(0, $totalEarnedFromCompleted - $withdrawnAmount);

            if ($availableBalance < 100000) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số dư khả dụng tối thiểu để rút tiền là 100.000 ₫. Số dư khả dụng hiện tại: ' . number_format($availableBalance, 0, ',', '.') . ' ₫',
                    'availableBalance' => $availableBalance,
                ], 422);
            }

            $transaction = PayoutTransaction::create([
                'payout_code' => 'POT-' . strtoupper(bin2hex(random_bytes(4))),
                'host_id' => $host->id,
                'payout_account_id' => $payoutAccount->id,
                'gross_amount' => $availableBalance,
                'platform_commission_fee' => 0,
                'net_payout_amount' => $availableBalance,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã tạo yêu cầu rút ' . number_format($availableBalance, 0, ',', '.') . ' ₫ về số tài khoản ' . $payoutAccount->account_number . ' (' . ($payoutAccount->bank_name ?: 'Ngân hàng') . '). Lệnh đang chờ chuyển khoản.',
                'availableBalance' => 0,
                'transaction' => [
                    'id' => $transaction->payout_code,
                    'amount' => (float)$transaction->net_payout_amount,
                    'status' => $transaction->status,
                    'date' => $transaction->created_at?->format('d/m/Y'),
                    'note' => 'Chuyển khoản ' . ($payoutAccount->bank_name ?: 'ngân hàng'),
                ],
            ], 201);
        });
    }

    /**
     * Cập nhật tài khoản ngân hàng nhận tiền Payout
     */
    public function updatePayoutAccount(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bankName' => 'required|string|max:100',
            'accountNumber' => 'required|string|max:50',
            'accountHolderName' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $host = $this->getCurrentHost();
        if (!$host) {
            return response()->json(['success' => false, 'message' => 'Lỗi xác thực thông tin chủ nhà.'], 403);
        }

        $account = HostPayoutAccount::updateOrCreate(
            ['host_id' => $host->id, 'is_default' => true],
            [
                'bank_name' => $request->input('bankName'),
                'account_number' => $request->input('accountNumber'),
                'account_holder_name' => mb_strtoupper($request->input('accountHolderName')),
                'is_verified' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật tài khoản ngân hàng nhận tiền thành công!',
            'payoutAccount' => $account,
        ]);
    }

    /**
     * Làm sạch và trích xuất URL ảnh trực tiếp từ các liên kết tìm kiếm (Bing, Google Images...)
     */
    private function sanitizeImageUrl(?string $url): string
    {
        if (empty($url)) return '';
        $url = trim($url);

        // Trích xuất direct image URL nếu người dùng paste link Bing Image Search
        if (str_contains($url, 'bing.com/images/search')) {
            $parsed = parse_url($url);
            if (!empty($parsed['query'])) {
                parse_str($parsed['query'], $queryParams);
                if (!empty($queryParams['mediaurl'])) {
                    return urldecode($queryParams['mediaurl']);
                }
                if (!empty($queryParams['cdnurl'])) {
                    return urldecode($queryParams['cdnurl']);
                }
            }
        }

        // Trích xuất direct image URL nếu người dùng paste link Google Image Search
        if (str_contains($url, 'google.com/imgres') || str_contains($url, 'google.com/images')) {
            $parsed = parse_url($url);
            if (!empty($parsed['query'])) {
                parse_str($parsed['query'], $queryParams);
                if (!empty($queryParams['imgurl'])) {
                    return urldecode($queryParams['imgurl']);
                }
            }
        }

        return $url;
    }
}


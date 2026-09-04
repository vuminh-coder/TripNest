<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Host;
use App\Models\Review;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Throwable;

class ReviewController extends Controller
{
    /**
     * Khách hàng gửi đánh giá sau khi hoàn thành chuyến đi
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required',
            'rating_cleanliness' => 'required|numeric|min:1|max:5',
            'rating_accuracy' => 'required|numeric|min:1|max:5',
            'rating_communication' => 'required|numeric|min:1|max:5',
            'rating_location' => 'required|numeric|min:1|max:5',
            'rating_checkin' => 'required|numeric|min:1|max:5',
            'rating_value' => 'required|numeric|min:1|max:5',
            'comment' => 'required|string|min:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng kiểm tra lại thông tin đánh giá.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Tìm booking theo ID hoặc booking_code
        $bookingId = $request->input('booking_id');
        $booking = is_numeric($bookingId)
            ? Booking::find($bookingId)
            : Booking::where('booking_code', $bookingId)->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin đơn đặt phòng tương ứng.',
            ], 404);
        }

        // Lấy thông tin user
        $account = Auth::guard('api')->user();
        $user = $account?->user ?: User::find($booking->user_id) ?: User::first();

        // Kiểm tra xem đơn đã đánh giá chưa
        $existing = Review::where('booking_id', $booking->id)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn đặt phòng này đã được gửi đánh giá trước đó.',
            ], 400);
        }

        $cleanliness = (float)$request->input('rating_cleanliness');
        $accuracy = (float)$request->input('rating_accuracy');
        $communication = (float)$request->input('rating_communication');
        $location = (float)$request->input('rating_location');
        $checkin = (float)$request->input('rating_checkin');
        $value = (float)$request->input('rating_value');

        // Điểm overall trung bình cộng của 6 tiêu chí radar
        $overall = round(($cleanliness + $accuracy + $communication + $location + $checkin + $value) / 6, 2);

        $radar = [
            'cleanliness' => $cleanliness,
            'accuracy' => $accuracy,
            'communication' => $communication,
            'location' => $location,
            'checkin' => $checkin,
            'value' => $value,
        ];

        $review = Review::create([
            'booking_id' => $booking->id,
            'room_id' => $booking->room_id,
            'user_id' => $user ? $user->id : $booking->user_id,
            'rating' => $overall,
            'rating_breakdown' => $radar,
            'comment' => $request->input('comment'),
            'status' => 'approved',
        ]);

        // Cập nhật rating và reviews_count cho Room
        $room = Room::find($booking->room_id);
        if ($room) {
            $avgRating = Review::where('room_id', $room->id)->whereIn('status', ['approved', 'visible'])->avg('rating') ?: $overall;
            $count = Review::where('room_id', $room->id)->whereIn('status', ['approved', 'visible'])->count();
            $room->update([
                'rating' => round($avgRating, 2),
                'reviews_count' => $count,
            ]);

            // Cập nhật rating cho Host
            $host = $room->accommodation?->host;
            if ($host) {
                $hostRoomIds = Room::whereHas('accommodation', fn($q) => $q->where('host_id', $host->id))->pluck('id');
                $hostAvg = Review::whereIn('room_id', $hostRoomIds)->whereIn('status', ['approved', 'visible'])->avg('rating') ?: 5.0;
                $hostCount = Review::whereIn('room_id', $hostRoomIds)->whereIn('status', ['approved', 'visible'])->count();
                $host->update([
                    'host_rating' => round($hostAvg, 2),
                    'host_reviews_count' => $hostCount,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Cảm ơn bạn! Đánh giá đã được đăng thành công.',
            'data' => $review->load(['user', 'room']),
        ]);
    }

    /**
     * Admin: Lấy danh sách toàn bộ đánh giá trên hệ thống
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $query = Review::with(['user.account', 'room.accommodation', 'booking'])->orderBy('id', 'desc');

            if ($request->filled('status') && $request->input('status') !== 'all') {
                $query->where('status', $request->input('status'));
            }

            if ($request->filled('search')) {
                $s = $request->input('search');
                $query->where(function ($q) use ($s) {
                    $q->where('comment', 'like', "%{$s}%")
                      ->orWhereHas('user', fn($sq) => $sq->where('full_name', 'like', "%{$s}%"))
                      ->orWhereHas('room', fn($sq) => $sq->where('room_name_vi', 'like', "%{$s}%"));
                });
            }

            $reviews = $query->get()->map(function ($rev) {
                $radar = $rev->rating_breakdown ?: [
                    'cleanliness' => 5.0,
                    'accuracy' => 5.0,
                    'communication' => 5.0,
                    'location' => 5.0,
                    'checkin' => 5.0,
                    'value' => 5.0,
                ];

                return [
                    'id' => $rev->id,
                    'booking_id' => $rev->booking_id,
                    'booking_code' => $rev->booking?->booking_code ?: ('TN-' . $rev->booking_id),
                    'guest_name' => $rev->user?->full_name ?: 'Khách du lịch TripNest',
                    'guest_avatar' => $rev->user?->avatar_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                    'room_id' => $rev->room_id,
                    'room_name' => $rev->room?->room_name_vi ?: $rev->room?->accommodation?->name_vi ?: 'Phòng nghỉ dưỡng',
                    'rating_overall' => (float)$rev->rating,
                    'radar' => [
                        'cleanliness' => $radar['cleanliness'] ?? 5.0,
                        'accuracy' => $radar['accuracy'] ?? 5.0,
                        'communication' => $radar['communication'] ?? 5.0,
                        'location' => $radar['location'] ?? 5.0,
                        'checkin' => $radar['checkin'] ?? 5.0,
                        'value' => $radar['value'] ?? 5.0,
                    ],
                    'comment' => $rev->comment,
                    'host_response' => $rev->host_response,
                    'host_responded_at' => $rev->host_responded_at ? $rev->host_responded_at->format('d/m/Y H:i') : null,
                    'status' => in_array($rev->status, ['approved', 'visible']) ? 'approved' : ($rev->status === 'hidden' ? 'hidden' : 'flagged'),
                    'created_at' => $rev->created_at ? $rev->created_at->format('d/m/Y H:i') : '',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $reviews,
            ]);
        } catch (Throwable $ex) {
            return response()->json(['success' => false, 'message' => $ex->getMessage()], 500);
        }
    }

    /**
     * Admin: Cập nhật trạng thái hiển thị / ẩn của đánh giá
     */
    public function adminUpdateStatus($id, Request $request): JsonResponse
    {
        $review = Review::find($id);
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đánh giá.'], 404);
        }

        $rawStatus = $request->input('status');
        $status = ($rawStatus === 'approved' || $rawStatus === 'visible') ? 'approved' : 'hidden';

        $review->update(['status' => $status]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật trạng thái đánh giá thành công!',
            'data' => $review,
        ]);
    }

    /**
     * Host: Lấy danh sách đánh giá của các phòng thuộc Host
     */
    public function hostIndex(Request $request): JsonResponse
    {
        try {
            $account = Auth::guard('api')->user();
            $host = $account?->user?->host ?: Host::first();

            if (!$host) {
                return response()->json(['success' => true, 'data' => []]);
            }

            $roomIds = Room::whereHas('accommodation', fn($q) => $q->where('host_id', $host->id))->pluck('id');

            $reviews = Review::whereIn('room_id', $roomIds)
                ->with(['user', 'room.accommodation', 'booking'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($rev) {
                    $radar = $rev->rating_breakdown ?: [];
                    return [
                        'id' => $rev->id,
                        'guestName' => $rev->user?->full_name ?: 'Khách du lịch',
                        'guestAvatar' => $rev->user?->avatar_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                        'date' => $rev->created_at ? $rev->created_at->format('d/m/Y') : '',
                        'rating' => (float)$rev->rating,
                        'roomTitle' => $rev->room?->room_name_vi ?: 'Phòng nghỉ dưỡng',
                        'comment' => $rev->comment,
                        'hostReply' => $rev->host_response,
                        'hostRepliedAt' => $rev->host_responded_at ? $rev->host_responded_at->format('d/m/Y H:i') : null,
                        'status' => $rev->status,
                        'radar' => $radar,
                    ];
                });

            // Tính điểm trung bình 6 tiêu chí của Host
            $cleanlinessAvg = Review::whereIn('room_id', $roomIds)->whereIn('status', ['approved', 'visible'])->get()->avg(fn($r) => $r->rating_breakdown['cleanliness'] ?? 5.0) ?: 5.0;
            $accuracyAvg = Review::whereIn('room_id', $roomIds)->whereIn('status', ['approved', 'visible'])->get()->avg(fn($r) => $r->rating_breakdown['accuracy'] ?? 5.0) ?: 5.0;
            $commAvg = Review::whereIn('room_id', $roomIds)->whereIn('status', ['approved', 'visible'])->get()->avg(fn($r) => $r->rating_breakdown['communication'] ?? 5.0) ?: 5.0;
            $locAvg = Review::whereIn('room_id', $roomIds)->whereIn('status', ['approved', 'visible'])->get()->avg(fn($r) => $r->rating_breakdown['location'] ?? 5.0) ?: 5.0;
            $checkinAvg = Review::whereIn('room_id', $roomIds)->whereIn('status', ['approved', 'visible'])->get()->avg(fn($r) => $r->rating_breakdown['checkin'] ?? 5.0) ?: 5.0;
            $valueAvg = Review::whereIn('room_id', $roomIds)->whereIn('status', ['approved', 'visible'])->get()->avg(fn($r) => $r->rating_breakdown['value'] ?? 5.0) ?: 5.0;

            $ratingCategories = [
                ['label' => 'Độ Sạch Sẽ', 'score' => number_format($cleanlinessAvg, 2), 'progress' => round(($cleanlinessAvg / 5) * 100) . '%'],
                ['label' => 'Độ Chính Xác', 'score' => number_format($accuracyAvg, 2), 'progress' => round(($accuracyAvg / 5) * 100) . '%'],
                ['label' => 'Giao Tiếp', 'score' => number_format($commAvg, 2), 'progress' => round(($commAvg / 5) * 100) . '%'],
                ['label' => 'Vị Trí', 'score' => number_format($locAvg, 2), 'progress' => round(($locAvg / 5) * 100) . '%'],
                ['label' => 'Nhận Phòng', 'score' => number_format($checkinAvg, 2), 'progress' => round(($checkinAvg / 5) * 100) . '%'],
                ['label' => 'Giá Trị', 'score' => number_format($valueAvg, 2), 'progress' => round(($valueAvg / 5) * 100) . '%'],
            ];

            return response()->json([
                'success' => true,
                'data' => $reviews,
                'ratingCategories' => $ratingCategories,
                'overallRating' => (float)$host->host_rating,
                'totalReviews' => (int)$host->host_reviews_count,
            ]);
        } catch (Throwable $ex) {
            return response()->json(['success' => false, 'message' => $ex->getMessage()], 500);
        }
    }

    /**
     * Host: Phản hồi lại đánh giá của khách
     */
    public function hostReply($id, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reply' => 'required|string|min:3',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Nội dung phản hồi không được để trống.',
            ], 422);
        }

        $review = Review::find($id);
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đánh giá.'], 404);
        }

        $review->update([
            'host_response' => $request->input('reply'),
            'host_responded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi phản hồi thành công đến khách hàng!',
            'data' => $review,
        ]);
    }
}

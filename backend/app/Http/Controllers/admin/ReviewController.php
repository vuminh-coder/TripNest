<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ReviewController extends Controller
{
    /**
     * Lấy toàn bộ danh sách đánh giá Radar 6 tiêu chí từ database
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Review::with(['user.account', 'room.accommodation', 'booking'])
                ->orderBy('id', 'desc');

            // 1. Lọc theo trạng thái nếu có
            if ($request->filled('status') && $request->input('status') !== 'all') {
                $query->where('status', $request->input('status'));
            }

            // 2. Tìm kiếm theo tên khách, tên chỗ ở, hoặc nội dung bình luận
            if ($request->filled('search')) {
                $search = trim($request->input('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('comment', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('full_name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('room', function ($rq) use ($search) {
                            $rq->where('room_name_vi', 'like', "%{$search}%")
                                ->orWhereHas('accommodation', function ($aq) use ($search) {
                                    $aq->where('name_vi', 'like', "%{$search}%")
                                        ->orWhere('name_en', 'like', "%{$search}%");
                                });
                        });
                });
            }

            $reviews = $query->get();

            $formatted = $reviews->map(function ($r) {
                $breakdown = is_array($r->rating_breakdown) 
                    ? $r->rating_breakdown 
                    : (json_decode($r->rating_breakdown, true) ?: []);

                $cleanliness = isset($breakdown['cleanliness']) ? (float)$breakdown['cleanliness'] : 5.0;
                $accuracy = isset($breakdown['accuracy']) ? (float)$breakdown['accuracy'] : 5.0;
                $communication = isset($breakdown['communication']) ? (float)$breakdown['communication'] : 5.0;
                $location = isset($breakdown['location']) ? (float)$breakdown['location'] : 5.0;
                $checkin = isset($breakdown['checkin']) ? (float)$breakdown['checkin'] : 5.0;
                $value = isset($breakdown['value']) ? (float)$breakdown['value'] : 5.0;

                $roomName = $r->room?->accommodation?->name_vi ?: ($r->room?->room_name_vi ?: 'Chỗ ở TripNest');

                return [
                    'id' => $r->id,
                    'booking_id' => $r->booking_id,
                    'room_id' => $r->room_id,
                    'room_name' => $roomName,
                    'sub_room_name' => $r->room?->room_name_vi ?? '',
                    'guest_id' => $r->user_id,
                    'guest_name' => $r->user?->full_name ?: 'Khách du lịch TripNest',
                    'guest_avatar' => $r->user?->avatar_url ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                    'guest_email' => $r->user?->account?->email ?: '',
                    'rating_overall' => (float)$r->rating,
                    'radar' => [
                        'cleanliness' => $cleanliness,
                        'accuracy' => $accuracy,
                        'communication' => $communication,
                        'location' => $location,
                        'checkin' => $checkin,
                        'value' => $value,
                    ],
                    'comment' => $r->comment ?? '',
                    'host_response' => $r->host_response,
                    'host_responded_at' => $r->host_responded_at ? $r->host_responded_at->format('Y-m-d H:i') : null,
                    'status' => $r->status ?: 'approved',
                    'created_at' => $r->created_at ? $r->created_at->format('Y-m-d') : date('Y-m-d'),
                ];
            });

            return response()->json([
                'success' => true,
                'total' => $formatted->count(),
                'reviews' => $formatted,
                'data' => $formatted,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh sách đánh giá: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật trạng thái kiểm duyệt đánh giá (approved / flagged / hidden)
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|in:approved,flagged,hidden',
            ]);

            $review = Review::find($id);
            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đánh giá với ID ' . $id,
                ], 404);
            }

            $newStatus = $request->input('status');
            $review->status = $newStatus;
            $review->save();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái đánh giá thành công!',
                'status' => $newStatus,
                'review' => $review,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật trạng thái: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Phản hồi đánh giá (Host / Admin reply)
     */
    public function respond(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'host_response' => 'required|string|max:2000',
            ]);

            $review = Review::find($id);
            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đánh giá với ID ' . $id,
                ], 404);
            }

            $review->host_response = $request->input('host_response');
            $review->host_responded_at = now();
            $review->save();

            return response()->json([
                'success' => true,
                'message' => 'Đã lưu phản hồi thành công!',
                'review' => $review,
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi gửi phản hồi: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa vĩnh viễn một đánh giá
     */
    public function destroy($id): JsonResponse
    {
        try {
            $review = Review::find($id);
            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đánh giá.',
                ], 404);
            }

            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa đánh giá thành công!',
            ]);
        } catch (Throwable $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa đánh giá: ' . $ex->getMessage(),
            ], 500);
        }
    }
}

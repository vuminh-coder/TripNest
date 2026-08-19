<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Lấy danh sách ID các phòng yêu thích
     */
    public function index(Request $request): JsonResponse
    {
        $user = null;
        if ($request->user()) {
            $user = $request->user()->user;
        }
        if (!$user) {
            $user = User::first();
        }

        $wishlistIds = Wishlist::where('user_id', $user?->id)->pluck('room_id')->toArray();

        return response()->json($wishlistIds);
    }

    /**
     * Bật/Tắt trạng thái yêu thích
     */
    public function toggle(Request $request): JsonResponse
    {
        $roomId = $request->input('roomId');
        $user = null;
        if ($request->user()) {
            $user = $request->user()->user;
        }
        if (!$user) {
            $user = User::first();
        }

        $existing = Wishlist::where('user_id', $user?->id)->where('room_id', $roomId)->first();
        if ($existing) {
            $existing->delete();
            $favorited = false;
        } else {
            Wishlist::create([
                'user_id' => $user->id,
                'room_id' => $roomId,
                'created_at' => now(),
            ]);
            $favorited = true;
        }

        return response()->json([
            'success' => true,
            'favorited' => $favorited,
            'roomId' => (int)$roomId,
        ]);
    }
}

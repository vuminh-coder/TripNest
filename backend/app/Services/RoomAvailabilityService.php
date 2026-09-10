<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Room;
use App\Models\RoomLock;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoomAvailabilityService
{
    /**
     * Kiểm tra tính khả dụng của một phòng trong khoảng thời gian [checkIn, checkOut]
     * Áp dụng thuật toán giao thoa chuẩn: check_in_date < checkOut AND check_out_date > checkIn
     */
    public function checkRoomAvailability(
        int $roomId,
        string $checkIn,
        string $checkOut,
        ?int $excludeBookingId = null,
        ?string $lockToken = null,
        int $requestedRooms = 1
    ): array {
        $room = Room::find($roomId);
        if (!$room) {
            return [
                'is_available' => false,
                'status' => 'not_found',
                'message' => 'Không tìm thấy phòng.',
                'remaining_inventory' => 0,
            ];
        }

        $cIn = Carbon::parse($checkIn)->format('Y-m-d');
        $cOut = Carbon::parse($checkOut)->format('Y-m-d');

        // 1. Tìm các đơn đặt phòng đã chốt đang trùng lịch
        $bookingQuery = Booking::where('room_id', $roomId)
            ->whereIn('status', [Booking::STATUS_CONFIRMED, Booking::STATUS_CHECKED_IN, Booking::STATUS_PENDING])
            ->where(function ($q) use ($cIn, $cOut) {
                $q->where('check_in_date', '<', $cOut)
                  ->where('check_out_date', '>', $cIn);
            });

        if ($excludeBookingId) {
            $bookingQuery->where('id', '!=', $excludeBookingId);
        }

        $conflictingBookings = $bookingQuery->get(['id', 'booking_code', 'check_in_date', 'check_out_date', 'status']);
        $bookedCount = $conflictingBookings->count();

        // 2. Tìm các phiên đang giữ chỗ tạm thời (Active Room Locks)
        $lockQuery = RoomLock::where('room_id', $roomId)
            ->active()
            ->where(function ($q) use ($cIn, $cOut) {
                $q->where('check_in_date', '<', $cOut)
                  ->where('check_out_date', '>', $cIn);
            });

        if ($lockToken) {
            $lockQuery->where('lock_token', '!=', $lockToken);
        }

        $conflictingLocks = $lockQuery->get();
        $heldCount = (int)$conflictingLocks->sum('rooms_count');

        $totalInventory = (int)($room->total_inventory ?: 1);
        $totalOccupied = $bookedCount + $heldCount;
        $remainingInventory = max(0, $totalInventory - $totalOccupied);

        $isAvailable = $remainingInventory >= $requestedRooms;

        // Xác định trạng thái hiển thị
        $status = 'available';
        $heldUntil = null;
        $heldSecondsLeft = 0;

        if (!$isAvailable) {
            if ($heldCount > 0 && $bookedCount < $totalInventory) {
                $status = 'held';
                $latestLock = $conflictingLocks->sortByDesc('expires_at')->first();
                if ($latestLock) {
                    $heldUntil = $latestLock->expires_at->toISOString();
                    $heldSecondsLeft = max(0, now()->diffInSeconds($latestLock->expires_at, false));
                }
            } else {
                $status = 'booked';
            }
        }

        return [
            'is_available' => $isAvailable,
            'status' => $status,
            'remaining_inventory' => $remainingInventory,
            'total_inventory' => $totalInventory,
            'booked_count' => $bookedCount,
            'held_count' => $heldCount,
            'held_until' => $heldUntil,
            'held_seconds_left' => $heldSecondsLeft,
            'conflicting_bookings' => $conflictingBookings->map(fn($b) => [
                'code' => $b->booking_code,
                'checkIn' => $b->check_in_date->format('Y-m-d'),
                'checkOut' => $b->check_out_date->format('Y-m-d'),
            ]),
        ];
    }

    /**
     * Lấy toàn bộ danh sách các khoảng ngày đã kín lịch của 1 phòng (cho Date Picker & Lịch hiển thị)
     */
    public function getBookedRangesForRoom(int $roomId, int $monthsAhead = 6): array
    {
        $startDate = now()->startOfDay()->format('Y-m-d');
        $endDate = now()->addMonths($monthsAhead)->endOfDay()->format('Y-m-d');

        // 1. Đơn đặt phòng thực tế
        $bookings = Booking::where('room_id', $roomId)
            ->whereIn('status', [Booking::STATUS_CONFIRMED, Booking::STATUS_CHECKED_IN, Booking::STATUS_PENDING])
            ->where('check_out_date', '>=', $startDate)
            ->where('check_in_date', '<=', $endDate)
            ->get(['id', 'booking_code', 'check_in_date', 'check_out_date', 'status']);

        // 2. Các đơn đang giữ chỗ tạm thời còn hiệu lực
        $locks = RoomLock::where('room_id', $roomId)
            ->active()
            ->where('check_out_date', '>=', $startDate)
            ->where('check_in_date', '<=', $endDate)
            ->get(['id', 'lock_token', 'check_in_date', 'check_out_date', 'expires_at']);

        $ranges = [];
        foreach ($bookings as $b) {
            $ranges[] = [
                'type' => 'booking',
                'code' => $b->booking_code,
                'checkIn' => $b->check_in_date->format('Y-m-d'),
                'checkOut' => $b->check_out_date->format('Y-m-d'),
                'status' => 'booked',
            ];
        }

        foreach ($locks as $l) {
            $ranges[] = [
                'type' => 'hold_lock',
                'token' => $l->lock_token,
                'checkIn' => $l->check_in_date->format('Y-m-d'),
                'checkOut' => $l->check_out_date->format('Y-m-d'),
                'status' => 'held',
                'expiresAt' => $l->expires_at->toISOString(),
                'secondsLeft' => max(0, now()->diffInSeconds($l->expires_at, false)),
            ];
        }

        return $ranges;
    }

    /**
     * Tạo phiên khóa giữ chỗ tạm thời cho NHIỀU PHÒNG hoặc ĐƠN PHÒNG (Multi-Room Hold Lock)
     */
    public function createHoldLockMulti(
        array $roomsList,
        string $checkIn,
        string $checkOut,
        ?int $userId = null,
        int $ttlMinutes = 15
    ): array {
        DB::beginTransaction();
        try {
            $cIn = Carbon::parse($checkIn)->format('Y-m-d');
            $cOut = Carbon::parse($checkOut)->format('Y-m-d');
            $lockToken = 'LOCK_' . strtoupper(Str::random(8)) . '_' . time();
            $expiresAt = now()->addMinutes($ttlMinutes);
            $validatedRooms = [];

            // GIAI ĐOẠN 1: Xác thực & kiểm tra tồn kho tất cả các phòng trước
            foreach ($roomsList as $key => $item) {
                $roomId = (int)(is_array($item) ? ($item['roomId'] ?? $item['room_id'] ?? $key) : $key);
                $qty = (int)(is_array($item) ? ($item['quantity'] ?? $item['roomsCount'] ?? $item['qty'] ?? 1) : $item);
                if ($roomId <= 0 || $qty <= 0) continue;

                $room = Room::lockForUpdate()->find($roomId);
                if (!$room) {
                    DB::rollBack();
                    return [
                        'success' => false,
                        'code' => 'ROOM_NOT_FOUND',
                        'message' => "Không tìm thấy phòng có ID {$roomId}.",
                    ];
                }

                $avail = $this->checkRoomAvailability($roomId, $cIn, $cOut, null, null, $qty);
                if (!$avail['is_available']) {
                    DB::rollBack();
                    $roomName = $room->room_name_vi ?: "Phòng #{$roomId}";
                    $statusMsg = $avail['status'] === 'held'
                        ? "Hạng phòng \"{$roomName}\" đang có khách khác giữ chỗ thanh toán. Vui lòng thử lại sau ít phút hoặc chọn ngày khác."
                        : "Hạng phòng \"{$roomName}\" không còn đủ {$qty} phòng trống trong khoảng ngày đã chọn.";
                    return [
                        'success' => false,
                        'code' => 'ROOM_UNAVAILABLE',
                        'status' => $avail['status'],
                        'conflicted_room_id' => $roomId,
                        'message' => $statusMsg,
                        'availability' => $avail,
                    ];
                }

                $validatedRooms[] = [
                    'room' => $room,
                    'roomId' => $roomId,
                    'quantity' => $qty,
                ];
            }

            if (empty($validatedRooms)) {
                DB::rollBack();
                return [
                    'success' => false,
                    'code' => 'NO_ROOMS_SPECIFIED',
                    'message' => 'Không có phòng nào được chỉ định để giữ chỗ.',
                ];
            }

            // GIAI ĐOẠN 2: Khi tất cả phòng đều hợp lệ, tiến hành tạo khóa giữ chỗ
            $lockedDetails = [];
            foreach ($validatedRooms as $item) {
                $roomId = $item['roomId'];
                $qty = $item['quantity'];
                $room = $item['room'];

                if ($userId) {
                    RoomLock::where('user_id', $userId)
                        ->where('room_id', $roomId)
                        ->where('status', 'active')
                        ->update(['status' => 'released']);
                }

                RoomLock::create([
                    'room_id' => $roomId,
                    'user_id' => $userId,
                    'lock_token' => $lockToken,
                    'check_in_date' => $cIn,
                    'check_out_date' => $cOut,
                    'rooms_count' => $qty,
                    'expires_at' => $expiresAt,
                    'status' => 'active',
                ]);

                $lockedDetails[] = [
                    'room_id' => $roomId,
                    'room_name' => $room->room_name_vi,
                    'rooms_count' => $qty,
                ];
            }

            DB::commit();

            return [
                'success' => true,
                'lock_token' => $lockToken,
                'expires_at' => $expiresAt->toISOString(),
                'seconds_left' => $ttlMinutes * 60,
                'check_in' => $cIn,
                'check_out' => $cOut,
                'rooms_locked' => $lockedDetails,
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Tạo phiên khóa giữ chỗ tạm thời cho 1 phòng
     */
    public function createHoldLock(
        int $roomId,
        string $checkIn,
        string $checkOut,
        ?int $userId = null,
        int $roomsCount = 1,
        int $ttlMinutes = 15
    ): array {
        return $this->createHoldLockMulti(
            [['roomId' => $roomId, 'quantity' => $roomsCount]],
            $checkIn,
            $checkOut,
            $userId,
            $ttlMinutes
        );
    }

    /**
     * Giải phóng khóa giữ chỗ (khi khách hủy hoặc quay lại trang trước)
     */
    public function releaseLock(string $lockToken): bool
    {
        $updated = RoomLock::where('lock_token', $lockToken)
            ->where('status', 'active')
            ->update(['status' => 'released']);

        return $updated > 0;
    }

    /**
     * Chuyển đổi khóa giữ chỗ thành đơn đặt phòng hoàn tất
     */
    public function convertLock(string $lockToken): bool
    {
        $updated = RoomLock::where('lock_token', $lockToken)
            ->where('status', 'active')
            ->update(['status' => 'converted']);

        return $updated > 0;
    }
}

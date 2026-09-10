<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RoomLock;

class CleanExpiredRoomLocks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tripnest:clean-expired-locks';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Quét và dọn dẹp các phiên khóa giữ chỗ tạm thời đã quá hạn 15 phút (chuyển sang expired)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = RoomLock::where('status', 'active')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'released']);

        $this->info("Đã quét và giải phóng {$count} khóa giữ chỗ quá hạn (chuyển sang released).");

        return Command::SUCCESS;
    }
}

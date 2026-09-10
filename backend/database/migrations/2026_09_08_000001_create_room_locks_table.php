<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_locks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('lock_token', 64)->unique();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->unsignedInteger('rooms_count')->default(1);
            $table->timestamp('expires_at');
            $table->enum('status', ['active', 'released', 'converted'])->default('active');
            $table->timestamps();

            // Index tối ưu kiểm tra xung đột giữ chỗ và dọn dẹp lock hết hạn
            $table->index(['room_id', 'check_in_date', 'check_out_date', 'status', 'expires_at'], 'idx_room_lock_collision');
            $table->index(['lock_token', 'status'], 'idx_lock_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_locks');
    }
};

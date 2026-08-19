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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 20)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('restrict');
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->unsignedInteger('nights_count');
            $table->unsignedInteger('guests_count');
            $table->decimal('base_price', 14, 2);
            $table->decimal('cleaning_fee', 14, 2)->default(0.00);
            $table->decimal('service_fee', 14, 2)->default(0.00);
            $table->decimal('discount_amount', 14, 2)->default(0.00);
            $table->decimal('total_price', 14, 2);
            $table->string('currency', 10)->default('VND');
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'refunded'])->default('confirmed');
            $table->string('cancellation_reason', 255)->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('special_requests')->nullable();
            $table->timestamps();

            // Index tối ưu kiểm tra trùng lịch phòng & truy vấn user
            $table->index(['room_id', 'check_in_date', 'check_out_date', 'status'], 'idx_room_booking_dates');
            $table->index(['user_id', 'status'], 'idx_user_bookings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

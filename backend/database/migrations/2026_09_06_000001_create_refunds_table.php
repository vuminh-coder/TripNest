<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Tạo bảng refunds & Nâng cấp payments status cho hủy phòng chuyên sâu
     */
    public function up(): void
    {
        // 1. Tạo bảng refunds — ghi nhận chi tiết hoàn tiền
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->string('refund_code', 30)->unique();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade');
            $table->decimal('original_amount', 14, 2);
            $table->unsignedTinyInteger('refund_percentage');
            $table->decimal('refund_amount', 14, 2);
            $table->decimal('platform_fee_deducted', 14, 2)->default(0.00);
            $table->string('refund_method', 30)->default('bank_transfer');
            $table->string('status', 30)->default('pending'); // pending, processing, completed, failed
            $table->string('reason', 500)->nullable();
            $table->string('policy_applied', 50); // full_48h, partial_48h, non_refundable
            $table->string('policy_description', 255)->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'status'], 'idx_refund_booking_status');
        });

        // 2. Mở rộng payments.status cho partially_refunded
        // (payments.status đã là VARCHAR(30) sau migration trước nên chỉ cần ghi chú)
        // Giá trị hợp lệ: pending, successful, failed, refunded, partially_refunded

        // 3. Thêm cột refund_amount vào bookings để tra cứu nhanh
        if (!Schema::hasColumn('bookings', 'refund_amount')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->decimal('refund_amount', 14, 2)->nullable()->after('total_price');
                $table->unsignedTinyInteger('refund_percentage')->nullable()->after('refund_amount');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');

        if (Schema::hasColumn('bookings', 'refund_amount')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn(['refund_amount', 'refund_percentage']);
            });
        }
    }
};

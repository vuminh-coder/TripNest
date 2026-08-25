<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 1. Tạo bảng vouchers (quản lý mã giảm giá)
     * 2. Bảng bookings: thêm price_per_night và voucher_id
     * 3. Bảng reviews: gộp 7 cột rating thành rating (tổng thể) và rating_breakdown (JSON radar)
     */
    public function up(): void
    {
        // 1. Tạo bảng vouchers
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('discount_value', 14, 2);
            $table->decimal('min_booking_amount', 14, 2)->default(0.00);
            $table->decimal('max_discount_amount', 14, 2)->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Cập nhật bảng bookings: thêm price_per_night và voucher_id
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('price_per_night', 14, 2)->after('guests_count');
            $table->foreignId('voucher_id')->nullable()->after('discount_amount')->constrained('vouchers')->onDelete('set null');
        });

        // 3. Cập nhật bảng reviews: gộp 7 cột rating thành rating và rating_breakdown
        Schema::table('reviews', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->after('user_id');
            $table->json('rating_breakdown')->nullable()->after('rating');
            $table->dropColumn([
                'rating_overall',
                'rating_cleanliness',
                'rating_accuracy',
                'rating_communication',
                'rating_location',
                'rating_checkin',
                'rating_value',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Khôi phục bảng reviews
        Schema::table('reviews', function (Blueprint $table) {
            $table->decimal('rating_overall', 3, 2)->after('user_id');
            $table->decimal('rating_cleanliness', 3, 2)->after('rating_overall');
            $table->decimal('rating_accuracy', 3, 2)->after('rating_cleanliness');
            $table->decimal('rating_communication', 3, 2)->after('rating_accuracy');
            $table->decimal('rating_location', 3, 2)->after('rating_communication');
            $table->decimal('rating_checkin', 3, 2)->after('rating_location');
            $table->decimal('rating_value', 3, 2)->after('rating_checkin');
            $table->dropColumn(['rating', 'rating_breakdown']);
        });

        // Khôi phục bảng bookings
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['voucher_id']);
            $table->dropColumn(['price_per_night', 'voucher_id']);
        });

        // Xóa bảng vouchers
        Schema::dropIfExists('vouchers');
    }
};

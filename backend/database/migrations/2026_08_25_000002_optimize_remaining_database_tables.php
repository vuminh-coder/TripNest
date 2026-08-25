<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tối ưu hóa các bảng CSDL còn lại:
     * - Loại bỏ các cột quốc tế/thừa không dùng trong hệ thống (swift_code, bank_code, bank_branch, currency thừa...)
     * - Bổ sung cột status vào bảng reviews cho chức năng kiểm duyệt đánh giá của Admin.
     */
    public function up(): void
    {
        // 1. Bảng host_payout_accounts: bỏ các trường thừa
        Schema::table('host_payout_accounts', function (Blueprint $table) {
            $table->dropColumn([
                'bank_code',
                'bank_branch',
                'swift_code',
                'currency',
                'verification_document_url',
            ]);
        });

        // 2. Bảng bookings: bỏ cột currency thừa (tiền tệ VND duy nhất)
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('currency');
        });

        // 3. Bảng reviews: thêm cột status kiểm duyệt của admin
        Schema::table('reviews', function (Blueprint $table) {
            $table->enum('status', ['approved', 'hidden', 'flagged'])->default('approved')->after('host_responded_at');
            $table->index(['room_id', 'status'], 'idx_room_review_status');
        });

        // 4. Bảng experiences: bỏ title_en và country thừa
        Schema::table('experiences', function (Blueprint $table) {
            $table->dropColumn(['title_en', 'country']);
        });

        // 5. Bảng payments: bỏ cột currency thừa
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('currency');
        });

        // 6. Bảng payout_transactions: bỏ cột currency thừa
        Schema::table('payout_transactions', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payout_transactions', function (Blueprint $table) {
            $table->string('currency', 10)->default('VND')->after('net_payout_amount');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('currency', 10)->default('VND')->after('amount');
        });

        Schema::table('experiences', function (Blueprint $table) {
            $table->string('title_en', 255)->nullable()->after('title_vi');
            $table->string('country', 100)->default('Việt Nam')->after('city');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_room_review_status');
            $table->dropColumn('status');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('currency', 10)->default('VND')->after('total_price');
        });

        Schema::table('host_payout_accounts', function (Blueprint $table) {
            $table->string('bank_code', 20)->nullable()->after('bank_name');
            $table->string('bank_branch', 150)->nullable()->after('bank_code');
            $table->string('swift_code', 20)->nullable()->after('account_holder_name');
            $table->string('currency', 10)->default('VND')->after('swift_code');
            $table->string('verification_document_url', 500)->nullable()->after('is_verified');
        });
    }
};

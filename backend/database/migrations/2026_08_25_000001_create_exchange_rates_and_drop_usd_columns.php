<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 1. Tạo bảng exchange_rates (quản lý tỷ giá quy đổi tiền tệ)
     * 2. Đổi tên cột VND cho gọn (vì giờ chỉ dùng VND duy nhất)
     * 3. Xóa các cột USD dư thừa khỏi rooms và experiences
     */
    public function up(): void
    {
        // 1. Tạo bảng exchange_rates
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('base_currency', 10)->default('VND');
            $table->string('target_currency', 10); // 'USD', 'EUR', ...
            $table->decimal('rate', 16, 6); // 1 target = ? base (VD: 1 USD = 25450.000000 VND)
            $table->date('effective_date');
            $table->string('source', 100)->default('manual');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['base_currency', 'target_currency', 'effective_date'], 'uq_exchange_rate');
        });

        // 2. Bảng rooms: đổi tên cột VND → tên gọn, xóa cột USD
        Schema::table('rooms', function (Blueprint $table) {
            $table->renameColumn('price_vnd_per_night', 'price_per_night');
            $table->renameColumn('cleaning_fee_vnd', 'cleaning_fee');
        });
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['price_usd_per_night', 'cleaning_fee_usd']);
        });

        // 3. Bảng experiences: đổi tên cột VND → tên gọn, xóa cột USD
        Schema::table('experiences', function (Blueprint $table) {
            $table->renameColumn('price_vnd_per_person', 'price_per_person');
        });
        Schema::table('experiences', function (Blueprint $table) {
            $table->dropColumn('price_usd_per_person');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Khôi phục experiences
        Schema::table('experiences', function (Blueprint $table) {
            $table->decimal('price_usd_per_person', 10, 2)->after('price_per_person')->default(0);
        });
        Schema::table('experiences', function (Blueprint $table) {
            $table->renameColumn('price_per_person', 'price_vnd_per_person');
        });

        // Khôi phục rooms
        Schema::table('rooms', function (Blueprint $table) {
            $table->decimal('price_usd_per_night', 10, 2)->after('price_per_night')->default(0);
            $table->decimal('cleaning_fee_usd', 8, 2)->after('cleaning_fee')->default(30.00);
        });
        Schema::table('rooms', function (Blueprint $table) {
            $table->renameColumn('price_per_night', 'price_vnd_per_night');
            $table->renameColumn('cleaning_fee', 'cleaning_fee_vnd');
        });

        Schema::dropIfExists('exchange_rates');
    }
};

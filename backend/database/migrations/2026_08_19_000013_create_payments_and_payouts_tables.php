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
        // 1. Bảng thanh toán của khách hàng
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('transaction_code', 100)->unique();
            $table->enum('payment_method', ['credit_card', 'vnpay', 'momo', 'bank_transfer', 'cash'])->default('credit_card');
            $table->decimal('amount', 14, 2);
            $table->string('currency', 10)->default('VND');
            $table->enum('status', ['pending', 'successful', 'failed', 'refunded'])->default('successful');
            $table->json('payment_gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable()->useCurrent();
            $table->timestamps();
        });

        // 2. Bảng giải ngân doanh thu cho chủ nhà
        Schema::create('payout_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('payout_code', 30)->unique();
            $table->foreignId('host_id')->constrained('hosts')->onDelete('restrict');
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('restrict');
            $table->foreignId('payout_account_id')->constrained('host_payout_accounts')->onDelete('restrict');
            $table->decimal('gross_amount', 14, 2);
            $table->decimal('platform_commission_fee', 14, 2);
            $table->decimal('net_payout_amount', 14, 2);
            $table->string('currency', 10)->default('VND');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('completed');
            $table->string('transaction_reference', 100)->nullable();
            $table->timestamp('transferred_at')->nullable()->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payout_transactions');
        Schema::dropIfExists('payments');
    }
};

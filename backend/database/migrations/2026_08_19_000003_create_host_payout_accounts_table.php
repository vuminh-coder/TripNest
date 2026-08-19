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
        Schema::create('host_payout_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('hosts')->onDelete('cascade');
            $table->enum('account_type', ['bank_transfer', 'momo', 'vnpay', 'paypal', 'stripe'])->default('bank_transfer');
            $table->string('bank_name', 100);
            $table->string('bank_code', 20)->nullable();
            $table->string('bank_branch', 150)->nullable();
            $table->string('account_number', 50);
            $table->string('account_holder_name', 100);
            $table->string('swift_code', 20)->nullable();
            $table->string('currency', 10)->default('VND');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_verified')->default(true);
            $table->string('verification_document_url', 500)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('host_payout_accounts');
    }
};

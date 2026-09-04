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
        Schema::create('password_otps', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->dateTime('expire_at');
            $table->string('otp');
            $table->foreignId('account_id')
            ->constrained('accounts')
            ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_otps');
    }
};

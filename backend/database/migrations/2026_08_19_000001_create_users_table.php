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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->unique()->constrained('accounts')->onDelete('cascade');
            $table->string('full_name', 100);
            $table->string('phone_number', 20)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->default('other');
            $table->date('date_of_birth')->nullable();
            $table->string('id_card_number', 30)->nullable();
            $table->string('nationality', 50)->default('Việt Nam');
            $table->string('address', 255)->nullable();
            $table->text('bio')->nullable();
            $table->string('emergency_contact', 150)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

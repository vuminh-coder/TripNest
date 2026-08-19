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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accommodation_id')->constrained('accommodations')->onDelete('cascade');
            $table->string('room_name_vi', 255);
            $table->string('room_name_en', 255)->nullable();
            $table->string('room_type_code', 50)->default('entire_villa');
            $table->enum('space_type', ['entire_place', 'private_room', 'shared_room'])->default('entire_place');
            $table->longText('description');
            $table->decimal('room_size_m2', 6, 2)->nullable();
            $table->decimal('price_usd_per_night', 10, 2);
            $table->decimal('price_vnd_per_night', 14, 2);
            $table->decimal('cleaning_fee_usd', 8, 2)->default(30.00);
            $table->decimal('cleaning_fee_vnd', 12, 2)->default(500000.00);
            $table->decimal('service_fee_percent', 4, 2)->default(12.00);
            $table->unsignedTinyInteger('max_guests')->default(2);
            $table->unsignedTinyInteger('bedrooms_count')->default(1);
            $table->unsignedTinyInteger('beds_count')->default(1);
            $table->decimal('bathrooms_count', 3, 1)->default(1.0);
            $table->unsignedInteger('total_inventory')->default(1);
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->boolean('is_guest_favorite')->default(false);
            $table->enum('status', ['available', 'maintenance', 'hidden'])->default('available');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};

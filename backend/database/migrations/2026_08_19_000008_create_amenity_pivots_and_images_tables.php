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
        // 1. Pivot tiện ích cơ sở lưu trú
        Schema::create('accommodation_amenity', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accommodation_id')->constrained('accommodations')->onDelete('cascade');
            $table->foreignId('amenity_id')->constrained('amenities')->onDelete('cascade');
            $table->unique(['accommodation_id', 'amenity_id']);
        });

        // 2. Pivot tiện ích trong phòng
        Schema::create('room_amenity', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignId('amenity_id')->constrained('amenities')->onDelete('cascade');
            $table->unique(['room_id', 'amenity_id']);
        });

        // 3. Album ảnh cơ sở lưu trú
        Schema::create('accommodation_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accommodation_id')->constrained('accommodations')->onDelete('cascade');
            $table->string('image_url', 500);
            $table->string('caption', 255)->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_thumbnail')->default(false);
            $table->timestamps();
        });

        // 4. Album ảnh phòng
        Schema::create('room_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->string('image_url', 500);
            $table->string('caption', 255)->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_thumbnail')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_images');
        Schema::dropIfExists('accommodation_images');
        Schema::dropIfExists('room_amenity');
        Schema::dropIfExists('accommodation_amenity');
    }
};

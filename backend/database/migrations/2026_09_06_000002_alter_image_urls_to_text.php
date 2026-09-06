<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Nâng cấp cột image_url sang TEXT để chứa được mọi URL ảnh dài (Bing, Google, CDN, Presigned S3)
        DB::statement("ALTER TABLE `room_images` MODIFY COLUMN `image_url` TEXT NOT NULL");
        DB::statement("ALTER TABLE `accommodation_images` MODIFY COLUMN `image_url` TEXT NOT NULL");
        DB::statement("ALTER TABLE `experiences` MODIFY COLUMN `image_url` TEXT NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE `room_images` MODIFY COLUMN `image_url` VARCHAR(500) NOT NULL");
        DB::statement("ALTER TABLE `accommodation_images` MODIFY COLUMN `image_url` VARCHAR(500) NOT NULL");
        DB::statement("ALTER TABLE `experiences` MODIFY COLUMN `image_url` VARCHAR(500) NOT NULL");
    }
};

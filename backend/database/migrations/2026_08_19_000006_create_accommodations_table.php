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
        Schema::create('accommodations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('hosts')->onDelete('restrict');
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->string('name_vi', 255);
            $table->string('name_en', 255)->nullable();
            $table->enum('accommodation_type', ['hotel', 'resort', 'villa', 'homestay', 'apartment', 'cabin', 'yacht'])->default('hotel');
            $table->unsignedTinyInteger('star_rating')->default(0);
            $table->longText('description');
            $table->string('address', 255);
            $table->string('city', 100);
            $table->string('district', 100)->nullable();
            $table->string('country', 100)->default('Việt Nam');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('distance_description', 255)->nullable();
            $table->time('check_in_time')->default('14:00:00');
            $table->time('check_out_time')->default('12:00:00');
            $table->text('house_rules')->nullable();
            $table->text('cancellation_policy')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['draft', 'published', 'paused', 'archived'])->default('published');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accommodations');
    }
};

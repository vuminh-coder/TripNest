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
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->nullable()->constrained('hosts')->onDelete('set null');
            $table->string('title_vi', 255);
            $table->string('title_en', 255)->nullable();
            $table->string('caption', 255);
            $table->text('description')->nullable();
            $table->string('city', 100);
            $table->string('country', 100)->default('Việt Nam');
            $table->decimal('price_usd_per_person', 10, 2);
            $table->decimal('price_vnd_per_person', 14, 2);
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->string('image_url', 500);
            $table->decimal('duration_hours', 3, 1)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};

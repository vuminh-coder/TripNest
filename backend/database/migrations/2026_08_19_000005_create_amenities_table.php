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
        Schema::create('amenities', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name_vi', 100);
            $table->string('name_en', 100);
            $table->string('icon', 50);
            $table->enum('target_type', ['both', 'accommodation', 'room'])->default('both');
            $table->enum('category', ['basic', 'standout', 'safety', 'luxury'])->default('basic');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('amenities');
    }
};

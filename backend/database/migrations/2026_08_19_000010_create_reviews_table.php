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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('cascade');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            
            // Radar 6 tiêu chí
            $table->decimal('rating_overall', 3, 2);
            $table->decimal('rating_cleanliness', 3, 2);
            $table->decimal('rating_accuracy', 3, 2);
            $table->decimal('rating_communication', 3, 2);
            $table->decimal('rating_location', 3, 2);
            $table->decimal('rating_checkin', 3, 2);
            $table->decimal('rating_value', 3, 2);
            
            $table->text('comment');
            $table->text('host_response')->nullable();
            $table->timestamp('host_responded_at')->nullable();
            $table->timestamps();

            $table->index(['room_id'], 'idx_room_reviews');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};

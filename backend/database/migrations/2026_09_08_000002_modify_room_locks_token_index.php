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
        Schema::table('room_locks', function (Blueprint $table) {
            $table->dropUnique('room_locks_lock_token_unique');
            $table->unique(['lock_token', 'room_id'], 'uq_token_room');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('room_locks', function (Blueprint $table) {
            $table->dropUnique('uq_token_room');
            $table->unique('lock_token', 'room_locks_lock_token_unique');
        });
    }
};

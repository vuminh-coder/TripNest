<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `bookings` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'confirmed'");
            DB::statement("ALTER TABLE `payments` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'successful'");
            DB::statement("ALTER TABLE `payments` MODIFY `payment_method` VARCHAR(50) NOT NULL DEFAULT 'credit_card'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

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
        Schema::create('hosts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            
            // Thông tin thương hiệu / hiển thị
            $table->string('host_display_name', 100);
            $table->string('host_avatar_url', 500)->nullable();
            $table->text('host_introduction')->nullable();
            $table->json('languages_spoken')->nullable();
            $table->string('contact_phone', 20);
            $table->string('contact_email', 191)->nullable();
            $table->string('emergency_phone', 20)->nullable();
            
            // Pháp lý & KYC
            $table->enum('business_type', ['individual', 'household', 'company'])->default('individual');
            $table->string('business_name', 150)->nullable();
            $table->string('tax_id', 50)->nullable();
            $table->string('id_card_number', 30);
            $table->string('id_card_front_url', 500);
            $table->string('id_card_back_url', 500);
            $table->string('portrait_photo_url', 500)->nullable();
            $table->string('business_license_url', 500)->nullable();
            
            // Xét duyệt & Uy tín
            $table->enum('kyc_status', ['unverified', 'pending', 'verified', 'rejected'])->default('pending');
            $table->text('kyc_rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('accounts')->onDelete('set null');
            $table->boolean('is_superhost')->default(false);
            $table->decimal('host_rating', 3, 2)->default(5.00);
            $table->unsignedInteger('host_reviews_count')->default(0);
            $table->unsignedTinyInteger('response_rate_percent')->default(100);
            $table->string('response_time_text', 50)->default('trong vòng 1 giờ');
            $table->timestamp('terms_accepted_at')->nullable()->useCurrent();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hosts');
    }
};

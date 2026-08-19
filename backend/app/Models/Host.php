<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Host extends Model
{
    use HasFactory;

    protected $table = 'hosts';

    protected $fillable = [
        'user_id',
        'host_display_name',
        'host_avatar_url',
        'host_introduction',
        'languages_spoken',
        'contact_phone',
        'contact_email',
        'emergency_phone',
        'business_type',
        'business_name',
        'tax_id',
        'id_card_number',
        'id_card_front_url',
        'id_card_back_url',
        'portrait_photo_url',
        'business_license_url',
        'kyc_status',
        'kyc_rejection_reason',
        'verified_at',
        'verified_by',
        'is_superhost',
        'host_rating',
        'host_reviews_count',
        'response_rate_percent',
        'response_time_text',
        'terms_accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'languages_spoken' => 'array',
            'is_superhost' => 'boolean',
            'host_rating' => 'decimal:2',
            'verified_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function accommodations(): HasMany
    {
        return $this->hasMany(Accommodation::class, 'host_id');
    }

    public function payoutAccounts(): HasMany
    {
        return $this->hasMany(HostPayoutAccount::class, 'host_id');
    }

    public function defaultPayoutAccount(): HasOne
    {
        return $this->hasOne(HostPayoutAccount::class, 'host_id')->where('is_default', true);
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class, 'host_id');
    }

    public function payoutTransactions(): HasMany
    {
        return $this->hasMany(PayoutTransaction::class, 'host_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayoutTransaction extends Model
{
    use HasFactory;

    protected $table = 'payout_transactions';

    protected $fillable = [
        'payout_code',
        'host_id',
        'booking_id',
        'payout_account_id',
        'gross_amount',
        'platform_commission_fee',
        'net_payout_amount',
        'currency',
        'status',
        'transaction_reference',
        'transferred_at',
    ];

    protected function casts(): array
    {
        return [
            'gross_amount' => 'decimal:2',
            'platform_commission_fee' => 'decimal:2',
            'net_payout_amount' => 'decimal:2',
            'transferred_at' => 'datetime',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(Host::class, 'host_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function payoutAccount(): BelongsTo
    {
        return $this->belongsTo(HostPayoutAccount::class, 'payout_account_id');
    }
}

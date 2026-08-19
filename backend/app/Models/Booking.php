<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected $table = 'bookings';

    protected $fillable = [
        'booking_code',
        'user_id',
        'room_id',
        'check_in_date',
        'check_out_date',
        'nights_count',
        'guests_count',
        'base_price',
        'cleaning_fee',
        'service_fee',
        'discount_amount',
        'total_price',
        'currency',
        'status',
        'cancellation_reason',
        'cancelled_at',
        'special_requests',
    ];

    protected function casts(): array
    {
        return [
            'check_in_date' => 'date',
            'check_out_date' => 'date',
            'nights_count' => 'integer',
            'guests_count' => 'integer',
            'base_price' => 'decimal:2',
            'cleaning_fee' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_price' => 'decimal:2',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class, 'booking_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'booking_id');
    }

    public function payoutTransactions(): HasMany
    {
        return $this->hasMany(PayoutTransaction::class, 'booking_id');
    }
}

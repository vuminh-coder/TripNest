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
        'price_per_night',
        'base_price',
        'cleaning_fee',
        'service_fee',
        'discount_amount',
        'voucher_id',
        'total_price',
        'refund_amount',
        'refund_percentage',
        'status',
        'checked_in_at',
        'checked_out_at',
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
            'price_per_night' => 'decimal:2',
            'base_price' => 'decimal:2',
            'cleaning_fee' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_price' => 'decimal:2',
            'refund_amount' => 'decimal:2',
            'refund_percentage' => 'integer',
            'checked_in_at' => 'datetime',
            'checked_out_at' => 'datetime',
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

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class, 'voucher_id');
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

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class, 'booking_id');
    }

    /**
     * Tổng hợp thông tin hoàn tiền của booking
     */
    public function getRefundSummaryAttribute(): ?array
    {
        if ($this->status !== self::STATUS_CANCELLED && $this->status !== self::STATUS_REFUNDED) {
            return null;
        }

        $refund = $this->refunds()->latest()->first();
        if (!$refund) {
            return [
                'percentage' => (int)($this->refund_percentage ?? 100),
                'amount' => (float)($this->refund_amount ?? $this->total_price),
                'status' => 'pending',
                'policy' => 'full_48h',
                'policy_label' => 'Hoàn tiền 100%',
            ];
        }

        return [
            'percentage' => (int)$refund->refund_percentage,
            'amount' => (float)$refund->refund_amount,
            'status' => $refund->status,
            'status_label' => $refund->status_label,
            'policy' => $refund->policy_applied,
            'policy_label' => $refund->policy_label,
            'refund_method' => $refund->refund_method,
            'processed_at' => $refund->processed_at?->toISOString(),
        ];
    }

    // ===== Status Constants =====
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_CHECKED_IN = 'checked_in';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED = 'refunded';

    const STATUS_LABELS = [
        'pending' => 'Chờ xác nhận',
        'confirmed' => 'Đã xác nhận',
        'checked_in' => 'Đang ở',
        'completed' => 'Đã hoàn thành',
        'cancelled' => 'Đã hủy',
        'refunded' => 'Đã hoàn tiền',
    ];

    // ===== Query Scopes =====
    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', [self::STATUS_CONFIRMED, self::STATUS_PENDING]);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_CHECKED_IN);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeCancelled($query)
    {
        return $query->whereIn('status', [self::STATUS_CANCELLED, self::STATUS_REFUNDED]);
    }

    // ===== Accessors =====
    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }

    public function getCanCancelAttribute(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    public function getCanCheckInAttribute(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    public function getCanCheckOutAttribute(): bool
    {
        return $this->status === self::STATUS_CHECKED_IN;
    }

    public function getCanReviewAttribute(): bool
    {
        return $this->status === self::STATUS_COMPLETED && !$this->review;
    }
}

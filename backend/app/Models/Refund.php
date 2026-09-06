<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    use HasFactory;

    protected $table = 'refunds';

    protected $fillable = [
        'refund_code',
        'booking_id',
        'payment_id',
        'original_amount',
        'refund_percentage',
        'refund_amount',
        'platform_fee_deducted',
        'refund_method',
        'status',
        'reason',
        'policy_applied',
        'policy_description',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'original_amount' => 'decimal:2',
            'refund_amount' => 'decimal:2',
            'platform_fee_deducted' => 'decimal:2',
            'refund_percentage' => 'integer',
            'processed_at' => 'datetime',
        ];
    }

    // ===== Policy Labels =====
    const POLICY_FULL_48H = 'full_48h';
    const POLICY_PARTIAL_48H = 'partial_48h';
    const POLICY_NON_REFUNDABLE = 'non_refundable';

    const POLICY_LABELS = [
        'full_48h' => 'Hoàn tiền 100% (hủy trước 48h)',
        'partial_48h' => 'Hoàn tiền 50% (hủy trong 48h)',
        'non_refundable' => 'Không hoàn tiền (sau giờ nhận phòng)',
    ];

    // ===== Status Labels =====
    const STATUS_LABELS = [
        'pending' => 'Đang chờ xử lý',
        'processing' => 'Đang xử lý hoàn tiền',
        'completed' => 'Đã hoàn tiền',
        'failed' => 'Hoàn tiền thất bại',
    ];

    // ===== Relationships =====
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }

    // ===== Accessors =====
    public function getPolicyLabelAttribute(): string
    {
        return self::POLICY_LABELS[$this->policy_applied] ?? $this->policy_applied;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }
}

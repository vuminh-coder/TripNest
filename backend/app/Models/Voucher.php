<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasFactory;

    protected $table = 'vouchers';

    protected $fillable = [
        'code',
        'title',
        'description',
        'discount_type',
        'discount_value',
        'min_booking_amount',
        'max_discount_amount',
        'usage_limit',
        'used_count',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'min_booking_amount' => 'decimal:2',
            'max_discount_amount' => 'decimal:2',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'voucher_id');
    }

    /**
     * Tính số tiền giảm giá dựa trên tổng tiền phòng (base_price)
     */
    public function calculateDiscount(float $baseAmount): float
    {
        if (!$this->is_active) {
            return 0.00;
        }

        if ($this->start_date && now()->toDateString() < $this->start_date->toDateString()) {
            return 0.00;
        }

        if ($this->end_date && now()->toDateString() > $this->end_date->toDateString()) {
            return 0.00;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return 0.00;
        }

        if ($baseAmount < (float) $this->min_booking_amount) {
            return 0.00;
        }

        if ($this->discount_type === 'percentage') {
            $discount = round($baseAmount * ((float) $this->discount_value / 100));
            if ($this->max_discount_amount !== null && $discount > (float) $this->max_discount_amount) {
                $discount = (float) $this->max_discount_amount;
            }
            return $discount;
        }

        return min((float) $this->discount_value, $baseAmount);
    }
}

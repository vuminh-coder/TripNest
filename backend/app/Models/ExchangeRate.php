<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $table = 'exchange_rates';

    protected $fillable = [
        'base_currency',
        'target_currency',
        'rate',
        'effective_date',
        'source',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:6',
            'effective_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Lấy tỷ giá mới nhất: 1 target_currency = ? base_currency (VND)
     * VD: getRate('USD') → 25450.00 (1 USD = 25,450 VND)
     */
    public static function getRate(string $target = 'USD', string $base = 'VND'): float
    {
        $rate = static::where('base_currency', $base)
            ->where('target_currency', $target)
            ->where('is_active', true)
            ->where('effective_date', '<=', now()->toDateString())
            ->orderByDesc('effective_date')
            ->value('rate');

        // Fallback mặc định nếu chưa có dữ liệu tỷ giá
        if (!$rate) {
            return match ($target) {
                'USD' => 25450.00,
                'EUR' => 27800.00,
                default => 1.00,
            };
        }

        return (float) $rate;
    }

    /**
     * Quy đổi từ VND sang tiền tệ khác
     * VD: convert(2850000, 'USD') → 112.0 (2,850,000 ÷ 25,450)
     */
    public static function convert(float $amountVND, string $target = 'USD'): float
    {
        if ($target === 'VND') {
            return $amountVND;
        }

        $rate = static::getRate($target);

        return round($amountVND / $rate, 2);
    }
}

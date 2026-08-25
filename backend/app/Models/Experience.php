<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Experience extends Model
{
    use HasFactory;

    protected $table = 'experiences';

    protected $fillable = [
        'host_id',
        'title_vi',
        'caption',
        'description',
        'city',
        'price_per_person',
        'rating',
        'reviews_count',
        'image_url',
        'duration_hours',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_per_person' => 'decimal:2',
            'rating' => 'decimal:2',
            'reviews_count' => 'integer',
            'duration_hours' => 'decimal:1',
            'is_active' => 'boolean',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(Host::class, 'host_id');
    }
}

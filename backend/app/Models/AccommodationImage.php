<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccommodationImage extends Model
{
    use HasFactory;

    protected $table = 'accommodation_images';

    protected $fillable = [
        'accommodation_id',
        'image_url',
        'caption',
        'display_order',
        'is_thumbnail',
    ];

    protected function casts(): array
    {
        return [
            'is_thumbnail' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function accommodation(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class, 'accommodation_id');
    }
}

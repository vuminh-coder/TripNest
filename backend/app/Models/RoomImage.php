<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomImage extends Model
{
    use HasFactory;

    protected $table = 'room_images';

    protected $fillable = [
        'room_id',
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

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $table = 'reviews';

    protected $fillable = [
        'booking_id',
        'room_id',
        'user_id',
        'rating_overall',
        'rating_cleanliness',
        'rating_accuracy',
        'rating_communication',
        'rating_location',
        'rating_checkin',
        'rating_value',
        'comment',
        'host_response',
        'host_responded_at',
    ];

    protected function casts(): array
    {
        return [
            'rating_overall' => 'decimal:2',
            'rating_cleanliness' => 'decimal:2',
            'rating_accuracy' => 'decimal:2',
            'rating_communication' => 'decimal:2',
            'rating_location' => 'decimal:2',
            'rating_checkin' => 'decimal:2',
            'rating_value' => 'decimal:2',
            'host_responded_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomLock extends Model
{
    use HasFactory;

    protected $table = 'room_locks';

    protected $fillable = [
        'room_id',
        'user_id',
        'lock_token',
        'check_in_date',
        'check_out_date',
        'rooms_count',
        'expires_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'check_in_date' => 'date',
            'check_out_date' => 'date',
            'rooms_count' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope lọc các lock còn hiệu lực
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('expires_at', '>', now());
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Amenity extends Model
{
    use HasFactory;

    protected $table = 'amenities';

    protected $fillable = [
        'code',
        'name_vi',
        'name_en',
        'icon',
        'target_type',
        'category',
    ];

    public function accommodations(): BelongsToMany
    {
        return $this->belongsToMany(Accommodation::class, 'accommodation_amenity', 'amenity_id', 'accommodation_id');
    }

    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(Room::class, 'room_amenity', 'amenity_id', 'room_id');
    }
}

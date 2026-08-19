<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Accommodation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'accommodations';

    protected $fillable = [
        'host_id',
        'category_id',
        'name_vi',
        'name_en',
        'accommodation_type',
        'star_rating',
        'description',
        'address',
        'city',
        'district',
        'country',
        'latitude',
        'longitude',
        'distance_description',
        'check_in_time',
        'check_out_time',
        'house_rules',
        'cancellation_policy',
        'is_featured',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'star_rating' => 'integer',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(Host::class, 'host_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'accommodation_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(AccommodationImage::class, 'accommodation_id')->orderBy('display_order');
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'accommodation_amenity', 'accommodation_id', 'amenity_id');
    }
}

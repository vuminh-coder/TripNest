<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rooms';

    protected $fillable = [
        'accommodation_id',
        'room_name_vi',
        'room_name_en',
        'room_type_code',
        'space_type',
        'description',
        'room_size_m2',
        'price_usd_per_night',
        'price_vnd_per_night',
        'cleaning_fee_usd',
        'cleaning_fee_vnd',
        'service_fee_percent',
        'max_guests',
        'bedrooms_count',
        'beds_count',
        'bathrooms_count',
        'total_inventory',
        'rating',
        'reviews_count',
        'is_guest_favorite',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price_usd_per_night' => 'decimal:2',
            'price_vnd_per_night' => 'decimal:2',
            'cleaning_fee_usd' => 'decimal:2',
            'cleaning_fee_vnd' => 'decimal:2',
            'service_fee_percent' => 'decimal:2',
            'rating' => 'decimal:2',
            'room_size_m2' => 'decimal:2',
            'bathrooms_count' => 'decimal:1',
            'is_guest_favorite' => 'boolean',
            'max_guests' => 'integer',
            'bedrooms_count' => 'integer',
            'beds_count' => 'integer',
            'total_inventory' => 'integer',
            'reviews_count' => 'integer',
        ];
    }

    public function accommodation(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class, 'accommodation_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(RoomImage::class, 'room_id')->orderBy('display_order');
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'room_amenity', 'room_id', 'amenity_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'room_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'room_id');
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class, 'room_id');
    }
}

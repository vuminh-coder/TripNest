<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    use HasFactory;

    protected $table = 'users';

    protected $fillable = [
        'account_id',
        'full_name',
        'phone_number',
        'avatar_url',
        'gender',
        'date_of_birth',
        'id_card_number',
        'nationality',
        'address',
        'bio',
        'emergency_contact',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function host(): HasOne
    {
        return $this->hasOne(Host::class, 'user_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'user_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class, 'user_id');
    }
}

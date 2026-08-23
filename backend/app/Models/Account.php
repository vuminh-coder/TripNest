<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Laravel\Sanctum\HasApiTokens;

class Account extends Authenticatable  implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'accounts';

    protected $fillable = [
        'email',
        'password',
        'google_id',
        'google_avatar',
        'role',
        'status',
        'email_verified_at',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

     // ===== 2 method của JWTSubject =====

    /**
     * Giá trị này sẽ được nhét vào claim 'sub' của JWT payload.
     * Thường là primary key của user.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Các claim TÙY BIẾN nhét thêm vào payload.
     * Rỗng cũng OK — nhưng nhớ đừng bỏ dữ liệu nhạy cảm vào đây.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'name'  => $this->name,
            'email' => $this->email,
        ];
    }

    public function getUserInfo():HasOne{
        return $this->hasOne(User::class,'account_id','id');
    }
}

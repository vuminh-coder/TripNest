<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordOtp extends Model
{
    //
    protected $fillable = [
        "account_id",
        "expire_at",
        "otp",
        "email"
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostPayoutAccount extends Model
{
    use HasFactory;

    protected $table = 'host_payout_accounts';

    protected $fillable = [
        'host_id',
        'account_type',
        'bank_name',
        'bank_code',
        'bank_branch',
        'account_number',
        'account_holder_name',
        'swift_code',
        'currency',
        'is_default',
        'is_verified',
        'verification_document_url',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_verified' => 'boolean',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(Host::class, 'host_id');
    }
}

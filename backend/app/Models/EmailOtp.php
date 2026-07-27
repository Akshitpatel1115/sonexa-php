<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class EmailOtp extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'email_otps';
    
    protected $fillable = [
        'user_id',
        'email',
        'otp',
        'type', // 'registration', 'forgot_password', 'email_verification'
        'expires_at',
        'resend_available_at',
        'attempts',
        'verified_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'resend_available_at' => 'datetime',
        'verified_at' => 'datetime',
        'attempts' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class AuthSecurity extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'auth_security';
    
    protected $fillable = [
        'user_id',
        'username',
        'login_attempts',
        'login_block_until',
        'otp_attempts',
        'otp_block_until',
        'forgot_password_attempts',
        'forgot_password_block_until',
        'auth_block_until',
        'last_login_at',
        'last_login_ip',
        'last_login_user_agent',
        'last_failed_login_at'
    ];

    protected $casts = [
        'login_block_until' => 'datetime',
        'otp_block_until' => 'datetime',
        'forgot_password_block_until' => 'datetime',
        'auth_block_until' => 'datetime',
        'last_login_at' => 'datetime',
        'last_failed_login_at' => 'datetime',
        'login_attempts' => 'integer',
        'otp_attempts' => 'integer',
        'forgot_password_attempts' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

<?php
namespace App\Models;
use MongoDB\Laravel\Eloquent\Model;

class PendingUser extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'pendingusers';
    protected $fillable = [
        'username', 'email', 'password', 'role', 
        'otp', 'otpAttempts', 'authBlock', 
        'otpExpiresAt', 'resendAvailableAt', 'expiresAt'
    ];
    protected $appends = ['_id'];

    public function get_IdAttribute()
    {
        return (string)$this->attributes['_id'];
    }
}

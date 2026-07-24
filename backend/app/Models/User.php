<?php
namespace App\Models;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Auth\Authenticatable;

class User extends Model implements AuthenticatableContract
{
    use Authenticatable;
    protected $connection = 'mongodb';
    protected $table = 'users';
    protected $fillable = [
        'username', 'email', 'password', 'role', 'status',
        'resetPasswordOTP', 'resetPasswordOTPExpiresAt', 'resetPasswordResendAvailableAt', 'resetPasswordVerified',
        'loginAttempts', 'resetPasswordOtpAttempts', 'authBlock'
    ];
    protected $hidden = ['password', 'resetPasswordOTP'];
    protected $appends = ['_id'];

    public function get_IdAttribute()
    {
        return (string)$this->attributes['_id'];
    }
}

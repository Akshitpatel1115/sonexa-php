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
        'username', 'email', 'password', 'role', 'status', 'avatar',
        'email_verified_at', 'last_login_at'
    ];
    protected $hidden = ['password'];
    protected $appends = ['_id'];

    public function get_IdAttribute()
    {
        return (string)$this->attributes['_id'];
    }

    public function authSecurity()
    {
        return $this->hasOne(AuthSecurity::class);
    }

    public function emailOtps()
    {
        return $this->hasMany(EmailOtp::class);
    }
}

<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Admin extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'admins';

    protected $fillable = [
        'name',
        'email',
        'password',
        'permissions',
        'is_active',
        'last_login_at'
    ];

    protected $hidden = [
        'password',
    ];

    protected $appends = ['_id'];

    public function get_IdAttribute()
    {
        return (string)$this->attributes['_id'];
    }
}

<?php
namespace App\Models;
use MongoDB\Laravel\Eloquent\Model;

class Music extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'musics';
    protected $fillable = ['uri', 'title', 'artist'];
    protected $appends = ['_id'];

    public function get_IdAttribute()
    {
        return (string)$this->attributes['_id'];
    }

    public function artistRef()
    {
        return $this->belongsTo(User::class, 'artist');
    }
}

<?php
namespace App\Models;
use MongoDB\Laravel\Eloquent\Model;

class Album extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'albums';
    protected $fillable = ['title', 'musics', 'artist', 'cover_img'];
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

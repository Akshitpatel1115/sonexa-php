<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class AuditLog extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'audit_logs';

    protected $fillable = [
        'admin_id',
        'action',
        'target_resource',
        'ip_address',
        'metadata' // Optional extra JSON payload
    ];

    protected $appends = ['_id'];

    public function get_IdAttribute()
    {
        return (string)$this->attributes['_id'];
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
}

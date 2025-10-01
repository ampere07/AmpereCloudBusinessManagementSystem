<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Port extends Model
{
    protected $table = 'port';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    
    protected $fillable = [
        'PORT_ID',
        'Label',
    ];

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'PORT', 'PORT_ID');
    }
}

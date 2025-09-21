<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Port extends Model
{
    protected $table = 'ports';
    protected $primaryKey = 'PORT_ID';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'PORT_ID',
        'Label',
    ];

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'PORT', 'PORT_ID');
    }
}

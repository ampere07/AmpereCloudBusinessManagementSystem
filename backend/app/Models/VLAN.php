<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VLAN extends Model
{
    protected $table = 'vlan';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    
    protected $fillable = [
        'VLAN_ID',
        'Value',
    ];

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'VLAN', 'VLAN_ID');
    }
}

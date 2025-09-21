<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VLAN extends Model
{
    protected $table = 'vlans';
    protected $primaryKey = 'VLAN_ID';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'VLAN_ID',
        'Value',
    ];

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'VLAN', 'VLAN_ID');
    }
}

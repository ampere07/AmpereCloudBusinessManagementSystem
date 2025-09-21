<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModemRouterSN extends Model
{
    protected $table = 'modem_router_sn';
    protected $primaryKey = 'SN';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'SN',
        'Model',
    ];

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'Modem_Router_SN', 'SN');
    }
}

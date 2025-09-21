<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LCPNAP extends Model
{
    protected $table = 'lcpnap';
    protected $primaryKey = 'LCPNAP_ID';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'LCPNAP_ID',
        'Combined_Location',
    ];

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'LCPNAP', 'LCPNAP_ID');
    }
}

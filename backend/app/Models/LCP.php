<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LCP extends Model
{
    protected $table = 'lcp';
    protected $primaryKey = 'LCP_ID';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'LCP_ID',
        'Name',
    ];

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'LCP', 'LCP_ID');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LCP extends Model
{
    protected $table = 'lcp';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    
    protected $fillable = [
        'LCP_ID',
        'Name',
    ];

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'LCP', 'LCP_ID');
    }
}

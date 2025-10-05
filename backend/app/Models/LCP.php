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
        'lcp_name',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    public function lcpnaps()
    {
        return $this->hasMany(LCPNAP::class, 'lcp_id');
    }

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'LCP', 'id');
    }
}

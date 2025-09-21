<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NAP extends Model
{
    protected $table = 'nap';
    protected $primaryKey = 'NAP_ID';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'NAP_ID',
        'Location',
    ];

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'NAP', 'NAP_ID');
    }
}

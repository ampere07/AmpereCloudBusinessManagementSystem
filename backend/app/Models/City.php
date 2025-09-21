<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $table = 'app_cities';
    
    protected $fillable = [
        'name',
        'region_id',
        'created_at',
        'updated_at'
    ];
    
    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id', 'id');
    }
    
    public function barangays()
    {
        return $this->hasMany(Barangay::class, 'city_id', 'id');
    }
}

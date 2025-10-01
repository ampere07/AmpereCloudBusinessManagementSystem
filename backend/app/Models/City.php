<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $table = 'city_list';
    
    protected $fillable = [
        'city',
        'region_id',
        'is_active'
    ];

    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    public function barangays()
    {
        return $this->hasMany(Barangay::class, 'city_id');
    }
}

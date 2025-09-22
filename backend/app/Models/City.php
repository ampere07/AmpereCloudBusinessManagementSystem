<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;
    
    protected $table = 'cities';
    
    protected $fillable = [
        'name',
        'region_id',
        'code',
        'description',
        'is_active',
        'created_at',
        'updated_at'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    
    protected $with = ['region'];
    
    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id', 'id');
    }
    
    public function barangays()
    {
        return $this->hasMany(Barangay::class, 'city_id', 'id');
    }
    
    public function activeBarangays()
    {
        return $this->hasMany(Barangay::class, 'city_id', 'id')->where('is_active', true);
    }
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

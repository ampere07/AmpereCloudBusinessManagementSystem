<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'region_id',
        'code',
        'name',
        'description',
        'is_active'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    
    protected $with = ['region'];
    
    public function region()
    {
        return $this->belongsTo(Region::class);
    }
    
    public function barangays()
    {
        return $this->hasMany(Barangay::class);
    }
    
    public function activeBarangays()
    {
        return $this->hasMany(Barangay::class)->where('is_active', true);
    }
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

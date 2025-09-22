<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'code',
        'name',
        'description',
        'is_active'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    
    public function cities()
    {
        return $this->hasMany(City::class);
    }
    
    public function activeCities()
    {
        return $this->hasMany(City::class)->where('is_active', true);
    }
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

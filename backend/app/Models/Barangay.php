<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'city_id',
        'code',
        'name',
        'description',
        'is_active'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    
    protected $with = ['city'];
    
    public function city()
    {
        return $this->belongsTo(City::class);
    }
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

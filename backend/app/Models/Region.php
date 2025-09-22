<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;
    
    protected $table = 'regions';
    
    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'created_at',
        'updated_at'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    
    public function cities()
    {
        return $this->hasMany(City::class, 'region_id', 'id');
    }
    
    public function activeCities()
    {
        return $this->hasMany(City::class, 'region_id', 'id')->where('is_active', true);
    }
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $table = 'app_regions';
    
    protected $fillable = [
        'name',
        'created_at',
        'updated_at'
    ];
    
    public function cities()
    {
        return $this->hasMany(City::class, 'region_id', 'id');
    }
}

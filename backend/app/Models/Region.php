<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $table = 'region_list';
    
    protected $fillable = [
        'region',
        'is_active'
    ];

    public function cities()
    {
        return $this->hasMany(City::class, 'region_id');
    }
}

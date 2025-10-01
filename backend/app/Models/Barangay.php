<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory;

    protected $table = 'barangay_list';
    
    protected $fillable = [
        'barangay',
        'city_id',
        'is_active'
    ];

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }
}

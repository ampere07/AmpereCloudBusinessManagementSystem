<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LCPNAP extends Model
{
    use HasFactory;
    
    protected $table = 'lcpnap';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;
    
    protected $fillable = [
        'lcpnap_name',
        'lcp_id',
        'nap_id',
    ];

    protected $casts = [
        'lcp_id' => 'integer',
        'nap_id' => 'integer',
    ];

    // Relationships
    public function lcp()
    {
        return $this->belongsTo(LCP::class, 'lcp_id');
    }

    public function nap()
    {
        return $this->belongsTo(NAP::class, 'nap_id');
    }
}

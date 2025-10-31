<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LCPNAPLocation extends Model
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

    protected $appends = [
        'lcp_name',
        'nap_name',
        'location_name',
        'latitude',
        'longitude',
        'lcp_nap_id'
    ];

    public function lcp()
    {
        return $this->belongsTo(LCP::class, 'lcp_id', 'id');
    }

    public function nap()
    {
        return $this->belongsTo(NAP::class, 'nap_id', 'id');
    }

    public function getLcpNameAttribute()
    {
        return $this->lcp ? $this->lcp->lcp_name : 'N/A';
    }

    public function getNapNameAttribute()
    {
        return $this->nap ? $this->nap->nap_name : 'N/A';
    }

    public function getLocationNameAttribute()
    {
        return $this->lcpnap_name;
    }

    public function getLcpNapIdAttribute()
    {
        return $this->id;
    }

    public function getLatitudeAttribute()
    {
        return '14.5995';
    }

    public function getLongitudeAttribute()
    {
        return '120.9842';
    }
}

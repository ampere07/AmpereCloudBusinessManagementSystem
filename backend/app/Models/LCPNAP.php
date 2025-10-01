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
    
    protected $fillable = [
        'LCPNAP_ID',
        'Combined_Location',
        'lcp',
        'nap',
        'port_total',
        'street',
        'barangay',
        'city',
        'region',
        'coordinates',
        'image',
        'image2',
        'reading_image',
        'modified_by',
        'modified_date',
    ];

    protected $casts = [
        'port_total' => 'integer',
        'modified_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'modified_date',
        'created_at',
        'updated_at'
    ];

    // Accessor to make it compatible with frontend expectations
    public function getIdAttribute()
    {
        return $this->LCPNAP_ID;
    }

    public function getLcpnapAttribute()
    {
        return $this->LCPNAP_ID;
    }

    public function getRelatedBillingDetailsAttribute()
    {
        return $this->Combined_Location;
    }

    // Relationships
    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class, 'LCPNAP', 'LCPNAP_ID');
    }

    // Accessors for image URLs
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/lcpnap/images/' . $this->image) : null;
    }

    public function getImage2UrlAttribute()
    {
        return $this->image2 ? asset('storage/lcpnap/images/' . $this->image2) : null;
    }

    public function getReadingImageUrlAttribute()
    {
        return $this->reading_image ? asset('storage/lcpnap/reading-images/' . $this->reading_image) : null;
    }

    // Scopes
    public function scopeByRegion($query, $region)
    {
        return $query->where('region', $region);
    }

    public function scopeByCity($query, $city)
    {
        return $query->where('city', $city);
    }

    public function scopeByPortTotal($query, $portTotal)
    {
        return $query->where('port_total', $portTotal);
    }

    // Mutators
    public function setModifiedByAttribute($value)
    {
        $this->attributes['modified_by'] = $value ?: 'system';
    }

    public function setModifiedDateAttribute($value)
    {
        $this->attributes['modified_date'] = $value ?: now();
    }
}

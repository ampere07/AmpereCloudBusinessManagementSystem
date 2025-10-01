<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $table = 'applications';
    
    // Disable Laravel's timestamp functionality
    public $timestamps = false;
    
    protected $fillable = [
        'create_date',
        'create_time',
        'update_date',
        'update_time',
        'email',
        'first_name',
        'middle_initial',
        'last_name',
        'mobile',
        'mobile_alt',
        'region_id',
        'city_id',
        'borough_id',
        'village_id',
        'address_line',
        'landmark',
        'nearest_landmark1',
        'nearest_landmark2',
        'plan_id',
        'promo_id',
        'proof_of_billing',
        'gov_id_primary',
        'gov_id_secondary',
        'house_front_pic',
        'room_pic',
        'primary_consent',
        'primary_consent_at',
        'source',
        'ip_address',
        'user_agent',
        'status',
        'portal_id',
        'group_id'
    ];
    
    /**
     * Get full customer name
     */
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->middle_initial . ' ' . $this->last_name);
    }
    
    /**
     * Get timestamp formatted as shown in the UI
     */
    public function getFormattedTimestampAttribute()
    {
        if (!$this->create_date || !$this->create_time) {
            return null;
        }
        
        return date('m/d/Y H:i:s', strtotime($this->create_date . ' ' . $this->create_time));
    }
}

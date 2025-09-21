<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationVisit extends Model
{
    protected $table = 'application_visits';
    
    protected $fillable = [
        'application_id',
        'assigned_email',
        'image1',
        'image2',
        'image3',
        'visit_by',
        'visit_with',
        'visit_with_other',
        'visit_status',
        'visit_remarks',
        'visit_notes',
        'first_name',
        'last_name',
        'middle_initial',
        'contact_number',
        'second_contact_number',
        'email_address',
        'address',
        'location',
        'barangay',
        'city',
        'region',
        'choose_plan',
        'barangay_id',
        'city_id',
        'region_id',
        'plan_id',
        'remarks',
        'installation_landmark',
        'application_status',
        'modified_by',
        'modified_date',
        'scheduled_date',
        'status_remarks',
        'referrer_account_number',
        'application_identifier',
        'house_front_picture',
        'group_id'
    ];
    
    protected $dates = [
        'modified_date',
        'scheduled_date',
        'created_at',
        'updated_at',
    ];
    
    /**
     * Get the application that owns the visit
     */
    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id', 'id');
    }
    
    /**
     * Get the group associated with the visit
     */
    public function group()
    {
        return $this->belongsTo(AppGroup::class, 'group_id', 'id');
    }
    
    /**
     * Get the barangay associated with the visit
     */
    public function barangay()
    {
        return $this->belongsTo(Barangay::class, 'barangay_id', 'id');
    }
    
    /**
     * Get the city associated with the visit
     */
    public function city()
    {
        return $this->belongsTo(City::class, 'city_id', 'id');
    }
    
    /**
     * Get the region associated with the visit
     */
    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id', 'id');
    }
    
    /**
     * Get the plan associated with the visit
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id', 'id');
    }
    
    /**
     * Set null for empty string values
     */
    public function setAttribute($key, $value)
    {
        // Convert empty strings to null
        if ($value === '') {
            $value = null;
        }
        
        return parent::setAttribute($key, $value);
    }
}

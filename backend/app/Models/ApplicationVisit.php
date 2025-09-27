<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationVisit extends Model
{
    protected $table = 'application_visit';
    
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'ID'; // Using the Pascal_Case column name
    
    protected $fillable = [
        'ID',
        'Timestamp',
        'Email_Address',
        'Referred_By',
        'First_Name',
        'Middle_Initial',
        'Last_Name',
        'Contact_Number',
        'Applicant_Email_Address',
        'Address',
        'Location',
        'Barangay',
        'City',
        'Region',
        'Choose_Plan',
        'Remarks',
        'Installation_Landmark',
        'Second_Contact_Number',
        'Assigned_Email',
        'Visit_By',
        'Visit_With',
        'Visit_With_Other',
        'Visit_Status',
        'Visit_Remarks',
        'Application_Status',
        'Modified_By',
        'Modified_Date',
        'Status_Remarks',
        'Application_ID',
        'barangay_id',
        'city_id',
        'region_id',
        'Scheduled_Date',
        'Visit_Type',
        'Visit_Notes',
        'Status'
    ];
    
    protected $dates = [
        'created_at',
        'updated_at',
        'Scheduled_Date',
        'Modified_Date'
    ];
    
    protected $casts = [
        'Scheduled_Date' => 'datetime',
        'Modified_Date' => 'datetime'
    ];
    
    /**
     * Get the application that owns the visit
     */
    public function application()
    {
        return $this->belongsTo(Application::class, 'Application_ID', 'id');
    }
}

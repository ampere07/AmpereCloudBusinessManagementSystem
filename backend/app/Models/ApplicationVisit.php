<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationVisit extends Model
{
    protected $table = 'application_visit';
    
    // Disable Laravel's automatic timestamps since we use custom fields
    public $timestamps = false;
    
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'ID';
    
    /**
     * The "type" of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';
    
    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;
    
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
        'Image_1',
        'Image_2',
        'Image_3',
        'Visit_By',
        'Visit_With',
        'Visit_With_Other',
        'Visit_Status',
        'Visit_Remarks',
        'Application_Status',
        'Modified_By',
        'Modified_Date',
        'Status_Remarks',
        'Referrers_Account_Number',
        'Application_ID',
        'House_Front_Picture'
    ];
    
    protected $dates = [];
    
    protected $casts = [];
    
    /**
     * Get the application that owns the visit
     */
    public function application()
    {
        return $this->belongsTo(Application::class, 'Application_ID', 'id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $table = 'app_applications';
    
    // Disable Laravel's timestamp functionality
    public $timestamps = false;
    
    // All actual columns from your database
    protected $fillable = [
        'Application_ID',
        'Timestamp',
        'Email_Address',
        'Region',
        'City',
        'Barangay',
        'Referred_by',
        'First_Name',
        'Middle_Initial',
        'Last_Name',
        'Mobile_Number',
        'Secondary_Mobile_Number',
        'Installation_Address',
        'Landmark',
        'Desired_Plan',
        'Proof_of_Billing',
        'Government_Valid_ID',
        '2nd_Government_Valid_ID',
        'House_Front_Picture',
        'I_agree_to_the_terms_and_conditions',
        'First_Nearest_landmark',
        'Second_Nearest_landmark',
        'Select_the_applicable_promo',
        'Attach_the_picture_of_your_document',
        'Attach_SOA_from_other_provider',
        'Status'
    ];
    
    // Map database column names to more convenient property names
    protected $casts = [
        'Application_ID' => 'string',
    ];
    
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'Application_ID';
    
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
    
    /**
     * Get full customer name
     */
    public function getFullNameAttribute()
    {
        return trim($this->First_Name . ' ' . ($this->Middle_Initial ? $this->Middle_Initial . ' ' : '') . $this->Last_Name);
    }
    
    /**
     * Get timestamp formatted as shown in the UI
     */
    public function getFormattedTimestampAttribute()
    {
        if (!$this->Timestamp) {
            return null;
        }
        
        return date('m/d/Y H:i:s', strtotime($this->Timestamp));
    }
}

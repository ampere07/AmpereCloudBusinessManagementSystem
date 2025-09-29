<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobOrder extends Model
{
    protected $table = 'job_orders';
    
    protected $fillable = [
        // Primary identifiers
        'Application_ID',
        
        // Timestamps
        'Timestamp',
        'StartTimeStamp',
        'EndTimeStamp',
        'Duration',
        'Date_Installed',
        'Modified_Date',
        
        // Personal Information
        'First_Name',
        'Middle_Initial',
        'Last_Name',
        'Contact_Number',
        'Second_Contact_Number',
        'Email_Address',
        'Applicant_Email_Address',
        
        // Address Information
        'Address',
        'Location',
        'Barangay',
        'City',
        'Region',
        'Installation_Landmark',
        'Coordinates',
        
        // Service Information
        'Choose_Plan',
        'Connection_Type',
        'Usage_Type',
        'Username',
        
        // Contract and Billing
        'Contract_Template',
        'Contract_Link',
        'Installation_Fee',
        'Billing_Day',
        'Preferred_Day',
        'Billing_Status',
        
        // Technical Information
        'Modem_Router_SN',
        'Router_Model',
        'LCP',
        'NAP',
        'PORT',
        'VLAN',
        'LCPNAP',
        'LCPNAPPORT',
        'Port',
        'Label',
        'IP',
        
        // Status Information
        'Status',
        'Onsite_Status',
        
        // Assignment and Tracking
        'Assigned_Email',
        'Visit_By',
        'Visit_With',
        'Visit_With_Other',
        'Referred_By',
        'Verified_By',
        'Modified_By',
        
        // Remarks and Notes
        'Remarks',
        'JO_Remarks',
        'Status_Remarks',
        'Onsite_Remarks',
        
        // Images and Documents
        'Setup_Image',
        'Speedtest_Image',
        'Client_Signature',
        'Signed_Contract_Image',
        'Box_Reading_Image',
        'Router_Reading_Image',
        'House_Front_Picture',
        'Image',
        
        // Additional Fields
        'Renter',
        'Installation',
        'Second',
        'Account_No',
        'Account_Number',
        'Referrers',
    ];

    protected $dates = [
        'Timestamp',
        'Modified_Date',
        'StartTimeStamp',
        'EndTimeStamp',
        'Date_Installed',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'Installation_Fee' => 'decimal:2',
        'Timestamp' => 'datetime',
        'Modified_Date' => 'datetime',
        'StartTimeStamp' => 'datetime',
        'EndTimeStamp' => 'datetime',
        'Date_Installed' => 'date',
    ];

    // Relationships
    public function application()
    {
        return $this->belongsTo(Application::class, 'Application_ID', 'id');
    }

    public function modemRouterSN()
    {
        return $this->belongsTo(ModemRouterSN::class, 'Modem_Router_SN', 'SN');
    }

    public function contractTemplate()
    {
        return $this->belongsTo(ContractTemplate::class, 'Contract_Template', 'Template_Name');
    }

    public function lcp()
    {
        return $this->belongsTo(LCP::class, 'LCP', 'LCP_ID');
    }
    
    // Accessor for LCP attribute to prevent direct property access issues
    public function getLcpAttribute($value)
    {
        return $value;
    }
    
    // Mutator for LCP attribute
    public function setLcpAttribute($value)
    {
        $this->attributes['LCP'] = $value;
    }

    public function nap()
    {
        return $this->belongsTo(NAP::class, 'NAP', 'NAP_ID');
    }

    public function port()
    {
        return $this->belongsTo(Port::class, 'PORT', 'PORT_ID');
    }

    public function vlan()
    {
        return $this->belongsTo(VLAN::class, 'VLAN', 'VLAN_ID');
    }

    public function lcpnap()
    {
        return $this->belongsTo(LCPNAP::class, 'LCPNAP', 'LCPNAP_ID');
    }
}

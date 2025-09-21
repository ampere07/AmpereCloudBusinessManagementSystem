<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobOrder extends Model
{
    protected $table = 'job_orders';
    
    protected $fillable = [
        'Application_ID',
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
        'Installation_Fee',
        'Contract_Template',
        'Billing_Day',
        'Preferred_Day',
        'JO_Remarks',
        'Status',
        'Verified_By',
        'Modem_Router_SN',
        'LCP',
        'NAP',
        'PORT',
        'VLAN',
        'Username',
        'Visit_By',
        'Visit_With',
        'Visit_With_Other',
        'Onsite_Status',
        'Onsite_Remarks',
        'Modified_By',
        'Modified_Date',
        'Contract_Link',
        'Connection_Type',
        'Assigned_Email',
        'Setup_Image',
        'Speedtest_Image',
        'StartTimeStamp',
        'EndTimeStamp',
        'Duration',
        'LCPNAP',
        'Billing_Status',
        'Router_Model',
        'Date_Installed',
        'Client_Signature',
        'IP',
        'Signed_Contract_Image',
        'Box_Reading_Image',
        'Router_Reading_Image',
        'Username_Status',
        'LCPNAPPORT',
        'Usage_Type',
        'Renter',
        'Installation_Landmark',
        'Status_Remarks',
        'Port_Label_Image',
        'Second_Contact_Number',
        'Account_No',
        'Address_Coordinates',
        'Referrers_Account_Number',
        'House_Front_Picture',
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

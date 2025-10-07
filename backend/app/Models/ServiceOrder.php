<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ServiceOrder extends Model
{
    /**
     * Specify the table name directly
     */
    protected $table = 'service_orders';
    
    protected $fillable = [
        'Ticket_ID',
        'Timestamp',
        'Account_Number',
        'Full_Name',
        'Contact_Address',
        'Date_Installed',
        'Contact_Number',
        'Full_Address',
        'House_Front_Picture',
        'Email_Address',
        'Plan',
        'Provider',
        'Username',
        'Connection_Type',
        'Router_Modem_SN',
        'LCP',
        'NAP',
        'PORT',
        'VLAN',
        'Concern',
        'Concern_Remarks',
        'Visit_Status',
        'Visit_By',
        'Visit_With',
        'Visit_With_Other',
        'Visit_Remarks',
        'Modified_By',
        'Modified_Date',
        'User_Email',
        'Requested_By',
        'Assigned_Email',
        'Support_Remarks',
        'Service_Charge',
        'Repair_Category',
        'Support_Status',
    ];
    
    protected $dates = [
        'Timestamp',
        'Date_Installed',
        'Modified_Date',
        'created_at',
        'updated_at',
    ];
    
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Relationship to Application
     */
    public function application()
    {
        return $this->belongsTo(Application::class, 'Account_Number', 'id');
    }
}

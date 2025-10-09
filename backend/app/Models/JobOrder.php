<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobOrder extends Model
{
    protected $table = 'job_orders';
    
    protected $fillable = [
        'application_id',
        'account_id',
        'timestamp',
        'date_installed',
        'installation_fee',
        'billing_day',
        'billing_status_id',
        'modem_router_sn',
        'router_model',
        'group_id',
        'lcpnap',
        'port',
        'vlan',
        'username',
        'ip_address',
        'connection_type',
        'usage_type_id',
        'username_status',
        'visit_by_user_id',
        'visit_by_user_email',
        'visit_with',
        'onsite_status',
        'assigned_email',
        'status_remarks',
        'onsite_remarks',
        'status_remarks_id',
        'contract_link',
        'client_signature_url',
        'setup_image_url',
        'speedtest_image_url',
        'signed_contract_image_url',
        'box_reading_image_url',
        'router_reading_image_url',
        'port_label_image_url',
        'house_front_picture_url',
        'created_by_user_id',
        'created_by_user_email',
        'updated_by_user_id',
        'updated_by_user_email',
    ];

    protected $dates = [
        'timestamp',
        'date_installed',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'installation_fee' => 'decimal:2',
        'timestamp' => 'datetime',
        'date_installed' => 'date',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id', 'id');
    }
}

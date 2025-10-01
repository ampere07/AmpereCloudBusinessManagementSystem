<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $table = 'applications';
    
    protected $primaryKey = 'id';
    public $timestamps = true;
    
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';
    
    protected $fillable = [
        'timestamp',
        'email_address',
        'first_name',
        'middle_initial',
        'last_name',
        'mobile_number',
        'secondary_mobile_number',
        'installation_address',
        'landmark',
        'region',
        'city',
        'barangay',
        'village',
        'desired_plan',
        'promo',
        'referrer_account_id',
        'referred_by',
        'proof_of_billing_url',
        'government_valid_id_url',
        'second_government_valid_id_url',
        'house_front_picture_url',
        'document_attachment_url',
        'other_isp_bill_url',
        'terms_agreed',
        'status',
        'created_by_user_id',
        'updated_by_user_id'
    ];
    
    protected $casts = [
        'id' => 'integer',
        'timestamp' => 'datetime',
        'terms_agreed' => 'boolean',
        'referrer_account_id' => 'integer',
        'created_by_user_id' => 'integer',
        'updated_by_user_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
    
    public function getFullNameAttribute()
    {
        return trim(
            $this->first_name . ' ' . 
            ($this->middle_initial ? $this->middle_initial . ' ' : '') . 
            $this->last_name
        );
    }
    
    public function getFormattedTimestampAttribute()
    {
        if (!$this->timestamp) {
            return null;
        }
        
        return $this->timestamp->format('m/d/Y H:i:s');
    }
}

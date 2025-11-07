<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    protected $table = 'discounts';

    protected $fillable = [
        'account_id',
        'discount_amount',
        'status',
        'remaining',
        'remarks',
        'invoice_used_id',
        'used_date',
        'created_by_user_id',
        'updated_by_user_id'
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'remaining' => 'integer',
        'used_date' => 'datetime'
    ];

    public function billingAccount()
    {
        return $this->belongsTo(BillingAccount::class, 'account_id');
    }
}

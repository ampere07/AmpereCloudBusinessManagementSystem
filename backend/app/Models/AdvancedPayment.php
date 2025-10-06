<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdvancedPayment extends Model
{
    protected $table = 'advanced_payments';

    protected $fillable = [
        'account_id',
        'account_no',
        'payment_amount',
        'payment_month',
        'payment_date',
        'status',
        'invoice_used_id',
        'remarks',
        'created_by_user_id',
        'updated_by_user_id'
    ];

    protected $casts = [
        'payment_amount' => 'decimal:2',
        'payment_date' => 'date'
    ];

    public function billingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'account_id');
    }

    public function invoiceUsed(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_used_id');
    }
}

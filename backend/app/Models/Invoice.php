<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $table = 'invoices';

    protected $fillable = [
        'account_id',
        'invoice_date',
        'invoice_balance',
        'others_and_basic_charges',
        'total_amount',
        'received_payment',
        'due_date',
        'status',
        'payment_portal_log_ref',
        'transaction_id',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'invoice_date' => 'datetime',
        'due_date' => 'datetime',
        'invoice_balance' => 'decimal:2',
        'others_and_basic_charges' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'received_payment' => 'decimal:2'
    ];

    public function billingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'account_id');
    }
}

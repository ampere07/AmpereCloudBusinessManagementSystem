<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatementOfAccount extends Model
{
    protected $table = 'statement_of_accounts';

    protected $fillable = [
        'account_id',
        'statement_date',
        'balance_from_previous_bill',
        'payment_received_previous',
        'remaining_balance_previous',
        'monthly_service_fee',
        'others_and_basic_charges',
        'vat',
        'due_date',
        'amount_due',
        'total_amount_due',
        'print_link',
        'created_by_user_id',
        'updated_by_user_id'
    ];

    protected $casts = [
        'statement_date' => 'datetime',
        'due_date' => 'datetime',
        'balance_from_previous_bill' => 'decimal:2',
        'payment_received_previous' => 'decimal:2',
        'remaining_balance_previous' => 'decimal:2',
        'monthly_service_fee' => 'decimal:2',
        'others_and_basic_charges' => 'decimal:2',
        'vat' => 'decimal:2',
        'amount_due' => 'decimal:2',
        'total_amount_due' => 'decimal:2'
    ];

    public function billingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'account_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }
}

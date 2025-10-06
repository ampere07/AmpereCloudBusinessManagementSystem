<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Installment extends Model
{
    protected $table = 'installments';

    protected $fillable = [
        'account_id',
        'start_date',
        'total_balance',
        'months_to_pay',
        'monthly_payment',
        'status',
        'remarks',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'start_date' => 'date',
        'total_balance' => 'decimal:2',
        'monthly_payment' => 'decimal:2',
        'months_to_pay' => 'integer'
    ];

    public function billingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'account_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(InstallmentSchedule::class);
    }

    public function paidSchedules(): HasMany
    {
        return $this->hasMany(InstallmentSchedule::class)->where('status', 'paid');
    }

    public function pendingSchedules(): HasMany
    {
        return $this->hasMany(InstallmentSchedule::class)->where('status', 'pending');
    }
}

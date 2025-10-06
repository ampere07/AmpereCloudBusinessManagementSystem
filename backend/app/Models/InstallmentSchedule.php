<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstallmentSchedule extends Model
{
    protected $table = 'installment_schedules';

    protected $fillable = [
        'installment_id',
        'invoice_id',
        'installment_no',
        'due_date',
        'amount',
        'status',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'due_date' => 'date',
        'amount' => 'decimal:2',
        'installment_no' => 'integer'
    ];

    public function installment(): BelongsTo
    {
        return $this->belongsTo(Installment::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}

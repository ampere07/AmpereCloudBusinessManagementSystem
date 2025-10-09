<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StatusRemarksList extends Model
{
    use HasFactory;

    protected $table = 'status_remarks_list';

    protected $fillable = [
        'status_remarks',
        'modified_date',
        'modified_by'
    ];

    protected $casts = [
        'modified_date' => 'datetime',
    ];

    public $timestamps = false;
}

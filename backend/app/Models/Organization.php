<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $table = 'organizations';
    public $incrementing = false; // Disable auto-incrementing
    protected $keyType = 'int'; // Specify key type

    protected $fillable = [
        'organization_name',
        'address',
        'contact_number',
        'email_address',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'org_id', 'id');
    }
}

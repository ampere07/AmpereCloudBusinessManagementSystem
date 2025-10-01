<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $table = 'organizations';
    public $incrementing = true; // Enable auto-incrementing
    protected $keyType = 'int'; // Specify key type

    protected $fillable = [
        'org_id',
        'org_name',
        'org_type',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'org_id', 'org_id');
    }

    public function groups()
    {
        return $this->hasMany(Group::class, 'org_id', 'org_id');
    }

    public static function generateOrgId()
    {
        do {
            $orgId = random_int(10000000, 99999999);
        } while (self::where('org_id', $orgId)->exists());
        
        return $orgId;
    }
}

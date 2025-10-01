<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $table = 'roles';

    protected $fillable = [
        'role_id',
        'role_name',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles', 'role_id', 'user_id');
    }

    public static function generateRoleId()
    {
        do {
            $roleId = random_int(10000000, 99999999);
        } while (self::where('role_id', $roleId)->exists());
        
        return $roleId;
    }
}

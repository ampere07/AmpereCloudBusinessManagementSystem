<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'id';
    protected $table = 'users';

    protected $fillable = [
        'user_id',
        'salutation',
        'full_name',
        'username',
        'email',
        'mobile_number',
        'password_hash',
        'org_id',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function setPasswordHashAttribute($value)
    {
        $this->attributes['password_hash'] = Hash::make($value);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id', 'org_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'user_groups', 'user_id', 'group_id');
    }

    public static function generateUserId()
    {
        $maxAttempts = 100;
        $attempts = 0;
        
        do {
            $attempts++;
            $userId = random_int(10000000, 99999999);
            
            // Prevent infinite loops
            if ($attempts > $maxAttempts) {
                throw new \Exception('Unable to generate unique user ID after ' . $maxAttempts . ' attempts');
            }
        } while (self::where('user_id', $userId)->exists());
        
        // Ensure we never return 0 or negative numbers
        if ($userId <= 0) {
            throw new \Exception('Generated user ID is invalid: ' . $userId);
        }
        
        return $userId;
    }
}

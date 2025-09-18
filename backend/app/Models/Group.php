<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $primaryKey = 'group_id';
    protected $table = 'groups';
    public $incrementing = false; // Disable auto-incrementing
    protected $keyType = 'int'; // Specify key type

    protected $fillable = [
        'group_id',
        'group_name',
        'org_id',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id', 'org_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_groups', 'group_id', 'user_id');
    }

    public static function generateGroupId()
    {
        do {
            $groupId = random_int(10000000, 99999999);
        } while (self::where('group_id', $groupId)->exists());
        
        return $groupId;
    }
}

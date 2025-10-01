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
        'group_name',
        'fb_page_link',
        'fb_messenger_link',
        'template',
        'company_name',
        'portal_url',
        'hotline',
        'email',
        'modified_by_user_id',
        'modified_date',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'group_id', 'id');
    }
}

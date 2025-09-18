<?php

namespace App\Services;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Exception;

class DatabaseService
{
    public static function ensureTablesExist()
    {
        try {
            // Create tables in correct order to handle foreign key dependencies
            self::createOrganizationsTable();
            self::createRolesTable();
            self::createUsersTable();
            self::createGroupsTable();
            self::createUserRolesTable();
            self::createUserGroupsTable();
            self::createActivityLogsTable();
            
            return ['success' => true, 'message' => 'All tables ensured to exist'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to create tables: ' . $e->getMessage()];
        }
    }

    private static function seedDefaultAdminUser()
    {
        if (!Schema::hasTable('users') || !Schema::hasTable('organizations') || !Schema::hasTable('roles')) {
            return;
        }

        try {
            // Check if admin user already exists
            $existingAdmin = DB::table('users')->where('email', 'admin@ampere.com')->first();
            if ($existingAdmin) {
                return; // Admin user already exists
            }

            // Generate unique user ID
            do {
                $userId = random_int(10000000, 99999999);
            } while (DB::table('users')->where('user_id', $userId)->exists());

            // Create admin user
            $adminUserId = DB::table('users')->insertGetId([
                'user_id' => $userId,
                'salutation' => 'Mr',
                'full_name' => 'System Administrator',
                'username' => 'admin',
                'email' => 'admin@ampere.com',
                'mobile_number' => null,
                'password_hash' => \Hash::make('admin123'),
                'org_id' => 10000001,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Assign Administrator role to admin user
            DB::table('user_roles')->updateOrInsert(
                ['user_id' => $userId, 'role_id' => 20000001],
                ['created_at' => now(), 'updated_at' => now()]
            );

        } catch (Exception $e) {
            // Skip if error occurs
            return;
        }
    }

    private static function createActivityLogsTable()
    {
        if (!Schema::hasTable('activity_logs')) {
            Schema::create('activity_logs', function (Blueprint $table) {
                $table->id('log_id');
                $table->string('level')->default('info');
                $table->string('action');
                $table->text('message');
                $table->integer('user_id')->nullable();
                $table->integer('target_user_id')->nullable();
                $table->string('resource_type')->nullable();
                $table->integer('resource_id')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->string('user_agent')->nullable();
                $table->json('additional_data')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'created_at']);
                $table->index(['action', 'created_at']);
                $table->index(['resource_type', 'resource_id']);
            });
        }
    }

    private static function createOrganizationsTable()
    {
        if (!Schema::hasTable('organizations')) {
            Schema::create('organizations', function (Blueprint $table) {
                $table->integer('org_id')->primary();
                $table->string('org_name');
                $table->string('org_type');
                $table->timestamps();
            });
        }
    }

    private static function createRolesTable()
    {
        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->integer('role_id')->primary();
                $table->string('role_name')->unique();
                $table->timestamps();
            });
        }
    }

    private static function createUsersTable()
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->integer('user_id')->primary();
                $table->string('salutation', 10)->nullable();
                $table->string('full_name');
                $table->string('username')->unique();
                $table->string('email')->unique();
                $table->string('mobile_number', 20)->nullable();
                $table->string('password_hash');
                $table->integer('org_id')->nullable();
                $table->rememberToken();
                $table->timestamps();
                
                // Add foreign key constraint only if organizations table exists
                if (Schema::hasTable('organizations')) {
                    $table->foreign('org_id')->references('org_id')->on('organizations')->onDelete('set null');
                }
            });
        }
    }

    private static function createGroupsTable()
    {
        if (!Schema::hasTable('groups')) {
            Schema::create('groups', function (Blueprint $table) {
                $table->integer('group_id')->primary();
                $table->string('group_name');
                $table->integer('org_id');
                $table->timestamps();
                
                // Add foreign key constraint only if organizations table exists
                if (Schema::hasTable('organizations')) {
                    $table->foreign('org_id')->references('org_id')->on('organizations')->onDelete('cascade');
                }
            });
        }
    }

    private static function createUserRolesTable()
    {
        if (!Schema::hasTable('user_roles')) {
            Schema::create('user_roles', function (Blueprint $table) {
                $table->integer('user_id');
                $table->integer('role_id');
                $table->timestamps();
                
                $table->primary(['user_id', 'role_id']);
                
                // Add foreign key constraints only if referenced tables exist
                if (Schema::hasTable('users')) {
                    $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
                }
                if (Schema::hasTable('roles')) {
                    $table->foreign('role_id')->references('role_id')->on('roles')->onDelete('cascade');
                }
            });
        }
    }

    private static function createUserGroupsTable()
    {
        if (!Schema::hasTable('user_groups')) {
            Schema::create('user_groups', function (Blueprint $table) {
                $table->integer('user_id');
                $table->integer('group_id');
                $table->timestamps();
                
                $table->primary(['user_id', 'group_id']);
                
                // Add foreign key constraints only if referenced tables exist
                if (Schema::hasTable('users')) {
                    $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
                }
                if (Schema::hasTable('groups')) {
                    $table->foreign('group_id')->references('group_id')->on('groups')->onDelete('cascade');
                }
            });
        }
    }

    public static function seedDefaultData()
    {
        try {
            self::seedDefaultOrganizations();
            self::seedDefaultRoles();
            self::seedDefaultAdminUser();
            
            return ['success' => true, 'message' => 'Default data seeded successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to seed data: ' . $e->getMessage()];
        }
    }

    private static function seedDefaultOrganizations()
    {
        if (!Schema::hasTable('organizations')) {
            return;
        }

        $organizations = [
            ['org_id' => 10000001, 'org_name' => 'Default Organization', 'org_type' => 'Company'],
            ['org_id' => 10000002, 'org_name' => 'System Organization', 'org_type' => 'System'],
        ];

        foreach ($organizations as $org) {
            try {
                DB::table('organizations')->updateOrInsert(
                    ['org_id' => $org['org_id']],
                    array_merge($org, ['created_at' => now(), 'updated_at' => now()])
                );
            } catch (Exception $e) {
                // Skip if already exists or other error
                continue;
            }
        }
    }

    private static function seedDefaultRoles()
    {
        if (!Schema::hasTable('roles')) {
            return;
        }

        $roles = [
            ['role_id' => 20000001, 'role_name' => 'Administrator'],
            ['role_id' => 20000002, 'role_name' => 'Manager'],
            ['role_id' => 20000003, 'role_name' => 'User'],
            ['role_id' => 20000004, 'role_name' => 'Guest'],
        ];

        foreach ($roles as $role) {
            try {
                DB::table('roles')->updateOrInsert(
                    ['role_id' => $role['role_id']],
                    array_merge($role, ['created_at' => now(), 'updated_at' => now()])
                );
            } catch (Exception $e) {
                // Skip if already exists or other error
                continue;
            }
        }
    }

    public static function checkTableStatus()
    {
        $tables = ['organizations', 'roles', 'users', 'groups', 'user_roles', 'user_groups', 'activity_logs'];
        $status = [];
        
        foreach ($tables as $table) {
            try {
                $status[$table] = Schema::hasTable($table);
            } catch (Exception $e) {
                $status[$table] = false;
            }
        }
        
        return $status;
    }
}

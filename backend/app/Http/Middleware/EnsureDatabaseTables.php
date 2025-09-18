<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use App\Services\DatabaseService;
use Illuminate\Support\Facades\Log;

class EnsureDatabaseTables
{
    public function handle(Request $request, Closure $next)
    {
        try {
            // Check if the main tables exist
            $requiredTables = ['organizations', 'roles', 'users', 'groups', 'activity_logs'];
            $missingTables = [];
            
            foreach ($requiredTables as $table) {
                if (!Schema::hasTable($table)) {
                    $missingTables[] = $table;
                }
            }
            
            // If any tables are missing, create all tables
            if (!empty($missingTables)) {
                Log::info('Missing database tables detected: ' . implode(', ', $missingTables) . '. Creating tables...');
                
                $result = DatabaseService::ensureTablesExist();
                
                if ($result['success']) {
                    Log::info('Database tables created successfully');
                    
                    // Also seed default data
                    $seedResult = DatabaseService::seedDefaultData();
                    if ($seedResult['success']) {
                        Log::info('Default data seeded successfully');
                    }
                } else {
                    Log::error('Failed to create database tables: ' . $result['message']);
                    return response()->json([
                        'success' => false,
                        'message' => 'Database initialization failed',
                        'error' => $result['message']
                    ], 500);
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Database middleware error: ' . $e->getMessage());
            
            // Continue with request even if check fails
            // This prevents the middleware from breaking the entire application
        }

        return $next($request);
    }
}

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SetupController;
use App\Http\Controllers\LogsController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\JobOrderController;
use App\Http\Controllers\ApplicationVisitController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\DebugController;
use App\Http\Controllers\EmergencyLocationController;
use App\Models\User;
use App\Services\ActivityLogService;

// Authentication endpoints
Route::post('/login', function (Request $request) {
    $identifier = $request->input('email');
    $password = $request->input('password');
    
    if (!$identifier || !$password) {
        return response()->json([
            'status' => 'error',
            'message' => 'Email/username and password are required'
        ], 400);
    }
    
    try {
        // Find user by email_address or username
        $user = User::where('email_address', $identifier)
                   ->orWhere('username', $identifier)
                   ->with(['organization', 'role', 'group'])
                   ->first();
        
        if (!$user) {
            // Log failed login attempt
            ActivityLogService::loginAttemptFailed($identifier, $request->ip());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }
        
        // Verify password
        if (!Hash::check($password, $user->password_hash)) {
            ActivityLogService::loginAttemptFailed($identifier, $request->ip());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }
        
        // Successful login
        ActivityLogService::userLogin($user->user_id, $user->username);
        
        // Get user role for response
        $primaryRole = $user->role ? $user->role->role_name : 'User';
        
        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'user_id' => $user->user_id,
                    'username' => $user->username,
                    'email' => $user->email_address,
                    'full_name' => $user->full_name,
                    'salutation' => $user->salutation,
                    'mobile_number' => $user->mobile_number,
                    'role' => $primaryRole,
                    'group' => $user->group,
                    'organization' => $user->organization ? [
                        'org_id' => $user->organization->org_id,
                        'org_name' => $user->organization->org_name,
                        'org_type' => $user->organization->org_type
                    ] : null
                ],
                'token' => 'user_token_' . $user->user_id . '_' . time()
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Login failed',
            'error' => 'An error occurred during authentication'
        ], 500);
    }
});

Route::post('/forgot-password', function (Request $request) {
    $email = $request->input('email');
    
    if (!$email) {
        return response()->json([
            'status' => 'error',
            'message' => 'Email is required'
        ], 400);
    }
    
    return response()->json([
        'status' => 'success',
        'message' => 'Password reset instructions have been sent to your email.'
    ]);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API is running',
        'data' => [
            'server' => 'Laravel ' . app()->version(),
            'timestamp' => now()->toISOString()
        ]
    ]);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// User Management Routes
Route::prefix('users')->middleware('ensure.database.tables')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::put('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
    Route::post('/{id}/roles', [UserController::class, 'assignRole']);
    Route::delete('/{id}/roles', [UserController::class, 'removeRole']);
    Route::post('/{id}/groups', [UserController::class, 'assignGroup']);
    Route::delete('/{id}/groups', [UserController::class, 'removeGroup']);
});

// Organization Management Routes
Route::prefix('organizations')->middleware('ensure.database.tables')->group(function () {
    Route::get('/', [OrganizationController::class, 'index']);
    Route::post('/', [OrganizationController::class, 'store']);
    Route::get('/{id}', [OrganizationController::class, 'show']);
    Route::put('/{id}', [OrganizationController::class, 'update']);
    Route::delete('/{id}', [OrganizationController::class, 'destroy']);
});

// Database diagnostic endpoint
Route::get('/debug/organizations', function () {
    try {
        // Check if table exists
        $tableExists = \Illuminate\Support\Facades\Schema::hasTable('organizations');
        
        if (!$tableExists) {
            return response()->json([
                'success' => false,
                'message' => 'Organizations table does not exist',
                'table_exists' => false
            ]);
        }
        
        // Get column information
        $columns = \Illuminate\Support\Facades\Schema::getColumnListing('organizations');
        
        // Try to get organizations
        $organizations = \App\Models\Organization::all();
        
        return response()->json([
            'success' => true,
            'message' => 'Organizations table exists',
            'table_exists' => true,
            'columns' => $columns,
            'count' => $organizations->count(),
            'data' => $organizations
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error checking organizations',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Group Management Routes
Route::prefix('groups')->middleware('ensure.database.tables')->group(function () {
    Route::get('/', [GroupController::class, 'index']);
    Route::post('/', [GroupController::class, 'store']);
    Route::get('/{id}', [GroupController::class, 'show']);
    Route::put('/{id}', [GroupController::class, 'update']);
    Route::delete('/{id}', [GroupController::class, 'destroy']);
    Route::get('/organization/{orgId}', [GroupController::class, 'getByOrganization']);
});

// Role Management Routes
Route::prefix('roles')->middleware('ensure.database.tables')->group(function () {
    Route::get('/', [RoleController::class, 'index']);
    Route::post('/', [RoleController::class, 'store']);
    Route::get('/{id}', [RoleController::class, 'show']);
    Route::put('/{id}', [RoleController::class, 'update']);
    Route::delete('/{id}', [RoleController::class, 'destroy']);
});

// Database Setup Routes
Route::prefix('setup')->group(function () {
    Route::post('/initialize', [SetupController::class, 'initializeDatabase']);
    Route::get('/status', [SetupController::class, 'checkDatabaseStatus']);
});

// Logs Management Routes
Route::prefix('logs')->middleware('ensure.database.tables')->group(function () {
    Route::get('/', [LogsController::class, 'index']);
    Route::get('/stats', [LogsController::class, 'getStats']);
    Route::get('/export', [LogsController::class, 'export']);
    Route::get('/{id}', [LogsController::class, 'show']);
    Route::delete('/clear', [LogsController::class, 'clear']);
});

// Applications Management Routes - Temporarily removed middleware
Route::prefix('applications')->group(function () {
    Route::get('/', [ApplicationController::class, 'index']);
    Route::post('/', [ApplicationController::class, 'store']);
    Route::get('/{id}', [ApplicationController::class, 'show']);
    Route::put('/{id}', [ApplicationController::class, 'update']);
    Route::delete('/{id}', [ApplicationController::class, 'destroy']);
});

// Job Orders Management Routes
Route::prefix('job-orders')->middleware('ensure.database.tables')->group(function () {
    Route::get('/', [JobOrderController::class, 'index']);
    Route::post('/', [JobOrderController::class, 'store']);
    Route::get('/{id}', [JobOrderController::class, 'show']);
    Route::put('/{id}', [JobOrderController::class, 'update']);
    Route::delete('/{id}', [JobOrderController::class, 'destroy']);
    
    // Lookup table endpoints
    Route::get('/lookup/modem-router-sns', [JobOrderController::class, 'getModemRouterSNs']);
    Route::get('/lookup/contract-templates', [JobOrderController::class, 'getContractTemplates']);
    Route::get('/lookup/lcps', [JobOrderController::class, 'getLCPs']);
    Route::get('/lookup/naps', [JobOrderController::class, 'getNAPs']);
    Route::get('/lookup/ports', [JobOrderController::class, 'getPorts']);
    Route::get('/lookup/vlans', [JobOrderController::class, 'getVLANs']);
    Route::get('/lookup/lcpnaps', [JobOrderController::class, 'getLCPNAPs']);
});

// Application Visits Management Routes
Route::prefix('application-visits')->middleware('ensure.database.tables')->group(function () {
    Route::get('/', [ApplicationVisitController::class, 'index']);
    Route::post('/', [ApplicationVisitController::class, 'store']);
    Route::get('/{id}', [ApplicationVisitController::class, 'show']);
    Route::put('/{id}', [ApplicationVisitController::class, 'update']);
    Route::delete('/{id}', [ApplicationVisitController::class, 'destroy']);
    Route::get('/application/{applicationId}', [ApplicationVisitController::class, 'getByApplication']);
});

// Location Management Routes - New centralized system
// IMPORTANT: Remove the middleware that might be blocking this
Route::prefix('locations')->group(function () {
    // Test endpoint
    Route::get('/test', function () {
        return response()->json([
            'success' => true,
            'message' => 'Location API is working',
            'timestamp' => now()
        ]);
    });
    
    // Debug endpoint for locations/all route
    Route::get('/all-debug', function () {
        try {
            $controller = new \App\Http\Controllers\LocationController();
            return $controller->getAllLocations();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Debug error: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    });
    
    // Debug route to log all requests and trace route matching
    Route::post('/locations/debug', function(Request $request) {
        \Illuminate\Support\Facades\Log::info('[LocationDebug] Debug route hit', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'payload' => $request->all(),
            'headers' => $request->headers->all()
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Debug route working',
            'data' => [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'path' => $request->path(),
                'payload' => $request->all()
            ]
        ]);
    });

    // Direct API endpoints that match the frontend requests
    Route::get('/all', [LocationController::class, 'getAllLocations']);
    Route::get('/regions', [LocationController::class, 'getRegions']);
    Route::get('/regions/{regionId}/cities', [LocationController::class, 'getCitiesByRegion']);
    Route::get('/cities/{cityId}/barangays', [LocationController::class, 'getBarangaysByCity']);
    
    // Region routes - explicit path for frontend compatibility
    Route::post('/regions', [\App\Http\Controllers\Api\LocationApiController::class, 'addRegion']);
    
    // City routes - explicit path for frontend compatibility
    Route::post('/cities', [\App\Http\Controllers\Api\LocationApiController::class, 'addCity']);
    
    // Barangay routes - explicit path for frontend compatibility
    Route::post('/barangays', [\App\Http\Controllers\Api\LocationApiController::class, 'addBarangay']);
    
    // General location routes
    Route::get('/statistics', [\App\Http\Controllers\Api\LocationApiController::class, 'getStatistics']);
    Route::put('/{type}/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'updateLocation']);
    Route::delete('/{type}/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'deleteLocation']);
    
    // Specific update/delete routes for frontend compatibility
    Route::put('/region/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'updateLocation']);
    Route::put('/city/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'updateLocation']);
    Route::put('/barangay/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'updateLocation']);
    Route::delete('/region/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'deleteLocation']);
    Route::delete('/city/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'deleteLocation']);
    Route::delete('/barangay/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'deleteLocation']);
    
    // Legacy routes (keep for compatibility)
    Route::get('/', [LocationController::class, 'index']);
    Route::post('/', [LocationController::class, 'store']);
    Route::get('/stats', [LocationController::class, 'getStats']);
    Route::get('/type/{type}', [LocationController::class, 'getByType']);
    Route::get('/parent/{parentId}', [LocationController::class, 'getChildren']);
    Route::get('/{id}', [LocationController::class, 'show']);
    Route::put('/{id}', [LocationController::class, 'update']);
    Route::delete('/{id}', [LocationController::class, 'destroy']);
    Route::patch('/{id}/toggle-status', [LocationController::class, 'toggleStatus']);
});

Route::prefix('city_list')->group(function () {
    Route::get('/', [CityController::class, 'index']);
    Route::get('/{id}', [CityController::class, 'show']);
    Route::get('/region/{regionId}', [CityController::class, 'getByRegion']);
});

Route::prefix('region_list')->group(function () {
    Route::get('/', [RegionController::class, 'index']);
    Route::get('/{id}', [RegionController::class, 'show']);
});

// Plan Management Routes - Using app_plans table
Route::prefix('plans')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\PlanApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\PlanApiController::class, 'store']);
    Route::get('/all', [\App\Http\Controllers\Api\PlanApiController::class, 'getAllPlans']);
    Route::get('/statistics', [\App\Http\Controllers\Api\PlanApiController::class, 'getStatistics']);
    Route::get('/{id}', [\App\Http\Controllers\Api\PlanApiController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\PlanApiController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\PlanApiController::class, 'destroy']);
    Route::post('/{id}/restore', [\App\Http\Controllers\Api\PlanApiController::class, 'restore']);
    Route::delete('/{id}/force', [\App\Http\Controllers\Api\PlanApiController::class, 'forceDelete']);
});

// Router Models Management Routes - Using Router_Models table
Route::prefix('router-models')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\RouterModelApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\RouterModelApiController::class, 'store']);
    Route::get('/statistics', [\App\Http\Controllers\Api\RouterModelApiController::class, 'getStatistics']);
    Route::get('/{model}', [\App\Http\Controllers\Api\RouterModelApiController::class, 'show']);
    Route::put('/{model}', [\App\Http\Controllers\Api\RouterModelApiController::class, 'update']);
    Route::delete('/{model}', [\App\Http\Controllers\Api\RouterModelApiController::class, 'destroy']);
});

// Inventory Management Routes - Using Inventory table
Route::prefix('inventory')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\InventoryApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\InventoryApiController::class, 'store']);
    Route::get('/debug', [\App\Http\Controllers\Api\InventoryApiController::class, 'debug']);
    Route::get('/statistics', [\App\Http\Controllers\Api\InventoryApiController::class, 'getStatistics']);
    Route::get('/categories', [\App\Http\Controllers\Api\InventoryApiController::class, 'getCategories']);
    Route::get('/suppliers', [\App\Http\Controllers\Api\InventoryApiController::class, 'getSuppliers']);
    Route::get('/{itemName}', [\App\Http\Controllers\Api\InventoryApiController::class, 'show']);
    Route::put('/{itemName}', [\App\Http\Controllers\Api\InventoryApiController::class, 'update']);
    Route::delete('/{itemName}', [\App\Http\Controllers\Api\InventoryApiController::class, 'destroy']);
});

// LCP Management Routes - Using app_lcp table
Route::prefix('lcp')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\LcpApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\LcpApiController::class, 'store']);
    Route::get('/statistics', [\App\Http\Controllers\Api\LcpApiController::class, 'getStatistics']);
    Route::get('/{id}', [\App\Http\Controllers\Api\LcpApiController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\LcpApiController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\LcpApiController::class, 'destroy']);
});

// NAP Management Routes - Using app_nap table
Route::prefix('nap')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\NapApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\NapApiController::class, 'store']);
    Route::get('/statistics', [\App\Http\Controllers\Api\NapApiController::class, 'getStatistics']);
    Route::get('/{id}', [\App\Http\Controllers\Api\NapApiController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\NapApiController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\NapApiController::class, 'destroy']);
});

// LCP NAP List Management Routes - Using lcpnap table
Route::prefix('lcp-nap-list')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\LCPNAPApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\LCPNAPApiController::class, 'store']);
    Route::get('/statistics', [\App\Http\Controllers\Api\LCPNAPApiController::class, 'getStatistics']);
    Route::get('/lookup', [\App\Http\Controllers\Api\LCPNAPApiController::class, 'getLookupData']);
    Route::get('/{id}', [\App\Http\Controllers\Api\LCPNAPApiController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\LCPNAPApiController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\LCPNAPApiController::class, 'destroy']);
});

// Basic Cities endpoint for simple data (fallback)
Route::prefix('cities')->group(function () {
    Route::get('/', function () {
        // Return basic city data for Philippines regions
        return response()->json([
            ['id' => 1, 'region_id' => 1, 'name' => 'Binangonan'],
            ['id' => 2, 'region_id' => 1, 'name' => 'Tagpos'],
            ['id' => 3, 'region_id' => 1, 'name' => 'Tatala'],
            ['id' => 4, 'region_id' => 1, 'name' => 'Pantok'],
            ['id' => 5, 'region_id' => 1, 'name' => 'Manila']
        ]);
    });
});
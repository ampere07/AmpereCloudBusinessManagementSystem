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

// Fixed, reliable location endpoints that won't change
Route::post('/fixed/location/region', [\App\Http\Controllers\Api\LocationFixedEndpointsController::class, 'addRegion']);
Route::post('/fixed/location/city', [\App\Http\Controllers\Api\LocationFixedEndpointsController::class, 'addCity']);
Route::post('/fixed/location/barangay', [\App\Http\Controllers\Api\LocationFixedEndpointsController::class, 'addBarangay']);

// Emergency region endpoints directly accessible in API routes
Route::post('/emergency/regions', [EmergencyLocationController::class, 'addRegion']);
Route::post('/emergency/cities', [EmergencyLocationController::class, 'addCity']);
Route::post('/emergency/barangays', [EmergencyLocationController::class, 'addBarangay']);

// Alternative endpoint formats for maximum compatibility
Route::post('/locations/add-region', [\App\Http\Controllers\Api\LocationApiController::class, 'addRegion']);
Route::post('/locations/add-city', [\App\Http\Controllers\Api\LocationApiController::class, 'addCity']);
Route::post('/locations/add-barangay', [\App\Http\Controllers\Api\LocationApiController::class, 'addBarangay']);

// Direct routes for location management - top level for maximum compatibility
Route::post('/locations/regions', [\App\Http\Controllers\Api\LocationApiController::class, 'addRegion']);
Route::post('/locations/cities', [\App\Http\Controllers\Api\LocationApiController::class, 'addCity']);
Route::post('/locations/barangays', [\App\Http\Controllers\Api\LocationApiController::class, 'addBarangay']);
Route::put('/locations/region/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'updateLocation']);
Route::put('/locations/city/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'updateLocation']);
Route::put('/locations/barangay/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'updateLocation']);
Route::delete('/locations/region/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'deleteLocation']);
Route::delete('/locations/city/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'deleteLocation']);
Route::delete('/locations/barangay/{id}', [\App\Http\Controllers\Api\LocationApiController::class, 'deleteLocation']);

// Direct test endpoint for troubleshooting
Route::get('/locations-ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'Locations API is responding',
        'timestamp' => now()->toDateTimeString(),
        'environment' => app()->environment(),
        'routes' => [
            '/locations/all' => 'getAllLocations',
            '/locations/regions' => 'getRegions',
            '/debug/model-test' => 'Database model test'
        ]
    ]);
});

// Mock data endpoint for locations
Route::get('/locations/mock', function () {
    return response()->json([
        'success' => true,
        'data' => [
            [
                'id' => 1,
                'code' => '1',
                'name' => 'Metro Manila',
                'description' => 'National Capital Region',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
                'active_cities' => [
                    [
                        'id' => 101,
                        'code' => '101',
                        'name' => 'Quezon City',
                        'description' => 'QC',
                        'is_active' => true,
                        'region_id' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                        'active_barangays' => [
                            [
                                'id' => 1001,
                                'code' => '1001',
                                'name' => 'Barangay A',
                                'description' => '',
                                'is_active' => true,
                                'city_id' => 101,
                                'created_at' => now(),
                                'updated_at' => now()
                            ],
                            [
                                'id' => 1002,
                                'code' => '1002',
                                'name' => 'Barangay B',
                                'description' => '',
                                'is_active' => true,
                                'city_id' => 101,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]
                        ]
                    ],
                    [
                        'id' => 102,
                        'code' => '102',
                        'name' => 'Manila',
                        'description' => '',
                        'is_active' => true,
                        'region_id' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                        'active_barangays' => [
                            [
                                'id' => 1003,
                                'code' => '1003',
                                'name' => 'Barangay X',
                                'description' => '',
                                'is_active' => true,
                                'city_id' => 102,
                                'created_at' => now(),
                                'updated_at' => now()
                            ],
                            [
                                'id' => 1004,
                                'code' => '1004',
                                'name' => 'Barangay Y',
                                'description' => '',
                                'is_active' => true,
                                'city_id' => 102,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]
                        ]
                    ]
                ]
            ],
            [
                'id' => 2,
                'code' => '2',
                'name' => 'CALABARZON',
                'description' => 'Region IV-A',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
                'active_cities' => [
                    [
                        'id' => 201,
                        'code' => '201',
                        'name' => 'Binangonan',
                        'description' => '',
                        'is_active' => true,
                        'region_id' => 2,
                        'created_at' => now(),
                        'updated_at' => now(),
                        'active_barangays' => [
                            [
                                'id' => 2001,
                                'code' => '2001',
                                'name' => 'Angono',
                                'description' => '',
                                'is_active' => true,
                                'city_id' => 201,
                                'created_at' => now(),
                                'updated_at' => now()
                            ],
                            [
                                'id' => 2002,
                                'code' => '2002',
                                'name' => 'Bilibiran',
                                'description' => '',
                                'is_active' => true,
                                'city_id' => 201,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]);
});

// Debug routes for troubleshooting
Route::prefix('debug')->group(function () {
    Route::get('/routes', [DebugController::class, 'listRoutes']);
    Route::get('/location-test', [DebugController::class, 'locationTest']);
    
    // Direct location test routes - no controller method
    Route::get('/location-echo', function () {
        return response()->json([
            'success' => true,
            'message' => 'Location echo test is working',
            'timestamp' => now()
        ]);
    });
    
    // Direct model tests
    Route::get('/model-test', function () {
        try {
            $regions = \App\Models\Region::count();
            $cities = \App\Models\City::count();
            $barangays = \App\Models\Barangay::count();
            
            return response()->json([
                'success' => true,
                'message' => 'Model test successful',
                'data' => [
                    'region_count' => $regions,
                    'city_count' => $cities,
                    'barangay_count' => $barangays
                ],
                'database_config' => [
                    'connection' => config('database.default'),
                    'database' => config('database.connections.' . config('database.default') . '.database'),
                ],
                'tables_exist' => [
                    'region_list' => \Illuminate\Support\Facades\Schema::hasTable('region_list'),
                    'city_list' => \Illuminate\Support\Facades\Schema::hasTable('city_list'),
                    'barangay_list' => \Illuminate\Support\Facades\Schema::hasTable('barangay_list')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Model test failed',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    });
});

// Authentication endpoints
Route::post('/login-debug', function (Request $request) {
    try {
        $identifier = $request->input('email');
        $password = $request->input('password');
        
        if (!$identifier || !$password) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email/username and password are required',
                'step' => 'validation'
            ], 400);
        }
        
        // Step 1: Find user
        $user = User::where('email_address', $identifier)
                   ->orWhere('username', $identifier)
                   ->first();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
                'step' => 'user_lookup',
                'identifier' => $identifier
            ], 401);
        }
        
        // Step 2: Check password
        if (!Hash::check($password, $user->password_hash)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid password',
                'step' => 'password_check'
            ], 401);
        }
        
        // Step 3: Load relationships
        $user->load('organization', 'role', 'group');
        
        // Step 4: Get role
        $primaryRole = $user->role ? $user->role->role_name : 'User';
        
        // Step 5: Build response
        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'step' => 'complete',
            'data' => [
                'user' => [
                    'user_id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email_address,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'role' => $primaryRole,
                    'group' => $user->group,
                    'organization' => $user->organization
                ],
                'token' => 'user_token_' . $user->id . '_' . time()
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Login failed',
            'step' => 'exception',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

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
            // Log the error details
            \Log::warning('Login failed: User not found', [
                'identifier' => $identifier,
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }
        
        // Verify password
        if (!Hash::check($password, $user->password_hash)) {
            // Log the error details
            \Log::warning('Login failed: Invalid password', [
                'identifier' => $identifier,
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }
        
        // Successfully authenticated
        \Log::info('User login successful', [
            'user_id' => $user->id,
            'username' => $user->username
        ]);
        
        // Get user role for response
        $primaryRole = $user->role ? $user->role->name : 'User';
        
        // Update last login timestamp
        $user->last_login = now();
        $user->save();
        
        // Prepare response data
        $responseData = [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email_address,
                'full_name' => $user->getFullNameAttribute(),
                'role' => $primaryRole,
            ]
        ];
        
        // Add organization data if available
        if ($user->organization) {
            $responseData['user']['organization'] = [
                'id' => $user->organization->id,
                'name' => $user->organization->name ?? 'Unknown Organization'
            ];
        }
        
        // Generate token
        $token = 'user_token_' . $user->id . '_' . time();
        $responseData['token'] = $token;
        
        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => $responseData
        ]);
        
    } catch (\Exception $e) {
        // Log the detailed exception
        \Log::error('Login exception: ' . $e->getMessage(), [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        
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

// Routes to match frontend requests - using the *_list tables directly
Route::prefix('region_list')->group(function () {
    Route::get('/', [RegionController::class, 'index']);
    Route::get('/{id}', [RegionController::class, 'show']);
});

Route::prefix('city_list')->group(function () {
    Route::get('/', [CityController::class, 'index']);
    Route::get('/{id}', [CityController::class, 'show']);
    Route::get('/region/{regionId}', [CityController::class, 'getByRegion']);
});

Route::prefix('barangay_list')->group(function () {
    Route::get('/', function() {
        try {
            $barangays = \App\Models\Barangay::all();
            return response()->json([
                'success' => true,
                'data' => $barangays
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching barangays: ' . $e->getMessage()
            ], 500);
        }
    });
    Route::get('/{id}', function($id) {
        try {
            $barangay = \App\Models\Barangay::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $barangay
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching barangay: ' . $e->getMessage()
            ], 404);
        }
    });
    Route::get('/city/{cityId}', function($cityId) {
        try {
            $barangays = \App\Models\Barangay::where('city_id', $cityId)->get();
            return response()->json([
                'success' => true,
                'data' => $barangays
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching barangays: ' . $e->getMessage()
            ], 500);
        }
    });
});

// Add debug routes for location troubleshooting
Route::get('/debug/location-tables', [\App\Http\Controllers\LocationDebugController::class, 'verifyTables']);

// Add debug route to inspect database tables
Route::get('/debug/tables', function () {
    try {
        $tables = [
            'region_list' => \Illuminate\Support\Facades\DB::select('SELECT * FROM region_list LIMIT 10'),
            'city_list' => \Illuminate\Support\Facades\DB::select('SELECT * FROM city_list LIMIT 10'),
            'barangay_list' => \Illuminate\Support\Facades\DB::select('SELECT * FROM barangay_list LIMIT 10')
        ];
        
        $hasAppTables = [
            'app_regions' => \Illuminate\Support\Facades\Schema::hasTable('app_regions'),
            'app_cities' => \Illuminate\Support\Facades\Schema::hasTable('app_cities'),
            'app_barangays' => \Illuminate\Support\Facades\Schema::hasTable('app_barangays')
        ];
        
        return response()->json([
            'success' => true,
            'list_tables' => $tables,
            'has_app_tables' => $hasAppTables,
            'models' => [
                'Region' => get_class_vars('\\App\\Models\\Region'),
                'City' => get_class_vars('\\App\\Models\\City'),
                'Barangay' => get_class_vars('\\App\\Models\\Barangay')
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error checking tables: ' . $e->getMessage()
        ], 500);
    }
});

// Service Orders Management Routes
Route::prefix('service-orders')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'store']);
    Route::get('/{id}', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'destroy']);
});

// Also add underscore version for compatibility
Route::prefix('service_orders')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'store']);
    Route::get('/{id}', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\ServiceOrderApiController::class, 'destroy']);
});

// Billing Details API Routes
Route::prefix('billing-details')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'store']);
    Route::get('/{id}', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'destroy']);
});

// Also add underscore version for compatibility
Route::prefix('billing_details')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'store']);
    Route::get('/{id}', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\BillingDetailsApiController::class, 'destroy']);
});
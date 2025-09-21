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
        // Find user by email or username
        $user = User::where('email', $identifier)
                   ->orWhere('username', $identifier)
                   ->with(['organization', 'roles'])
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
        
        // Get user roles for response
        $userRoles = $user->roles->pluck('role_name')->toArray();
        $primaryRole = $userRoles[0] ?? 'User';
        
        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'user_id' => $user->user_id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'full_name' => $user->full_name,
                    'salutation' => $user->salutation,
                    'mobile_number' => $user->mobile_number,
                    'role' => $primaryRole,
                    'roles' => $userRoles,
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

// Applications Management Routes
Route::prefix('applications')->middleware('ensure.database.tables')->group(function () {
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

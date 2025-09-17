<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;

// Authentication endpoints
Route::post('/login', function (Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');
    
    // Simple authentication logic
    if ($email === 'admin@ampere.com' && $password === 'admin123') {
        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'email' => $email,
                    'name' => 'Administrator',
                    'role' => 'admin'
                ],
                'token' => 'sample_token_' . time()
            ]
        ]);
    }
    
    return response()->json([
        'status' => 'error',
        'message' => 'Invalid credentials'
    ], 401);
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

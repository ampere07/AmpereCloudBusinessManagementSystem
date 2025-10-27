<?php

namespace App\Http\Controllers;

use App\Models\CustomAccountNumber;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CustomAccountNumberController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $customNumber = CustomAccountNumber::first();
            
            if (!$customNumber) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'No custom account number configured'
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $customNumber
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching custom account number', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch custom account number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $existingCount = CustomAccountNumber::count();
            if ($existingCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'A custom account number already exists. Please update or delete the existing one.'
                ], 400);
            }

            $validator = Validator::make($request->all(), [
                'starting_number' => [
                    'required',
                    'string',
                    'min:6',
                    'max:9',
                    'regex:/^[A-Za-z0-9]+$/'
                ],
                'user_email' => 'nullable|email|max:255'
            ], [
                'starting_number.required' => 'Starting number is required',
                'starting_number.min' => 'Starting number must be at least 6 characters',
                'starting_number.max' => 'Starting number must not exceed 9 characters',
                'starting_number.regex' => 'Starting number must contain only letters and numbers'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userEmail = $request->input('user_email', 'unknown@user.com');

            Log::info('Creating custom account number', [
                'starting_number' => $request->input('starting_number'),
                'updated_by' => $userEmail
            ]);

            $customNumber = CustomAccountNumber::create([
                'starting_number' => $request->input('starting_number'),
                'updated_by' => $userEmail
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Custom account number created successfully',
                'data' => $customNumber
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating custom account number', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create custom account number',
                'error' => $e->getMessage(),
                'details' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    public function update(Request $request): JsonResponse
    {
        try {
            $customNumber = CustomAccountNumber::first();
            
            if (!$customNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Custom account number not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'starting_number' => [
                    'required',
                    'string',
                    'min:6',
                    'max:9',
                    'regex:/^[A-Za-z0-9]+$/'
                ],
                'user_email' => 'nullable|email|max:255'
            ], [
                'starting_number.required' => 'Starting number is required',
                'starting_number.min' => 'Starting number must be at least 6 characters',
                'starting_number.max' => 'Starting number must not exceed 9 characters',
                'starting_number.regex' => 'Starting number must contain only letters and numbers'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userEmail = $request->input('user_email', 'unknown@user.com');
            $newStartingNumber = $request->input('starting_number');

            Log::info('Updating custom account number', [
                'old_starting_number' => $customNumber->starting_number,
                'new_starting_number' => $newStartingNumber,
                'updated_by' => $userEmail
            ]);

            $customNumber->delete();

            $updatedNumber = CustomAccountNumber::create([
                'starting_number' => $newStartingNumber,
                'updated_by' => $userEmail
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Custom account number updated successfully',
                'data' => $updatedNumber
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating custom account number', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update custom account number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(): JsonResponse
    {
        try {
            $customNumber = CustomAccountNumber::first();
            
            if (!$customNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Custom account number not found'
                ], 404);
            }

            Log::info('Deleting custom account number', [
                'starting_number' => $customNumber->starting_number
            ]);

            $customNumber->delete();

            return response()->json([
                'success' => true,
                'message' => 'Custom account number deleted successfully',
                'data' => null
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting custom account number', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete custom account number',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

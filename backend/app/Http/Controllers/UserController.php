<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Services\ActivityLogService;

class UserController extends Controller
{
    public function index()
    {
        try {
            $users = User::with(['organization', 'roles', 'groups'])->get();
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'salutation' => 'nullable|string|max:10|in:Mr,Ms,Mrs,Dr,Prof',
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'mobile_number' => 'nullable|string|max:20|regex:/^[+]?[0-9\s\-\(\)]+$/',
            'password' => 'required|string|min:8',
            'org_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate user ID with proper error handling
            $userId = User::generateUserId();
            
            $userData = [
                'user_id' => $userId,
                'salutation' => $request->salutation,
                'full_name' => $request->full_name,
                'username' => $request->username,
                'email' => $request->email,
                'mobile_number' => $request->mobile_number,
                'password_hash' => $request->password,
                'org_id' => $request->org_id && $request->org_id > 0 ? $request->org_id : null,
            ];
            
            $user = User::create($userData);
            
            if (!$user) {
                throw new \Exception('Failed to create user');
            }

            // Try to log user creation activity (but don't fail if logging fails)
            try {
                ActivityLogService::userCreated(
                    null, // For now, no authenticated user
                    $user,
                    ['created_by' => 'system']
                );
            } catch (\Exception $logError) {
                \Log::warning('Failed to log user creation activity: ' . $logError->getMessage());
            }
            
            $responseUser = $user->load(['organization']);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $responseUser
            ], 201);
        } catch (\Exception $e) {
            \Log::error('User creation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = User::with(['organization', 'roles', 'groups'])->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        // Validate the user ID first
        if (!$id || $id <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid user ID provided',
                'error' => 'User ID must be a positive integer'
            ], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'salutation' => 'sometimes|string|max:10|in:Mr,Ms,Mrs,Dr,Prof',
            'full_name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,' . $id . ',user_id',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id . ',user_id',
            'mobile_number' => 'sometimes|string|max:20|regex:/^[+]?[0-9\s\-\(\)]+$/',
            'password' => 'sometimes|string|min:8',
            'org_id' => 'sometimes|nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($id);
            
            $oldData = $user->toArray();
            $updateData = $request->only(['salutation', 'full_name', 'username', 'email', 'mobile_number', 'org_id']);
            if ($request->has('password')) {
                $updateData['password_hash'] = $request->password;
            }
            
            // Handle org_id properly - ensure it's null if not provided or 0
            if (array_key_exists('org_id', $updateData)) {
                $updateData['org_id'] = $updateData['org_id'] && $updateData['org_id'] > 0 ? $updateData['org_id'] : null;
            }
            
            // Remove empty values to avoid unnecessary updates
            $updateData = array_filter($updateData, function($value, $key) {
                return $value !== null && $value !== '' && $key !== 'org_id';
            }, ARRAY_FILTER_USE_BOTH);
            
            // Add org_id back if it was in the request (even if null)
            if ($request->has('org_id')) {
                $updateData['org_id'] = $request->org_id && $request->org_id > 0 ? $request->org_id : null;
            }

            $user->update($updateData);

            // Try to log user update activity (but don't fail if logging fails)
            try {
                $changes = array_diff_assoc($updateData, $oldData);
                ActivityLogService::userUpdated(
                    null, // For now, no authenticated user
                    $user,
                    $changes
                );
            } catch (\Exception $logError) {
                \Log::warning('Failed to log user update activity: ' . $logError->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user->load(['organization'])
            ]);
        } catch (\Exception $e) {
            \Log::error('User update failed for ID ' . $id . ': ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $username = $user->username;
            $user->delete();

            // Try to log user deletion activity (but don't fail if logging fails)
            try {
                ActivityLogService::userDeleted(
                    null, // For now, no authenticated user
                    $id,
                    $username
                );
            } catch (\Exception $logError) {
                \Log::warning('Failed to log user deletion activity: ' . $logError->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function assignRole(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|integer|exists:roles,role_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($userId);
            $user->roles()->attach($request->role_id);

            return response()->json([
                'success' => true,
                'message' => 'Role assigned successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function removeRole(Request $request, $userId)
    {
        // Handle both query parameter and request body
        $roleId = $request->query('role_id') ?: $request->input('role_id');
        
        $validator = Validator::make(['role_id' => $roleId], [
            'role_id' => 'required|integer|exists:roles,role_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($userId);
            $user->roles()->detach($roleId);

            return response()->json([
                'success' => true,
                'message' => 'Role removed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function assignGroup(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'group_id' => 'required|integer|exists:groups,group_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($userId);
            $user->groups()->attach($request->group_id);

            return response()->json([
                'success' => true,
                'message' => 'Group assigned successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function removeGroup(Request $request, $userId)
    {
        // Handle both query parameter and request body
        $groupId = $request->query('group_id') ?: $request->input('group_id');
        
        $validator = Validator::make(['group_id' => $groupId], [
            'group_id' => 'required|integer|exists:groups,group_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($userId);
            $user->groups()->detach($groupId);

            return response()->json([
                'success' => true,
                'message' => 'Group removed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove group',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

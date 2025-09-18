<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\ActivityLogService;

class OrganizationController extends Controller
{
    public function index()
    {
        try {
            $organizations = Organization::with(['users', 'groups'])->get();
            return response()->json([
                'success' => true,
                'data' => $organizations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch organizations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'org_name' => 'required|string|max:255',
            'org_type' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $organization = Organization::create([
                'org_id' => Organization::generateOrgId(),
                'org_name' => $request->org_name,
                'org_type' => $request->org_type,
            ]);

            // Try to log organization creation activity (but don't fail if logging fails)
            try {
                ActivityLogService::organizationCreated(
                    null, // For now, no authenticated user
                    $organization,
                    ['created_by' => 'system']
                );
            } catch (\Exception $logError) {
                \Log::warning('Failed to log organization creation activity: ' . $logError->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Organization created successfully',
                'data' => $organization
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create organization',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $organization = Organization::with(['users', 'groups'])->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $organization
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Organization not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'org_name' => 'sometimes|string|max:255',
            'org_type' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $organization = Organization::findOrFail($id);
            $oldData = $organization->toArray();
            $organization->update($request->only(['org_name', 'org_type']));

            // Try to log organization update activity (but don't fail if logging fails)
            try {
                $changes = array_diff_assoc($request->only(['org_name', 'org_type']), $oldData);
                ActivityLogService::organizationUpdated(
                    null, // For now, no authenticated user
                    $organization,
                    $changes
                );
            } catch (\Exception $logError) {
                \Log::warning('Failed to log organization update activity: ' . $logError->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Organization updated successfully',
                'data' => $organization
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update organization',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $organization = Organization::findOrFail($id);
            $orgName = $organization->org_name;
            $organization->delete();

            // Try to log organization deletion activity (but don't fail if logging fails)
            try {
                ActivityLogService::organizationDeleted(
                    null, // For now, no authenticated user
                    $id,
                    $orgName
                );
            } catch (\Exception $logError) {
                \Log::warning('Failed to log organization deletion activity: ' . $logError->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Organization deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete organization',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

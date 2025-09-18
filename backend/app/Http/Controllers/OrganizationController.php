<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            $organization->update($request->only(['org_name', 'org_type']));

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
            $organization->delete();

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

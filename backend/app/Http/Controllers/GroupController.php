<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GroupController extends Controller
{
    public function index()
    {
        try {
            $groups = Group::with(['organization', 'users'])->get();
            return response()->json([
                'success' => true,
                'data' => $groups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'group_name' => 'required|string|max:255',
            'org_id' => 'required|integer|exists:organizations,org_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $group = Group::create([
                'group_id' => Group::generateGroupId(),
                'group_name' => $request->group_name,
                'org_id' => $request->org_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Group created successfully',
                'data' => $group->load(['organization'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $group = Group::with(['organization', 'users'])->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $group
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'group_name' => 'sometimes|string|max:255',
            'org_id' => 'sometimes|integer|exists:organizations,org_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $group = Group::findOrFail($id);
            $group->update($request->only(['group_name', 'org_id']));

            return response()->json([
                'success' => true,
                'message' => 'Group updated successfully',
                'data' => $group->load(['organization'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $group = Group::findOrFail($id);
            $group->delete();

            return response()->json([
                'success' => true,
                'message' => 'Group deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getByOrganization($orgId)
    {
        try {
            $groups = Group::where('org_id', $orgId)->with(['users'])->get();
            return response()->json([
                'success' => true,
                'data' => $groups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

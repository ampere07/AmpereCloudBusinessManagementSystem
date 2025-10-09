<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VLAN;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VlanApiController extends Controller
{
    private function getCurrentUser()
    {
        return 'ravenampere0123@gmail.com';
    }

    public function index(Request $request)
    {
        try {
            $page = (int) $request->get('page', 1);
            $limit = min((int) $request->get('limit', 10), 100);
            $search = $request->get('search', '');
            
            $query = VLAN::query();
            
            if (!empty($search)) {
                $query->where('Value', 'like', '%' . $search . '%')
                      ->orWhere('VLAN_ID', 'like', '%' . $search . '%');
            }
            
            $totalItems = $query->count();
            $totalPages = ceil($totalItems / $limit);
            
            $vlanItems = $query->orderBy('Value')
                             ->skip(($page - 1) * $limit)
                             ->take($limit)
                             ->get();
            
            return response()->json([
                'success' => true,
                'data' => $vlanItems,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $totalItems,
                    'items_per_page' => $limit,
                    'has_next' => $page < $totalPages,
                    'has_prev' => $page > 1
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('VLAN API Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching VLAN items: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'value' => 'required|string|max:255',
                'vlan_id' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $value = $request->input('value');
            $vlanId = $request->input('vlan_id');
            
            $existing = VLAN::where('VLAN_ID', $vlanId)->first();
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'A VLAN with this VLAN_ID already exists'
                ], 422);
            }
            
            $vlan = new VLAN();
            $vlan->VLAN_ID = $vlanId;
            $vlan->Value = $value;
            $vlan->save();
            
            return response()->json([
                'success' => true,
                'message' => 'VLAN added successfully',
                'data' => $vlan
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('VLAN Store Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error adding VLAN: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $vlan = VLAN::find($id);
            
            if (!$vlan) {
                return response()->json([
                    'success' => false,
                    'message' => 'VLAN not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $vlan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching VLAN: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'value' => 'required|string|max:255',
                'vlan_id' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $vlan = VLAN::find($id);
            if (!$vlan) {
                return response()->json([
                    'success' => false,
                    'message' => 'VLAN not found'
                ], 404);
            }
            
            $value = $request->input('value');
            $vlanId = $request->input('vlan_id');
            
            $duplicate = VLAN::where('VLAN_ID', $vlanId)->where('id', '!=', $id)->first();
            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => 'A VLAN with this VLAN_ID already exists'
                ], 422);
            }
            
            $vlan->VLAN_ID = $vlanId;
            $vlan->Value = $value;
            $vlan->save();
            
            return response()->json([
                'success' => true,
                'message' => 'VLAN updated successfully',
                'data' => $vlan
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating VLAN: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $vlan = VLAN::find($id);
            if (!$vlan) {
                return response()->json([
                    'success' => false,
                    'message' => 'VLAN not found'
                ], 404);
            }
            
            $vlan->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'VLAN permanently deleted from database'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting VLAN: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getStatistics()
    {
        try {
            $totalVlan = VLAN::count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_vlan' => $totalVlan
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}

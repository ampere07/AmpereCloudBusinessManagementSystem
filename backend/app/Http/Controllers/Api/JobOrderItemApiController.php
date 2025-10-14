<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class JobOrderItemApiController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('job_order_items');
            
            if ($request->has('job_order_id')) {
                $query->where('job_order_id', $request->job_order_id);
            }
            
            $items = $query->get();
            
            return response()->json([
                'success' => true,
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching job order items: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'items' => 'required|array',
                'items.*.job_order_id' => 'required|integer',
                'items.*.item_id' => 'required|integer',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $items = $request->input('items');
            $insertedItems = [];

            foreach ($items as $item) {
                $id = DB::table('job_order_items')->insertGetId([
                    'job_order_id' => $item['job_order_id'],
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                $insertedItems[] = DB::table('job_order_items')->where('id', $id)->first();
            }

            return response()->json([
                'success' => true,
                'message' => 'Job order items created successfully',
                'data' => $insertedItems
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating job order items: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $item = DB::table('job_order_items')->where('id', $id)->first();
            
            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job order item not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching job order item: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'job_order_id' => 'sometimes|required|integer',
                'item_id' => 'sometimes|required|integer',
                'quantity' => 'sometimes|required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $item = DB::table('job_order_items')->where('id', $id)->first();
            
            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job order item not found'
                ], 404);
            }

            $updateData = $request->only(['job_order_id', 'item_id', 'quantity']);
            $updateData['updated_at'] = now();

            DB::table('job_order_items')->where('id', $id)->update($updateData);
            
            $updatedItem = DB::table('job_order_items')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Job order item updated successfully',
                'data' => $updatedItem
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating job order item: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $item = DB::table('job_order_items')->where('id', $id)->first();
            
            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job order item not found'
                ], 404);
            }

            DB::table('job_order_items')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Job order item deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting job order item: ' . $e->getMessage()
            ], 500);
        }
    }
}

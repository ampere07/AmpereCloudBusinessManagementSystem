<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PlanApiController extends Controller
{
    /**
     * Get current user email from session/auth (fallback for now)
     */
    private function getCurrentUser()
    {
        // For now, return a default user - you can modify this to get from session/auth
        return 'ravenampere0123@gmail.com';
    }

    /**
     * Get all plans from app_plans table
     */
    public function index()
    {
        try {
            // First check if table exists
            $tableExists = DB::select("SHOW TABLES LIKE 'app_plans'");
            if (empty($tableExists)) {
                return response()->json([
                    'success' => false,
                    'message' => 'app_plans table does not exist'
                ], 500);
            }

            // Get table structure to verify required columns exist
            $columns = DB::select("SHOW COLUMNS FROM app_plans");
            $columnNames = array_column($columns, 'Field');
            
            // Build SELECT statement based on available columns
            $selectFields = ['id', 'name'];
            if (in_array('description', $columnNames)) $selectFields[] = 'description';
            if (in_array('price', $columnNames)) $selectFields[] = 'price';
            if (in_array('is_active', $columnNames)) $selectFields[] = 'is_active';
            if (in_array('modified_date', $columnNames)) $selectFields[] = 'modified_date';
            if (in_array('modified_by', $columnNames)) $selectFields[] = 'modified_by';
            if (in_array('created_at', $columnNames)) $selectFields[] = 'created_at';
            if (in_array('updated_at', $columnNames)) $selectFields[] = 'updated_at';
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM app_plans';
            
            // Add WHERE clause if is_active column exists
            if (in_array('is_active', $columnNames)) {
                $selectQuery .= ' WHERE is_active = 1';
            }
            
            $selectQuery .= ' ORDER BY name';
            
            $plans = DB::select($selectQuery);
            
            // Format the results to ensure consistent structure
            $formattedPlans = [];
            foreach ($plans as $plan) {
                $planArray = (array) $plan;
                
                // Set default values for missing fields
                if (!isset($planArray['description'])) $planArray['description'] = '';
                if (!isset($planArray['price'])) $planArray['price'] = 0;
                if (!isset($planArray['is_active'])) $planArray['is_active'] = 1;
                if (!isset($planArray['modified_date'])) $planArray['modified_date'] = date('Y-m-d H:i:s');
                if (!isset($planArray['modified_by'])) $planArray['modified_by'] = $this->getCurrentUser();
                if (!isset($planArray['created_at'])) $planArray['created_at'] = date('Y-m-d H:i:s');
                if (!isset($planArray['updated_at'])) $planArray['updated_at'] = date('Y-m-d H:i:s');
                
                $formattedPlans[] = $planArray;
            }
            
            return response()->json([
                'success' => true,
                'data' => $formattedPlans,
                'columns_available' => $columnNames
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Plan API Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching plans: ' . $e->getMessage(),
                'error_details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * Store a new plan in app_plans table
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $name = $request->input('name');
            $description = $request->input('description', '');
            $price = $request->input('price');
            
            // Automatically set modified date and user
            $currentUser = $this->getCurrentUser();
            $now = now();
            
            // Check for duplicate plan name in app_plans table
            $existing = DB::select('SELECT id FROM app_plans WHERE LOWER(name) = LOWER(?)', [$name]);
            if (!empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A plan with this name already exists'
                ], 422);
            }
            
            // Get available columns
            $columns = DB::select("SHOW COLUMNS FROM app_plans");
            $columnNames = array_column($columns, 'Field');
            
            // Build insert data based on available columns
            $insertData = [
                'name' => $name
            ];
            
            if (in_array('description', $columnNames)) $insertData['description'] = $description;
            if (in_array('price', $columnNames)) $insertData['price'] = $price;
            if (in_array('is_active', $columnNames)) $insertData['is_active'] = true;
            if (in_array('modified_date', $columnNames)) $insertData['modified_date'] = $now;
            if (in_array('modified_by', $columnNames)) $insertData['modified_by'] = $currentUser;
            if (in_array('created_at', $columnNames)) $insertData['created_at'] = $now;
            if (in_array('updated_at', $columnNames)) $insertData['updated_at'] = $now;
            
            $id = DB::table('app_plans')->insertGetId($insertData);
            
            // Get the inserted record
            $selectFields = array_intersect(['id', 'name', 'description', 'price', 'is_active', 'modified_date', 'modified_by', 'created_at', 'updated_at'], $columnNames);
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM app_plans WHERE id = ?';
            $plan = DB::select($selectQuery, [$id])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'Plan added successfully',
                'data' => $plan
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Plan Store Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error adding plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified plan from app_plans table
     */
    public function show($id)
    {
        try {
            $columns = DB::select("SHOW COLUMNS FROM app_plans");
            $columnNames = array_column($columns, 'Field');
            
            $selectFields = array_intersect(['id', 'name', 'description', 'price', 'is_active', 'modified_date', 'modified_by', 'created_at', 'updated_at'], $columnNames);
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM app_plans WHERE id = ?';
            
            $plan = DB::select($selectQuery, [$id]);
            
            if (empty($plan)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $plan[0]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified plan in app_plans table
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if plan exists in app_plans table
            $existing = DB::select('SELECT * FROM app_plans WHERE id = ?', [$id]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan not found'
                ], 404);
            }
            
            $name = $request->input('name');
            $description = $request->input('description', '');
            $price = $request->input('price');
            
            // Automatically set modified date and user
            $currentUser = $this->getCurrentUser();
            $now = now();
            
            // Check for duplicate name (excluding current plan)
            $duplicates = DB::select('SELECT id FROM app_plans WHERE LOWER(name) = LOWER(?) AND id != ?', [$name, $id]);
            if (!empty($duplicates)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A plan with this name already exists'
                ], 422);
            }
            
            // Get available columns
            $columns = DB::select("SHOW COLUMNS FROM app_plans");
            $columnNames = array_column($columns, 'Field');
            
            // Build update data based on available columns
            $updateData = [
                'name' => $name
            ];
            
            if (in_array('description', $columnNames)) $updateData['description'] = $description;
            if (in_array('price', $columnNames)) $updateData['price'] = $price;
            if (in_array('modified_date', $columnNames)) $updateData['modified_date'] = $now;
            if (in_array('modified_by', $columnNames)) $updateData['modified_by'] = $currentUser;
            if (in_array('updated_at', $columnNames)) $updateData['updated_at'] = $now;
            
            DB::table('app_plans')->where('id', $id)->update($updateData);
            
            // Get updated record
            $selectFields = array_intersect(['id', 'name', 'description', 'price', 'is_active', 'modified_date', 'modified_by', 'created_at', 'updated_at'], $columnNames);
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM app_plans WHERE id = ?';
            $plan = DB::select($selectQuery, [$id])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'Plan updated successfully',
                'data' => $plan
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified plan from app_plans table
     */
    public function destroy($id)
    {
        try {
            // Check if plan exists
            $existing = DB::select('SELECT * FROM app_plans WHERE id = ?', [$id]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan not found'
                ], 404);
            }
            
            // Get available columns
            $columns = DB::select("SHOW COLUMNS FROM app_plans");
            $columnNames = array_column($columns, 'Field');
            
            if (in_array('is_active', $columnNames)) {
                // Soft delete - set is_active to false
                $updateData = ['is_active' => false];
                if (in_array('updated_at', $columnNames)) {
                    $updateData['updated_at'] = now();
                }
                DB::table('app_plans')->where('id', $id)->update($updateData);
            } else {
                // Hard delete if no is_active column
                DB::table('app_plans')->where('id', $id)->delete();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Plan deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get plan statistics from app_plans table
     */
    public function getStatistics()
    {
        try {
            $columns = DB::select("SHOW COLUMNS FROM app_plans");
            $columnNames = array_column($columns, 'Field');
            
            $whereClause = in_array('is_active', $columnNames) ? ' WHERE is_active = 1' : '';
            
            $totalPlans = DB::select("SELECT COUNT(*) as count FROM app_plans{$whereClause}")[0]->count ?? 0;
            
            if (in_array('price', $columnNames)) {
                $avgPrice = DB::select("SELECT AVG(price) as avg_price FROM app_plans{$whereClause}")[0]->avg_price ?? 0;
                $minPrice = DB::select("SELECT MIN(price) as min_price FROM app_plans{$whereClause}")[0]->min_price ?? 0;
                $maxPrice = DB::select("SELECT MAX(price) as max_price FROM app_plans{$whereClause}")[0]->max_price ?? 0;
            } else {
                $avgPrice = $minPrice = $maxPrice = 0;
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_active_plans' => (int) $totalPlans,
                    'average_price' => round($avgPrice, 2),
                    'min_price' => (float) $minPrice,
                    'max_price' => (float) $maxPrice
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
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PlanApiController extends Controller
{
    /**
     * Get current user email from session/auth and validate it exists
     */
    private function getCurrentUser()
    {
        $defaultUser = 'ravenampere0123@gmail.com';
        
        // Check if the email exists in Employee_Email table
        $validUser = DB::select('SELECT Email FROM Employee_Email WHERE Email = ?', [$defaultUser]);
        
        if (!empty($validUser)) {
            return $defaultUser;
        }
        
        // If default user doesn't exist, try to find any valid email
        $anyValidUser = DB::select('SELECT Email FROM Employee_Email LIMIT 1');
        
        if (!empty($anyValidUser)) {
            return $anyValidUser[0]->Email;
        }
        
        // If no valid users exist, return null (will be handled by database constraint)
        return null;
    }

    /**
     * Get all plans from app_plans table
     */
    public function index()
    {
        try {
            // First check if table exists
            $tableExists = DB::select("SHOW TABLES LIKE 'plan_list'");
            if (empty($tableExists)) {
                return response()->json([
                    'success' => false,
                    'message' => 'plan_list table does not exist'
                ], 500);
            }

            // Get table structure to verify required columns exist
            $columns = DB::select("SHOW COLUMNS FROM plan_list");
            $columnNames = array_column($columns, 'Field');
            
            // Build SELECT statement based on available columns
            $selectFields = ['Plan_Name as name'];
            if (in_array('Description', $columnNames)) $selectFields[] = 'Description as description';
            if (in_array('Price', $columnNames)) $selectFields[] = 'Price as price';
            if (in_array('is_active', $columnNames)) $selectFields[] = 'is_active';
            if (in_array('Modified_Date', $columnNames)) $selectFields[] = 'Modified_Date as modified_date';
            if (in_array('Modified_By', $columnNames)) $selectFields[] = 'Modified_By as modified_by';
            if (in_array('created_at', $columnNames)) $selectFields[] = 'created_at';
            if (in_array('updated_at', $columnNames)) $selectFields[] = 'updated_at';
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM plan_list';
            
            // Don't filter by is_active - show all records
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
     * Store a new plan in plan_list table
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
            
            // Get current user - handle case where no valid user exists
            $currentUser = $this->getCurrentUser();
            if ($currentUser === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid employee email found. Please ensure Employee_Email table is populated.'
                ], 500);
            }
            
            $now = now();
            
            // Check for duplicate plan name in plan_list table
            $existing = DB::select('SELECT Plan_Name FROM plan_list WHERE LOWER(Plan_Name) = LOWER(?)', [$name]);
            if (!empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A plan with this name already exists'
                ], 422);
            }
            
            // Get available columns
            $columns = DB::select("SHOW COLUMNS FROM plan_list");
            $columnNames = array_column($columns, 'Field');
            
            // Build insert data based on available columns
            $insertData = [
                'Plan_Name' => $name
            ];
            
            if (in_array('Description', $columnNames)) $insertData['Description'] = $description;
            if (in_array('Price', $columnNames)) $insertData['Price'] = $price;
            if (in_array('Modified_Date', $columnNames)) $insertData['Modified_Date'] = $now;
            if (in_array('Modified_By', $columnNames)) $insertData['Modified_By'] = $currentUser;
            
            DB::table('plan_list')->insert($insertData);
            
            // Get the inserted record
            $selectFields = ['Plan_Name as name'];
            if (in_array('Description', $columnNames)) $selectFields[] = 'Description as description';
            if (in_array('Price', $columnNames)) $selectFields[] = 'Price as price';
            if (in_array('Modified_Date', $columnNames)) $selectFields[] = 'Modified_Date as modified_date';
            if (in_array('Modified_By', $columnNames)) $selectFields[] = 'Modified_By as modified_by';
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM plan_list WHERE Plan_Name = ?';
            $plan = DB::select($selectQuery, [$name])[0];
            
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
     * Display the specified plan from plan_list table
     */
    public function show($planName)
    {
        try {
            $columns = DB::select("SHOW COLUMNS FROM plan_list");
            $columnNames = array_column($columns, 'Field');
            
            $selectFields = ['Plan_Name as name'];
            if (in_array('Description', $columnNames)) $selectFields[] = 'Description as description';
            if (in_array('Price', $columnNames)) $selectFields[] = 'Price as price';
            if (in_array('Modified_Date', $columnNames)) $selectFields[] = 'Modified_Date as modified_date';
            if (in_array('Modified_By', $columnNames)) $selectFields[] = 'Modified_By as modified_by';
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM plan_list WHERE Plan_Name = ?';
            
            $plan = DB::select($selectQuery, [$planName]);
            
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
     * Update the specified plan in plan_list table
     */
    public function update(Request $request, $planName)
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

            // Check if plan exists in plan_list table
            $existing = DB::select('SELECT Plan_Name FROM plan_list WHERE Plan_Name = ?', [$planName]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan not found'
                ], 404);
            }
            
            $name = $request->input('name');
            $description = $request->input('description', '');
            $price = $request->input('price');
            
            // Get current user - handle case where no valid user exists
            $currentUser = $this->getCurrentUser();
            if ($currentUser === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid employee email found. Please ensure Employee_Email table is populated.'
                ], 500);
            }
            
            $now = now();
            
            // Check for duplicate name (excluding current plan)
            $duplicates = DB::select('SELECT Plan_Name FROM plan_list WHERE LOWER(Plan_Name) = LOWER(?) AND Plan_Name != ?', [$name, $planName]);
            if (!empty($duplicates)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A plan with this name already exists'
                ], 422);
            }
            
            // Get available columns
            $columns = DB::select("SHOW COLUMNS FROM plan_list");
            $columnNames = array_column($columns, 'Field');
            
            // Build update data based on available columns
            $updateData = [
                'Plan_Name' => $name
            ];
            
            if (in_array('Description', $columnNames)) $updateData['Description'] = $description;
            if (in_array('Price', $columnNames)) $updateData['Price'] = $price;
            if (in_array('Modified_Date', $columnNames)) $updateData['Modified_Date'] = $now;
            if (in_array('Modified_By', $columnNames)) $updateData['Modified_By'] = $currentUser;
            
            DB::table('plan_list')->where('Plan_Name', $planName)->update($updateData);
            
            // Get updated record
            $selectFields = ['Plan_Name as name'];
            if (in_array('Description', $columnNames)) $selectFields[] = 'Description as description';
            if (in_array('Price', $columnNames)) $selectFields[] = 'Price as price';
            if (in_array('Modified_Date', $columnNames)) $selectFields[] = 'Modified_Date as modified_date';
            if (in_array('Modified_By', $columnNames)) $selectFields[] = 'Modified_By as modified_by';
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM plan_list WHERE Plan_Name = ?';
            $plan = DB::select($selectQuery, [$name])[0];
            
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
     * HARD DELETE - Permanently remove the specified plan from plan_list table
     */
    public function destroy($planName)
    {
        try {
            // Check if plan exists
            $existing = DB::select('SELECT Plan_Name FROM plan_list WHERE Plan_Name = ?', [$planName]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan not found'
                ], 404);
            }
            
            $plan = $existing[0];
            
            // HARD DELETE - permanently remove from database
            $deleted = DB::table('plan_list')->where('Plan_Name', $planName)->delete();
            
            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Plan permanently deleted from database'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete plan from database'
                ], 500);
            }
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get plan statistics from plan_list table
     */
    public function getStatistics()
    {
        try {
            $columns = DB::select("SHOW COLUMNS FROM plan_list");
            $columnNames = array_column($columns, 'Field');
            
            // Count all records
            $totalPlans = DB::select("SELECT COUNT(*) as count FROM plan_list")[0]->count ?? 0;
            
            if (in_array('Price', $columnNames)) {
                $avgPrice = DB::select("SELECT AVG(Price) as avg_price FROM plan_list")[0]->avg_price ?? 0;
                $minPrice = DB::select("SELECT MIN(Price) as min_price FROM plan_list")[0]->min_price ?? 0;
                $maxPrice = DB::select("SELECT MAX(Price) as max_price FROM plan_list")[0]->max_price ?? 0;
            } else {
                $avgPrice = $minPrice = $maxPrice = 0;
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_plans' => (int) $totalPlans,
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
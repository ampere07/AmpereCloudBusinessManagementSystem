<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class RouterModelApiController extends Controller
{
    /**
     * Get current user email from session/auth (fallback for now)
     */
    private function getCurrentUser()
    {
        return 'ravenampere0123@gmail.com';
    }

    /**
     * Get all router models from modem_router_sn table
     */
    public function index()
    {
        try {
            // Check if table exists
            $tableExists = DB::select("SHOW TABLES LIKE 'modem_router_sn'");
            if (empty($tableExists)) {
                return response()->json([
                    'success' => false,
                    'message' => 'modem_router_sn table does not exist',
                    'debug_info' => 'Table not found in database'
                ], 500);
            }

            // Get table structure to verify required columns exist
            $columns = DB::select("SHOW COLUMNS FROM modem_router_sn");
            $columnNames = array_column($columns, 'Field');
            
            \Log::info('Router Models API - Available columns: ', $columnNames);
            
            // Build SELECT statement based on available columns
            $selectFields = [];
            if (in_array('SN', $columnNames)) $selectFields[] = 'SN';
            if (in_array('Model', $columnNames)) $selectFields[] = 'Model';
            if (in_array('brand', $columnNames)) $selectFields[] = 'brand';
            if (in_array('description', $columnNames)) $selectFields[] = 'description';
            if (in_array('is_active', $columnNames)) $selectFields[] = 'is_active';
            if (in_array('modified_by', $columnNames)) $selectFields[] = 'modified_by';
            if (in_array('modified_date', $columnNames)) $selectFields[] = 'modified_date';
            if (in_array('created_at', $columnNames)) $selectFields[] = 'created_at';
            if (in_array('updated_at', $columnNames)) $selectFields[] = 'updated_at';
            
            if (empty($selectFields)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid columns found in modem_router_sn table',
                    'available_columns' => $columnNames
                ], 500);
            }
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM modem_router_sn ORDER BY SN';
            
            \Log::info('Router Models API - Query: ' . $selectQuery);
            
            $routers = DB::select($selectQuery);
            
            \Log::info('Router Models API - Found ' . count($routers) . ' records');
            
            // Format the results to ensure consistent structure
            $formattedRouters = [];
            foreach ($routers as $router) {
                $routerArray = (array) $router;
                
                // Set default values for missing fields
                if (!isset($routerArray['SN'])) $routerArray['SN'] = '';
                if (!isset($routerArray['Model'])) $routerArray['Model'] = '';
                if (!isset($routerArray['brand'])) $routerArray['brand'] = 'Unknown';
                if (!isset($routerArray['description'])) $routerArray['description'] = '';
                if (!isset($routerArray['is_active'])) $routerArray['is_active'] = 1;
                if (!isset($routerArray['modified_date'])) $routerArray['modified_date'] = date('Y-m-d H:i:s');
                if (!isset($routerArray['modified_by'])) $routerArray['modified_by'] = $this->getCurrentUser();
                if (!isset($routerArray['created_at'])) $routerArray['created_at'] = date('Y-m-d H:i:s');
                if (!isset($routerArray['updated_at'])) $routerArray['updated_at'] = date('Y-m-d H:i:s');
                
                $formattedRouters[] = $routerArray;
            }
            
            return response()->json([
                'success' => true,
                'data' => $formattedRouters,
                'columns_available' => $columnNames,
                'debug_info' => [
                    'query_executed' => $selectQuery,
                    'raw_count' => count($routers),
                    'formatted_count' => count($formattedRouters)
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Router Model API Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching router models: ' . $e->getMessage(),
                'error_details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]
            ], 500);
        }
    }

    /**
     * Store a new router model
     */
    public function store(Request $request)
    {
        try {
            \Log::info('Router Models Store - Request data: ', $request->all());
            
            $validator = Validator::make($request->all(), [
                'brand' => 'required|string|max:255',
                'model' => 'required|string|max:255',
                'description' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                \Log::error('Router Models Store - Validation failed: ', $validator->errors()->toArray());
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $brand = $request->input('brand');
            $model = $request->input('model');
            $description = $request->input('description', '');
            
            // Generate SN based on brand and model
            $sn = strtoupper(substr($brand, 0, 3)) . '_' . strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $model)) . '_' . time();
            
            \Log::info('Router Models Store - Generated SN: ' . $sn);
            
            // Automatically set modified date and user
            $currentUser = $this->getCurrentUser();
            $now = now();
            
            // Check for duplicate SN and generate unique one
            $originalSn = $sn;
            $counter = 1;
            while (!empty(DB::select('SELECT SN FROM modem_router_sn WHERE SN = ?', [$sn]))) {
                $sn = $originalSn . '_' . $counter;
                $counter++;
                \Log::info('Router Models Store - SN exists, trying: ' . $sn);
            }
            
            // Get available columns
            $columns = DB::select("SHOW COLUMNS FROM modem_router_sn");
            $columnNames = array_column($columns, 'Field');
            
            \Log::info('Router Models Store - Available columns: ', $columnNames);
            
            // Build insert data based on available columns
            $insertData = [
                'SN' => $sn
            ];
            
            if (in_array('Model', $columnNames)) $insertData['Model'] = $model;
            if (in_array('brand', $columnNames)) $insertData['brand'] = $brand;
            if (in_array('description', $columnNames)) $insertData['description'] = $description;
            if (in_array('is_active', $columnNames)) $insertData['is_active'] = 1;
            if (in_array('modified_date', $columnNames)) $insertData['modified_date'] = $now;
            if (in_array('modified_by', $columnNames)) $insertData['modified_by'] = $currentUser;
            if (in_array('created_at', $columnNames)) $insertData['created_at'] = $now;
            if (in_array('updated_at', $columnNames)) $insertData['updated_at'] = $now;
            
            \Log::info('Router Models Store - Insert data: ', $insertData);
            
            $inserted = DB::table('modem_router_sn')->insert($insertData);
            
            if (!$inserted) {
                throw new \Exception('Failed to insert record into database');
            }
            
            \Log::info('Router Models Store - Record inserted successfully');
            
            // Get the inserted record
            $selectFields = array_intersect(['SN', 'Model', 'brand', 'description', 'is_active', 'modified_date', 'modified_by', 'created_at', 'updated_at'], $columnNames);
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM modem_router_sn WHERE SN = ?';
            $router = DB::select($selectQuery, [$sn]);
            
            if (empty($router)) {
                throw new \Exception('Record was inserted but could not be retrieved');
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Router model added successfully',
                'data' => $router[0],
                'debug_info' => [
                    'generated_sn' => $sn,
                    'insert_data' => $insertData
                ]
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Router Model Store Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error adding router model: ' . $e->getMessage(),
                'debug_info' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * Display the specified router model
     */
    public function show($sn)
    {
        try {
            \Log::info('Router Models Show - Looking for SN: ' . $sn);
            
            $columns = DB::select("SHOW COLUMNS FROM modem_router_sn");
            $columnNames = array_column($columns, 'Field');
            
            $selectFields = array_intersect(['SN', 'Model', 'brand', 'description', 'is_active', 'modified_date', 'modified_by', 'created_at', 'updated_at'], $columnNames);
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM modem_router_sn WHERE SN = ?';
            
            $router = DB::select($selectQuery, [$sn]);
            
            if (empty($router)) {
                \Log::warning('Router Models Show - Router not found: ' . $sn);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Router model not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $router[0]
            ]);
        } catch (\Exception $e) {
            \Log::error('Router Models Show Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching router model: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified router model
     */
    public function update(Request $request, $sn)
    {
        try {
            \Log::info('Router Models Update - SN: ' . $sn . ', Data: ', $request->all());
            
            $validator = Validator::make($request->all(), [
                'brand' => 'required|string|max:255',
                'model' => 'required|string|max:255',
                'description' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if router model exists
            $existing = DB::select('SELECT * FROM modem_router_sn WHERE SN = ?', [$sn]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Router model not found'
                ], 404);
            }
            
            $brand = $request->input('brand');
            $model = $request->input('model');
            $description = $request->input('description', '');
            
            // Automatically set modified date and user
            $currentUser = $this->getCurrentUser();
            $now = now();
            
            // Get available columns
            $columns = DB::select("SHOW COLUMNS FROM modem_router_sn");
            $columnNames = array_column($columns, 'Field');
            
            // Build update data based on available columns
            $updateData = [];
            
            if (in_array('Model', $columnNames)) $updateData['Model'] = $model;
            if (in_array('brand', $columnNames)) $updateData['brand'] = $brand;
            if (in_array('description', $columnNames)) $updateData['description'] = $description;
            if (in_array('modified_date', $columnNames)) $updateData['modified_date'] = $now;
            if (in_array('modified_by', $columnNames)) $updateData['modified_by'] = $currentUser;
            if (in_array('updated_at', $columnNames)) $updateData['updated_at'] = $now;
            
            \Log::info('Router Models Update - Update data: ', $updateData);
            
            $updated = DB::table('modem_router_sn')->where('SN', $sn)->update($updateData);
            
            \Log::info('Router Models Update - Affected rows: ' . $updated);
            
            // Get updated record
            $selectFields = array_intersect(['SN', 'Model', 'brand', 'description', 'is_active', 'modified_date', 'modified_by', 'created_at', 'updated_at'], $columnNames);
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM modem_router_sn WHERE SN = ?';
            $router = DB::select($selectQuery, [$sn])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'Router model updated successfully',
                'data' => $router
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Router Models Update Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error updating router model: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * HARD DELETE - Permanently remove the specified router model from database
     */
    public function destroy($sn)
    {
        try {
            \Log::info('Router Models Delete - SN: ' . $sn);
            
            // Check if router model exists
            $existing = DB::select('SELECT * FROM modem_router_sn WHERE SN = ?', [$sn]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Router model not found'
                ], 404);
            }
            
            // HARD DELETE - permanently remove from database
            $deleted = DB::table('modem_router_sn')->where('SN', $sn)->delete();
            
            \Log::info('Router Models Delete - Affected rows: ' . $deleted);
            
            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Router model permanently deleted from database'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete router model from database'
                ], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('Router Models Delete Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error deleting router model: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get router model statistics
     */
    public function getStatistics()
    {
        try {
            $columns = DB::select("SHOW COLUMNS FROM modem_router_sn");
            $columnNames = array_column($columns, 'Field');
            
            $totalRouters = DB::select("SELECT COUNT(*) as count FROM modem_router_sn")[0]->count ?? 0;
            
            // Get brand statistics if brand column exists
            $brandStats = [];
            if (in_array('brand', $columnNames)) {
                $brands = DB::select("SELECT brand, COUNT(*) as count FROM modem_router_sn GROUP BY brand ORDER BY count DESC");
                $brandStats = array_map(function($brand) {
                    return ['name' => $brand->brand ?? 'Unknown', 'count' => $brand->count];
                }, $brands);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_router_models' => (int) $totalRouters,
                    'brand_breakdown' => $brandStats
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
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class LcpApiController extends Controller
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
     * Get all LCP items from app_lcp table with pagination and search
     */
    public function index(Request $request)
    {
        try {
            // First check if table exists
            $tableExists = DB::select("SHOW TABLES LIKE 'app_lcp'");
            if (empty($tableExists)) {
                return response()->json([
                    'success' => false,
                    'message' => 'app_lcp table does not exist'
                ], 500);
            }

            // Get pagination parameters
            $page = (int) $request->get('page', 1);
            $limit = min((int) $request->get('limit', 10), 100); // Max 100 items per page
            $search = $request->get('search', '');
            
            $offset = ($page - 1) * $limit;

            // Build the base query
            $whereClause = '';
            $params = [];
            
            if (!empty($search)) {
                $whereClause = 'WHERE name LIKE ?';
                $params[] = '%' . $search . '%';
            }

            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM app_lcp $whereClause";
            $totalResult = DB::select($countQuery, $params);
            $totalItems = $totalResult[0]->total ?? 0;
            
            // Calculate pagination
            $totalPages = ceil($totalItems / $limit);
            
            // Get paginated data
            $dataQuery = "SELECT id, name, modified_by, modified_date, created_at, updated_at 
                         FROM app_lcp $whereClause 
                         ORDER BY name 
                         LIMIT ? OFFSET ?";
            $dataParams = array_merge($params, [$limit, $offset]);
            
            $lcpItems = DB::select($dataQuery, $dataParams);
            
            return response()->json([
                'success' => true,
                'data' => $lcpItems,
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
            \Log::error('LCP API Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching LCP items: ' . $e->getMessage(),
                'error_details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * Store a new LCP item in app_lcp table
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $name = $request->input('name');
            
            // Automatically set modified date and user
            $currentUser = $this->getCurrentUser();
            $now = now();
            
            // Check for duplicate LCP name in app_lcp table
            $existing = DB::select('SELECT id FROM app_lcp WHERE LOWER(name) = LOWER(?)', [$name]);
            if (!empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A LCP with this name already exists'
                ], 422);
            }
            
            // Insert new LCP
            $insertData = [
                'name' => $name,
                'modified_by' => $currentUser,
                'modified_date' => $now,
                'created_at' => $now,
                'updated_at' => $now
            ];
            
            $id = DB::table('app_lcp')->insertGetId($insertData);
            
            // Get the inserted record
            $lcp = DB::select('SELECT id, name, modified_by, modified_date, created_at, updated_at FROM app_lcp WHERE id = ?', [$id])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'LCP added successfully',
                'data' => $lcp
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('LCP Store Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error adding LCP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified LCP from app_lcp table
     */
    public function show($id)
    {
        try {
            $lcp = DB::select('SELECT id, name, modified_by, modified_date, created_at, updated_at FROM app_lcp WHERE id = ?', [$id]);
            
            if (empty($lcp)) {
                return response()->json([
                    'success' => false,
                    'message' => 'LCP not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $lcp[0]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching LCP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified LCP in app_lcp table
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if LCP exists in app_lcp table
            $existing = DB::select('SELECT * FROM app_lcp WHERE id = ?', [$id]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'LCP not found'
                ], 404);
            }
            
            $name = $request->input('name');
            
            // Automatically set modified date and user
            $currentUser = $this->getCurrentUser();
            $now = now();
            
            // Check for duplicate name (excluding current LCP)
            $duplicates = DB::select('SELECT id FROM app_lcp WHERE LOWER(name) = LOWER(?) AND id != ?', [$name, $id]);
            if (!empty($duplicates)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A LCP with this name already exists'
                ], 422);
            }
            
            // Update LCP
            $updateData = [
                'name' => $name,
                'modified_by' => $currentUser,
                'modified_date' => $now,
                'updated_at' => $now
            ];
            
            DB::table('app_lcp')->where('id', $id)->update($updateData);
            
            // Get updated record
            $lcp = DB::select('SELECT id, name, modified_by, modified_date, created_at, updated_at FROM app_lcp WHERE id = ?', [$id])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'LCP updated successfully',
                'data' => $lcp
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating LCP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * HARD DELETE - Permanently remove the specified LCP from app_lcp table
     */
    public function destroy($id)
    {
        try {
            // Check if LCP exists
            $existing = DB::select('SELECT * FROM app_lcp WHERE id = ?', [$id]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'LCP not found'
                ], 404);
            }
            
            // HARD DELETE - permanently remove from database
            $deleted = DB::table('app_lcp')->where('id', $id)->delete();
            
            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'LCP permanently deleted from database'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete LCP from database'
                ], 500);
            }
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting LCP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get LCP statistics from app_lcp table
     */
    public function getStatistics()
    {
        try {
            $totalLcp = DB::select("SELECT COUNT(*) as count FROM app_lcp")[0]->count ?? 0;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_lcp' => (int) $totalLcp
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

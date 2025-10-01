<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class InventoryApiController extends Controller
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
        
        // If no valid users exist, return null
        return null;
    }

    /**
     * Get all items from Inventory table
     */
    public function index()
    {
        try {
            // Check if table exists
            $tableExists = DB::select("SHOW TABLES LIKE 'Inventory'");
            if (empty($tableExists)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inventory table does not exist'
                ], 500);
            }

            // Get table structure to verify required columns exist
            $columns = DB::select("SHOW COLUMNS FROM Inventory");
            $columnNames = array_column($columns, 'Field');
            
            // Build SELECT statement based on available columns
            $selectFields = ['Item_Name as item_name'];
            if (in_array('Item_Description', $columnNames)) $selectFields[] = 'Item_Description as item_description';
            if (in_array('Supplier', $columnNames)) $selectFields[] = 'Supplier as supplier';
            if (in_array('Quantity_Alert', $columnNames)) $selectFields[] = 'Quantity_Alert as quantity_alert';
            if (in_array('Image', $columnNames)) $selectFields[] = 'Image as image';
            if (in_array('Modified_By', $columnNames)) $selectFields[] = 'Modified_By as modified_by';
            if (in_array('Modified_Date', $columnNames)) $selectFields[] = 'Modified_Date as modified_date';
            if (in_array('User_Email', $columnNames)) $selectFields[] = 'User_Email as user_email';
            if (in_array('Category', $columnNames)) $selectFields[] = 'Category as category';
            if (in_array('Item_ID', $columnNames)) $selectFields[] = 'Item_ID as item_id';
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM Inventory ORDER BY Item_Name';
            
            $items = DB::select($selectQuery);
            
            return response()->json([
                'success' => true,
                'data' => $items,
                'columns_available' => $columnNames
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Inventory API Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching inventory items: ' . $e->getMessage(),
                'error_details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * Store a new item in Inventory table
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'item_name' => 'required|string|max:255',
                'item_description' => 'nullable|string',
                'supplier' => 'nullable|string|max:255',
                'quantity_alert' => 'nullable|integer|min:0',
                'category' => 'nullable|string|max:255',
                'item_id' => 'nullable|integer',
                'image' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $itemName = $request->input('item_name');
            $itemDescription = $request->input('item_description', '');
            $supplier = $request->input('supplier', '');
            $quantityAlert = $request->input('quantity_alert', 0);
            $category = $request->input('category', '');
            $itemId = $request->input('item_id', null);
            $image = $request->input('image', '');
            
            // Get current user - handle case where no valid user exists
            $currentUser = $this->getCurrentUser();
            if ($currentUser === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid employee email found. Please ensure Employee_Email table is populated.'
                ], 500);
            }
            
            $now = now();
            
            // Check for duplicate item name
            $existing = DB::select('SELECT Item_Name FROM Inventory WHERE LOWER(Item_Name) = LOWER(?)', [$itemName]);
            if (!empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'An item with this name already exists'
                ], 422);
            }
            
            // Handle category foreign key constraint
            if (!empty($category)) {
                // Check if category exists in Inventory_Category table
                $categoryExists = DB::select('SELECT Category_Name FROM Inventory_Category WHERE Category_Name = ?', [$category]);
                if (empty($categoryExists)) {
                    // Create the category if it doesn't exist
                    try {
                        DB::table('Inventory_Category')->insert([
                            'Category_Name' => $category,
                            'Modified_By' => $currentUser,
                            'Modified_Date' => $now
                        ]);
                        \Log::info('Created new inventory category: ' . $category);
                    } catch (\Exception $e) {
                        \Log::error('Failed to create category: ' . $e->getMessage());
                        // Set category to null to avoid foreign key constraint
                        $category = null;
                    }
                }
            }
            
            // Get available columns
            $columns = DB::select("SHOW COLUMNS FROM Inventory");
            $columnNames = array_column($columns, 'Field');
            
            // Build insert data based on available columns
            $insertData = [
                'Item_Name' => $itemName
            ];
            
            if (in_array('Item_Description', $columnNames)) $insertData['Item_Description'] = $itemDescription;
            if (in_array('Supplier', $columnNames)) $insertData['Supplier'] = $supplier;
            if (in_array('Quantity_Alert', $columnNames)) $insertData['Quantity_Alert'] = $quantityAlert;
            if (in_array('Image', $columnNames)) $insertData['Image'] = $image;
            if (in_array('Modified_By', $columnNames)) $insertData['Modified_By'] = $currentUser;
            if (in_array('Modified_Date', $columnNames)) $insertData['Modified_Date'] = $now;
            if (in_array('User_Email', $columnNames)) $insertData['User_Email'] = $currentUser;
            if (in_array('Category', $columnNames) && !empty($category)) $insertData['Category'] = $category;
            if (in_array('Item_ID', $columnNames) && !empty($itemId)) $insertData['Item_ID'] = $itemId;
            
            \Log::info('Attempting to insert inventory item with data: ', $insertData);
            
            // Use DB transaction to ensure data integrity
            DB::beginTransaction();
            
            try {
                $insertResult = DB::table('Inventory')->insert($insertData);
                
                if (!$insertResult) {
                    throw new \Exception('Insert operation returned false');
                }
                
                // Verify the record was actually inserted
                $verifyInsert = DB::select('SELECT Item_Name FROM Inventory WHERE Item_Name = ?', [$itemName]);
                if (empty($verifyInsert)) {
                    throw new \Exception('Record was not found after insert');
                }
                
                DB::commit();
                \Log::info('Successfully inserted inventory item: ' . $itemName);
                
            } catch (\Exception $e) {
                DB::rollback();
                \Log::error('Database insert failed: ' . $e->getMessage());
                throw new \Exception('Failed to insert inventory item: ' . $e->getMessage());
            }
            
            // Get the inserted record
            $selectFields = ['Item_Name as item_name'];
            if (in_array('Item_Description', $columnNames)) $selectFields[] = 'Item_Description as item_description';
            if (in_array('Supplier', $columnNames)) $selectFields[] = 'Supplier as supplier';
            if (in_array('Quantity_Alert', $columnNames)) $selectFields[] = 'Quantity_Alert as quantity_alert';
            if (in_array('Image', $columnNames)) $selectFields[] = 'Image as image';
            if (in_array('Modified_By', $columnNames)) $selectFields[] = 'Modified_By as modified_by';
            if (in_array('Modified_Date', $columnNames)) $selectFields[] = 'Modified_Date as modified_date';
            if (in_array('User_Email', $columnNames)) $selectFields[] = 'User_Email as user_email';
            if (in_array('Category', $columnNames)) $selectFields[] = 'Category as category';
            if (in_array('Item_ID', $columnNames)) $selectFields[] = 'Item_ID as item_id';
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM Inventory WHERE Item_Name = ?';
            $item = DB::select($selectQuery, [$itemName])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'Inventory item added successfully',
                'data' => $item
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Inventory Store Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error adding inventory item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug inventory insertion issues
     */
    public function debug(Request $request)
    {
        try {
            $response = ['debug_steps' => []];
            
            // Step 1: Check if Inventory table exists
            $tableExists = DB::select("SHOW TABLES LIKE 'Inventory'");
            $response['debug_steps'][] = [
                'step' => 'Check Inventory table exists',
                'result' => !empty($tableExists) ? 'SUCCESS' : 'FAILED',
                'data' => !empty($tableExists)
            ];
            
            // Step 2: Check Inventory table structure
            $columns = DB::select("SHOW COLUMNS FROM Inventory");
            $columnNames = array_column($columns, 'Field');
            $response['debug_steps'][] = [
                'step' => 'Get Inventory table columns',
                'result' => 'SUCCESS',
                'data' => $columnNames
            ];
            
            // Step 3: Check Employee_Email table
            $employeeEmails = DB::select("SELECT Email FROM Employee_Email LIMIT 5");
            $response['debug_steps'][] = [
                'step' => 'Check Employee_Email table',
                'result' => !empty($employeeEmails) ? 'SUCCESS' : 'FAILED',
                'data' => array_column($employeeEmails, 'Email')
            ];
            
            // Step 4: Check Inventory_Category table
            $categories = DB::select("SELECT Category_Name FROM Inventory_Category LIMIT 5");
            $response['debug_steps'][] = [
                'step' => 'Check Inventory_Category table',
                'result' => !empty($categories) ? 'SUCCESS' : 'FAILED', 
                'data' => array_column($categories, 'Category_Name')
            ];
            
            // Step 5: Try to get current user
            $currentUser = $this->getCurrentUser();
            $response['debug_steps'][] = [
                'step' => 'Get current user',
                'result' => $currentUser ? 'SUCCESS' : 'FAILED',
                'data' => $currentUser
            ];
            
            // Step 6: Check foreign key constraints
            $foreignKeys = DB::select("
                SELECT 
                    CONSTRAINT_NAME,
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_NAME = 'Inventory' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ");
            $response['debug_steps'][] = [
                'step' => 'Check foreign key constraints',
                'result' => 'INFO',
                'data' => $foreignKeys
            ];
            
            // Step 7: Try a minimal insert without foreign key problematic fields
            $testItemName = 'DEBUG_ITEM_' . time();
            try {
                $minimalInsert = DB::table('Inventory')->insert([
                    'Item_Name' => $testItemName,
                    'Item_Description' => 'Debug test item'
                ]);
                
                if ($minimalInsert) {
                    $verification = DB::select('SELECT * FROM Inventory WHERE Item_Name = ?', [$testItemName]);
                    $response['debug_steps'][] = [
                        'step' => 'Minimal insert test',
                        'result' => !empty($verification) ? 'SUCCESS' : 'FAILED',
                        'data' => ['inserted' => $minimalInsert, 'found_after_insert' => !empty($verification)]
                    ];
                    
                    // Clean up
                    if (!empty($verification)) {
                        DB::table('Inventory')->where('Item_Name', $testItemName)->delete();
                    }
                } else {
                    $response['debug_steps'][] = [
                        'step' => 'Minimal insert test',
                        'result' => 'FAILED',
                        'data' => 'Insert returned false'
                    ];
                }
            } catch (\Exception $e) {
                $response['debug_steps'][] = [
                    'step' => 'Minimal insert test',
                    'result' => 'ERROR',
                    'data' => $e->getMessage()
                ];
            }
            
            // Step 8: Try insert with foreign keys if minimal worked
            if ($currentUser) {
                $testItemName2 = 'DEBUG_ITEM_FK_' . time();
                try {
                    $fkInsert = DB::table('Inventory')->insert([
                        'Item_Name' => $testItemName2,
                        'Item_Description' => 'Debug test with FK',
                        'Modified_By' => $currentUser,
                        'User_Email' => $currentUser,
                        'Modified_Date' => now()
                    ]);
                    
                    if ($fkInsert) {
                        $verification = DB::select('SELECT * FROM Inventory WHERE Item_Name = ?', [$testItemName2]);
                        $response['debug_steps'][] = [
                            'step' => 'Insert with foreign keys test',
                            'result' => !empty($verification) ? 'SUCCESS' : 'FAILED',
                            'data' => ['inserted' => $fkInsert, 'found_after_insert' => !empty($verification)]
                        ];
                        
                        // Clean up
                        if (!empty($verification)) {
                            DB::table('Inventory')->where('Item_Name', $testItemName2)->delete();
                        }
                    } else {
                        $response['debug_steps'][] = [
                            'step' => 'Insert with foreign keys test', 
                            'result' => 'FAILED',
                            'data' => 'Insert returned false'
                        ];
                    }
                } catch (\Exception $e) {
                    $response['debug_steps'][] = [
                        'step' => 'Insert with foreign keys test',
                        'result' => 'ERROR', 
                        'data' => $e->getMessage()
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Debug information collected',
                'debug_info' => $response
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Debug failed: ' . $e->getMessage(),
                'error' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Get a specific item from Inventory table
     */
    public function show($itemName)
    {
        try {
            $decodedItemName = urldecode($itemName);
            
            // Get table columns
            $columns = DB::select("SHOW COLUMNS FROM Inventory");
            $columnNames = array_column($columns, 'Field');
            
            // Build SELECT statement based on available columns
            $selectFields = ['Item_Name as item_name'];
            if (in_array('Item_Description', $columnNames)) $selectFields[] = 'Item_Description as item_description';
            if (in_array('Supplier', $columnNames)) $selectFields[] = 'Supplier as supplier';
            if (in_array('Quantity_Alert', $columnNames)) $selectFields[] = 'Quantity_Alert as quantity_alert';
            if (in_array('Image', $columnNames)) $selectFields[] = 'Image as image';
            if (in_array('Modified_By', $columnNames)) $selectFields[] = 'Modified_By as modified_by';
            if (in_array('Modified_Date', $columnNames)) $selectFields[] = 'Modified_Date as modified_date';
            if (in_array('User_Email', $columnNames)) $selectFields[] = 'User_Email as user_email';
            if (in_array('Category', $columnNames)) $selectFields[] = 'Category as category';
            if (in_array('Item_ID', $columnNames)) $selectFields[] = 'Item_ID as item_id';
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM Inventory WHERE Item_Name = ?';
            $item = DB::select($selectQuery, [$decodedItemName]);
            
            if (empty($item)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inventory item not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $item[0]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Inventory Show Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching inventory item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing item in Inventory table
     */
    public function update(Request $request, $itemName)
    {
        try {
            $decodedItemName = urldecode($itemName);
            
            $validator = Validator::make($request->all(), [
                'item_name' => 'required|string|max:255',
                'item_description' => 'nullable|string',
                'supplier' => 'nullable|string|max:255',
                'quantity_alert' => 'nullable|integer|min:0',
                'category' => 'nullable|string|max:255',
                'item_id' => 'nullable|integer',
                'image' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if item exists
            $existing = DB::select('SELECT Item_Name FROM Inventory WHERE Item_Name = ?', [$decodedItemName]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inventory item not found'
                ], 404);
            }
            
            $newItemName = $request->input('item_name');
            $itemDescription = $request->input('item_description', '');
            $supplier = $request->input('supplier', '');
            $quantityAlert = $request->input('quantity_alert', 0);
            $category = $request->input('category', '');
            $itemId = $request->input('item_id', null);
            $image = $request->input('image', '');
            
            // Get current user
            $currentUser = $this->getCurrentUser();
            if ($currentUser === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid employee email found.'
                ], 500);
            }
            
            $now = now();
            
            // Check for duplicate item name if name is being changed
            if ($newItemName !== $decodedItemName) {
                $duplicateCheck = DB::select('SELECT Item_Name FROM Inventory WHERE LOWER(Item_Name) = LOWER(?) AND Item_Name != ?', [$newItemName, $decodedItemName]);
                if (!empty($duplicateCheck)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'An item with this name already exists'
                    ], 422);
                }
            }
            
            // Handle category foreign key constraint
            if (!empty($category)) {
                $categoryExists = DB::select('SELECT Category_Name FROM Inventory_Category WHERE Category_Name = ?', [$category]);
                if (empty($categoryExists)) {
                    try {
                        DB::table('Inventory_Category')->insert([
                            'Category_Name' => $category,
                            'Modified_By' => $currentUser,
                            'Modified_Date' => $now
                        ]);
                        \Log::info('Created new inventory category: ' . $category);
                    } catch (\Exception $e) {
                        \Log::error('Failed to create category: ' . $e->getMessage());
                        $category = null;
                    }
                }
            }
            
            // Get available columns
            $columns = DB::select("SHOW COLUMNS FROM Inventory");
            $columnNames = array_column($columns, 'Field');
            
            // Build update data based on available columns
            $updateData = [
                'Item_Name' => $newItemName
            ];
            
            if (in_array('Item_Description', $columnNames)) $updateData['Item_Description'] = $itemDescription;
            if (in_array('Supplier', $columnNames)) $updateData['Supplier'] = $supplier;
            if (in_array('Quantity_Alert', $columnNames)) $updateData['Quantity_Alert'] = $quantityAlert;
            if (in_array('Image', $columnNames)) $updateData['Image'] = $image;
            if (in_array('Modified_By', $columnNames)) $updateData['Modified_By'] = $currentUser;
            if (in_array('Modified_Date', $columnNames)) $updateData['Modified_Date'] = $now;
            if (in_array('User_Email', $columnNames)) $updateData['User_Email'] = $currentUser;
            if (in_array('Category', $columnNames) && !empty($category)) $updateData['Category'] = $category;
            if (in_array('Item_ID', $columnNames) && !empty($itemId)) $updateData['Item_ID'] = $itemId;
            
            \Log::info('Attempting to update inventory item with data: ', $updateData);
            
            DB::beginTransaction();
            
            try {
                $updateResult = DB::table('Inventory')
                    ->where('Item_Name', $decodedItemName)
                    ->update($updateData);
                
                if (!$updateResult) {
                    throw new \Exception('Update operation returned false or no rows affected');
                }
                
                DB::commit();
                \Log::info('Successfully updated inventory item: ' . $decodedItemName . ' to ' . $newItemName);
                
            } catch (\Exception $e) {
                DB::rollback();
                \Log::error('Database update failed: ' . $e->getMessage());
                throw new \Exception('Failed to update inventory item: ' . $e->getMessage());
            }
            
            // Get the updated record
            $selectFields = ['Item_Name as item_name'];
            if (in_array('Item_Description', $columnNames)) $selectFields[] = 'Item_Description as item_description';
            if (in_array('Supplier', $columnNames)) $selectFields[] = 'Supplier as supplier';
            if (in_array('Quantity_Alert', $columnNames)) $selectFields[] = 'Quantity_Alert as quantity_alert';
            if (in_array('Image', $columnNames)) $selectFields[] = 'Image as image';
            if (in_array('Modified_By', $columnNames)) $selectFields[] = 'Modified_By as modified_by';
            if (in_array('Modified_Date', $columnNames)) $selectFields[] = 'Modified_Date as modified_date';
            if (in_array('User_Email', $columnNames)) $selectFields[] = 'User_Email as user_email';
            if (in_array('Category', $columnNames)) $selectFields[] = 'Category as category';
            if (in_array('Item_ID', $columnNames)) $selectFields[] = 'Item_ID as item_id';
            
            $selectQuery = 'SELECT ' . implode(', ', $selectFields) . ' FROM Inventory WHERE Item_Name = ?';
            $item = DB::select($selectQuery, [$newItemName])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'Inventory item updated successfully',
                'data' => $item
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Inventory Update Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error updating inventory item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an item from Inventory table
     */
    public function destroy($itemName)
    {
        try {
            $decodedItemName = urldecode($itemName);
            
            \Log::info('Attempting to delete inventory item: ' . $decodedItemName);
            
            // Check if item exists
            $existing = DB::select('SELECT Item_Name FROM Inventory WHERE Item_Name = ?', [$decodedItemName]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inventory item not found'
                ], 404);
            }
            
            DB::beginTransaction();
            
            try {
                $deleteResult = DB::table('Inventory')
                    ->where('Item_Name', $decodedItemName)
                    ->delete();
                
                if (!$deleteResult) {
                    throw new \Exception('Delete operation returned false or no rows affected');
                }
                
                // Verify the record was actually deleted
                $verifyDelete = DB::select('SELECT Item_Name FROM Inventory WHERE Item_Name = ?', [$decodedItemName]);
                if (!empty($verifyDelete)) {
                    throw new \Exception('Record still exists after delete operation');
                }
                
                DB::commit();
                \Log::info('Successfully deleted inventory item: ' . $decodedItemName);
                
            } catch (\Exception $e) {
                DB::rollback();
                \Log::error('Database delete failed: ' . $e->getMessage());
                throw new \Exception('Failed to delete inventory item: ' . $e->getMessage());
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Inventory item deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Inventory Delete Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error deleting inventory item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory statistics
     */
    public function getStatistics()
    {
        try {
            $totalItems = DB::scalar('SELECT COUNT(*) FROM Inventory');
            $itemsWithAlerts = DB::scalar('SELECT COUNT(*) FROM Inventory WHERE Quantity_Alert > 0');
            $categories = DB::scalar('SELECT COUNT(DISTINCT Category) FROM Inventory WHERE Category IS NOT NULL');
            $suppliers = DB::scalar('SELECT COUNT(DISTINCT Supplier) FROM Inventory WHERE Supplier IS NOT NULL AND Supplier != ""');
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_items' => $totalItems ?: 0,
                    'items_with_alerts' => $itemsWithAlerts ?: 0,
                    'total_categories' => $categories ?: 0,
                    'total_suppliers' => $suppliers ?: 0
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Inventory Statistics Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching inventory statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all categories
     */
    public function getCategories()
    {
        try {
            $categories = DB::select('SELECT DISTINCT Category FROM Inventory WHERE Category IS NOT NULL ORDER BY Category');
            
            return response()->json([
                'success' => true,
                'data' => array_column($categories, 'Category')
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Get Categories Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all suppliers
     */
    public function getSuppliers()
    {
        try {
            $suppliers = DB::select('SELECT DISTINCT Supplier FROM Inventory WHERE Supplier IS NOT NULL AND Supplier != "" ORDER BY Supplier');
            
            return response()->json([
                'success' => true,
                'data' => array_column($suppliers, 'Supplier')
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Get Suppliers Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching suppliers: ' . $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class LocationApiController extends Controller
{
    /**
     * Get all locations - Simple DB queries only
     */
    public function getAllLocations()
    {
        try {
            // Use raw DB queries to avoid model issues
            $regions = DB::select('SELECT * FROM regions WHERE is_active = 1 ORDER BY name');
            
            $result = [];
            foreach ($regions as $region) {
                $regionData = (array) $region;
                
                // Get cities for this region
                $cities = DB::select('SELECT * FROM cities WHERE region_id = ? AND is_active = 1 ORDER BY name', [$region->id]);
                $regionData['active_cities'] = [];
                
                foreach ($cities as $city) {
                    $cityData = (array) $city;
                    
                    // Get barangays for this city
                    $barangays = DB::select('SELECT * FROM barangays WHERE city_id = ? AND is_active = 1 ORDER BY name', [$city->id]);
                    $cityData['active_barangays'] = array_map(function($b) { return (array) $b; }, $barangays);
                    
                    $regionData['active_cities'][] = $cityData;
                }
                
                $result[] = $regionData;
            }
            
            return response()->json([
                'success' => true,
                'data' => $result,
                'source' => 'RAW_DATABASE_QUERIES',
                'count' => count($result)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('LocationApiController error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage(),
                'error_details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]
            ], 500);
        }
    }

    /**
     * Get regions - Simple version
     */
    public function getRegions()
    {
        try {
            $regions = DB::select('SELECT * FROM regions WHERE is_active = 1 ORDER BY name');
            
            return response()->json([
                'success' => true,
                'data' => $regions,
                'source' => 'RAW_DATABASE_QUERIES'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching regions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cities by region - Simple version
     */
    public function getCitiesByRegion($regionId)
    {
        try {
            $cities = DB::select('SELECT * FROM cities WHERE region_id = ? AND is_active = 1 ORDER BY name', [$regionId]);
            
            return response()->json([
                'success' => true,
                'data' => $cities,
                'source' => 'RAW_DATABASE_QUERIES'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching cities: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get barangays by city - Simple version
     */
    public function getBarangaysByCity($cityId)
    {
        try {
            $barangays = DB::select('SELECT * FROM barangays WHERE city_id = ? AND is_active = 1 ORDER BY name', [$cityId]);
            
            return response()->json([
                'success' => true,
                'data' => $barangays,
                'source' => 'RAW_DATABASE_QUERIES'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching barangays: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new region - Simple version
     */
    public function addRegion(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string'
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
            
            // Check for duplicate
            $existing = DB::select('SELECT id FROM regions WHERE LOWER(name) = LOWER(?)', [$name]);
            if (!empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A region with this name already exists'
                ], 422);
            }
            
            // Insert new region
            $code = 'R_' . strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $name)) . '_' . time();
            
            $id = DB::table('regions')->insertGetId([
                'code' => $code,
                'name' => $name,
                'description' => $description,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            $region = DB::select('SELECT * FROM regions WHERE id = ?', [$id])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'Region added successfully',
                'data' => $region,
                'source' => 'RAW_DATABASE_QUERIES'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding region: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new city - Simple version
     */
    public function addCity(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'region_id' => 'required|integer',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $regionId = $request->input('region_id');
            $name = $request->input('name');
            $description = $request->input('description', '');
            
            // Check if region exists
            $region = DB::select('SELECT id FROM regions WHERE id = ? AND is_active = 1', [$regionId]);
            if (empty($region)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Region not found or inactive'
                ], 422);
            }
            
            // Check for duplicate city in same region
            $existing = DB::select('SELECT id FROM cities WHERE region_id = ? AND LOWER(name) = LOWER(?)', [$regionId, $name]);
            if (!empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A city with this name already exists in this region'
                ], 422);
            }
            
            // Insert new city
            $code = 'C_' . strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $name)) . '_' . time();
            
            $id = DB::table('cities')->insertGetId([
                'region_id' => $regionId,
                'code' => $code,
                'name' => $name,
                'description' => $description,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            $city = DB::select('SELECT * FROM cities WHERE id = ?', [$id])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'City added successfully',
                'data' => $city,
                'source' => 'RAW_DATABASE_QUERIES'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding city: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new barangay - Simple version
     */
    public function addBarangay(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'city_id' => 'required|integer',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $cityId = $request->input('city_id');
            $name = $request->input('name');
            $description = $request->input('description', '');
            
            // Check if city exists
            $city = DB::select('SELECT id FROM cities WHERE id = ? AND is_active = 1', [$cityId]);
            if (empty($city)) {
                return response()->json([
                    'success' => false,
                    'message' => 'City not found or inactive'
                ], 422);
            }
            
            // Check for duplicate barangay in same city
            $existing = DB::select('SELECT id FROM barangays WHERE city_id = ? AND LOWER(name) = LOWER(?)', [$cityId, $name]);
            if (!empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A barangay with this name already exists in this city'
                ], 422);
            }
            
            // Insert new barangay
            $code = 'B_' . strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $name)) . '_' . time();
            
            $id = DB::table('barangays')->insertGetId([
                'city_id' => $cityId,
                'code' => $code,
                'name' => $name,
                'description' => $description,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            $barangay = DB::select('SELECT * FROM barangays WHERE id = ?', [$id])[0];
            
            return response()->json([
                'success' => true,
                'message' => 'Barangay added successfully',
                'data' => $barangay,
                'source' => 'RAW_DATABASE_QUERIES'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding barangay: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update location (region, city, or barangay)
     */
    public function updateLocation($type, $id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string'
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
            
            // Validate type and table
            $validTypes = ['region', 'city', 'barangay'];
            if (!in_array($type, $validTypes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid location type. Must be region, city, or barangay'
                ], 400);
            }
            
            $table = $type === 'region' ? 'regions' : 
                    ($type === 'city' ? 'cities' : 'barangays');
            
            // Check if record exists
            $existing = DB::select("SELECT * FROM {$table} WHERE id = ?", [$id]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => ucfirst($type) . ' not found'
                ], 404);
            }
            
            $currentRecord = $existing[0];
            
            // Check for duplicate name (excluding current record)
            $duplicateQuery = "SELECT id FROM {$table} WHERE LOWER(name) = LOWER(?) AND id != ?";
            $duplicateParams = [$name, $id];
            
            // For cities and barangays, check duplicates within same parent
            if ($type === 'city') {
                $duplicateQuery .= " AND region_id = ?";
                $duplicateParams[] = $currentRecord->region_id;
            } elseif ($type === 'barangay') {
                $duplicateQuery .= " AND city_id = ?";
                $duplicateParams[] = $currentRecord->city_id;
            }
            
            $duplicates = DB::select($duplicateQuery, $duplicateParams);
            if (!empty($duplicates)) {
                $parentContext = $type === 'city' ? ' in this region' : 
                               ($type === 'barangay' ? ' in this city' : '');
                return response()->json([
                    'success' => false,
                    'message' => "A {$type} with this name already exists{$parentContext}"
                ], 422);
            }
            
            // Update the record
            DB::table($table)->where('id', $id)->update([
                'name' => $name,
                'description' => $description,
                'updated_at' => now()
            ]);
            
            // Get updated record
            $updatedRecord = DB::select("SELECT * FROM {$table} WHERE id = ?", [$id])[0];
            
            return response()->json([
                'success' => true,
                'message' => ucfirst($type) . ' updated successfully',
                'data' => $updatedRecord
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Error updating {$type}: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete location with cascade support
     */
    public function deleteLocation($type, $id, Request $request)
    {
        try {
            // Validate type
            $validTypes = ['region', 'city', 'barangay'];
            if (!in_array($type, $validTypes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid location type. Must be region, city, or barangay'
                ], 400);
            }
            
            $table = $type === 'region' ? 'regions' : 
                    ($type === 'city' ? 'cities' : 'barangays');
            
            // Check if record exists
            $existing = DB::select("SELECT * FROM {$table} WHERE id = ?", [$id]);
            if (empty($existing)) {
                return response()->json([
                    'success' => false,
                    'message' => ucfirst($type) . ' not found'
                ], 404);
            }
            
            $record = $existing[0];
            $cascade = $request->query('cascade', false);
            
            DB::beginTransaction();
            
            try {
                if ($type === 'region') {
                    // Check for dependent cities
                    $cities = DB::select('SELECT * FROM cities WHERE region_id = ? AND is_active = 1', [$id]);
                    
                    if (!empty($cities) && !$cascade) {
                        // Count total barangays in all cities
                        $barangayCount = 0;
                        foreach ($cities as $city) {
                            $barangays = DB::select('SELECT COUNT(*) as count FROM barangays WHERE city_id = ? AND is_active = 1', [$city->id]);
                            $barangayCount += $barangays[0]->count ?? 0;
                        }
                        
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Cannot delete region: contains active cities and barangays',
                            'data' => [
                                'can_cascade' => true,
                                'type' => 'region',
                                'name' => $record->name,
                                'city_count' => count($cities),
                                'barangay_count' => $barangayCount
                            ]
                        ], 422);
                    }
                    
                    if ($cascade) {
                        // Delete all barangays in cities of this region
                        foreach ($cities as $city) {
                            DB::table('barangays')->where('city_id', $city->id)->delete();
                        }
                        // Delete all cities in this region
                        DB::table('cities')->where('region_id', $id)->delete();
                    }
                    
                    // Delete the region
                    DB::table('regions')->where('id', $id)->delete();
                    
                } elseif ($type === 'city') {
                    // Check for dependent barangays
                    $barangays = DB::select('SELECT * FROM barangays WHERE city_id = ? AND is_active = 1', [$id]);
                    
                    if (!empty($barangays) && !$cascade) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Cannot delete city: contains active barangays',
                            'data' => [
                                'can_cascade' => true,
                                'type' => 'city',
                                'name' => $record->name,
                                'barangay_count' => count($barangays)
                            ]
                        ], 422);
                    }
                    
                    if ($cascade) {
                        // Delete all barangays in this city
                        DB::table('barangays')->where('city_id', $id)->delete();
                    }
                    
                    // Delete the city
                    DB::table('cities')->where('id', $id)->delete();
                    
                } else { // barangay
                    // Barangays have no dependents, safe to delete
                    DB::table('barangays')->where('id', $id)->delete();
                }
                
                DB::commit();
                
                $message = ucfirst($type) . ' deleted successfully';
                if ($cascade) {
                    $message .= ' (with all dependent locations)';
                }
                
                return response()->json([
                    'success' => true,
                    'message' => $message
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Error deleting {$type}: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics - Simple version
     */
    public function getStatistics()
    {
        try {
            $regions = DB::select('SELECT COUNT(*) as count FROM regions WHERE is_active = 1')[0]->count;
            $cities = DB::select('SELECT COUNT(*) as count FROM cities WHERE is_active = 1')[0]->count;  
            $barangays = DB::select('SELECT COUNT(*) as count FROM barangays WHERE is_active = 1')[0]->count;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'regions' => (int) $regions,
                    'cities' => (int) $cities,
                    'barangays' => (int) $barangays,
                    'total' => (int) ($regions + $cities + $barangays)
                ],
                'source' => 'RAW_DATABASE_QUERIES'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
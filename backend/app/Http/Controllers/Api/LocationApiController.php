<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use App\Models\City;
use App\Models\Barangay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class LocationApiController extends Controller
{
    /**
     * Get all regions
     */
    public function getRegions()
    {
        try {
            $regions = Region::active()
                ->orderBy('name')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $regions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch regions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cities by region
     */
    public function getCitiesByRegion($regionId)
    {
        try {
            $cities = City::active()
                ->where('region_id', $regionId)
                ->orderBy('name')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $cities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get barangays by city
     */
    public function getBarangaysByCity($cityId)
    {
        try {
            $barangays = Barangay::active()
                ->where('city_id', $cityId)
                ->orderBy('name')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $barangays
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch barangays',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all locations hierarchically
     */
    public function getAllLocations()
    {
        try {
            $regions = Region::active()
                ->with(['activeCities.activeBarangays'])
                ->orderBy('name')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $regions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch locations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new region
     */
    public function addRegion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check for duplicate region name (case-insensitive)
            $existingRegion = Region::whereRaw('LOWER(name) = ?', [strtolower($request->name)])->first();
            
            if ($existingRegion) {
                return response()->json([
                    'success' => false,
                    'message' => 'A region with this name already exists: ' . $existingRegion->name
                ], 422);
            }
            
            DB::beginTransaction();
            
            // Generate unique code
            $code = $this->generateCode($request->name, 'region');
            
            $region = Region::create([
                'code' => $code,
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => true
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Region added successfully',
                'data' => $region
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add region',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new city
     */
    public function addCity(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'region_id' => 'required|exists:regions,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check for duplicate city name within the same region (case-insensitive)
            $existingCity = City::where('region_id', $request->region_id)
                ->whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                ->first();
            
            if ($existingCity) {
                $region = Region::find($request->region_id);
                return response()->json([
                    'success' => false,
                    'message' => 'A city with this name already exists in ' . $region->name . ': ' . $existingCity->name
                ], 422);
            }
            
            DB::beginTransaction();
            
            // Generate unique code
            $code = $this->generateCode($request->name, 'city');
            
            $city = City::create([
                'region_id' => $request->region_id,
                'code' => $code,
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => true
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'City added successfully',
                'data' => $city
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add city',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new barangay
     */
    public function addBarangay(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check for duplicate barangay name within the same city (case-insensitive)
            $existingBarangay = Barangay::where('city_id', $request->city_id)
                ->whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                ->first();
            
            if ($existingBarangay) {
                $city = City::with('region')->find($request->city_id);
                return response()->json([
                    'success' => false,
                    'message' => 'A barangay with this name already exists in ' . $city->name . ': ' . $existingBarangay->name
                ], 422);
            }
            
            DB::beginTransaction();
            
            // Generate unique code
            $code = $this->generateCode($request->name, 'barangay');
            
            $barangay = Barangay::create([
                'city_id' => $request->city_id,
                'code' => $code,
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => true
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Barangay added successfully',
                'data' => $barangay
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add barangay',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update location by type
     */
    public function updateLocation($type, $id, Request $request)
    {
        $validTypes = ['region', 'city', 'barangay'];
        
        if (!in_array($type, $validTypes)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid location type'
            ], 422);
        }
        
        try {
            DB::beginTransaction();
            
            switch ($type) {
                case 'region':
                    $validator = Validator::make($request->all(), [
                        'name' => 'required|string|max:255',
                        'description' => 'nullable|string|max:500',
                    ]);
                    
                    if ($validator->fails()) {
                        return response()->json([
                            'success' => false,
                            'errors' => $validator->errors()
                        ], 422);
                    }
                    
                    $location = Region::find($id);
                    if (!$location) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Region not found'
                        ], 404);
                    }
                    
                    // Check for duplicate name excluding current record
                    $existing = Region::where('id', '!=', $id)
                        ->whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                        ->first();
                    
                    if ($existing) {
                        return response()->json([
                            'success' => false,
                            'message' => 'A region with this name already exists: ' . $existing->name
                        ], 422);
                    }
                    
                    $location->update([
                        'name' => $request->name,
                        'description' => $request->description
                    ]);
                    break;
                    
                case 'city':
                    $validator = Validator::make($request->all(), [
                        'region_id' => 'required|exists:regions,id',
                        'name' => 'required|string|max:255',
                        'description' => 'nullable|string|max:500',
                    ]);
                    
                    if ($validator->fails()) {
                        return response()->json([
                            'success' => false,
                            'errors' => $validator->errors()
                        ], 422);
                    }
                    
                    $location = City::find($id);
                    if (!$location) {
                        return response()->json([
                            'success' => false,
                            'message' => 'City not found'
                        ], 404);
                    }
                    
                    // Check for duplicate name in same region excluding current record
                    $existing = City::where('id', '!=', $id)
                        ->where('region_id', $request->region_id)
                        ->whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                        ->first();
                    
                    if ($existing) {
                        return response()->json([
                            'success' => false,
                            'message' => 'A city with this name already exists in this region: ' . $existing->name
                        ], 422);
                    }
                    
                    $location->update([
                        'region_id' => $request->region_id,
                        'name' => $request->name,
                        'description' => $request->description
                    ]);
                    break;
                    
                case 'barangay':
                    $validator = Validator::make($request->all(), [
                        'city_id' => 'required|exists:cities,id',
                        'name' => 'required|string|max:255',
                        'description' => 'nullable|string|max:500',
                    ]);
                    
                    if ($validator->fails()) {
                        return response()->json([
                            'success' => false,
                            'errors' => $validator->errors()
                        ], 422);
                    }
                    
                    $location = Barangay::find($id);
                    if (!$location) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Barangay not found'
                        ], 404);
                    }
                    
                    // Check for duplicate name in same city excluding current record
                    $existing = Barangay::where('id', '!=', $id)
                        ->where('city_id', $request->city_id)
                        ->whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                        ->first();
                    
                    if ($existing) {
                        return response()->json([
                            'success' => false,
                            'message' => 'A barangay with this name already exists in this city: ' . $existing->name
                        ], 422);
                    }
                    
                    $location->update([
                        'city_id' => $request->city_id,
                        'name' => $request->name,
                        'description' => $request->description
                    ]);
                    break;
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => ucfirst($type) . ' updated successfully',
                'data' => $location->fresh()
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update ' . $type,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete location by type
     */
    public function deleteLocation($type, $id, Request $request)
    {
        $validTypes = ['region', 'city', 'barangay'];
        
        if (!in_array($type, $validTypes)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid location type'
            ], 422);
        }
        
        // Check if cascade delete is requested
        $cascade = $request->query('cascade', 'false') === 'true';
        
        try {
            DB::beginTransaction();
            
            switch ($type) {
                case 'region':
                    $region = Region::find($id);
                    if (!$region) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Region not found'
                        ], 404);
                    }
                    
                    // Get counts for confirmation
                    $cityCount = City::where('region_id', $id)->count();
                    $barangayCount = Barangay::whereHas('city', function($query) use ($id) {
                        $query->where('region_id', $id);
                    })->count();
                    
                    if ($cityCount > 0 && !$cascade) {
                        return response()->json([
                            'success' => false,
                            'message' => "Cannot delete region '{$region->name}' that contains {$cityCount} cities and {$barangayCount} barangays.",
                            'data' => [
                                'can_cascade' => true,
                                'city_count' => $cityCount,
                                'barangay_count' => $barangayCount,
                                'type' => 'region',
                                'id' => $id,
                                'name' => $region->name
                            ]
                        ], 422);
                    }
                    
                    if ($cascade && $cityCount > 0) {
                        // Delete all barangays in cities of this region
                        Barangay::whereHas('city', function($query) use ($id) {
                            $query->where('region_id', $id);
                        })->delete();
                        
                        // Delete all cities in this region
                        City::where('region_id', $id)->delete();
                    }
                    
                    $region->delete();
                    $message = $cascade && $cityCount > 0 ? 
                        "Region '{$region->name}' and all its {$cityCount} cities and {$barangayCount} barangays deleted successfully" : 
                        "Region '{$region->name}' deleted successfully";
                    break;
                    
                case 'city':
                    $city = City::with('region')->find($id);
                    if (!$city) {
                        return response()->json([
                            'success' => false,
                            'message' => 'City not found'
                        ], 404);
                    }
                    
                    // Check if city has barangays
                    $barangayCount = Barangay::where('city_id', $id)->count();
                    if ($barangayCount > 0 && !$cascade) {
                        return response()->json([
                            'success' => false,
                            'message' => "Cannot delete city '{$city->name}' that contains {$barangayCount} barangays.",
                            'data' => [
                                'can_cascade' => true,
                                'barangay_count' => $barangayCount,
                                'type' => 'city',
                                'id' => $id,
                                'name' => $city->name
                            ]
                        ], 422);
                    }
                    
                    if ($cascade && $barangayCount > 0) {
                        // Delete all barangays in this city
                        Barangay::where('city_id', $id)->delete();
                    }
                    
                    $city->delete();
                    $message = $cascade && $barangayCount > 0 ? 
                        "City '{$city->name}' and all its {$barangayCount} barangays deleted successfully" : 
                        "City '{$city->name}' deleted successfully";
                    break;
                    
                case 'barangay':
                    $barangay = Barangay::with('city.region')->find($id);
                    if (!$barangay) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Barangay not found'
                        ], 404);
                    }
                    
                    $barangay->delete();
                    $message = "Barangay '{$barangay->name}' deleted successfully";
                    break;
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ' . $type,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get location statistics
     */
    public function getStatistics()
    {
        try {
            $stats = [
                'regions' => Region::active()->count(),
                'cities' => City::active()->count(),
                'barangays' => Barangay::active()->count(),
                'total' => Region::active()->count() + City::active()->count() + Barangay::active()->count()
            ];
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique code for location
     */
    private function generateCode($name, $type)
    {
        $prefix = strtoupper(substr($type, 0, 1));
        $nameSlug = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $name));
        $nameSlug = substr($nameSlug, 0, 10);
        $timestamp = time();
        
        return $prefix . '_' . $nameSlug . '_' . $timestamp;
    }
}

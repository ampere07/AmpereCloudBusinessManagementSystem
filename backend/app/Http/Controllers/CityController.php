<?php

namespace App\Http\Controllers;

use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CityController extends Controller
{
    /**
     * Display a listing of cities.
     */
    public function index(): JsonResponse
    {
        try {
            $cities = City::orderBy('name', 'asc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $cities,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cities',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified city.
     */
    public function show($id): JsonResponse
    {
        try {
            $city = City::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $city,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'City not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }
    
    /**
     * Get cities by region.
     */
    public function getByRegion($regionId): JsonResponse
    {
        try {
            $cities = City::where('region_id', $regionId)
                ->orderBy('name', 'asc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $cities,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cities by region',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

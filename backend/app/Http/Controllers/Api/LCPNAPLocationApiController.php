<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LCPNAPLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class LCPNAPLocationApiController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = LCPNAPLocation::with(['lcp', 'nap']);

            if ($request->has('lcp_nap_id')) {
                $query->where('id', $request->lcp_nap_id);
            }

            $locations = $query->get();

            $formattedLocations = $locations->map(function ($location, $index) {
                $baseLatitude = 14.5995;
                $baseLongitude = 120.9842;
                $offset = $index * 0.01;

                return [
                    'id' => $location->id,
                    'lcp_nap_id' => $location->id,
                    'lcpnap_name' => $location->lcpnap_name,
                    'lcp_name' => $location->lcp_name,
                    'nap_name' => $location->nap_name,
                    'location_name' => $location->lcpnap_name,
                    'latitude' => $baseLatitude + $offset,
                    'longitude' => $baseLongitude + $offset,
                    'address' => null,
                    'city' => null,
                    'region' => null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedLocations,
                'count' => $formattedLocations->count()
            ]);

        } catch (Exception $e) {
            Log::error('LCP/NAP Locations API error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch LCP/NAP locations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $location = LCPNAPLocation::with(['lcp', 'nap'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $location->id,
                    'lcp_nap_id' => $location->id,
                    'lcpnap_name' => $location->lcpnap_name,
                    'lcp_name' => $location->lcp_name,
                    'nap_name' => $location->nap_name,
                    'location_name' => $location->lcpnap_name,
                    'latitude' => 14.5995,
                    'longitude' => 120.9842,
                    'address' => null,
                    'city' => null,
                    'region' => null,
                ]
            ]);

        } catch (Exception $e) {
            Log::error('LCP/NAP Location show error', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'LCP/NAP location not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'lcpnap_name' => 'required|string|max:255',
                'lcp_id' => 'required|integer|exists:lcp,id',
                'nap_id' => 'required|integer|exists:nap,id',
            ]);

            $location = LCPNAPLocation::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'LCP/NAP location created successfully',
                'data' => $location
            ], 201);

        } catch (Exception $e) {
            Log::error('LCP/NAP Location create error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create LCP/NAP location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $location = LCPNAPLocation::findOrFail($id);

            $validated = $request->validate([
                'lcpnap_name' => 'sometimes|required|string|max:255',
                'lcp_id' => 'sometimes|required|integer|exists:lcp,id',
                'nap_id' => 'sometimes|required|integer|exists:nap,id',
            ]);

            $location->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'LCP/NAP location updated successfully',
                'data' => $location
            ]);

        } catch (Exception $e) {
            Log::error('LCP/NAP Location update error', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update LCP/NAP location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $location = LCPNAPLocation::findOrFail($id);
            $location->delete();

            return response()->json([
                'success' => true,
                'message' => 'LCP/NAP location deleted successfully'
            ]);

        } catch (Exception $e) {
            Log::error('LCP/NAP Location delete error', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete LCP/NAP location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatistics()
    {
        try {
            $total = LCPNAPLocation::count();
            $withLcp = LCPNAPLocation::whereNotNull('lcp_id')->count();
            $withNap = LCPNAPLocation::whereNotNull('nap_id')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_locations' => $total,
                    'with_lcp' => $withLcp,
                    'with_nap' => $withNap,
                ]
            ]);

        } catch (Exception $e) {
            Log::error('LCP/NAP Location statistics error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

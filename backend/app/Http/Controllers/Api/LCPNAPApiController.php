<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LCPNAP;
use App\Models\LCP;
use App\Models\NAP;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LCPNAPApiController extends Controller
{
    /**
     * Display a paginated listing of LCP NAP items.
     */
    public function index(Request $request)
    {
        try {
            $query = LCPNAP::with(['lcp', 'nap']);

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('lcpnap_name', 'LIKE', "%{$search}%");
                });
            }

            // Pagination
            $limit = $request->get('limit', 100);
            $page = $request->get('page', 1);
            
            $lcpnapItems = $query->orderBy('id', 'desc')
                                ->paginate($limit, ['*'], 'page', $page);

            // Transform data
            $transformedData = $lcpnapItems->getCollection()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'lcpnap_name' => $item->lcpnap_name,
                    'lcp_id' => $item->lcp_id,
                    'nap_id' => $item->nap_id,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedData,
                'pagination' => [
                    'current_page' => $lcpnapItems->currentPage(),
                    'total_pages' => $lcpnapItems->lastPage(),
                    'per_page' => $lcpnapItems->perPage(),
                    'total_items' => $lcpnapItems->total(),
                    'from' => $lcpnapItems->firstItem(),
                    'to' => $lcpnapItems->lastItem(),
                ],
                'message' => 'LCP NAP items retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve LCP NAP items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created LCP NAP item.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'lcpnap_name' => 'required|string|max:255|unique:lcpnap,lcpnap_name',
                'lcp_id' => 'required|integer|exists:lcp,id',
                'nap_id' => 'required|integer|exists:nap,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $lcpnapItem = LCPNAP::create($request->only(['lcpnap_name', 'lcp_id', 'nap_id']));

            return response()->json([
                'success' => true,
                'data' => $lcpnapItem,
                'message' => 'LCP NAP item created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create LCP NAP item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified LCP NAP item.
     */
    public function show($id)
    {
        try {
            $lcpnapItem = LCPNAP::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $lcpnapItem->id,
                    'lcpnap_name' => $lcpnapItem->lcpnap_name,
                    'lcp_id' => $lcpnapItem->lcp_id,
                    'nap_id' => $lcpnapItem->nap_id,
                ],
                'message' => 'LCP NAP item retrieved successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'LCP NAP item not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve LCP NAP item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $lcpnapItem = LCPNAP::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'lcpnap_name' => 'required|string|max:255|unique:lcpnap,lcpnap_name,' . $id,
                'lcp_id' => 'required|integer|exists:lcp,id',
                'nap_id' => 'required|integer|exists:nap,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $lcpnapItem->update($request->only(['lcpnap_name', 'lcp_id', 'nap_id']));

            return response()->json([
                'success' => true,
                'data' => $lcpnapItem->fresh(),
                'message' => 'LCP NAP item updated successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'LCP NAP item not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update LCP NAP item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $lcpnapItem = LCPNAP::findOrFail($id);
            $lcpnapItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'LCP NAP item deleted successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'LCP NAP item not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete LCP NAP item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatistics()
    {
        try {
            $stats = [
                'total_items' => LCPNAP::count(),
                'recent_additions' => LCPNAP::latest('id')->limit(5)->get()->map(function($item) {
                    return [
                        'id' => $item->id,
                        'lcpnap_name' => $item->lcpnap_name,
                        'lcp_id' => $item->lcp_id,
                        'nap_id' => $item->nap_id,
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLookupData()
    {
        try {
            $data = [
                'lcps' => LCP::select('id', 'lcp_name')->get(),
                'naps' => NAP::select('id', 'nap_name')->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Lookup data retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve lookup data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

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
                    $q->where('LCPNAP_ID', 'LIKE', "%{$search}%")
                    ->orWhere('street', 'LIKE', "%{$search}%")
                    ->orWhere('barangay', 'LIKE', "%{$search}%")
                    ->orWhere('city', 'LIKE', "%{$search}%")
                    ->orWhere('region', 'LIKE', "%{$search}%")
                    ->orWhere('Combined_Location', 'LIKE', "%{$search}%");
                });
            }

            // Filtering
            if ($request->has('region') && !empty($request->region)) {
                $query->where('region', $request->region);
            }
            if ($request->has('city') && !empty($request->city)) {
                $query->where('city', $request->city);
            }
            if ($request->has('port_total') && !empty($request->port_total)) {
                $query->where('port_total', $request->port_total);
            }

            // Pagination
            $limit = $request->get('limit', 10);
            $page = $request->get('page', 1);
            
            $lcpnapItems = $query->orderBy('created_at', 'desc')
                                ->paginate($limit, ['*'], 'page', $page);

            // Transform data to include image URLs
            $transformedData = $lcpnapItems->getCollection()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'lcpnap' => $item->LCPNAP_ID,
                    'lcp_id' => $item->lcp_id,
                    'lcp' => $item->lcp ? $item->lcp->lcp_name : null,
                    'nap_id' => $item->nap_id,
                    'nap' => $item->nap ? $item->nap->nap_name : null,
                    'port_total' => $item->port_total,
                    'street' => $item->street,
                    'barangay' => $item->barangay,
                    'city' => $item->city,
                    'region' => $item->region,
                    'coordinates' => $item->coordinates,
                    'image' => $item->image,
                    'image_url' => $item->image ? asset('storage/lcpnap/images/' . $item->image) : null,
                    'image2' => $item->image2,
                    'image2_url' => $item->image2 ? asset('storage/lcpnap/images/' . $item->image2) : null,
                    'reading_image' => $item->reading_image,
                    'reading_image_url' => $item->reading_image ? asset('storage/lcpnap/reading-images/' . $item->reading_image) : null,
                    'modified_by' => $item->modified_by,
                    'modified_date' => $item->modified_date,
                    'related_billing_details' => $item->Combined_Location,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
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
                'lcpnap' => 'required|string|max:255',
                'lcp_id' => 'required|integer|exists:lcp,id',
                'nap_id' => 'required|integer|exists:nap,id',
                'port_total' => 'required|integer|in:8,16,32',
                'street' => 'nullable|string|max:255',
                'barangay' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'region' => 'nullable|string|max:255',
                'coordinates' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'image2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'reading_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'related_billing_details' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check for duplicate LCPNAP_ID
            $exists = LCPNAP::where('LCPNAP_ID', $request->lcpnap)->first();
            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'LCPNAP with this ID already exists',
                    'errors' => ['lcpnap' => ['LCPNAP ID must be unique']]
                ], 422);
            }

            $data = [
                'LCPNAP_ID' => $request->lcpnap,
                'lcp_id' => $request->lcp_id,
                'nap_id' => $request->nap_id,
                'port_total' => $request->port_total,
                'street' => $request->street,
                'barangay' => $request->barangay,
                'city' => $request->city,
                'region' => $request->region,
                'coordinates' => $request->coordinates,
                'Combined_Location' => $request->related_billing_details ?? '',
                'modified_by' => $request->get('modified_by', 'ravenampere0123@gmail.com'),
                'modified_date' => now(),
            ];

            // Handle file uploads
            if ($request->hasFile('image')) {
                $data['image'] = $this->uploadImage($request->file('image'), 'images');
            }
            if ($request->hasFile('image2')) {
                $data['image2'] = $this->uploadImage($request->file('image2'), 'images');
            }
            if ($request->hasFile('reading_image')) {
                $data['reading_image'] = $this->uploadImage($request->file('reading_image'), 'reading-images');
            }

            $lcpnapItem = LCPNAP::create($data);

            return response()->json([
                'success' => true,
                'data' => $lcpnapItem->load(['lcp', 'nap']),
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
            $lcpnapItem = LCPNAP::with(['lcp', 'nap'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $lcpnapItem->id,
                    'lcpnap' => $lcpnapItem->LCPNAP_ID,
                    'lcp_id' => $lcpnapItem->lcp_id,
                    'lcp' => $lcpnapItem->lcp ? $lcpnapItem->lcp->lcp_name : null,
                    'nap_id' => $lcpnapItem->nap_id,
                    'nap' => $lcpnapItem->nap ? $lcpnapItem->nap->nap_name : null,
                    'port_total' => $lcpnapItem->port_total,
                    'street' => $lcpnapItem->street,
                    'barangay' => $lcpnapItem->barangay,
                    'city' => $lcpnapItem->city,
                    'region' => $lcpnapItem->region,
                    'coordinates' => $lcpnapItem->coordinates,
                    'image' => $lcpnapItem->image,
                    'image_url' => $lcpnapItem->image ? asset('storage/lcpnap/images/' . $lcpnapItem->image) : null,
                    'image2' => $lcpnapItem->image2,
                    'image2_url' => $lcpnapItem->image2 ? asset('storage/lcpnap/images/' . $lcpnapItem->image2) : null,
                    'reading_image' => $lcpnapItem->reading_image,
                    'reading_image_url' => $lcpnapItem->reading_image ? asset('storage/lcpnap/reading-images/' . $lcpnapItem->reading_image) : null,
                    'modified_by' => $lcpnapItem->modified_by,
                    'modified_date' => $lcpnapItem->modified_date,
                    'related_billing_details' => $lcpnapItem->Combined_Location,
                    'created_at' => $lcpnapItem->created_at,
                    'updated_at' => $lcpnapItem->updated_at,
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

    /**
     * Update the specified LCP NAP item.
     */
    public function update(Request $request, $id)
    {
        try {
            $lcpnapItem = LCPNAP::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'lcpnap' => 'required|string|max:255',
                'lcp_id' => 'required|integer|exists:lcp,id',
                'nap_id' => 'required|integer|exists:nap,id',
                'port_total' => 'required|integer|in:8,16,32',
                'street' => 'nullable|string|max:255',
                'barangay' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'region' => 'nullable|string|max:255',
                'coordinates' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'image2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'reading_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'related_billing_details' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check for duplicate LCPNAP_ID (excluding current item)
            $exists = LCPNAP::where('LCPNAP_ID', $request->lcpnap)
                ->where('id', '!=', $id)
                ->first();
            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'LCPNAP with this ID already exists',
                    'errors' => ['lcpnap' => ['LCPNAP ID must be unique']]
                ], 422);
            }

            $data = [
                'LCPNAP_ID' => $request->lcpnap,
                'lcp_id' => $request->lcp_id,
                'nap_id' => $request->nap_id,
                'port_total' => $request->port_total,
                'street' => $request->street,
                'barangay' => $request->barangay,
                'city' => $request->city,
                'region' => $request->region,
                'coordinates' => $request->coordinates,
                'Combined_Location' => $request->related_billing_details ?? '',
                'modified_by' => $request->get('modified_by', 'ravenampere0123@gmail.com'),
                'modified_date' => now(),
            ];

            // Handle file uploads and deletions
            if ($request->hasFile('image')) {
                // Delete old image
                if ($lcpnapItem->image) {
                    Storage::disk('public')->delete('lcpnap/images/' . $lcpnapItem->image);
                }
                $data['image'] = $this->uploadImage($request->file('image'), 'images');
            }

            if ($request->hasFile('image2')) {
                // Delete old image
                if ($lcpnapItem->image2) {
                    Storage::disk('public')->delete('lcpnap/images/' . $lcpnapItem->image2);
                }
                $data['image2'] = $this->uploadImage($request->file('image2'), 'images');
            }

            if ($request->hasFile('reading_image')) {
                // Delete old image
                if ($lcpnapItem->reading_image) {
                    Storage::disk('public')->delete('lcpnap/reading-images/' . $lcpnapItem->reading_image);
                }
                $data['reading_image'] = $this->uploadImage($request->file('reading_image'), 'reading-images');
            }

            $lcpnapItem->update($data);

            return response()->json([
                'success' => true,
                'data' => $lcpnapItem->fresh()->load(['lcp', 'nap']),
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

    /**
     * Remove the specified LCP NAP item from storage.
     */
    public function destroy($id)
    {
        try {
            $lcpnapItem = LCPNAP::findOrFail($id);

            // Delete associated files
            if ($lcpnapItem->image) {
                Storage::disk('public')->delete('lcpnap/images/' . $lcpnapItem->image);
            }
            if ($lcpnapItem->image2) {
                Storage::disk('public')->delete('lcpnap/images/' . $lcpnapItem->image2);
            }
            if ($lcpnapItem->reading_image) {
                Storage::disk('public')->delete('lcpnap/reading-images/' . $lcpnapItem->reading_image);
            }

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

    /**
     * Get statistics for LCP NAP items.
     */
    public function getStatistics()
    {
        try {
            $stats = [
                'total_items' => LCPNAP::count(),
                'by_port_total' => [
                    '8_port' => LCPNAP::where('port_total', 8)->count(),
                    '16_port' => LCPNAP::where('port_total', 16)->count(),
                    '32_port' => LCPNAP::where('port_total', 32)->count(),
                ],
                'by_region' => LCPNAP::selectRaw('region, COUNT(*) as count')
                    ->whereNotNull('region')
                    ->groupBy('region')
                    ->orderBy('count', 'desc')
                    ->limit(10)
                    ->pluck('count', 'region'),
                'recent_additions' => LCPNAP::with(['lcp', 'nap'])->latest()->limit(5)->get()->map(function($item) {
                    return [
                        'id' => $item->id,
                        'lcpnap' => $item->LCPNAP_ID,
                        'lcp' => $item->lcp ? $item->lcp->lcp_name : null,
                        'nap' => $item->nap ? $item->nap->nap_name : null,
                        'created_at' => $item->created_at
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

    /**
     * Upload image file to storage.
     */
    private function uploadImage($file, $folder)
    {
        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('lcpnap/' . $folder, $filename, 'public');
        return $filename;
    }

    /**
     * Get lookup data for dropdowns.
     */
    public function getLookupData()
    {
        try {
            $data = [
                'lcps' => LCP::select('id', 'lcp_name')->get(),
                'naps' => NAP::select('id', 'nap_name')->get(),
                'regions' => LCPNAP::distinct()->pluck('region')->filter()->values(),
                'cities' => LCPNAP::distinct()->pluck('city')->filter()->values(),
                'barangays' => LCPNAP::distinct()->pluck('barangay')->filter()->values(),
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

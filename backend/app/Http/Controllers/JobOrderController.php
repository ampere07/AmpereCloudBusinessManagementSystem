<?php

namespace App\Http\Controllers;

use App\Models\JobOrder;
use App\Models\ModemRouterSN;
use App\Models\ContractTemplate;
use App\Models\LCP;
use App\Models\NAP;
use App\Models\Port;
use App\Models\VLAN;
use App\Models\LCPNAP;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class JobOrderController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            // Log that we're accessing the job_orders table
            \Log::info('Accessing job_orders table');
            
            $jobOrders = JobOrder::with([
                'application',
                'modemRouterSN',
                'contractTemplate',
                'lcp',
                'nap',
                'port',
                'vlan',
                'lcpnap'
            ])->get();

            // Log the count of job orders found
            \Log::info('Found ' . $jobOrders->count() . ' job orders in database');
            
            // Check if we got any job orders
            if ($jobOrders->isEmpty()) {
                \Log::info('No job orders found in database');
            } else {
                // Log the first job order for debugging
                \Log::info('First job order example:', $jobOrders->first()->toArray());
            }

            return response()->json([
                'success' => true,
                'data' => $jobOrders,
                'table' => 'job_orders',
                'count' => $jobOrders->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching job orders: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch job orders',
                'error' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'Application_ID' => 'nullable|integer|exists:app_applications,id',
                'First_Name' => 'nullable|string|max:255',
                'Last_Name' => 'nullable|string|max:255',
                'Contact_Number' => 'nullable|string|max:255',
                'Email_Address' => 'nullable|email|max:255',
                'Installation_Fee' => 'nullable|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Convert empty strings or undefined to null for relationships
            $data = $request->all();
            foreach(['LCP', 'NAP', 'PORT', 'VLAN', 'LCPNAP', 'Modem_Router_SN'] as $field) {
                if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                    $data[$field] = null;
                }
            }
            
            $jobOrder = JobOrder::create($data);

            $jobOrder->load([
                'application',
                'modemRouterSN',
                'contractTemplate',
                'lcp',
                'nap',
                'port',
                'vlan',
                'lcpnap'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Job order created successfully',
                'data' => $jobOrder,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create job order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $jobOrder = JobOrder::with([
                'application',
                'modemRouterSN',
                'contractTemplate',
                'lcp',
                'nap',
                'port',
                'vlan',
                'lcpnap'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $jobOrder,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Job order not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $jobOrder = JobOrder::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'Application_ID' => 'nullable|integer|exists:app_applications,id',
                'First_Name' => 'nullable|string|max:255',
                'Last_Name' => 'nullable|string|max:255',
                'Contact_Number' => 'nullable|string|max:255',
                'Email_Address' => 'nullable|email|max:255',
                'Installation_Fee' => 'nullable|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Convert empty strings or undefined to null for relationships
            $data = $request->all();
            foreach(['LCP', 'NAP', 'PORT', 'VLAN', 'LCPNAP', 'Modem_Router_SN'] as $field) {
                if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                    $data[$field] = null;
                }
            }
            
            $jobOrder->update($data);

            $jobOrder->load([
                'application',
                'modemRouterSN',
                'contractTemplate',
                'lcp',
                'nap',
                'port',
                'vlan',
                'lcpnap'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Job order updated successfully',
                'data' => $jobOrder,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update job order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $jobOrder = JobOrder::findOrFail($id);
            $jobOrder->delete();

            return response()->json([
                'success' => true,
                'message' => 'Job order deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete job order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Lookup table methods
    public function getModemRouterSNs(): JsonResponse
    {
        try {
            $modems = ModemRouterSN::all();
            return response()->json([
                'success' => true,
                'data' => $modems,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch modem router SNs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getContractTemplates(): JsonResponse
    {
        try {
            $templates = ContractTemplate::all();
            return response()->json([
                'success' => true,
                'data' => $templates,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch contract templates',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getLCPs(): JsonResponse
    {
        try {
            $lcps = LCP::all();
            return response()->json([
                'success' => true,
                'data' => $lcps,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch LCPs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getNAPs(): JsonResponse
    {
        try {
            $naps = NAP::all();
            return response()->json([
                'success' => true,
                'data' => $naps,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch NAPs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getPorts(): JsonResponse
    {
        try {
            $ports = Port::all();
            return response()->json([
                'success' => true,
                'data' => $ports,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch ports',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getVLANs(): JsonResponse
    {
        try {
            $vlans = VLAN::all();
            return response()->json([
                'success' => true,
                'data' => $vlans,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch VLANs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getLCPNAPs(): JsonResponse
    {
        try {
            $lcpnaps = LCPNAP::all();
            return response()->json([
                'success' => true,
                'data' => $lcpnaps,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch LCPNAPs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

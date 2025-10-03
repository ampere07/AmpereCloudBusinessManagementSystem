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
            \Log::info('Accessing job_orders table');
            
            $jobOrders = JobOrder::with('application')->get();

            \Log::info('Found ' . $jobOrders->count() . ' job orders in database');
            
            if ($jobOrders->isEmpty()) {
                \Log::info('No job orders found in database');
            } else {
                \Log::info('First job order example:', $jobOrders->first()->toArray());
            }

            $formattedJobOrders = $jobOrders->map(function ($jobOrder) {
                $application = $jobOrder->application;
                
                return [
                    'id' => $jobOrder->id,
                    'JobOrder_ID' => $jobOrder->id,
                    'Timestamp' => $jobOrder->timestamp ? $jobOrder->timestamp->format('Y-m-d H:i:s') : null,
                    'Installation_Fee' => $jobOrder->installation_fee,
                    'Billing_Day' => $jobOrder->billing_day,
                    'Onsite_Status' => $jobOrder->onsite_status,
                    'billing_status_id' => $jobOrder->billing_status_id,
                    'Status_Remarks' => $jobOrder->status_remarks_id,
                    'Assigned_Email' => null,
                    'Contract_Template' => $jobOrder->modem_router_sn,
                    'Modified_By' => $jobOrder->created_by_user_email,
                    'Modified_Date' => $jobOrder->updated_at ? $jobOrder->updated_at->format('Y-m-d H:i:s') : null,
                    'Username' => $jobOrder->username,
                    
                    'First_Name' => $application ? $application->first_name : null,
                    'Middle_Initial' => $application ? $application->middle_initial : null,
                    'Last_Name' => $application ? $application->last_name : null,
                    'Address' => $application ? $application->installation_address : null,
                    'Village' => $application ? $application->village : null,
                    'City' => $application ? $application->city : null,
                    'Region' => $application ? $application->region : null,
                    'Barangay' => $application ? $application->barangay : null,
                    'Email_Address' => $application ? $application->email_address : null,
                    'Mobile_Number' => $application ? $application->mobile_number : null,
                    'Secondary_Mobile_Number' => $application ? $application->secondary_mobile_number : null,
                    'Desired_Plan' => $application ? $application->desired_plan : null,
                    'Referred_By' => $application ? $application->referred_by : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedJobOrders,
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
                'application_id' => 'nullable|integer|exists:applications,id',
                'timestamp' => 'nullable|date',
                'installation_fee' => 'nullable|numeric|min:0',
                'billing_day' => 'nullable|integer|min:0',
                'billing_status_id' => 'nullable|integer|exists:billing_status,id',
                'onsite_status' => 'nullable|string|max:255',
                'username' => 'nullable|string|max:255',
                'created_by_user_email' => 'nullable|email|max:255',
                'updated_by_user_email' => 'nullable|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $request->all();
            
            $jobOrder = JobOrder::create($data);

            $jobOrder->load('application');

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
            $jobOrder = JobOrder::with('application')->findOrFail($id);

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
                'application_id' => 'nullable|integer|exists:applications,id',
                'timestamp' => 'nullable|date',
                'installation_fee' => 'nullable|numeric|min:0',
                'billing_day' => 'nullable|integer|min:0',
                'onsite_status' => 'nullable|string|max:255',
                'username' => 'nullable|string|max:255',
                'created_by_user_email' => 'nullable|email|max:255',
                'updated_by_user_email' => 'nullable|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $request->all();
            
            $jobOrder->update($data);

            $jobOrder->load('application');

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

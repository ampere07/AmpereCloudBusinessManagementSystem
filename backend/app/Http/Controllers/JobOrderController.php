<?php

namespace App\Http\Controllers;

use App\Models\JobOrder;
use App\Models\Customer;
use App\Models\TechnicalDetail;
use App\Models\BillingAccount;
use App\Models\Application;
use App\Models\ModemRouterSN;
use App\Models\ContractTemplate;
use App\Models\Port;
use App\Models\VLAN;
use App\Models\LCPNAP;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JobOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            \Log::info('Accessing job_orders table');
            
            $query = JobOrder::with('application');
            
            if ($request->has('assigned_email')) {
                $assignedEmail = $request->query('assigned_email');
                \Log::info('Filtering job orders by assigned_email: ' . $assignedEmail);
                $query->where('assigned_email', $assignedEmail);
            }
            
            $jobOrders = $query->get();

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
                    'application_id' => $jobOrder->application_id,
                    'Timestamp' => $jobOrder->timestamp ? $jobOrder->timestamp->format('Y-m-d H:i:s') : null,
                    'Installation_Fee' => $jobOrder->installation_fee,
                    'Billing_Day' => $jobOrder->billing_day,
                    'Onsite_Status' => $jobOrder->onsite_status,
                    'billing_status_id' => $jobOrder->billing_status_id,
                    'Status_Remarks' => $jobOrder->status_remarks,
                    'Assigned_Email' => $jobOrder->assigned_email,
                    'Contract_Template' => $jobOrder->contract_link,
                    'Modified_By' => $jobOrder->created_by_user_email,
                    'Modified_Date' => $jobOrder->updated_at ? $jobOrder->updated_at->format('Y-m-d H:i:s') : null,
                    'Username' => $jobOrder->username,
                    'group_name' => $jobOrder->group_name,
                    'pppoe_username' => $jobOrder->pppoe_username,
                    'pppoe_password' => $jobOrder->pppoe_password,
                    
                    // Technical fields from job_orders table
                    'date_installed' => $jobOrder->date_installed,
                    'usage_type' => $jobOrder->usage_type,
                    'connection_type' => $jobOrder->connection_type,
                    'router_model' => $jobOrder->router_model,
                    'modem_router_sn' => $jobOrder->modem_router_sn,
                    'Modem_SN' => $jobOrder->modem_router_sn,  // Alias for frontend compatibility
                    'modem_sn' => $jobOrder->modem_router_sn,  // Alias for frontend compatibility
                    'lcpnap' => $jobOrder->lcpnap,
                    'port' => $jobOrder->port,
                    'vlan' => $jobOrder->vlan,
                    'visit_by' => $jobOrder->visit_by,
                    'visit_with' => $jobOrder->visit_with,
                    'visit_with_other' => $jobOrder->visit_with_other,
                    'ip_address' => $jobOrder->ip_address,
                    'address_coordinates' => $jobOrder->address_coordinates,
                    'onsite_remarks' => $jobOrder->onsite_remarks,
                    
                    'First_Name' => $application ? $application->first_name : null,
                    'Middle_Initial' => $application ? $application->middle_initial : null,
                    'Last_Name' => $application ? $application->last_name : null,
                    'Address' => $application ? $application->installation_address : null,
                    'Installation_Address' => $application ? $application->installation_address : null,
                    'Location' => $application ? $application->location : null,
                    'City' => $application ? $application->city : null,
                    'Region' => $application ? $application->region : null,
                    'Barangay' => $application ? $application->barangay : null,
                    'Email_Address' => $application ? $application->email_address : null,
                    'Mobile_Number' => $application ? $application->mobile_number : null,
                    'Secondary_Mobile_Number' => $application ? $application->secondary_mobile_number : null,
                    'Desired_Plan' => $application ? $application->desired_plan : null,
                    'Referred_By' => $application ? $application->referred_by : null,
                    'Billing_Status' => $jobOrder->billing_status_id,
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
                'assigned_email' => 'nullable|email|max:255',
                'onsite_remarks' => 'nullable|string',
                'status_remarks' => 'nullable|string|max:255',
                'modem_router_sn' => 'nullable|string|max:255',
                'username' => 'nullable|string|max:255',
                'group_name' => 'nullable|string|max:255',
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
            \Log::info('JobOrder Update Request', [
                'id' => $id,
                'request_data' => $request->all()
            ]);

            $jobOrder = JobOrder::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'application_id' => 'nullable|integer|exists:applications,id',
                'timestamp' => 'nullable|date',
                'date_installed' => 'nullable|date',
                'installation_fee' => 'nullable|numeric|min:0',
                'billing_day' => 'nullable|integer|min:0',
                'onsite_status' => 'nullable|string|max:100',
                'assigned_email' => 'nullable|email|max:255',
                'onsite_remarks' => 'nullable|string',
                'status_remarks' => 'nullable|string|max:255',
                'modem_router_sn' => 'nullable|string|max:255',
                'router_model' => 'nullable|string|max:255',
                'connection_type' => 'nullable|string|max:100',
                'usage_type' => 'nullable|string|max:255',
                'ip_address' => 'nullable|string|max:45',
                'lcpnap' => 'nullable|string|max:255',
                'port' => 'nullable|string|max:255',
                'vlan' => 'nullable|string|max:255',
                'visit_by' => 'nullable|string|max:255',
                'visit_with' => 'nullable|string|max:255',
                'visit_with_other' => 'nullable|string|max:255',
                'address_coordinates' => 'nullable|string|max:255',
                'username' => 'nullable|string|max:255',
                'group_name' => 'nullable|string|max:255',
                'pppoe_username' => 'nullable|string|max:255',
                'pppoe_password' => 'nullable|string|max:255',
                'created_by_user_email' => 'nullable|email|max:255',
                'updated_by_user_email' => 'nullable|email|max:255',
            ]);

            if ($validator->fails()) {
                \Log::error('JobOrder Update Validation Failed', [
                    'id' => $id,
                    'errors' => $validator->errors()->toArray()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $request->all();
            
            \Log::info('JobOrder Updating with data', [
                'id' => $id,
                'data' => $data
            ]);

            $jobOrder->update($data);

            \Log::info('JobOrder Updated Successfully', [
                'id' => $id,
                'updated_fields' => array_keys($data)
            ]);

            $jobOrder->load('application');

            return response()->json([
                'success' => true,
                'message' => 'Job order updated successfully',
                'data' => $jobOrder,
            ]);
        } catch (\Exception $e) {
            \Log::error('JobOrder Update Failed', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

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

    public function approve($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $jobOrder = JobOrder::with('application')->findOrFail($id);
            
            if (!$jobOrder->application) {
                throw new \Exception('Job order must have an associated application');
            }

            $application = $jobOrder->application;
            
            $defaultUserId = 1;

            $customer = Customer::create([
                'first_name' => $application->first_name,
                'middle_initial' => $application->middle_initial,
                'last_name' => $application->last_name,
                'email_address' => $application->email_address,
                'contact_number_primary' => $application->mobile_number,
                'contact_number_secondary' => $application->secondary_mobile_number,
                'address' => $application->installation_address,
                'barangay' => $application->barangay,
                'city' => $application->city,
                'region' => $application->region,
                'address_coordinates' => null,
                'housing_status' => null,
                'referred_by' => $application->referred_by,
                'desired_plan' => $application->desired_plan,
                'created_by' => $defaultUserId,
                'updated_by' => $defaultUserId,
            ]);

            $currentYear = date('Y');
            $yearPrefix = $currentYear;
            
            $latestAccount = BillingAccount::where('account_no', 'LIKE', $yearPrefix . '%')
                ->orderBy('account_no', 'desc')
                ->first();
            
            if ($latestAccount) {
                $lastNumber = (int) substr($latestAccount->account_no, 4);
                $nextNumber = $lastNumber + 1;
            } else {
                $nextNumber = 1;
            }
            
            $accountNumber = $yearPrefix . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

            $billingAccount = BillingAccount::create([
                'customer_id' => $customer->id,
                'account_no' => $accountNumber,
                'date_installed' => $jobOrder->date_installed ?? now(),
                'plan_id' => null,
                'account_balance' => 0,
                'balance_update_date' => now(),
                'billing_day' => $jobOrder->billing_day,
                'billing_status_id' => 2,
                'created_by' => $defaultUserId,
                'updated_by' => $defaultUserId,
            ]);

            $lastName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $application->last_name ?? 'user'));
            $mobileNumber = preg_replace('/[^0-9]/', '', $application->mobile_number ?? '');
            $usernameForTechnical = $lastName . $mobileNumber;
            
            $existingUsername = TechnicalDetail::where('username', $usernameForTechnical)->first();
            if ($existingUsername) {
                $usernameForTechnical = $usernameForTechnical . '_' . time();
            }

            $modemSN = $jobOrder->modem_router_sn;
            if ($modemSN) {
                $existingModemSN = TechnicalDetail::where('router_modem_sn', $modemSN)->first();
                if ($existingModemSN) {
                    $modemSN = $modemSN . '_' . time();
                }
            }

            $technicalDetail = TechnicalDetail::create([
                'account_id' => $billingAccount->id,
                'username' => $usernameForTechnical,
                'username_status' => $jobOrder->username_status,
                'connection_type' => $jobOrder->connection_type,
                'router_model' => $jobOrder->router_model,
                'router_modem_sn' => $modemSN,
                'ip_address' => $jobOrder->ip_address,
                'port' => $jobOrder->port,
                'vlan' => $jobOrder->vlan,
                'lcpnap' => $jobOrder->lcpnap,
                'usage_type_id' => $jobOrder->usage_type_id,
                'created_by' => $defaultUserId,
                'updated_by' => $defaultUserId,
            ]);

            $jobOrder->update([
                'billing_status_id' => 2,
                'account_id' => $billingAccount->id,
                'updated_by_user_email' => 'system@ampere.com'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Job order approved successfully',
                'data' => [
                    'customer_id' => $customer->id,
                    'billing_account_id' => $billingAccount->id,
                    'technical_detail_id' => $technicalDetail->id,
                    'account_number' => $accountNumber,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error approving job order: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve job order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

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

    public function createRadiusAccount(Request $request, $id): JsonResponse
    {
        try {
            $jobOrder = JobOrder::with('application')->findOrFail($id);

            if (!$jobOrder->application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job order must have an associated application',
                ], 400);
            }

            $application = $jobOrder->application;

            $lastName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $application->last_name ?? ''));
            $mobileNumber = preg_replace('/[^0-9]/', '', $application->mobile_number ?? '');
            $username = $lastName . $mobileNumber;

            if (empty($username) || strlen($username) < 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to generate username from application data',
                ], 400);
            }

            $planName = $application->desired_plan;
            if (empty($planName)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan name is required to create radius account. No desired_plan found in application.',
                ], 400);
            }
            
            // Extract plan name only (e.g., "FLASH - P1299.00" becomes "FLASH")
            if (strpos($planName, ' - P') !== false) {
                $planName = trim(explode(' - P', $planName)[0]);
            }

            Log::info('RADIUS Account Creation - Input Data', [
                'job_order_id' => $id,
                'last_name' => $lastName,
                'mobile_number' => $mobileNumber,
                'generated_username' => $username,
                'original_plan' => $application->desired_plan,
                'extracted_plan_name' => $planName,
            ]);

            $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $password = '';
            $charactersLength = strlen($characters);
            for ($i = 0; $i < 12; $i++) {
                $password .= $characters[random_int(0, $charactersLength - 1)];
            }

            $modifiedUsername = str_replace(['|', 'ñ'], ['i', 'n'], $username);

            $primaryUrl = 'https://103.121.65.24:8729/rest/user-manage/user';
            $backupUrl = 'https://103.121.65.24:8729/rest/user-manage/user';
            $radiusUsername = 'googleapi';
            $radiusPassword = 'Edward123@';

            $payload = [
                'name' => $modifiedUsername,
                'group' => $planName,
                'password' => $password
            ];

            Log::info('Creating RADIUS account', [
                'job_order_id' => $id,
                'username' => $modifiedUsername,
                'group' => $planName,
                'payload' => $payload,
            ]);

            $response = Http::withBasicAuth($radiusUsername, $radiusPassword)
                ->withOptions([
                    'verify' => false,
                    'timeout' => 10,
                ])
                ->put($primaryUrl, $payload);

            if (!$response->successful()) {
                Log::warning('Primary RADIUS server request failed, trying backup URL', [
                    'primary_url' => $primaryUrl,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                $response = Http::withBasicAuth($radiusUsername, $radiusPassword)
                    ->withOptions([
                        'verify' => false,
                        'timeout' => 10,
                    ])
                    ->put($backupUrl, $payload);
            }

            if (!$response->successful()) {
                $errorBody = $response->body();
                $errorData = json_decode($errorBody, true);
                
                Log::error('RADIUS account creation failed on both primary and backup', [
                    'job_order_id' => $id,
                    'username' => $modifiedUsername,
                    'group' => $planName,
                    'primary_url' => $primaryUrl,
                    'backup_url' => $backupUrl,
                    'status' => $response->status(),
                    'body' => $errorBody,
                    'error_detail' => $errorData['detail'] ?? 'Unknown error',
                ]);

                $errorMessage = 'Failed to create RADIUS account on both primary and backup servers';
                if (isset($errorData['detail'])) {
                    if (strpos($errorData['detail'], 'input does not match any value of group') !== false) {
                        $errorMessage = "The plan '{$planName}' does not exist in the RADIUS server. Please verify the plan name matches exactly with a group in the RADIUS server.";
                    } else {
                        $errorMessage .= ': ' . $errorData['detail'];
                    }
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
                    'error' => $errorBody,
                    'debug_info' => [
                        'username' => $modifiedUsername,
                        'group_sent' => $planName,
                        'radius_error' => $errorData['detail'] ?? 'Unknown',
                    ],
                ], 500);
            }

            Log::info('RADIUS account created successfully', [
                'job_order_id' => $id,
                'username' => $modifiedUsername,
                'response' => $response->json(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'RADIUS account created successfully',
                'data' => [
                    'username' => $modifiedUsername,
                    'group' => $planName,
                    'radius_response' => $response->json(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating RADIUS account', [
                'job_order_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create RADIUS account',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

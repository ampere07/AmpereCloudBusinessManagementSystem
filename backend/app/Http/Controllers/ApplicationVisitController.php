<?php

namespace App\Http\Controllers;

use App\Models\ApplicationVisit;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ApplicationVisitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            // Get all visits from application_visit table only (no relationships)
            $visits = ApplicationVisit::all();
            
            // Debug info
            $count = $visits->count();
            $firstVisit = $visits->first();
            \Log::info("Fetched {$count} application visits from database");
            if ($firstVisit) {
                \Log::debug("Sample visit data:", $firstVisit->toArray());
            }
            
            return response()->json([
                'success' => true,
                'data' => $visits,
                'count' => $count,
                'table' => 'application_visits',
                'debug' => [
                    'count' => $count,
                    'first_visit' => $firstVisit ? $firstVisit->toArray() : null,
                    'table' => 'application_visits'
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching application visits: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch application visits',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'Application_ID' => 'required|exists:applications,Application_ID',
                'First_Name' => 'required|string|max:255',
                'Last_Name' => 'required|string|max:255',
                'Contact_Number' => 'required|string|max:255',
                'Email_Address' => 'required|email|max:255',
                'Address' => 'required|string',
                'Visit_By' => 'required|string|max:255',
            ]);
            
            if ($validator->fails()) {
                \Log::warning('Application visit validation failed', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->all()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'debug_data' => $request->all() // Remove this in production
                ], 422);
            }
            
            // Generate a 7-digit random integer for ID (not auto-increment)
            $randomId = rand(1000000, 9999999); // 7-digit random number
            
            // Check if this ID already exists and generate a new one if needed
            while (ApplicationVisit::where('ID', $randomId)->exists()) {
                $randomId = rand(1000000, 9999999);
            }
            
            \Log::debug('Generated random ID', ['ID' => $randomId]);
            
            // Convert and validate Application_ID
            $applicationId = (int)$request->input('Application_ID');
            \Log::debug('Application ID conversion', [
                'original' => $request->input('Application_ID'),
                'converted' => $applicationId,
                'type' => gettype($applicationId)
            ]);
            
            // Double-check the Application_ID exists in the applications table
            $applicationExists = Application::where('Application_ID', $applicationId)->exists();
            if (!$applicationExists) {
                \Log::error('Application_ID not found in applications table', [
                    'Application_ID' => $applicationId
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Application ID does not exist in applications table',
                    'error' => "Application_ID {$applicationId} not found in applications table"
                ], 400);
            }
            
            \Log::debug('Application exists check passed', ['Application_ID' => $applicationId]);
            
            // Try with only the most essential fields first to isolate the constraint violation
            $data = [
                'ID' => $randomId,
                'Application_ID' => $applicationId,
                'Timestamp' => now()->setTimezone('Asia/Manila')->format('Y-m-d H:i:s'),
                'First_Name' => $request->input('First_Name'),
                'Last_Name' => $request->input('Last_Name'),
                'Contact_Number' => $request->input('Contact_Number'),
                'Email_Address' => $request->input('Email_Address'),
                'Address' => $request->input('Address'),
                'Visit_By' => $request->input('Visit_By')
            ];
            
            \Log::debug('Attempting insert with minimal data first:', $data);
            
            try {
                // Try creating with minimal data first
                $visit = ApplicationVisit::create($data);
                \Log::info('SUCCESS: Minimal data insert worked, now adding optional fields');
                
                // If minimal insert worked, update with optional fields
                $optionalData = [];
                if ($request->input('Middle_Initial')) {
                    $optionalData['Middle_Initial'] = $request->input('Middle_Initial');
                }
                if ($request->input('Second_Contact_Number')) {
                    $optionalData['Second_Contact_Number'] = $request->input('Second_Contact_Number');
                }
                if ($request->input('Assigned_Email')) {
                    $optionalData['Assigned_Email'] = $request->input('Assigned_Email');
                }
                if ($request->input('Visit_Notes')) {
                    $optionalData['Visit_Remarks'] = $request->input('Visit_Notes');
                    $optionalData['Remarks'] = $request->input('Visit_Notes');
                }
                if ($request->input('Visit_Status')) {
                    $optionalData['Visit_Status'] = $request->input('Visit_Status');
                }
                if ($request->input('Modified_By')) {
                    $optionalData['Modified_By'] = $request->input('Modified_By');
                    $optionalData['Modified_Date'] = now()->setTimezone('Asia/Manila')->format('Y-m-d H:i:s');
                }
                
                // Add location data
                if ($request->input('Barangay')) {
                    $optionalData['Barangay'] = $request->input('Barangay');
                }
                if ($request->input('City')) {
                    $optionalData['City'] = $request->input('City');
                }
                if ($request->input('Region')) {
                    $optionalData['Region'] = $request->input('Region');
                }
                if ($request->input('Choose_Plan')) {
                    $optionalData['Choose_Plan'] = $request->input('Choose_Plan');
                }
                if ($request->input('Installation_Landmark')) {
                    $optionalData['Installation_Landmark'] = $request->input('Installation_Landmark');
                }
                
                if (!empty($optionalData)) {
                    $visit->update($optionalData);
                    \Log::info('SUCCESS: Optional data added successfully');
                }
                
            } catch (\Exception $e) {
                \Log::error('FAILED: Even minimal data insert failed', [
                    'error' => $e->getMessage(),
                    'data_attempted' => $data
                ]);
                throw $e;
            }
            
            // Update application status if needed
            $application = Application::where('Application_ID', $request->input('Application_ID'))->first();
            if ($application) {
                $application->Status = 'Scheduled';
                $application->save();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Application visit created successfully',
                'data' => $visit,
            ], 201);
            
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database query error when creating application visit', [
                'error_message' => $e->getMessage(),
                'sql' => $e->getSql() ?? 'No SQL available',
                'bindings' => $e->getBindings() ?? [],
                'data_sent' => $data ?? []
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred',
                'error' => $e->getMessage(),
                'debug_sql' => $e->getSql() ?? 'No SQL available'
            ], 500);
        } catch (\Exception $e) {
            \Log::error('General error when creating application visit', [
                'error_message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data_sent' => $data ?? []
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create application visit',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        try {
            $visit = ApplicationVisit::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $visit,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Application visit not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }
    
    /**
     * Get visits by application ID
     */
    public function getByApplication($applicationId): JsonResponse
    {
        try {
            \Log::info("ApplicationVisitController::getByApplication called with applicationId: {$applicationId}");
            
            // Simple approach: Get only the ID from visits table
            $query = ApplicationVisit::select(['ID']);
            
            // Filter by application ID if not 'all'
            if ($applicationId !== 'all') {
                $query->where('Application_ID', $applicationId);
            }
            
            $visits = $query->get();
            
            \Log::info('Found ' . $visits->count() . ' application visits');
            
            // Map the visits to a simple array structure
            $formattedVisits = $visits->map(function($visit) {
                return [
                    'id' => $visit->ID
                ];
            });
            
            // If no visits found, return empty array
            if ($visits->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No application visits found',
                ]);
            }
            
            return response()->json([
                'success' => true,
                'data' => $formattedVisits,
                'table' => 'application_visits',
                'count' => $formattedVisits->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getByApplication: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'applicationId' => $applicationId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch application visits: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine()
            ], 500);
        }
    }
    
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $visit = ApplicationVisit::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'Application_ID' => 'exists:applications,Application_ID',
                'First_Name' => 'string|max:255',
                'Last_Name' => 'string|max:255',
                'Contact_Number' => 'string|max:255',
                'Email_Address' => 'email|max:255',
                'Address' => 'string',
                'Visit_By' => 'string|max:255',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }
            
            // Map request data to model fields
            $data = [
                'Application_ID' => $request->input('Application_ID') ? (int)$request->input('Application_ID') : null,
                'Assigned_Email' => $request->input('Assigned_Email'),
                'Visit_By' => $request->input('Visit_By'),
                'Visit_With' => $request->input('Visit_With'),
                'Visit_With_Other' => $request->input('Visit_With_Other'),
                'Visit_Status' => $request->input('Visit_Status'),
                'Visit_Remarks' => $request->input('Visit_Notes'),
                'First_Name' => $request->input('First_Name'),
                'Last_Name' => $request->input('Last_Name'),
                'Middle_Initial' => $request->input('Middle_Initial'),
                'Contact_Number' => $request->input('Contact_Number'),
                'Second_Contact_Number' => $request->input('Second_Contact_Number'),
                'Email_Address' => $request->input('Email_Address'),
                'Address' => $request->input('Address'),
                'Location' => $request->input('Location'),
                
                // Handle both string values and ID references
                'Barangay' => $request->input('Barangay'),
                'City' => $request->input('City'),
                'Region' => $request->input('Region'),
                'Choose_Plan' => $request->input('Choose_Plan'),
                
                // Handle ID references if provided
                'barangay_id' => $request->input('Barangay_ID'),
                'city_id' => $request->input('City_ID'),
                'region_id' => $request->input('Region_ID'),
                'plan_id' => $request->input('Plan_ID'),
                
                'Remarks' => $request->input('Remarks'),
                'Installation_Landmark' => $request->input('Installation_Landmark'),
                'Modified_By' => $request->input('Modified_By'),
                'Modified_Date' => now()->setTimezone('Asia/Manila'),
                'Visit_Notes' => $request->input('Visit_Notes'),
            ];
            
            // Filter out null and unchanged fields
            $data = array_filter($data, function ($value) {
                return $value !== null;
            });
            
            $visit->update($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Application visit updated successfully',
                'data' => $visit,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update application visit',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $visit = ApplicationVisit::findOrFail($id);
            $visit->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Application visit deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete application visit',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

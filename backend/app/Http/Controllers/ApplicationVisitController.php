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
            // Get all visits with relations
            $visits = ApplicationVisit::with(['application'])->get();
            
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
                'debug' => [
                    'count' => $count,
                    'first_visit' => $firstVisit ? $firstVisit->toArray() : null,
                    'table' => $visits->first() ? $visits->first()->getTable() : null
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
                'Application_ID' => 'required|exists:app_applications,id',
                'First_Name' => 'required|string|max:255',
                'Last_Name' => 'required|string|max:255',
                'Contact_Number' => 'required|string|max:255',
                'Email_Address' => 'required|email|max:255',
                'Address' => 'required|string',
                'Scheduled_Date' => 'required|date',
                'Visit_By' => 'required|string|max:255',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }
            
            // Generate a unique ID (you can use your preferred ID generation method)
            $uniqueId = uniqid('AV-', true);
            
            // Map request data to model fields with correct case for the database table
            $data = [
                'ID' => $uniqueId,
                'Application_ID' => $request->input('Application_ID'),
                'Timestamp' => now(),
                'Assigned_Email' => $request->input('Assigned_Email'),
                'Visit_By' => $request->input('Visit_By'),
                'Visit_With' => $request->input('Visit_With'),
                'Visit_With_Other' => $request->input('Visit_With_Other'),
                'Visit_Status' => $request->input('Status'),
                'Visit_Remarks' => $request->input('Visit_Notes'),
                'First_Name' => $request->input('First_Name'),
                'Last_Name' => $request->input('Last_Name'),
                'Middle_Initial' => $request->input('Middle_Initial'),
                'Contact_Number' => $request->input('Contact_Number'),
                'Second_Contact_Number' => $request->input('Second_Contact_Number'),
                'Email_Address' => $request->input('Email_Address'),
                'Address' => $request->input('Address'),
                'Location' => $request->input('Location'),
                
                // Use the name values for display
                'Barangay' => $request->input('Barangay'),
                'City' => $request->input('City'),
                'Region' => $request->input('Region'),
                'Choose_Plan' => $request->input('Choose_Plan'),
                
                // Store ID references as well
                'barangay_id' => $request->input('Barangay_ID'),
                'city_id' => $request->input('City_ID'),
                'region_id' => $request->input('Region_ID'),
                
                'Remarks' => $request->input('Visit_Notes'), // Use Visit_Notes as general remarks
                'Installation_Landmark' => $request->input('Installation_Landmark'),
                'Modified_By' => $request->input('Modified_By'),
                'Modified_Date' => now(),
                
                // Handle scheduled date properly
                'Scheduled_Date' => $request->input('Scheduled_Date'),
            ];
            
            // Log the data being processed
            \Log::debug('Processing application visit data:', $data);
            
            // Allow null values in database but filter out undefined values
            $data = array_filter($data, function ($value) {
                return $value !== '';
            });
            
            $visit = ApplicationVisit::create($data);
            
            // Update application status if needed
            $application = Application::find($request->input('Application_ID'));
            if ($application) {
                $application->status = 'Scheduled';
                $application->save();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Application visit created successfully',
                'data' => $visit,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create application visit',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        try {
            $visit = ApplicationVisit::with('application')->findOrFail($id);
            
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
                'table' => 'application_visit',
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
                'Application_ID' => 'exists:app_applications,id',
                'First_Name' => 'string|max:255',
                'Last_Name' => 'string|max:255',
                'Contact_Number' => 'string|max:255',
                'Email_Address' => 'email|max:255',
                'Address' => 'string',
                'Scheduled_Date' => 'date',
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
                'application_id' => $request->input('Application_ID'),
                'assigned_email' => $request->input('Assigned_Email'),
                'visit_by' => $request->input('Visit_By'),
                'visit_with' => $request->input('Visit_With'),
                'visit_with_other' => $request->input('Visit_With_Other'),
                'visit_status' => $request->input('Status'),
                'visit_remarks' => $request->input('Visit_Notes'),
                'first_name' => $request->input('First_Name'),
                'last_name' => $request->input('Last_Name'),
                'middle_initial' => $request->input('Middle_Initial'),
                'contact_number' => $request->input('Contact_Number'),
                'second_contact_number' => $request->input('Second_Contact_Number'),
                'email_address' => $request->input('Email_Address'),
                'address' => $request->input('Address'),
                'location' => $request->input('Location'),
                
                // Handle both string values and ID references
                'barangay' => $request->input('Barangay'),
                'city' => $request->input('City'),
                'region' => $request->input('Region'),
                'choose_plan' => $request->input('Choose_Plan'),
                
                // Handle ID references if provided
                'barangay_id' => $request->input('Barangay_ID'),
                'city_id' => $request->input('City_ID'),
                'region_id' => $request->input('Region_ID'),
                'plan_id' => $request->input('Plan_ID'),
                
                'remarks' => $request->input('Remarks'),
                'installation_landmark' => $request->input('Installation_Landmark'),
                'scheduled_date' => $request->input('Scheduled_Date'),
                'modified_by' => $request->input('Modified_By'),
                'modified_date' => now(),
                'visit_notes' => $request->input('Visit_Notes'),
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

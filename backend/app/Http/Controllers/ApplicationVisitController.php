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
            $visits = ApplicationVisit::with('application')->get();
            
            return response()->json([
                'success' => true,
                'data' => $visits,
            ]);
        } catch (\Exception $e) {
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
            
            // Filter out null values
            $data = array_filter($data, function ($value) {
                return $value !== null && $value !== '';
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
            // Debug: Log the request for visits
            \Log::info("ApplicationVisitController::getByApplication called with applicationId: {$applicationId}");
            
            // If 'all' is passed, return all visits regardless of application_id
            if ($applicationId === 'all') {
                $visits = ApplicationVisit::orderBy('created_at', 'desc')->get();
                \Log::info('Found ' . $visits->count() . ' application visits');
                
                if ($visits->count() > 0) {
                    \Log::debug('First visit data:', $visits->first()->toArray());
                }
            } else {
                // Otherwise, filter by application_id
                $visits = ApplicationVisit::where('application_id', $applicationId)
                    ->orderBy('created_at', 'desc')
                    ->get();
                    
                \Log::info("Found {$visits->count()} visits for application ID: {$applicationId}");
            }
            
            // If no visits found, return empty array with success true
            if ($visits->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                ]);
            }
            
            return response()->json([
                'success' => true,
                'data' => $visits,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch application visits',
                'error' => $e->getMessage(),
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

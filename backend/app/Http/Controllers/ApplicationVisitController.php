<?php

namespace App\Http\Controllers;

use App\Models\ApplicationVisit;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ApplicationVisitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ApplicationVisit::with('application');
            
            // Filter by assigned email if provided
            if ($request->has('assigned_email')) {
                $query->where('assigned_email', $request->input('assigned_email'));
                Log::info('Filtering application visits by email: ' . $request->input('assigned_email'));
            }
            
            $visits = $query->get();
            
            $visitsWithApplicationData = $visits->map(function ($visit) {
                $application = $visit->application;
                
                $fullName = $application 
                    ? trim("{$application->first_name} {$application->middle_initial} {$application->last_name}")
                    : '';
                
                $fullAddress = $application
                    ? trim("{$application->installation_address}, {$application->village}, {$application->barangay}, {$application->city}, {$application->region}")
                    : '';
                
                return [
                    'id' => $visit->id,
                    'application_id' => $visit->application_id,
                    'timestamp' => $visit->timestamp,
                    'assigned_email' => $visit->assigned_email,
                    'visit_by_user_email' => $visit->visit_by_user_email,
                    'visit_with' => $visit->visit_with,
                    'visit_status' => $visit->visit_status,
                    'visit_remarks' => $visit->visit_remarks,
                    'application_status' => $visit->application_status,
                    'status_remarks' => $visit->status_remarks,
                    'image1_url' => $visit->image1_url,
                    'image2_url' => $visit->image2_url,
                    'image3_url' => $visit->image3_url,
                    'house_front_picture_url' => $visit->house_front_picture_url,
                    'created_at' => $visit->created_at,
                    'created_by_user_email' => $visit->created_by_user_email,
                    'updated_at' => $visit->updated_at,
                    'updated_by_user_email' => $visit->updated_by_user_email,
                    'full_name' => $fullName,
                    'full_address' => $fullAddress,
                    'referred_by' => $application ? $application->referred_by : null,
                    'first_name' => $application ? $application->first_name : null,
                    'middle_initial' => $application ? $application->middle_initial : null,
                    'last_name' => $application ? $application->last_name : null,
                    'installation_address' => $application ? $application->installation_address : null,
                    'village' => $application ? $application->village : null,
                    'barangay' => $application ? $application->barangay : null,
                    'city' => $application ? $application->city : null,
                    'region' => $application ? $application->region : null,
                ];
            });
            
            Log::info("Fetched {$visits->count()} application visits from database");
            
            return response()->json([
                'success' => true,
                'data' => $visitsWithApplicationData,
                'count' => $visits->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching application visits: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch application visits',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('Received application visit create request', [
                'data' => $request->all()
            ]);
            
            $validatedData = $request->validate([
                'application_id' => 'required|integer|exists:applications,id',
                'assigned_email' => ['required', 'string', 'max:255', function ($attribute, $value, $fail) {
                    if ($value !== 'Office' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $fail('The assigned email must be a valid email address or "Office".');
                    }
                }],
                'visit_by_user_email' => 'nullable|email|max:255',
                'visit_with' => 'nullable|string|max:255',
                'visit_with_other' => 'nullable|string|max:255',
                'visit_status' => 'required|string|max:100',
                'visit_remarks' => 'nullable|string',
                'application_status' => 'nullable|string|max:100',
                'status_remarks' => 'nullable|string|max:255',
                'image1_url' => 'nullable|string|max:255',
                'image2_url' => 'nullable|string|max:255',
                'image3_url' => 'nullable|string|max:255',
                'house_front_picture_url' => 'nullable|string|max:255',
                'created_by_user_email' => 'nullable|email|max:255',
                'updated_by_user_email' => 'nullable|email|max:255'
            ]);

            Log::info('Validation passed', ['validated_data' => $validatedData]);

            $validatedData['timestamp'] = now();
            
            Log::info('Creating application visit', ['data' => $validatedData]);
            
            $visit = ApplicationVisit::create($validatedData);
            
            Log::info('Application visit created successfully', ['visit_id' => $visit->id]);
            
            if ($request->has('application_status')) {
                $application = Application::findOrFail($request->application_id);
                $application->status = $request->application_status;
                $application->save();
                Log::info('Updated application status', [
                    'application_id' => $application->id,
                    'new_status' => $request->application_status
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Application visit created successfully',
                'data' => $visit,
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Application visit validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating application visit', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create application visit',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
    
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
    
    public function getByApplication($applicationId): JsonResponse
    {
        try {
            Log::info("Fetching visits for application ID: {$applicationId}");
            
            $query = ApplicationVisit::query();
            
            if ($applicationId !== 'all') {
                $query->where('application_id', $applicationId);
            }
            
            $visits = $query->get();
            
            Log::info('Found ' . $visits->count() . ' application visits');
            
            return response()->json([
                'success' => true,
                'data' => $visits,
                'count' => $visits->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getByApplication: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch application visits',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function update(Request $request, $id): JsonResponse
    {
        try {
            Log::info('Updating application visit', [
                'id' => $id,
                'data' => $request->all()
            ]);
            
            $visit = ApplicationVisit::findOrFail($id);
            
            $validatedData = $request->validate([
                'application_id' => 'nullable|integer|exists:applications,id',
                'assigned_email' => ['nullable', 'string', 'max:255', function ($attribute, $value, $fail) {
                    if ($value && $value !== 'Office' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $fail('The assigned email must be a valid email address or "Office".');
                    }
                }],
                'visit_by_user_email' => 'nullable|email|max:255',
                'visit_with' => 'nullable|string|max:255',
                'visit_with_other' => 'nullable|string|max:255',
                'visit_status' => 'nullable|string|max:100',
                'visit_remarks' => 'nullable|string',
                'application_status' => 'nullable|string|max:100',
                'status_remarks' => 'nullable|string|max:255',
                'image1_url' => 'nullable|string|max:255',
                'image2_url' => 'nullable|string|max:255',
                'image3_url' => 'nullable|string|max:255',
                'house_front_picture_url' => 'nullable|string|max:255',
                'updated_by_user_email' => 'nullable|email|max:255'
            ]);
            
            $visit->update($validatedData);
            
            Log::info('Application visit updated successfully', ['visit_id' => $visit->id]);
            
            return response()->json([
                'success' => true,
                'message' => 'Application visit updated successfully',
                'data' => $visit,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Application visit update validation failed', [
                'errors' => $e->errors()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating application visit: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update application visit',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
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

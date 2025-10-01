<?php

namespace App\Http\Controllers;

use App\Models\ApplicationVisit;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ApplicationVisitController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $visits = ApplicationVisit::all();
            
            Log::info("Fetched {$visits->count()} application visits from database");
            
            return response()->json([
                'success' => true,
                'data' => $visits,
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
                'assigned_email' => 'required|email|max:255',
                'visit_by_user_id' => 'nullable|integer',
                'visit_with' => 'nullable|string|max:255',
                'visit_status' => 'required|string|max:100',
                'visit_remarks' => 'nullable|string',
                'application_status' => 'nullable|string|max:100',
                'status_remarks_id' => 'nullable|integer',
                'image1_url' => 'nullable|string|max:255',
                'image2_url' => 'nullable|string|max:255',
                'image3_url' => 'nullable|string|max:255',
                'house_front_picture_url' => 'nullable|string|max:255'
            ]);

            Log::info('Validation passed', ['validated_data' => $validatedData]);

            $validatedData['timestamp'] = now();
            $validatedData['created_by_user_id'] = auth()->id();
            
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
                'assigned_email' => 'nullable|email|max:255',
                'visit_by_user_id' => 'nullable|integer',
                'visit_with' => 'nullable|string|max:255',
                'visit_status' => 'nullable|string|max:100',
                'visit_remarks' => 'nullable|string',
                'application_status' => 'nullable|string|max:100',
                'status_remarks_id' => 'nullable|integer',
                'image1_url' => 'nullable|string|max:255',
                'image2_url' => 'nullable|string|max:255',
                'image3_url' => 'nullable|string|max:255',
                'house_front_picture_url' => 'nullable|string|max:255'
            ]);
            
            $validatedData['updated_by_user_id'] = auth()->id();
            
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

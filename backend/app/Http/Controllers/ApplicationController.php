<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    /**
     * Display a listing of the applications.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $applications = Application::all();
            
            // Debug information
            $count = $applications->count();
            $firstApp = $applications->first();
            
            // Transform data to match the expected format in the frontend
            $formattedApplications = $applications->map(function ($app) {
                return [
                    'id' => (string)$app->id,
                    'customer_name' => trim($app->first_name . ' ' . $app->middle_initial . ' ' . $app->last_name),
                    'timestamp' => $app->create_date ? date('m/d/Y H:i:s', strtotime($app->create_date . ' ' . $app->create_time)) : null,
                    'address' => $app->address_line,
                    'status' => $app->status,
                    'location' => $this->getLocationName($app->region_id, $app->city_id),
                    'city_id' => $app->city_id,
                    'region_id' => $app->region_id,
                    'borough_id' => $app->borough_id,
                    'village_id' => $app->village_id,
                    'email' => $app->email,
                    'mobile_number' => $app->mobile,
                    'secondary_number' => $app->mobile_alt,
                    'plan_id' => $app->plan_id,
                    'promo_id' => $app->promo_id,
                    'create_date' => $app->create_date,
                    'create_time' => $app->create_time
                ];
            });
            
            return response()->json([
                'applications' => $formattedApplications,
                'debug' => [
                    'count' => $count,
                    'first_app' => $firstApp ? $firstApp->toArray() : null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);}
    }
    
    /**
     * Get location name based on region and city IDs.
     *
     * @param int $regionId
     * @param int $cityId
     * @return string
     */
    private function getLocationName($regionId, $cityId)
    {
        // Map region/city IDs to location names - you should enhance this
        // with actual database lookups in a production environment
        
        if ($cityId == 1) {
            return 'binangonan';
        } elseif ($cityId == 2) {
            return 'tagpos';
        } elseif ($cityId == 3) {
            return 'tatala';
        } elseif ($cityId == 4) {
            return 'pantok';
        } else {
            return 'binangonan';
        }
    }

    /**
     * Store a newly created application in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'customer_name' => 'required|string|max:255',
            'timestamp' => 'nullable',
            'address' => 'required|string',
            'status' => 'nullable|string',
            'location' => 'nullable|string',
            'email' => 'nullable|email',
            'mobile_number' => 'nullable|string',
            'secondary_number' => 'nullable|string',
            'visit_date' => 'nullable|string',
            'visit_by' => 'nullable|string',
            'visit_with' => 'nullable|string',
            'notes' => 'nullable|string',
            'last_modified' => 'nullable',
            'modified_by' => 'nullable|string'
        ]);

        $application = Application::create($validatedData);

        return response()->json([
            'message' => 'Application created successfully',
            'application' => $application
        ], 201);
    }

    /**
     * Display the specified application.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $application = Application::findOrFail($id);
            
            // Format application data for the frontend
            $formattedApplication = [
                'id' => (string)$application->id,
                'customer_name' => trim($application->first_name . ' ' . $application->middle_initial . ' ' . $application->last_name),
                'timestamp' => $application->create_date ? date('m/d/Y H:i:s', strtotime($application->create_date . ' ' . $application->create_time)) : null,
                'address' => $application->address_line,
                'status' => $application->status,
                'location' => $this->getLocationName($application->region_id, $application->city_id),
                'city_id' => $application->city_id,
                'region_id' => $application->region_id,
                'borough_id' => $application->borough_id,
                'village_id' => $application->village_id,
                'email' => $application->email,
                'mobile_number' => $application->mobile,
                'secondary_number' => $application->mobile_alt,
                'plan_id' => $application->plan_id,
                'promo_id' => $application->promo_id,
                'create_date' => $application->create_date,
                'create_time' => $application->create_time,
                'update_date' => $application->update_date,
                'update_time' => $application->update_time,
                'first_name' => $application->first_name,
                'middle_initial' => $application->middle_initial,
                'last_name' => $application->last_name,
                'landmark' => $application->landmark,
                'nearest_landmark1' => $application->nearest_landmark1,
                'nearest_landmark2' => $application->nearest_landmark2,
                'gov_id_primary' => $application->gov_id_primary,
                'gov_id_secondary' => $application->gov_id_secondary,
                'house_front_pic' => $application->house_front_pic,
                'room_pic' => $application->room_pic,
                'primary_consent' => $application->primary_consent,
                'primary_consent_at' => $application->primary_consent_at,
                'source' => $application->source,
                'ip_address' => $application->ip_address,
                'user_agent' => $application->user_agent
            ];
            
            return response()->json([
                'application' => $formattedApplication,
                'success' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Application not found or error retrieving application',
                'error' => $e->getMessage(),
                'success' => false
            ], 404);
        }
    }

    /**
     * Update the specified application in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'customer_name' => 'sometimes|required|string|max:255',
            'timestamp' => 'nullable',
            'address' => 'sometimes|required|string',
            'status' => 'nullable|string',
            'location' => 'nullable|string',
            'email' => 'nullable|email',
            'mobile_number' => 'nullable|string',
            'secondary_number' => 'nullable|string',
            'visit_date' => 'nullable|string',
            'visit_by' => 'nullable|string',
            'visit_with' => 'nullable|string',
            'notes' => 'nullable|string',
            'last_modified' => 'nullable',
            'modified_by' => 'nullable|string'
        ]);

        $application = Application::findOrFail($id);
        
        // Add update timestamp when any field is modified
        $validatedData['update_date'] = date('Y-m-d');
        $validatedData['update_time'] = date('H:i:s');
        
        $application->update($validatedData);

        return response()->json([
            'message' => 'Application updated successfully',
            'application' => $application,
            'success' => true
        ]);
    }

    /**
     * Remove the specified application from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $application = Application::findOrFail($id);
        $application->delete();

        return response()->json(['message' => 'Application deleted successfully']);
    }
}

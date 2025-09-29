<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            Log::info('ApplicationController: Starting to fetch applications');
            
            // Fetch from the application table
            $applications = Application::all();
            Log::info('ApplicationController: Fetched ' . $applications->count() . ' applications');
            
            // Debug information
            $count = $applications->count();
            $firstApp = $applications->first();
            
            if ($firstApp) {
                Log::info('First application data:', $firstApp->toArray());
            }
            
            // Transform data to match the expected format in the frontend using exact database column names
            $formattedApplications = $applications->map(function ($app) {
                return [
                    'id' => (string)$app->Application_ID,
                    'customer_name' => $this->getFullName($app),
                    'timestamp' => $app->Timestamp,
                    'address' => $app->Installation_Address ?? '',
                    'address_line' => $app->Installation_Address ?? '',
                    'status' => $app->Status ?? 'pending',
                    'location' => $this->getLocationName($app->Region ?? '', $app->City ?? ''),
                    
                    // Exact database columns
                    'Application_ID' => $app->Application_ID,
                    'Timestamp' => $app->Timestamp,
                    'Email_Address' => $app->Email_Address,
                    'Region' => $app->Region,
                    'City' => $app->City,
                    'Barangay' => $app->Barangay,
                    'Referred_by' => $app->Referred_by,
                    'First_Name' => $app->First_Name,
                    'Middle_Initial' => $app->Middle_Initial,
                    'Last_Name' => $app->Last_Name,
                    'Mobile_Number' => $app->Mobile_Number,
                    'Secondary_Mobile_Number' => $app->Secondary_Mobile_Number,
                    'Installation_Address' => $app->Installation_Address,
                    'Landmark' => $app->Landmark,
                    'Desired_Plan' => $app->Desired_Plan,
                    'Proof_of_Billing' => $app->Proof_of_Billing,
                    'Government_Valid_ID' => $app->Government_Valid_ID,
                    '2nd_Government_Valid_ID' => $app->{'2nd_Government_Valid_ID'},
                    'House_Front_Picture' => $app->House_Front_Picture,
                    'I_agree_to_the_terms_and_conditions' => $app->I_agree_to_the_terms_and_conditions,
                    'First_Nearest_landmark' => $app->First_Nearest_landmark,
                    'Second_Nearest_landmark' => $app->Second_Nearest_landmark,
                    'Select_the_applicable_promo' => $app->Select_the_applicable_promo,
                    'Attach_the_picture_of_your_document' => $app->Attach_the_picture_of_your_document,
                    'Attach_SOA_from_other_provider' => $app->Attach_SOA_from_other_provider,
                    'Status' => $app->Status,
                    
                    // Convenience mappings for frontend compatibility
                    'city' => $app->City,
                    'region' => $app->Region,
                    'barangay' => $app->Barangay,
                    'email' => $app->Email_Address,
                    'mobile' => $app->Mobile_Number,
                    'mobile_number' => $app->Mobile_Number,
                    'mobile_alt' => $app->Secondary_Mobile_Number,
                    'secondary_number' => $app->Secondary_Mobile_Number,
                    'referred_by' => $app->Referred_by,
                    'first_name' => $app->First_Name,
                    'middle_initial' => $app->Middle_Initial,
                    'last_name' => $app->Last_Name,
                    'plan' => $app->Desired_Plan,
                    'desired_plan' => $app->Desired_Plan,
                    'landmark' => $app->Landmark,
                    'first_nearest_landmark' => $app->First_Nearest_landmark,
                    'second_nearest_landmark' => $app->Second_Nearest_landmark,
                    'promo' => $app->Select_the_applicable_promo,
                    'gov_id_primary' => $app->Government_Valid_ID,
                    'gov_id_secondary' => $app->{'2nd_Government_Valid_ID'},
                    'house_front_pic' => $app->House_Front_Picture,
                    'proof_of_billing' => $app->Proof_of_Billing,
                    'terms_agreement' => $app->I_agree_to_the_terms_and_conditions,
                    'document_attachment' => $app->Attach_the_picture_of_your_document,
                    'soa_attachment' => $app->Attach_SOA_from_other_provider,
                    'create_date' => $app->Timestamp ? date('Y-m-d', strtotime($app->Timestamp)) : null,
                    'create_time' => $app->Timestamp ? date('H:i:s', strtotime($app->Timestamp)) : null
                ];
            });
            
            return response()->json([
                'applications' => $formattedApplications,
                'debug' => [
                    'count' => $count,
                    'first_app' => $firstApp ? $firstApp->toArray() : null,
                    'table' => 'application'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('ApplicationController error: ' . $e->getMessage());
            Log::error('ApplicationController trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'message' => 'Failed to fetch applications from database'
            ], 500);
        }
    }
    
    /**
     * Get full customer name safely
     */
    private function getFullName($app)
    {
        $parts = array_filter([
            $app->First_Name ?? '',
            $app->Middle_Initial ?? '',
            $app->Last_Name ?? ''
        ]);
        
        return implode(' ', $parts) ?: 'Unknown';
    }
    
    /**
     * Get location name based on region and city strings.
     *
     * @param string $region
     * @param string $city
     * @return string
     */
    private function getLocationName($region, $city)
    {
        try {
            $locationParts = array_filter([$region, $city]);
            return implode(', ', $locationParts) ?: 'Unknown Location';
        } catch (\Exception $e) {
            Log::error('Failed to get location name: ' . $e->getMessage());
            return 'Unknown Location';
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
            'Email_Address' => 'required|email',
            'First_Name' => 'required|string|max:255',
            'Middle_Initial' => 'nullable|string|max:10',
            'Last_Name' => 'required|string|max:255',
            'Mobile_Number' => 'required|string|max:20',
            'Secondary_Mobile_Number' => 'nullable|string|max:20',
            'Region' => 'required|string|max:100',
            'City' => 'required|string|max:100',
            'Barangay' => 'nullable|string|max:100',
            'Installation_Address' => 'required|string',
            'Referred_by' => 'nullable|string|max:255',
            'Desired_Plan' => 'nullable|string|max:255',
            'Status' => 'nullable|string|max:50'
        ]);

        // Add timestamp
        $validatedData['Timestamp'] = now();

        $application = Application::create($validatedData);

        return response()->json([
            'message' => 'Application created successfully',
            'application' => $application
        ], 201);
    }

    /**
     * Display the specified application.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            Log::info('ApplicationController show: Fetching application ID: ' . $id);
            
            $application = Application::where('Application_ID', $id)->firstOrFail();
            
            // Format application data for the frontend using exact database column names
            $formattedApplication = [
                'id' => (string)$application->Application_ID,
                'customer_name' => $this->getFullName($application),
                'timestamp' => $application->Timestamp,
                'address' => $application->Installation_Address ?? '',
                'address_line' => $application->Installation_Address ?? '',
                'status' => $application->Status ?? 'pending',
                'location' => $this->getLocationName($application->Region ?? '', $application->City ?? ''),
                
                // All exact database columns
                'Application_ID' => $application->Application_ID,
                'Timestamp' => $application->Timestamp,
                'Email_Address' => $application->Email_Address,
                'Region' => $application->Region,
                'City' => $application->City,
                'Barangay' => $application->Barangay,
                'Referred_by' => $application->Referred_by,
                'First_Name' => $application->First_Name,
                'Middle_Initial' => $application->Middle_Initial,
                'Last_Name' => $application->Last_Name,
                'Mobile_Number' => $application->Mobile_Number,
                'Secondary_Mobile_Number' => $application->Secondary_Mobile_Number,
                'Installation_Address' => $application->Installation_Address,
                'Landmark' => $application->Landmark,
                'Desired_Plan' => $application->Desired_Plan,
                'Proof_of_Billing' => $application->Proof_of_Billing,
                'Government_Valid_ID' => $application->Government_Valid_ID,
                '2nd_Government_Valid_ID' => $application->{'2nd_Government_Valid_ID'},
                'House_Front_Picture' => $application->House_Front_Picture,
                'I_agree_to_the_terms_and_conditions' => $application->I_agree_to_the_terms_and_conditions,
                'First_Nearest_landmark' => $application->First_Nearest_landmark,
                'Second_Nearest_landmark' => $application->Second_Nearest_landmark,
                'Select_the_applicable_promo' => $application->Select_the_applicable_promo,
                'Attach_the_picture_of_your_document' => $application->Attach_the_picture_of_your_document,
                'Attach_SOA_from_other_provider' => $application->Attach_SOA_from_other_provider,
                'Status' => $application->Status,
                
                // Convenience mappings for frontend
                'city' => $application->City,
                'region' => $application->Region,
                'barangay' => $application->Barangay,
                'email' => $application->Email_Address,
                'mobile' => $application->Mobile_Number,
                'mobile_number' => $application->Mobile_Number,
                'mobile_alt' => $application->Secondary_Mobile_Number,
                'secondary_number' => $application->Secondary_Mobile_Number,
                'referred_by' => $application->Referred_by,
                'first_name' => $application->First_Name,
                'middle_initial' => $application->Middle_Initial,
                'last_name' => $application->Last_Name,
                'plan' => $application->Desired_Plan,
                'desired_plan' => $application->Desired_Plan,
                'landmark' => $application->Landmark,
                'first_nearest_landmark' => $application->First_Nearest_landmark,
                'second_nearest_landmark' => $application->Second_Nearest_landmark,
                'promo' => $application->Select_the_applicable_promo,
                'gov_id_primary' => $application->Government_Valid_ID,
                'gov_id_secondary' => $application->{'2nd_Government_Valid_ID'},
                'house_front_pic' => $application->House_Front_Picture,
                'proof_of_billing' => $application->Proof_of_Billing,
                'terms_agreement' => $application->I_agree_to_the_terms_and_conditions,
                'document_attachment' => $application->Attach_the_picture_of_your_document,
                'soa_attachment' => $application->Attach_SOA_from_other_provider,
                'create_date' => $application->Timestamp ? date('Y-m-d', strtotime($application->Timestamp)) : null,
                'create_time' => $application->Timestamp ? date('H:i:s', strtotime($application->Timestamp)) : null
            ];
            
            return response()->json([
                'application' => $formattedApplication,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('ApplicationController show error: ' . $e->getMessage());
            
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
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'Status' => 'nullable|string|max:50'  // Using exact database column name
            ]);

            $application = Application::where('Application_ID', $id)->firstOrFail();
            $application->update($validatedData);

            return response()->json([
                'message' => 'Application updated successfully',
                'application' => $application,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('ApplicationController update error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to update application',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Remove the specified application from storage.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $application = Application::where('Application_ID', $id)->firstOrFail();
            $application->delete();

            return response()->json(['message' => 'Application deleted successfully']);
        } catch (\Exception $e) {
            Log::error('ApplicationController destroy error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to delete application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

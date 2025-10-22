<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class RadiusController extends Controller
{
    private $primaryUrl = 'https://103.121.65.24:8729/rest/user-manage/user';
    private $backupUrl = 'https://103.121.65.24:8729/rest/user-manage/user';
    private $username = 'googleapi';
    private $password = 'Edward123@';

    public function createAccount(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string',
                'plan' => 'required|string',
                'password' => 'required|string'
            ]);

            $username = $request->input('username');
            $plan = $request->input('plan');
            $password = $request->input('password');

            $modifiedUsername = str_replace(['|', 'ñ'], ['i', 'n'], $username);

            Log::info('Creating RADIUS account', [
                'original_username' => $username,
                'modified_username' => $modifiedUsername,
                'plan' => $plan,
                'password_length' => strlen($password)
            ]);

            $result = $this->putRadiusUser($modifiedUsername, $plan, $password);

            if (!$result) {
                Log::error('RADIUS account creation failed', [
                    'username' => $modifiedUsername,
                    'plan' => $plan,
                    'message' => 'Both primary and backup RADIUS servers failed'
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create RADIUS account on both primary and backup servers. Please check: 1) RADIUS server connectivity, 2) Group/Plan "' . $plan . '" exists in RADIUS server, 3) Authentication credentials'
                ], 500);
            }

            Log::info('RADIUS account created successfully', ['account_name' => $result['name']]);

            return response()->json([
                'success' => true,
                'message' => 'RADIUS account created successfully',
                'data' => $result
            ], 200);

        } catch (Exception $e) {
            Log::error('Error creating RADIUS account', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error creating RADIUS account: ' . $e->getMessage()
            ], 500);
        }
    }

    private function putRadiusUser($customername, $usergroup, $userpassword)
    {
        $payload = [
            'name' => $customername,
            'group' => $usergroup,
            'password' => $userpassword
        ];

        $result = $this->fetchUserData($this->primaryUrl, $payload);

        if (!$result) {
            Log::warning('Primary RADIUS server request failed, trying backup URL');
            $result = $this->fetchUserData($this->backupUrl, $payload);
        }

        return $result;
    }

    private function fetchUserData($url, $payload)
    {
        try {
            Log::info('Attempting RADIUS API request', [
                'url' => $url,
                'payload' => [
                    'name' => $payload['name'],
                    'group' => $payload['group'],
                    'password_set' => isset($payload['password'])
                ]
            ]);

            $response = Http::withBasicAuth($this->username, $this->password)
                ->withOptions([
                    'verify' => false
                ])
                ->timeout(10)
                ->put($url, $payload);

            if ($response->successful()) {
                Log::info('RADIUS API request successful', [
                    'url' => $url,
                    'status' => $response->status()
                ]);
                return $response->json();
            }

            Log::error('RADIUS API request failed', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->body(),
                'reason' => $response->reason()
            ]);

            return null;

        } catch (Exception $e) {
            Log::error('RADIUS API request exception', [
                'url' => $url,
                'error' => $e->getMessage(),
                'error_class' => get_class($e)
            ]);

            return null;
        }
    }
}

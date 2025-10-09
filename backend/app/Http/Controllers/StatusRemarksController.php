<?php

namespace App\Http\Controllers;

use App\Models\StatusRemarksList;
use Illuminate\Http\Request;

class StatusRemarksController extends Controller
{
    public function index()
    {
        try {
            $statusRemarks = StatusRemarksList::orderBy('status_remarks', 'asc')->get();
            return response()->json([
                'success' => true,
                'data' => $statusRemarks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch status remarks',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

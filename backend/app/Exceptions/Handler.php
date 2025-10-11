<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Add CORS headers to all responses, including exceptions
     */
    public function render($request, Throwable $exception)
    {
        $response = parent::render($request, $exception);
        
        if ($request->expectsJson() || $request->is('api/*')) {
            $origin = $request->header('Origin');
            
            $allowedOrigins = [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'https://sync.atssfiber.ph',
                'https://backend.atssfiber.ph',
                'https://www.atssfiber.ph',
                'https://atssfiber.ph',
            ];
            
            if (in_array($origin, $allowedOrigins)) {
                $response->headers->set('Access-Control-Allow-Origin', $origin);
                $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN');
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            }
        }
        
        return $response;
    }
}

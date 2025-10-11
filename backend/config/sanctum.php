<?php

use Laravel\Sanctum\Sanctum;

return [

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
        'sync.atssfiber.ph,backend.atssfiber.ph,www.atssfiber.ph,atssfiber.ph,127.0.0.1:8000,localhost:8000,localhost:3000'
    )),

    'guard' => ['web'],

    'expiration' => null,

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],

];

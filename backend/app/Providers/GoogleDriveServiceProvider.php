<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;
use Google\Client;
use Google\Service\Drive;
use Masbug\Flysystem\GoogleDriveAdapter;
use League\Flysystem\Filesystem;

class GoogleDriveServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Storage::extend('google', function ($app, $config) {
            $client = new Client();
            
            $credentials = [
                'type' => 'service_account',
                'project_id' => $config['projectId'],
                'private_key_id' => $config['privateKeyId'],
                'private_key' => str_replace('\\n', "\n", $config['privateKey']),
                'client_email' => $config['clientEmail'],
                'client_id' => $config['clientId'],
                'auth_uri' => 'https://accounts.google.com/o/oauth2/auth',
                'token_uri' => 'https://oauth2.googleapis.com/token',
                'auth_provider_x509_cert_url' => 'https://www.googleapis.com/oauth2/v1/certs',
                'universe_domain' => 'googleapis.com'
            ];
            
            $client->setAuthConfig($credentials);
            $client->addScope(Drive::DRIVE);
            
            $service = new Drive($client);
            $adapter = new GoogleDriveAdapter($service, $config['folder']);
            
            return new Filesystem($adapter);
        });
    }

    public function register()
    {
        //
    }
}

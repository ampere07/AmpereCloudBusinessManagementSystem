<?php

namespace App\Services;

use Google\Client as GoogleClient;
use Google\Service\Drive as GoogleDrive;
use Illuminate\Support\Facades\Log;

class GoogleDriveService
{
    private $service;
    private $parentFolderId;

    public function __construct()
    {
        $this->service = $this->initializeGoogleDriveService();
        $this->parentFolderId = env('GOOGLE_DRIVE_FOLDER_ID');
    }

    private function initializeGoogleDriveService()
    {
        $client = new GoogleClient();
        
        $credentials = [
            'type' => 'service_account',
            'project_id' => env('GOOGLE_DRIVE_PROJECT_ID'),
            'private_key_id' => env('GOOGLE_DRIVE_PRIVATE_KEY_ID'),
            'private_key' => str_replace('\\n', "\n", env('GOOGLE_DRIVE_PRIVATE_KEY')),
            'client_email' => env('GOOGLE_DRIVE_CLIENT_EMAIL'),
            'client_id' => env('GOOGLE_DRIVE_CLIENT_ID'),
            'auth_uri' => 'https://accounts.google.com/o/oauth2/auth',
            'token_uri' => 'https://oauth2.googleapis.com/token',
            'auth_provider_x509_cert_url' => 'https://www.googleapis.com/oauth2/v1/certs',
            'client_x509_cert_url' => 'https://www.googleapis.com/robot/v1/metadata/x509/' . env('GOOGLE_DRIVE_CLIENT_EMAIL')
        ];
        
        $client->setAuthConfig($credentials);
        $client->addScope(GoogleDrive::DRIVE_FILE);
        
        return new GoogleDrive($client);
    }

    public function getService()
    {
        return $this->service;
    }

    public function getParentFolderId()
    {
        return $this->parentFolderId;
    }

    public function createFolder($folderName, $parentFolderId = null)
    {
        try {
            $parentId = $parentFolderId ?? $this->parentFolderId;
            
            $fileMetadata = new GoogleDrive\DriveFile([
                'name' => $folderName,
                'mimeType' => 'application/vnd.google-apps.folder',
                'parents' => [$parentId]
            ]);
            
            $folder = $this->service->files->create($fileMetadata, [
                'fields' => 'id',
                'supportsAllDrives' => true
            ]);
            
            $this->makeFileViewable($folder->id);
            
            Log::info('Google Drive folder created', [
                'folder_name' => $folderName,
                'folder_id' => $folder->id,
                'parent_id' => $parentId
            ]);
            
            return $folder->id;
        } catch (\Exception $e) {
            Log::error('Failed to create Google Drive folder', [
                'folder_name' => $folderName,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function uploadFile($file, $folderId, $fileName, $mimeType = null)
    {
        try {
            $fileMetadata = new GoogleDrive\DriveFile([
                'name' => $fileName,
                'parents' => [$folderId]
            ]);
            
            if (is_string($file)) {
                $content = file_get_contents($file);
                $detectedMimeType = $mimeType ?? mime_content_type($file);
            } else {
                $content = file_get_contents($file->getRealPath());
                $detectedMimeType = $mimeType ?? $file->getMimeType();
            }
            
            $uploadedFile = $this->service->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => $detectedMimeType,
                'uploadType' => 'multipart',
                'fields' => 'id',
                'supportsAllDrives' => true
            ]);
            
            $this->makeFileViewable($uploadedFile->id);
            
            $fileUrl = 'https://drive.google.com/file/d/' . $uploadedFile->id . '/view';
            
            Log::info('File uploaded to Google Drive', [
                'file_name' => $fileName,
                'file_id' => $uploadedFile->id,
                'folder_id' => $folderId,
                'url' => $fileUrl
            ]);
            
            return $fileUrl;
        } catch (\Exception $e) {
            Log::error('Failed to upload file to Google Drive', [
                'file_name' => $fileName,
                'folder_id' => $folderId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function makeFileViewable($fileId)
    {
        try {
            $permission = new GoogleDrive\Permission([
                'type' => 'anyone',
                'role' => 'reader'
            ]);

            $this->service->permissions->create($fileId, $permission, [
                'supportsAllDrives' => true
            ]);
            
            Log::info("Set file {$fileId} to viewable by anyone with link");

        } catch (\Exception $e) {
            Log::warning('Could not set file permissions (may inherit from parent): ' . $e->getMessage());
        }
    }

    public function deleteFile($fileId)
    {
        try {
            $this->service->files->delete($fileId, [
                'supportsAllDrives' => true
            ]);
            
            Log::info('File deleted from Google Drive', [
                'file_id' => $fileId
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to delete file from Google Drive', [
                'file_id' => $fileId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function getFileMetadata($fileId)
    {
        try {
            $file = $this->service->files->get($fileId, [
                'fields' => 'id, name, mimeType, size, createdTime, modifiedTime',
                'supportsAllDrives' => true
            ]);
            
            return $file;
        } catch (\Exception $e) {
            Log::error('Failed to get file metadata from Google Drive', [
                'file_id' => $fileId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function listFilesInFolder($folderId)
    {
        try {
            $response = $this->service->files->listFiles([
                'q' => "'{$folderId}' in parents and trashed=false",
                'fields' => 'files(id, name, mimeType, size, createdTime, modifiedTime)',
                'supportsAllDrives' => true,
                'includeItemsFromAllDrives' => true
            ]);
            
            return $response->getFiles();
        } catch (\Exception $e) {
            Log::error('Failed to list files in Google Drive folder', [
                'folder_id' => $folderId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function moveFile($fileId, $newFolderId)
    {
        try {
            $file = $this->service->files->get($fileId, [
                'fields' => 'parents',
                'supportsAllDrives' => true
            ]);
            $previousParents = implode(',', $file->parents);
            
            $file = $this->service->files->update($fileId, new GoogleDrive\DriveFile(), [
                'addParents' => $newFolderId,
                'removeParents' => $previousParents,
                'fields' => 'id, parents',
                'supportsAllDrives' => true
            ]);
            
            Log::info('File moved in Google Drive', [
                'file_id' => $fileId,
                'new_folder_id' => $newFolderId
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to move file in Google Drive', [
                'file_id' => $fileId,
                'new_folder_id' => $newFolderId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function searchFiles($query)
    {
        try {
            $response = $this->service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name, mimeType, size, createdTime, modifiedTime)',
                'supportsAllDrives' => true,
                'includeItemsFromAllDrives' => true
            ]);
            
            return $response->getFiles();
        } catch (\Exception $e) {
            Log::error('Failed to search files in Google Drive', [
                'query' => $query,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}

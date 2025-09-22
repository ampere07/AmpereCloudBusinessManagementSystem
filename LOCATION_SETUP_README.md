# Dynamic Location Management System Setup Guide

## Overview
This guide explains how to set up the dynamic location management system that synchronizes locations between AmpereCloudBusinessManagementSystem and AmpereCBMS.

## Architecture
- **AmpereCloudBusinessManagementSystem**: Acts as the central location management hub
- **AmpereCBMS**: Consumes location data from the management system via API

## Setup Instructions

### 1. AmpereCloudBusinessManagementSystem Backend Setup

Navigate to the backend directory:
```bash
cd AmpereCloudBusinessManagementSystem/backend
```

Run database migrations:
```bash
php artisan migrate
```

Seed initial location data:
```bash
php artisan db:seed --class=LocationSeeder
```

Or run all seeders:
```bash
php artisan db:seed
```

Start the backend server:
```bash
php artisan serve --port=8000
```

### 2. AmpereCloudBusinessManagementSystem Frontend Setup

Navigate to the frontend directory:
```bash
cd AmpereCloudBusinessManagementSystem/frontend
```

Copy the environment file:
```bash
cp .env.example .env
```

Update `.env` with your API URL:
```
REACT_APP_API_URL=http://localhost:8000/api
```

Install dependencies and start:
```bash
npm install
npm start
```

The management system will be available at `http://localhost:3000`

### 3. AmpereCBMS Frontend Setup

Navigate to the frontend directory:
```bash
cd AmpereCBMS/frontend
```

Copy the environment file:
```bash
cp .env.example .env
```

Update `.env` with both API URLs:
```
# Location API (AmpereCloudBusinessManagementSystem)
REACT_APP_LOCATION_API_URL=http://localhost:8000/api

# Application API (AmpereCBMS backend)
REACT_APP_API_URL=http://localhost:8080
```

Install dependencies and start:
```bash
npm install
npm start
```

The application form will be available at `http://localhost:3001` (or next available port)

### 4. AmpereCBMS Backend Setup

Navigate to the backend directory:
```bash
cd AmpereCBMS/backend
```

Start the backend server:
```bash
php artisan serve --port=8080
```

## How It Works

### Adding Locations

1. **Access Location Management**: 
   - Go to AmpereCloudBusinessManagementSystem
   - Navigate to "Location Management" in the sidebar

2. **Add New Locations**:
   - Check the "Add New" checkbox for the location type (Region, City, or Barangay)
   - Enter the location name
   - Click "Save New Locations" button
   - The location is immediately available in both systems

3. **Hierarchical Structure**:
   - Regions are top-level locations
   - Cities belong to Regions
   - Barangays belong to Cities
   - You must select a parent before adding a child location

### Location Synchronization

- **Real-time Updates**: When you add a location in AmpereCloudBusinessManagementSystem, it's immediately available in AmpereCBMS
- **API-based**: AmpereCBMS fetches location data via API calls to AmpereCloudBusinessManagementSystem
- **No Hardcoding**: All location data is stored in the database and fetched dynamically

## API Endpoints

### Location Management API (AmpereCloudBusinessManagementSystem)

- `GET /api/locations/regions` - Get all regions
- `POST /api/locations/regions` - Add new region
- `GET /api/locations/regions/{regionId}/cities` - Get cities by region
- `POST /api/locations/cities` - Add new city
- `GET /api/locations/cities/{cityId}/barangays` - Get barangays by city
- `POST /api/locations/barangays` - Add new barangay
- `GET /api/locations/statistics` - Get location statistics
- `DELETE /api/locations/{type}/{id}` - Delete a location

## Features

### In AmpereCloudBusinessManagementSystem:
- ✅ Add new regions, cities, and barangays
- ✅ Delete locations (with cascade protection)
- ✅ View location statistics
- ✅ Real-time updates
- ✅ Hierarchical location management

### In AmpereCBMS:
- ✅ Dynamic location dropdowns
- ✅ Auto-populate location field based on selections
- ✅ No hardcoded location data
- ✅ Real-time synchronization with management system

## Troubleshooting

### Locations not appearing in AmpereCBMS:
1. Ensure AmpereCloudBusinessManagementSystem backend is running on port 8000
2. Check the `REACT_APP_LOCATION_API_URL` in AmpereCBMS `.env` file
3. Verify CORS is enabled in AmpereCloudBusinessManagementSystem backend
4. Check browser console for API errors

### Cannot add locations:
1. Ensure database migrations have been run
2. Check that the LocationSeeder has been executed
3. Verify API endpoints are accessible
4. Check browser network tab for failed requests

### CORS Issues:
If you encounter CORS errors, ensure your Laravel backend has proper CORS configuration in `config/cors.php`:

```php
'allowed_origins' => ['http://localhost:3000', 'http://localhost:3001'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

## Database Tables

The system creates the following tables:
- `regions` - Stores region data
- `cities` - Stores city data with foreign key to regions
- `barangays` - Stores barangay data with foreign key to cities

Each table includes:
- `id` - Primary key
- `code` - Unique identifier
- `name` - Display name
- `description` - Optional description
- `is_active` - Status flag
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Security Considerations

1. **API Authentication**: Consider adding authentication to the location API endpoints
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Validation**: All inputs are validated on the backend
4. **SQL Injection**: Using Laravel's Eloquent ORM prevents SQL injection
5. **XSS Protection**: React automatically escapes values to prevent XSS

## Future Enhancements

- [ ] Bulk import of locations from CSV/Excel
- [ ] Location search functionality
- [ ] Edit existing locations
- [ ] Location activation/deactivation
- [ ] Audit trail for location changes
- [ ] API authentication and authorization
- [ ] Caching for better performance
- [ ] Location validation (no duplicates)
- [ ] Export location data
- [ ] Location mapping visualization

## Support

For issues or questions, please check:
1. Laravel logs: `storage/logs/laravel.log`
2. Browser console for JavaScript errors
3. Network tab for API response details

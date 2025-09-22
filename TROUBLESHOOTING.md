# Troubleshooting Guide for Location Management System

## Common Issues and Solutions

### 1. 500 Internal Server Error when accessing location endpoints

**Symptoms:**
- `POST http://localhost:8000/api/locations/regions 500 (Internal Server Error)`
- API returns HTML error page instead of JSON

**Causes & Solutions:**

#### A. Database tables don't exist
**Solution:** Run migrations
```bash
cd AmpereCloudBusinessManagementSystem/backend
php artisan migrate
```

#### B. Database connection issues
**Solution:** Check your `.env` file configuration
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### C. Laravel cache issues
**Solution:** Clear all caches
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### 2. Infinite loop in AmpereCBMS when loading regions

**Symptoms:**
- Browser console shows repeated attempts to load regions
- Multiple 500 errors in console

**Solution:** This has been fixed in the latest code. The app no longer tries to auto-initialize regions on failure.

### 3. CORS errors when AmpereCBMS tries to access AmpereCloudBusinessManagementSystem API

**Symptoms:**
- `Access to fetch at 'http://localhost:8000/api/locations/regions' from origin 'http://localhost:3001' has been blocked by CORS policy`

**Solution:** Configure CORS in `AmpereCloudBusinessManagementSystem/backend/config/cors.php`:
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://localhost:3001'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 4. No regions appear in dropdown

**Symptoms:**
- Location dropdowns are empty
- No error messages in console

**Possible Causes:**
1. Database is empty - run the seeder
2. API is not running - ensure port 8000 is active
3. Wrong API URL in .env file

**Solution:**
```bash
# Seed the database
cd AmpereCloudBusinessManagementSystem/backend
php artisan db:seed --class=LocationSeeder

# Verify API is running
php artisan serve --port=8000
```

### 5. "Failed to load regions" error message

**Solution:** Check if the API server is running:
```bash
# Test the API endpoint directly
curl http://localhost:8000/api/locations/regions
```

If it returns HTML instead of JSON, there's a server error. Check Laravel logs:
```bash
tail -f storage/logs/laravel.log
```

### 6. Locations added in management system don't appear in AmpereCBMS

**Possible Causes:**
1. Different database connections
2. Caching issues
3. Frontend not refreshing

**Solution:**
1. Verify both apps point to the same API
2. Hard refresh the browser (Ctrl+F5)
3. Check browser network tab for API calls

## Quick Diagnostic Commands

### Check if migrations have run:
```bash
cd AmpereCloudBusinessManagementSystem/backend
php artisan migrate:status
```

### Check if database has data:
```bash
php artisan tinker
>>> \App\Models\Region::count()
>>> \App\Models\City::count()
>>> \App\Models\Barangay::count()
```

### Test API endpoints manually:
```bash
# Get all regions
curl http://localhost:8000/api/locations/regions

# Add a test region (adjust the JSON as needed)
curl -X POST http://localhost:8000/api/locations/regions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Region","description":"Test Description"}'
```

### Check Laravel logs for errors:
```bash
# Windows
type storage\logs\laravel.log

# Linux/Mac
tail -f storage/logs/laravel.log
```

## Environment Setup Checklist

- [ ] MySQL/MariaDB is installed and running
- [ ] Database exists (create it manually if needed)
- [ ] `.env` file exists in `AmpereCloudBusinessManagementSystem/backend`
- [ ] Database credentials in `.env` are correct
- [ ] Migrations have been run (`php artisan migrate`)
- [ ] Seeder has been run (`php artisan db:seed --class=LocationSeeder`)
- [ ] Laravel backend is running on port 8000
- [ ] `.env` file exists in `AmpereCBMS/frontend`
- [ ] `REACT_APP_LOCATION_API_URL` is set to `http://localhost:8000/api`
- [ ] Both frontend apps have been installed (`npm install`)
- [ ] No firewall blocking ports 3000, 3001, 8000, 8080

## Manual Database Setup (if migrations fail)

If migrations fail, you can manually create the tables:

```sql
CREATE DATABASE IF NOT EXISTS your_database_name;
USE your_database_name;

CREATE TABLE regions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_code_active (code, is_active)
);

CREATE TABLE cities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    region_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_region_active (region_id, is_active),
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
);

CREATE TABLE barangays (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    city_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(40) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_city_active (city_id, is_active),
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);
```

## Need More Help?

1. Check Laravel documentation: https://laravel.com/docs
2. Check React documentation: https://reactjs.org/docs
3. Review the LOCATION_SETUP_README.md for setup instructions
4. Ensure all prerequisites are installed (PHP, Composer, Node.js, NPM)

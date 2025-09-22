@ -1,24 +0,0 @@
@echo off
echo Running Laravel Migrations for Ampere CBMS...
echo.

cd "C:\Users\Admin\Documents\GitHub\AmpereCloudBusinessManagementSystem\backend"

echo Checking database connection...
php artisan migrate:status

echo.
echo Running all pending migrations...
php artisan migrate --force

echo.
echo Migration Status:
php artisan migrate:status

echo.
echo Seeding lookup data (if needed)...
php artisan db:seed --class=LookupDataSeeder --force

echo.
echo Done! All database tables should now be created.
pause
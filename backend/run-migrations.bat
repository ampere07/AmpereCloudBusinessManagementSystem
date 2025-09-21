@echo off
echo.
echo ===== Ampere Cloud Business Management System =====
echo ===== Database Migration Script =====
echo.

echo Step 1: Installing migration repository...
php artisan migrate:install
echo.

echo Step 2: Running all pending migrations...
php artisan migrate --force
echo.

echo Step 3: Verifying migration status...
php artisan migrate:status
echo.

echo Step 4: Checking database tables...
php artisan db:show
echo.

echo Migration completed successfully!
echo.

pause

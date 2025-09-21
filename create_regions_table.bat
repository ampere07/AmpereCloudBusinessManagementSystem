@echo off
cd /d "%~dp0backend"
echo Setting up app_regions table...
php artisan migrate --path=database/migrations/2024_12_01_000001_create_app_regions_table.php --force
echo.
echo Checking if regions data exists...
php -r "require 'vendor/autoload.php'; $app = require 'bootstrap/app.php'; $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap(); echo 'Regions in database: ' . PHP_EOL; foreach(DB::table('app_regions')->get() as $region) { echo 'ID: ' . $region->id . ' Name: ' . $region->name . PHP_EOL; }"
echo.
echo Setup complete.
pause

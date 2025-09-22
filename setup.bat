@echo off
echo =======================================
echo Dynamic Location Management System Setup
echo =======================================
echo.

REM Check if PHP is installed
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: PHP is not installed or not in PATH
    exit /b 1
)

REM Check if NPM is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: NPM is not installed or not in PATH
    exit /b 1
)

echo Step 1: Setting up AmpereCloudBusinessManagementSystem Backend
echo ---------------------------------------------------------------
cd AmpereCloudBusinessManagementSystem\backend

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please configure your database settings in the .env file
    echo Edit AmpereCloudBusinessManagementSystem\backend\.env and set:
    echo   DB_DATABASE=your_database_name
    echo   DB_USERNAME=your_username
    echo   DB_PASSWORD=your_password
    echo.
    pause
)

echo Installing composer dependencies...
call composer install

echo Generating application key...
call php artisan key:generate

echo Running database migrations...
call php artisan migrate

echo Seeding location data...
call php artisan db:seed --class=LocationSeeder

echo.
echo Step 2: Setting up AmpereCloudBusinessManagementSystem Frontend
echo ----------------------------------------------------------------
cd ..\frontend

REM Check if .env file exists
if not exist .env (
    echo Creating .env file...
    echo REACT_APP_API_URL=http://localhost:8000/api > .env
)

echo Installing npm dependencies...
call npm install

echo.
echo Step 3: Setting up AmpereCBMS Frontend
echo ---------------------------------------
cd ..\..\AmpereCBMS\frontend

REM Check if .env file exists
if not exist .env (
    echo Creating .env file...
    echo # Location API (AmpereCloudBusinessManagementSystem^) > .env
    echo REACT_APP_LOCATION_API_URL=http://localhost:8000/api >> .env
    echo. >> .env
    echo # Application API (AmpereCBMS backend^) >> .env
    echo REACT_APP_API_URL=http://localhost:8080 >> .env
)

echo Installing npm dependencies...
call npm install

cd ..\..

echo.
echo =======================================
echo Setup Complete!
echo =======================================
echo.
echo To start the system:
echo.
echo 1. Terminal 1 - AmpereCloudBusinessManagementSystem Backend:
echo    cd AmpereCloudBusinessManagementSystem\backend
echo    php artisan serve --port=8000
echo.
echo 2. Terminal 2 - AmpereCBMS Backend:
echo    cd AmpereCBMS\backend
echo    php artisan serve --port=8080
echo.
echo 3. Terminal 3 - AmpereCloudBusinessManagementSystem Frontend:
echo    cd AmpereCloudBusinessManagementSystem\frontend
echo    npm start
echo.
echo 4. Terminal 4 - AmpereCBMS Frontend:
echo    cd AmpereCBMS\frontend
echo    npm start
echo.
echo Access the systems at:
echo - Management System: http://localhost:3000
echo - Application Form: http://localhost:3001
echo.
pause

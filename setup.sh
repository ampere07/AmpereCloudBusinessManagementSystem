#!/bin/bash

# Setup script for Dynamic Location Management System

echo "======================================="
echo "Dynamic Location Management System Setup"
echo "======================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required commands
if ! command_exists php; then
    echo "Error: PHP is not installed or not in PATH"
    exit 1
fi

if ! command_exists npm; then
    echo "Error: NPM is not installed or not in PATH"
    exit 1
fi

echo "Step 1: Setting up AmpereCloudBusinessManagementSystem Backend"
echo "---------------------------------------------------------------"
cd AmpereCloudBusinessManagementSystem/backend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please configure your database settings in .env file"
    echo "Press Enter to continue after configuring..."
    read
fi

echo "Installing composer dependencies..."
composer install

echo "Generating application key..."
php artisan key:generate

echo "Running database migrations..."
php artisan migrate

echo "Seeding location data..."
php artisan db:seed --class=LocationSeeder

echo ""
echo "Step 2: Setting up AmpereCloudBusinessManagementSystem Frontend"
echo "----------------------------------------------------------------"
cd ../frontend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
fi

echo "Installing npm dependencies..."
npm install

echo ""
echo "Step 3: Setting up AmpereCBMS Frontend"
echo "---------------------------------------"
cd ../../AmpereCBMS/frontend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "# Location API (AmpereCloudBusinessManagementSystem)" > .env
    echo "REACT_APP_LOCATION_API_URL=http://localhost:8000/api" >> .env
    echo "" >> .env
    echo "# Application API (AmpereCBMS backend)" >> .env
    echo "REACT_APP_API_URL=http://localhost:8080" >> .env
fi

echo "Installing npm dependencies..."
npm install

echo ""
echo "======================================="
echo "Setup Complete!"
echo "======================================="
echo ""
echo "To start the system:"
echo ""
echo "1. Terminal 1 - AmpereCloudBusinessManagementSystem Backend:"
echo "   cd AmpereCloudBusinessManagementSystem/backend"
echo "   php artisan serve --port=8000"
echo ""
echo "2. Terminal 2 - AmpereCBMS Backend:"
echo "   cd AmpereCBMS/backend"
echo "   php artisan serve --port=8080"
echo ""
echo "3. Terminal 3 - AmpereCloudBusinessManagementSystem Frontend:"
echo "   cd AmpereCloudBusinessManagementSystem/frontend"
echo "   npm start"
echo ""
echo "4. Terminal 4 - AmpereCBMS Frontend:"
echo "   cd AmpereCBMS/frontend"
echo "   npm start"
echo ""
echo "Access the systems at:"
echo "- Management System: http://localhost:3000"
echo "- Application Form: http://localhost:3001"

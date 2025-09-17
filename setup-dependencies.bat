@echo off
echo Cleaning up package manager conflicts...
echo.

echo [1/4] Cleaning frontend dependencies...
cd frontend
if exist "node_modules" (
    echo Removing frontend node_modules...
    rmdir /s /q node_modules
)
if exist "pnpm-lock.yaml" (
    echo Removing pnpm-lock.yaml...
    del pnpm-lock.yaml
)
if exist ".pnpm" (
    echo Removing .pnpm directory...
    rmdir /s /q .pnpm
)
echo Installing frontend dependencies with npm...
npm install

echo.
echo [2/4] Cleaning backend dependencies...
cd ../backend
if exist "node_modules" (
    echo Removing backend node_modules...
    rmdir /s /q node_modules
)
if exist "pnpm-lock.yaml" (
    echo Removing backend pnpm-lock.yaml...
    del pnpm-lock.yaml
)
echo Installing backend npm dependencies...
npm install

echo.
echo [3/4] Installing composer dependencies...
if not exist "vendor" (
    echo Installing composer dependencies...
    composer install
) else (
    echo Composer dependencies already installed.
)

echo.
echo [4/4] Installing root dependencies...
cd ..
npm install

echo.
echo Dependencies setup complete!
echo You can now run:
echo - npm start (from root - starts both)
echo - cd frontend && npm start (frontend only)
echo - cd backend && npm start (backend only)
echo.
echo Press any key to continue...
pause > nul

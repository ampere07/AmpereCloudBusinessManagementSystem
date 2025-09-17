@echo off
echo Starting Ampere Cloud Business Management System...
echo.

echo [1/2] Starting Laravel Backend...
cd backend
start "Laravel Backend" cmd /k "echo Starting Laravel Backend... && npm start"
echo Backend will start on http://localhost:8000

echo.
echo [2/2] Starting React Frontend...
cd ../frontend
start "React Frontend" cmd /k "echo Starting React Frontend... && npm start"
echo Frontend will start on http://localhost:3000

echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Health: http://localhost:8000/api/health
echo.
echo Press any key to exit...
pause > nul

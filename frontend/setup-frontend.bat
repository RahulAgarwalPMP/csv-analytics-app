@echo off
echo ==========================================
echo   CSV Analytics - React Frontend
echo ==========================================

:: Check Node is available
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)

:: Install npm deps if missing
if exist "node_modules" goto start_app

echo [1/2] Installing npm dependencies...
npm install
if errorlevel 1 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)

:start_app
echo [2/2] Starting React app on http://localhost:3000
echo.
echo   Make sure backend is running on http://localhost:8000
echo   Press Ctrl+C to stop.
echo.
npm start
pause

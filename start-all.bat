@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo ==========================================
echo   CSV Analytics - Starting Full App
echo ==========================================
echo.

echo Starting Backend ...
start "CSV Analytics - Backend" cmd /k "cd /d "%BACKEND%" & call setup-backend.bat"

timeout /t 3 /nobreak >nul

echo Starting Frontend ...
start "CSV Analytics - Frontend" cmd /k "cd /d "%FRONTEND%" & call setup-frontend.bat"

echo.
echo Both services are starting in separate windows.
echo.
echo   Backend  --^>  http://localhost:8000
echo   Frontend --^>  http://localhost:3000
echo   API Docs --^>  http://localhost:8000/docs
echo.
echo Close the opened windows to stop the services.
pause
endlocal

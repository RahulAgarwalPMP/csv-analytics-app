@echo off
echo =========================================
echo   CSV Analytics - FastAPI Backend
echo =========================================

:: Create venv if missing
if exist "venv" goto install_check

echo [1/3] Creating Python virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.9+ and add it to PATH.
    pause
    exit /b 1
)

:install_check
:: Install dependencies if fastapi not present
if exist "venv\Lib\site-packages\fastapi" goto start_server

echo [2/3] Installing Python dependencies...
venv\Scripts\python.exe install_deps.py
if errorlevel 1 (
    echo ERROR: Dependency installation failed.
    pause
    exit /b 1
)

:start_server
echo [3/3] Starting FastAPI on http://localhost:8000
echo.
echo   API Docs : http://localhost:8000/docs
echo   Press Ctrl+C to stop.
echo.
venv\Scripts\uvicorn.exe main:app --reload --host 0.0.0.0 --port 8000
pause

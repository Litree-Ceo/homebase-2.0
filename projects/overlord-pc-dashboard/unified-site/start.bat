@echo off
echo Starting Unified Site
echo ======================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.x
    exit /b 1
)

:: Install deps if needed
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
)

echo Installing dependencies...
.venv\Scripts\pip install -q -r requirements.txt

echo.
echo Starting server on http://localhost:8080
echo.
echo Features:
echo   - PC Dashboard: Real-time system monitoring
echo   - Social Feed: Post and interact
echo   - Music Player: Track listing and controls
echo   - AI Chat: OpenRouter integration
echo.
echo Press Ctrl+C to stop
echo.

.venv\Scripts\python server.py

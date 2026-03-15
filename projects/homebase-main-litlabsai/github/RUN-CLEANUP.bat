@echo off
REM Run the cleanup script
cd /d "E:\VSCode\HomeBase 2.0"
powershell -ExecutionPolicy Bypass -File "Quick-Cleanup.ps1"
pause

@echo off
REM ════════════════════════════════════════════════════════════
REM  HOMEBASE 2.0 - EMERGENCY CLEANUP
REM ════════════════════════════════════════════════════════════
REM  This batch file performs all necessary cleanup operations
REM ════════════════════════════════════════════════════════════

title HomeBase 2.0 - Performance Cleanup
cd /d "E:\VSCode\HomeBase 2.0"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  HOMEBASE 2.0 - PERFORMANCE CLEANUP                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Step 1: Kill hung Docker processes
echo 1️⃣  Killing hung Docker processes...
taskkill /F /IM vmmem.exe 2>nul
taskkill /F /IM docker.exe 2>nul
taskkill /F /IM dockerd.exe 2>nul
taskkill /F /IM vpnkit.exe 2>nul
taskkill /F /IM gvproxy.exe 2>nul
echo    ✅ Done
echo.

REM Step 2: Clear VS Code cache
echo 2️⃣  Clearing VS Code cache...
if exist "%APPDATA%\Code\Cache" (
    echo    Removing: Code\Cache
    rd /s /q "%APPDATA%\Code\Cache" 2>nul
)
if exist "%APPDATA%\Code\CachedData" (
    echo    Removing: Code\CachedData
    rd /s /q "%APPDATA%\Code\CachedData" 2>nul
)
if exist "%APPDATA%\Code\Code Cache" (
    echo    Removing: Code\Code Cache
    rd /s /q "%APPDATA%\Code\Code Cache" 2>nul
)
echo    ✅ Done
echo.

REM Step 3: Clean pnpm cache
echo 3️⃣  Cleaning pnpm cache...
call pnpm store prune 2>nul
echo    ✅ Done
echo.

REM Step 4: Remove build artifacts
echo 4️⃣  Removing build artifacts...
if exist "api\dist" (
    echo    Removing: api\dist
    rd /s /q "api\dist" 2>nul
)
if exist "apps\web\.next" (
    echo    Removing: apps\web\.next
    rd /s /q "apps\web\.next" 2>nul
)
if exist ".turbo" (
    echo    Removing: .turbo
    rd /s /q ".turbo" 2>nul
)
echo    ✅ Done
echo.

echo ════════════════════════════════════════════════════════
echo ✨ CLEANUP COMPLETE!
echo ════════════════════════════════════════════════════════
echo.
echo 📋 Next steps:
echo    1. Close VS Code completely
echo    2. Run: pnpm install --frozen-lockfile
echo    3. Reopen VS Code
echo.
pause

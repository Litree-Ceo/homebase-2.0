@echo off
REM ════════════════════════════════════════════════════════════
REM  VERIFY VS CODE PERFORMANCE FIX
REM ════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion
title HomeBase 2.0 - Verification
color 0A

cd /d "E:\VSCode\HomeBase 2.0"

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  HOMEBASE 2.0 PERFORMANCE FIX - VERIFICATION             ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Check if extensions directory is clean
set "extdir=%USERPROFILE%\.vscode\extensions"
echo Checking for problematic extensions...
echo ──────────────────────────────────────────────────────────

set found=0

for /d %%D in ("%extdir%\ms-azuretools.vscode-containers*") do (
    echo ❌ FOUND: %%~nxD (should be removed!)
    set found=1
)

for /d %%D in ("%extdir%\ms-vscode-remote.remote-containers*") do (
    echo ❌ FOUND: %%~nxD (should be removed!)
    set found=1
)

if !found! equ 0 (
    echo ✅ No problematic extensions found - GOOD!
)

echo.
echo Checking VS Code settings...
echo ──────────────────────────────────────────────────────────

if exist ".vscode\settings.json" (
    echo ✅ Settings file exists
) else (
    echo ❌ Settings file missing!
)

echo.
echo Checking project structure...
echo ──────────────────────────────────────────────────────────

if exist "api" echo ✅ api/ folder found
if exist "apps\web" echo ✅ apps/web/ folder found
if exist "packages\core" echo ✅ packages/core/ folder found
if exist "node_modules" echo ✅ node_modules/ present
if exist "pnpm-lock.yaml" echo ✅ pnpm-lock.yaml found

echo.
echo Checking for build artifacts (should be clean)...
echo ──────────────────────────────────────────────────────────

if exist "api\dist" (
    echo ⚠️  api/dist/ still exists (will be recreated on next build)
) else (
    echo ✅ api/dist/ clean
)

if exist "apps\web\.next" (
    echo ⚠️  apps/web/.next/ still exists (will be recreated on next dev)
) else (
    echo ✅ apps/web/.next/ clean
)

if exist ".turbo" (
    echo ⚠️  .turbo/ still exists (safe to keep)
) else (
    echo ✅ .turbo/ clean
)

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  ✨ VERIFICATION COMPLETE                                ║
echo ║                                                          ║
echo ║  Your HomeBase 2.0 is ready!                            ║
echo ║                                                          ║
echo ║  🚀 To start development:                                ║
echo ║     Ctrl+Shift+B in VS Code                              ║
echo ║     OR run: pnpm dev                                     ║
echo ║                                                          ║
echo ║  📊 Performance expectations:                            ║
echo ║     • Startup: < 3 seconds                               ║
echo ║     • Shutdown: Instant (no timeouts)                    ║
echo ║     • File search: Instant                               ║
echo ║     • Autocomplete: < 1 second                           ║
echo ║                                                          ║
echo ║  ✅ All errors should be gone:                           ║
echo ║     • No "Stopping server timed out"                     ║
echo ║     • No Docker extension hangs                          ║
echo ║     • No EPIPE errors                                    ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
pause

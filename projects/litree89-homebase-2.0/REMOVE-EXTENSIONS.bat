@echo off
REM ════════════════════════════════════════════════════════════
REM  REMOVE PROBLEMATIC VS CODE EXTENSIONS
REM ════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion
title Removing VS Code Extensions
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  REMOVING PROBLEMATIC VS CODE EXTENSIONS                ║
echo ║                                                          ║
echo ║  This will remove:                                      ║
echo ║  • ms-azuretools.vscode-containers (MAIN CULPRIT)      ║
echo ║  • ms-vscode-remote.* (remote/container packages)      ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Press ENTER to continue...
pause >nul

REM Close VS Code
echo Closing VS Code...
taskkill /F /IM code.exe >nul 2>&1
taskkill /F /IM code-cli.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Remove extension folders
echo.
echo Removing extension directories...
echo ──────────────────────────────────────────────────────────

set "extdir=%USERPROFILE%\.vscode\extensions"

for /d %%D in ("%extdir%\ms-azuretools.vscode-containers*") do (
    echo Removing: %%D
    rd /s /q "%%D" 2>nul
)

for /d %%D in ("%extdir%\ms-vscode-remote.remote-containers*") do (
    echo Removing: %%D
    rd /s /q "%%D" 2>nul
)

for /d %%D in ("%extdir%\ms-vscode-remote.vscode-remote-extensionpack*") do (
    echo Removing: %%D
    rd /s /q "%%D" 2>nul
)

for /d %%D in ("%extdir%\ms-vscode-remote.remote-wsl*") do (
    echo Removing: %%D
    rd /s /q "%%D" 2>nul
)

echo.
echo ✅ Extensions removed!
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  ✨ CLEANUP COMPLETE                                     ║
echo ║                                                          ║
echo ║  Your problematic extensions have been removed!          ║
echo ║                                                          ║
echo ║  📋 Next steps:                                          ║
echo ║     1. Reopen VS Code                                    ║
echo ║     2. Verify no timeout errors                          ║
echo ║     3. Check Settings for any errors                     ║
echo ║                                                          ║
echo ║  Expected result:                                        ║
echo ║     ✓ No more "[Error] Stopping server timed out"       ║
echo ║     ✓ Instant shutdown                                   ║
echo ║     ✓ Faster startup                                     ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
pause

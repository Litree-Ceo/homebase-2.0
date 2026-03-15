@echo off
REM Microsoft 365 Local Testing Setup for Windows
REM Run this to set up local development environment for testing

echo.
echo Microsoft 365 Integration - Local Testing Setup
echo ==============================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [INFO] .env.local not found. Creating from template...
    copy .env.example .env.local
    echo [OK] .env.local created
)

echo.
echo Configuration for Local Testing
echo ================================
echo.
echo To test Microsoft 365 OAuth locally, update .env.local with:
echo.
echo   MICROSOFT_CLIENT_ID=your_client_id
echo   MICROSOFT_CLIENT_SECRET=your_client_secret
echo   MICROSOFT_TENANT_ID=your_tenant_id
echo   MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/callback/microsoft
echo.

REM Check if env vars are set
findstr /M "your_client_id_here your_client_secret_here" .env.local >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Microsoft 365 environment variables not configured
    echo.
    echo Steps to configure:
    echo   1. Go to https://portal.azure.com
    echo   2. Create app registration 'LitLabs AI Copilot'
    echo   3. Copy Client ID, Client Secret, Tenant ID
    echo   4. Edit .env.local and replace the values
    echo   5. Set redirect URI to: http://localhost:3000/api/auth/callback/microsoft
    echo.
) else (
    echo [OK] Microsoft 365 environment variables configured
)

echo.
echo Starting Local Development Server
echo ==================================
echo.
echo npm run dev
echo.
echo Server will start on: http://localhost:3000
echo OAuth callback will be: http://localhost:3000/api/auth/callback/microsoft
echo.
echo Test steps:
echo   1. Open http://localhost:3000
echo   2. Try signing in with Microsoft
echo   3. You should be redirected to Microsoft login
echo   4. After login, you should be back on your site
echo   5. Check Firebase console for user data
echo.
echo [INFO] Ready to test? Run: npm run dev
echo.
pause

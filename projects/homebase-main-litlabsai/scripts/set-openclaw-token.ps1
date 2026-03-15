# Set-OpenClawToken.ps1
# Helper script to securely set the Telegram Token and run the setup
# Usage: .\Set-OpenClawToken.ps1

Write-Host "=== OpenClaw Telegram Token Setup ===" -ForegroundColor Cyan
Write-Host "This script will securely set your Telegram Bot Token in the environment." -ForegroundColor Gray

$Token = Read-Host "Please paste your Telegram Bot Token (hidden)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Token)
$PlainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

if ([string]::IsNullOrWhiteSpace($PlainToken)) {
    Write-Host "Error: Token cannot be empty." -ForegroundColor Red
    exit 1
}

# Set environment variable for the current user (persistent)
[System.Environment]::SetEnvironmentVariable('TELEGRAM_BOT_TOKEN', $PlainToken, 'User')
$env:TELEGRAM_BOT_TOKEN = $PlainToken

Write-Host "`n[SUCCESS] Token has been securely set in your environment variables." -ForegroundColor Green
Write-Host "Running setup script now...`n" -ForegroundColor Cyan

# Run the setup script
.\setup-openclaw-telegram.ps1

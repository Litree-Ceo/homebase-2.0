$Source = "$PSScriptRoot\..\openclaw-fix.json"
$Destination = "$env:USERPROFILE\.openclaw\openclaw.json"

Write-Host "Fixing OpenClaw Config..." -ForegroundColor Cyan
Write-Host "Source: $Source"
Write-Host "Dest:   $Destination"

if (Test-Path $Source) {
    Copy-Item -Path $Source -Destination $Destination -Force
    Write-Host "Success: Config file updated." -ForegroundColor Green
    
    # Verify
    $content = Get-Content $Destination -Raw
    if ($content -match "AIzaSyBKD3ioSQ2kJ9GytyU7wES-7R9F9p69gPQ") {
        Write-Host "Verification: API Key found in new config." -ForegroundColor Green
    } else {
        Write-Host "Verification Failed: API Key not found." -ForegroundColor Red
    }
} else {
    Write-Host "Error: Source file not found." -ForegroundColor Red
}

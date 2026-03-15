#!/usr/bin/env pwsh
# Auto-start Azurite storage emulator for Azure Functions timer triggers

$AzuritePath = "e:\VSCode\HomeBase 2.0\apps\web\__blobstorage__"
$BlobPort = 10000
$QueuePort = 10001
$TablePort = 10002

# Kill any existing Azurite processes
Get-Process azurite -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 500

# Ensure storage directory exists
if (-not (Test-Path $AzuritePath)) {
    New-Item -ItemType Directory -Path $AzuritePath -Force | Out-Null
}

# Start Azurite in background
$azuriteCmd = "azurite"
Start-Process pwsh -ArgumentList `
    "-NoProfile", "-Command", `
    "$azuriteCmd --silent --location `"$AzuritePath`" --blobPort $BlobPort --queuePort $QueuePort --tablePort $TablePort" `
    -WindowStyle Hidden

Start-Sleep -Seconds 3

# Verify it started
$maxRetries = 5
$retryCount = 0
$isRunning = $false

while ($retryCount -lt $maxRetries -and -not $isRunning) {
    if (Test-NetConnection -ComputerName localhost -Port $BlobPort -InformationLevel Quiet -WarningAction SilentlyContinue) {
        $isRunning = $true
        Write-Host "✅ Azurite running on ports $BlobPort, $QueuePort, $TablePort" -ForegroundColor Green
    } else {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Start-Sleep -Seconds 1
        }
    }
}

if (-not $isRunning) {
    Write-Host "⚠️  Azurite may not be ready yet (timer functions will retry)" -ForegroundColor Yellow
}

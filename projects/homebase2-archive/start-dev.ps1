# HomeBase 2.0 Development Startup Script (Windows)

Write-Host "?? Starting HomeBase 2.0 Development Environment..." -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "? Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "? Node.js found: $(node --version)" -ForegroundColor Green

# Check if Azure Functions Core Tools is installed
if (-not (Get-Command func -ErrorAction SilentlyContinue)) {
    Write-Host "??  Azure Functions Core Tools not found." -ForegroundColor Yellow
    Write-Host "Install with: npm install -g azure-functions-core-tools@4 --unsafe-perm true" -ForegroundColor Yellow
    $install = Read-Host "Would you like to install it now? (y/n)"
    if ($install -eq 'y') {
        npm install -g azure-functions-core-tools@4 --unsafe-perm true
    }
}

# Install client dependencies
Write-Host "`n?? Installing client dependencies..." -ForegroundColor Cyan
Set-Location client
npm install

# Install API dependencies
Write-Host "`n?? Installing API dependencies..." -ForegroundColor Cyan
Set-Location ..\api
npm install

# Return to root
Set-Location ..

Write-Host "`n?? Starting development servers..." -ForegroundColor Green
Write-Host "   API will run on: http://localhost:7071" -ForegroundColor Yellow
Write-Host "   Client will run on: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop both servers`n" -ForegroundColor Gray

# Start API in background
$apiJob = Start-Job -ScriptBlock {
    Set-Location $args[0]\api
    func start
} -ArgumentList $PWD.Path

# Wait a moment for API to start
Start-Sleep -Seconds 3

# Start client (foreground)
Set-Location client
try {
    npm run dev
} finally {
    # Cleanup: Stop the API job when client stops
    Write-Host "`n?? Stopping servers..." -ForegroundColor Yellow
    Stop-Job $apiJob
    Remove-Job $apiJob
    Write-Host "? Servers stopped" -ForegroundColor Green
}

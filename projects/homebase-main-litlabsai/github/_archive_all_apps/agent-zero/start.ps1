# Agent Zero Enhanced - Easy launcher script for Windows/PowerShell

Write-Host "🚀 Agent Zero Enhanced Launcher" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Check if we're in Docker
if (Test-Path "/.dockerenv") {
    Write-Host "🐳 Running inside Docker container" -ForegroundColor Green
    python main_enhanced.py
} else {
    Write-Host "💻 Running on host system" -ForegroundColor Green
    
    # Check if Docker is available
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        $response = Read-Host "🐳 Docker detected - would you like to run in container? (y/n)"
        if ($response -match '^[Yy]$') {
            Write-Host "🏃 Starting Docker container..." -ForegroundColor Yellow
            docker-compose down
            docker-compose up --build
        } else {
            Write-Host "🚀 Running directly with Python..." -ForegroundColor Yellow
            python main_enhanced.py
        }
    } else {
        Write-Host "🚀 Running directly with Python..." -ForegroundColor Yellow
        python main_enhanced.py
    }
}
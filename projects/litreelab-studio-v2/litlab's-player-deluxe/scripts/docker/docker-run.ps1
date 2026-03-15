# Run Overlord in Docker
$ErrorActionPreference = "Stop"

Write-Host "Starting Overlord Dashboard..." -ForegroundColor Cyan

# Create necessary directories
New-Item -ItemType Directory -Force -Path "data", "logs" | Out-Null

# Start services
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Overlord is running!" -ForegroundColor Green
    Write-Host "Access: http://localhost:8080"
    Write-Host "Logs: docker-compose logs -f"
} else {
    Write-Host "Failed to start!" -ForegroundColor Red
}

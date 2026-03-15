# Build Docker image
$ErrorActionPreference = "Stop"

Write-Host "Building Overlord Docker image..." -ForegroundColor Cyan

docker build -t overlord-dashboard:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "Run with: docker-compose up -d"
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}

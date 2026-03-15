#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Boot Docker emulators for LITLABS local development.
    
.DESCRIPTION
    Starts: Cosmos DB, Azure Storage (Azurite), PostgreSQL, Redis, MongoDB, Mailhog
    
.EXAMPLE
    docker-compose -f docker/docker-compose.yml up -d
    
    # Check status
    docker ps
    
    # View logs
    docker-compose -f docker/docker-compose.yml logs -f
    
    # Stop
    docker-compose -f docker/docker-compose.yml down
    
.NOTES
    Requires: Docker Desktop
    Location: docker/docker-compose.yml
#>

$dockerComposeFile = Join-Path $PSScriptRoot "docker-compose.yml"

if (-not (Test-Path $dockerComposeFile)) {
    Write-Host "❌ docker-compose.yml not found" -ForegroundColor Red
    exit 1
}

Write-Host "🐳 Starting Docker emulators..." -ForegroundColor Green
docker-compose -f $dockerComposeFile up -d

Write-Host ""
Write-Host "✅ Services started:" -ForegroundColor Green
Write-Host "  • Cosmos DB:      localhost:8081 (https://localhost:8081/_explorer/index.html)"
Write-Host "  • Azure Storage:  localhost:10000 (blob), 10001 (queue), 10002 (table)"
Write-Host "  • PostgreSQL:     localhost:5432 (user: litlabs, pwd: dev-password)"
Write-Host "  • Redis:          localhost:6379"
Write-Host "  • MongoDB:        localhost:27017 (user: litlabs, pwd: dev-password)"
Write-Host "  • Mailhog (SMTP): localhost:1025 | Web: http://localhost:8025"
Write-Host ""
Write-Host "📋 Check status:"
Write-Host "   docker ps"
Write-Host ""
Write-Host "📊 View logs:"
Write-Host "   docker-compose -f docker/docker-compose.yml logs -f"
Write-Host ""
Write-Host "🛑 Stop services:"
Write-Host "   docker-compose -f docker/docker-compose.yml down"

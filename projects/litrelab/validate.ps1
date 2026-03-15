# Validation script for Litrelab Docker Setup (PowerShell)

Write-Host "🔍 Validating Litrelab Docker Setup..." -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Check if Docker is running
Write-Host "Checking Docker... " -NoNewline
try {
    $null = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker is running" -ForegroundColor Green
    } else {
        throw "Docker not running"
    }
} catch {
    Write-Host "✗ Docker is not running! Start Docker Desktop first." -ForegroundColor Red
    $errors++
}

# Check required files exist
Write-Host ""
Write-Host "Checking required files..."

$files = @(
    "litreelab-backend/Dockerfile.backend",
    "litreelab-backend/Dockerfile.backend.dev",
    "litreelab-backend/pyproject.toml",
    "litreelab-backend/uv.lock",
    "litreelab-backend/main.py",
    "litreelab-studio/Dockerfile.frontend",
    "litreelab-studio/Dockerfile.frontend.dev",
    "litreelab-studio/package.json",
    "docker-compose.litrelab.yml",
    "docker-compose.litrelab.dev.yml"
)

foreach ($file in $files) {
    Write-Host "  $file... " -NoNewline
    if (Test-Path $file) {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "✗ Missing!" -ForegroundColor Red
        $errors++
    }
}

# Check if ports are available
Write-Host ""
Write-Host "Checking ports..."

foreach ($port in @(8000, 4321)) {
    Write-Host "  Port $port... " -NoNewline
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "⚠ Already in use!" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "✓ Available" -ForegroundColor Green
    }
}

# Check Python version in pyproject.toml
Write-Host ""
Write-Host "Checking Python version alignment... " -NoNewline
$content = Get-Content "litreelab-backend/pyproject.toml" -Raw
if ($content -match 'requires-python = ">=3\.12"') {
    Write-Host "✓ Python 3.12" -ForegroundColor Green
} else {
    Write-Host "⚠ Python version mismatch" -ForegroundColor Yellow
    $warnings++
}

# Check Node version in package.json
Write-Host "Checking Node version alignment... " -NoNewline
$packageJson = Get-Content "litreelab-studio/package.json" -Raw | ConvertFrom-Json
if ($packageJson.engines.node -match "22") {
    Write-Host "✓ Node 22" -ForegroundColor Green
} else {
    Write-Host "⚠ Node version mismatch" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:"
    Write-Host "  make up    # Production" -ForegroundColor Yellow
    Write-Host "  make dev   # Development" -ForegroundColor Yellow
} elseif ($errors -eq 0) {
    Write-Host "⚠️  $warnings warning(s) found" -ForegroundColor Yellow
    Write-Host "You can still proceed, but review warnings above."
} else {
    Write-Host "❌ $errors error(s) found" -ForegroundColor Red
    Write-Host "Please fix errors before proceeding."
}

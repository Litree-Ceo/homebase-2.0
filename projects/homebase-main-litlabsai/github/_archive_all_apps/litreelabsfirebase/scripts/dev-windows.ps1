# Simple PowerShell script to run the Next.js dev server on Windows without nvm.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/dev-windows.ps1 [-Port 3000]

param(
    [int]$Port = 3000
)

$repoPath = "C:\Users\dying\public"
if (-not (Test-Path $repoPath)) {
    Write-Host "Repo path not found: $repoPath" -ForegroundColor Red
    exit 1
}

Set-Location $repoPath

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js not found. Install Node 20+ (winget install OpenJS.NodeJS.LTS) and retry." -ForegroundColor Red
    exit 1
}

$nodeVersion = node -v
Write-Host "Using Node $nodeVersion" -ForegroundColor Green

if (-not (Test-Path ".env.local")) {
    Write-Host "Warning: .env.local not found. Whisper mode will fail without OPENAI_API_KEY." -ForegroundColor Yellow
} else {
    $hasOpenAI = Select-String -Path ".env.local" -Pattern "^OPENAI_API_KEY\s*=" -Quiet
    if (-not $hasOpenAI) {
        Write-Host "Warning: OPENAI_API_KEY missing in .env.local. Browser-only mode will still work on /speech." -ForegroundColor Yellow
    }
}

Write-Host "Installing deps (npm install)..." -ForegroundColor Yellow
npm install

Write-Host "Starting Next.js dev server on port $Port..." -ForegroundColor Yellow
npm run dev -- --hostname 0.0.0.0 --port $Port

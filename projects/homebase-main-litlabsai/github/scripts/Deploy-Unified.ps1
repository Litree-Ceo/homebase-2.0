
# Build and Deploy Unified LitLabs Site

Write-Host "Starting Unified Build Process..." -ForegroundColor Cyan

# 1. Build Main Web App
Write-Host "Building Main Web App..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot/../apps/web"
pnpm build
if ($LASTEXITCODE -ne 0) { Write-Error "Web App Build Failed"; exit 1 }

# 2. Build Metaverse App
Write-Host "Building Metaverse App..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot/../apps/litreelab-studio-metaverse"
pnpm build
if ($LASTEXITCODE -ne 0) { Write-Error "Metaverse App Build Failed"; exit 1 }

# 3. Merge Outputs
Write-Host "Merging Metaverse into Main App..." -ForegroundColor Yellow
$Dest = "$PSScriptRoot/../apps/web/out/metaverse"
if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Force -Path $Dest | Out-Null }
Copy-Item -Path "$PSScriptRoot/../apps/litreelab-studio-metaverse/out/*" -Destination $Dest -Recurse -Force

# 4. Deploy
Write-Host "Deploying to Firebase..." -ForegroundColor Green
Set-Location "$PSScriptRoot/.."
firebase deploy --only hosting

Write-Host "Deployment Complete!" -ForegroundColor Green

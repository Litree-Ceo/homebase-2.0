# LiTreeLab Studio - Launch Script (PowerShell)
# Run this after completing all setup steps

$ErrorActionPreference = "Stop"

Write-Host "🚀 LiTreeLab Studio Launch Sequence" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Step 1: Pre-flight checks
Write-Host "`nStep 1: Pre-flight checks..." -ForegroundColor Yellow

$tools = @("docker", "az", "git", "node", "npm")
$missing = @()

foreach ($tool in $tools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        $missing += $tool
    }
}

if ($missing.Count -gt 0) {
    Write-Host "❌ Missing tools: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Run .\install-tools.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All CLI tools found" -ForegroundColor Green

# Step 2: Build frontend
Write-Host "`nStep 2: Building React frontend..." -ForegroundColor Yellow
Set-Location app_builder/web
npm ci
npm run build
Set-Location ..\..
Write-Host "✅ Frontend build complete" -ForegroundColor Green

# Step 3: Test locally
Write-Host "`nStep 3: Testing with Docker..." -ForegroundColor Yellow
docker-compose up --build -d

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Local test passed - http://localhost:8000 is responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Local test may have issues. Check docker-compose logs" -ForegroundColor Yellow
}

docker-compose down
Write-Host "✅ Local containers stopped" -ForegroundColor Green

# Step 4: Push to GitHub
Write-Host "`nStep 4: Pushing to GitHub..." -ForegroundColor Yellow
git add -A
git commit -m "chore: pre-deployment checkpoint $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ErrorAction SilentlyContinue
git push origin main
Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green

# Step 5: Azure setup
Write-Host "`nStep 5: Checking Azure setup..." -ForegroundColor Yellow

$account = az account show 2>$null | ConvertFrom-Json
if (!$account) {
    Write-Host "🔑 Please login to Azure:" -ForegroundColor Yellow
    az login
    $account = az account show | ConvertFrom-Json
}

$subscriptionId = $account.id
Write-Host "✅ Using subscription: $subscriptionId" -ForegroundColor Green

# Step 6: Generate Service Principal
Write-Host "`nStep 6: Azure Service Principal Setup" -ForegroundColor Yellow
Write-Host "Generating credentials for GitHub Actions..." -ForegroundColor Cyan

$sp = az ad sp create-for-rbac `
    --name "litreelab-studio-deployer" `
    --role contributor `
    --scopes "/subscriptions/$subscriptionId" `
    --sdk-auth | ConvertFrom-Json

$credentials = $sp | ConvertTo-Json -Depth 10

Write-Host "`n📝 AZURE_CREDENTIALS (COPY THIS ENTIRE JSON):" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host $credentials -ForegroundColor White
Write-Host "================================`n" -ForegroundColor Cyan

# Save to file for reference
$credentials | Out-File -FilePath "azure-credentials.json" -Encoding utf8
Write-Host "💾 Credentials also saved to: azure-credentials.json" -ForegroundColor Green

Write-Host "`n⚠️  IMPORTANT: Add this to GitHub Secrets:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/Litree-Ceo/litreelab-studio/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Click 'New repository secret'" -ForegroundColor White
Write-Host "3. Name: AZURE_CREDENTIALS" -ForegroundColor White
Write-Host "4. Value: Paste the entire JSON above" -ForegroundColor White
Write-Host "5. Click 'Add secret'" -ForegroundColor White

$confirm = Read-Host "`nHave you added the AZURE_CREDENTIALS secret? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "`nPlease add the secret and run this script again." -ForegroundColor Yellow
    exit 0
}

# Step 7: Trigger deployment
Write-Host "`nStep 7: Triggering deployment..." -ForegroundColor Yellow
Write-Host "🔄 Pushing a change to trigger GitHub Actions..." -ForegroundColor Cyan

Add-Content -Path "DEPLOYMENT.md" -Value "`n# Deployment triggered at $(Get-Date)"
git add DEPLOYMENT.md
git commit -m "chore: trigger deployment [skip ci]"
git push origin main

Write-Host "`n====================================" -ForegroundColor Green
Write-Host "🚀 Launch sequence complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "`nMonitor deployment at:" -ForegroundColor White
Write-Host "https://github.com/Litree-Ceo/litreelab-studio/actions" -ForegroundColor Cyan
Write-Host "`nYour app will be live at:" -ForegroundColor White
Write-Host "https://litreelabstudio-prod.azurewebsites.net" -ForegroundColor Cyan
Write-Host "`n⏱️  Estimated time to live: 5-10 minutes" -ForegroundColor Yellow

# Cleanup
Remove-Item -Path "azure-credentials.json" -ErrorAction SilentlyContinue

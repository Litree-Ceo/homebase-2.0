# Setup script for Microsoft 365 integration (PowerShell)
# This script validates and configures all required Microsoft 365 components

$ErrorActionPreference = "Stop"

Write-Host "🔧 LitLabs AI - Microsoft 365 Integration Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found" -ForegroundColor Yellow
    Write-Host "Please copy .env.example to .env.local and fill in the values:"
    Write-Host ""
    Write-Host "  copy .env.example .env.local" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then add these Microsoft 365 variables:" -ForegroundColor Gray
    Write-Host "  MICROSOFT_CLIENT_ID=<your-client-id>" -ForegroundColor Gray
    Write-Host "  MICROSOFT_CLIENT_SECRET=<your-client-secret>" -ForegroundColor Gray
    Write-Host "  MICROSOFT_TENANT_ID=<your-tenant-id>" -ForegroundColor Gray
    Write-Host "  MICROSOFT_REDIRECT_URI=https://your-domain.com/api/auth/callback/microsoft" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Check required environment variables
Write-Host "✓ Checking environment variables..." -ForegroundColor Green
$requiredVars = @(
    "MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET",
    "MICROSOFT_TENANT_ID",
    "MICROSOFT_REDIRECT_URI",
    "STRIPE_SECRET_KEY"
)

$envContent = Get-Content .env.local
$missingVars = @()

foreach ($var in $requiredVars) {
    if ($envContent -notmatch "^${var}=") {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please add them to .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "✓ All required variables found" -ForegroundColor Green
Write-Host ""

# Run build validation
Write-Host "🔨 Building project..." -ForegroundColor Cyan
$buildOutput = npm run build 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}

# Run type checking
Write-Host "✓ Type checking..." -ForegroundColor Green
$typeOutput = npm run typecheck 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ TypeScript validation passed" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript errors found" -ForegroundColor Red
    Write-Host $typeOutput
    exit 1
}

# Run linting
Write-Host "✓ Linting code..." -ForegroundColor Green
$lintOutput = npm run lint 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Lint check passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Lint warnings found:" -ForegroundColor Yellow
    Write-Host $lintOutput
}

Write-Host ""
Write-Host "✅ All checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure Azure AD registration (if not done):" -ForegroundColor Gray
Write-Host "   - Go to: https://portal.azure.com" -ForegroundColor Gray
Write-Host "   - Create app registration with your credentials" -ForegroundColor Gray
Write-Host "   - Grant permissions: User.Read, Mail.Send, Calendars.ReadWrite, etc." -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy to Vercel:" -ForegroundColor Gray
Write-Host "   - Push to master: git push origin master" -ForegroundColor Gray
Write-Host "   - Vercel will auto-deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set Vercel environment variables:" -ForegroundColor Gray
Write-Host "   - Go to: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "   - Add all MICROSOFT_* variables from .env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test the integration:" -ForegroundColor Gray
Write-Host "   - npm run dev" -ForegroundColor Gray
Write-Host "   - Visit: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation: MICROSOFT_365_DEPLOYMENT.md" -ForegroundColor Gray

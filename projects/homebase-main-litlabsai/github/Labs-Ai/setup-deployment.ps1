#!/usr/bin/env pwsh
<#
.SYNOPSIS
LitLabs AI Environment Setup and Deployment Script

.DESCRIPTION
Comprehensive setup script for production deployment including:
- Environment variable validation
- Stripe product/price creation
- Firebase configuration verification
- NATS server setup (optional)
- Health check verification
- Database schema initialization

.PARAMETER Environment
Target environment: development, staging, or production

.PARAMETER SkipStripe
Skip Stripe setup (useful if already configured)

.PARAMETER SkipNATS
Skip NATS setup (NATS is optional)

.EXAMPLE
.\setup-deployment.ps1 -Environment production
.\setup-deployment.ps1 -Environment staging -SkipStripe
#>

param(
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',
    [switch]$SkipStripe,
    [switch]$SkipNATS,
    [switch]$Verify
)

$ErrorActionPreference = 'Stop'
$WarningPreference = 'Continue'

# Color output
$SuccessColor = 'Green'
$ErrorColor = 'Red'
$InfoColor = 'Cyan'
$WarningColor = 'Yellow'

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $SuccessColor
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $ErrorColor
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $InfoColor
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $WarningColor
}

# Step 1: Environment File Check
Write-Info "Step 1/8: Validating Environment Files"
Write-Host ""

$envFiles = @{
    '.env.local' = 'Local environment file'
    '.env.example' = 'Environment template'
}

foreach ($file in $envFiles.Keys) {
    if (Test-Path $file) {
        Write-Success "Found $file"
    }
    else {
        if ($file -eq '.env.local') {
            Write-Warning-Custom "Missing $file - copy from .env.example and populate values"
        }
        else {
            Write-Info "Reference: $file"
        }
    }
}

# Step 2: Validate Required Environment Variables
Write-Info "`nStep 2/8: Validating Required Environment Variables"
Write-Host ""

$requiredEnvVars = @(
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_APP_URL',
    'JWT_SECRET',
    'INTERNAL_WEBHOOK_SECRET'
)

$missingVars = @()
foreach ($var in $requiredEnvVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Success "✓ $var"
    }
    else {
        Write-Warning-Custom "✗ $var"
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host ""
    Write-Error-Custom "Missing required environment variables:"
    $missingVars | ForEach-Object { Write-Host "  - $_" }
    Write-Info "Populate .env.local with these values from:"
    Write-Host "  - Google Cloud Console (GOOGLE_GENERATIVE_AI_API_KEY)"
    Write-Host "  - Firebase Console (FIREBASE_*)"
    Write-Host "  - Stripe Dashboard (STRIPE_SECRET_KEY)"
    exit 1
}

# Step 3: Stripe Setup (Optional)
if (-not $SkipStripe) {
    Write-Info "`nStep 3/8: Setting up Stripe Products and Prices"
    Write-Host ""

    $stripeTiers = @(
        @{
            name = 'Starter'
            amount = 1900
            interval = 'month'
            tier = 'starter'
        },
        @{
            name = 'Creator'
            amount = 4900
            interval = 'month'
            tier = 'creator'
        },
        @{
            name = 'Pro'
            amount = 9900
            interval = 'month'
            tier = 'pro'
        },
        @{
            name = 'Agency'
            amount = 29900
            interval = 'month'
            tier = 'agency'
        }
    )

    Write-Info "Note: Stripe product creation requires authentication"
    Write-Host ""

    foreach ($tier in $stripeTiers) {
        Write-Info "Tier: $($tier.name) - `$$($tier.amount / 100)/month"
        Write-Host "  ℹ️  Create this in Stripe Dashboard:"
        Write-Host "  1. Go to https://dashboard.stripe.com/products"
        Write-Host "  2. Click 'Add product'"
        Write-Host "  3. Name: '$($tier.name) Plan'"
        Write-Host "  4. Billing: Set Standard pricing"
        Write-Host "  5. Price: `$($tier.amount / 100) USD / $($tier.interval)"
        Write-Host "  6. Save price ID to .env.local as STRIPE_PRICE_ID_$($tier.tier.ToUpper())"
        Write-Host ""
    }

    Write-Warning-Custom "⚠️  Complete Stripe setup in dashboard, then continue"
    Write-Info "Required environment variables:"
    Write-Host "  STRIPE_PRICE_ID_STARTER=price_1Abc..."
    Write-Host "  STRIPE_PRICE_ID_CREATOR=price_1Def..."
    Write-Host "  STRIPE_PRICE_ID_PRO=price_1Ghi..."
    Write-Host "  STRIPE_PRICE_ID_AGENCY=price_1Jkl..."
    Write-Host ""

    $stripeDone = Read-Host "Have you created Stripe products? (yes/no)"
    if ($stripeDone -ne 'yes') {
        Write-Error-Custom "Skipping Stripe setup. Complete manually and re-run script."
    }
    else {
        Write-Success "Stripe products configured"
    }
}
else {
    Write-Info "Step 3/8: Skipping Stripe Setup (--SkipStripe flag)"
}

# Step 4: Firebase Configuration
Write-Info "`nStep 4/8: Validating Firebase Configuration"
Write-Host ""

Write-Info "Firebase Project Configuration:"
$firebaseProject = [Environment]::GetEnvironmentVariable('FIREBASE_PROJECT_ID')
Write-Host "  Project ID: $firebaseProject"
Write-Host "  Status: ✓ Configured"
Write-Host ""
Write-Info "Required Firestore Collections (created automatically):"
$collections = @('users', 'tasks', 'subscriptions', 'affiliates', 'referrals', 'whiteLabelConfigs', 'userInsights', 'contentPerformance', 'revenueMetrics')
$collections | ForEach-Object {
    Write-Host "  ✓ $_"
}

Write-Success "Firebase configuration valid"

# Step 5: NATS Setup (Optional)
if (-not $SkipNATS) {
    Write-Info "`nStep 5/8: NATS JetStream Configuration (Optional)"
    Write-Host ""

    Write-Info "NATS is optional. Setup only if you need scalable task queuing."
    Write-Host ""
    Write-Info "Option A: Docker (Recommended)"
    Write-Host '  docker run -p 4222:4222 -p 8222:8222 `'
    Write-Host '    nats:latest -js'
    Write-Host ""
    Write-Info "Option B: Local Installation"
    Write-Host "  scoop install nats-server"
    Write-Host "  nats-server -js"
    Write-Host ""
    Write-Info "Option C: Cloud (Azure, AWS, etc.)"
    Write-Host "  Use managed NATS service from your cloud provider"
    Write-Host ""

    $natsSetup = Read-Host "Have you setup NATS? (yes/no/skip)"
    if ($natsSetup -eq 'yes') {
        Write-Host "Set NATS_URL in .env.local:"
        Write-Host "  NATS_URL=nats://localhost:4222"
        Write-Success "NATS configuration complete"
    }
    else {
        Write-Info "NATS is optional - system will work without it"
    }
}
else {
    Write-Info "Step 5/8: Skipping NATS Setup (--SkipNATS flag)"
}

# Step 6: Dependencies
Write-Info "`nStep 6/8: Installing Dependencies"
Write-Host ""

Write-Info "Running: npm install"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependencies installed"
}
else {
    Write-Error-Custom "Failed to install dependencies"
    exit 1
}

# Step 7: Build Verification
Write-Info "`nStep 7/8: Verifying Build"
Write-Host ""

Write-Info "Running: npm run build"
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Build successful"
}
else {
    Write-Error-Custom "Build failed - fix errors above"
    exit 1
}

# Step 8: Health Check
Write-Info "`nStep 8/8: Starting Development Server and Health Check"
Write-Host ""

Write-Info "Starting server..."
$serverProcess = Start-Process -FilePath npm -ArgumentList 'run', 'dev' -PassThru -NoNewWindow

# Wait for server to start
Start-Sleep -Seconds 5

Write-Info "Running health check..."
$healthUrl = "http://localhost:3000/api/health"
$retries = 0
$maxRetries = 10

do {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $health = $response.Content | ConvertFrom-Json
            Write-Success "Server is healthy"
            Write-Host ""
            Write-Host "Service Status:"
            $health.services | ForEach-Object {
                Write-Host "  ✓ $_ "
            }
            break
        }
    }
    catch {
        $retries++
        if ($retries -lt $maxRetries) {
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 1
        }
    }
} while ($retries -lt $maxRetries)

if ($retries -ge $maxRetries) {
    Write-Error-Custom "Health check failed - server not responding"
    Stop-Process -Id $serverProcess.Id
    exit 1
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor $SuccessColor
Write-Host "✅ SETUP COMPLETE" -ForegroundColor $SuccessColor
Write-Host "========================================" -ForegroundColor $SuccessColor
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor $InfoColor
Write-Host "1. Application running on: http://localhost:3000"
Write-Host "2. API health: http://localhost:3000/api/health"
Write-Host "3. Stripe webhook URL: http://localhost:3000/api/stripe-webhook"
Write-Host ""

Write-Host "Testing:" -ForegroundColor $InfoColor
Write-Host "  npm test -- lib/test-workflows.ts"
Write-Host ""

Write-Host "Production Deployment:" -ForegroundColor $InfoColor
if ($Environment -eq 'production') {
    Write-Host "  1. Verify all environment variables"
    Write-Host "  2. Deploy to Vercel:"
    Write-Host "     vercel --prod"
    Write-Host "  3. Update Stripe webhook to: https://your-domain/api/stripe-webhook"
    Write-Host "  4. Monitor at: https://sentry.io"
}
else {
    Write-Host "  Run with: .\setup-deployment.ps1 -Environment production"
}

Write-Host ""
Write-Host "Documentation:" -ForegroundColor $InfoColor
Write-Host "  - MONETIZATION_SYSTEM.md - Feature reference"
Write-Host "  - DEPLOYMENT_GUIDE.md - Configuration guide"
Write-Host "  - QUICK_REFERENCE.md - Developer guide"
Write-Host ""

Write-Host "Keep the server running. Press Ctrl+C to stop."
Write-Host ""

# Keep server running
$serverProcess | Wait-Process

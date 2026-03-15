# ============================================================================
# LABS-AI COMPLETE - MASTER SETUP SCRIPT
# PowerShell 7+ Compatible - Production Ready
# ============================================================================
# This script automates complete environment setup for Labs-Ai-Complete
# ============================================================================

param(
    [switch]$SkipInstall = $false,
    [switch]$SkipBuild = $false
)

# Color Functions
function Write-Title {
    param([string]$Message)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Error-Msg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning-Msg {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Prompt {
    param([string]$Message, [string]$Default = "")
    $defaultText = if ($Default) { " [$Default]" } else { "" }
    Write-Host "$Message$defaultText : " -ForegroundColor Yellow -NoNewline
    $input = Read-Host
    return if ([string]::IsNullOrWhiteSpace($input)) { $Default } else { $input }
}

# ============================================================================
# STEP 1: VERSION CHECK
# ============================================================================
Write-Title "STEP 1: PowerShell Version Check"

$psVersion = $PSVersionTable.PSVersion.Major
Write-Info "PowerShell Version: $($PSVersionTable.PSVersion)"

if ($psVersion -lt 7) {
    Write-Warning-Msg "PowerShell 5.x detected. Recommend upgrading to PowerShell 7+"
    Write-Info "Install with: winget install Microsoft.PowerShell"
}

# ============================================================================
# STEP 2: VERIFY PROJECT LOCATION
# ============================================================================
Write-Title "STEP 2: Project Location Verification"

$projectRoot = "C:\Users\dying\public"
$envFile = Join-Path $projectRoot ".env.local"
$packageJson = Join-Path $projectRoot "package.json"

if (-not (Test-Path $packageJson)) {
    Write-Error-Msg "package.json not found at $projectRoot"
    Write-Info "This script must be run from the Labs-Ai-Complete project root"
    exit 1
}

Write-Success "Project found at: $projectRoot"
Set-Location $projectRoot

# ============================================================================
# STEP 3: FIREBASE CONFIGURATION
# ============================================================================
Write-Title "STEP 3: Firebase Configuration"

Write-Host "Your Firebase Project:" -ForegroundColor Yellow
Write-Host "  https://console.firebase.google.com/project/studio-6082148059-d1fec" -ForegroundColor Cyan

Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Go to Project Settings (gear icon)" -ForegroundColor Yellow
Write-Host "2. Find 'Your Apps' section at bottom" -ForegroundColor Yellow
Write-Host "3. Click '</>' code icon next to web app" -ForegroundColor Yellow
Write-Host "4. Copy the entire firebaseConfig object" -ForegroundColor Yellow
Write-Host "5. Paste below and press Enter twice" -ForegroundColor Yellow

Write-Host ""
Write-Host "Paste Firebase config (then Enter twice):" -ForegroundColor Cyan
$config = ""
$emptyCount = 0
while ($emptyCount -lt 2) {
    $line = Read-Host
    if ([string]::IsNullOrWhiteSpace($line)) {
        $emptyCount++
    } else {
        $emptyCount = 0
        $config += "$line`n"
    }
}

# Parse Firebase values
Write-Info "Parsing Firebase configuration..."

# Extract using regex patterns
$patterns = @{
    apiKey = 'apiKey["\s:]*"([^"]+)"'
    authDomain = 'authDomain["\s:]*"([^"]+)"'
    projectId = 'projectId["\s:]*"([^"]+)"'
    storageBucket = 'storageBucket["\s:]*"([^"]+)"'
    messagingSenderId = 'messagingSenderId["\s:]*"([^"]+)"'
    appId = 'appId["\s:]*"([^"]+)"'
}

$fbConfig = @{}
foreach ($key in $patterns.Keys) {
    if ($config -match $patterns[$key]) {
        $fbConfig[$key] = $matches[1]
    }
}

if (-not $fbConfig['apiKey'] -or -not $fbConfig['projectId']) {
    Write-Error-Msg "Could not parse Firebase config"
    Write-Info "Ensure you copied the complete config object"
    exit 1
}

Write-Success "Firebase config parsed"
Write-Host "  Project ID: $($fbConfig['projectId'])" -ForegroundColor Green
Write-Host "  Auth Domain: $($fbConfig['authDomain'])" -ForegroundColor Green

# ============================================================================
# STEP 4: STRIPE CONFIGURATION (OPTIONAL)
# ============================================================================
Write-Title "STEP 4: Stripe Configuration (Optional)"

Write-Host "Press Enter to use placeholder values" -ForegroundColor Yellow
Write-Host ""

$stripePub = Write-Prompt "Stripe Publishable Key" "pk_test_placeholder"
$stripeSecret = Write-Prompt "Stripe Secret Key" "sk_test_placeholder"
$stripeWebhook = Write-Prompt "Stripe Webhook Secret" "whsec_placeholder"

# ============================================================================
# STEP 5: GOOGLE AI CONFIGURATION (OPTIONAL)
# ============================================================================
Write-Title "STEP 5: Google AI Configuration (Optional)"

$googleAi = Write-Prompt "Google AI API Key" "your_google_ai_key"

# ============================================================================
# STEP 6: MICROSOFT 365 / AZURE AD (OPTIONAL)
# ============================================================================
Write-Title "STEP 6: Microsoft 365 / Azure AD (Optional)"

Write-Host "Leave blank to skip Microsoft OAuth configuration" -ForegroundColor Yellow
Write-Host ""

$msClientId = Write-Prompt "Microsoft Client ID" ""
$msClientSecret = Write-Prompt "Microsoft Client Secret" ""
$msTenantId = Write-Prompt "Microsoft Tenant ID" ""

# ============================================================================
# STEP 7: GENERATE .ENV.LOCAL
# ============================================================================
Write-Title "STEP 7: Generating .env.local"

$envContent = @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$($fbConfig['projectId'])
NEXT_PUBLIC_FIREBASE_API_KEY=$($fbConfig['apiKey'])
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$($fbConfig['authDomain'])
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://$($fbConfig['projectId']).firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$($fbConfig['storageBucket'])
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$($fbConfig['messagingSenderId'])
NEXT_PUBLIC_FIREBASE_APP_ID=$($fbConfig['appId'])

# Server-side Firebase Admin (Optional)
FIREBASE_PROJECT_ID=$($fbConfig['projectId'])
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@$($fbConfig['projectId']).iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your_private_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePub
STRIPE_SECRET_KEY=$stripeSecret
STRIPE_WEBHOOK_SECRET=$stripeWebhook

# Internal Security
INTERNAL_WEBHOOK_SECRET=dev_webhook_secret_$(Get-Random)

# Google AI
NEXT_PUBLIC_GOOGLE_AI_API_KEY=$googleAi

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Microsoft 365 / Azure AD
MICROSOFT_CLIENT_ID=$msClientId
MICROSOFT_CLIENT_SECRET=$msClientSecret
MICROSOFT_TENANT_ID=$msTenantId
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/callback/microsoft

# Microsoft 365 Graph API
NEXT_PUBLIC_MICROSOFT_GRAPH_API=https://graph.microsoft.com/v1.0

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=

# Telemetry
NEXT_TELEMETRY_DISABLED=1
"@

Set-Content -Path $envFile -Value $envContent -Force
Write-Success ".env.local created at: $envFile"

# ============================================================================
# STEP 8: INSTALL DEPENDENCIES
# ============================================================================
if (-not $SkipInstall) {
    Write-Title "STEP 8: Installing Dependencies"
    Write-Info "Running: npm install"
    
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Msg "npm install failed"
        exit 1
    }
    Write-Success "Dependencies installed"
} else {
    Write-Title "STEP 8: Skipping npm install (--SkipInstall flag)"
}

# ============================================================================
# STEP 9: BUILD PROJECT
# ============================================================================
if (-not $SkipBuild) {
    Write-Title "STEP 9: Building Project"
    Write-Info "Running: npm run build"
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Msg "Build failed - check errors above"
        Write-Info "You can try running 'npm run build' manually to debug"
        exit 1
    }
    Write-Success "Project built successfully"
} else {
    Write-Title "STEP 9: Skipping npm run build (--SkipBuild flag)"
}

# ============================================================================
# STEP 10: START DEVELOPMENT SERVER
# ============================================================================
Write-Title "STEP 10: Starting Development Server"

Write-Info "Stopping any existing Node processes..."
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Write-Success "Existing Node processes stopped"
}

Write-Info "Starting development server..."
Write-Info "This will open in a new window"

# Start dev server in new window
$devCommand = 'cd "C:\Users\dying\public"; npm run dev; Read-Host "Press Enter to close"'
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $devCommand

Start-Sleep -Seconds 8

# ============================================================================
# FINAL STATUS
# ============================================================================
Write-Title "SETUP COMPLETE"

Write-Host "Your Labs-Ai-Complete site is ready!" -ForegroundColor Green
Write-Host ""

Write-Host "Access your site at:" -ForegroundColor Cyan
Write-Host "  Local:   http://localhost:3000" -ForegroundColor Green
Write-Host "  Network: http://172.25.32.1:3000" -ForegroundColor Green

Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Cyan
Write-Host "  Firebase Project: $($fbConfig['projectId'])" -ForegroundColor Green
Write-Host "  Auth Domain: $($fbConfig['authDomain'])" -ForegroundColor Green
if ($stripePub -ne "pk_test_placeholder") { 
    Write-Host "  Stripe: Configured" -ForegroundColor Green 
}
if ($googleAi -ne "your_google_ai_key") { 
    Write-Host "  Google AI: Configured" -ForegroundColor Green 
}
if ($msClientId) { 
    Write-Host "  Microsoft 365: Configured" -ForegroundColor Green 
}
Write-Host "  .env.local: Created at $envFile" -ForegroundColor Green

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Check http://localhost:3000 in your browser" -ForegroundColor Yellow
Write-Host "  2. Verify the site loads properly" -ForegroundColor Yellow
Write-Host "  3. Test authentication" -ForegroundColor Yellow
Write-Host "  4. Review .github/copilot-instructions.md for development guidelines" -ForegroundColor Yellow

Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Cyan
Write-Host "  If the site shows blank page:" -ForegroundColor Yellow
Write-Host "    - Check browser console for errors" -ForegroundColor Yellow
Write-Host "    - Verify all Firebase credentials are correct" -ForegroundColor Yellow
Write-Host "  If npm commands fail:" -ForegroundColor Yellow
Write-Host "    - Ensure Node.js 18+ is installed" -ForegroundColor Yellow
Write-Host "    - Run 'npm cache clean --force' and retry" -ForegroundColor Yellow

Write-Host ""
Write-Host "Ready to build!" -ForegroundColor Green
Write-Host ""

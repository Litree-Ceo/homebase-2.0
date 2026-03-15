# ============================================================================
# LITLABS AI - MASTER SETUP SCRIPT
# ============================================================================
# This script automates:
# 1. Opening your Firebase console
# 2. Extracting Firebase config
# 3. Setting up environment variables
# 4. Configuring all integrations
# 5. Starting the dev server
# ============================================================================

param(
    [string]$FirebaseProjectId = "studio-6082148059",
    [string]$FirebaseApiKey,
    [string]$FirebaseAuthDomain,
    [string]$FirebaseProjectId_Override,
    [string]$FirebaseStorageBucket,
    [string]$FirebaseMessagingSenderId,
    [string]$FirebaseAppId,
    [string]$StripePublishableKey,
    [string]$StripeSecretKey,
    [string]$StripeWebhookSecret,
    [string]$GoogleAiApiKey,
    [string]$MicrosoftClientId,
    [string]$MicrosoftClientSecret,
    [string]$MicrosoftTenantId
)

# Color output functions
function Write-Title { param([string]$Message); Write-Host "`n========================================" -ForegroundColor Cyan; Write-Host $Message -ForegroundColor Cyan; Write-Host "========================================`n" -ForegroundColor Cyan }
function Write-Success { param([string]$Message); Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error-Msg { param([string]$Message); Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning-Msg { param([string]$Message); Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param([string]$Message); Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

Write-Title "LitLabs AI - Master Setup Script"
Write-Info "This script will configure your entire development environment"

# ============================================================================
# STEP 1: Open Firebase Console
# ============================================================================
Write-Title "STEP 1: Firebase Configuration"
Write-Info "Opening Firebase Console to get your config..."
Write-Info "You'll see a popup - copy your Firebase config from Project Settings > Your Apps"

$firebaseUrl = "https://console.firebase.google.com/u/0/project/$FirebaseProjectId/settings/general"
Start-Process $firebaseUrl

Write-Host "`n📋 INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Look for 'Your Apps' section at the bottom of the page" -ForegroundColor Yellow
Write-Host "2. Click the '</>' icon next to your web app" -ForegroundColor Yellow
Write-Host "3. Copy the entire config object (the JavaScript code)" -ForegroundColor Yellow
Write-Host "4. Return here and paste it" -ForegroundColor Yellow

# ============================================================================
# STEP 2: Get Firebase Config from User
# ============================================================================
Write-Host "`nPaste your Firebase config (Ctrl+V, then Enter twice):" -ForegroundColor Yellow
$config = ""
while ($true) {
    $line = Read-Host
    if ([string]::IsNullOrWhiteSpace($line)) {
        if ($config.Length -gt 0) { break }
    } else {
        $config += $line + "`n"
    }
}

# Parse Firebase config
Write-Info "Parsing Firebase configuration..."

# Extract values using regex
$apiKeyMatch = $config | Select-String -Pattern "apiKey:\s*['\"]([^'\"]+)['\"]"
$authDomainMatch = $config | Select-String -Pattern "authDomain:\s*['\"]([^'\"]+)['\"]"
$projectIdMatch = $config | Select-String -Pattern "projectId:\s*['\"]([^'\"]+)['\"]"
$storageBucketMatch = $config | Select-String -Pattern "storageBucket:\s*['\"]([^'\"]+)['\"]"
$messagingSenderIdMatch = $config | Select-String -Pattern "messagingSenderId:\s*['\"]([^'\"]+)['\"]"
$appIdMatch = $config | Select-String -Pattern "appId:\s*['\"]([^'\"]+)['\"]"

if (-not $apiKeyMatch) {
    Write-Error-Msg "Failed to parse Firebase config. Please ensure you copied the entire config object."
    exit 1
}

$extractedApiKey = $apiKeyMatch.Matches[0].Groups[1].Value
$extractedAuthDomain = $authDomainMatch.Matches[0].Groups[1].Value
$extractedProjectId = $projectIdMatch.Matches[0].Groups[1].Value
$extractedStorageBucket = $storageBucketMatch.Matches[0].Groups[1].Value
$extractedMessagingSenderId = $messagingSenderIdMatch.Matches[0].Groups[1].Value
$extractedAppId = $appIdMatch.Matches[0].Groups[1].Value

Write-Success "Firebase config parsed successfully!"
Write-Host "  Project ID: $extractedProjectId" -ForegroundColor Green
Write-Host "  Auth Domain: $extractedAuthDomain" -ForegroundColor Green

# ============================================================================
# STEP 3: Get Additional Credentials
# ============================================================================
Write-Title "STEP 2: Additional Integrations (Optional)"

Write-Host "`nStripe Configuration:" -ForegroundColor Yellow
$stripePublishableKey = Read-Host "Enter Stripe Publishable Key (or press Enter to skip)"
$stripeSecretKey = Read-Host "Enter Stripe Secret Key (or press Enter to skip)"
$stripeWebhookSecret = Read-Host "Enter Stripe Webhook Secret (or press Enter to skip)"

Write-Host "`nGoogle AI Configuration:" -ForegroundColor Yellow
$googleAiKey = Read-Host "Enter Google AI API Key (or press Enter to skip)"

Write-Host "`nMicrosoft 365 / Azure AD (Optional):" -ForegroundColor Yellow
$microsoftClientId = Read-Host "Enter Microsoft Client ID (or press Enter to skip)"
$microsoftClientSecret = Read-Host "Enter Microsoft Client Secret (or press Enter to skip)"
$microsoftTenantId = Read-Host "Enter Microsoft Tenant ID (or press Enter to skip)"

# ============================================================================
# STEP 4: Create .env.local
# ============================================================================
Write-Title "STEP 3: Creating .env.local"

$envContent = @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$extractedProjectId
NEXT_PUBLIC_FIREBASE_API_KEY=$extractedApiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$extractedAuthDomain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://$extractedProjectId.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$extractedStorageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$extractedMessagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=$extractedAppId

# Server-side Firebase Admin (Optional - for Cloud Functions)
FIREBASE_PROJECT_ID=$extractedProjectId
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@$extractedProjectId.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your_private_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$($stripePublishableKey ?? 'pk_test_placeholder')
STRIPE_SECRET_KEY=$($stripeSecretKey ?? 'sk_test_placeholder')
STRIPE_WEBHOOK_SECRET=$($stripeWebhookSecret ?? 'whsec_placeholder')

# Internal Security
INTERNAL_WEBHOOK_SECRET=dev_webhook_secret_12345

# Google AI
NEXT_PUBLIC_GOOGLE_AI_API_KEY=$($googleAiKey ?? 'your_google_ai_key')

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Microsoft 365 / Azure AD
MICROSOFT_CLIENT_ID=$($microsoftClientId ?? 'your_client_id')
MICROSOFT_CLIENT_SECRET=$($microsoftClientSecret ?? 'your_client_secret')
MICROSOFT_TENANT_ID=$($microsoftTenantId ?? 'your_tenant_id')
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/callback/microsoft

# Microsoft 365 Graph API
NEXT_PUBLIC_MICROSOFT_GRAPH_API=https://graph.microsoft.com/v1.0

# Analytics & Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
NEXT_TELEMETRY_DISABLED=1
"@

Set-Content -Path "C:\Users\dying\public\.env.local" -Value $envContent -Force
Write-Success ".env.local created with all credentials"

# ============================================================================
# STEP 5: Install Dependencies
# ============================================================================
Write-Title "STEP 4: Installing Dependencies"
Write-Info "Running: npm install"

Push-Location "C:\Users\dying\public"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error-Msg "npm install failed"
    exit 1
}
Write-Success "Dependencies installed successfully"

# ============================================================================
# STEP 6: Build Project
# ============================================================================
Write-Title "STEP 5: Building Project"
Write-Info "Running: npm run build"

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error-Msg "Build failed - check errors above"
    exit 1
}
Write-Success "Project built successfully"

# ============================================================================
# STEP 7: Start Dev Server
# ============================================================================
Write-Title "STEP 6: Starting Development Server"
Write-Info "Stopping any existing Node processes..."

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

Write-Info "Starting development server..."
Write-Info "This will open at: http://localhost:3000"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\dying\public'; npm run dev"
Start-Sleep -Seconds 8

Pop-Location

# ============================================================================
# FINAL STATUS
# ============================================================================
Write-Title "✅ Setup Complete!"

Write-Host "Your LitLabs AI site is now ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access your site at:" -ForegroundColor Cyan
Write-Host "   Local:   http://localhost:3000" -ForegroundColor Green
Write-Host "   Network: http://172.25.32.1:3000" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   ✓ Firebase Project ID: $extractedProjectId" -ForegroundColor Green
Write-Host "   ✓ Auth Domain: $extractedAuthDomain" -ForegroundColor Green
if ($stripePublishableKey) { Write-Host "   ✓ Stripe Configured" -ForegroundColor Green }
if ($googleAiKey) { Write-Host "   ✓ Google AI Configured" -ForegroundColor Green }
if ($microsoftClientId) { Write-Host "   ✓ Microsoft 365 Configured" -ForegroundColor Green }
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Check http://localhost:3000 to see your site" -ForegroundColor Yellow
Write-Host "   2. Login to test authentication" -ForegroundColor Yellow
Write-Host "   3. Review .github/copilot-instructions.md for development guidelines" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Ready to build!" -ForegroundColor Cyan

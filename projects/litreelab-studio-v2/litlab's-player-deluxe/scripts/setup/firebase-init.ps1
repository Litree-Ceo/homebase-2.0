# firebase-init.ps1 — Interactive Firebase Setup Wizard
# Guides you through Firebase project setup

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "═════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  🔥 FIREBASE SETUP WIZARD" -ForegroundColor Magenta
Write-Host "═════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Check Firebase CLI
Write-Host "→ Checking Firebase CLI..." -ForegroundColor Cyan
try {
    $fbVersion = firebase --version
    Write-Host "✓ Firebase CLI installed: $fbVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Firebase CLI not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Install with: " -NoNewline -ForegroundColor Yellow
    Write-Host "npm install -g firebase-tools" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "This wizard will help you:" -ForegroundColor White
Write-Host "  1. Login to Firebase"
Write-Host "  2. Initialize your project"
Write-Host "  3. Guide you through manual configuration steps"
Write-Host ""

$continue = Read-Host "Continue? (y/n)"
if ($continue -ne 'y' -and $continue -ne 'Y') {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " STEP 1: Firebase Login" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

firebase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Login failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " STEP 2: Project Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Options:" -ForegroundColor Yellow
Write-Host "  [1] Create a NEW Firebase project"
Write-Host "  [2] Use an EXISTING Firebase project"
Write-Host ""

$choice = Read-Host "Choose (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "→ Creating new project..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Go to: https://console.firebase.google.com/" -ForegroundColor Yellow
    Write-Host "1. Click 'Add Project'"
    Write-Host "2. Name it (e.g., 'overlord-dashboard')"
    Write-Host "3. Copy the Project ID (shown under project name)"
    Write-Host ""
    $projectId = Read-Host "Enter your Firebase Project ID"
} else {
    $projectId = Read-Host "Enter your existing Firebase Project ID"
}

if (-not $projectId) {
    Write-Host "✗ Project ID required" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "→ Setting default project to: $projectId" -ForegroundColor Cyan

# Update .firebaserc
$firebaserc = @"
{
  "projects": {
    "default": "$projectId"
  }
}
"@

Set-Content .firebaserc $firebaserc

Write-Host "✓ .firebaserc updated" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " STEP 3: Enable Services" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Open Firebase Console and enable these services:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Realtime Database:" -ForegroundColor White
Write-Host "   → https://console.firebase.google.com/project/$projectId/database" -ForegroundColor DarkGray
Write-Host "   • Click 'Create Database'"
Write-Host "   • Choose location (e.g., us-central1)"
Write-Host "   • Start in Test mode"
Write-Host "   • COPY the Database URL that looks like:"
Write-Host "     https://$projectId-default-rtdb.firebaseio.com" -ForegroundColor Cyan
Write-Host ""

$dbUrl = Read-Host "Paste your Database URL here"

Write-Host ""
Write-Host "2. Firebase Hosting:" -ForegroundColor White
Write-Host "   → https://console.firebase.google.com/project/$projectId/hosting" -ForegroundColor DarkGray
Write-Host "   • Click 'Get Started'"
Write-Host "   • Follow the wizard"
Write-Host ""

Read-Host "Press Enter when Hosting is enabled"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " STEP 4: Service Account Key" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Download your service account key:" -ForegroundColor Yellow
Write-Host "1. Go to: https://console.firebase.google.com/project/$projectId/settings/serviceaccounts/adminsdk" -ForegroundColor DarkGray
Write-Host "2. Click 'Generate new private key'"
Write-Host "3. Save the file as:"
Write-Host "   $(Get-Location)\firebase-key.json" -ForegroundColor Cyan
Write-Host ""

$keyExists = $false
while (-not $keyExists) {
    Read-Host "Press Enter after saving firebase-key.json"
    
    if (Test-Path firebase-key.json) {
        Write-Host "✓ firebase-key.json found" -ForegroundColor Green
        $keyExists = $true
    } else {
        Write-Host "✗ firebase-key.json not found in current directory" -ForegroundColor Red
        Write-Host "   Expected at: $(Get-Location)\firebase-key.json" -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " STEP 5: Update Configuration" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Update config.yaml
$configContent = Get-Content config.yaml -Raw
$configContent = $configContent -replace 'enabled: false', 'enabled: true'
$configContent = $configContent -replace 'database_url: ""', "database_url: `"$dbUrl`""
Set-Content config.yaml $configContent -NoNewline

Write-Host "✓ config.yaml updated with Firebase settings" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host " ✨ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Install Firebase Admin SDK:" -ForegroundColor White
Write-Host "   pip install firebase-admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Deploy to Firebase Hosting:" -ForegroundColor White
Write-Host "   .\deploy-firebase.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Start your server:" -ForegroundColor White
Write-Host "   python server.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your dashboard will be live at:" -ForegroundColor White
Write-Host "  https://$projectId.web.app" -ForegroundColor Green
Write-Host ""
Write-Host "See FIREBASE-SETUP.md for more details." -ForegroundColor DarkGray
Write-Host ""

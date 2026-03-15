# Firebase MCP Server Setup Script for Windows

Write-Host "Firebase MCP Server Setup" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "Firebase CLI version: $firebaseVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

# Login to Firebase
Write-Host "Logging into Firebase..." -ForegroundColor Yellow
firebase login

# List projects
Write-Host "Available Firebase projects:" -ForegroundColor Yellow
firebase projects:list

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Copy your Firebase project ID from the list above"
Write-Host "2. Edit the config file at: C:\Users\litre\AppData\Roaming\Claude\claude_desktop_config.json"
Write-Host "3. Replace '[projectId]' with your actual project ID"
Write-Host "4. Generate a service account key:"
Write-Host "   - Go to Firebase Console > Project Settings > Service Accounts"
Write-Host "   - Click 'Generate new private key'"
Write-Host "   - Save the JSON file to a secure location"
Write-Host "   - Update SERVICE_ACCOUNT_KEY_PATH with the full path to this file"
Write-Host "5. Restart Claude Desktop to load the MCP server"

# Open the config file for editing
Write-Host ""
Write-Host "Opening config file for editing..." -ForegroundColor Yellow
notepad "C:\Users\litre\AppData\Roaming\Claude\claude_desktop_config.json"
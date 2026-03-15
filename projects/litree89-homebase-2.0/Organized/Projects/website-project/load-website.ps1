<#
    PowerShell script to control and sync your website project
    Place this script in your project folder and run it to automatically load your website project
#>

$projectPath = "..\..\..\dev\EverythingHomebase\website-project"
$devServerUrl = "http://localhost:3000"  # Change if your dev server uses a different port

function Write-Step($msg) {
    Write-Host "[+] $msg" -ForegroundColor Cyan
}
function Write-ErrorStep($msg) {
    Write-Host "[!] $msg" -ForegroundColor Red
}

try {
    Write-Step "Switching to project directory..."
    Set-Location $projectPath
} catch {
    Write-ErrorStep "Failed to change directory to $projectPath."
    exit 1
}

if (Test-Path ".git") {
    Write-Step "Syncing with remote repository (git pull)..."
    git pull | Write-Host
} else {
    Write-ErrorStep "No .git directory found. Skipping git pull."
}

if (Test-Path "package.json") {
    Write-Step "Installing npm dependencies..."
    npm install | Write-Host
    Write-Step "Starting development server (npm run dev)..."
    Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory $projectPath
    Start-Sleep -Seconds 5  # Give the server a moment to start
} else {
    Write-ErrorStep "No package.json found. Skipping npm steps."
}

Write-Step "Opening project in VS Code..."
Start-Process code -ArgumentList "."

Write-Step "Opening development server in browser..."
Start-Process $devServerUrl

Write-Host "Website project loaded and all steps completed!" -ForegroundColor Green

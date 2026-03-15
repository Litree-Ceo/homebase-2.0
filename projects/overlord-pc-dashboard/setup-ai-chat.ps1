#!/usr/bin/env powershell
# Overlord AI Chat Setup - One-click installer

Write-Host "`n🤖 Overlord AI Chat Setup`n" -ForegroundColor Cyan
Write-Host "=" * 50

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "`n⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✅ Created .env file" -ForegroundColor Green
    } else {
        "API_KEY=o49eSUdxJehy05JxECmP33I9GQLaQCh0pYaGk7aXeok`nGROQ_API_KEY=" | Out-File .env -Encoding UTF8
        Write-Host "✅ Created new .env file" -ForegroundColor Green
    }
}

# Check for GROQ_API_KEY
$envContent = Get-Content .env -Raw
if ($envContent -match "GROQ_API_KEY=.+" -and $matches[0] -ne "GROQ_API_KEY=") {
    Write-Host "✅ GROQ_API_KEY found in .env" -ForegroundColor Green
} else {
    Write-Host "`n🔑 GROQ_API_KEY not set!" -ForegroundColor Red
    Write-Host "`nGet your key from: https://console.groq.com/keys`n" -ForegroundColor Cyan
    $apiKey = Read-Host "Enter your Groq API Key"
    
    if ($apiKey) {
        # Remove existing GROQ_API_KEY line if exists
        $envContent = $envContent -replace "GROQ_API_KEY=.*\r?\n?", ""
        # Add new key
        $envContent += "`nGROQ_API_KEY=$apiKey`n"
        $envContent | Out-File .env -Encoding UTF8
        Write-Host "✅ API key saved to .env" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No key provided. AI chat will be disabled." -ForegroundColor Yellow
    }
}

# Backup old server
if (Test-Path server.py) {
    Copy-Item server.py server.py.backup -Force
    Write-Host "✅ Backed up server.py" -ForegroundColor Green
}

# Install new server
Copy-Item server_chat.py server.py -Force
Write-Host "✅ Installed AI chat server" -ForegroundColor Green

Write-Host "`n" + "=" * 50
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host "`nStart the server:" -ForegroundColor Cyan
Write-Host "  python server.py" -ForegroundColor White
Write-Host "`nThen open:" -ForegroundColor Cyan
Write-Host "  http://localhost:8080/ai-chat.html" -ForegroundColor White
Write-Host "`n" + "=" * 50

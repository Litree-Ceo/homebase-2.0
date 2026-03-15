param(
    [Parameter(Mandatory=$true)]
    [string]$Key,
    
    [string]$Provider = "google"
)

Write-Host "🔐 LiTreeLab Security Protocol Initiated..." -ForegroundColor Cyan

# 1. Update .env.local
$envFile = "c:\Users\litre\homebase-2.0\github\apps\litreelab-studio-metaverse\.env.local"
if (Test-Path $envFile) {
    $content = Get-Content $envFile
    $newContent = $content | ForEach-Object {
        if ($_ -match "GOOGLE_API_KEY=") { "GOOGLE_API_KEY=$Key" }
        elseif ($_ -match "GEMINI_API_KEY=") { "GEMINI_API_KEY=$Key" }
        elseif ($_ -match "GOOGLE_GENERATIVE_AI_API_KEY=") { "GOOGLE_GENERATIVE_AI_API_KEY=$Key" }
        else { $_ }
    }
    $newContent | Set-Content $envFile
    Write-Host "✅ Environment Variables Updated" -ForegroundColor Green
} else {
    Write-Host "⚠️ .env.local not found!" -ForegroundColor Yellow
}

# 2. Update OpenClaw
Write-Host "🤖 Updating Agent Zero Neural Link..." -ForegroundColor Cyan
$env:GOOGLE_API_KEY = $Key
$env:GEMINI_API_KEY = $Key

if ($Provider -eq "google") {
    $cmd = "echo $Key | openclaw models auth paste-token --provider google"
    Invoke-Expression $cmd
} elseif ($Provider -eq "openai") {
    $cmd = "echo $Key | openclaw models auth paste-token --provider openai"
    Invoke-Expression $cmd
}

Write-Host "`n✨ SYSTEM UPDATE COMPLETE" -ForegroundColor Magenta
Write-Host "Agent Zero is now using the new credentials." -ForegroundColor Gray
Write-Host "Please restart your dev server if it's running." -ForegroundColor Gray

$keyFile = "gcp-github-key.json"
$projectId = "wise-cycling-479520-n1"

if (Test-Path $keyFile) {
    $keyContent = Get-Content $keyFile -Raw
    $encodedKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
    
    Write-Host "`n========== GITHUB SECRETS SETUP ==========" -ForegroundColor Cyan
    Write-Host "`nAdd these to GitHub:" -ForegroundColor Yellow
    Write-Host "`nSecret 1:" -ForegroundColor Green
    Write-Host "  Name: GCP_PROJECT_ID" -ForegroundColor White
    Write-Host "  Value: $projectId" -ForegroundColor Yellow
    
    Write-Host "`nSecret 2:" -ForegroundColor Green
    Write-Host "  Name: GCP_SERVICE_ACCOUNT_KEY" -ForegroundColor White
    Write-Host "  Value: (copy below)`n" -ForegroundColor Yellow
    
    Write-Host "────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host $encodedKey -ForegroundColor Yellow
    Write-Host "────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray
    
    Write-Host "Instructions:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/LiTree89/HomeBase-2.0" -ForegroundColor White
    Write-Host "2. Settings → Secrets and variables → Actions" -ForegroundColor White
    Write-Host "3. Click 'New repository secret'" -ForegroundColor White
    Write-Host "4. Add Secret 1 (GCP_PROJECT_ID)" -ForegroundColor White
    Write-Host "5. Add Secret 2 (GCP_SERVICE_ACCOUNT_KEY) with the encoded key above" -ForegroundColor White
    Write-Host "6. Then push to main:" -ForegroundColor White
    Write-Host "   git add ." -ForegroundColor Gray
    Write-Host "   git commit -m 'chore: enable multi-platform deployment'" -ForegroundColor Gray
    Write-Host "   git push origin main`n" -ForegroundColor Gray
    
} else {
    Write-Host "Key file not found!" -ForegroundColor Red
    exit 1
}

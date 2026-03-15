# Git Cleanup Script for Overlord-Pc-Dashboard
# This script removes unwanted files from git tracking

Write-Host "=== Git Cleanup Script ===" -ForegroundColor Cyan

# Remove lock file if it exists
$lockFile = ".git/index.lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force
    Write-Host "Removed git lock file" -ForegroundColor Yellow
}

# Get list of node_modules files
Write-Host "`nFinding node_modules files in git..." -ForegroundColor Yellow
$nodeModulesFiles = git ls-files | Select-String "node_modules"
$count = ($nodeModulesFiles | Measure-Object).Count
Write-Host "Found $count node_modules files to remove from tracking" -ForegroundColor Red

if ($count -gt 0) {
    Write-Host "`nRemoving node_modules files from git tracking..." -ForegroundColor Yellow
    
    # Process in batches of 1000 to avoid lock issues
    $batchSize = 1000
    $batches = [math]::Ceiling($count / $batchSize)
    
    for ($i = 0; $i -lt $batches; $i++) {
        $start = $i * $batchSize
        $end = [math]::Min(($i + 1) * $batchSize, $count)
        $batch = $nodeModulesFiles[$start..($end-1)]
        
        # Remove lock file before each batch
        if (Test-Path $lockFile) {
            Remove-Item $lockFile -Force
        }
        
        # Remove files in this batch
        $batch | ForEach-Object { 
            $path = $_.Line
            git rm -r --cached --ignore-unmatch "$path" 2>&1 | Out-Null
        }
        
        Write-Host "  Batch $($i+1)/$batches complete ($start - $end)" -ForegroundColor Green
    }
}

# Check remaining tracked files
Write-Host "`n=== Checking remaining tracked files ===" -ForegroundColor Cyan
$remaining = git ls-files | Select-String "node_modules" | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "Remaining node_modules files in git: $remaining" -ForegroundColor $(if($remaining -eq 0){"Green"}else{"Red"})

$totalFiles = git ls-files | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "Total tracked files: $totalFiles" -ForegroundColor Cyan

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes: git status" -ForegroundColor White
Write-Host "  2. Commit the cleanup: git commit -m 'chore: remove node_modules from git tracking'" -ForegroundColor White
Write-Host "  3. Push to remote: git push origin main" -ForegroundColor White

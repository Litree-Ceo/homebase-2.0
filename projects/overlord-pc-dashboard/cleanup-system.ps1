# System Resource Cleanup Script for Overlord-Pc-Dashboard
# Run this to free up RAM and disk space

Write-Host "=== System Cleanup Script ===" -ForegroundColor Cyan
Write-Host ""

# Check current memory usage
Write-Host "Current Memory Usage:" -ForegroundColor Yellow
$memory = Get-CimInstance Win32_OperatingSystem
$totalGB = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
$freeGB = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
$usedGB = $totalGB - $freeGB
$percentUsed = [math]::Round(($usedGB / $totalGB) * 100, 1)

Write-Host "  Total RAM: $totalGB GB" -ForegroundColor White
Write-Host "  Used RAM:  $usedGB GB ($percentUsed%)" -ForegroundColor $(if($percentUsed -gt 80){"Red"}else{"Green"})
Write-Host "  Free RAM:  $freeGB GB" -ForegroundColor White
Write-Host ""

# Clear temporary files
Write-Host "Cleaning temporary files..." -ForegroundColor Yellow
$tempPaths = @(
    $env:TEMP,
    "$env:LOCALAPPDATA\Temp",
    "$env:SystemRoot\Temp"
)
$totalFreed = 0
foreach ($path in $tempPaths) {
    if (Test-Path $path) {
        $before = (Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        Get-ChildItem $path -File -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force -ErrorAction SilentlyContinue
        $after = (Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $freed = [math]::Round(($before - $after) / 1MB, 2)
        $totalFreed += $freed
        Write-Host "  $path : Freed $freed MB" -ForegroundColor Gray
    }
}
Write-Host "  Total freed from temp: $totalFreed MB" -ForegroundColor Green
Write-Host ""

# Clear npm cache (can be large)
Write-Host "Checking npm cache..." -ForegroundColor Yellow
$npmCache = npm cache verify 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  npm cache verified" -ForegroundColor Green
}
Write-Host ""

# Clear old log files from project
Write-Host "Cleaning old log files..." -ForegroundColor Yellow
$logFiles = Get-ChildItem -Path . -Filter "*.log" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 10MB -or $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
$logSize = 0
foreach ($log in $logFiles) {
    $logSize += $log.Length
    if ($log.Length -gt 50MB) {
        Clear-Content $log.FullName -ErrorAction SilentlyContinue
        Write-Host "  Cleared: $($log.Name)" -ForegroundColor Gray
    }
}
Write-Host "  Processed log files: $([math]::Round($logSize / 1MB, 2)) MB" -ForegroundColor Green
Write-Host ""

# Empty Recycle Bin (optional - commented out for safety)
# Write-Host "Emptying Recycle Bin..." -ForegroundColor Yellow
# Clear-RecycleBin -Force -ErrorAction SilentlyContinue
# Write-Host "  Recycle Bin emptied" -ForegroundColor Green
# Write-Host ""

# Run garbage collection to free memory
Write-Host "Running memory optimization..." -ForegroundColor Yellow
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
Write-Host "  Memory optimization complete" -ForegroundColor Green
Write-Host ""

# Show memory after cleanup
$memoryAfter = Get-CimInstance Win32_OperatingSystem
$freeGBAfter = [math]::Round($memoryAfter.FreePhysicalMemory / 1MB, 2)
$improvement = $freeGBAfter - $freeGB

Write-Host "Memory After Cleanup:" -ForegroundColor Yellow
Write-Host "  Free RAM: $freeGBAfter GB" -ForegroundColor White
if ($improvement -gt 0.1) {
    Write-Host "  Improvement: +$([math]::Round($improvement, 2)) GB freed!" -ForegroundColor Green
}
Write-Host ""

Write-Host "=== Cleanup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Tips to reduce resource usage:" -ForegroundColor Cyan
Write-Host "  1. Close unused browser tabs (Chrome is memory-heavy)" -ForegroundColor White
Write-Host "  2. Restart VS Code/Trae periodically (every few days)" -ForegroundColor White
Write-Host "  3. Stop unused Docker containers: docker system prune" -ForegroundColor White
Write-Host "  4. Use 'git gc' occasionally to optimize git repo" -ForegroundColor White
Write-Host ""

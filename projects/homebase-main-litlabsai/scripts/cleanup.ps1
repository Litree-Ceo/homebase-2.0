# HomeBase 2.0 Cleanup Script

Write-Host "Starting cleanup..." -ForegroundColor Green

# Kill problematic processes
Get-Process | Where-Object { $_.ProcessName -like '*llm*' -or $_.ProcessName -like '*huggingface*' } | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean directories
$dirs = @("node_modules", ".next", ".turbo", "dist", "out", ".cache")
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Removed $dir" -ForegroundColor Yellow
    }
}

# Clean log files
Get-ChildItem -Recurse -Include "*.log" | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "Cleanup complete!" -ForegroundColor Green
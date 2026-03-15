# Force execution in Windows (not WSL)
Write-Host "Starting HomeBase 2.0 Complete Fix..." -ForegroundColor Cyan

# Use Windows batch directly via System.Diagnostics.Process
$batchPath = "E:\VSCode\HomeBase 2.0\FIX-ALL-PROBLEMS.bat"

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = "cmd.exe"
$processInfo.Arguments = "/c `"$batchPath`""
$processInfo.UseShellExecute = $true
$processInfo.CreateNoWindow = $false
$processInfo.WorkingDirectory = "E:\VSCode\HomeBase 2.0"

$process = [System.Diagnostics.Process]::Start($processInfo)
$process.WaitForExit()

Write-Host ""
Write-Host "Fix script completed!" -ForegroundColor Green

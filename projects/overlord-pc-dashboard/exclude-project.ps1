Write-Host "Adding Overlord-Pc-Dashboard to Windows Defender exclusions..." -ForegroundColor Cyan

$projectPath = "c:\Users\litre\Desktop\Overlord-Pc-Dashboard"

# Add exclusion for the project directory
Add-MpPreference -ExclusionPath $projectPath

# Add exclusions for common dev processes
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "npm.exe"
Add-MpPreference -ExclusionProcess "python.exe"
Add-MpPreference -ExclusionProcess "pip.exe"

Write-Host "Exclusions added successfully!" -ForegroundColor Green
Write-Host "Project path: $projectPath" -ForegroundColor Yellow
Write-Host "Verify with: Get-MpPreference | Select-Object -ExpandProperty ExclusionPath" -ForegroundColor Yellow

Write-Host "`nNote: This improves performance for large projects but reduces security scanning in this folder." -ForegroundColor Magenta
Write-Host "Run 'Remove-MpPreference -ExclusionPath $projectPath' to remove if needed." -ForegroundColor Magenta
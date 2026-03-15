# PowerShell System and Package Update Script
# Run this script as Administrator

# Update PowerShell itself (optional)
try {
    winget upgrade --id Microsoft.Powershell --source winget -h
} catch { Write-Host "PowerShell upgrade failed or not required." }

# Install or update PSWindowsUpdate module
try {
    Install-Module PSWindowsUpdate -Force -Scope CurrentUser -ErrorAction Stop
} catch { Write-Host "PSWindowsUpdate module install failed or already up-to-date." }

# Add Windows Update service (if needed)
try {
    Add-WUServiceManager -ServiceID "7971f918-a847-4430-93ca-3da52d1abd89" -Confirm:$false
} catch { Write-Host "Add-WUServiceManager failed or not required." }

# List available updates
try {
    Get-WindowsUpdate
} catch { Write-Host "Get-WindowsUpdate failed." }

# Install all available updates and reboot if needed
try {
    Get-WindowsUpdate -AcceptAll -Install -AutoReboot
} catch { Write-Host "Windows Update install failed." }

# Upgrade all winget packages
try {
    winget upgrade --all
} catch { Write-Host "winget upgrade failed." }

Write-Host "All update commands executed. Please review output for any manual actions required."

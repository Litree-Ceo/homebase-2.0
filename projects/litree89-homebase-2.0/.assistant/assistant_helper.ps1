# Assistant helper (PowerShell)
# This script is provided as a manual helper you can run to execute approved commands.
# IT WILL NOT BE RUN BY THE ASSISTANT AUTOMATICALLY — run it yourself when you explicitly approve a command.
#
# Usage examples:
#   .\assistant_helper.ps1 -cmd "Get-ChildItem -File -Recurse"
#   .\assistant_helper.ps1 -cmd "Get-Content .\README.md | Select-Object -First 50"

param(
  [string]$cmd
)

if (-not $cmd) {
  Write-Output "Usage: .\assistant_helper.ps1 -cmd '<PowerShell command>'"
  Write-Output "This helper will only run commands you explicitly invoke."
  exit 0
}

Write-Output "Assistant helper: about to run the following command (run only if you approve):"
Write-Output "  $cmd"
Write-Output ""
# Uncomment the following line and run manually when you explicitly approve the command:
# Invoke-Expression $cmd

Write-Output ""
Write-Output "Note: Invoke-Expression is commented out to prevent accidental execution. Uncomment it to run."
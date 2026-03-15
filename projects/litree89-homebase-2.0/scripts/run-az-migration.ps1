# Helper to generate (and optionally execute) an AzureRM -> Az upgrade plan
param(
  [string]$TargetPath = "E:\VSCode\HomeBase 2.0",
  [switch]$RunUpgrade
)

$ErrorActionPreference = "Stop"

function Ensure-Module {
  param(
    [string]$Name,
    [string]$MinimumVersion = $null
  )

  $installed = Get-Module -ListAvailable -Name $Name | Sort-Object Version -Descending | Select-Object -First 1

  if (-not $installed -or ($MinimumVersion -and [version]$installed.Version -lt [version]$MinimumVersion)) {
    Write-Host "Installing $Name (minimum version $MinimumVersion)..."
    Install-Module -Name $Name -Scope CurrentUser -AllowClobber -Force -ErrorAction Stop -MinimumVersion $MinimumVersion
  }
  else {
    Write-Host "$Name $($installed.Version) already available."
  }
}

# Optional but recommended: latest AzureRM 6.13.1 for reference
Ensure-Module -Name "AzureRM" -MinimumVersion "6.13.1"

# Required for migration
Ensure-Module -Name "Az.Tools.Migration" -MinimumVersion "1.0.0"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$planPath = Join-Path $TargetPath "az-upgrade-plan-$timestamp.json"
$resultsPath = Join-Path $TargetPath "az-upgrade-results-$timestamp.json"

Write-Host "Generating upgrade plan for $TargetPath..."
$Plan = New-AzUpgradeModulePlan -FromAzureRmVersion 6.13.1 -ToAzVersion latest -DirectoryPath $TargetPath -OutVariable Plan
$Plan | ConvertTo-Json -Depth 8 | Out-File $planPath -Encoding utf8
Write-Host "Plan saved to $planPath"

if ($RunUpgrade) {
  Write-Host "Executing upgrade (non-destructive, writes copies with _az_upgraded)..."
  $Results = Invoke-AzUpgradeModulePlan -Plan $Plan -FileEditMode SaveChangesToNewFiles -OutVariable Results
  $Results | ConvertTo-Json -Depth 8 | Out-File $resultsPath -Encoding utf8

  $errors = $Results | Where-Object UpgradeResult -ne "UpgradeCompleted"
  if ($errors) {
    Write-Warning "Upgrade completed with issues. Review $resultsPath for details."
  }
  else {
    Write-Host "Upgrade completed. Results saved to $resultsPath"
  }
}
else {
  Write-Host "Preview only. Re-run with -RunUpgrade to apply to copies (_az_upgraded)."
}

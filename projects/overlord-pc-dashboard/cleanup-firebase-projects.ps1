# cleanup-firebase-projects.ps1
# Audit and cleanup Firebase project configurations

param(
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FIREBASE PROJECT CLEANUP TOOL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Find all .firebaserc files
Write-Host "-> Scanning for Firebase configurations..." -ForegroundColor Yellow

$firebaseConfigs = Get-ChildItem -Path "." -Recurse -Filter ".firebaserc" -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty FullName

Write-Host "Found $($firebaseConfigs.Count) .firebaserc files:" -ForegroundColor Green
$firebaseConfigs | ForEach-Object { Write-Host "  * $_" -ForegroundColor Gray }

# Read and display each config
Write-Host ""
Write-Host "-> Firebase Project Configurations:" -ForegroundColor Yellow

$projects = @{}
foreach ($config in $firebaseConfigs) {
    $content = Get-Content $config -Raw | ConvertFrom-Json
    $dir = Split-Path $config -Parent
    
    Write-Host ""
    Write-Host "  DIR: $dir" -ForegroundColor Cyan
    
    foreach ($alias in $content.projects.PSObject.Properties) {
        $projectId = $alias.Value
        Write-Host "     $($alias.Name) -> $projectId" -ForegroundColor White
        
        if (-not $projects.ContainsKey($projectId)) {
            $projects[$projectId] = @()
        }
        $projects[$projectId] += $dir
    }
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Unique Firebase Projects Found: $($projects.Count)" -ForegroundColor Yellow

foreach ($project in $projects.GetEnumerator()) {
    Write-Host ""
    Write-Host "  PROJECT: $($project.Key)" -ForegroundColor Green
    Write-Host "     Used in:" -ForegroundColor Gray
    $project.Value | ForEach-Object { Write-Host "       * $_" -ForegroundColor DarkGray }
}

# Recommendations
Write-Host ""
Write-Host "-> Recommendations:" -ForegroundColor Yellow

if ($projects.Count -gt 1) {
    Write-Host ""
    Write-Host "  WARNING: MULTIPLE PROJECTS DETECTED" -ForegroundColor Red
    Write-Host ""
    Write-Host "  You have $($projects.Count) different Firebase projects." -ForegroundColor White
    Write-Host "  This can cause confusion and deployment errors." -ForegroundColor White
    Write-Host ""
    Write-Host "  Recommended actions:" -ForegroundColor Cyan
    Write-Host "    1. Choose ONE primary project" -ForegroundColor White
    Write-Host "    2. Remove unused project aliases" -ForegroundColor White
    Write-Host "    3. Consolidate all configs to use the same project" -ForegroundColor White
    Write-Host "    4. Delete orphaned .firebaserc files in subdirectories" -ForegroundColor White
}

# Dry run exits here
if ($DryRun) {
    Write-Host ""
    Write-Host "(DRY RUN - No changes were made)" -ForegroundColor Magenta
    exit 0
}

# Cleanup menu
Write-Host ""
Write-Host "-> Cleanup Options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [1] Remove 'Yes' alias from root .firebaserc" -ForegroundColor White
Write-Host "  [2] Consolidate all configs to primary project" -ForegroundColor White
Write-Host "  [3] Delete legacy .firebaserc files" -ForegroundColor White
Write-Host "  [4] Open Firebase Console for each project" -ForegroundColor White
Write-Host "  [5] Exit without changes" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select an option (1-5)"

switch ($choice) {
    '1' {
        Write-Host ""
        Write-Host "-> Removing 'Yes' alias..." -ForegroundColor Yellow
        
        $rootConfig = Get-Content ".firebaserc" -Raw | ConvertFrom-Json
        $rootConfig.projects.PSObject.Properties.Remove('Yes')
        
        $rootConfig | ConvertTo-Json -Depth 10 | Set-Content ".firebaserc"
        
        Write-Host "OK Removed 'Yes' alias" -ForegroundColor Green
        Write-Host "  Current projects: $($rootConfig.projects | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
    
    '2' {
        Write-Host ""
        Write-Host "-> Consolidating to primary project..." -ForegroundColor Yellow
        
        $primaryProject = (Get-Content ".firebaserc" -Raw | ConvertFrom-Json).projects.default
        
        foreach ($config in $firebaseConfigs) {
            $content = Get-Content $config -Raw | ConvertFrom-Json
            $content.projects = @{
                "default" = $primaryProject
            }
            $content | ConvertTo-Json -Depth 10 | Set-Content $config
            Write-Host "OK Updated: $config" -ForegroundColor Green
        }
    }
    
    '3' {
        Write-Host ""
        Write-Host "-> Removing legacy configs..." -ForegroundColor Yellow
        
        $legacyConfigs = $firebaseConfigs | Where-Object { 
            $_ -like "*litlabs-player-deluxe*" -or 
            $_ -like "*_LEGACY_ARCHIVE*" -or
            $_ -like "*overlord-dashboard\dashboard*"
        }
        
        if ($legacyConfigs.Count -eq 0) {
            Write-Host "No legacy configs found to remove" -ForegroundColor Yellow
        }
        else {
            foreach ($config in $legacyConfigs) {
                if ($Force) {
                    Remove-Item $config -Force
                    Write-Host "OK Deleted: $config" -ForegroundColor Green
                }
                else {
                    $confirm = Read-Host "Delete $config? (y/n)"
                    if ($confirm -eq 'y') {
                        Remove-Item $config -Force
                        Write-Host "OK Deleted: $config" -ForegroundColor Green
                    }
                }
            }
        }
    }
    
    '4' {
        foreach ($project in $projects.Keys) {
            Start-Process "https://console.firebase.google.com/project/$project/overview"
        }
    }
    
    '5' {
        Write-Host "Exiting without changes" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "Invalid option" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Cleanup complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

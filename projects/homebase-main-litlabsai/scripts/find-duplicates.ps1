# PowerShell Script to Find Duplicate Files
param (
    [string]$Path = ".\",
    [int64]$MinSize = 1048576
)

Write-Host "Scanning for duplicates in $Path (Min Size: $MinSize bytes)..." -ForegroundColor Cyan

# Get all files recursively
$files = Get-ChildItem -Path $Path -Recurse -File | Where-Object { $_.Length -ge $MinSize -and $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\.git" }

# Group by Name
$byName = $files | Group-Object Name | Where-Object { $_.Count -gt 1 }

if ($byName) {
    Write-Host "`nPotential Duplicates by Filename:" -ForegroundColor Yellow
    foreach ($group in $byName) {
        Write-Host "  Name: $($group.Name)" -ForegroundColor White
        foreach ($file in $group.Group) {
            Write-Host "    - $($file.FullName)" -ForegroundColor Gray
        }
    }
} 
if (-not $byName) {
    Write-Host "`nNo duplicate filenames found." -ForegroundColor Green
}

# Group by Hash
Write-Host "`nHashing files to find exact content duplicates..." -ForegroundColor Cyan
$byHash = $files | Group-Object -Property { Get-FileHash $_.FullName -Algorithm MD5 | Select-Object -ExpandProperty Hash } | Where-Object { $_.Count -gt 1 }

if ($byHash) {
    Write-Host "`nExact Content Duplicates Found:" -ForegroundColor Red
    foreach ($group in $byHash) {
        Write-Host "  Hash: $($group.Name)" -ForegroundColor White
        foreach ($file in $group.Group) {
            Write-Host "    - $($file.FullName)" -ForegroundColor Gray
        }
    }
}
if (-not $byHash) {
    Write-Host "`nNo content duplicates found." -ForegroundColor Green
}

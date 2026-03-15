param(
    [switch]$WhatIf
)

# Safety check: ensure running inside expected workspace
$root = Get-Location
if ($root.Path -notlike '*HomeBase-2.0*') {
    Write-Host "Aborting: not inside HomeBase-2.0 repository ($($root.Path))" -ForegroundColor Red
    exit 1
}

Write-Host "Cleaning repository: $($root.Path)" -ForegroundColor Cyan
Write-Host "WhatIf mode: $WhatIf" -ForegroundColor Yellow

$dirPatterns = @('node_modules','.next','dist','out','.turbo','.parcel-cache','.eslintcache','.cache','build')
$filePatterns = @('pnpm-lock.yaml','package-lock.json','yarn.lock')

# Remove matching directories
Get-ChildItem -Path $root -Recurse -Directory -Force -ErrorAction SilentlyContinue |
  Where-Object { $dirPatterns -contains $_.Name } |
  ForEach-Object {
    if ($WhatIf) {
        Write-Host "Would remove dir: $($_.FullName)" -ForegroundColor Yellow
    } else {
        Write-Host "Removing dir: $($_.FullName)" -ForegroundColor Yellow
        Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
  }

# Remove lock files
Get-ChildItem -Path $root -Recurse -File -Force -ErrorAction SilentlyContinue |
  Where-Object { $filePatterns -contains $_.Name } |
  ForEach-Object {
    if ($WhatIf) {
        Write-Host "Would remove file: $($_.FullName)" -ForegroundColor Yellow
    } else {
        Write-Host "Removing file: $($_.FullName)" -ForegroundColor Yellow
        Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
    }
  }

Write-Host "Repository cleanup complete." -ForegroundColor Green
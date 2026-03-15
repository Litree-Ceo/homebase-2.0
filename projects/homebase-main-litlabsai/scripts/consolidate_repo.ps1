
$dest = "c:\Users\litre\homebase-2.0\github\apps"
$apps = @("LiTree-Unified", "LiTMaSter1", "LiTreeStudio", "LitreeLabsFirebase")

Ensure-Directory -Path $dest

foreach ($app in $apps) {
    $src = "c:\Users\litre\homebase-2.0\$app"
    if (Test-Path $src) {
        Write-Host "Processing $app..."
        
        # Remove node_modules
        $nodeModules = "$src\node_modules"
        if (Test-Path $nodeModules) { 
            Write-Host "  Removing node_modules..."
            Remove-Item $nodeModules -Recurse -Force -ErrorAction SilentlyContinue 
        }
        
        # Remove .git
        $gitDir = "$src\.git"
        if (Test-Path $gitDir) { 
            Write-Host "  Removing .git..."
            Remove-Item $gitDir -Recurse -Force -ErrorAction SilentlyContinue 
        }
        
        # Determine target name (lowercase)
        $targetName = $app.ToLower()
        $targetPath = "$dest\$targetName"
        
        if (Test-Path $targetPath) {
            Write-Host "  Target $targetPath already exists. Skipping move."
        } else {
            Write-Host "  Moving to $targetPath..."
            Move-Item $src $targetPath
        }
    } else {
        Write-Host "Source $src not found."
    }
}

Write-Host "Consolidation complete."

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

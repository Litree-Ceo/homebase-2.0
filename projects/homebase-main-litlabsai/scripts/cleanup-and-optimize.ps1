#!/usr/bin/env pwsh

# HomeBase 2.0 Cleanup and Optimization Script
# Fixes extension issues, cleans up workspace, and optimizes performance

Write-Host "🧹 Starting HomeBase 2.0 Cleanup and Optimization..." -ForegroundColor Green

# Kill problematic processes
Write-Host "🔄 Stopping problematic language servers..." -ForegroundColor Yellow
try {
    Get-Process | Where-Object {
        $_.ProcessName -like '*llm*' -or 
        $_.ProcessName -like '*huggingface*' -or 
        $_.ProcessName -like '*rust-analyzer*'
    } | Stop-Process -Force -ErrorAction SilentlyContinue
} catch {
    Write-Host "  ℹ️ No problematic processes found" -ForegroundColor Gray
}

# Clean up node_modules and build artifacts
Write-Host "🗑️ Cleaning build artifacts..." -ForegroundColor Yellow
$cleanupPaths = @(
    "node_modules",
    ".next",
    ".turbo", 
    "dist",
    "out",
    ".cache",
    ".parcel-cache",
    "coverage",
    ".nyc_output"
)

foreach ($path in $cleanupPaths) {
    try {
        Get-ChildItem -Path . -Recurse -Directory -Name $path -ErrorAction SilentlyContinue | 
        ForEach-Object { 
            $fullPath = Join-Path $PWD $_
            if (Test-Path $fullPath) {
                Remove-Item $fullPath -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  ✓ Removed: $_" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "  ⚠️ Could not clean: $path" -ForegroundColor Yellow
    }
}

# Clean log files
Write-Host "📝 Cleaning log files..." -ForegroundColor Yellow
try {
    Get-ChildItem -Path . -Recurse -File -Include "*.log", "*.tmp", "*.temp" -ErrorAction SilentlyContinue |
    Remove-Item -Force -ErrorAction SilentlyContinue
} catch {
    Write-Host "  ℹ️ No log files to clean" -ForegroundColor Gray
}

# Clean pnpm cache
Write-Host "🧽 Cleaning pnpm cache..." -ForegroundColor Yellow
try {
    pnpm store prune 2>$null
} catch {
    Write-Host "  ⚠️ pnpm not available" -ForegroundColor Yellow
}

# Optimize Git repository
Write-Host "🔧 Optimizing Git repository..." -ForegroundColor Yellow
try {
    git gc --aggressive --prune=now 2>$null
    git repack -ad 2>$null
} catch {
    Write-Host "  ⚠️ Git optimization failed" -ForegroundColor Yellow
}

# Create .gitattributes
Write-Host "📄 Creating .gitattributes..." -ForegroundColor Yellow
$gitattributes = @"
# Auto detect text files and perform LF normalization
* text=auto

# Source code
*.js text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.jsx text eol=lf
*.json text eol=lf
*.md text eol=lf
*.yml text eol=lf
*.yaml text eol=lf

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.svg binary
*.woff binary
*.woff2 binary
*.ttf binary
*.otf binary
*.eot binary

# Large files (use Git LFS)
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.avi filter=lfs diff=lfs merge=lfs -text
*.mov filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
*.tar.gz filter=lfs diff=lfs merge=lfs -text
*.rar filter=lfs diff=lfs merge=lfs -text
*.7z filter=lfs diff=lfs merge=lfs -text
"@
$gitattributes | Out-File -FilePath ".gitattributes" -Encoding UTF8

# Create .prettierrc
Write-Host "🎨 Creating .prettierrc..." -ForegroundColor Yellow
$prettierrc = @"
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
"@
$prettierrc | Out-File -FilePath ".prettierrc" -Encoding UTF8

# Create .eslintrc.json
Write-Host "🔍 Creating .eslintrc.json..." -ForegroundColor Yellow
$eslintrc = @"
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
"@
$eslintrc | Out-File -FilePath ".eslintrc.json" -Encoding UTF8

Write-Host "✅ Cleanup and optimization complete!" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  • Killed problematic language servers" -ForegroundColor White
Write-Host "  • Cleaned build artifacts and caches" -ForegroundColor White  
Write-Host "  • Optimized Git repository" -ForegroundColor White
Write-Host "  • Created configuration files" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🚀 Your workspace is now optimized and ready for development!" -ForegroundColor Green
Write-Host "💡 Restart VS Code to apply all changes" -ForegroundColor Yellow
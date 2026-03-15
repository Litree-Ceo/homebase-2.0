# Context Awareness Module - Detects project state and environment
$script:ContextCache = @{}
$script:LastContextCheck = 0

function Get-ProjectContext {
    param([switch]$Force)
    
    $now = [DateTime]::UtcNow.Ticks
    if (!$Force -and ($now - $script:LastContextCheck) -lt 5000000000) {
        return $script:ContextCache
    }
    
    $context = @{
        Root = Get-GitRoot
        IsMonorepo = Test-Path "pnpm-workspace.yaml"
        Environment = Get-Environment
        Packages = @()
        Health = @{}
    }
    
    if ($context.IsMonorepo) {
        $context.Packages = Get-MonorepoPackages
    }
    
    $context.Health = Get-ProjectHealth
    $script:ContextCache = $context
    $script:LastContextCheck = $now
    
    return $context
}

function Get-GitRoot {
    $current = Get-Location
    while ($current.Path -ne $current.Parent.Path) {
        if (Test-Path "$($current.Path)\.git") {
            return $current.Path
        }
        $current = $current.Parent
    }
    return $null
}

function Get-Environment {
    if (Test-Path ".env.local") { return "local" }
    if (Test-Path ".env.production") { return "production" }
    if (Test-Path ".env.staging") { return "staging" }
    return "unknown"
}

function Get-MonorepoPackages {
    $packages = @()
    if (Test-Path "pnpm-workspace.yaml") {
        $yaml = Get-Content "pnpm-workspace.yaml" -Raw
        $yaml | Select-String "- '([^']+)'" -AllMatches | ForEach-Object {
            $_.Matches | ForEach-Object {
                $pattern = $_.Groups[1].Value
                Get-ChildItem -Path $pattern -Directory -ErrorAction SilentlyContinue | ForEach-Object {
                    if (Test-Path "$($_.FullName)\package.json") {
                        $packages += @{
                            Name = $_.Name
                            Path = $_.FullName
                            HasBuild = (Select-String '"build"' "$($_.FullName)\package.json" -Quiet)
                        }
                    }
                }
            }
        }
    }
    return $packages
}

function Get-ProjectHealth {
    $health = @{
        NodeModulesExists = Test-Path "node_modules"
        LockFileExists = (Test-Path "pnpm-lock.yaml") -or (Test-Path "package-lock.json")
        TypeScriptValid = Test-TypeScriptConfig
        EslintValid = Test-EslintConfig
    }
    return $health
}

function Test-TypeScriptConfig {
    if (Test-Path "tsconfig.json") {
        try {
            $json = Get-Content "tsconfig.json" | ConvertFrom-Json
            return $null -ne $json.compilerOptions
        } catch {
            return $false
        }
    }
    return $false
}

function Test-EslintConfig {
    return (Test-Path ".eslintrc.json") -or (Test-Path ".eslintrc.js") -or (Test-Path "eslint.config.js")
}

function Show-ContextStatus {
    $ctx = Get-ProjectContext
    
    Write-Host "📍 Project Context" -ForegroundColor Cyan
    Write-Host "  Root: $($ctx.Root)" -ForegroundColor Gray
    Write-Host "  Env: $($ctx.Environment)" -ForegroundColor Yellow
    Write-Host "  Monorepo: $($ctx.IsMonorepo)" -ForegroundColor Green
    
    if ($ctx.Packages.Count -gt 0) {
        Write-Host "  Packages: $($ctx.Packages.Count)" -ForegroundColor Green
    }
    
    Write-Host "  Health:" -ForegroundColor Cyan
    $ctx.Health.GetEnumerator() | ForEach-Object {
        $status = if ($_.Value) { "✓" } else { "✗" }
        Write-Host "    $status $($_.Key)" -ForegroundColor $(if ($_.Value) { "Green" } else { "Red" })
    }
}

Export-ModuleMember -Function @('Get-ProjectContext', 'Show-ContextStatus', 'Get-GitRoot', 'Get-Environment')

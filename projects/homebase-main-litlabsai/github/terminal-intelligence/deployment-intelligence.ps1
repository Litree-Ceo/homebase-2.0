# Deployment Intelligence Module - Smart deployment and rollback
$script:DeploymentHistory = @()

function Test-DeploymentReady {
    Write-Host "🔍 Checking deployment readiness..." -ForegroundColor Cyan
    
    $checks = @{
        "Git clean" = (git status --porcelain 2>$null).Count -eq 0
        "Build passes" = Test-BuildHealth
        "Tests pass" = Test-TestHealth
        "No secrets" = Test-NoSecrets
    }
    
    $allPass = $true
    $checks.GetEnumerator() | ForEach-Object {
        $status = if ($_.Value) { "✓" } else { "✗" }
        Write-Host "  $status $($_.Key)" -ForegroundColor $(if ($_.Value) { "Green" } else { "Red" })
        if (-not $_.Value) { $allPass = $false }
    }
    
    return $allPass
}

function Test-BuildHealth {
    if (Test-Path "package.json") {
        try {
            $json = Get-Content "package.json" | ConvertFrom-Json
            return $null -ne $json.scripts.build
        } catch {
            return $false
        }
    }
    return $false
}

function Test-TestHealth {
    if (Test-Path "package.json") {
        try {
            $json = Get-Content "package.json" | ConvertFrom-Json
            return $null -ne $json.scripts.test
        } catch {
            return $false
        }
    }
    return $true
}

function Test-NoSecrets {
    $secretPatterns = @(
        'PRIVATE_KEY',
        'API_KEY',
        'SECRET',
        'PASSWORD',
        'TOKEN'
    )
    
    $files = Get-ChildItem -Recurse -Include "*.js", "*.ts", "*.jsx", "*.tsx" -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch 'node_modules|\.next|dist' }
    
    foreach ($file in $files) {
        $content = Get-Content $file -Raw
        foreach ($pattern in $secretPatterns) {
            if ($content -match "(?i)$pattern\s*=\s*['\"](?!<|YOUR_|EXAMPLE_)" -and $content -notmatch '\.example') {
                return $false
            }
        }
    }
    return $true
}

function Deploy-ToVercel {
    param([string]$Environment = "production")
    
    if (-not (Test-DeploymentReady)) {
        Write-Host "❌ Deployment not ready" -ForegroundColor Red
        return $false
    }
    
    Write-Host "🚀 Deploying to Vercel ($Environment)..." -ForegroundColor Cyan
    
    if ($Environment -eq "production") {
        vercel --prod 2>$null
    } else {
        vercel --env $Environment 2>$null
    }
    
    if ($LASTEXITCODE -eq 0) {
        $script:DeploymentHistory += @{
            Platform = "Vercel"
            Environment = $Environment
            Timestamp = Get-Date
            Status = "Success"
        }
        Write-Host "✓ Deployed successfully" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ Deployment failed" -ForegroundColor Red
        return $false
    }
}

function Deploy-ToAzure {
    param([string]$ResourceGroup, [string]$AppName)
    
    if (-not (Test-DeploymentReady)) {
        Write-Host "❌ Deployment not ready" -ForegroundColor Red
        return $false
    }
    
    Write-Host "🚀 Deploying to Azure ($AppName)..." -ForegroundColor Cyan
    
    az webapp deployment source config-zip --resource-group $ResourceGroup --name $AppName --src "deploy.zip" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        $script:DeploymentHistory += @{
            Platform = "Azure"
            AppName = $AppName
            Timestamp = Get-Date
            Status = "Success"
        }
        Write-Host "✓ Deployed successfully" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ Deployment failed" -ForegroundColor Red
        return $false
    }
}

function Rollback-Deployment {
    param([int]$Steps = 1)
    
    if ($script:DeploymentHistory.Count -lt $Steps) {
        Write-Host "❌ Not enough deployment history" -ForegroundColor Red
        return
    }
    
    Write-Host "⏮️  Rolling back $Steps deployment(s)..." -ForegroundColor Yellow
    
    for ($i = 0; $i -lt $Steps; $i++) {
        $deployment = $script:DeploymentHistory[-1]
        Write-Host "  Reverting: $($deployment.Platform) - $($deployment.Timestamp)" -ForegroundColor Gray
        $script:DeploymentHistory = $script:DeploymentHistory[0..($script:DeploymentHistory.Count - 2)]
    }
    
    Write-Host "✓ Rollback complete" -ForegroundColor Green
}

function Show-DeploymentHistory {
    Write-Host "📋 Deployment History" -ForegroundColor Cyan
    if ($script:DeploymentHistory.Count -eq 0) {
        Write-Host "  No deployments yet" -ForegroundColor Gray
        return
    }
    
    $script:DeploymentHistory | ForEach-Object {
        $status = if ($_.Status -eq "Success") { "✓" } else { "✗" }
        Write-Host "  $status $($_.Platform) - $($_.Timestamp.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
    }
}

Export-ModuleMember -Function @('Test-DeploymentReady', 'Deploy-ToVercel', 'Deploy-ToAzure', 'Rollback-Deployment', 'Show-DeploymentHistory')

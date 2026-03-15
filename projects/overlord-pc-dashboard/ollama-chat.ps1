# Ollama CLI Chat Wrapper for PowerShell
# Usage: .\ollama-chat.ps1

param(
    [string]$Model = "llama3.2",
    [switch]$Interactive
)

$OllamaHost = "http://localhost:11434"

function Send-Ollama {
    param([string]$Prompt, [string]$ModelName)
    
    $body = @{
        model = $ModelName
        prompt = $Prompt
        stream = $false
        options = @{
            temperature = 0.7
            num_predict = 500
        }
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$OllamaHost/api/generate" `
            -Method Post `
            -Body $body `
            -ContentType "application/json"
        return $response.response
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
        return $null
    }
}

function Get-OllamaModels {
    try {
        $response = Invoke-RestMethod -Uri "$OllamaHost/api/tags" -Method Get
        return $response.models
    }
    catch {
        Write-Host "Error fetching models: $_" -ForegroundColor Red
        return @()
    }
}

# Main logic
Write-Host "Ollama Chat Wrapper" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

# Show available models
$models = Get-OllamaModels
Write-Host "Available models:" -ForegroundColor Yellow
$models | ForEach-Object { Write-Host "  - $($_.name)" }

if ($Interactive) {
    Write-Host "`nInteractive mode. Type 'exit' to quit." -ForegroundColor Green
    
    while ($true) {
        Write-Host "`n> " -NoNewline -ForegroundColor Cyan
        $userInput = Read-Host
        
        if ($userInput -eq "exit" -or $userInput -eq "quit") {
            Write-Host "Goodbye!" -ForegroundColor Green
            break
        }
        
        if ([string]::IsNullOrWhiteSpace($userInput)) {
            continue
        }
        
        $response = Send-Ollama -Prompt $userInput -ModelName $Model
        if ($response) {
            Write-Host $response -ForegroundColor White
        }
    }
}
else {
    # Single prompt mode
    Write-Host "Model: $Model" -ForegroundColor Yellow
    Write-Host "Enter your prompt (or 'exit' to quit):" -ForegroundColor Green
    
    while ($true) {
        Write-Host "`n> " -NoNewline -ForegroundColor Cyan
        $userInput = Read-Host
        
        if ($userInput -eq "exit" -or $userInput -eq "quit") {
            Write-Host "Goodbye!" -ForegroundColor Green
            break
        }
        
        if ([string]::IsNullOrWhiteSpace($userInput)) {
            continue
        }
        
        $response = Send-Ollama -Prompt $userInput -ModelName $Model
        if ($response) {
            Write-Host $response -ForegroundColor White
        }
    }
}

# Test OpenRouter API Key - Zero Cost Models
# Run: .\test-openrouter.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🧪 Testing OpenRouter API Key" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if OPENROUTER_API_KEY is set
$apiKey = $env:OPENROUTER_API_KEY

if (-not $apiKey) {
    Write-Host "❌ ERROR: OPENROUTER_API_KEY not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix:" -ForegroundColor Yellow
    Write-Host "  1. Get your free key: https://openrouter.ai/keys"
    Write-Host "  2. Set it: `$env:OPENROUTER_API_KEY = 'sk-or-v1-...'"
    Write-Host "  3. Or add to .env file"
    exit 1
}

Write-Host "✅ API Key found" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Testing with step-3.5-flash (fastest free model)..." -ForegroundColor Cyan
Write-Host ""

# Test the API
try {
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
        "HTTP-Referer" = "http://localhost:5173"
        "X-Title" = "Overlord Dashboard"
    }

    $body = @{
        model = "stepfun/step-3-5-flash:free"
        messages = @(@{role = "user"; content = "Say: OpenRouter is working! 🎉"})
        max_tokens = 50
        temperature = 0.7
    } | ConvertTo-Json -Depth 3

    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" `
        -Method Post -Headers $headers -Body $body -TimeoutSec 30

    Write-Host "✅ SUCCESS! API Key is valid" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $response.choices[0].message.content
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "🎉 Ready to start the backend!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  cd overlord-modern\backend"
    Write-Host "  uvicorn app.main:app --reload"
}
catch {
    Write-Host "❌ ERROR: API request failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Details: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  • Check your key: https://openrouter.ai/keys"
    Write-Host "  • Ensure key starts with 'sk-or-v1-'"
    Write-Host "  • Verify key is active (not revoked)"
    exit 1
}

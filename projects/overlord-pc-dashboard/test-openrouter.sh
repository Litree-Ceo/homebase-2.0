#!/bin/bash
# Test OpenRouter API Key - Zero Cost Models

set -e

echo "=========================================="
echo "🧪 Testing OpenRouter API Key"
echo "=========================================="

# Check if OPENROUTER_API_KEY is set
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "❌ ERROR: OPENROUTER_API_KEY not set!"
    echo ""
    echo "To fix:"
    echo "  1. Get your free key: https://openrouter.ai/keys"
    echo "  2. Export it: export OPENROUTER_API_KEY=sk-or-v1-..."
    echo "  3. Or add to .env file"
    exit 1
fi

echo "✅ API Key found"
echo ""
echo "🚀 Testing with step-3.5-flash (fastest free model)..."
echo ""

# Test the API
RESPONSE=$(curl -s -w "\n%{http_code}" https://openrouter.ai/api/v1/chat/completions \
    -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    -H "Content-Type: application/json" \
    -H "HTTP-Referer: http://localhost:5173" \
    -H "X-Title: Overlord Dashboard" \
    -d '{
        "model": "stepfun/step-3-5-flash:free",
        "messages": [{"role": "user", "content": "Say: OpenRouter is working! 🎉"}],
        "max_tokens": 50,
        "temperature": 0.7
    }')

# Extract status code and body
STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Status Code: $STATUS_CODE"
echo ""

if [ "$STATUS_CODE" -eq 200 ]; then
    echo "✅ SUCCESS! API Key is valid"
    echo ""
    echo "Response:"
    echo "$BODY" | jq -r '.choices[0].message.content' 2>/dev/null || echo "$BODY"
    echo ""
    echo "=========================================="
    echo "🎉 Ready to start the backend!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "  cd overlord-modern/backend"
    echo "  uvicorn app.main:app --reload"
    exit 0
else
    echo "❌ ERROR: API request failed"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    echo "Common fixes:"
    echo "  • Check your key: https://openrouter.ai/keys"
    echo "  • Ensure key starts with 'sk-or-v1-'"
    echo "  • Verify key is active (not revoked)"
    exit 1
fi

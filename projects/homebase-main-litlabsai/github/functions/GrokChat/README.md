# GrokChat Azure Function

A production-ready Azure Function for integrating xAI Grok API with your EverythingHomebase application.

## Overview

This function provides a secure, scalable interface to xAI's Grok language models through Azure Functions. It handles authentication, error management, token tracking, and Key Vault integration.

## Features

✅ **Secure**: Retrieves API key from Azure Key Vault via Managed Identity  
✅ **Flexible**: Supports all Grok models (4-fast-reasoning, 3-mini, 2-vision, 2-image)  
✅ **Reliable**: Full error handling, logging, and rate limit management  
✅ **Observable**: Tracks token usage and integrates with Application Insights  
✅ **Fast**: Optimized for low-latency AI responses  

## File Structure

```
functions/GrokChat/
├── index.js           # Main function handler
├── function.json      # Azure Function bindings
└── examples.js        # Code examples and patterns
```

## Setup

### 1. Prerequisites

- Azure Function App: `EverythingHomebase-func`
- Azure Key Vault: `EverythingHomebase-kv` with secret `GROK-API-KEY`
- xAI API Key: Get from [console.x.ai](https://console.x.ai)

### 2. Configure Environment

```powershell
# Set Key Vault secret
az keyvault secret set --vault-name EverythingHomebase-kv --name GROK-API-KEY --value "xai_your_key"

# Configure Function App settings
az functionapp config appsettings set --name EverythingHomebase-func --resource-group litree-prod-rg --settings `
  "GROK_API_KEY=@Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=GROK-API-KEY)"
```

### 3. Deploy

```powershell
cd functions
func azure functionapp publish EverythingHomebase-func
```

## Usage

### Basic Request

```bash
curl -X POST https://EverythingHomebase-func.azurewebsites.net/api/grok-chat?code=YOUR_FUNCTION_KEY \
  -H "Content-Type: application/json" \
  -d '{"query": "What is machine learning?"}'
```

### JavaScript/Node.js

```javascript
const response = await fetch('https://EverythingHomebase-func.azurewebsites.net/api/grok-chat?code=YOUR_CODE', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Your question here' })
});

const data = await response.json();
console.log(data.result);
```

### PowerShell

```powershell
$code = (az functionapp keys list --name EverythingHomebase-func --resource-group litree-prod-rg --query "functionKeys.default" -o tsv)

$response = Invoke-WebRequest -Uri "https://EverythingHomebase-func.azurewebsites.net/api/grok-chat?code=$code" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query": "Your question"}'

$response.Content | ConvertFrom-Json
```

## Request Format

### POST Body (JSON)

```json
{
  "query": "Your question or prompt here",
  "model": "grok-4-fast-reasoning",      // optional, default: grok-4-fast-reasoning
  "max_tokens": 1024,                     // optional, default: 1024
  "temperature": 0.7,                     // optional, default: 0.7
  "system": "Custom system prompt"        // optional
}
```

### Query Parameters

```
?query=Your question here                 // Alternative to POST body
?model=grok-3-mini                        // Override default model
```

## Response Format

### Success (200)

```json
{
  "success": true,
  "query": "Your question",
  "result": "Grok's response text here",
  "model": "grok-4-fast-reasoning",
  "usage": {
    "input_tokens": 25,
    "output_tokens": 150,
    "total_tokens": 175
  },
  "timestamp": "2026-01-02T10:30:00Z"
}
```

### Error (4xx/5xx)

```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "status": 400
}
```

## Models

| Model | Context | Input Cost | Output Cost | Best For |
|-------|---------|-----------|------------|----------|
| **grok-4-fast-reasoning** | 2M tokens | $0.20/M | $0.50/M | Complex reasoning, analysis |
| **grok-3-mini** | 131K tokens | $0.30/M | $0.50/M | Quick queries, cost optimization |
| **grok-2-vision-1212** | 32K tokens | $2.00/M | $10.00/M | Image + text analysis |
| **grok-2-image-1212** | N/A | N/A | $0.07/image | Image generation |

## Examples

See `examples.js` for detailed code examples:

1. **Basic Chat** - Simple question answering
2. **Reasoning** - Complex multi-step problems
3. **Cost Optimization** - Using grok-3-mini for efficiency
4. **Conversation** - Multi-turn dialogue with context
5. **Vision** - Image analysis
6. **Azure Integration** - Function integration pattern
7. **Streaming** - Real-time response streaming
8. **Retry Logic** - Error handling with exponential backoff

## Error Handling

### Common Errors

| Status | Meaning | Solution |
|--------|---------|----------|
| 400 | Bad Request | Check request format, ensure `query` field |
| 401 | Unauthorized | Verify GROK_API_KEY is correct |
| 429 | Rate Limited | Implement exponential backoff retry |
| 500 | Server Error | Check Application Insights logs |

### Retry Strategy

```javascript
async function retryCall(query, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { method: 'POST', body: JSON.stringify({ query }) });
      if (response.ok) return await response.json();
      if (response.status === 429) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }
      throw new Error(`API error: ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

## Monitoring

### Azure Portal

1. Navigate to: Resource Group → Application Insights (EverythingHomebase-func)
2. View:
   - **Live Metrics**: Real-time requests and performance
   - **Failures**: Error logs and stack traces
   - **Performance**: Response times and throughput
   - **Custom Metrics**: Token usage and costs

### Logs

```powershell
# Stream logs in real-time
az functionapp log tail --name EverythingHomebase-func --resource-group litree-prod-rg

# View historical logs
az functionapp log show --name EverythingHomebase-func --resource-group litree-prod-rg --tail 50
```

## Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Response Time | 1-5s | Depends on query complexity |
| Token Throughput | 4M/min | Rate limit for grok-4 |
| Requests/min | 480 | Rate limit for grok-4 |
| Concurrency | Unlimited | Scales automatically on Consumption plan |

## Pricing

### Compute (Azure Functions)

- **Consumption Plan**: $0.20 per 1M executions + $0.000016 per GB-second
- Typical cost: $0.01-0.10 per month for low-medium usage

### API (xAI)

- **grok-4-fast-reasoning**: $0.20 input / $0.50 output per M tokens
- **grok-3-mini**: $0.30 input / $0.50 output per M tokens
- **Typical cost**: $0.01-1.00 per month depending on usage

## Security

✅ **Best Practices Implemented**:
- API key stored in Azure Key Vault (encrypted at rest)
- Managed Identity for passwordless authentication
- No secrets hardcoded in function code
- RBAC controls access to Key Vault
- HTTPS-only communication
- Comprehensive request logging

❌ **Never Do**:
- Don't commit API keys to Git
- Don't expose function keys in URLs (except testing)
- Don't share API keys via email/Slack
- Don't hardcode secrets in code

## Troubleshooting

### Function doesn't start

```powershell
# Check deployment status
az functionapp deployment list --name EverythingHomebase-func --resource-group litree-prod-rg

# View function files
az functionapp list-functions --name EverythingHomebase-func --resource-group litree-prod-rg
```

### API returns 401 Unauthorized

```powershell
# Verify API key
az keyvault secret show --vault-name EverythingHomebase-kv --name GROK-API-KEY

# Check function app setting
az functionapp config appsettings list --name EverythingHomebase-func --resource-group litree-prod-rg | grep GROK
```

### Slow responses

- Check token usage (longer responses = slower)
- Consider using grok-3-mini for quicker responses
- Check Application Insights for network latency

### High costs

- Switch to grok-3-mini for routine queries
- Implement caching for common questions
- Monitor token usage via Application Insights

## Development

### Local Testing

```powershell
# Install dependencies
cd functions
npm install

# Start local runtime
func start

# Test in another terminal
curl -X POST http://localhost:7071/api/grok-chat -H "Content-Type: application/json" -d '{"query": "Test"}'
```

### Environment Variables

Create `.env` in `functions/` for local development:

```env
GROK_API_KEY=xai_your_test_key
NODE_ENV=development
```

### Debugging

Add breakpoints in VS Code or use `context.log()`:

```javascript
context.log('[GrokChat] Debug message:', variable);
context.log.error('[GrokChat] Error message');
context.log.warn('[GrokChat] Warning message');
```

## Integration Examples

### With Next.js Web App

```javascript
// pages/api/ask-grok.js
export default async function handler(req, res) {
  const { query } = req.body;
  const funcUrl = process.env.GROK_FUNCTION_URL;
  const funcKey = process.env.GROK_FUNCTION_KEY;

  const response = await fetch(`${funcUrl}?code=${funcKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

### With SignalR Real-Time Updates

```javascript
// Broadcast response to all connected clients
const signalR = require('@azure/signalr-service');
const service = new signalR.SignalRServiceClient(
  process.env.SIGNALR_CONN
);

await service.send('connectionGroup', 'grokResponse', {
  query,
  result: data.choices[0].message.content
});
```

## References

- [xAI Grok API Docs](https://docs.x.ai/)
- [Azure Functions Docs](https://learn.microsoft.com/azure/azure-functions/)
- [Azure Key Vault Docs](https://learn.microsoft.com/azure/key-vault/)
- [Function Pricing](https://azure.microsoft.com/pricing/details/functions/)

## License

Part of EverythingHomebase project. See main README.md for license details.

## Support

For issues:
1. Check `examples.js` for code patterns
2. Review logs in Application Insights
3. See `GROK_INTEGRATION_GUIDE.md` for full integration walkthrough
4. Refer to `GROK_SETUP_CHECKLIST.md` for troubleshooting

---

**Created**: January 2, 2026  
**Status**: Production Ready  
**Last Updated**: January 2, 2026

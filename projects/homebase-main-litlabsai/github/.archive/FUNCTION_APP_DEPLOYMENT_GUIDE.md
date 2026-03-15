# EverythingHomebase Function App - Deployment & Testing Guide

## Overview
This guide covers deploying the GrokChat Function App with Azure infrastructure including:
- Key Vault for secrets management
- Managed Identity for secure authentication
- Application Insights for monitoring
- Log Analytics for logging and diagnostics
- Smart Detection for anomaly alerts

## Prerequisites

### Required Tools
- Azure CLI: https://aka.ms/azure-cli
- Azure Functions Core Tools: `npm install -g azure-functions-core-tools@4`
- Node.js 18+: https://nodejs.org/
- PowerShell 7+: https://github.com/PowerShell/PowerShell

### Required Credentials
- Azure subscription with permissions to create resources
- Grok API key from xAI: https://console.x.ai/
- SignalR connection string (from Azure Portal or deployment)
- Cosmos DB connection string (if using)

## Step 1: Configure Secrets in Key Vault

### Option A: Automated Setup (Recommended)

Run the setup script in Windows PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Setup-KeyVaultSecrets.ps1 -SubscriptionId "0f95fc53-20dc-4c0d-8f76-0108222d5fb1"
```

This will prompt for:
- SignalR connection string
- Grok API key

### Option B: Manual Setup via Azure CLI

```powershell
# Set subscription
az account set --subscription "0f95fc53-20dc-4c0d-8f76-0108222d5fb1"

# Get Cosmos DB endpoint
$cosmosEndpoint = az cosmosdb show --name everythinghomebasecosmos --resource-group litree-prod-rg --query 'documentEndpoint' -o tsv

# Create Key Vault (if not exists)
az keyvault create --name EverythingHomebase-kv --resource-group litree-prod-rg --location eastus2

# Set secrets
az keyvault secret set --vault-name EverythingHomebase-kv --name "COSMOS-ENDPOINT" --value $cosmosEndpoint
az keyvault secret set --vault-name EverythingHomebase-kv --name "SIGNALR-CONN" --value "YOUR_SIGNALR_CONNECTION_STRING"
az keyvault secret set --vault-name EverythingHomebase-kv --name "GROK-API-KEY" --value "xai_YOUR_GROK_API_KEY"
```

### Verify Secrets

```powershell
# List all secrets in Key Vault
az keyvault secret list --vault-name EverythingHomebase-kv --query "[].name" -o table

# Check individual secret (without value for security)
az keyvault secret show --vault-name EverythingHomebase-kv --name "COSMOS-ENDPOINT" --query "id"
```

## Step 2: Deploy Infrastructure via Bicep

### Update Parameters File

Edit `infrastructure-function-app.parameters.json`:
```json
{
  "parameters": {
    "signalrConnection": {
      "value": "YOUR_ACTUAL_SIGNALR_CONNECTION_STRING"
    },
    "grokApiKey": {
      "value": "xai_YOUR_ACTUAL_GROK_API_KEY"
    },
    "cosmosDbEndpoint": {
      "value": "YOUR_COSMOS_DB_ENDPOINT"
    }
  }
}
```

### Deploy in Windows PowerShell

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Preview changes (dry-run)
.\Deploy-Infrastructure.ps1 -WhatIf

# Deploy
.\Deploy-Infrastructure.ps1 -SubscriptionId "0f95fc53-20dc-4c0d-8f76-0108222d5fb1"
```

### Verify Deployment

```powershell
# Check Function App
az functionapp show --name EverythingHomebase-func --resource-group litree-prod-rg --query "{name: name, state: state, url: defaultHostName}"

# Check Function App settings
az functionapp config appsettings list --name EverythingHomebase-func --resource-group litree-prod-rg --query "[?name=='COSMOS_ENDPOINT' || name=='GROK_API_KEY'].{name: name, value: value}" -o table

# Check Application Insights
az monitor app-insights component show --name EverythingHomebase-insights --resource-group litree-prod-rg --query "{name: name, status: ResourceState}"

# Check Log Analytics
az monitor log-analytics workspace show --name log-baseline01 --resource-group litree-prod-rg --query "{name: name}"
```

## Step 3: Deploy Function Code

### Option A: Using Azure Functions Core Tools (Local Development)

```powershell
cd functions

# Install dependencies
npm install

# Start local development server
func start

# Function will be available at: http://localhost:7071/api/GrokChat
```

### Option B: Deploy to Azure

```powershell
cd functions

# Install dependencies
npm install

# Deploy to Function App
func azure functionapp publish EverythingHomebase-func --build remote

# Alternative using npm script
npm run publish
```

### Monitor Deployment

```powershell
# View deployment logs
az functionapp deployment source show-build-status --name EverythingHomebase-func --resource-group litree-prod-rg

# Check function status
az functionapp list --resource-group litree-prod-rg --query "[?name=='EverythingHomebase-func'].{name: name, state: state, location: location}" -o table
```

## Step 4: Configure Application Insights Monitoring

### Enable Smart Detection

```powershell
# Get Application Insights ID
$appInsightsId = az monitor app-insights component show --name EverythingHomebase-insights --resource-group litree-prod-rg --query "id" -o tsv

# Create action group for alerts
az monitor action-group create `
  --name "EverythingHomebase-alerts" `
  --resource-group litree-prod-rg `
  --short-name "Alerts"

# Get action group ID
$actionGroupId = az monitor action-group show --name "EverythingHomebase-alerts" --resource-group litree-prod-rg --query "id" -o tsv

# Create metric alert rule for failures
az monitor metrics alert create `
  --name "Function-Failure-Rate" `
  --resource-group litree-prod-rg `
  --scopes $appInsightsId `
  --condition "total ServerErrors > 5" `
  --description "Alert when Function App has >5 errors" `
  --severity 3 `
  --evaluation-frequency "5m" `
  --window-size "15m" `
  --action "/subscriptions/0f95fc53-20dc-4c0d-8f76-0108222d5fb1/resourceGroups/litree-prod-rg/providers/Microsoft.Insights/actionGroups/EverythingHomebase-alerts"
```

### Link Log Analytics to Application Insights

```powershell
# This is configured in the Bicep template
# Verify the link exists
az monitor log-analytics workspace data-export create `
  --workspace-name "log-baseline01" `
  --name "export-to-insights" `
  --destination $appInsightsId `
  --table "AppTraces"
```

## Step 5: Test Function App

### Test from Local Machine

```powershell
# If running locally with `func start`
$url = "http://localhost:7071/api/GrokChat"

# Test with curl
curl -X POST $url `
  -H "Content-Type: application/json" `
  -d '{"query": "What is 2+2?"}'

# Test with Invoke-WebRequest (PowerShell)
$body = @{query = "What is 2+2?"} | ConvertTo-Json
Invoke-WebRequest -Uri $url -Method POST -Body $body -Headers @{"Content-Type"="application/json"}
```

### Test in Azure

```powershell
# Get Function URL
$functionUrl = "https://EverythingHomebase-func.azurewebsites.net/api/GrokChat"

# Get function code for authentication
$functionCode = az functionapp keys list --name EverythingHomebase-func --resource-group litree-prod-rg --query "functionKeys[0].value" -o tsv

# Test with function key
$url = "$functionUrl?code=$functionCode"
$body = @{query = "What is 2+2?"} | ConvertTo-Json

Invoke-WebRequest -Uri $url -Method POST -Body $body -Headers @{"Content-Type"="application/json"}
```

### Test Different Scenarios

```powershell
# Test with custom model
$body = @{
  query = "Explain quantum computing"
  model = "grok-2"
  max_tokens = 500
  temperature = 0.5
} | ConvertTo-Json

Invoke-WebRequest -Uri $url -Method POST -Body $body -Headers @{"Content-Type"="application/json"}

# Test error handling - missing query
$body = @{} | ConvertTo-Json
Invoke-WebRequest -Uri $url -Method POST -Body $body -Headers @{"Content-Type"="application/json"} 2>&1 | Select-Object -ExpandProperty Content

# Test with system prompt
$body = @{
  query = "Who are you?"
  system = "You are a helpful AI assistant named GrokChat."
} | ConvertTo-Json

Invoke-WebRequest -Uri $url -Method POST -Body $body -Headers @{"Content-Type"="application/json"}
```

## Step 6: Monitor and Troubleshoot

### View Application Insights Metrics

```powershell
# Get recent requests
az monitor app-insights metrics get `
  --name EverythingHomebase-insights `
  --resource-group litree-prod-rg `
  --metric "requests/count" `
  --interval PT1M `
  --aggregation total

# Get server exceptions
az monitor app-insights metrics get `
  --name EverythingHomebase-insights `
  --resource-group litree-prod-rg `
  --metric "server/exceptions" `
  --interval PT5M `
  --aggregation total
```

### Query Log Analytics

```powershell
# Get Function App logs
az monitor log-analytics query `
  --workspace log-baseline01 `
  --analytics-query "AppServicePlatformLogs | where ResourceProvider == 'Microsoft.Web' | take 10"

# Get performance metrics
az monitor log-analytics query `
  --workspace log-baseline01 `
  --analytics-query "AppServiceHTTPLogs | where TimeGenerated > ago(1h) | summarize Count=count() by Status"

# Get error traces
az monitor log-analytics query `
  --workspace log-baseline01 `
  --analytics-query "AppTraces | where SeverityLevel >= 2 | order by TimeGenerated desc | take 50"
```

### View Function Logs via Azure CLI

```powershell
# Stream live logs
az functionapp log tail --name EverythingHomebase-func --resource-group litree-prod-rg

# Get deployment logs
az functionapp deployment log show --name EverythingHomebase-func --resource-group litree-prod-rg --slot-name production
```

### View in Azure Portal

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to "Function App" > "EverythingHomebase-func"
3. Select "Monitor" to see:
   - Requests
   - Failures
   - Performance
   - Server exceptions
4. Navigate to "Log Analytics" to run custom KQL queries

## Troubleshooting

### Problem: GROK_API_KEY Not Found

**Solution:**
```powershell
# Verify Function App identity
$identity = az functionapp identity show --name EverythingHomebase-func --resource-group litree-prod-rg

# Verify Key Vault access policy
az keyvault show --name EverythingHomebase-kv --resource-group litree-prod-rg --query "properties.accessPolicies"

# Re-grant access if needed
az keyvault set-policy `
  --name EverythingHomebase-kv `
  --object-id $identity.principalId `
  --secret-permissions get list
```

### Problem: Function Returns 401 Unauthorized

**Possible causes:**
1. Invalid Grok API key
2. Key Vault secret not set
3. Function App identity doesn't have Key Vault access
4. Key Vault reference format incorrect

**Solution:**
```powershell
# Check if secret exists in Key Vault
az keyvault secret show --vault-name EverythingHomebase-kv --name "GROK-API-KEY"

# Verify Function App can access it
$funcKey = az functionapp keys list --name EverythingHomebase-func --resource-group litree-prod-rg

# Check Application Insights for detailed error
az monitor app-insights query `
  --workspace log-baseline01 `
  --analytics-query "AppTraces | where Message contains 'GROK_API_KEY' | take 10"
```

### Problem: Function Times Out

**Solution:**
```powershell
# Increase Function timeout in Function App settings
az functionapp config set `
  --name EverythingHomebase-func `
  --resource-group litree-prod-rg `
  --function-timeout 300  # 5 minutes

# Monitor Grok API response times in Application Insights
az monitor app-insights query `
  --workspace log-baseline01 `
  --analytics-query "AppDependencies | where Name contains 'x.ai' | summarize AvgDuration=avg(Duration) by Name"
```

### Problem: High Error Rate

**Check Function Logs:**
```powershell
# Stream logs in real-time
az functionapp log tail --name EverythingHomebase-func --resource-group litree-prod-rg --provider "Function App"

# Query specific error patterns
az monitor log-analytics query `
  --workspace log-baseline01 `
  --analytics-query "AppTraces | where SeverityLevel == 3 | summarize Count=count() by Message | order by Count desc"
```

## Security Best Practices

✅ **Implemented:**
- Secrets stored in Key Vault (never in code or settings)
- Managed Identity for Function App (no stored credentials)
- HTTPS only for Function App
- Least-privilege access to Key Vault (get/list secrets only)
- Application Insights monitoring and alerts

⚠️ **Recommendations:**
- Regularly rotate Grok API keys
- Enable Key Vault soft delete and purge protection
- Use Network Security Groups to restrict Function App access
- Implement rate limiting for external API calls
- Enable diagnostic settings to audit all Key Vault access

## References

- Azure Functions Documentation: https://docs.microsoft.com/azure/azure-functions/
- Key Vault Best Practices: https://docs.microsoft.com/azure/key-vault/general/best-practices
- Application Insights: https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview
- Grok API Documentation: https://console.x.ai/
- Bicep Reference: https://docs.microsoft.com/azure/azure-resource-manager/bicep/

## Support

For issues or questions:
1. Check Application Insights metrics
2. Query Log Analytics workspace
3. Review Function App logs
4. Check Key Vault access policies
5. Verify all secrets are set in Key Vault

# EverythingHomebase Grok Integration - Deployment Complete

## Setup Summary

### ✅ Phase 1: Key Vault Configuration - COMPLETED
- ✅ Assigned "Key Vault Secrets Officer" role to current user
- ✅ Set COSMOS-ENDPOINT secret: `https://everythinghomebasecosmos.documents.azure.com:443/`
- ✅ Set SIGNALR-CONN secret: `Endpoint=https://EverythingHomebase-signalr.service.signalr.net;...`
- ✅ Set GROK-API-KEY secret: `[REDACTED - Stored in Azure Key Vault]`

### ✅ Phase 2: Function App Managed Identity - COMPLETED
- ✅ Enabled System-Assigned Managed Identity on `EverythingHomebase-func`
- ✅ Principal ID: `0973b558-af06-44cb-99f8-0c3a51cc6da8`
- ✅ Assigned "Key Vault Secrets User" role to Function App identity

### ✅ Phase 3: Key Vault References - COMPLETED
- ✅ COSMOS_ENDPOINT → `@Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=COSMOS-ENDPOINT)`
- ✅ SIGNALR_CONN → `@Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=SIGNALR-CONN)`
- ✅ GROK_API_KEY → `@Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=GROK-API-KEY)`

### ✅ Phase 4: Application Insights - COMPLETED
- ✅ Application Insights already linked to Function App
- ✅ Instrumentation Key: `d69b8d1d-d4f8-41b8-bf59-53f56e7323e8`
- ✅ Connection String configured

### ✅ Phase 5: Smart Detection & Monitoring - COMPLETED
- ✅ Created Action Group: `grok-function-alerts`
- ✅ Created Log Analytics Workspace: `log-baseline01`
- ✅ Workspace ID: `/subscriptions/0f95fc53-20dc-4c0d-8f76-0108222d5fb1/resourceGroups/litree-prod-rg/providers/Microsoft.OperationalInsights/workspaces/log-baseline01`

### ⏳ Phase 6: Function Deployment - IN PROGRESS

## Next Steps

### Step 1: Deploy Function Code

Use the provided deployment script to deploy the Grok Chat function:

**Option A: Using PowerShell (Recommended for Windows)**
```powershell
cd "E:\VSCode\HomeBase 2.0"
.\Deploy-GrokFunction.ps1 -FunctionAppName "EverythingHomebase-func" -ResourceGroup "litree-prod-rg"
```

**Option B: Using Azure CLI**
```bash
cd "/mnt/e/VSCode/HomeBase 2.0/functions"
zip -r grok-function.zip GrokChat/
az functionapp deployment source config-zip \
  --resource-group litree-prod-rg \
  --name EverythingHomebase-func \
  --src grok-function.zip
```

### Step 2: Verify Function Deployment

```bash
# Get function details
az functionapp function show \
  --name EverythingHomebase-func \
  --resource-group litree-prod-rg \
  --function-name GrokChat \
  --query "{name: name, url: invokeUrlTemplate}"
```

Expected output:
```json
{
  "name": "GrokChat",
  "url": "https://everythinghomebase-func.azurewebsites.net/api/grok-chat?code=..."
}
```

### Step 3: Test Function Endpoint

**Option A: Using PowerShell Test Script**
```powershell
$functionUrl = "https://everythinghomebase-func.azurewebsites.net/api/grok-chat?code=YOUR_FUNCTION_CODE"
.\Test-GrokFunction.ps1 -FunctionUrl $functionUrl -Query "Tell me a joke"
```

**Option B: Using curl**
```bash
curl -X POST "https://everythinghomebase-func.azurewebsites.net/api/grok-chat?code=YOUR_FUNCTION_CODE" \
  -H "Content-Type: application/json" \
  -d '{"query":"Tell me a joke"}'
```

**Option C: Using PowerShell Invoke-WebRequest**
```powershell
$body = @{
    query = "Tell me a joke"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "https://everythinghomebase-func.azurewebsites.net/api/grok-chat?code=YOUR_FUNCTION_CODE" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

## Function Details

### GrokChat Function
- **Location**: `E:\VSCode\HomeBase 2.0\functions\GrokChat\`
- **Route**: `/api/grok-chat`
- **Method**: POST
- **Request Body**: 
  ```json
  {
    "query": "Your question here",
    "model": "grok-4-fast-reasoning",
    "max_tokens": 1024,
    "temperature": 0.7
  }
  ```

### Environment Variables (via Key Vault)
- `GROK_API_KEY`: Retrieved from Key Vault (GROK-API-KEY secret)
- `COSMOS_ENDPOINT`: Retrieved from Key Vault (COSMOS-ENDPOINT secret)
- `SIGNALR_CONN`: Retrieved from Key Vault (SIGNALR-CONN secret)

### Key Features
✅ Managed Identity integration with Key Vault
✅ Automatic secret resolution from Key Vault
✅ Grok API integration for AI responses
✅ Application Insights monitoring
✅ Error handling and logging
✅ Rate limiting support

## Monitoring & Troubleshooting

### View Function Logs
```bash
az functionapp log tail --name EverythingHomebase-func --resource-group litree-prod-rg
```

### Check Application Insights
Navigate to Azure Portal:
1. Go to Resource Groups → litree-prod-rg
2. Click on Application Insights (if visible)
3. View Live Metrics, Traces, Exceptions, Performance

### Verify Key Vault Access
```bash
# List all secrets
az keyvault secret list --vault-name EverythingHomebase-kv --query "[].name"

# Test a specific secret (use with caution)
az keyvault secret show --vault-name EverythingHomebase-kv --name GROK-API-KEY --query value -o tsv
```

### Check Function App Configuration
```bash
az functionapp config appsettings list \
  --name EverythingHomebase-func \
  --resource-group litree-prod-rg
```

### Common Issues

**Issue: Function returns 500 error**
- Check Application Insights Traces and Exceptions
- Verify GROK_API_KEY is correctly set in Key Vault
- Ensure Function App identity has Key Vault access

**Issue: Key Vault "Forbidden" error**
- Verify Function App identity is assigned "Key Vault Secrets User" role
- Check RBAC assignment has propagated (can take a few minutes)
- Confirm Key Vault firewall rules allow Function App access

**Issue: Grok API returns 401**
- Verify GROK-API-KEY secret value is correct
- Check API key hasn't expired in xAI console
- Ensure API key is properly encoded

**Issue: Cannot access function endpoint**
- Verify function code has been deployed
- Check Authentication Level in function.json (should be "function")
- Ensure you're using correct function code/access key

## Command Reference

```bash
# Function App
az functionapp list --resource-group litree-prod-rg
az functionapp config appsettings list --name EverythingHomebase-func --resource-group litree-prod-rg
az functionapp log tail --name EverythingHomebase-func --resource-group litree-prod-rg

# Key Vault
az keyvault secret list --vault-name EverythingHomebase-kv
az keyvault secret show --vault-name EverythingHomebase-kv --name GROK-API-KEY
az role assignment list --scope /subscriptions/0f95fc53-20dc-4c0d-8f76-0108222d5fb1/resourceGroups/litree-prod-rg/providers/Microsoft.KeyVault/vaults/EverythingHomebase-kv

# Application Insights
az monitor app-insights component show --app EverythingHomebase-func --resource-group litree-prod-rg
az monitor metrics list --resource /subscriptions/0f95fc53-20dc-4c0d-8f76-0108222d5fb1/resourceGroups/litree-prod-rg/providers/microsoft.insights/components/EverythingHomebase-func

# Log Analytics
az monitor log-analytics workspace show --workspace-name log-baseline01 --resource-group litree-prod-rg
```

## Files Created

1. **AZURE_SETUP_GUIDE.md** - Complete setup guide with all phases
2. **Deploy-GrokFunction.ps1** - PowerShell script to deploy the function
3. **Test-GrokFunction.ps1** - PowerShell script to test the function
4. **deploy-grok-function.sh** - Bash script for Linux/WSL deployment
5. **GROK_DEPLOYMENT_CHECKLIST.md** - This file

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Azure Function App                        │
│              (EverythingHomebase-func)                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          GrokChat Function (/api/grok-chat)          │   │
│  │                                                        │   │
│  │  1. Receives POST request with query                 │   │
│  │  2. Authenticates using System-Managed Identity      │   │
│  │  3. Retrieves secrets from Key Vault:                │   │
│  │     - GROK_API_KEY                                   │   │
│  │     - COSMOS_ENDPOINT                                │   │
│  │     - SIGNALR_CONN                                   │   │
│  │  4. Calls xAI Grok API with query                    │   │
│  │  5. Returns structured response                      │   │
│  │  6. Logs to Application Insights                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│                           ▼                                   │
│               System-Managed Identity                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────┐         ┌──────────┐       ┌──────────────┐
   │Key Vault│         │    xAI   │       │ Application  │
   │         │         │Grok API  │       │  Insights    │
   │Secrets: │         │          │       │              │
   │-COSMOS  │         │ Returns: │       │ Monitors:    │
   │-SIGNALR │         │-response │       │-Logs         │
   │-GROK    │         │-choices  │       │-Metrics      │
   └─────────┘         └──────────┘       │-Exceptions   │
        │                                  └──────────────┘
        │                                         │
        ├─────────────────────────────────────────┤
        ▼                                         ▼
   ┌──────────────────────────────────────────────────────┐
   │         Log Analytics Workspace                       │
   │              (log-baseline01)                        │
   │                                                       │
   │ Centralized logging and analytics for all services   │
   └──────────────────────────────────────────────────────┘
```

## Success Criteria

✅ All phases completed successfully
✅ Key Vault secrets configured
✅ Function App has managed identity
✅ Application Insights connected
✅ Action group created for alerts
✅ Log Analytics workspace created
✅ Function code ready for deployment
✅ Test scripts ready to use

## Deployment Ready

The infrastructure is now ready for the function code deployment. Follow Step 1 above to deploy the GrokChat function and begin testing.


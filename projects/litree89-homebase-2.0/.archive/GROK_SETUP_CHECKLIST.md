# xAI Grok Integration Checklist for EverythingHomebase

## ✅ Phase 1: Bootstrap Script Fixed
- [x] Updated `litree-homebase-master-bootstrap.ps1` to use hyphenated secret names
- [x] Changed secret names: COSMOS_ENDPOINT → COSMOS-ENDPOINT, SIGNALR_CONN → SIGNALR-CONN, GROK_API_KEY → GROK-API-KEY
- [x] Updated documentation and next steps in script

## ⏳ Phase 2: Obtain Credentials (Do This First!)

### Get Azure Resource Details
- [ ] Log into [Azure Portal](https://portal.azure.com)
- [ ] Navigate to Resource Group: **litree-prod-rg**
- [ ] Find **everythinghomebasecosmos** (Cosmos DB) → Copy **URI** from Overview
  - Example: `https://everythinghomebasecosmos.documents.azure.com:443/`
  - Store as: COSMOS-ENDPOINT
- [ ] Find **EverythingHomebase-signalr** (SignalR) → Copy **Connection String** from Settings
  - Store as: SIGNALR-CONN

### Get xAI API Key
- [ ] Go to [console.x.ai](https://console.x.ai)
- [ ] Create account or sign in
- [ ] Navigate to **API Keys** section
- [ ] Generate new API key
  - Starts with: `xai_...`
  - Store as: GROK-API-KEY
- [ ] Save securely (don't share or commit to Git)

## ⚙️ Phase 3: Set Up Key Vault Secrets

### Option A: Automated Setup (Recommended)
```powershell
cd 'e:\VSCode\HomeBase 2.0'
.\Setup-GrokIntegration.ps1 -Interactive
# Follow prompts to enter credentials
```

### Option B: Manual Setup via Azure CLI
```powershell
# Set each secret one at a time
az keyvault secret set --vault-name EverythingHomebase-kv --name COSMOS-ENDPOINT --value 'https://everythinghomebasecosmos.documents.azure.com:443/'

az keyvault secret set --vault-name EverythingHomebase-kv --name SIGNALR-CONN --value 'Endpoint=https://EverythingHomebase-signalr.service.signalr.net;AccessKey=...;Version=1.0;'

az keyvault secret set --vault-name EverythingHomebase-kv --name GROK-API-KEY --value 'xai_YourKeyHere'
```

### Option C: Manual Setup via Azure Portal
1. Go to Resource Group: **litree-prod-rg**
2. Open **EverythingHomebase-kv** (Key Vault)
3. Select **Secrets** from left menu
4. Click **+ Generate/Import**
5. For each secret (COSMOS-ENDPOINT, SIGNALR-CONN, GROK-API-KEY):
   - Name: Enter exact name (with hyphens)
   - Value: Paste secret value from Step 2
   - Click **Create**

- [ ] COSMOS-ENDPOINT set in Key Vault
- [ ] SIGNALR-CONN set in Key Vault
- [ ] GROK-API-KEY set in Key Vault

## 🔐 Phase 4: Configure Function App

### Assign Managed Identity & Permissions
```powershell
# Assign System-assigned Managed Identity
az functionapp identity assign --name EverythingHomebase-func --resource-group litree-prod-rg

# Get principal ID
$principalId = (az functionapp show --name EverythingHomebase-func --resource-group litree-prod-rg --query "identity.principalId" -o tsv)

# Grant Key Vault access
az keyvault set-policy --name EverythingHomebase-kv --object-id $principalId --secret-permissions get list
```

- [ ] Managed Identity assigned to Function App
- [ ] Key Vault access policies configured

### Add App Settings with Key Vault References
```powershell
az functionapp config appsettings set --name EverythingHomebase-func --resource-group litree-prod-rg --settings `
  "COSMOS_ENDPOINT=@Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=COSMOS-ENDPOINT)" `
  "SIGNALR_CONN=@Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=SIGNALR-CONN)" `
  "GROK_API_KEY=@Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=GROK-API-KEY)"
```

- [ ] App settings configured with Key Vault references

## 📁 Phase 5: Update Function Code

- [ ] Review `functions/GrokChat/index.js` (already created)
- [ ] Review `functions/GrokChat/function.json` (already created)
- [ ] Update `functions/package.json` to include `node-fetch` if not already present:
  ```json
  {
    "name": "azure-functions-app",
    "version": "1.0.0",
    "dependencies": {
      "azure-functions": "^1.0.0",
      "node-fetch": "^2.6.0"
    }
  }
  ```

- [ ] Function code ready for deployment

## 🚀 Phase 6: Deploy Function App

```powershell
# Option 1: Using Azure Functions Core Tools (CLI)
cd 'e:\VSCode\HomeBase 2.0\functions'
func azure functionapp publish EverythingHomebase-func

# Option 2: Using VS Code
# - Install Azure Functions extension
# - Open Command Palette (Ctrl+Shift+P)
# - Search "Deploy to Function App"
# - Select "EverythingHomebase-func"
```

- [ ] Function code deployed to Azure
- [ ] No deployment errors

## ✨ Phase 7: Test the Integration

### Local Testing
```powershell
# Set environment variable (Windows PowerShell)
$env:GROK_API_KEY = "xai_your_test_key_here"

# Start local Functions runtime
cd 'e:\VSCode\HomeBase 2.0\functions'
func start

# In another PowerShell window, test:
$response = Invoke-WebRequest -Uri "http://localhost:7071/api/grok-chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query": "What is the capital of France?"}'

$response.Content | ConvertFrom-Json | Format-List
```

- [ ] Local function runs without errors
- [ ] Local test returns valid Grok response

### Cloud Testing
```powershell
# Get function URL and code
$funcUrl = (az functionapp function show --name EverythingHomebase-func --function-name GrokChat --resource-group litree-prod-rg --query "invokeUrlTemplate" -o tsv)
$code = (az functionapp keys list --name EverythingHomebase-func --resource-group litree-prod-rg --query "functionKeys.default" -o tsv)

# Test cloud function
$response = Invoke-WebRequest -Uri "$funcUrl`?code=$code" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query": "Tell me about xAI Grok"}'

$response.Content | ConvertFrom-Json | Format-List
```

- [ ] Cloud function accessible via URL
- [ ] Cloud function returns valid Grok response
- [ ] No authentication errors

## 📊 Phase 8: Monitor & Debug

### Check Application Insights
- [ ] Go to Azure Portal → Resource Group → Application Insights instance
- [ ] View recent requests and failures
- [ ] Check for any error patterns

### Verify Key Vault Access
```powershell
# Test if Function App can read secrets
az keyvault secret show --vault-name EverythingHomebase-kv --name GROK-API-KEY --query "value" -o tsv
```

- [ ] Function App can access Key Vault secrets
- [ ] No access denied errors

### Check Logs
```powershell
# Stream Function App logs in real-time
az functionapp log tail --name EverythingHomebase-func --resource-group litree-prod-rg
```

- [ ] Logs show successful Grok API calls
- [ ] No errors or rate limit warnings

## 🌐 Phase 9: Integrate with Web App (Optional)

### Update Next.js Backend
- [ ] Create API route in `apps/web/pages/api/grok.js`
- [ ] Fetch from Function App endpoint
- [ ] Return Grok responses to frontend

### Frontend Integration
- [ ] Add UI component for Grok queries
- [ ] Display Grok responses with streaming
- [ ] Add error handling for API failures

- [ ] Web app successfully calls Grok function
- [ ] Responses displayed in UI

## 🔒 Phase 10: Security Review

- [ ] No API keys hardcoded in source code
- [ ] `.env` files not committed to Git
- [ ] Key Vault secrets use hyphens (no underscores)
- [ ] Managed Identity used (no connection strings in code)
- [ ] Function App has minimal Key Vault permissions
- [ ] SignalR and Cosmos DB connections secured

- [ ] All security checks passed

## 📚 Documentation & Next Steps

- [ ] Read full guide: `GROK_INTEGRATION_GUIDE.md`
- [ ] Review bootstrap script updates: `litree-homebase-master-bootstrap.ps1`
- [ ] Save API keys securely (password manager, etc.)
- [ ] Document any custom Grok models or parameters used
- [ ] Set up CI/CD for automatic Function App deployments

---

## Quick Reference: Service Details

### Azure Resources Created
| Service | Name | Region | Status |
|---------|------|--------|--------|
| Resource Group | litree-prod-rg | eastus2 | ✅ Active |
| Cosmos DB | everythinghomebasecosmos | eastus2 | ✅ Active |
| SignalR | EverythingHomebase-signalr | eastus2 | ✅ Active |
| Storage | everythinghomebase4331 | eastus2 | ✅ Active |
| Function App | EverythingHomebase-func | eastus2 | ✅ Active |
| Key Vault | EverythingHomebase-kv | eastus2 | ✅ Active |

### Key Vault Secrets
| Secret Name | Value Source | Status |
|-------------|--------------|--------|
| COSMOS-ENDPOINT | Azure Portal (Cosmos DB URI) | ⏳ To Do |
| SIGNALR-CONN | Azure Portal (SignalR Connection String) | ⏳ To Do |
| GROK-API-KEY | console.x.ai | ⏳ To Do |

### xAI Grok API Reference
- **Base URL**: https://api.x.ai/v1
- **Model**: grok-4-fast-reasoning (2M context window)
- **Pricing**: $0.20 input / $0.50 output per M tokens
- **Rate Limits**: 480 req/min, 4M tokens/min
- **Docs**: https://docs.x.ai/docs/

---

**Created**: January 2, 2026
**Last Updated**: January 2, 2026
**Status**: Ready for Phase 2 (Credential Collection)

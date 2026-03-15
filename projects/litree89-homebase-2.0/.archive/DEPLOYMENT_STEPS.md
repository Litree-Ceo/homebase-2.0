# EverythingHomebase - Deployment Execution Steps

## Current Status

✅ **Infrastructure Templates Created**  
✅ **Deployment Scripts Ready**  
✅ **Function Code Configured**  
✅ **Documentation Complete**  

## Execute Deployment in This Order

### Phase 1: Key Vault Setup (Run in Windows PowerShell as Admin)

**Duration:** 2-5 minutes

```powershell
# Set execution policy temporarily
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Navigate to project directory
cd "e:\VSCode\HomeBase 2.0"

# Run Key Vault setup script
.\Setup-KeyVaultSecrets.ps1 `
  -SubscriptionId "0f95fc53-20dc-4c0d-8f76-0108222d5fb1" `
  -ResourceGroup "litree-prod-rg" `
  -KeyVaultName "EverythingHomebase-kv" `
  -FunctionAppName "EverythingHomebase-func"
```

**When prompted, provide:**
- SignalR connection string (or press Enter for placeholder)
- Grok API key (or press Enter for placeholder)

**Expected Output:**
```
[✓] Connected to Azure subscription
[✓] Key Vault exists or will be created
[✓] COSMOS-ENDPOINT set
[✓] SIGNALR-CONN set
[✓] GROK-API-KEY set
[✓] Function App identity enabled
[✓] Key Vault access granted
[✓] Function App settings updated
```

### Phase 2: Infrastructure Deployment (Run in Windows PowerShell as Admin)

**Duration:** 5-10 minutes

```powershell
# Set execution policy temporarily
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Navigate to project directory
cd "e:\VSCode\HomeBase 2.0"

# PREVIEW deployment (optional, recommended)
.\Deploy-Infrastructure.ps1 `
  -SubscriptionId "0f95fc53-20dc-4c0d-8f76-0108222d5fb1" `
  -WhatIf

# Deploy infrastructure
.\Deploy-Infrastructure.ps1 `
  -SubscriptionId "0f95fc53-20dc-4c0d-8f76-0108222d5fb1" `
  -ResourceGroup "litree-prod-rg" `
  -Location "eastus2"
```

**Expected Deployment Resources:**
- Function App (EverythingHomebase-func)
- App Service Plan (EverythingHomebase-plan) - Y1 Dynamic
- Key Vault (EverythingHomebase-kv) - with secrets
- Application Insights (EverythingHomebase-insights)
- Log Analytics Workspace (log-baseline01)
- Storage Account (everythingbasestor)

**Expected Output:**
```
[✓] Deployment successful
[✓] Function App: EverythingHomebase-func
[✓] Application Insights: EverythingHomebase-insights
[✓] Log Analytics: log-baseline01
[✓] Key Vault: EverythingBasebase-kv
```

### Phase 3: Deploy Function Code (Run in Windows PowerShell or CMD)

**Duration:** 3-5 minutes

#### Option A: Test Locally First

```powershell
cd "e:\VSCode\HomeBase 2.0\functions"

# Install dependencies
npm install

# Start local Function runtime
func start

# Function will start on: http://localhost:7071/api/grok-chat
```

#### Option B: Deploy to Azure Directly

```powershell
cd "e:\VSCode\HomeBase 2.0\functions"

# Install dependencies (if not already installed)
npm install

# Deploy to Azure Function App
func azure functionapp publish EverythingHomebase-func --build remote

# Alternative: Using npm script
npm run publish
```

**Expected Output:**
```
[+] Publishing to EverythingHomebase-func...
[✓] Functions in EverythingHomebase-func:
    GrokChat - [POST,GET] http://EverythingHomebase-func.azurewebsites.net/api/grok-chat
[✓] Deployment successful
```

### Phase 4: Test the Function (Run in Windows PowerShell)

**Duration:** 2-3 minutes

#### Local Testing (if running `func start`)

```powershell
# Test the local function
$body = @{
  query = "What is the capital of France?"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "http://localhost:7071/api/grok-chat" `
  -Method POST `
  -Body $body `
  -Headers @{"Content-Type"="application/json"}

$response.Content | ConvertFrom-Json | ForEach-Object {
  Write-Host "Query: $($_.query)"
  Write-Host "Result: $($_.result)"
  Write-Host "Model: $($_.model)"
  Write-Host "Tokens: $($_.usage.total_tokens)"
}
```

#### Azure Testing (after deployment)

```powershell
# Get Function App URL and key
$functionApp = az functionapp show `
  --name EverythingHomebase-func `
  --resource-group litree-prod-rg `
  --query "defaultHostName" -o tsv

$functionKey = az functionapp keys list `
  --name EverythingHomebase-func `
  --resource-group litree-prod-rg `
  --query "functionKeys[0].value" -o tsv

$functionUrl = "https://$functionApp/api/grok-chat?code=$functionKey"

# Test the function
$body = @{
  query = "Explain quantum computing in simple terms"
  max_tokens = 200
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri $functionUrl `
  -Method POST `
  -Body $body `
  -Headers @{"Content-Type"="application/json"} `
  -UseBasicParsing

$result = $response.Content | ConvertFrom-Json
Write-Host "Status: $($response.StatusCode)"
Write-Host "Query: $($result.query)"
Write-Host "Response: $($result.result)" -ForegroundColor Green
Write-Host "Tokens Used: $($result.usage.total_tokens)"
```

#### More Advanced Tests

```powershell
# Test with custom model
$body = @{
  query = "What is machine learning?"
  model = "grok-2"
  temperature = 0.3
} | ConvertTo-Json

Invoke-WebRequest -Uri $functionUrl -Method POST -Body $body -Headers @{"Content-Type"="application/json"} -UseBasicParsing

# Test error handling - missing query
$body = @{} | ConvertTo-Json
Invoke-WebRequest -Uri $functionUrl -Method POST -Body $body -Headers @{"Content-Type"="application/json"} -UseBasicParsing 2>&1

# Test with system prompt
$body = @{
  query = "Who created you?"
  system = "You are an AI assistant created by xAI."
} | ConvertTo-Json

Invoke-WebRequest -Uri $functionUrl -Method POST -Body $body -Headers @{"Content-Type"="application/json"} -UseBasicParsing
```

## Verification Steps After Deployment

### 1. Verify Key Vault Secrets

```powershell
# List all secrets
az keyvault secret list --vault-name EverythingHomebase-kv --query "[].name" -o table

# Verify each secret exists (shows ID only, not value for security)
az keyvault secret show --vault-name EverythingHomebase-kv --name COSMOS-ENDPOINT --query "id"
az keyvault secret show --vault-name EverythingHomebase-kv --name SIGNALR-CONN --query "id"
az keyvault secret show --vault-name EverythingHomebase-kv --name GROK-API-KEY --query "id"
```

### 2. Verify Function App Configuration

```powershell
# Check app settings
az functionapp config appsettings list `
  --name EverythingHomebase-func `
  --resource-group litree-prod-rg | ConvertFrom-Json | ForEach-Object {
    $_.name + " = " + $_.value
}

# Check managed identity
az functionapp identity show `
  --name EverythingHomebase-func `
  --resource-group litree-prod-rg

# Check function details
az functionapp show `
  --name EverythingHomebase-func `
  --resource-group litree-prod-rg | ConvertFrom-Json | Select-Object `
  name, state, defaultHostName, @{N="Identity";E={$_.identity.principalId}}
```

### 3. Verify Application Insights Integration

```powershell
# Check Application Insights
az monitor app-insights component show `
  --name EverythingBasebase-insights `
  --resource-group litree-prod-rg

# Check Log Analytics workspace
az monitor log-analytics workspace show `
  --name log-baseline01 `
  --resource-group litree-prod-rg
```

### 4. Monitor Logs in Azure Portal

1. Navigate to: https://portal.azure.com
2. Find Function App: **EverythingBasebase-func**
3. Click: **Monitor** → **Live Metrics Stream**
4. Perform a test query and watch metrics in real-time

### 5. Query Application Insights

```powershell
# View recent requests
az monitor app-insights metrics get `
  --name EverythingBasebase-insights `
  --resource-group litree-prod-rg `
  --metric "requests/count" `
  --interval PT1M `
  --aggregation total

# View server exceptions
az monitor app-insights metrics get `
  --name EverythingBasebase-insights `
  --resource-group litree-prod-rg `
  --metric "server/exceptions" `
  --interval PT5M `
  --aggregation total
```

## Troubleshooting During Deployment

### If Script Fails at Step 1 (Key Vault Setup)

```powershell
# Check Azure authentication
az account show

# Check if logged in with correct account
az account list --query "[].{name: name, id: id, tenantId: tenantId}" -o table

# Re-authenticate if needed
az login
az account set --subscription "0f95fc53-20dc-4c0d-8f76-0108222d5fb1"

# Verify resource group exists
az group show --name litree-prod-rg
```

### If Function Deployment Fails

```powershell
# Check Function App runtime
az functionapp show --name EverythingBasebase-func --resource-group litree-prod-rg --query "{state: state, runtimeVersion: functionAppVersion}"

# Check deployment logs
az functionapp deployment log show `
  --name EverythingBasebase-func `
  --resource-group litree-prod-rg `
  --slot production | head -50

# Check if Node.js is available
func --version
node --version
npm --version
```

### If Function Returns 500 Error

```powershell
# Check Function App logs in real-time
az functionapp log tail `
  --name EverythingBasebase-func `
  --resource-group litree-prod-rg `
  --provider "Function App"

# Verify secrets can be accessed
$funcIdentity = az functionapp identity show `
  --name EverythingBasebase-func `
  --resource-group litree-prod-rg `
  --query "principalId" -o tsv

az keyvault show `
  --name EverythingBasebase-kv `
  --resource-group litree-prod-rg `
  --query "properties.accessPolicies[?objectId=='$funcIdentity']"
```

## Post-Deployment Configuration

### 1. Set Up Email Alerts (Optional)

```powershell
# Create email action group
az monitor action-group create `
  --name "EverythingHomebase-email" `
  --resource-group litree-prod-rg `
  --short-name "Email"

# Add email address
az monitor action-group update `
  --name "EverythingHomebase-email" `
  --resource-group litree-prod-rg `
  --add-action email SendToAdmin --email-receiver admin@example.com
```

### 2. Configure Rate Limiting (Optional)

Add to `functions/GrokChat/index.js`:
```javascript
// Rate limiting per IP
const rateLimitMap = new Map();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60000; // 1 minute

function checkRateLimit(clientIp) {
  const now = Date.now();
  const data = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + WINDOW_MS };
  
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + WINDOW_MS;
  } else {
    data.count++;
  }
  
  rateLimitMap.set(clientIp, data);
  return data.count <= MAX_REQUESTS;
}
```

### 3. Enable Application Insights Sampling (Optional)

```powershell
az monitor app-insights app-insights component update `
  --app EverythingBasebase-insights `
  --resource-group litree-prod-rg `
  --daily-data-cap-status Enabled `
  --daily-data-cap 50  # GB per day
```

## Security Hardening (Post-Deployment)

### 1. Enable IP Restrictions

```powershell
# Restrict Function App to specific IPs (example)
az functionapp config access-restriction add `
  --name EverythingBasebase-func `
  --resource-group litree-prod-rg `
  --rule-name "AllowOfficeIP" `
  --action Allow `
  --ip-address "203.0.113.0/24"
```

### 2. Rotate Grok API Key Regularly

```powershell
# Update in Key Vault
$newGrokKey = "xai_new_key_here"
az keyvault secret set `
  --vault-name EverythingBasebase-kv `
  --name "GROK-API-KEY" `
  --value $newGrokKey
```

### 3. Enable Key Vault Audit Logging

```powershell
# Enable diagnostic settings for Key Vault
$workspace = az monitor log-analytics workspace show `
  --name log-baseline01 `
  --resource-group litree-prod-rg `
  --query "id" -o tsv

az monitor diagnostic-settings create `
  --name "KeyVaultDiagnostics" `
  --resource "/subscriptions/0f95fc53-20dc-4c0d-8f76-0108222d5fb1/resourceGroups/litree-prod-rg/providers/Microsoft.KeyVault/vaults/EverythingBasebase-kv" `
  --workspace $workspace `
  --logs '[{"category": "AuditEvent", "enabled": true}]'
```

### Phase 5: Frontend Deployment (Vercel)

**Duration:** 2-3 minutes

This phase deploys the Next.js frontend to Vercel. The monorepo configuration in `vercel.json` and the root `package.json` handle the pnpm workspace setup automatically.

#### 1. Install Vercel CLI
```powershell
pnpm add -g vercel
```

#### 2. Initialize and Link
Run this in the root directory:
```powershell
vercel
```
- **Set up and deploy?** Yes
- **Which scope?** [Your Scope]
- **Link to existing project?** No
- **Project Name:** `homebase-2-0`
- **Root Directory:** `./` (The `vercel.json` in the root will manage the build)

#### 3. Configure Environment Variables
Add these in the Vercel Dashboard (Settings > Environment Variables) or via CLI:

**Firebase Configuration:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

**API Configuration (if using external backend):**
- `NEXT_PUBLIC_API_URL` (e.g., your Azure Container App URL)

#### 4. Production Deployment
```powershell
vercel --prod
```

## Success Checklist

- [ ] Key Vault secrets set (COSMOS-ENDPOINT, SIGNALR-CONN, GROK-API-KEY)
- [ ] Function App identity enabled and has Key Vault access
- [ ] Infrastructure deployed (all resources visible in Azure Portal)
- [ ] Function code deployed and reachable
- [ ] Test query returns successful response
- [ ] Application Insights showing metrics
- [ ] Log Analytics receiving logs
- [ ] No 500 errors in Function App logs
- [ ] Alerts configured and ready
- [ ] Documentation reviewed by team

---

## Ready to Deploy?

**Start with Phase 1:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd "e:\VSCode\HomeBase 2.0"
.\Setup-KeyVaultSecrets.ps1
```

**Then proceed to Phase 2, 3, 4, and 5 in order.**

For detailed information, see:
- [FUNCTION_APP_SETUP_SUMMARY.md](FUNCTION_APP_SETUP_SUMMARY.md)
- [FUNCTION_APP_DEPLOYMENT_GUIDE.md](FUNCTION_APP_DEPLOYMENT_GUIDE.md)


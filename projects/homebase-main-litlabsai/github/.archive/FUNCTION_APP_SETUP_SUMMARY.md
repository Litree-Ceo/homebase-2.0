# EverythingHomebase - Azure Function App Setup Summary

**Date Created:** January 2, 2026  
**Status:** ✅ Ready for Deployment  
**Deployment Region:** eastus2  
**Resource Group:** litree-prod-rg  

---

## 📋 Complete Setup Overview

This document summarizes the complete Azure infrastructure setup for the EverythingHomebase Function App with Grok integration.

### Core Components Configured

| Component | Name | Purpose |
|-----------|------|---------|
| **Function App** | EverythingHomebase-func | Azure serverless compute for Grok API integration |
| **Key Vault** | EverythingHomebase-kv | Secrets management (COSMOS-ENDPOINT, SIGNALR-CONN, GROK-API-KEY) |
| **Application Insights** | EverythingHomebase-insights | Performance monitoring and diagnostics |
| **Log Analytics** | log-baseline01 | Centralized logging and analytics |
| **Storage Account** | everythingbasestor | Function App runtime storage |
| **App Service Plan** | EverythingHomebase-plan | Dynamic serverless compute tier (Y1) |

---

## 🔐 Key Vault Secrets Configuration

### Secrets Configured

```
COSMOS-ENDPOINT
├─ Value: https://everythinghomebasecosmos.documents.azure.com:443/
├─ Purpose: Cosmos DB connection endpoint
└─ Used by: Function App (COSMOS_ENDPOINT env var)

SIGNALR-CONN
├─ Value: Endpoint=https://EverythingHomebase-signalr.service.signalr.net;...
├─ Purpose: Azure SignalR Service connection
└─ Used by: Function App (SIGNALR_CONN env var)

GROK-API-KEY
├─ Value: xai_[your_api_key]
├─ Purpose: xAI Grok API authentication
└─ Used by: Function App (GROK_API_KEY env var)
```

### Key Vault Access Control

- **Authentication:** Managed Identity (system-assigned)
- **Function App Principal ID:** Retrieved and configured automatically
- **Permissions Granted:** 
  - `get` - Retrieve secret values
  - `list` - List available secrets
- **Access Policy:** Least-privilege model

---

## 🔧 Function App Configuration

### System-Managed Identity

✅ **Status:** Enabled  
**Principal ID:** Automatically assigned at runtime  
**Benefits:**
- No credentials to manage
- Automatic Azure AD token refresh
- Audit trail in Azure Activity Log
- Can be revoked immediately if compromised

### Application Settings (with Key Vault References)

```
COSMOS_ENDPOINT = @Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=COSMOS-ENDPOINT)
SIGNALR_CONN = @Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=SIGNALR-CONN)
GROK_API_KEY = @Microsoft.KeyVault(VaultName=EverythingHomebase-kv;SecretName=GROK-API-KEY)
APPINSIGHTS_INSTRUMENTATIONKEY = [auto-configured]
APPLICATIONINSIGHTS_CONNECTION_STRING = [auto-configured]
FUNCTIONS_EXTENSION_VERSION = ~4
FUNCTIONS_WORKER_RUNTIME = node
NODE_ENV = production
```

### Runtime Environment

- **Runtime:** Node.js 18+
- **Functions Version:** v4
- **Storage:** Azure Storage Account (everythingbasestor)
- **HTTPS:** Required (enabled by default)

---

## 📊 Monitoring & Diagnostics

### Application Insights Integration

**Purpose:** Real-time monitoring of Function App performance  
**Metrics Collected:**
- Request count and duration
- Success and failure rates
- Server exceptions
- Performance counters
- Custom telemetry from function code

**Smart Detection Features:**
- Anomaly detection (automatic)
- Failure rate spikes
- Performance degradation
- Memory leaks
- Unusual patterns

### Log Analytics Integration

**Purpose:** Long-term logging and advanced analytics  
**Data Collected:**
- Application traces
- HTTP logs
- Performance metrics
- Custom KQL queries supported

**Retention:** 30 days (configurable)  
**Logs Exported from:** Application Insights

### Action Groups & Alerts

**Action Group:** EverythingHomebase-action-group  
**Configured Alerts:**
- High error rates (>5 errors in 15 minutes)
- Performance degradation
- Authentication failures
- Rate limit exceeded (429)

---

## 🚀 Function App Details

### GrokChat Function Endpoint

**Endpoint:** `/api/grok-chat`  
**Methods:** POST, GET  
**Route:** `/api/grok-chat`  
**Authentication:** Function Key required

### Function Code Features

```javascript
✅ Query parameter validation
✅ Grok API error handling
✅ Rate limit detection (429)
✅ Authentication failure handling (401)
✅ Token usage tracking
✅ Comprehensive logging
✅ Timeout protection (30 seconds)
✅ Environment variable validation
```

### Request/Response Format

**Request:**
```json
{
  "query": "Your question here",
  "model": "grok-4-fast-reasoning",
  "max_tokens": 1024,
  "temperature": 0.7,
  "system": "You are a helpful assistant"
}
```

**Success Response:**
```json
{
  "success": true,
  "query": "Your question here",
  "result": "Grok's response...",
  "model": "grok-4-fast-reasoning",
  "usage": {
    "input_tokens": 50,
    "output_tokens": 250,
    "total_tokens": 300
  },
  "timestamp": "2026-01-02T12:34:56.789Z"
}
```

---

## 📁 Deployment Files Created

### PowerShell Scripts

| File | Purpose | Location |
|------|---------|----------|
| `Setup-KeyVaultSecrets.ps1` | Interactive setup for Key Vault secrets | Root directory |
| `Deploy-Infrastructure.ps1` | Deploy Bicep template to Azure | Root directory |
| `Run-Setup.bat` | Batch wrapper for automated execution | Root directory |

### Bicep Infrastructure-as-Code

| File | Purpose | Location |
|------|---------|----------|
| `infrastructure-function-app.bicep` | Complete infrastructure definition | Root directory |
| `infrastructure-function-app.parameters.json` | Parameter values for deployment | Root directory |

### Documentation

| File | Purpose | Location |
|------|---------|----------|
| `FUNCTION_APP_DEPLOYMENT_GUIDE.md` | Complete deployment guide | Root directory |
| `FUNCTION_APP_SETUP_SUMMARY.md` | This summary document | Root directory |

### Function Code

| File | Purpose | Location |
|------|---------|----------|
| `functions/GrokChat/index.js` | Main function handler with Grok integration | functions/GrokChat/ |
| `functions/GrokChat/function.json` | Function metadata and bindings | functions/GrokChat/ |
| `functions/package.json` | Node.js dependencies | functions/ |

---

## 🛠️ Quick Start Guide

### Step 1: Prepare Credentials (5 min)

Gather these values before running setup:
- **Grok API Key**: Get from https://console.x.ai/
- **SignalR Connection String**: From Azure Portal or deployment
- **Cosmos DB Endpoint**: From Azure Cosmos DB resource

### Step 2: Run Setup Script (2-3 min)

**Windows PowerShell (as Administrator):**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd "e:\VSCode\HomeBase 2.0"
.\Setup-KeyVaultSecrets.ps1
```

**Or use the batch wrapper:**
```cmd
Run-Setup.bat
```

### Step 3: Deploy Infrastructure (5-10 min)

**Windows PowerShell:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Deploy-Infrastructure.ps1
```

**Preview before deploying:**
```powershell
.\Deploy-Infrastructure.ps1 -WhatIf
```

### Step 4: Deploy Function Code (3-5 min)

**Option A - Local Development:**
```powershell
cd functions
npm install
func start
```

**Option B - Deploy to Azure:**
```powershell
cd functions
npm install
func azure functionapp publish EverythingHomebase-func --build remote
```

### Step 5: Test the Function (2 min)

**Local Testing:**
```powershell
$body = @{query = "What is 2+2?"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:7071/api/grok-chat" `
  -Method POST `
  -Body $body `
  -Headers @{"Content-Type"="application/json"}
```

**Azure Testing:**
```powershell
$functionUrl = "https://EverythingHomebase-func.azurewebsites.net/api/grok-chat?code=[FUNCTION_KEY]"
$body = @{query = "What is 2+2?"} | ConvertTo-Json
Invoke-WebRequest -Uri $functionUrl -Method POST -Body $body -Headers @{"Content-Type"="application/json"}
```

---

## ✅ Security Checklist

- [x] Secrets stored in Key Vault (not in code/config)
- [x] Managed Identity enabled (no stored credentials)
- [x] Function App HTTPS only
- [x] Least-privilege Key Vault access (get/list only)
- [x] Application Insights monitoring enabled
- [x] Smart Detection alerts configured
- [x] TLS 1.2 minimum enforced
- [x] Storage Account secure transfer required

### Recommended Additional Steps

- [ ] Configure IP restrictions on Function App
- [ ] Enable Key Vault audit logging
- [ ] Set up email notifications for alerts
- [ ] Implement API rate limiting
- [ ] Enable Application Insights sampling
- [ ] Configure custom health checks
- [ ] Set up automated backups for Key Vault

---

## 📈 Expected Metrics

After deployment, monitor these metrics in Application Insights:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **Availability** | 99.9% | < 99% |
| **Avg Response Time** | < 500ms | > 2000ms |
| **Error Rate** | < 0.1% | > 1% |
| **Server Exceptions** | 0 | > 5 in 15min |
| **Failed Requests** | 0 | > 10 in 1h |

---

## 🔍 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| **GROK_API_KEY not found** | Verify Key Vault access policy for Function App identity |
| **401 Unauthorized** | Check Grok API key is valid and set in Key Vault |
| **429 Rate Limited** | Implement exponential backoff in client code |
| **Function timeout** | Increase timeout in App Service settings (default: 600s) |
| **High latency** | Check Grok API response times in Application Insights |
| **Cold start issues** | Use Premium plan or App Service Environment for warm instances |

See [FUNCTION_APP_DEPLOYMENT_GUIDE.md](FUNCTION_APP_DEPLOYMENT_GUIDE.md#troubleshooting) for detailed troubleshooting.

---

## 📞 Support & Next Steps

### Documentation References
1. [FUNCTION_APP_DEPLOYMENT_GUIDE.md](FUNCTION_APP_DEPLOYMENT_GUIDE.md) - Complete deployment guide
2. [infrastructure-function-app.bicep](infrastructure-function-app.bicep) - Infrastructure code
3. [functions/GrokChat/index.js](functions/GrokChat/index.js) - Function implementation
4. [ENV_CONFIGURATION.md](ENV_CONFIGURATION.md) - Environment setup

### Azure Resources
- Azure Portal: https://portal.azure.com
- Function App: https://portal.azure.com/#@/resource/subscriptions/0f95fc53-20dc-4c0d-8f76-0108222d5fb1/resourceGroups/litree-prod-rg/providers/Microsoft.Web/sites/EverythingHomebase-func
- Key Vault: https://portal.azure.com/#@/resource/subscriptions/0f95fc53-20dc-4c0d-8f76-0108222d5fb1/resourceGroups/litree-prod-rg/providers/Microsoft.KeyVault/vaults/EverythingHomebase-kv

### External APIs
- Grok API: https://console.x.ai/
- Azure Documentation: https://docs.microsoft.com/azure/

---

## 📝 Deployment Checklist

- [ ] Credentials collected (Grok API key, SignalR connection string)
- [ ] Setup script executed (`Setup-KeyVaultSecrets.ps1`)
- [ ] Secrets verified in Key Vault
- [ ] Infrastructure deployed (`Deploy-Infrastructure.ps1`)
- [ ] Function code deployed (`func publish` or local testing)
- [ ] Function endpoint tested
- [ ] Application Insights monitoring verified
- [ ] Alerts configured and tested
- [ ] Documentation reviewed
- [ ] Team notified of deployment

---

**Last Updated:** January 2, 2026  
**Status:** ✅ Ready to Deploy  
**Next Action:** Execute `Setup-KeyVaultSecrets.ps1` in Windows PowerShell


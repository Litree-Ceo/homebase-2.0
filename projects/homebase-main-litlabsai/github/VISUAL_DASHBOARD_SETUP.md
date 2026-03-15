# 🎨 Visual Dashboard & Live Monitoring Setup

## ✅ Complete Setup for Azure Visuals & Live Views

### **1. Install Essential Extensions** (Auto-Install)

Run in terminal:
```powershell
# Azure Monitoring & Insights
code --install-extension ms-azuretools.vscode-azuremonitor
code --install-extension ms-azuretools.azure-cosmos-db
code --install-extension ms-azuretools.vscode-azurecontainerapps
code --install-extension ms-azuretools.vscode-azurefunctions
code --install-extension ms-azuretools.vscode-azurecli

# Development Experience
code --install-extension ms-vscode-remote.remote-containers
code --install-extension eamodio.gitlens
code --install-extension ms-azuretools.vscode-docker
code --install-extension humao.rest-client

# Utilities
code --install-extension ms-vscode.powershell
code --install-extension esbenp.prettier-vscode
code --install-extension ms-azuretools.azure-account
```

### **2. Live Monitoring Commands**

#### **Azure Monitor - Real-time Logs**
```powershell
# View Container App logs
az containerapp logs show --name homebase-web --resource-group homebase-rg --follow

# View Application Insights
az monitor app-insights metrics show --resource-group homebase-rg --app homebase-insights --metric "requests/count"

# Stream live traces
az monitor app-insights metrics show --resource-group homebase-rg --app homebase-insights --metric "exceptions/count" --aggregation "count"
```

#### **Cosmos DB Live Explorer**
In VS Code:
1. Open Azure Extension (Left sidebar)
2. Sign in with Azure Account
3. Navigate: **Azure → Databases → Cosmos DB**
4. Right-click your database → **Open in Portal**
5. Real-time data explorer opens

### **3. VS Code Dashboard Views**

#### **Terminal Panel Setup**
Create multiple terminals for live monitoring:

```powershell
# Terminal 1: Frontend (Port 3000)
pnpm -C apps/web dev

# Terminal 2: API (Port 7071)
pnpm -C api start

# Terminal 3: Azure Monitor (Auto-refresh logs)
az containerapp logs show --name homebase-web --resource-group homebase-rg --follow

# Terminal 4: Metrics Watcher
while($true) { 
  az monitor app-insights metrics show --resource-group homebase-rg --app homebase-insights --metric "requests/count"
  Start-Sleep -Seconds 30
}
```

### **4. Azure Portal Dashboards**

#### **Quick Access Links**
- **Container Apps Dashboard**: https://portal.azure.com/#@outlook.com/resource/subscriptions/YOUR-SUB-ID/resourceGroups/homebase-rg/providers/Microsoft.App/containerApps/homebase-web
- **Application Insights**: https://portal.azure.com/#@outlook.com/resource/subscriptions/YOUR-SUB-ID/resourceGroups/homebase-rg/providers/Microsoft.Insights/components/homebase-insights
- **Cosmos DB Explorer**: https://portal.azure.com/#@outlook.com/resource/subscriptions/YOUR-SUB-ID/resourceGroups/homebase-rg/providers/Microsoft.DocumentDB/databaseAccounts/homebase-cosmos
- **GitHub Actions**: https://github.com/LiTree89/HomeBase-2.0/actions

### **5. VS Code Built-in Views**

#### **Open These Views** (Ctrl+Shift+P)

1. **Explorer View** (Ctrl+Shift+E)
   - See file structure
   - Built-in Git integration

2. **Run & Debug** (Ctrl+Shift+D)
   - Set breakpoints
   - Debug API and Frontend
   - Click "Run and Debug" → Select configuration

3. **Source Control** (Ctrl+Shift+G)
   - View uncommitted changes
   - Stage files
   - Commit with live diff preview

4. **Testing** (Ctrl+Shift+T)
   - Run unit tests
   - View coverage
   - Live test results

5. **Search** (Ctrl+Shift+F)
   - Search across all files
   - Replace patterns
   - Live file preview on hover

6. **Extensions** (Ctrl+Shift+X)
   - Manage installed extensions
   - Enable/disable by workspace

### **6. Performance Monitoring**

#### **VS Code Built-in**
- **View → Command Palette → "Developer: Open Perf Monitor"**
  - CPU usage
  - Memory consumption
  - Extension impact

#### **Terminal Metrics**
```powershell
# Watch API performance
while($true) {
  $proc = Get-Process -Name "node" -ErrorAction SilentlyContinue
  if ($proc) {
    Write-Host "API Memory: $([math]::Round($proc.WorkingSet / 1MB)) MB"
  }
  Start-Sleep -Seconds 5
}
```

### **7. Live Port Monitoring**

```powershell
# Watch all Node processes
$watcher = {
  while($true) {
    Clear-Host
    Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object Name, Id, @{Name="Memory (MB)";Expression={[math]::Round($_.WorkingSet / 1MB)}} | Format-Table
    Start-Sleep -Seconds 3
  }
}

# Run in background terminal
powershell -NoExit -Command $watcher
```

### **8. REST API Testing (Built-in)**

Create `test-api.http`:
```http
### Get Health Status
GET http://localhost:7071/api/health

### Get Bots Status
GET http://localhost:7071/api/bot-api

### Create Test Bot
POST http://localhost:7071/api/bot-api
Content-Type: application/json

{
  "name": "Test Bot",
  "strategy": "price-alert",
  "coins": ["bitcoin", "ethereum"]
}
```

Then in VS Code: Right-click → "Send Request" to see live responses

### **9. Database Visual Explorer**

#### **Cosmos DB in VS Code**
1. Open Azure Explorer (Left Sidebar)
2. Click "Databases"
3. Find "homebase-cosmos"
4. Expand → Right-click container → "Open Document Editor"
5. Visual data explorer with query support

#### **Query from Terminal**
```powershell
# Query Cosmos DB
az cosmosdb sql query -a homebase-cosmos -d litlab -c users -q "SELECT * FROM c LIMIT 10" -r homebase-rg
```

### **10. GitHub Actions Live Monitoring**

```powershell
# Watch workflow runs
while($true) {
  gh run list --repo LiTree89/HomeBase-2.0 --limit 5
  Start-Sleep -Seconds 30
}

# Stream logs from latest run
gh run view --repo LiTree89/HomeBase-2.0 --log
```

---

## 🎯 Quick Start (Copy & Paste)

### **Install All Extensions at Once**
```powershell
$extensions = @(
  "ms-azuretools.vscode-azuremonitor",
  "ms-azuretools.azure-cosmos-db",
  "ms-vscode-remote.remote-containers",
  "eamodio.gitlens",
  "ms-azuretools.vscode-docker",
  "ms-azuretools.vscode-azurecontainerapps",
  "ms-azuretools.vscode-azurefunctions",
  "humao.rest-client",
  "ms-azuretools.azure-account",
  "ms-vscode.powershell",
  "esbenp.prettier-vscode"
)

$extensions | ForEach-Object {
  Write-Host "📦 Installing $_..."
  code --install-extension $_
}

Write-Host "✅ All extensions installed! Reload VS Code now." -ForegroundColor Green
```

### **Launch Full Monitoring Stack**
```powershell
# Terminal 1 - Frontend
Start-Process powershell -ArgumentList "-NoExit -Command", "cd 'E:\VSCode\HomeBase 2.0' ; pnpm -C apps/web dev"

# Terminal 2 - API
Start-Process powershell -ArgumentList "-NoExit -Command", "cd 'E:\VSCode\HomeBase 2.0' ; pnpm -C api start"

# Terminal 3 - Azure Logs
Start-Process powershell -ArgumentList "-NoExit -Command", "az containerapp logs show --name homebase-web --resource-group homebase-rg --follow"

Write-Host "🎉 Multi-terminal monitoring started!" -ForegroundColor Green
```

---

## 📊 What You'll See

✅ **Real-time API logs** - Every request/response  
✅ **Live frontend output** - Hot-reload events  
✅ **Azure resource metrics** - CPU, memory, requests  
✅ **Database explorer** - Visual Cosmos DB management  
✅ **GitHub Actions** - Live deployment pipeline  
✅ **Performance graphs** - Resource utilization  
✅ **Debug breakpoints** - Step through code  
✅ **REST client** - Test endpoints live  

---

**Setup Time: ~5 minutes**  
**All features: Live & operational** ✅

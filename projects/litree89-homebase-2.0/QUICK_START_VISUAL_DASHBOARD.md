# 🎨 HomeBase 2.0 - Complete Visual & Monitoring Dashboard

> **Status**: ✅ All extensions installed | Ready for development

## 🚀 Quick Start (Right Now!)

### **1. Reload VS Code**
```
Ctrl+Shift+P → type "Reload Window" → Press Enter
```

### **2. Sign in to Azure** (Left Sidebar)
```
Click Azure Account icon → Sign in with your Azure account
```

### **3. Start the Full Stack** 
```
Ctrl+Shift+B → Select "LITLABS: Start Dev Environment"
```

Then watch the magic happen:
- **Terminal 1**: Frontend builds and starts on http://localhost:3000
- **Terminal 2**: API starts on http://localhost:7071
- **VS Code Left Sidebar**: Azure resources appear live

---

## 🎯 What You Can Do NOW

### **Test APIs in Real-Time** 
1. Open `api/test-live-api.http` in editor
2. Hover over any request
3. Click "Send Request" 
4. See instant live response ⚡

### **Debug with Breakpoints**
1. Press `F5` to start debugging
2. Select "Full Stack (API + Frontend)"
3. Set breakpoints in code
4. Step through execution

### **Live Azure Monitoring**
1. Left sidebar → Click **Azure** icon
2. Sign in to Azure
3. Expand your subscriptions
4. See real-time metrics and logs

### **Visual Git History**
1. Press `Ctrl+Shift+G` for Source Control
2. Click **GitLens** timeline on left
3. See commits with visual diffs
4. Blame annotations on each line

---

## 📊 Your Installed Extensions

| Category | Extensions |
|----------|-----------|
| **Azure** | Monitor • Cosmos DB • Container Apps • Functions • CLI • Account |
| **Dev Tools** | Remote Containers • GitLens • Docker • REST Client • Copilot |
| **Formatting** | Prettier • ESLint • PowerShell |
| **Themes** | Dracula Theme • vscode-icons |

---

## ⌨️ Most Useful Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` | Open Azure Explorer |
| `Ctrl+Shift+G` | Source Control (Git) |
| `Ctrl+Shift+D` | Debug view |
| `Ctrl+J` | Toggle terminal |
| `Ctrl+Shift+F` | Search all files |
| `Ctrl+Alt+R` | Send REST request (.http files) |
| `F5` | Start debugging |
| `Shift+Alt+F` | Format document |

---

## 🔗 Live Monitoring Views

### **Frontend Development**
```
http://localhost:3000
```
- Hot-reload on code changes
- Real-time TypeScript errors
- Network requests visible in DevTools

### **API Testing**
```
http://localhost:7071/api/health
http://localhost:7071/api/bot-api
http://localhost:7071/api/crypto
```
- See response times in REST client
- Test with different payloads
- View raw responses instantly

### **Azure Resources**
In VS Code left sidebar:
- **Container Apps** - Live deployment status
- **App Insights** - Real-time metrics
- **Cosmos DB** - Data explorer
- **Storage** - Blob browser

---

## 📁 Important Development Files

| File | Purpose |
|------|---------|
| `api/test-live-api.http` | REST API test suite (USE THIS!) |
| `.vscode/launch.json` | Debug configurations |
| `.vscode/extensions-setup.json` | Installed extensions list |
| `VISUAL_DASHBOARD_SETUP.md` | Complete setup guide |
| `api/package.json` | API dependencies |
| `apps/web/next.config.ts` | Frontend config |

---

## 🎨 What's Different Now

### ✅ Before
- Manual terminal switching
- No Azure integration
- No visual debugging
- Manual API testing with curl
- No live monitoring

### ✅ NOW (You)
- Integrated Azure Explorer
- Live resource monitoring
- Visual debugger (F5)
- One-click API testing
- Real-time logs & metrics
- Git blame annotations
- Performance monitoring
- Container insights

---

## 🚨 If Something Breaks

### **Port already in use?**
```powershell
# Kill any existing processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

### **Can't find Azure?**
```
Left Sidebar → Click Azure Account → Sign in
```

### **Extensions not loading?**
```
Ctrl+Shift+P → "Extensions: Show Recommended Extensions"
```

### **REST Client not working?**
```
Make sure api/test-live-api.http is open in editor
Hover over request → "Send Request" link appears
```

---

## 📈 Next Level Features

### **Performance Monitoring**
1. `Ctrl+Shift+P` → "Developer: Open Perf Monitor"
2. Watch CPU/Memory in real-time
3. See extension impact

### **Network Inspection**
1. Frontend: Press `F12` for DevTools
2. API: Check terminal output
3. REST Client: View headers & timing

### **Database Visual Explorer**
1. Left sidebar → Azure → Databases
2. Find homebase-cosmos
3. Right-click → "Open Document Editor"
4. Visual Cosmos DB browser appears

---

## 🎓 Learning Resources

- [VS Code Docs](https://code.visualstudio.com/docs)
- [Azure Tools Guide](https://learn.microsoft.com/en-us/azure/developer/javascript/)
- [Next.js Development](https://nextjs.org/docs)
- [Azure Functions v4](https://learn.microsoft.com/en-us/azure/azure-functions/)

---

## ✨ You're Ready!

**Your development environment is now:**
- ✅ Visually stunning
- ✅ Fully monitored
- ✅ Azure-integrated
- ✅ Live debugging enabled
- ✅ REST API testing ready
- ✅ Performance tracked
- ✅ Git history visible
- ✅ Production-ready

**Start building amazing things!** 🚀

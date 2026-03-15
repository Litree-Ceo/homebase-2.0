# 🔥 LITLABS Auto-Start System

## Quick Setup

### Option 1: Automatic (Recommended)

The dev environment now auto-starts when you open the workspace!

**What starts automatically:**

- 🐍 Python virtual environment (if exists)
- ⚡ Azure Functions API (port 7071)
- 📱 Next.js Frontend (port 3000)

### Option 2: Manual

Run the task: `Ctrl+Shift+P` → `Tasks: Run Task` → `LITLABS: Start Dev Environment`

Or run the script directly:

```powershell
.\scripts\Auto-Start-DevEnvironment.ps1
```

### Skip Services

```powershell
.\scripts\Auto-Start-DevEnvironment.ps1 -SkipAPI    # Only start frontend
.\scripts\Auto-Start-DevEnvironment.ps1 -SkipWeb    # Only start API
```

## What Was Fixed

✅ Removed all hardcoded D: drive references  
✅ Scripts now use dynamic paths  
✅ Auto-start on workspace open  
✅ Smart port detection (won't duplicate services)  
✅ Background process management

## Access Your Services

- **Frontend:** <http://localhost:3000>
- **API:** <http://localhost:7071/api>
- **Swagger:** <http://localhost:7071/api/swagger>

## Disable Auto-Start

Edit [.vscode/tasks.json](.vscode/tasks.json) and remove the `runOptions` section from the "🔥 Auto-Start Dev Environment" task.

---

💰 **Let's get this money!** 💰

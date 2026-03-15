# 🎨 VISUAL DASHBOARD - REFERENCE CARD

## ✨ What You Just Got (At a Glance)

```
┌─────────────────────────────────────────────────────────────────┐
│  15 Professional Extensions + Complete Monitoring Setup         │
│  Fully Configured & Ready to Use                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 THE 30-SECOND STARTUP

```
1. Ctrl+Shift+P → "Reload Window" (give it 10 seconds)
2. Ctrl+Shift+B → "LITLABS: Start Dev Environment"
3. Wait for 2 terminals to show:
   - "Ready in X.XXs" (Frontend)
   - "Listening on port 7071" (API)
4. Open http://localhost:3000 in browser
5. You're live! ✅
```

---

## 🎯 WHAT'S IN EACH SIDEBAR ICON

### Left Sidebar (from top)
```
📁  File Explorer          → Your code files
🔍  Search               → Find across all files  
🌳  Source Control (Git) → Commits, branches, diffs
🐛  Debug                → Breakpoints, watch variables
📦  Extensions           → Manage your 15 extensions
☁️  Azure (NEW!)         → Live Azure resources & monitoring
```

### Bottom Panels (Ctrl+J)
```
📝  Problems            → TypeScript errors
🔗  Output              → Build process logs
🖥️   Terminal            → Your command terminals
⚙️   Debug Console       → Debugger output
```

---

## 📊 YOUR LIVE MONITORING AT A GLANCE

| Component | Location | What You See |
|-----------|----------|--------------|
| **Frontend** | Terminal 1 | HMR events, build progress |
| **API** | Terminal 2 | HTTP requests, response times |
| **Azure** | Left sidebar > Azure | Real-time metrics, logs |
| **Database** | Left sidebar > Azure > Databases | Live data explorer |
| **Errors** | Bottom > Problems | TypeScript/ESLint issues |
| **Git** | Left sidebar > Source Control | Changed files, commits |

---

## ⌨️ YOUR POWER SHORTCUTS

| Do This | Press This |
|---------|-----------|
| Open file quickly | `Ctrl+P` |
| Search all files | `Ctrl+Shift+F` |
| Open Azure Explorer | `Ctrl+Shift+A` |
| Toggle terminal | `Ctrl+` ` (backtick) |
| Start debugging | `F5` |
| Step through code | `F10` |
| Send REST request | `Ctrl+Alt+R` (in .http files) |
| Git history | `Ctrl+Shift+G` |
| Format document | `Shift+Alt+F` |
| Comment line | `Ctrl+/` |

---

## 🧪 TESTING APIs (NO CURL NEEDED)

**Before:**
```powershell
curl -X GET http://localhost:7071/api/health
```

**Now (Inside VS Code):**
1. Open `api/test-live-api.http`
2. Hover over any request
3. Click "Send Request"
4. See response instantly in right panel ⚡

---

## 🐛 DEBUGGING IN 3 STEPS

1. **Set breakpoint** → Click line number (red dot appears)
2. **Start debugging** → Press `F5` → Pick "Full Stack"
3. **Step through** → Press `F10` to go line-by-line
   - Hover variables to see values
   - Right-click for conditional breakpoints
   - Watch panel shows live updates

---

## 📈 MONITORING YOUR DEPLOYMENT

**Azure Resources (Left Sidebar)**
```
Click Azure icon
  ↓
Sign in to Azure (one-time)
  ↓
Expand subscriptions
  ↓
See all your resources:
  • Container Apps (deployment status)
  • App Insights (live metrics)
  • Cosmos DB (data explorer)
  • Storage (blob browser)
```

Real-time updates show:
- CPU/Memory usage
- Request/Response rates
- Error counts
- Deployment history

---

## 🔥 MOST USEFUL EXTENSIONS (Quick Access)

| Extension | How to Use |
|-----------|-----------|
| **REST Client** | Open .http file → hover request → "Send Request" |
| **GitLens** | Ctrl+Shift+G → see file history with blame |
| **Cosmos DB** | Left sidebar Azure → Expand Databases |
| **App Insights** | Left sidebar Azure → Monitor metrics |
| **Docker** | Ctrl+Shift+X → search Docker → manage containers |
| **Copilot** | Start typing → suggestions appear automatically |

---

## 🎨 YOUR BEAUTIFUL NEW UI

```
┌──────────────────────────────────────────────────────────────┐
│ HomeBase 2.0  ⚡   [Files] [git main↓] [✓ 12 tests passed]  │
├──────────────────────────────────────────────────────────────┤
│ 📁 apps/web/src    │  api/test-live-api.http                 │
│  📄 page.tsx       │                                          │
│  📄 layout.tsx     │  GET http://localhost:7071/api/health   │
│  📁 components     │  > Send Request                          │
│  ...               │                                          │
├──────────────────────────────────────────────────────────────┤
│ Terminal: LITLABS: Start Frontend        [+] [^] [x]        │
│ pnpm dev - ready in 5.2s                                     │
│ ▲ Local:    http://localhost:3000        ✅ LIVE            │
│ ▲ Functions http://localhost:7071        ✅ LIVE            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚨 IF YOU GET STUCK

**"I see errors in terminal"**
```
→ This is normal during first startup
→ Check Terminal tab (Ctrl+J) for actual problems
→ Most common: Port already in use
→ Fix: Get-Process node | Stop-Process -Force
```

**"Azure not showing in sidebar"**
```
→ Click Azure icon (cloud in left sidebar)
→ Click "Sign in to Azure"
→ Complete browser login
→ Resources appear automatically
```

**"Can't send REST requests"**
```
→ Make sure api/test-live-api.http is open
→ Make sure API is running (pnpm -C api start)
→ Hover over request text
→ "Send Request" link should appear above
→ Click it to send
```

**"Debugger not working"**
```
→ Press F5
→ Select "Full Stack (API + Frontend)"
→ Terminal should show "Debugger listening on..."
→ Set breakpoint (click line number)
→ Trigger code path to hit breakpoint
```

---

## 📚 FILES TO KNOW

```
🟦 VISUAL_DASHBOARD_SETUP.md
   ↳ Complete guide with all Azure commands

🟦 QUICK_START_VISUAL_DASHBOARD.md  
   ↳ Quick reference (you're reading this!)

🟦 api/test-live-api.http
   ↳ 7 REST tests ready to go

🟦 .vscode/launch.json
   ↳ Debug configurations (F5 uses this)

🟦 IMPLEMENTATION_COMPLETE.md
   ↳ Detailed workflow examples
```

---

## ✅ QUICK CHECKLIST

- [ ] Ctrl+Shift+P → "Reload Window" ← DO THIS FIRST
- [ ] Ctrl+Shift+A → Azure Explorer appears
- [ ] Click Azure Account → Sign in
- [ ] Ctrl+Shift+B → Start dev environment
- [ ] See 2 terminal tabs (Frontend + API)
- [ ] Open api/test-live-api.http
- [ ] Hover request → "Send Request" appears
- [ ] See response in right panel
- [ ] Set breakpoint in code (click line)
- [ ] Press F5 to debug
- [ ] 🎉 You're fully set up!

---

## 🎯 YOUR NEW SUPERPOWERS

Before | Now
---|---
Manual curl commands | One-click REST testing ⚡
Separate terminal windows | Integrated sidebar monitoring 📊
No git visualization | Visual commit history + blame 🌳
No debugger | Full Node.js debugging (F5) 🐛
Terminal grep logs | Live streaming logs in sidebar 📡
Manual Azure checks | Real-time metrics in editor 📈
Slow hot reload | Instant HMR with visual feedback ✨

---

## 🎊 YOU'RE READY!

Everything is:
- ✅ Installed
- ✅ Configured  
- ✅ Ready to use
- ✅ Fully documented

**Just reload VS Code and start building!** 🚀

---

**Next Command:**
```
Ctrl+Shift+P → Reload Window
```

**Then:**
```
Ctrl+Shift+B → LITLABS: Start Dev Environment
```

**Then:**
```
http://localhost:3000
```

**Then:**
```
🎉 You're live!
```

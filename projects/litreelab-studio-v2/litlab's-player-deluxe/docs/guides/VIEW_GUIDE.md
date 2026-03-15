# 🎨 How to View Your Logo & Dashboard

## Quick Start - View Logo Preview

### Option 1: Open Directly (Easiest)
```
1. Open File Explorer
2. Go to: C:\Users\litre\Desktop\Overlord-Pc-Dashboard\assets\
3. Double-click: logo-preview.html
```

### Option 2: Via Browser Address Bar
```
file:///C:/Users/litre/Desktop/Overlord-Pc-Dashboard/assets/logo-preview.html
```

### Option 3: Using the Setup Wizard
```powershell
# Run the smart setup (opens preview automatically)
.\setup-smart.ps1
```

---

## 📱 What You'll See

The preview page shows:

| Variation | Description |
|-----------|-------------|
| **Full Featured** | Main logo with glow effects, hex grid, circuit traces |
| **Simplified** | Clean version for most uses |
| **Minimal** | Just the diamond symbol - perfect for favicons |
| **Animated** | Pulsing glow, rotating grid effects |

---

## 🚀 Start Your Dashboard

### Step 1: Configure Everything (One Command)
```powershell
# This configures Real-Debrid, checks deps, shows logo
.\setup-smart.ps1
```

### Step 2: Start Server
```powershell
python server.py
```

### Step 3: Open Dashboard
```
http://localhost:8080
```

---

## ⚡ Real-Debrid Setup (DONE!)

**✅ Your API key is already configured in `.env`:**
```
RD_API_KEY=FO7CDCW6ZRYGYT5B5SVNCDZCM7YUSVKOATDCXJBAB5PROAAEQURA
```

**The streaming module will now work automatically!**

---

## 🔑 Dashboard API Key

Your dashboard uses this API key for login (stored in `config.yaml`):
```
L5PZs6WDDUVBoo4IHmoqXRqGRc703kIMMfJ7SPD9_y0
```

It will be saved to your browser automatically - you won't need to type it every time.

---

## 📂 File Locations

| File | Location |
|------|----------|
| Logo Preview | `assets/logo-preview.html` |
| Logo SVGs | `assets/logo-*.svg` |
| Config | `config.yaml` |
| Environment | `.env` |
| Main Server | `server.py` |

---

## 🎯 Quick Commands Reference

```powershell
# Setup everything
.\setup-smart.ps1

# Just start server
python server.py

# Generate PNG logos
cd assets
python generate-pngs.py

# View logo preview (PowerShell)
Start-Process assets/logo-preview.html
```

---

## ✅ What's Already Configured

- ✅ Real-Debrid API key
- ✅ Dashboard API key
- ✅ Logo assets created
- ✅ Dependencies listed in requirements.txt

**Just run `python server.py` and you're live!**

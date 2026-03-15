# ⚡ QUICK START - Where Am I?

## 🖥️ YOU ARE ON: Windows PC

Your repos are here: `C:\projects\`
- Overlord-Pc-Dashboard ✅
- Overlord-Social ✅  
- L1T_GRID ✅
- System-Overlord-Phase0 ✅

---

## ✅ PC Commands (Use These Now!)

**Sync all repos with GitHub:**
```powershell
cd C:\projects
.\sync.ps1
```

**Start all services:**
```powershell
cd C:\projects
.\start-all.ps1
```

**Setup Syncthing (for auto-sync):**
```powershell
cd C:\projects
.\Setup-Syncthing-Windows.ps1 -AutoStart
```

---

## 📱 Termux Commands (For Your Phone Later)

**When you're on Termux, run these:**
```bash
cd ~/projects/Overlord-Pc-Dashboard
git pull origin main

# Fix vision-board Turbopack error
bash fix-vision-board.sh

# Setup all sync methods
bash termux-sync-master.sh
# Choose option 5 (Setup ALL)
```

---

## 🚫 Commands That DON'T Work on PC

These are **Termux/Linux only**:
- ❌ `pkg install` → Use `winget install` on PC
- ❌ `chmod +x` → Not needed on Windows
- ❌ `bash script.sh` → Use `.\script.ps1` on PC
- ❌ `~/projects/sync` → Use `.\sync.ps1` on PC

---

## 🎯 What You Should Do RIGHT NOW

**On your PC (where you are now):**

```powershell
# 1. Check status (already done - all synced!)
cd C:\projects
.\sync.ps1

# 2. Start all your services
.\start-all.ps1

# 3. Access your dashboards
# http://localhost:8080  - PC Dashboard
# http://localhost:3000  - Overlord Social
# http://localhost:5000  - L1T_GRID
```

**On your phone (do this later in Termux):**

```bash
# 1. Install git and GitHub CLI
pkg install git gh

# 2. Authenticate GitHub
gh auth login
# Choose: GitHub.com → HTTPS → Yes → Browser

# 3. Clone repos
cd ~
mkdir -p projects
cd projects
gh repo clone Litree-Ceo/Overlord-Pc-Dashboard
gh repo clone Litree-Ceo/Overlord-Social
gh repo clone Litree-Ceo/L1T_GRID
gh repo clone Litree-Ceo/System-Overlord-Phase0

# 4. Fix vision-board
cd Overlord-Pc-Dashboard
bash fix-vision-board.sh

# 5. Setup sync
bash termux-sync-master.sh
```

---

## 📊 File Reference

| File | For | What It Does |
|------|-----|--------------|
| `sync.ps1` | PC | Sync repos on Windows |
| `start-all.ps1` | PC | Start services on Windows |
| `Setup-Syncthing-Windows.ps1` | PC | Install Syncthing on PC |
| `sync` | Termux | Sync repos on phone |
| `start-all` | Termux | Start services on phone |
| `termux-sync-master.sh` | Termux | Setup all sync methods on phone |
| `fix-vision-board.sh` | Termux | Fix Next.js Turbopack error |

---

## 💡 Quick Answers

**Q: Can I use the bash scripts on PC?**  
A: No, use the `.ps1` versions instead.

**Q: Why did `pkg install` fail?**  
A: That's a Termux command. On PC, use `winget install`.

**Q: Where are my repos?**  
A: `C:\projects\Overlord-Pc-Dashboard`, etc.

**Q: How do I access from my phone?**  
A: Get your PC IP: `ipconfig` → Then `http://YOUR_PC_IP:8080` on phone browser.

**Q: Everything synced, now what?**  
A: ✅ PC is done! Now set up Termux on your phone (see above).

---

## 🚀 Next Steps

1. ✅ **PC Setup** - DONE! (You just ran sync.ps1 successfully)
2. ⏹️ **Phone Setup** - Do this on Termux later
3. ⏹️ **Syncthing** - Optional real-time sync (run Setup-Syncthing-Windows.ps1)

**Your PC is ready to go!** 🎉

# 🚀 OVERLORD MONOLITH PRO - QUICK START GUIDE

## Status: ✅ FULLY OPERATIONAL

Your **Overlord Monolith** is now running in WSL with professional-grade service management.

---

## 📱 ACCESS YOUR SYSTEM

### From Windows (Same PC)
- **Dashboard (Kali Theme)**: http://localhost:8080 or http://192.168.0.77:8080
- **Social Hub (Kodi Theme)**: http://localhost:3000 or http://192.168.0.77:3000

### From Phone / Other Devices
- **Dashboard**: http://192.168.0.77:8080
- **Social**: http://192.168.0.77:3000

**⚠️ First-Time Phone Setup Required:**
Run these commands in PowerShell **as Administrator**:

```powershell
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=172.21.34.99
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.21.34.99
netsh advfirewall firewall add rule name="Overlord Ports" dir=in action=allow protocol=tcp localport=8080,3000
```

---

## 🛠️ SERVICE MANAGEMENT

### Simple Commands (from PowerShell in project root)

```powershell
# Start both services
.\manage-overlord-pro.ps1 start-all

# Stop both services
.\manage-overlord-pro.ps1 stop-all

# Check status
.\manage-overlord-pro.ps1 status

# View logs
.\manage-overlord-pro.ps1 logs-dash     # Dashboard logs
.\manage-overlord-pro.ps1 logs-social   # Social Hub logs
```

### Individual Service Control

```powershell
# Start individual services
.\manage-overlord-pro.ps1 dashboard
.\manage-overlord-pro.ps1 social

# Inside WSL (if you prefer)
cd /mnt/c/Users/litre/Desktop/Overlord-Monolith/modules/dashboard
./start-dashboard-pro.sh
./stop-dashboard.sh

cd /mnt/c/Users/litre/Desktop/Overlord-Monolith/modules/social
./start-social-pro.sh
./stop-social.sh
```

---

## 📊 SYSTEM DETAILS

| Component | Port | Protocol | Status | WSL IP | Windows IP |
|-----------|------|----------|--------|--------|-----------|
| Dashboard | 8080 | HTTP | ✅ Running | 172.21.34.99:8080 | 192.168.0.77:8080 |
| Social | 3000 | HTTP | ✅ Running | 172.21.34.99:3000 | 192.168.0.77:3000 |
| Grid (Legacy) | 5000 | HTTP | ❌ Disabled | - | - |

---

## 🔧 TROUBLESHOOTING

### Phone Can't Connect?
1. Make sure you've run the Admin port forwarding commands (see above)
2. Check your phone is on the same WiFi network
3. Verify firewall isn't blocking: `netsh advfirewall firewall show rule name="Overlord Ports"`

### Service Won't Start?
```powershell
# Check detailed logs
.\manage-overlord-pro.ps1 logs-dash
.\manage-overlord-pro.ps1 logs-social

# Check WSL connectivity
wsl -e hostname -I  # Should show 172.21.34.99
```

### Port Already in Use?
```powershell
# See what's using the port
Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess
Get-Process -Id <ProcessId>  # Replace <ProcessId> with the PID above

# Kill it
Stop-Process -Id <ProcessId> -Force
```

### WSL IP Changed (after reboot)?
1. Check new IP: `wsl -e hostname -I`
2. Update port forwarding with new IP (Admin PowerShell):
```powershell
netsh interface portproxy delete v4tov4 listenport=8080
netsh interface portproxy delete v4tov4 listenport=3000
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=<NEW_IP>
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<NEW_IP>
```

---

## 🎨 CUSTOMIZATION

### Dashboard (Kali Theme)
- **Location**: `modules/dashboard/`
- **Styling**: `style.css` (Neon green/black terminal aesthetic)
- **Backend**: `server.py` (Python 3.14+)
- **Features**: Real-Debrid integration, system monitoring, grid streaming

### Social Hub (Kodi Theme)
- **Location**: `modules/social/`
- **Frontend**: `index.html` + `style.css` (Kodi-style cinema interface)
- **Backend**: Python `http.server` on Port 3000
- **Features**: Social profiles, feeds, marketplace

---

## 📝 FILES CREATED/MODIFIED

### New Scripts
- `manage-overlord-pro.ps1` - Main management script
- `modules/dashboard/start-dashboard-pro.sh` - WSL launcher
- `modules/dashboard/stop-dashboard.sh` - WSL stopper
- `modules/social/start-social-pro.sh` - WSL launcher
- `modules/social/stop-social.sh` - WSL stopper

### Updated
- `modules/dashboard/style.css` - Kali Linux theme applied
- `modules/dashboard/server.py` - Listens on 0.0.0.0 for external access
- `modules/social/index.html` - Links updated to 192.168.0.77 for phone access

---

## 🚀 NEXT STEPS

1. **Open your Dashboard**: http://192.168.0.77:8080
2. **Test Social Hub**: http://192.168.0.77:3000
3. **Try from Phone**: Same URLs on your mobile device
4. **Customize**: Edit CSS/HTML in the respective module folders
5. **Monitor**: Use `.\manage-overlord-pro.ps1 status` regularly

---

## 💾 BACKUP REMINDERS

Copy these files somewhere safe:
- `config.yaml` - Contains Real-Debrid API key
- `modules/dashboard/server.py` - Core dashboard logic
- `modules/social/index.html` - Social interface

---

**Status**: All systems online and phone-accessible. 🎉

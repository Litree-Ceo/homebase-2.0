# 🚀 Overlord Dashboard - Remote Access from Android Termux

Access and code your PC dashboard from your Android phone with live sync.

## 🎯 What This Does

- **Live Coding**: Edit files in Termux → see changes instantly on PC
- **Dashboard Access**: View your dashboard at `http://localhost:3000` on phone
- **VS Code Remote**: Full VS Code interface accessible from phone browser
- **Secure**: Uses SSH tunneling (encrypted connection)

## 📋 Prerequisites

### On PC (Windows)
- [x] VS Code installed
- [x] Python environment working (you have this)
- [ ] OpenSSH Server enabled (script does this)

### On Android
- [x] Termux installed
- [ ] SSH key generated
- [ ] Connected to same WiFi as PC

---

## 🔧 Setup (Do Once)

### Part 1: PC Setup (5 minutes)

1. **Run the setup script** (in this project folder):
   ```powershell
   .\setup-vscode-remote.ps1
   ```

2. **Authenticate VS Code Tunnel**:
   - A browser opens asking you to sign in with GitHub
   - Sign in, authorize
   - The tunnel is now running in a separate window (keep it open)

3. **Note your PC IP** (script shows this):
   ```
   Username: litre
   Local IP: 192.168.1.XXX  ← Important!
   ```

### Part 2: Termux Setup (3 minutes)

1. **Install required packages**:
   ```bash
   pkg update && pkg upgrade
   pkg install openssh sshfs-ng
   ```

2. **Generate SSH key**:
   ```bash
   ssh-keygen -t ed25519 -C "termux-overlord"
   # Press Enter 3 times (default location, no passphrase)
   
   cat ~/.ssh/id_ed25519.pub
   ```

3. **Copy the key output** (long string starting with `ssh-ed25519`)

4. **Back on PC**, run:
   ```powershell
   .\add-termux-key.ps1
   # Paste the key when prompted
   ```

5. **Test connection from Termux**:
   ```bash
   ssh litre@192.168.1.XXX  # Use YOUR PC IP
   # Type 'yes' when prompted, then 'exit'
   ```

### Part 3: Create Termux Shortcut

1. **Edit the tunnel script** with your PC details:
   ```bash
   nano termux-tunnel.sh
   # Change PC_USER and PC_IP to match your setup
   ```

2. **Make it executable**:
   ```bash
   chmod +x termux-tunnel.sh
   mkdir -p ~/bin
   cp termux-tunnel.sh ~/bin/overlord
   ```

3. **Add to PATH** (if not already):
   ```bash
   echo 'export PATH=$PATH:~/bin' >> ~/.bashrc
   source ~/.bashrc
   ```

---

## 🎮 Daily Usage

### Start Everything

**On PC**: Make sure the dashboard is running:
```powershell
python server.py
```

**In Termux**: Connect with one command:
```bash
overlord
```

This automatically:
- ✅ Tests connection to PC
- ✅ Creates secure tunnel
- ✅ Forwards ports (3000 for dashboard, 8080 for VS Code)
- ✅ Opens dashboard in your phone browser

### Access Points

Once tunnel is active:

| Service | URL | What It Does |
|---------|-----|--------------|
| **Dashboard** | `http://localhost:3000` | Your PC monitoring dashboard |
| **VS Code Web** | `http://localhost:8080` | Full VS Code in browser |

### Live File Editing

**Option 1: SSHFS Mount** (easiest for editing):
```bash
# In Termux, mount PC folder
mkdir -p ~/overlord
sshfs litre@192.168.1.XXX:'/c/Users/litre/Desktop/Overlord-Pc-Dashboard' ~/overlord

# Now edit files
cd ~/overlord
nano server.py  # Changes save directly to PC!

# Unmount when done
fusermount -u ~/overlord
```

**Option 2: VS Code in Browser**:
- Open `http://localhost:8080` in Chrome
- Full VS Code interface
- Git integration works
- Terminal access to PC

**Option 3: Direct SSH**:
```bash
ssh litre@192.168.1.XXX
cd /c/Users/litre/Desktop/Overlord-Pc-Dashboard
# Use vim, nano, etc.
```

### Stop Tunnel

```bash
pkill -f "ssh.*litre"
```

---

## 🐛 Troubleshooting

### "Cannot connect to PC"
- **Check WiFi**: Both devices on same network?
- **Check IP**: Did PC's IP change? Run `ipconfig` on PC
- **Check SSH**: Is `sshd` service running on PC?
  ```powershell
  Get-Service sshd  # Should show "Running"
  Start-Service sshd  # If not running
  ```

### "Tunnel failed"
- **Port already in use**: Kill existing tunnels:
  ```bash
  pkill -f "ssh.*litre"
  ```
- **Firewall**: Windows Firewall might block SSH (port 22)
  - Allow OpenSSH Server in Windows Defender Firewall

### "Permission denied (publickey)"
- **Key not added**: Re-run `.\add-termux-key.ps1` on PC
- **Wrong key**: Make sure you copied the FULL key (including `ssh-ed25519` at start)

### Dashboard not loading
- **PC server not running**: Start `python server.py` on PC first
- **Wrong port**: Check tunnel script forwards port 3000
- **Check PC directly**: Visit `http://localhost:3000` on PC - does it work there?

---

## ⚙️ Advanced Configuration

### Auto-start VS Code Tunnel on PC
Create a scheduled task in Windows:
```powershell
$action = New-ScheduledTaskAction -Execute "code" -Argument "tunnel --name overlord-dashboard --accept-server-license-terms"
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "VSCodeTunnel" -Action $action -Trigger $trigger -User $env:USERNAME
```

### Mobile-Optimized VS Code
Install these extensions in tunnel VS Code:
- **GitLens** - See changes inline
- **Material Icon Theme** - Larger icons for mobile
- **Settings Sync** - Sync your preferences

VS Code Settings for mobile:
```json
{
  "window.zoomLevel": 1,
  "editor.fontSize": 16,
  "terminal.integrated.fontSize": 14,
  "workbench.iconTheme": "material-icon-theme"
}
```

### Use Mobile Data (Outside Home WiFi)
If you have a static IP or DDNS:
1. Forward port 22 (SSH) on your router to PC
2. Update `PC_IP` in `termux-tunnel.sh` to your public IP
3. **Security**: Use a strong SSH key and disable password auth

---

## 🔒 Security Notes

- ✅ **SSH Key Auth**: More secure than passwords
- ✅ **Local Network**: Only accessible on your WiFi
- ⚠️ **Public Access**: Don't expose without proper firewall rules
- 💡 **Best Practice**: Keep your PC and Termux updated

---

## 🎓 Quick Reference

### Essential Commands

```bash
# Connect
overlord

# Mount PC files
sshfs litre@IP:'/c/Users/litre/Desktop/Overlord-Pc-Dashboard' ~/overlord

# Disconnect tunnel
pkill -f "ssh.*litre"

# Unmount files
fusermount -u ~/overlord

# Direct PC access
ssh litre@192.168.1.XXX
```

### File Locations

- **PC Setup Script**: `setup-vscode-remote.ps1`
- **Termux Script**: `~/bin/overlord` (edit with: `nano ~/bin/overlord`)
- **SSH Keys**: 
  - Termux: `~/.ssh/id_ed25519`
  - PC: `C:\Users\litre\.ssh\authorized_keys`

---

## ❓ Need Help?

1. Check error message - scripts give specific troubleshooting steps
2. Verify basics:
   - PC is on and connected to WiFi
   - Both devices on same network
   - SSH service running on PC
   - Dashboard server running (`python server.py`)
3. Test each component:
   - Can you SSH? `ssh litre@PC_IP`
   - Does dashboard work on PC? Open in PC browser
   - Is tunnel active? `ps aux | grep ssh` in Termux

---

**Auth Credentials** (for your reference):
- Username: Larry B
- Password: 1421

**Enjoy coding from anywhere! 🚀**

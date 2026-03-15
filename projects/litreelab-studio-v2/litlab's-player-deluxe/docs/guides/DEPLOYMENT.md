# 🚀 Overlord PC Dashboard — Deployment Guide

Complete deployment instructions for Windows, Linux, and Docker.

---

## ⚡ Quick Deploy (Windows)

### One-Command Deployment

```powershell
# Native Python server (recommended)
.\deploy.ps1

# Docker container
.\deploy.ps1 -Mode docker

# Run tests only
.\deploy.ps1 -Mode test

# Generate secure API key
.\deploy.ps1 -GenerateKey

# Check readiness without deploying
.\deploy.ps1 -CheckOnly
```

---

## 🔧 Manual Deployment

### **Windows (Native)**

```powershell
# 1. Install Python 3.9+ from https://python.org

# 2. Install dependencies
pip install -r requirements.txt

# 3. Generate & set API key
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Add to config.yaml under auth.api_key

# 4. Start server
python server.py

# 5. Open browser
start http://localhost:8080
```

### **Linux / macOS**

```bash
# 1. Install dependencies
pip3 install -r requirements.txt

# 2. Generate & set API key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Add to config.yaml under auth.api_key

# 3. Start server
python3 server.py

# 4. Open browser
xdg-open http://localhost:8080  # Linux
open http://localhost:8080       # macOS
```

### **Docker (All Platforms)**

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

## 🔒 Security Setup

**⚠️ CRITICAL:** Change the default API key before exposing on a network!

### Generate Secure API Key

**Windows:**
```powershell
.\deploy.ps1 -GenerateKey
```

**Linux/macOS:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Edit `config.yaml`

```yaml
auth:
  enabled: true
  api_key: "YOUR-GENERATED-KEY-HERE"  # ← CHANGE THIS

server:
  host: "0.0.0.0"  # All interfaces (LAN access)
  # host: "127.0.0.1"  # Local only (no network access)
  port: 8080

rate_limit:
  enabled: true
  requests_per_second: 5
  burst: 15
```

---

## 🌐 Network Access

### Access from LAN (Other Devices)

1. **Get your PC's IP address:**
   ```powershell
   # Windows
   ipconfig | Select-String "IPv4"
   
   # Linux/macOS
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. **Access from other devices:**
   ```
   http://YOUR-PC-IP:8080
   ```

3. **First-time login:** Enter your API key when prompted

### Windows Firewall

Allow port 8080:
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Overlord Dashboard" `
  -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

---

## 📱 Mobile Access (PWA)

The dashboard works as a Progressive Web App:

1. **Open** `http://your-pc-ip:8080` on mobile
2. **Enter API key** when prompted
3. **Add to Home Screen:**
   - **Android (Chrome):** Menu → Add to Home screen
   - **iOS (Safari):** Share → Add to Home Screen

Benefit: Dashboard works offline, loads instantly, feels like a native app.

---

## 🔄 Auto-Start on Boot

### Windows (Task Scheduler)

```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "python" -Argument "server.py" `
  -WorkingDirectory "C:\path\to\Overlord-Pc-Dashboard"

$trigger = New-ScheduledTaskTrigger -AtStartup

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" `
  -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName "Overlord Dashboard" `
  -Action $action -Trigger $trigger -Principal $principal
```

### Linux (systemd)

Create `/etc/systemd/system/overlord-dashboard.service`:

```ini
[Unit]
Description=Overlord PC Dashboard
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/Overlord-Pc-Dashboard
ExecStart=/usr/bin/python3 server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable overlord-dashboard
sudo systemctl start overlord-dashboard
sudo systemctl status overlord-dashboard
```

### Docker (Auto-restart)

Already configured in `docker-compose.yml` with `restart: unless-stopped`:
```bash
docker-compose up -d
# Container auto-starts on boot
```

---

## 🧪 Testing

```bash
# Run all tests
python -m pytest tests/ -v

# With coverage
python -m pytest tests/ --cov=server --cov-report=html
```

---

## 📊 What Gets Deployed

| Component | Tech | Port |
|-----------|------|------|
| **Backend** | Python 3.12 + psutil | 8080 |
| **Frontend** | HTML5 + CSS + Vanilla JS | — |
| **API** | HTTP JSON API | /api/stats, /api/health, /api/config |
| **Auth** | API key bearer token | X-API-Key header |
| **Monitoring** | Real-time CPU, GPU, RAM, Disk, Temps | 2s polling |

---

## 🛠️ Troubleshooting

### Server won't start

```powershell
# Check port 8080 is free
netstat -ano | findstr :8080

# Kill process using port 8080 (if needed)
Stop-Process -Id <PID> -Force

# Check Python version
python --version  # Must be 3.9+

# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

### Dashboard shows "Unauthorized"

1. Check `config.yaml` has correct API key
2. Clear browser localStorage: F12 → Application → Local Storage → Clear All
3. Refresh page and re-enter API key

### GPU stats not showing

**NVIDIA:**
```bash
# Test nvidia-smi is available
nvidia-smi

# If missing, install GPU drivers from nvidia.com
```

**AMD:**
```bash
# Test rocm-smi is available
rocm-smi

# If missing, install ROCm from amd.com
```

### Docker build fails

```bash
# Clean rebuild
docker-compose down
docker-compose up -d --build --force-recreate
```

---

## 🎯 Production Checklist

- [ ] Change default API key in `config.yaml`
- [ ] Set `auth.enabled: true`
- [ ] Set `rate_limit.enabled: true`
- [ ] Configure firewall rules
- [ ] Test from another device on LAN
- [ ] Set up auto-start (optional)
- [ ] Monitor `overlord.log` for errors
- [ ] Check `/api/health` endpoint returns 200

---

## 🌐 Deployment Scenarios

### Scenario 1: Personal PC Dashboard (Local Only)
```yaml
# config.yaml
server:
  host: "127.0.0.1"  # No network access
  port: 8080
auth:
  enabled: false  # Not exposed to network
```

### Scenario 2: Home Lab Dashboard (LAN Access)
```yaml
# config.yaml
server:
  host: "0.0.0.0"  # All network interfaces
  port: 8080
auth:
  enabled: true  # ⚠️ REQUIRED
  api_key: "strong-random-key-here"
```

### Scenario 3: Public Server (VPS/Cloud)
```yaml
# config.yaml
server:
  host: "0.0.0.0"
  port: 8080
auth:
  enabled: true  # ⚠️ MANDATORY
  api_key: "ultra-strong-key"
rate_limit:
  enabled: true
  requests_per_second: 3  # Stricter
  burst: 10
```

**Additional security:**
- Use HTTPS (Nginx reverse proxy with Let's Encrypt)
- Use fail2ban or similar
- Monitor access logs daily

---

## 📈 Expected Performance

| Metric | Value |
|--------|-------|
| **CPU Usage** | 0.5-2% idle, 3-5% active |
| **RAM Usage** | 30-50 MB |
| **Disk I/O** | Minimal (logs only) |
| **Network** | ~2 KB/s per client (polling) |
| **Response Time** | <50ms typical |

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/Litree-Ceo/Overlord-Pc-Dashboard/issues)
- **Docs:** [README.md](README.md)
- **Logs:** Check `overlord.log` for errors

---

**Your Overlord Dashboard is ready for deployment.** Choose your deployment method above and activate the grid. 🛰️

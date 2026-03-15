# Overlord PC Dashboard
<!-- Sync test from phone -->

A cyberpunk-themed, real-time PC monitoring dashboard. Live CPU, RAM, disk, GPU, temperatures, and process stats — updated every 2 seconds. Glassmorphism UI with neon glow aesthetics.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. (Optional) Set a strong API key in config.yaml
#    Generate one:
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 3. Start the server
python server.py

# 4. Open your browser
#    http://localhost:8080
#    Enter your API key when prompted (first time only — stored in localStorage)
```

---

## 🔒 Security Setup (Required for Network Access)

Edit `config.yaml` before exposing the dashboard on any network:

```yaml
auth:
  enabled: true
  api_key: "your-strong-random-key-here"   # ← CHANGE THIS

rate_limit:
  enabled: true
  requests_per_second: 5
  burst: 15
```

When auth is enabled, the browser will prompt for the API key on first load and store it locally. Subsequent visits use the stored key automatically. Use the **🔑 RESET KEY** button to clear it.

---

## 📊 Features

| Feature | Detail |
| --- | --- |
| **Live CPU** | Usage %, frequency, core count, sparkline history chart |
| **Live RAM** | Used / Total GB, %, sparkline history chart |
| **Live Disk** | Primary disk + all mounted volumes with progress bars |
| **GPU Stats** | NVIDIA (nvidia-smi) and AMD (rocm-smi) — auto-detected |
| **Temperatures** | CPU/mobo sensors via psutil (Linux/macOS) |
| **Top Processes** | Top 5 by CPU usage — PID, name, CPU%, RAM% |
| **Network I/O** | Session-total sent & received, auto-scales MB/GB |
| **Auto-refresh** | Configurable interval (default 2s), pause/resume |
| **Copy Stats** | One-click clipboard copy |
| **Auth** | Token-based API key (header or query param) |
| **Rate Limiting** | Token-bucket, 5 req/s per IP (configurable) |
| **Logging** | Rotating file log + console (configurable level) |
| **PWA** | `manifest.json` — "Add to Home Screen" on mobile |
| **gzip** | Compressed API responses for slow connections |

---

## 🔧 Project Structure

```text
Overlord-Pc-Dashboard/
├── index.html       # Dashboard UI
├── style.css        # Cyberpunk / glassmorphism styling
├── server.py        # Production server (auth, rate limiting, stats)
├── config.yaml      # All settings (port, API key, refresh rate, logging)
├── requirements.txt # Python deps (psutil, pyyaml)
├── manifest.json    # PWA manifest
├── test_server.py   # Unit + integration test suite
└── README.md
```

---

## 🧭 Architecture

See the full visual map in [ARCHITECTURE.md](ARCHITECTURE.md).

---

## ⚙️ Configuration Reference

All settings live in `config.yaml` — no need to edit Python code.

| Key | Default | Description |
| --- | --- | --- |
| `server.port` | `8080` | Listening port |
| `server.host` | `0.0.0.0` | Bind address (`127.0.0.1` for local-only) |
| `auth.enabled` | `true` | Require API key for `/api/stats` |
| `auth.api_key` | `overlord-change-me-please` | **Change this!** |
| `rate_limit.enabled` | `true` | Enable per-IP rate limiting |
| `rate_limit.requests_per_second` | `5` | Sustained request rate |
| `rate_limit.burst` | `15` | Initial token burst |
| `dashboard.refresh_interval_ms` | `2000` | Browser polling interval |
| `logging.level` | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR` |
| `logging.file` | `overlord.log` | Log file (rotated at 1 MB, 3 backups) |

---

## 🌐 API Endpoints

| Endpoint | Auth | Description |
| --- | --- | --- |
| `GET /api/health` | No | Server health check |
| `GET /api/config` | No | Safe config subset (refresh interval, auth status) |
| `GET /api/stats` | Yes | Full system snapshot (CPU, RAM, disk, GPU, procs, temps) |
| `GET /api/history` | Yes | Last 60 CPU/RAM data points |

**Authentication:** pass the key as a header:
```
X-API-Key: your-key-here
```
Or as a query param (convenient for testing): `/api/stats?api_key=your-key-here`

---

## 🎮 GPU Monitoring

GPU stats are auto-detected — no configuration needed:

- **NVIDIA:** Requires `nvidia-smi` on PATH (installed with NVIDIA drivers)
- **AMD:** Requires `rocm-smi` on PATH (install ROCm)
- **No GPU / unsupported:** GPU section is hidden automatically

---

## 📡 Access from Phone / Tablet

1. Run `python server.py` on your PC
2. Find your PC's local IP: `ipconfig` (Windows) → **IPv4 Address**
3. On your phone: `http://<PC_IP>:8080`
4. Enter your API key when prompted
5. **Add to Home Screen** for PWA app experience

---

## 🧪 Running Tests

```bash
# No extra dependencies — uses Python's built-in unittest
python test_server.py

# Or with pytest for nicer output
pip install pytest
pytest test_server.py -v
```

Tests cover: rate limiter, config merging, stat collection, disk detection, health endpoint, and full HTTP integration (auth, 401, 429, history).

---

## 🔄 Live Development Mode

**Edit code and see changes instantly** — no manual restarts needed!

### Windows (PowerShell)
```powershell
.\dev-watch.ps1
```

### Linux / Mac / Termux
```bash
chmod +x dev-watch.sh
./dev-watch.sh
```

**What it does:**
- ✅ Opens browser automatically
- ✅ Watches for changes to `server.py`, `index.html`, `style.css`, `config.yaml`
- ✅ Auto-restarts server when files change
- ✅ Browser auto-reconnects (no need to refresh)

**Perfect for:**
- Building new features
- Tweaking UI colors/layout
- Testing configuration changes
- Mobile development (phone browser stays in sync)

Press **Ctrl+C** to stop watching.

---

## 🛠️ Troubleshooting

| Problem | Fix |
| --- | --- |
| Port 8080 in use | Change `server.port` in `config.yaml` |
| Stats show `—` | `pip install psutil` |
| "DEFAULT API KEY" warning | Set `auth.api_key` in `config.yaml` |
| Can't reach from phone | Firewall must allow port 8080; use PC's local IP |
| GPU section missing | install `nvidia-smi` / `rocm-smi` and ensure it's on PATH |
| Temperatures missing | psutil sensor support requires Linux or macOS |
| PyYAML not found | `pip install pyyaml` (or `pip install -r requirements.txt`) |

---

**Status: 🟢 OPERATIONAL** — Overlord Grid v4.0

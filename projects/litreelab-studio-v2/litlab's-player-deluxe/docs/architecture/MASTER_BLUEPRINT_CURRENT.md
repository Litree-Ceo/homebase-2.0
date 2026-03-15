# ◈ SYSTEM OVERLORD - MASTER BLUEPRINT
## Bird's Eye View - Current State

**Version:** 4.2.1 Security Hardened  
**Status:** ✅ PRODUCTION READY  
**Last Updated:** March 5, 2026  

---

## 🎯 THE BIG PICTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM OVERLORD v4.2                            │
│                    Real-Time PC Monitoring Dashboard                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   DASHBOARD  │    │   L1T_GRID   │    │    SOCIAL    │              │
│  │   :8080      │    │   :3000      │    │   (Static)   │              │
│  │              │    │              │    │              │              │
│  │ • CPU/RAM    │    │ • Streaming  │    │ • Links      │              │
│  │ • GPU/Temps  │    │ • Real-Debrid│    │ • Hub        │              │
│  │ • Processes  │    │ • Torrents   │    │              │              │
│  │ • Docker     │    │              │    │              │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                   │                   │                       │
│         └───────────────────┼───────────────────┘                       │
│                             ▼                                           │
│                    ┌──────────────────┐                                 │
│                    │   Python Server  │                                 │
│                    │   server.py      │                                 │
│                    │                  │                                 │
│                    │ • REST API       │                                 │
│                    │ • Auth/Security  │                                 │
│                    │ • Rate Limiting  │                                 │
│                    │ • Database       │                                 │
│                    └──────────────────┘                                 │
│                             │                                           │
│         ┌───────────────────┼───────────────────┐                       │
│         ▼                   ▼                   ▼                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   System     │    │ Real-Debrid  │    │   Firebase   │              │
│  │   psutil     │    │    API       │    │   (Opt)      │              │
│  │              │    │              │    │              │              │
│  │ • CPU/RAM    │    │ • Streaming  │    │ • Sync       │              │
│  │ • Disk/Net   │    │ • Magnets    │    │ • Hosting    │              │
│  │ • GPU/Temp   │    │ • Downloads  │    │              │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 CURRENT PROJECT STATE

### ✅ FULLY OPERATIONAL

| Component | Status | Notes |
|-----------|--------|-------|
| **Dashboard Core** | ✅ Live | CPU, RAM, Disk, Network monitoring |
| **Authentication** | ✅ Active | API key + localStorage |
| **Rate Limiting** | ✅ Active | 10 req/s with burst |
| **Real-Debrid** | ✅ Configured | API key in .env |
| **Logo Assets** | ✅ Complete | 4 SVG variations + preview |
| **Database** | ✅ Running | SQLite (overlord.db) |
| **PWA Support** | ✅ Ready | manifest.json configured |
| **Security Headers** | ✅ Active | CSP, X-Frame-Options |

### ⚠️ OPTIONAL FEATURES (Disabled)

| Component | Status | How to Enable |
|-----------|--------|---------------|
| **Firebase Sync** | ⏸️ Disabled | Set `firebase.enabled: true` |
| **Prometheus** | ⏸️ Disabled | Set `prometheus_enabled: true` |
| **App Insights** | ⏸️ Disabled | Set `appinsights_enabled: true` |

---

## 🏗️ ARCHITECTURE BREAKDOWN

### 1. FRONTEND LAYER

```
┌─────────────────────────────────────┐
│         BROWSER / PWA               │
├─────────────────────────────────────┤
│  index.html        - Main UI        │
│  style.css         - Cyberpunk CSS  │
│  app.js            - Core Logic     │
│  realdebrid_*.js   - Streaming      │
├─────────────────────────────────────┤
│  Libraries:                         │
│  • React (bundled)                  │
│  • Recharts (graphs)                │
└─────────────────────────────────────┘
           │
           │ HTTP/JSON
           │ X-API-Key Header
           ▼
```

### 2. BACKEND LAYER

```
┌─────────────────────────────────────┐
│      PYTHON SERVER (server.py)      │
├─────────────────────────────────────┤
│  Port: 8080                         │
│  Host: 127.0.0.1 (localhost)        │
├─────────────────────────────────────┤
│  Endpoints:                         │
│  • GET  /api/health     - Status    │
│  • GET  /api/config     - Settings  │
│  • GET  /api/stats      - System    │
│  • GET  /api/history    - History   │
│  • POST /api/stream/*   - Torrents  │
├─────────────────────────────────────┤
│  Security:                          │
│  • Token Auth (API Key)             │
│  • Rate Limiting (10/s)             │
│  • Request Validation               │
│  • Secure Headers                   │
└─────────────────────────────────────┘
           │
           │ Data Collection
           ▼
```

### 3. DATA COLLECTION LAYER

```
┌─────────────────────────────────────┐
│      SYSTEM MONITORING              │
├─────────────────────────────────────┤
│  psutil (Python):                   │
│  • CPU usage & frequency            │
│  • RAM usage & available            │
│  • Disk usage per volume            │
│  • Network I/O stats                │
│  • Process list (top 5)             │
│  • Temperature sensors              │
├─────────────────────────────────────┤
│  GPU (optional):                    │
│  • nvidia-smi (NVIDIA)              │
│  • rocm-smi (AMD)                   │
├─────────────────────────────────────┤
│  Docker (optional):                 │
│  • Container list                   │
│  • Container status                 │
└─────────────────────────────────────┘
```

### 4. EXTERNAL INTEGRATIONS

```
┌─────────────────────────────────────┐
│      REAL-DEBRID (L1T_GRID)         │
├─────────────────────────────────────┤
│  Status: ✅ CONFIGURED              │
│  Key: RD_API_KEY in .env            │
├─────────────────────────────────────┤
│  Features:                          │
│  • Add magnet links                 │
│  • Track torrent progress           │
│  • Stream unrestrict                │
│  • Auto-refresh (10s)               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      FIREBASE (Optional)            │
├─────────────────────────────────────┤
│  Status: ⏸️ DISABLED                │
│  Config: firebase.enabled: false    │
├─────────────────────────────────────┤
│  Features:                          │
│  • Real-time sync                   │
│  • Cloud hosting                    │
│  • Cross-device access              │
└─────────────────────────────────────┘
```

---

## 📁 PROJECT STRUCTURE

```
Overlord-Pc-Dashboard/
│
├── 📄 ROOT FILES
│   ├── server.py              ← Main server (71KB)
│   ├── config.yaml            ← Configuration
│   ├── .env                   ← Environment/Secrets
│   ├── index.html             ← Dashboard UI (21KB)
│   ├── app.js                 ← Frontend logic (25KB)
│   ├── style.css              ← Cyberpunk styles (39KB)
│   ├── realdebrid_controller.js ← Streaming (7KB)
│   ├── manifest.json          ← PWA manifest
│   └── overlord.db            ← SQLite database (69KB)
│
├── 🎨 ASSETS/
│   ├── logo-overlord.svg           ← Main logo
│   ├── logo-overlord-simple.svg    ← Simplified
│   ├── logo-overlord-minimal.svg   ← Tiny
│   ├── logo-overlord-animated.svg  ← Animated
│   ├── logo-preview.html           ← Preview page
│   └── generate-pngs.py            ← PNG generator
│
├── 📚 JS/ (Libraries)
│   ├── react.production.min.js
│   ├── react-dom.production.min.js
│   └── Recharts.js
│
├── 📂 MODULES/
│   ├── dashboard/       ← Core server module
│   ├── grid/            ← L1T_GRID streaming
│   ├── social/          ← Social hub (static)
│   ├── makt/            ← Makt universal
│   └── movie-review/    ← Movie reviews
│
├── 📂 L1T_GRID/
│   ├── server.py        ← Streaming server
│   ├── index.html       ← Streaming UI
│   └── README.md
│
└── 📜 DOCUMENTATION
    ├── MASTER_BLUEPRINT_CURRENT.md  ← You are here
    ├── PROJECT_BLUEPRINT_ENHANCED.md
    ├── ARCHITECTURE.md
    ├── VIEW_GUIDE.md
    └── README.md
```

---

## 🔐 SECURITY CONFIGURATION

```yaml
# Current Security Settings (config.yaml)

auth:
  enabled: true          # ✅ API key required
  api_key: "***"         # ✅ Strong key set

rate_limit:
  enabled: true          # ✅ Rate limiting ON
  requests_per_second: 10
  burst: 20

security:
  secure_headers: true   # ✅ Security headers ON
  csp: "default-src 'self'..."
```

### API Key Storage

| Location | Purpose |
|----------|---------|
| `config.yaml` | Server-side validation |
| `localStorage` | Client-side persistence |
| Browser prompt | First-time entry |

---

## 🚀 QUICK START COMMANDS

```bash
# 1. START SERVER
python server.py

# 2. VIEW DASHBOARD
http://localhost:8080

# 3. VIEW LOGO PREVIEW
open assets/logo-preview.html

# 4. RUN PROJECT SCANNER
python scan-project.py

# 5. SMART SETUP (one command)
.\setup-smart.ps1
```

---

## 📊 DATA FLOW

```
┌──────────────┐     Poll (2s)      ┌──────────────┐
│   Browser    │ ──────────────────> │   Server     │
│  (Dashboard) │   X-API-Key         │  (Python)    │
└──────────────┘                     └──────────────┘
       │                                     │
       │ JSON Response                       │ psutil
       │ {cpu, ram, disk...}                 │
       │                                     ▼
       │                            ┌──────────────┐
       │                            │   System     │
       │                            │   Stats      │
       │                            └──────────────┘
       │
       ▼
┌──────────────┐
│  UI Update   │
│  - Charts    │
│  - Gauges    │
│  - Colors    │
└──────────────┘
```

---

## 🎨 VISUAL DESIGN SYSTEM

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Cyan | `#52f2ff` | Primary accent, glows |
| Magenta | `#ff4ddb` | Secondary, alerts |
| Gold | `#f8d874` | Highlights, warnings |
| Green | `#50f0a6` | Success, status OK |
| Red | `#ff4d6d` | Errors, critical |
| Background | `#0a0a0f` | Deep space black |

### Typography
- **Mono:** JetBrains Mono (code, metrics)
- **Sans:** Space Grotesk (headings, UI)

### Logo Symbol
```
◈  (Diamond with vertical line)
```
Represents: Core monitoring, central control, all-seeing

---

## 🔧 CONFIGURATION FILES

### config.yaml
```yaml
server:
  host: "127.0.0.1"  # localhost only
  port: 8080

auth:
  enabled: true
  api_key: "***"     # Your secure key

dashboard:
  refresh_interval_ms: 5000  # 5 seconds
```

### .env
```bash
RD_API_KEY=FO7CDC...       # Real-Debrid
FIREBASE_PROJECT_ID=...     # Optional
```

---

## ✅ COMPLETION CHECKLIST

### Core Features
- [x] Real-time system monitoring
- [x] CPU/RAM/Disk/Network stats
- [x] GPU monitoring (auto-detect)
- [x] Temperature sensors
- [x] Process list (top 5)
- [x] Historical charts
- [x] Docker container list
- [x] Service health checks

### Security
- [x] API key authentication
- [x] Rate limiting
- [x] Secure headers
- [x] Input validation
- [x] Request logging

### Integrations
- [x] Real-Debrid streaming
- [x] L1T_GRID torrent manager
- [x] Service health (N8N, Nextcloud, etc.)

### UI/UX
- [x] Cyberpunk glassmorphism design
- [x] Responsive layout
- [x] PWA support
- [x] Logo/assets
- [x] Dark theme

### DevOps
- [x] Configuration file
- [x] Logging system
- [x] Database persistence
- [x] Error handling
- [x] Health checks

---

## 🎯 NEXT STEPS (OPTIONAL)

1. **Enable Firebase Cloud Sync**
   - Set `firebase.enabled: true`
   - Add firebase-key.json

2. **Enable Prometheus Monitoring**
   - Set `prometheus_enabled: true`
   - Access metrics at :9090

3. **Generate PNG Logos**
   - Run `python assets/generate-pngs.py`
   - For app stores/favicons

4. **Deploy to Cloud**
   - Use deploy-firebase.ps1
   - Or deploy to VPS

---

## 📞 SUPPORT

| Resource | Location |
|----------|----------|
| Main README | `README.md` |
| Setup Guide | `VIEW_GUIDE.md` |
| Architecture | `ARCHITECTURE.md` |
| Project Scanner | `scan-project.py` |
| Smart Setup | `setup-smart.ps1` |

---

## 🏆 STATUS: MISSION ACCOMPLISHED

**System Overlord v4.2.1 is production-ready and fully operational.**

All critical components are in place:
- ✅ Monitoring dashboard
- ✅ Security hardened
- ✅ Real-Debrid streaming
- ✅ Professional logo/assets
- ✅ Database persistence

**You are ready to dominate your system monitoring.**

---

*◈ Overlord Grid v4.2.1 - Security Hardened*

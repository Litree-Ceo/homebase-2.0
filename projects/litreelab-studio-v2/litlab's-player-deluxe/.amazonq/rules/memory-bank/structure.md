# Project Structure

## Directory Organization

```
Overlord-Monolith/
├── .amazonq/rules/memory-bank/    # Amazon Q Memory Bank documentation
├── .github/workflows/             # CI/CD pipelines (deploy, lint, test, security)
├── .qodo/                         # Qodo agent configurations
├── _archive/                      # Archived Termux setup scripts and guides
├── config/                        # Centralized service configurations
│   └── services.yaml              # Service definitions for systemd/Windows
├── docs/                          # Project documentation
│   ├── INDEX.md                   # Documentation index
│   └── WEB-SECURITY-BASELINE.md   # Security guidelines
├── modules/                       # Core application modules
│   ├── dashboard/                 # PC monitoring dashboard (Python)
│   ├── grid/                      # Data grid & analytics (Python)
│   └── social/                    # Community & collaboration (Node.js)
├── repos/                         # Integrated sub-repositories
│   ├── HomeBase-2.0/              # Main web application monorepo
│   ├── homebase-portfolio/        # Portfolio website
│   ├── Lit-Lab-Studio-MetAveRsE/  # Metaverse project
│   ├── LitMaSter1/                # Smart contract platform
│   ├── LiTreeStudio/              # Studio web application
│   ├── servers/                   # MCP server implementations
│   └── website-project/           # Website infrastructure
├── scripts/                       # Automation and utility scripts
│   ├── generate-services.py       # Service file generator
│   ├── launcher.py                # Multi-service launcher
│   ├── validate-env.py            # Environment validation
│   └── pre-commit.py              # Git pre-commit hooks
├── tools/                         # External tools and utilities
│   ├── nginx/                     # Nginx web server
│   └── nssm-2.24/                 # Windows service manager
├── config.yaml                    # Global configuration
├── docker-compose.yml             # Docker orchestration
├── pyproject.toml                 # Python project metadata
├── requirements.txt               # Python dependencies
└── README.md                      # Project documentation
```

## Core Components

### 1. Dashboard Module (`modules/dashboard/`)
**Purpose**: Real-time PC monitoring with cyberpunk UI

**Key Files**:
- `server.py` - Python HTTP server with auth, rate limiting, stats collection
- `index.html` - Glassmorphism dashboard UI
- `style.css` - Cyberpunk/neon styling
- `config.yaml` - Server configuration (port, API key, refresh rate, logging)
- `manifest.json` - PWA manifest for mobile installation
- `dev-watch.ps1/sh` - Live development file watchers

**Architecture**:
- Backend: Python HTTP server using psutil for system metrics
- Frontend: Vanilla HTML/CSS/JavaScript with localStorage for API key
- Data Flow: Client polls `/api/stats` every 2s with X-API-Key header
- GPU Detection: Subprocess calls to nvidia-smi/rocm-smi

### 2. Social Module (`modules/social/`)
**Purpose**: Community and collaboration features

**Key Files**:
- `app.js` - Node.js Express server
- `index.html` - Social interface UI
- `firebase.json` - Firebase configuration
- `firestore.rules` - Firestore security rules
- `overlord-social.service` - systemd service definition

**Architecture**:
- Backend: Node.js with Firebase Realtime Database
- Port: 5001 (configurable via SOCIAL_PORT)
- Health Check: `http://localhost:5001/api/health`

### 3. Grid Module (`modules/grid/`)
**Purpose**: Data grid and analytics

**Key Files**:
- `server.py` - Python analytics server
- `index.html` - Grid interface
- `requirements.txt` - Python dependencies

**Architecture**:
- Backend: Python HTTP server
- Port: 5002 (configurable via GRID_PORT)
- Health Check: `http://localhost:5002/api/health`

### 4. Configuration System (`config/services.yaml`)
**Purpose**: Single source of truth for all services

**Structure**:
```yaml
global:
  after: network-online.target
  restart_policy: on-failure
  restart_sec: 10

services:
  dashboard:
    description: "Overlord Dashboard - System Monitor"
    executable: "${PYTHON_BIN:-python3}"
    working_directory: "${ROOT_DIR}/modules/dashboard"
    environment: [...]
    health_check: {...}
```

**Generated Outputs**:
- systemd service files (Linux)
- Windows service definitions (NSSM)
- PM2 ecosystem files (Node.js)

### 5. Scripts Directory (`scripts/`)
**Purpose**: Automation and tooling

**Key Scripts**:
- `generate-services.py` - Generates service files from services.yaml
- `launcher.py` - Cross-platform service launcher
- `validate-env.py` - Environment variable validation
- `pre-commit.py` - Git pre-commit hooks
- `lint-all.ps1/sh` - Code quality checks
- `validate-firebase-rules.sh` - Firebase security validation

### 6. Repositories (`repos/`)
**Purpose**: Integrated sub-projects

**Major Repositories**:
- **HomeBase-2.0**: Full-stack web application with trading bots, dashboards, and Meta integration
- **homebase-portfolio**: Portfolio website with Firebase hosting
- **servers**: MCP (Model Context Protocol) server implementations
- **LiTreeStudio**: Studio web application with Socket.IO
- **website-project**: Infrastructure and deployment configurations

## Architectural Patterns

### 1. Configuration-Driven Design
- All settings in YAML files (config.yaml, services.yaml)
- No hardcoded values in source code
- Environment variable substitution: `${VAR:-default}`

### 2. Modular Service Architecture
- Each module is self-contained with own dependencies
- Standardized health check endpoints (`/api/health`)
- Consistent port allocation (5000-5002)
- Independent deployment and scaling

### 3. Cross-Platform Support
- PowerShell scripts for Windows (`.ps1`)
- Bash scripts for Linux/Mac/Termux (`.sh`)
- Docker support via docker-compose.yml
- systemd services for Linux
- NSSM for Windows services

### 4. Security Layers
- API key authentication (X-API-Key header)
- Rate limiting (token-bucket algorithm)
- Firebase security rules
- Environment variable secrets
- CORS configuration

### 5. Development Workflow
- Live reload with file watchers (dev-watch scripts)
- Automated testing (pytest, jest)
- Pre-commit hooks for code quality
- CI/CD pipelines (.github/workflows/)
- Linting and formatting (black, ruff, eslint, prettier)

### 6. Monitoring & Logging
- Rotating file logs (1MB rotation, 3 backups)
- Configurable log levels (DEBUG, INFO, WARNING, ERROR)
- Health check endpoints for all services
- Process monitoring via systemd/PM2

## Component Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    Overlord Monolith                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │    Social    │  │     Grid     │ │
│  │  (Python)    │  │  (Node.js)   │  │  (Python)    │ │
│  │  Port: 5000  │  │  Port: 5001  │  │  Port: 5002  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │         │
│         └─────────────────┴──────────────────┘         │
│                           │                            │
│                  ┌────────▼────────┐                   │
│                  │  config.yaml    │                   │
│                  │  services.yaml  │                   │
│                  └────────┬────────┘                   │
│                           │                            │
│         ┌─────────────────┴─────────────────┐         │
│         │                                   │         │
│  ┌──────▼───────┐                  ┌────────▼──────┐  │
│  │   Scripts    │                  │     Repos     │  │
│  │  (Automation)│                  │ (Sub-projects)│  │
│  └──────────────┘                  └───────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Dashboard Stats Collection
1. Client browser loads index.html
2. JavaScript fetches `/api/config` (no auth) for refresh interval
3. Client polls `/api/stats` every 2s with X-API-Key header
4. Server.py collects metrics via psutil and subprocess (GPU)
5. Response compressed with gzip, sent as JSON
6. Client updates UI with sparkline charts and progress bars

### Service Management
1. Developer edits services.yaml
2. Runs `python scripts/generate-services.py`
3. Script generates systemd/NSSM/PM2 files
4. Services deployed via `start-all.ps1` or systemd
5. Health checks monitor service status
6. Logs written to rotating files

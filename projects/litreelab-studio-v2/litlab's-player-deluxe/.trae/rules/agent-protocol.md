# Overlord PC Dashboard - Agent Guide

<!--
  This file is for AI coding agents working on this project.
  It contains project-specific context, conventions, and technical details.
  Keep this updated when architecture or tooling changes.
-->

---

## Project Overview

**Overlord PC Dashboard** is a cyberpunk-themed, real-time PC monitoring dashboard with streaming capabilities. It provides live CPU, RAM, disk, GPU, temperatures, and process stats — updated every 2-5 seconds via a glassmorphism UI with neon glow aesthetics.

**Current Version:** 4.2.1 (as defined in `server.py`)

**Key Capabilities:**
- Real-time system monitoring (CPU, RAM, disk, network, temperatures)
- GPU monitoring via nvidia-smi / rocm-smi (auto-detected)
- PWA support with offline capabilities
- Token-based API authentication with rate limiting
- Real-Debrid streaming integration (torrent management, link unrestricting)
- Firebase cloud sync (optional)
- ADB device management for Android devices
- Termux SSH integration for remote mobile development
- SQLite-backed metrics storage with automatic cleanup

---

## Technology Stack

### Backend
- **Language:** Python 3.12+
- **HTTP Server:** Custom `http.server` (embedded in `server.py`)
- **Process Monitoring:** `psutil`
- **Database:** SQLite (for metrics persistence)
- **Configuration:** YAML (`config.yaml`) + Environment variables (`.env`)
- **Logging:** Python `logging` with rotating file handlers and JSON format support

### Frontend
- **HTML/CSS:** Single-page application with cyberpunk/glassmorphism styling
- **JavaScript:** Vanilla JS (no framework), React/Recharts for charts
- **PWA:** Service worker ready, manifest.json configured
- **UI Library:** Custom CSS with neon glow effects

### Node.js Components
- **Firebase Functions:** Node.js 24 runtime with firebase-admin and firebase-functions
- **Testing:** Jest with jsdom environment for JavaScript tests
- **Transpilation:** Babel for ES6+ support

### External Integrations
- **Firebase:** Realtime Database, Cloud Functions, Hosting
- **Real-Debrid:** API for streaming/torrent management
- **Google Gemini:** AI assistant integration (optional)
- **ADB:** Android Debug Bridge for device management
- **Termux:** SSH-based remote command execution

---

## Project Structure

```
Overlord-Pc-Dashboard/
├── server.py                    # Main Python HTTP server (monolithic backend)
├── config.yaml                  # Server configuration (YAML format)
├── .env / .env.example          # Environment variables (API keys, credentials)
├── requirements.txt             # Python dependencies
│
├── index.html                   # Main dashboard UI (PWA entry)
├── home.html                    # Alternative home view
├── ai-assistant.html            # AI chat interface
├── style.css / style.min.css    # Cyberpunk/glassmorphism styles
├── manifest.json                # PWA manifest
│
├── app.js                       # Main frontend application logic
├── realdebrid_controller.js     # Real-Debrid streaming UI controller
├── mock-ai-assistant.js         # Mock AI responses for testing
│
├── Python Modules:
│   ├── adb_manager.py           # Android Debug Bridge operations
│   ├── termux_manager.py        # SSH-based Termux remote management
│   ├── mock_ai_assistant.py     # Simulated AI assistant responses
│   ├── gemini_agent.py          # Google Gemini AI integration
│   └── aider_agent.py           # Aider coding assistant integration
│
├── tests/                       # Python test suite
│   ├── test_server.py           # Unit and integration tests
│   ├── test_api.py              # API endpoint tests
│   └── conftest.py              # pytest fixtures
│
├── functions/                   # Firebase Cloud Functions (Node.js)
│   ├── index.js                 # Main functions entry point
│   ├── package.json             # Node dependencies for functions
│   └── src/                     # Function implementations
│
├── scripts/                     # Utility scripts
│   ├── lint-all.ps1 / .sh       # Linting scripts
│   ├── pre-commit.py            # Git pre-commit hook
│   ├── validate-env.py          # Environment validation
│   └── *.ps1, *.sh              # Various deployment/helper scripts
│
├── overlord-dashboard/          # Legacy/extended dashboard components
├── overlord-modern/             # Modern dashboard version
├── overlord-monolith/           # Monolithic architecture components
├── modules/                     # Feature modules
│   ├── dashboard/               # Dashboard module
│   └── social/                  # Social features
│
├── firebase.json                # Firebase configuration
├── firestore.rules              # Firestore security rules
├── Dockerfile                   # Container build definition
├── docker-compose.yml           # Docker Compose setup
├── jest.config.js               # JavaScript test configuration
├── pyrightconfig.json           # Python type checking config
├── .pylintrc                    # Python linting rules
└── package.json                 # Root Node.js dependencies (Jest testing)
```

---

## Configuration System

The project uses a hierarchical configuration system:

1. **Default values** (hardcoded in `server.py` `DEFAULTS` dict)
2. **config.yaml** (overrides defaults)
3. **Environment variables** (highest priority, loaded from `.env`)

### Key Configuration Files

**`config.yaml`** - Main server settings:
```yaml
server:
  host: "127.0.0.1"
  port: 8080

auth:
  enabled: true
  api_key: ""  # Loaded from .env API_KEY

rate_limit:
  enabled: true
  requests_per_second: 10
  burst: 20
  block_duration: 60

dashboard:
  refresh_interval_ms: 5000
  max_history_entries: 60

logging:
  level: "INFO"
  file: "overlord.log"
  max_bytes: 1048576
  backup_count: 3
  json_format: false

security:
  csp: "..."  # Content Security Policy
  secure_headers: true
  cors_origins: []
  allowed_hosts: ["localhost", "127.0.0.1", "::1"]

database:
  enabled: true
  path: "overlord.db"
  retention_days: 30

firebase:
  enabled: true
  config: ""  # From FIREBASE_CONFIG env var
```

**`.env`** - Secrets and credentials (never commit):
- `API_KEY` - Dashboard API authentication key (32+ chars recommended)
- `OVERLORD_AUTH_TOKEN` - WebSocket bridge auth token
- `RD_API_KEY` - Real-Debrid API key for streaming
- `FIREBASE_CONFIG` - Firebase service account JSON
- `FIREBASE_DATABASE_URL` - Firebase Realtime Database URL
- `TERMUX_HOST/PORT/USER/PASS` - SSH connection to Termux
- `OPENAI_API_KEY` / `GEMINI_API_KEY` - AI service keys

---

## API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/health` | No | Server health check |
| `GET /api/config` | No | Safe config subset (refresh interval, auth status) |
| `GET /api/stats` | Yes | Full system snapshot (CPU, RAM, disk, GPU, processes) |
| `GET /api/history` | Yes | Last N CPU/RAM data points |
| `GET /api/stream/config` | Yes | Real-Debrid configuration status |
| `GET /api/stream/torrents` | Yes | Active torrents list |
| `POST /api/stream/add` | Yes | Add magnet link to Real-Debrid |
| `GET /api/stream/unrestrict` | Yes | Unrestrict a download link |

**Authentication:**
- Header: `X-API-Key: your-key-here`
- Query param: `?api_key=your-key-here` (for testing)

---

## Build and Run Commands

### Python Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python server.py

# Run with live reload (Windows)
.\dev-watch.ps1

# Run with live reload (Linux/Mac)
./dev-watch.sh
```

### Docker
```bash
# Build and run with Docker Compose
docker-compose up -d

# Build image only
docker build -t overlord-dashboard .
```

### Firebase
```bash
# Install Firebase CLI globally first: npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize (if needed)
firebase init

# Deploy functions
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting

# Start emulators
firebase emulators:start
```

### Testing
```bash
# Python tests (pytest)
pytest tests/ -v

# Python tests (unittest fallback)
python tests/test_server.py

# JavaScript tests (Jest)
npm test

# Lint Python
pylint *.py
mypy *.py --ignore-missing-imports

# Lint all (PowerShell)
.\scripts\lint-all.ps1
```

---

## Code Style Guidelines

### Python
- **Formatter:** Follow PEP 8, max line length 120 characters (`.pylintrc`)
- **Type Hints:** Use type annotations where practical (checked with pyright)
- **Docstrings:** Use double quotes for docstrings, Google-style
- **Imports:** Group imports: stdlib, third-party, local; sorted alphabetically
- **Naming:**
  - `snake_case` for functions, variables, modules
  - `PascalCase` for classes
  - `UPPER_CASE` for constants
- **Error Handling:** Use specific exceptions, log with context
- **Security:**
  - Sanitize all user inputs (see `Validator` class in `server.py`)
  - Never log API keys or secrets (use `Validator.sanitize_log()`)
  - Validate API keys on startup (minimum 32 characters)

### JavaScript
- **Style:** ES6+ features preferred
- **Indentation:** 4 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for classes
  - `UPPER_CASE` for constants
- **Comments:** Use `//` for single-line, `/* */` for multi-line
- **Error Handling:** Always use try/catch for async operations

### CSS
- **Naming:** Use BEM-like naming (`.component__element--modifier`)
- **Organization:** Group by component, then by property type
- **Variables:** CSS custom properties in `:root` for theming
- **Comments:** Use `/* ── Section Name ── */` for major sections

---

## Testing Strategy

### Python Tests
Located in `tests/` directory, using pytest framework:

- **Unit Tests:** Test individual functions (rate limiter, config merging, validators)
- **Integration Tests:** Test full HTTP request/response cycle
- **Test Files:**
  - `test_server.py` - Core server functionality
  - `test_api.py` - API endpoint tests
  - `conftest.py` - Shared fixtures and configuration

**Key Test Patterns:**
```python
# Mock external dependencies
@pytest.fixture
def mock_psutil():
    with patch('''server.psutil''') as m:
        yield m

# Test with temporary database
@pytest.fixture
def temp_db(tmp_path):
    db_path = tmp_path / "test.db"
    return MetricsDatabase(str(db_path))
```

### JavaScript Tests
Using Jest with jsdom environment:

- **Configuration:** `jest.config.js`
- **Setup:** `jest.setup.js`
- **Coverage:** Collects from `overlord-dashboard/` JS files
- **Environment:** Simulates browser DOM with jsdom

---

## Security Considerations

### Authentication & Authorization
- API key required for all sensitive endpoints (`/api/stats`, `/api/history`)
- Keys must be 32+ characters, alphanumeric with `_-` only
- Rate limiting: Token bucket algorithm (default 10 req/s, burst 20)
- Block duration: 60 seconds for exceeded limits

### Input Validation
- All inputs validated via `Validator` class in `server.py`
- Magnet link validation for torrent features
- URL validation with private IP blocking
- Log sanitization to prevent credential leakage

### Security Headers
- Content Security Policy (CSP) configured
- Secure headers enabled by default
- CORS origins must be explicitly allowed
- Host validation against allowed list

### Secrets Management
- API keys stored in `.env` (never commit)
- Keys loaded from environment override config.yaml
- Log sanitization removes API keys, tokens, passwords
- Firebase config from environment variable, not file

---

## Development Workflow

### Local Development
1. Copy `.env.example` to `.env` and configure
2. Generate strong API key: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
3. Install Python deps: `pip install -r requirements.txt`
4. Run server: `python server.py`
5. Access at `http://localhost:8080`

### Live Development Mode
Use the watch scripts for auto-restart on file changes:
- Windows: `dev-watch.ps1` - watches server.py, index.html, style.css, config.yaml
- Linux/Mac: `dev-watch.sh` - same functionality

### Pre-commit Checks
Run before committing:
```bash
# Python linting
pylint *.py

# Type checking
pyright

# Run tests
pytest

# Validate environment
python scripts/validate-env.py
```

### Deployment
- **Docker:** `docker-compose up -d`
- **Firebase:** `firebase deploy`
- **PowerShell:** Various deploy scripts (`deploy.ps1`, `deploy-firebase.ps1`)

---

## Common Tasks

### Adding a New API Endpoint
1. Add route handler in `server.py` (search for `# ════════════════════════════════════════` for organization)
2. Add authentication check if needed: `if AUTH_ON and not self._check_auth():`
3. Add input validation using `Validator` class
4. Add test in `tests/test_server.py`
5. Document in this file under API Endpoints

### Adding a New Python Module
1. Create module file in root or appropriate subdirectory
2. Import in `server.py` if needed for startup
3. Add type hints and docstrings
4. Update tests if public API

### Modifying Configuration
1. Add default to `DEFAULTS` dict in `server.py`
2. Add to `config.yaml` with documentation comment
3. Add to `.env.example` if it accepts env override
4. Load in `load_config()` if complex merging needed
5. Document in this file

### Adding Frontend Features
1. Modify `index.html` for structure
2. Add styles to `style.css` (following existing CSS variables)
3. Add JavaScript to `app.js` or create new module file
4. Import in `index.html` if new file
5. Update PWA cache version if service worker exists

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Change `server.port` in `config.yaml` |
| Stats show `—` | `pip install psutil` |
| "DEFAULT API KEY" warning | Set `auth.api_key` in `.env` |
| Can'''t reach from phone | Firewall must allow port; use PC'''s local IP |
| GPU section missing | Install `nvidia-smi` or `rocm-smi` and ensure on PATH |
| Temperatures missing | psutil sensor support requires Linux or macOS |
| PyYAML not found | `pip install pyyaml` |
| Import errors | Ensure `PYTHONPATH=.` in `.env` |

---

## External Resources

- **README.md** - User-facing documentation
- **ARCHITECTURE.md** - Visual architecture diagram (Mermaid)
- **DEPLOYMENT.md** - Deployment guide
- **FIREBASE-SETUP.md** - Firebase configuration guide
- **DEVELOPMENT_HANDBOOK.md** - Extended development guide
- **QUICK-REFERENCE.md** - Quick command reference

---

## File Naming Conventions

- **Python modules:** `snake_case.py`
- **JavaScript files:** `camelCase.js` or `descriptive-name.js`
- **PowerShell scripts:** `Verb-Noun.ps1` (e.g., `deploy-firebase.ps1`)
- **Shell scripts:** `descriptive-name.sh`
- **Documentation:** `ALL_CAPS.md` for important docs, `PascalCase.md` for guides
- **Configuration:** `lowercase.yaml` or `lowercase.json`

---

*Last updated: 2026-03-06*
*Project Version: 4.2.1*
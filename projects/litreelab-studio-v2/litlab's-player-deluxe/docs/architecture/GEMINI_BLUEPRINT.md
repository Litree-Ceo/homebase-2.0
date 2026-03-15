# OVERLORD MONOLITH - Master Project Blueprint

## IDENTITY
**Project**: Overlord Monolith  
**Type**: Multi-module system monitoring & web application platform  
**Primary Language**: Python 3.9+ (backend), JavaScript/Node.js (frontend/social)  
**Architecture**: Monorepo with modular services  

---

## CORE MODULES

### 1. Dashboard (modules/dashboard/)
- **Purpose**: Real-time PC monitoring with cyberpunk UI
- **Tech**: Python HTTP server + vanilla HTML/CSS/JS
- **Port**: 5000 (configurable via DASHBOARD_PORT)
- **Key Files**: server.py, index.html, style.css, config.yaml
- **Features**: CPU/RAM/Disk/GPU stats, rate limiting, API auth, PWA support
- **Run**: `python server.py` or `./dev-watch.ps1` (live reload)

### 2. Social (modules/social/)
- **Purpose**: Community & collaboration features
- **Tech**: Node.js + Express + Firebase
- **Port**: 5001 (configurable via SOCIAL_PORT)
- **Key Files**: app.js, firebase.json, firestore.rules
- **Run**: `node app.js`

### 3. Grid (modules/grid/)
- **Purpose**: Data grid & analytics
- **Tech**: Python HTTP server
- **Port**: 5002 (configurable via GRID_PORT)
- **Key Files**: server.py, index.html
- **Run**: `python server.py`

---

## CONFIGURATION SYSTEM

### Central Config (config/services.yaml)
- **Single source of truth** for all service definitions
- Environment variable substitution: `${VAR:-default}`
- Generates systemd (Linux) and NSSM (Windows) service files
- Run generator: `python scripts/generate-services.py`

### Module Config (modules/*/config.yaml)
- Module-specific settings (ports, API keys, logging)
- Deep merge with defaults in code
- Never commit secrets (use .env or environment variables)

---

## DEVELOPMENT WORKFLOW

### Setup
```bash
# Python modules (dashboard, grid)
cd modules/dashboard
pip install -r requirements.txt
python server.py

# Node.js modules (social)
cd modules/social
npm install
node app.js
```

### Live Development
```powershell
# Windows - auto-restart on file changes
.\dev-watch.ps1

# Linux/Mac
./dev-watch.sh
```

### Code Quality
```bash
# Python
black . --line-length 120
ruff check .
mypy modules/ scripts/

# JavaScript
npm run lint
```

### Testing
```bash
# Python
pytest tests/ -v

# Node.js
npm test
```

---

## ARCHITECTURAL PATTERNS

### 1. Configuration-Driven Design
- All settings in YAML files (config.yaml, services.yaml)
- No hardcoded values in source code
- Environment variable substitution with defaults

### 2. Security Layers
```
Request → Public Endpoints (no auth)
       → Rate Limiting (token-bucket, 5 req/s per IP)
       → Authentication (X-API-Key header)
       → Protected Endpoints
```

### 3. Optional Dependencies
```python
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
    log.warning("psutil not found")
```

### 4. Deep Config Merge
```python
def _deep_merge(base: dict, override: dict) -> dict:
    out = dict(base)
    for k, v in override.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out
```

### 5. Thread-Safe Rate Limiting
```python
class RateLimiter:
    def __init__(self, rate: float, burst: int):
        self._rate = rate
        self._burst = burst
        self._buckets: dict = {}
        self._lock = threading.Lock()
```

---

## API CONVENTIONS

### Health Check (All Modules)
```
GET /api/health
Response: {"status": "ok", "uptime_s": 123, "version": "4.0.0"}
```

### Dashboard Endpoints
```
GET /api/config       # Public - refresh interval, auth status
GET /api/stats        # Protected - full system snapshot
GET /api/history      # Protected - last 60 CPU/RAM samples
```

### Authentication
```
Header: X-API-Key: your-key-here
Query:  /api/stats?api_key=your-key-here
```

---

## CODING STANDARDS

### Python
- **Line length**: 120 characters
- **Formatter**: Black v23.12.1+
- **Linter**: Ruff v0.1.9+ + Pylint v3.0.3+
- **Type hints**: MyPy v1.7.1+ with `ignore_missing_imports = true`
- **Naming**: `snake_case` functions, `PascalCase` classes, `UPPER_SNAKE_CASE` constants

### JavaScript
- **Module system**: ES modules (`"type": "module"`)
- **Formatter**: Prettier v3.x
- **Linter**: ESLint v8.x/v9.x
- **React**: v19.x with hooks
- **Naming**: `camelCase` functions, `PascalCase` components

### Logging
```python
log.info("Server started on %s:%d", HOST, PORT)
log.warning("Default API key — change in config.yaml")
log.error("Failed: %s", error, exc_info=True)
log.debug("Rate limit: %s → %s", ip, allowed)
```

---

## COMMON TASKS

### Generate API Key
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Start All Services
```powershell
# Windows
.\start-all.ps1

# Linux
./start-all.sh
```

### Generate Service Files
```bash
python scripts/generate-services.py
```

### Deploy Dashboard
```bash
cd modules/dashboard
python server.py  # Production
./dev-watch.ps1   # Development with auto-reload
```

---

## TROUBLESHOOTING

### Port Already in Use
- Change port in `config.yaml` or module-specific config
- Default ports: Dashboard=5000, Social=5001, Grid=5002

### Missing Dependencies
```bash
# Python
pip install -r requirements.txt

# Node.js
npm install
```

### GPU Not Detected
- NVIDIA: Install nvidia-smi (included with drivers)
- AMD: Install ROCm toolkit + rocm-smi

### Auth Issues
- Check API key in config.yaml
- Clear localStorage in browser (🔑 RESET KEY button)
- Verify X-API-Key header in requests

---

## FILE STRUCTURE QUICK REFERENCE

```
Overlord-Monolith/
├── modules/
│   ├── dashboard/     # PC monitoring (Python)
│   ├── social/        # Community (Node.js)
│   └── grid/          # Analytics (Python)
├── config/
│   └── services.yaml  # Service definitions
├── scripts/
│   ├── generate-services.py
│   ├── launcher.py
│   └── pre-commit.py
├── repos/             # Integrated sub-projects
├── tools/             # nginx, nssm
├── config.yaml        # Global config
├── requirements.txt   # Python deps
└── README.md
```

---

## CRITICAL RULES

1. **Never hardcode values** - use config.yaml or environment variables
2. **Always validate input** - especially API endpoints
3. **Log with context** - include IP, path, error details
4. **Handle missing deps gracefully** - optional features should degrade
5. **Use type hints** - Python functions should have return types
6. **Test before commit** - run linters and tests
7. **Document public APIs** - brief docstrings for all endpoints
8. **Secure by default** - auth enabled, rate limiting on
9. **Cross-platform** - test on Windows and Linux
10. **Configuration-driven** - services.yaml is source of truth

---

## WHEN MAKING CHANGES

### Adding New Endpoint
1. Add route handler in server.py
2. Implement auth/rate limiting checks
3. Add logging for requests
4. Update API documentation
5. Test with curl/Postman

### Adding New Module
1. Create directory in modules/
2. Add entry to config/services.yaml
3. Implement /api/health endpoint
4. Add requirements.txt or package.json
5. Create dev-watch script
6. Run generate-services.py

### Modifying Config
1. Edit config/services.yaml (not generated files)
2. Run `python scripts/generate-services.py`
3. Restart affected services
4. Test health checks

---

## DEPENDENCIES

### Python Core
- psutil==5.9.8 (system monitoring)
- pyyaml==6.0.1 (config parsing)
- requests==2.31.0 (HTTP client)
- firebase-admin==6.5.0 (optional)

### Python Dev
- pytest==7.4.3
- black==23.12.1
- ruff==0.1.9
- mypy==1.7.1

### Node.js Core
- express ^4.x
- firebase ^10.x
- socket.io ^4.x

---

## CONTACT & SUPPORT

- **Documentation**: README.md in each module
- **Memory Bank**: .amazonq/rules/memory-bank/
- **Issues**: Check logs/ directory for error details
- **Config**: All settings in config.yaml and services.yaml

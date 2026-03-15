# Development Guidelines

## Code Quality Standards

### Python Code Formatting
- **Line Length**: 120 characters maximum (configured in pyproject.toml)
- **Formatter**: Black (v23.12.1+) with automatic formatting
- **Linter**: Ruff (v0.1.9+) for fast linting + Pylint (v3.0.3+) for comprehensive checks
- **Type Checking**: MyPy (v1.7.1+) with `ignore_missing_imports = true`
- **Import Organization**: isort with Black profile, multi-line mode 3

### JavaScript/TypeScript Code Formatting
- **Formatter**: Prettier (v3.x) with consistent configuration
- **Linter**: ESLint (v8.x/v9.x) with React plugins
- **Module System**: ES modules (`"type": "module"` in package.json)
- **React Version**: React 19.x with hooks-based patterns

### Structural Conventions

#### Python Project Structure
```python
# Standard module docstring at top of file
"""
Module description — concise one-liner
Additional details about functionality, auth, rate limiting, etc.
"""

# Imports organized by category with blank lines
import standard_library
import third_party
from local_module import specific_function

# Constants in UPPER_SNAKE_CASE
DEFAULTS = {...}
API_KEY = "..."

# Functions with descriptive docstrings
def function_name(param: type) -> return_type:
    """Brief description of function purpose."""
    pass
```

#### Configuration-Driven Architecture
- **All settings in YAML files**: config.yaml, services.yaml
- **No hardcoded values**: Use environment variable substitution `${VAR:-default}`
- **Deep merge pattern**: Merge user config with defaults using recursive dict merge
- **Validation**: Schema validation for environment variables (env.schema.json)

#### Service Definition Pattern
```yaml
services:
  service_name:
    description: "Human-readable service description"
    executable: "${PYTHON_BIN:-python3}"
    working_directory: "${ROOT_DIR}/modules/service_name"
    arguments: ["server.py"]
    environment:
      - "NODE_ENV=${NODE_ENV:-development}"
    health_check:
      method: "http"
      url: "http://localhost:PORT/api/health"
```

### Textual Standards

#### Naming Conventions
- **Python**: `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants
- **JavaScript**: `camelCase` for functions/variables, `PascalCase` for components/classes
- **Files**: `kebab-case.py`, `PascalCase.jsx`, `lowercase.js`
- **Directories**: `lowercase` or `kebab-case`

#### Documentation Standards
- **Module docstrings**: Triple-quoted strings at file top with brief description
- **Function docstrings**: Brief one-liner describing purpose (not full parameter docs)
- **Inline comments**: Minimal, only for complex logic; prefer self-documenting code
- **README structure**: Quick Start → Features → Configuration → API → Troubleshooting

#### Logging Patterns
```python
# Structured logging with levels
log.info("Server started on %s:%d", HOST, PORT)
log.warning("Default API key detected — change in config.yaml")
log.error("Failed to load config: %s", error, exc_info=True)
log.debug("Rate limit check: %s → %s", ip, allowed)

# Rotating file handler configuration
logging.handlers.RotatingFileHandler(
    log_path,
    maxBytes=1_048_576,  # 1MB
    backupCount=3,
    encoding="utf-8"
)
```

## Semantic Patterns

### 1. Token-Bucket Rate Limiting
**Pattern**: Per-IP rate limiting with burst capacity
```python
class RateLimiter:
    def __init__(self, rate: float, burst: int):
        self._rate = rate      # tokens per second
        self._burst = burst    # max bucket size
        self._buckets: dict = {}  # ip -> [tokens, last_update]
        self._lock = threading.Lock()
    
    def allow(self, ip: str) -> bool:
        now = time.monotonic()
        with self._lock:
            if ip not in self._buckets:
                self._buckets[ip] = [float(self._burst), now]
            bucket = self._buckets[ip]
            elapsed = now - bucket[1]
            bucket[1] = now
            bucket[0] = min(self._burst, bucket[0] + elapsed * self._rate)
            if bucket[0] >= 1.0:
                bucket[0] -= 1.0
                return True
            return False
```
**Usage**: 5 requests/second sustained, 15 burst capacity

### 2. Deep Configuration Merge
**Pattern**: Recursively merge user config with defaults
```python
def _deep_merge(base: dict, override: dict) -> dict:
    out = dict(base)
    for k, v in override.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out

# Usage
cfg = _deep_merge(DEFAULTS, user_cfg)
```

### 3. Graceful Shutdown Pattern
**Pattern**: Signal handling for clean server shutdown
```python
def _shutdown(signum, frame):
    log.info("Shutdown signal — stopping server…")
    threading.Thread(target=httpd.shutdown, daemon=True).start()

for sig in (signal.SIGTERM, signal.SIGINT):
    try:
        signal.signal(sig, _shutdown)
    except (OSError, ValueError):
        pass  # Windows compatibility
```

### 4. Optional Dependency Detection
**Pattern**: Graceful degradation when dependencies missing
```python
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
    log.warning("psutil not found — run: pip install psutil")

# Later in code
if not HAS_PSUTIL:
    return {"error": "psutil not installed"}
```

### 5. Subprocess GPU Detection
**Pattern**: Try NVIDIA, fallback to AMD, return None if absent
```python
def get_gpu_stats() -> dict | None:
    # Try NVIDIA first
    try:
        out = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=...", "--format=csv,noheader,nounits"],
            timeout=3,
            stderr=subprocess.DEVNULL,
            text=True
        ).strip()
        if out:
            return parse_nvidia_output(out)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    
    # Try AMD
    try:
        subprocess.check_output(["rocm-smi", "--version"], timeout=2)
        return {"vendor": "AMD", "name": "AMD GPU (rocm-smi detected)"}
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    
    return None  # No GPU detected
```

### 6. HTTP Handler with Auth & Rate Limiting
**Pattern**: Layered security checks in request handler
```python
def do_GET(self):
    path = urlparse(self.path).path
    ip = self._client_ip()
    
    # Public endpoints (no auth)
    if path in ["/api/health", "/api/config"]:
        self._send_json(get_data())
        return
    
    # Rate limiting
    if not LIMITER.allow(ip):
        log.warning(f"Rate limit hit: {ip} → {path}")
        self._send_error_json(429, "Too many requests.")
        return
    
    # Authentication
    if not self._is_authenticated():
        log.warning(f"Auth failure from {ip}")
        self._send_error_json(401, "Unauthorized")
        return
    
    # Protected endpoint
    self._send_json(get_protected_data())
```

### 7. gzip Compression for API Responses
**Pattern**: Conditional compression based on Accept-Encoding header
```python
def _send_json(self, data: dict, status: int = 200):
    body = json.dumps(data, separators=(",", ":")).encode("utf-8")
    accept_enc = self.headers.get("Accept-Encoding", "")
    compressed = False
    
    if "gzip" in accept_enc and len(body) > 512:
        body = gzip.compress(body, compresslevel=6)
        compressed = True
    
    self.send_response(status)
    if compressed:
        self.send_header("Content-Encoding", "gzip")
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(body)))
    self.end_headers()
    self.wfile.write(body)
```

### 8. Historical Data Ring Buffer
**Pattern**: Thread-safe deque for time-series data
```python
from collections import deque
import threading

HISTORY_SIZE = 60
history: deque = deque(maxlen=HISTORY_SIZE)
history_lock = threading.Lock()

# Append data
with history_lock:
    history.append({"ts": time.time(), "cpu": cpu_val, "ram": ram_val})

# Read data
with history_lock:
    data = list(history)
```

### 9. Environment Variable Substitution
**Pattern**: Template string replacement with defaults
```python
def _substitute_vars(self, template: str) -> str:
    """Substitute ${VAR:-default} placeholders."""
    for key, value in self.env.items():
        # Replace ${VAR} with value
        template = template.replace(f"${{{key}}}", value)
    return template

# Usage in service generation
working_dir = "${ROOT_DIR}/modules/dashboard"
# Becomes: /home/user/overlord/modules/dashboard
```

### 10. React Test Setup with Mocks
**Pattern**: Global test environment configuration
```javascript
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-19';

configure({ adapter: new Adapter() });

// Mock browser APIs
window.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;
```

## Internal API Usage Patterns

### 1. Dashboard API Client Pattern
```javascript
// Configuration fetch (no auth)
const res = await fetch('/api/config');
const cfg = await res.json();
refreshMs = cfg.refresh_interval_ms || 2000;
authEnabled = cfg.auth_enabled === true;

// Stats fetch (with auth)
const headers = authEnabled && apiKey ? { 'X-API-Key': apiKey } : {};
const res = await fetch('/api/stats', { headers });

// Error handling
if (res.status === 401) {
    // Re-prompt for API key
    showAuthModal();
    return;
}
if (res.status === 429) {
    setStatus('RATE LIMITED', false);
    return;
}
```

### 2. Firebase Integration Pattern
```python
# Optional Firebase initialization
if CFG.get("firebase", {}).get("enabled", False):
    try:
        import firebase_admin
        from firebase_admin import credentials, db
        
        cred_path = CFG.get("firebase", {}).get("service_account_key")
        db_url = CFG.get("firebase", {}).get("database_url")
        
        if cred_path and db_url and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {"databaseURL": db_url})
            db_ref = db.reference("stats")
            HAS_FIREBASE = True
    except ImportError:
        log.warning("firebase-admin not installed")
```

### 3. Service Health Check Pattern
```python
# Health endpoint (no auth required)
@app.route('/api/health')
def health():
    return {
        "status": "ok",
        "uptime_s": int(time.time() - SERVER_START),
        "psutil": HAS_PSUTIL,
        "firebase": HAS_FIREBASE,
        "version": "4.0.0"
    }
```

### 4. Cross-Platform Path Handling
```python
def get_disk_path() -> str:
    """Get primary disk path for current platform."""
    if platform.system() == "Windows":
        return os.environ.get("SystemDrive", "C:") + "\\"
    return "/"

# Usage
primary_disk = psutil.disk_usage(get_disk_path())
```

### 5. Service File Generation Pattern
```python
class ServiceGenerator:
    def generate_systemd(self, service_name: str, config: Dict) -> str:
        """Generate systemd unit file from config."""
        template = f"""[Unit]
Description={config.get('description', service_name)}
After={','.join(config.get('systemd_after', ['network-online.target']))}

[Service]
Type={config.get('type', 'simple')}
User={config.get('user', 'overlord')}
WorkingDirectory={config.get('working_directory')}
ExecStart={config.get('executable')} {' '.join(config.get('arguments', []))}
Restart={config.get('restart_policy', 'on-failure')}

[Install]
WantedBy=multi-user.target
"""
        return self._substitute_vars(template)
```

## Frequently Used Code Idioms

### 1. Safe Dictionary Access with Defaults
```python
# Python
port = CFG.get("server", {}).get("port", 8080)
api_key = os.getenv("API_KEY") or CFG["auth"]["api_key"]

# JavaScript
const port = cfg?.server?.port ?? 8080;
const apiKey = process.env.API_KEY || config.auth.api_key;
```

### 2. Conditional Class Application
```javascript
// React className patterns
<div className={`bar-fill ${percent >= 95 ? 'bar-danger' : percent >= 85 ? 'bar-warn' : 'bar-disk'}`}>

// Conditional rendering
{gpu && <div id="gpu-section">{/* GPU stats */}</div>}
{!data.length && <span>No data available</span>}
```

### 3. Number Formatting Utilities
```python
# Python
def format_bytes(bytes_val: int) -> str:
    """Format bytes to human-readable string."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_val < 1024.0:
            return f"{bytes_val:.1f} {unit}"
        bytes_val /= 1024.0
    return f"{bytes_val:.1f} PB"

# JavaScript
function formatMB(mb) {
    if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB';
    return mb.toFixed(1) + ' MB';
}
```

### 4. Thread-Safe Singleton Pattern
```python
class RateLimiter:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
```

### 5. Async Non-Blocking Operations
```python
# Python threading for non-blocking I/O
def push_to_firebase(stats: dict):
    def _push():
        try:
            db_ref.child("latest").set(stats)
        except Exception as e:
            log.debug("Firebase push error: %s", e)
    
    threading.Thread(target=_push, daemon=True).start()

# JavaScript async/await
async function refreshStats() {
    try {
        const res = await fetch('/api/stats', { headers });
        const data = await res.json();
        updateUI(data);
    } catch (err) {
        setStatus('RECONNECTING...', false);
    }
}
```

### 6. Canvas Drawing Pattern (Sparklines)
```javascript
function drawSparkline(id, data, color, maxVal) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    
    const step = W / (data.length - 1);
    
    // Fill gradient
    ctx.beginPath();
    ctx.moveTo(0, H);
    data.forEach((v, i) => ctx.lineTo(i * step, H - (v / maxVal) * H * 0.9));
    ctx.lineTo(W, H);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '44');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fill();
    
    // Line stroke
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    data.forEach((v, i) => {
        const x = i * step;
        const y = H - (v / maxVal) * H * 0.9;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
}
```

## Popular Annotations & Type Hints

### Python Type Hints
```python
from typing import Dict, List, Optional, Union

def get_system_stats() -> dict:
    """Return system statistics dictionary."""
    pass

def _deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge two dictionaries."""
    pass

def get_gpu_stats() -> dict | None:
    """Return GPU stats or None if not available."""
    pass

class RateLimiter:
    def __init__(self, rate: float, burst: int):
        self._rate: float = rate
        self._burst: int = burst
        self._buckets: Dict[str, List[float]] = {}
```

### TypeScript/JSDoc Annotations
```typescript
// TypeScript type definitions
interface SystemStats {
    hostname: string;
    cpu: number;
    ram_percent: number;
    disk_percent: number;
    gpu?: GPUStats;
}

interface GPUStats {
    vendor: string;
    name: string;
    util_pct?: number;
    temp_c?: number;
}

// React component props
interface DashboardProps {
    refreshInterval?: number;
    authEnabled?: boolean;
}

// JSDoc for vanilla JS
/**
 * @param {string} id - Canvas element ID
 * @param {number[]} data - Data points array
 * @param {string} color - Hex color code
 * @param {number} maxVal - Maximum value for scaling
 */
function drawSparkline(id, data, color, maxVal) { }
```

### React Type Declarations
```typescript
// Module augmentation for React Three Fiber
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      ambientLight: any;
      directionalLight: any;
    }
  }
}

export {};  // Make it a module
```

## Best Practices Summary

1. **Configuration Over Code**: All settings in YAML, no hardcoded values
2. **Graceful Degradation**: Optional dependencies with feature detection
3. **Security Layers**: Auth → Rate Limiting → Business Logic
4. **Thread Safety**: Use locks for shared state (rate limiter, history buffer)
5. **Structured Logging**: Consistent format with levels (DEBUG/INFO/WARNING/ERROR)
6. **Error Handling**: Try-except with specific exceptions, log with context
7. **Type Hints**: Use Python type hints and TypeScript for better IDE support
8. **Testing**: Unit tests for core logic, integration tests for HTTP endpoints
9. **Documentation**: README-first approach, inline docs for complex logic only
10. **Cross-Platform**: Platform detection with fallbacks (Windows/Linux/macOS)

# Technology Stack

## Programming Languages

### Python (3.9+)
**Primary Language**: Dashboard and Grid modules
**Version Requirements**: >=3.9, tested on 3.9, 3.10, 3.11, 3.12
**Usage**:
- Backend HTTP servers (dashboard, grid)
- System monitoring via psutil
- Service generation scripts
- Automation and validation tools

### JavaScript/Node.js
**Secondary Language**: Social module and web frontends
**Usage**:
- Express.js servers
- Firebase integration
- Frontend UI logic (vanilla JS)
- Socket.IO real-time communication

### Shell Scripting
**Supporting Languages**:
- **PowerShell**: Windows automation (.ps1 files)
- **Bash**: Linux/Mac/Termux automation (.sh files)

## Core Dependencies

### Python Stack

#### Production Dependencies
```
firebase-admin==6.5.0      # Firebase Realtime Database, Authentication
psutil==5.9.8              # System monitoring (CPU, RAM, disk, network, processes)
pyyaml==6.0.1              # YAML configuration parsing
requests==2.31.0           # HTTP client for external APIs
```

#### Development Dependencies
```
pytest==7.4.3              # Testing framework
pytest-asyncio==0.23.2     # Async test support
black==23.12.1             # Code formatter (line-length: 120)
ruff==0.1.9                # Fast Python linter
mypy==1.7.1                # Static type checker
pylint==3.0.3              # Code quality analyzer
```

### Node.js Stack (Social Module)
```json
{
  "dependencies": {
    "express": "^4.x",
    "firebase": "^10.x",
    "firebase-admin": "^11.x",
    "socket.io": "^4.x"
  },
  "devDependencies": {
    "eslint": "^8.x",
    "prettier": "^3.x",
    "jest": "^29.x"
  }
}
```

## Build Systems & Tools

### Python Build System
**Tool**: setuptools (>=65.0)
**Configuration**: pyproject.toml
**Package Manager**: pip
**Lock File**: requirements.txt (manually maintained)

**Build Commands**:
```bash
# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Development install
pip install -e ".[dev]"

# Run tests
pytest tests/ -v

# Code formatting
black . --line-length 120

# Linting
ruff check .
pylint modules/ scripts/
```

### Node.js Build System
**Package Manager**: npm
**Lock File**: package-lock.json
**Configuration**: package.json

**Build Commands**:
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Run tests
npm test

# Linting
npm run lint
```

### Docker
**Orchestration**: docker-compose.yml
**Base Images**:
- Python: python:3.11-slim
- Node.js: node:18-alpine

**Commands**:
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Development Commands

### Dashboard Module
```bash
# Navigate to module
cd modules/dashboard

# Install dependencies
pip install -r requirements.txt

# Start server (production)
python server.py

# Start with live reload (development)
./dev-watch.ps1   # Windows
./dev-watch.sh    # Linux/Mac

# Run tests
python -m pytest tests/ -v

# Generate API key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Social Module
```bash
# Navigate to module
cd modules/social

# Install dependencies
npm install

# Start server
node app.js

# Development mode with auto-reload
npm run dev

# Run tests
npm test
```

### Grid Module
```bash
# Navigate to module
cd modules/grid

# Install dependencies
pip install -r requirements.txt

# Start server
python server.py

# Development mode
./dev-watch.ps1   # Windows
./dev-watch.sh    # Linux/Mac
```

### Service Management
```bash
# Generate service files from config
python scripts/generate-services.py

# Start all services (Windows)
./start-all.ps1

# Start all services (Linux)
./start-all.sh

# Stop all services
./stop-servers.ps1  # Windows
```

### Code Quality
```bash
# Lint all Python code
./scripts/lint-all.ps1   # Windows
./scripts/lint-all.sh    # Linux

# Format Python code
black . --line-length 120

# Type checking
mypy modules/ scripts/

# Run all tests
pytest tests/ -v --cov
```

## External Tools & CLIs

### GPU Monitoring (Optional)
**NVIDIA GPUs**:
- Tool: nvidia-smi
- Installation: Included with NVIDIA drivers
- Detection: Subprocess call to `nvidia-smi --query-gpu=...`

**AMD GPUs**:
- Tool: rocm-smi
- Installation: ROCm toolkit
- Detection: Subprocess call to `rocm-smi --showtemp --showuse`

### System Services

#### Linux (systemd)
```bash
# Enable service
sudo systemctl enable overlord-dashboard.service

# Start service
sudo systemctl start overlord-dashboard

# View logs
journalctl -u overlord-dashboard -f
```

#### Windows (NSSM)
```powershell
# Install service
nssm install OverlordDashboard "C:\Python\python.exe" "C:\path\to\server.py"

# Start service
nssm start OverlordDashboard

# View status
nssm status OverlordDashboard
```

### Web Server (nginx)
**Location**: tools/nginx/
**Configuration**: tools/nginx/conf/nginx.conf
**Usage**: Reverse proxy for multiple services

```nginx
upstream dashboard {
    server localhost:5000;
}
upstream social {
    server localhost:5001;
}
upstream grid {
    server localhost:5002;
}
```

## Configuration Management

### Environment Variables
**Schema**: env.schema.json
**Example**: .env.example

**Key Variables**:
```bash
# Service Configuration
DASHBOARD_PORT=5000
SOCIAL_PORT=5001
GRID_PORT=5002

# Python/Node Binaries
PYTHON_BIN=python3
NODE_BIN=node

# Service User (Linux)
SERVICE_USER=overlord
SERVICE_GROUP=overlord

# Environment
NODE_ENV=development
LOG_LEVEL=INFO

# Firebase
FIREBASE_PROJECT_ID=your-project-id
```

### YAML Configuration
**Main Config**: config.yaml
**Service Config**: config/services.yaml

**Structure**:
```yaml
server:
  host: 0.0.0.0
  port: 8080

auth:
  enabled: true
  api_key: "your-api-key"

rate_limit:
  enabled: true
  requests_per_second: 5
  burst: 15

dashboard:
  refresh_interval_ms: 2000

logging:
  level: INFO
  file: overlord.log
```

## Testing Frameworks

### Python Testing
**Framework**: pytest
**Configuration**: pyproject.toml [tool.pytest.ini_options]

**Test Structure**:
```
tests/
├── test_server.py          # HTTP server tests
├── test_rate_limiter.py    # Rate limiting tests
├── test_config.py          # Configuration tests
└── test_stats.py           # Stats collection tests
```

**Run Tests**:
```bash
# All tests
pytest tests/ -v

# Specific test file
pytest tests/test_server.py -v

# With coverage
pytest tests/ --cov=modules --cov-report=html
```

### Node.js Testing
**Framework**: Jest
**Configuration**: jest.config.js

**Test Structure**:
```
tests/
├── setup.js                # Test setup
├── api.test.js             # API endpoint tests
└── integration.test.js     # Integration tests
```

**Run Tests**:
```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## CI/CD Pipelines

### GitHub Actions
**Location**: .github/workflows/

**Workflows**:
1. **deploy.yml**: Automated deployment
2. **lint-test-security.yml**: Code quality and security checks

**Triggers**:
- Push to main/master
- Pull requests
- Manual workflow dispatch

**Steps**:
```yaml
- Checkout code
- Setup Python/Node
- Install dependencies
- Run linters (black, ruff, eslint)
- Run tests (pytest, jest)
- Security scan
- Deploy (if main branch)
```

## Version Control

### Git Configuration
**Ignore Patterns**: .gitignore
- Python: __pycache__, *.pyc, .venv, venv/
- Node.js: node_modules/, dist/, build/
- Logs: *.log, logs/
- Environment: .env, .env.local
- IDE: .vscode/, .idea/

### Pre-commit Hooks
**Script**: scripts/pre-commit.py
**Checks**:
- Code formatting (black, prettier)
- Linting (ruff, eslint)
- Type checking (mypy)
- Test execution (pytest, jest)

## Platform Support

### Operating Systems
- **Windows**: Primary development platform (PowerShell scripts)
- **Linux**: Production deployment (systemd services)
- **macOS**: Development support (bash scripts)
- **Termux (Android)**: Mobile development (_archive/termux scripts)

### Browsers
- **Desktop**: Chrome, Firefox, Edge, Safari
- **Mobile**: Chrome Mobile, Safari iOS, Firefox Mobile
- **PWA**: Installable on all platforms via manifest.json

## Performance Optimizations

### Backend
- gzip compression for API responses
- Token-bucket rate limiting (5 req/s, burst 15)
- Rotating file logs (1MB rotation, 3 backups)
- Efficient psutil polling (2s intervals)

### Frontend
- Vanilla JavaScript (no framework overhead)
- localStorage for API key caching
- Sparkline charts (lightweight visualization)
- CSS animations (GPU-accelerated)

### Deployment
- Docker multi-stage builds
- systemd socket activation
- nginx reverse proxy with caching
- PM2 cluster mode for Node.js

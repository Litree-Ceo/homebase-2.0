# Product Overview

## Project Purpose
Overlord Monolith is a comprehensive system monitoring and web application platform featuring a cyberpunk-themed real-time PC dashboard with glassmorphism UI. The project serves as a unified monorepo containing multiple modules for system monitoring, social collaboration, data analytics, and various web applications.

## Value Proposition
- **Real-time System Monitoring**: Live tracking of CPU, RAM, disk, GPU, temperatures, and process statistics with 2-second refresh intervals
- **Cross-Platform Access**: PWA-enabled dashboard accessible from desktop, mobile, and tablet devices with "Add to Home Screen" capability
- **Security-First Design**: Token-based API authentication, rate limiting (5 req/s per IP), and configurable security controls
- **Developer-Friendly**: Live development mode with auto-reload, comprehensive test suite, and configuration-driven architecture
- **Multi-Module Architecture**: Modular design supporting dashboard, social, grid, and multiple repository integrations

## Key Features

### Core Dashboard Capabilities
- **Live CPU Monitoring**: Usage percentage, frequency, core count with sparkline history charts
- **Memory Tracking**: Real-time RAM usage (Used/Total GB, percentage) with visual sparklines
- **Disk Management**: Primary disk + all mounted volumes with progress bars
- **GPU Statistics**: Auto-detected NVIDIA (nvidia-smi) and AMD (rocm-smi) support
- **Temperature Sensors**: CPU/motherboard temperature monitoring (Linux/macOS via psutil)
- **Process Management**: Top 5 processes by CPU usage with PID, name, CPU%, RAM%
- **Network I/O**: Session-total sent/received data with auto-scaling (MB/GB)

### Technical Features
- **Auto-refresh**: Configurable polling interval (default 2000ms) with pause/resume controls
- **One-Click Copy**: Clipboard export of system statistics
- **API Authentication**: X-API-Key header or query parameter support
- **Rate Limiting**: Token-bucket algorithm with configurable burst capacity
- **Logging**: Rotating file logs (1MB rotation, 3 backups) with configurable levels
- **PWA Support**: Progressive Web App with manifest.json for mobile installation
- **gzip Compression**: Compressed API responses for bandwidth optimization
- **Live Development**: File watcher with auto-restart for server.py, index.html, style.css, config.yaml

### API Endpoints
- `GET /api/health` - Server health check (no auth)
- `GET /api/config` - Safe configuration subset (no auth)
- `GET /api/stats` - Full system snapshot (requires auth)
- `GET /api/history` - Last 60 CPU/RAM data points (requires auth)

## Target Users

### Primary Users
- **System Administrators**: Monitor server health and performance metrics remotely
- **Developers**: Track resource usage during development and testing
- **Power Users**: Real-time visibility into system performance and bottlenecks
- **Remote Workers**: Access PC statistics from mobile devices anywhere on the network

### Use Cases
1. **Remote System Monitoring**: Access PC dashboard from phone/tablet on local network
2. **Performance Debugging**: Identify CPU/RAM bottlenecks during application development
3. **Server Management**: Monitor production servers with secure API key authentication
4. **Mobile PWA Experience**: Install dashboard as native-like app on mobile devices
5. **Multi-Module Development**: Unified workspace for dashboard, social, and grid modules
6. **Live Development**: Instant feedback loop for UI/backend changes without manual restarts

## Project Scope
The monolith encompasses:
- **modules/dashboard**: Core PC monitoring dashboard (Python + HTML/CSS)
- **modules/social**: Community and collaboration features (Node.js)
- **modules/grid**: Data grid and analytics module (Python)
- **repos/**: Multiple integrated repositories (HomeBase-2.0, homebase-portfolio, LiTreeStudio, servers, etc.)
- **scripts/**: Automation tools for service generation, validation, and deployment
- **tools/**: Supporting utilities (nginx, nssm for Windows services)
- **config/**: Centralized service configuration (services.yaml)

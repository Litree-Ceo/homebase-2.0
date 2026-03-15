# Overlord Monolith: Project Blueprint (v2.0 - Pro Edition)

This document outlines the architecture, services, and file structure of the **Overlord Monolith** system after the migration to a professional Windows-based hosting environment.

## 1. System Architecture

The system uses **Nginx** as a reverse proxy to unify multiple services under a single port (80/HTTP). Background services are managed by **NSSM** (Non-Sucking Service Manager) for persistence and auto-recovery.

### Service Map
| Service Name | Internal Port | External Access | Technology | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Nginx Proxy** | `80` | `http://localhost/` | Nginx (Win32) | **Active** (Gateway) |
| **OverlordDashboard** | `8080` | `http://localhost/` | Python (http.server) | **Active** (Backend Service) |
| **OverlordSocial** | `N/A` | `http://localhost/social/` | Static HTML/JS | **Passive** (Served by Nginx) |
| **OverlordGrid** | `N/A` | `http://localhost/grid/` | Static HTML/JS | **Passive** (Served by Nginx) |

### Data Flow
1.  **User Request** -> `http://localhost/social/`
2.  **Nginx** checks configuration -> Maps URL to `C:\Users\litre\Desktop\Overlord-Monolith\modules\social\`
3.  **Nginx** serves `index.html` directly (Fast, Low Resource Usage).

## 2. Directory Structure

```plaintext
Overlord-Monolith/
├── .vscode/                # VS Code Project Settings (New!)
│   ├── extensions.json     # Recommended extensions
│   ├── launch.json         # Debug configurations
│   └── settings.json       # Workspace-specific settings
├── modules/
│   ├── dashboard/          # Main System Dashboard (Python)
│   │   ├── server.py       # Core Logic / API
│   │   ├── static/         # Frontend Assets
│   │   └── logs/           # Application Logs
│   ├── social/             # Social Hub (Static Web App)
│   │   ├── index.html      # Entry Point
│   │   ├── app.js          # Logic
│   │   └── style.css       # Styling
│   └── grid/               # Grid Visualization (Static)
├── tools/                  # Dependencies (Nginx, Helpers)
├── setup-overlord-pro.ps1  # MAIN SETUP SCRIPT (Run as Admin)
├── config.yaml             # Global Configuration
└── README.md               # Documentation
```

## 3. Technology Stack

*   **Core OS**: Windows 11 (Primary Host).
*   **Orchestration**: PowerShell 7 + NSSM.
*   **Web Server**: Nginx 1.24+ (Reverse Proxy & Static File Server).
*   **Backend Logic**: Python 3.12+ (System Stats, API).
*   **Frontend**: Vanilla HTML5/CSS3/ES6 JavaScript (No build usage required).

## 4. Key Configuration Files

*   **Nginx Config**: `tools/nginx/conf/nginx.conf` -> Controls routing.
*   **Dashboard Config**: `config.yaml` -> Controls API keys and layout.
*   **VS Code Config**: `.vscode/settings.json` -> Controls editor behavior.

## 5. Development Workflow

1.  **Open VS Code** in `Overlord-Monolith`.
2.  **Edit Code**: Modify `modules/social/index.html` or `modules/dashboard/server.py`.
3.  **Test**:
    *   **Social/Grid**: Refresh browser (Nginx serves files immediately).
    *   **Dashboard**: Restart service (`nssm restart OverlordDashboard`) if Python code changes.
4.  **Verify**: Check `http://localhost/` or `http://localhost/social/`.

## 6. Future Roadmap

- [ ] **SSL/HTTPS**: Integrate Let's Encrypt or Self-Signed Certs for secure remote access.
- [ ] **Authentication**: Add Basic Auth to Nginx for extra security.
- [ ] **Containerization**: Move services to Docker (Optional, if portability is needed).

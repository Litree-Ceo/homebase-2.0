# LiTreeLab Smart System Blueprint

## 1. System Architecture

The **LiTreeLab Smart System** is a multi-agent, monorepo-based development environment designed for high-performance automation, 3D metaverse rendering, and AI orchestration.

### **Core Components**
| Service | Port | Description |
|---------|------|-------------|
| **WEB** | `3000` | Main frontend (Next.js 14, Tailwind v4). |
| **LIT** | `3001` | LitLabs dashboard (Firebase, admin tools). |
| **META** | `3002` | Metaverse 3D Studio (Three.js, React 18). |
| **KIMI** | `5494` | AI Optimization Agent (Python/CLI). |
| **AZ** | `8000` | Agent Zero (Dockerized autonomous agent). |

---

## 2. Automation & "Smart" Scripts

### **Master Orchestrator: `scripts/smart-start.ps1`**
- **Purpose**: Launches all 5 agents simultaneously in a single terminal.
- **Features**:
  - Color-coded output for each agent.
  - Automatic port management.
  - Graceful shutdown handling.
- **Usage**: `powershell -File scripts/smart-start.ps1`

### **Smart Optimization: `pnpm optimize`**
- **Purpose**: Triggers the Kimi AI agent to scan, fix, and optimize the codebase.
- **Implementation**: Mapped to `scripts/run-kimi.ps1` in every `package.json`.
- **Key Fixes**:
  - Forces `PYTHONUTF8=1` to prevent Windows encoding errors.
  - Handles path resolution for global CLIs.

---

## 3. Technology Stack

- **Frontend**: Next.js 14.2.16 (App Router), React 18.3.1.
- **Styling**: Tailwind CSS v4 (Alpha/Beta).
- **3D Engine**: `@react-three/fiber` (pinned to React 18 for compatibility).
- **Database**: Firebase (Firestore, Auth, Storage).
- **AI/Agents**: OpenClaw (v2026.2.1), Agent Zero, Kimi.

---

## 4. Troubleshooting Guide

### **Common Issues**
1.  **"4 Logs" / `net::ERR_ABORTED`**:
    - **Cause**: Server-side rendering crash or hydration mismatch.
    - **Fix**: Ensure all 3D components are inside `NoSSR` wrappers or use `useEffect` for random data.
2.  **Port Conflicts**:
    - **Fix**: The `smart-start.ps1` script explicitly assigns ports. If a port is in use, run `npx kill-port 3000 3001 3002`.
3.  **Hydration Errors**:
    - **Fix**: Move random data generation (e.g., `Math.random()`) to `useEffect`.

---

## 5. Directory Structure
```
homebase-2.0/
├── github/
│   ├── apps/
│   │   ├── web/ (Port 3000)
│   │   ├── litreelab-studio-metaverse/ (Port 3002)
│   │   └── agent-zero/ (Docker)
│   └── packages/
├── litlabs/ (Port 3001)
├── scripts/
│   ├── smart-start.ps1
│   ├── run-kimi.ps1
│   └── install-fresh.ps1
└── openclaw.json (Agent Config)
```

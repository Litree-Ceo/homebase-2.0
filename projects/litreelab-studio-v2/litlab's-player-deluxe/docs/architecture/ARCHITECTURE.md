# Overlord PC Dashboard Architecture

This diagram shows how the client, server, and optional integrations connect.

```mermaid
graph TD
    subgraph "Frontend (Client Browser / PWA)"
        UI["index.html + style.css<br/>(Glassmorphism UI)"]
        RD_JS["realdebrid_controller.js<br/>(Streaming Logic)"]
        LocalStore[/"localStorage"<br/>(Stores API Key)/]

        UI <--> RD_JS
        UI -.->|"Saves/Reads"| LocalStore
    end

    subgraph "Backend (Python server.py)"
        direction TB
        Config["config.yaml<br/>(Single Source of Truth)"]

        subgraph "API Endpoints"
            API_Config["GET /api/config"]
            API_Stats["GET /api/stats<br/>GET /api/history"]
            API_Health["GET /api/health"]
            API_Stream["GET & POST /api/stream/*"]
        end

        subgraph "Data Collectors"
            Psutil["psutil<br/>(CPU, RAM, Disk, Net)"]
            GPU["nvidia-smi / rocm-smi<br/>(GPU Stats)"]
        end

        API_Config -.->|"Reads"| Config
        API_Stats -.->|"Reads"| Config
        API_Stats -->|"Polls"| Psutil
        API_Stats -->|"Polls"| GPU
    end

    subgraph "External Integrations (Optional)"
        RD_API["Real-Debrid API"]
        Firebase["Firebase Realtime Sync"]
    end

    %% Client-Server Connections
    UI -->|"Polling (e.g., 2000ms)<br/>Headers: X-API-Key"| API_Stats
    UI -->|"Fetches settings"| API_Config
    UI -->|"Checks status"| API_Health
    RD_JS -->|"Manages torrents/links"| API_Stream

    %% Backend-External Connections
    API_Stream -->|"Requires RD_API_KEY"| RD_API
    API_Stats -.->|"Pushes stats (if enabled)"| Firebase

    classDef frontend fill:#1e1e2f,stroke:#4a4a75,stroke-width:2px,color:#fff;
    classDef backend fill:#2b3a42,stroke:#3a5a68,stroke-width:2px,color:#fff;
    classDef external fill:#422b2b,stroke:#683a3a,stroke-width:2px,color:#fff;

    class UI,RD_JS,LocalStore frontend;
    class API_Config,API_Stats,API_Health,API_Stream,Psutil,GPU,Config backend;
    class RD_API,Firebase external;
```

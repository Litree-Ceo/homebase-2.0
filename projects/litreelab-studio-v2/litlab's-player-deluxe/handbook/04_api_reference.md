# Chapter 4: API Reference

This chapter provides a complete reference for all API endpoints available in the Overlord PC Dashboard system.

## 4.1. Public Endpoints

These endpoints do not require authentication.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Returns the health status of the server. |
| `GET` | `/api/config` | Returns the public configuration of the dashboard. |

## 4.2. Authenticated Endpoints

These endpoints require a valid API key, passed via the `X-API-Key` header.

### 4.2.1. Core Stats

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/stats` | Returns a full snapshot of all system metrics. |
| `GET` | `/api/history` | Returns a historical record of CPU and RAM usage. |
| `GET` | `/api/docker` | Returns a list of all running Docker containers. |

### 4.2.2. Real-Debrid Streaming

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/stream/config` | Returns the current Real-Debrid configuration status. |
| `GET` | `/api/stream/torrents` | Returns a list of all active torrents. |
| `POST` | `/api/stream/addMagnet` | Adds a new magnet link to the download queue. |
| `POST` | `/api/stream/unrestrict` | Unrestricts a given download link. |

### 4.2.3. AI Assistant

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/ai/chat` | Retrieves quick response suggestions. |
| `GET` | `/api/ai/history` | Retrieves the full conversation history. |
| `POST`| `/api/ai/chat` | Submits a new message to the AI assistant. |
| `POST`| `/api/ai/command`| Executes a system command via the AI assistant. |
| `POST`| `/api/ai/clear` | Clears the AI assistant's conversation history. |

### 4.2.4. Remote Management (Termux & ADB)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/termux/connect` | Establishes a connection to the Termux SSH server. |
| `POST` | `/api/termux/command` | Executes a shell command on the connected Termux device. |
| `POST` | `/api/termux/ls` | Lists files in a given directory on the Termux device. |
| `POST` | `/api/termux/read` | Reads the content of a file from the Termux device. |
| `POST` | `/api/termux/write`| Writes content to a file on the Termux device. |
| `GET` | `/api/adb/devices` | Returns a list of all connected ADB devices. |
| `POST` | `/api/adb/shell` | Executes a shell command on the specified ADB device. |
| `POST` | `/api/adb/push` | Pushes a file from the local machine to an ADB device. |
| `POST` | `/api/adb/pull` | Pulls a file from an ADB device to the local machine. |
| `POST` | `/api/adb/install` | Installs an APK on the specified ADB device. |
| `GET` | `/api/adb/device-info` | Retrieves detailed information about a specific ADB device. |

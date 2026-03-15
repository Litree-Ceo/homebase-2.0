# Chapter 1: Introduction and Project Overview

## 1.1. Mission Briefing

**Overlord PC Dashboard** is a cyberpunk-themed, real-time PC monitoring dashboard with streaming capabilities. It provides live CPU, RAM, disk, GPU, temperatures, and process stats — updated every 2-5 seconds via a glassmorphism UI with neon glow aesthetics.

This handbook serves as the Master Protocol for all development, maintenance, and operational procedures related to the project.

**Current Version:** 4.2.1 (as defined in `server.py`)

## 1.2. Key Capabilities

The system is engineered with the following primary capabilities:

- **Real-time System Monitoring**: Live metrics for CPU, RAM, disk, network, and temperatures.
- **GPU Monitoring**: Auto-detection and monitoring via `nvidia-smi` or `rocm-smi`.
- **PWA Support**: Full Progressive Web App capabilities for offline access and native-like installation.
- **Token-based API Authentication**: Secure, rate-limited access to the backend API.
- **Real-Debrid Streaming Integration**: Management of torrents and unrestricting of links via the Real-Debrid API.
- **Firebase Cloud Sync**: Optional, real-time synchronization of data with a Firebase backend.
- **Remote Device Management**: ADB and Termux SSH integration for Android device management.
- **Persistent Metrics**: SQLite-backed storage for historical metrics with automatic data cleanup.

## 1.3. Technology Stack

The system is built on a carefully selected stack to ensure performance and reliability.

### 1.3.1. Backend

- **Language:** Python 3.12+
- **HTTP Server:** Custom `http.server` (embedded in `server.py`)
- **Process Monitoring:** `psutil`
- **Database:** SQLite
- **Configuration:** YAML (`config.yaml`) & Environment variables (`.env`)

### 1.3.2. Frontend

- **HTML/CSS:** Single-page application with custom cyberpunk/glassmorphism styling.
- **JavaScript:** Vanilla JS with React/Recharts for charting.
- **UI Library:** None. All styles are custom.

### 1.3.3. External Integrations

- **Firebase**: Realtime Database, Cloud Functions, Hosting
- **Real-Debrid**: API for streaming/torrent management
- **Google Gemini**: AI assistant integration
- **ADB & Termux**: Remote device control

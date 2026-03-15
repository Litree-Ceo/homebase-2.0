# HomeBase 2.0 Master Developer Guide

A structured, copy/paste-ready blueprint for developers onboarding into the HomeBase 2.0 workspace: pnpm-managed Next.js + API monorepo, optional Firebase emulators, Docker containers, VS Code tooling, and the metaverse experience.

## Prerequisites

- **Node.js** – match the version recorded in `.nvmrc` or `package.json` → `engines.node`. Use `nvm`, `fnm`, or `volta` to align, then run `node -v`.
- **pnpm** – the workspace package manager.
  ```bash
  npm install -g pnpm
  ```
  ```powershell
  npm install -g pnpm
  ```
- **Azure CLI** – log in if you touch cloud resources or deploy the Function App.
- Optional:
  - **Docker Desktop** for `docker compose up --build`.
  - **Firebase CLI** for emulators: `npm install -g firebase-tools`.
  - **GitHub Copilot** and Azure Functions Core Tools (`func`) if you run the serverless stack.

## First-time Setup

1. **Clone the repo**:
   ```bash
   git clone git@github.com:yourorg/homebase-2.0.git
   cd homebase-2.0
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   - Populate API keys (Paddle, Firebase, Grok/xAI, etc.), DB URLs (Cosmos, Mongo, Postgres), auth secrets, SignalR/Webhook endpoints, and any workspace-specific tokens.
   - If Firebase is in use, set `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, and emulator overrides.
   - For the metaverse (litlabs-web) overlay, copy `apps/litlabs-web/.env.metaverse.example` to `apps/litlabs-web/.env.metaverse` and fill in the immersive content + media service keys before running the metaverse build.
   - Document project-dependent overrides in `.env.local`, `apps/<name>/.env`, or `docs/ENV_CONFIGURATION.md`.
4. **Tool-specific notes**:
   - Run `pnpm install` inside nested packages such as `projects/demo` if those directories have their own `package.json`.
   - Enable VS Code terminal shell integration so the onboarding assistant and Copilot detect commands (see the dedicated section below).

## Running Locally (Dev Server)

1. **Primary dev server**:
   ```bash
   pnpm dev
   ```
2. **Targeted workspaces** (replace `web`/`api` with real package names):
   - Frontend: `pnpm --filter web dev` → serves `http://localhost:3000`.
   - API/backend: `pnpm --filter api dev` (common ports `4000`/`5000`/`8080`).
   - Metaverse overlay: `pnpm --filter litlabs-web dev` after populating `apps/litlabs-web/.env.metaverse`; use `pnpm --filter litlabs-web build` to produce production assets.
3. **Logs and observability**:
   - The terminal shows Next.js/Node watcher logs; VS Code terminal integrations add decorations, sticky scroll, and command navigation for easier troubleshooting.
   - Use `pnpm --filter <package> test` or `lint` scripts as needed.
4. **Ports overview**:
   - Web app: `3000`.
   - API/backend: project-dependent (often `4000` or `5000`).
   - Firebase emulators: Firestore `8080`, Functions `5001`, Auth `9099`.

## Optional Local Infrastructure

- **Firebase emulators** (if configured):
  ```bash
  firebase login
  firebase init  # run once per machine
  firebase emulators:start
  ```
  Supply emulator hosts in `.env.local` (e.g., `FIRESTORE_EMULATOR_HOST=localhost:8080`).
- **Docker Compose**:
  ```bash
  docker compose up --build
  ```
  The stack uses `.env`/`.env.local`. Supply secrets via Docker secrets or environment files as needed.

## Generative Media (Text → Images/Videos) for Site Population

- You can auto-populate hero assets and media-rich sections via a simple pipeline:
  1. Define a content spec JSON (copy text, prompts, feature lists).
  2. Call generative image services (DALL·E 3, Midjourney, Stability) to get hero/feature visuals.
  3. Trigger video generators (Runway ML, Pika Labs, Synthesia) for loops or narrated demos; store outputs as URLs.
  4. Inject URLs/copy into Next.js sections through JSON-driven layouts or CMS data.
- Safe defaults:
  - Use gradient/placeholders during development.
  - Swap in curated AI outputs for production releases after review.
- This is project-dependent; bind the script to CLI tasks (e.g., `node scripts/generate-assets.js && pnpm dev` or CI jobs).

## VS Code Terminal Shell Integration

- Shell integration provides current-directory detection, exit status decorations, sticky scroll, quick fixes, and command navigation.
- Add these snippets to your shell init file (manual install enables richer detection):
  - **bash (~/.bashrc)**:
    ```bash
    [[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path bash)"
    ```
  - **zsh (~/.zshrc)**:
    ```bash
    [[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path zsh)"
    ```
  - **fish (config.fish)**:
    ```fish
    string match -q "$TERM_PROGRAM" "vscode" && . (code --locate-shell-integration-path fish)
    ```
  - **PowerShell ($PROFILE)**:
    ```powershell
    if ($env:TERM_PROGRAM -eq "vscode") { . "$(code --locate-shell-integration-path pwsh)" }
    ```
- To disable automatic injection (useful for advanced shells), set:
  ```json
  "terminal.integrated.shellIntegration.enabled": false
  ```

## Troubleshooting

- **Port already in use**:
  - macOS/Linux: `lsof -i :3000` → `kill <pid>`.
  - Windows: `netstat -ano | findstr :3000` → `taskkill /PID <pid> /F`.
  - Alternatively: `npx kill-port 3000`.
- **Missing env vars**: Re-check `.env.local`, `apps/<name>/.env`, `apps/litlabs-web/.env.metaverse`, then restart `pnpm dev`.
- **Node/pnpm mismatch**: Run `node -v`, `pnpm -v`, reinstall `pnpm`, or `corepack enable`.
- **Build/cache issues**:
  ```bash
  rm -rf .next node_modules
  pnpm install
  pnpm store prune
  ```
- **GitHub Copilot “Request failed / canceled by server”**:
  1. Reload VS Code (`Ctrl+Shift+P` → “Reload Window”).
  2. `GitHub: Sign Out` → `GitHub: Sign In`.
  3. Update the Copilot extension and restart VS Code.
  4. Check https://www.githubstatus.com/ for outages.

## Quickstart TL;DR

1. `pnpm install`
2. `cp .env.example .env.local` (and optionally `apps/litlabs-web/.env.metaverse`)
3. `pnpm dev`
4. Open http://localhost:3000
5. Optional: `firebase emulators:start` / `docker compose up --build`

Last Updated: 2026-01-02

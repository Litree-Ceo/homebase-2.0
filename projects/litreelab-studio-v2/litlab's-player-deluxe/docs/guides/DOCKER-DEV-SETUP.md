# Overlord Dashboard - Docker Dev Setup

## ⚡ Quick Start (One Command)

```powershell
overlord
```

That's it. This will:
- ✅ Build the Docker image
- ✅ Start container with hot-reload
- ✅ Open browser to `http://localhost:8080`
- ✅ Watch for file changes (auto-restart on `server.py`, `config.yaml`, `requirements.txt`)
- ✅ Auto-sync on `index.html`, `style.css` (no restart needed)

## 📝 Setup (First Time Only)

1. **Close PowerShell and reopen** (to load the new profile)
2. Run: `overlord`

## 🎮 Available Commands

```powershell
overlord              # Start dev mode (hot-reload)
overlord -Mode prod   # Start production mode
overlord -Mode logs   # View live logs (Ctrl+C to exit)
overlord -Mode shell  # Open shell inside container
overlord -Mode stop   # Stop container
overlord -Mode clean  # Remove container + volumes (hard reset)
```

## 🔥 Hot-Reload Demo

1. Run `overlord`
2. Open `http://localhost:8080` in browser
3. Edit `server.py` and save
4. Container auto-restarts in ~2 seconds
5. Refresh browser — see your changes

### What auto-restarts vs. auto-syncs?

| File | Action | Rebuild? | Notes |
|------|--------|----------|-------|
| `server.py` | ♻️ Restart | No | Changes live immediately |
| `config.yaml` | ♻️ Restart | No | Config reloaded |
| `requirements.txt` | 🔨 Rebuild | Yes | New dependencies installed |
| `index.html` | ↔️ Sync | No | Browser auto-refreshes |
| `style.css` | ↔️ Sync | No | CSS hot-updates |

## 🔍 Debugging

### View logs
```powershell
overlord -Mode logs
```

### Get container ID
```powershell
docker ps | grep overlord
```

### Check container health
```powershell
docker inspect overlord-dashboard-dev --format='{{.State.Health.Status}}'
```

### Test API directly
```powershell
curl http://localhost:8080/api/health
curl -H "X-API-Key: overlord-change-me-please" http://localhost:8080/api/stats
```

## 🚀 Production Deployment

### Local production build
```powershell
overlord -Mode prod
```

### Push to Docker Hub

1. **Tag image:**
   ```powershell
   docker tag overlord-dashboard:latest <your-docker-username>/overlord-dashboard:latest
   ```

2. **Login to Docker Hub:**
   ```powershell
   docker login
   ```

3. **Push:**
   ```powershell
   docker push <your-docker-username>/overlord-dashboard:latest
   ```

### Run from Docker Hub
```bash
docker run -d \
  --name overlord \
  -p 8080:8080 \
  -v ./config.yaml:/app/config.yaml:ro \
  <your-docker-username>/overlord-dashboard:latest
```

## 🔄 GitHub Actions CI/CD

The `.github/workflows/docker.yml` workflow automatically:
- ✅ Builds on every push to `main` or `develop`
- ✅ Pushes to GitHub Container Registry (ghcr.io)
- ✅ Tags with branch name + git SHA + "latest"
- ✅ Runs tests on push
- ✅ Caches layers for faster rebuilds

### What it builds on:
- Changes to `Dockerfile`, `server.py`, `index.html`, `style.css`, `config.yaml`, `requirements.txt`
- Any push to `main` branch

### Access your image:
```bash
docker pull ghcr.io/<your-github-username>/overlord-pc-dashboard:latest
```

## 📊 Dev Environment Structure

```
docker-compose.dev.yml    # Dev mode with hot-reload
docker-compose.prod.yml   # Production (no file watching)
Dockerfile                # Container image definition
Overlord-Dev-Functions.ps1 # PowerShell functions
```

## 💡 Pro Tips

### Speed up development
1. Keep `server.py` changes small (faster restarts)
2. Edit `index.html`/`style.css` frequently (zero restart)
3. Use `overlord -Mode logs` in another PowerShell window to monitor

### Monitor everything
```powershell
# In one window:
overlord

# In another window:
overlord -Mode logs

# In another window:
docker stats overlord-dashboard-dev
```

### Share with team
Push to Docker Hub, then teammates run:
```bash
docker run -d -p 8080:8080 <your-username>/overlord-dashboard
```

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 8080 in use | Change `ports: ["9090:8080"]` in `docker-compose.dev.yml` |
| Container won't start | `overlord -Mode logs` to see errors |
| Changes not syncing | Restart container: `overlord -Mode stop && overlord` |
| "Command not found: overlord" | Reopen PowerShell to reload profile |
| Docker daemon not running | Start Docker Desktop |

## 🎯 Next Steps

1. ✅ Run `overlord` right now
2. ✅ Edit `server.py` and watch it reload
3. ✅ Push to GitHub to trigger CI/CD
4. ✅ Share your ghcr.io image with the team

---

**Status:** 🟢 **READY FOR DEVELOPMENT**

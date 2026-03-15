# n8n Workflow Integration Guide
## Overlord PC Dashboard - Stable Tunnel Setup

This guide helps you configure n8n to reliably connect to your local Overlord Dashboard server through a stable tunnel.

---

## Quick Start

```powershell
# 1. Start your local server
python server.py

# 2. In a new terminal, start a stable tunnel
.\start-stable-tunnel.ps1

# 3. Copy the HTTPS URL and update your n8n workflow
```

---

## The Problem with localtunnel

**Why you keep getting 503 errors:**
- Free tunneling services are inherently unstable
- Connections drop randomly (sometimes within minutes)
- Not suitable for production workflows

**The Solution:** Use **Cloudflare Tunnel** or **ngrok** for stable, reliable connections.

---

## Option 1: Cloudflare Tunnel (Recommended ⭐)

### Why Cloudflare?
- ✅ **Free tier** with permanent URLs
- ✅ **Most stable** - doesn't randomly drop
- ✅ **No connection limits**
- ✅ **Production-grade** infrastructure

### Setup Steps

1. **Run the setup script:**
   ```powershell
   .\setup-cloudflare-tunnel.ps1
   ```

2. **Choose Option 2 (Named Tunnel)** for a permanent URL

3. **Login to Cloudflare** (free account at cloudflare.com)

4. **Select your domain** or use a free `workers.dev` subdomain

5. **Your tunnel URL will look like:**
   ```
   https://overlord.yourdomain.com
   # or
   https://overlord-yourname.workers.dev
   ```

### n8n Configuration

**HTTP Request Node Settings:**
```
Method: GET
URL: https://your-tunnel-domain/api/stats
Authentication: None

Settings Tab:
  ✅ Retry On Fail: Enabled
  Retry Count: 3
  Retry Interval: 5000ms
```

---

## Option 2: ngrok (Easier Setup)

### Why ngrok?
- ✅ **Very easy** setup
- ✅ **Free tier** available
- ✅ **Good stability**
- ✅ **Dashboard** for monitoring

### Setup Steps

1. **Run the setup script:**
   ```powershell
   .\setup-ngrok-tunnel.ps1
   ```

2. **Get auth token** from https://dashboard.ngrok.com/get-started/your-authtoken

3. **Start the tunnel:**
   ```powershell
   ngrok http 4001
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### For Static URL (Paid)
Upgrade to ngrok Pro ($8/month) for a permanent subdomain:
```powershell
ngrok http --domain=yourname.ngrok.io 4001
```

---

## n8n Workflow Configuration

### Complete Workflow JSON

```json
{
  "name": "Overlord Stats Collector",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "minutes",
              "minutesInterval": 5
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://YOUR-TUNNEL-URL/api/stats",
        "options": {
          "retry": {
            "enabled": true,
            "maxRetries": 3,
            "waitBetween": 5000
          }
        }
      },
      "name": "Fetch Stats",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "// Process stats here\nconst stats = $input.first().json;\nreturn [{
  json: {
    timestamp: new Date().toISOString(),
    cpu: stats.cpu.percent,
    ram: stats.ram.percent,
    disk: stats.disk.percent
  }
}];"
      },
      "name": "Process Data",
      "type": "n8n-nodes-base.code",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [[{"node": "Fetch Stats", "type": "main", "index": 0}]]
    },
    "Fetch Stats": {
      "main": [[{"node": "Process Data", "type": "main", "index": 0}]]
    }
  }
}
```

### Key Configuration Points

| Setting | Value | Purpose |
|---------|-------|---------|
| URL | `https://your-tunnel/api/stats` | Your tunnel endpoint |
| Retry On Fail | ✅ Enabled | Handles temporary drops |
| Max Retries | 3 | Attempts before failing |
| Wait Between | 5000ms | 5 seconds between retries |

---

## Troubleshooting

### 503 Service Unavailable

**Cause:** Tunnel dropped or server not running

**Solutions:**
1. Check server: `curl http://localhost:4001/api/health`
2. Restart tunnel: `cloudflared tunnel run overlord`
3. Switch to more stable provider (Cloudflare > ngrok > localtunnel)

### Connection Refused

**Cause:** Firewall or wrong port

**Solutions:**
1. Verify server port: Check `server.py` or `config.yaml`
2. Check Windows Firewall: Allow Python through firewall
3. Test locally first: `curl http://localhost:4001/api/stats`

### Rate Limiting

**Cause:** Too many requests

**Solutions:**
1. Reduce n8n schedule frequency (e.g., 5 min → 15 min)
2. Enable caching in n8n workflow
3. Check API rate limits in your tunnel provider

---

## Comparison Table

| Provider | Stability | Setup | Cost | Static URL |
|----------|-----------|-------|------|------------|
| **Cloudflare** | ⭐⭐⭐⭐⭐ | Medium | Free | ✅ Yes |
| **ngrok** | ⭐⭐⭐⭐ | Easy | Free/Paid | 💰 Paid only |
| **localtunnel** | ⭐⭐ | Easy | Free | ❌ No |

---

## Recommended Setup for Production

For a reliable, production-ready setup:

```powershell
# 1. Use Cloudflare Tunnel for stability
.\setup-cloudflare-tunnel.ps1

# 2. Choose Named Tunnel option
# 3. Set subdomain: overlord.yourdomain.com

# 4. In n8n, configure:
#    - URL: https://overlord.yourdomain.com/api/stats
#    - Retry: Enabled (3 retries)
#    - Schedule: Every 5 minutes
```

---

## Automation Scripts

### Start Everything with One Command

Create `start-all.ps1`:

```powershell
# Start server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; python server.py"

# Wait for server
Start-Sleep -Seconds 3

# Start tunnel
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; cloudflared tunnel run overlord"

Write-Host "✅ Server and tunnel started!" -ForegroundColor Green
Write-Host "📊 Dashboard: http://localhost:4001" -ForegroundColor Cyan
Write-Host "🌐 Public URL: https://overlord.yourdomain.com" -ForegroundColor Cyan
```

---

## Next Steps

1. **Choose your tunnel provider** (Cloudflare recommended)
2. **Run setup script** for your chosen provider
3. **Copy the tunnel URL** after setup
4. **Update n8n HTTP Request node** with new URL
5. **Enable retry settings** for resilience
6. **Test the workflow** manually first
7. **Enable schedule** for automatic execution

---

## Support

If you continue to experience issues:

1. Check server logs: `python server.py` output
2. Check tunnel logs: `cloudflared tunnel run overlord --log-level debug`
3. Test locally: `curl http://localhost:4001/api/stats`
4. Verify n8n workflow configuration matches this guide

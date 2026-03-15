# 🏠 HomeBase Environment Setup Guide

> Set up once, sync everywhere. Works at home, work, or anywhere.

---

## ⚡ Quick Start (5 minutes)

### 1. Clone the Repo (New Machine)

```powershell
git clone https://github.com/LiTree89/HomeBase-2.0.git
cd HomeBase-2.0
```

### 2. Install Dependencies

```powershell
# Install pnpm if not installed
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### 3. Copy Environment Template

```powershell
# API settings
Copy-Item api/local.settings.example.json api/local.settings.json

# Web settings (if needed)
Copy-Item apps/web/.env.example apps/web/.env.local
```

### 4. Start Development

```powershell
# Start everything
pnpm -C api start     # API on :7071
pnpm -C apps/web dev  # Web on :3000
```

---

## 🔑 Environment Variables

### API (`api/local.settings.json`)

**Required for Local Development:**

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

**Optional - Add as needed:**
| Variable | Purpose | Get From |
|----------|---------|----------|
| `COSMOS_ENDPOINT` | Database | Azure Portal or `https://localhost:8081` for emulator |
| `DISCORD_WEBHOOK_URL` | Bot alerts | Discord Server Settings → Integrations |
| `EXCHANGE_API_KEY` | Trading | Binance/Coinbase API settings |
| `EXCHANGE_SECRET` | Trading | Same as above |

---

## 🔄 Syncing Between Locations

### Option 1: Git (Recommended)

Everything syncs via git. Just:

```powershell
git pull origin main
pnpm install  # In case deps changed
```

**⚠️ NEVER commit:**

- `local.settings.json` (contains secrets)
- `.env.local` (contains secrets)
- `node_modules/`

### Option 2: Azure Key Vault (Production Secrets)

Store secrets in Azure, pull them automatically:

```powershell
# Login once
az login

# Get a secret
az keyvault secret show --vault-name kvprodlitree14210 --name "EXCHANGE-API-KEY" --query value -o tsv
```

### Option 3: VS Code Settings Sync

1. Sign into VS Code with GitHub
2. Settings → Turn on Settings Sync
3. Extensions, keybindings, and settings sync automatically

---

## 🔧 Binance API Setup

### Step 1: Create API Key

1. Go to [binance.com/en/my/settings/api-management](https://www.binance.com/en/my/settings/api-management)
2. Click **Create API** → Choose **System generated**
3. Name it: `HomeBase Bot`
4. Complete 2FA verification

### Step 2: Configure Permissions

Enable ONLY what you need:

- ✅ **Enable Reading** (required)
- ✅ **Enable Spot & Margin Trading** (for live trading)
- ❌ Disable Withdrawals (NEVER enable this for bots!)

### Step 3: IP Restrictions (IMPORTANT!)

- **At Home**: Add your home IP (Google "what is my IP")
- **At Work/Other**: Add those IPs too
- **For Development**: You can use `0.0.0.0` temporarily but this is less secure

To find your IP:

```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

### Step 4: Add to local.settings.json

```json
{
  "Values": {
    "EXCHANGE_NAME": "binance",
    "EXCHANGE_API_KEY": "your-api-key-here",
    "EXCHANGE_SECRET": "your-secret-here",
    "EXCHANGE_SANDBOX": "true"
  }
}
```

**⚠️ Start with `EXCHANGE_SANDBOX: true` to use testnet!**

---

## 🏃 Common Commands

```powershell
# Build API
pnpm -C api build

# Start API (with hot reload)
pnpm -C api start

# Start Web
pnpm -C apps/web dev

# Run both at once
pnpm -w run dev

# Install a package to API
pnpm -C api add <package-name>

# Check for issues
pnpm -C api build 2>&1 | Select-Object -First 50
```

---

## 🐛 Troubleshooting

### "tsc is not recognized"

```powershell
pnpm -C api install
```

### "Cannot find module"

```powershell
pnpm install
pnpm -C api build
```

### Cosmos DB connection failed

Use the emulator or check `COSMOS_ENDPOINT` in local.settings.json

### Git won't push (submodule issues)

```powershell
git submodule update --init --recursive
```

---

## 📁 What Goes Where

| File                              | Committed? | Purpose                   |
| --------------------------------- | ---------- | ------------------------- |
| `api/local.settings.json`         | ❌ NO      | Local secrets             |
| `api/local.settings.example.json` | ✅ Yes     | Template for secrets      |
| `apps/web/.env.local`             | ❌ NO      | Web secrets               |
| `.vscode/settings.json`           | ✅ Yes     | Shared editor config      |
| `pnpm-lock.yaml`                  | ✅ Yes     | Exact dependency versions |

---

## 🎯 Next Steps

1. **Get your IPs**: Run `(Invoke-WebRequest -Uri "https://api.ipify.org").Content` at each location
2. **Add them to Binance**: API Management → Edit Restrictions
3. **Test with sandbox**: Keep `EXCHANGE_SANDBOX: true` until confident
4. **Set up Discord alerts**: Create a webhook for bot notifications

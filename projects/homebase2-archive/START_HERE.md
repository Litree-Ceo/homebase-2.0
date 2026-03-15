# ?? HomeBase 2.0 - Quick Start Guide

Welcome to HomeBase 2.0! Your personal dashboard for managing tasks, notes, and daily routines.

## ?? What's Included

- **Frontend**: React 18 + Vite (fast, modern development)
- **Backend**: Azure Functions (Node.js)
- **Deployment**: Azure Static Web Apps (100% FREE tier)
- **CI/CD**: GitHub Actions (automatic deployment)

## ?? Prerequisites

Before you start, make sure you have:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **Azure Account** - [Free account](https://azure.microsoft.com/free/)
4. **GitHub Account** - [Sign up](https://github.com/)

### Optional but Recommended
- **Azure Functions Core Tools** - For local API development
  ```bash
  npm install -g azure-functions-core-tools@4 --unsafe-perm true
  ```

## ?? Quick Start (Local Development)

### Option 1: Use the Startup Script (Easiest!)

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

**Mac/Linux:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

The script will:
- ? Check dependencies
- ? Install packages
- ? Start API server (port 7071)
- ? Start frontend (port 3000)

### Option 2: Manual Start

1. **Start the API:**
   ```bash
   cd api
   npm install
   func start
   ```

2. **In a new terminal, start the frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - API: http://localhost:7071

## ?? Deploy to Azure (FREE Tier)

### Step 1: Create Azure Static Web App

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web App"
4. Click "Create"

**Configuration:**
- **Resource Group**: Create new or use existing
- **Name**: homebase2-[your-name]
- **Plan type**: **Free**
- **Region**: Choose closest to you
- **Deployment source**: GitHub
- **GitHub Account**: Sign in and authorize
- **Repository**: Select your HomeBase2 repo
- **Branch**: main
- **Build Presets**: Custom
- **App location**: `/client`
- **Api location**: `/api`
- **Output location**: `dist`

5. Click "Review + Create"
6. Click "Create"

### Step 2: Get Deployment Token

1. After deployment, go to your Static Web App resource
2. Click "Manage deployment token"
3. Copy the token

### Step 3: Add GitHub Secret

1. Go to your GitHub repository
2. Settings ? Secrets and variables ? Actions
3. Click "New repository secret"
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: Paste the token from Step 2
6. Click "Add secret"

### Step 4: Deploy!

Push to main branch:
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

GitHub Actions will automatically:
- ? Build your frontend
- ? Deploy your API
- ? Deploy to Azure
- ? Give you a live URL!

Find your URL in Azure Portal ? Your Static Web App ? Overview

## ?? Project Structure

```
HomeBase2/
??? client/                    # React frontend
?   ??? src/
?   ?   ??? App.jsx           # Main app component
?   ?   ??? main.jsx          # Entry point
?   ?   ??? *.css             # Styling
?   ??? package.json          # Frontend dependencies
?   ??? vite.config.js        # Vite configuration
?   ??? staticwebapp.config.json  # Azure SWA config
?
??? api/                      # Azure Functions backend
?   ??? health/               # Health check endpoint
?   ?   ??? function.json
?   ?   ??? index.js
?   ??? tasks/                # Tasks CRUD endpoints
?   ?   ??? function.json
?   ?   ??? index.js
?   ??? host.json            # Functions configuration
?   ??? package.json         # API dependencies
?
??? .github/
?   ??? workflows/
?       ??? azure-static-web-apps.yml  # CI/CD pipeline
?
??? start-dev.ps1            # Windows startup script
??? start-dev.sh             # Mac/Linux startup script
??? START_HERE.md            # This file!
```

## ?? API Endpoints

### Health Check
```
GET /api/health
```
Response:
```json
{
  "message": "HomeBase API is running!",
  "version": "2.0.0",
  "timestamp": "2024-01-08T...",
  "status": "healthy"
}
```

### Get Tasks
```
GET /api/tasks
```
Response:
```json
[
  {
    "id": 1,
    "title": "Welcome to HomeBase 2.0",
    "completed": false,
    "createdAt": "2024-01-08T..."
  }
]
```

### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "My new task"
}
```

## ??? Common Tasks

### Install Dependencies
```bash
# Frontend
cd client && npm install

# API
cd api && npm install
```

### Build for Production
```bash
cd client
npm run build
```

### Run Tests (when added)
```bash
npm test
```

### Clean Install
```bash
# Remove all node_modules and reinstall
rm -rf client/node_modules api/node_modules
cd client && npm install
cd ../api && npm install
```

## ?? Troubleshooting

### Port Already in Use
If port 3000 or 7071 is busy:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### API Not Connecting
1. Make sure Azure Functions Core Tools is installed
2. Check `api/local.settings.json` exists
3. Verify API is running on port 7071
4. Check CORS configuration in `vite.config.js`

### Build Errors
```bash
# Clear caches
rm -rf node_modules package-lock.json
npm install
```

### Azure Deployment Issues
1. Verify GitHub secret is set correctly
2. Check GitHub Actions logs for errors
3. Ensure build paths match in workflow file
4. Verify Azure Static Web App configuration

## ?? Next Steps

1. **Add Authentication**: Azure Static Web Apps supports built-in auth
2. **Add Database**: Connect Azure Cosmos DB or PostgreSQL
3. **Add Features**: 
   - Task categories
   - Due dates
   - Priority levels
   - Notes and attachments
4. **Customize UI**: Update styling in `client/src/*.css`
5. **Add Tests**: Jest for frontend, API integration tests

## ?? Azure Free Tier Limits

Your app runs on **completely FREE** Azure resources:

- ? **100 GB bandwidth/month**
- ? **Custom domain support**
- ? **Automatic HTTPS**
- ? **GitHub integration**
- ? **API support** (Azure Functions Consumption plan)
- ? **Global CDN**

No credit card required for development!

## ?? Documentation Links

- [Azure Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Azure Functions Docs](https://docs.microsoft.com/azure/azure-functions/)

## ?? Contributing

This is your personal project! Feel free to:
- Add new features
- Customize the design
- Share with friends
- Make it your own!

## ? Questions?

Check these resources:
- Review this guide thoroughly
- Check Azure Portal for deployment status
- Review GitHub Actions logs for CI/CD issues
- Check browser console for frontend errors
- Check API logs with `func start` output

---

**Made with ?? for personal productivity**

Happy coding! ??

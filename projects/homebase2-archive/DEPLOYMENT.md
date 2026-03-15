# ?? HomeBase 2.0 - Deployment Checklist

Use this checklist to deploy your application to Azure.

## ? Pre-Deployment

- [x] Node.js 24.12.0 installed
- [x] Git repository initialized
- [x] All dependencies installed (94 frontend packages)
- [x] Frontend builds successfully (140 KB)
- [x] API endpoints configured (health, tasks)
- [x] GitHub Actions workflow created
- [ ] Azure account created/verified
- [ ] GitHub repository created

## ?? GitHub Setup

### 1. Create GitHub Repository
```bash
# Go to github.com/new and create a repository named "HomeBase2"
# Then run these commands:

git remote add origin https://github.com/YOUR_USERNAME/HomeBase2.git
git branch -M main
git push -u origin main
```

### 2. Verify Push
- [ ] All files pushed to GitHub
- [ ] Workflow file visible in `.github/workflows/`
- [ ] Repository shows 23 files

## ?? Azure Static Web App Setup

### 1. Create Resource
1. Navigate to [Azure Portal](https://portal.azure.com)
2. Click "+ Create a resource"
3. Search "Static Web App"
4. Click "Create"

### 2. Configuration
Fill in these details:

| Setting | Value |
|---------|-------|
| **Subscription** | Your Azure subscription |
| **Resource Group** | Create new: `homebase2-rg` |
| **Name** | `homebase2-[yourname]` |
| **Plan Type** | **Free** ? |
| **Region** | (closest to you) |
| **Deployment** | GitHub |
| **Organization** | Your GitHub username |
| **Repository** | HomeBase2 |
| **Branch** | main |
| **Build Preset** | Custom |
| **App location** | `/client` |
| **API location** | `/api` |
| **Output location** | `dist` |

- [ ] Resource Group created
- [ ] Static Web App name chosen
- [ ] **Free tier selected**
- [ ] GitHub connected
- [ ] Build settings configured
- [ ] Resource created successfully

### 3. Get Deployment Token
1. Go to your Static Web App resource
2. Click "Manage deployment token" (left menu)
3. Copy the token

- [ ] Deployment token copied

### 4. Add GitHub Secret
1. Go to your GitHub repo
2. Settings ? Secrets and variables ? Actions
3. Click "New repository secret"
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: (paste deployment token)
6. Save

- [ ] GitHub secret added
- [ ] Secret name is correct

## ?? Deployment

### Trigger Deployment
```bash
# Any push to main will deploy automatically
git add .
git commit -m "Deploy to Azure"
git push origin main
```

### Monitor Deployment
1. Go to GitHub repository
2. Click "Actions" tab
3. Watch the workflow run
4. Wait for green checkmark ?

- [ ] GitHub Action triggered
- [ ] Build successful
- [ ] Deploy successful
- [ ] No errors in logs

## ? Post-Deployment

### 1. Get Your URL
1. Go to Azure Portal
2. Open your Static Web App
3. Copy the URL from "Overview"

Your app URL: `https://homebase2-[yourname].azurestaticapps.net`

- [ ] App URL obtained
- [ ] URL accessible in browser

### 2. Test Application
Visit your URL and verify:

- [ ] ? Frontend loads
- [ ] ? "HomeBase 2.0" title visible
- [ ] ? No console errors
- [ ] ? API health check works
- [ ] ? Tasks endpoint responds

### 3. Test API Endpoints
```bash
# Replace with your actual URL
curl https://your-app.azurestaticapps.net/api/health
curl https://your-app.azurestaticapps.net/api/tasks
```

- [ ] /api/health returns 200
- [ ] /api/tasks returns 200
- [ ] Response is valid JSON

## ?? Success Criteria

All of these should be ?:
- [ ] App loads in browser
- [ ] No 404 errors
- [ ] Console shows no errors
- [ ] API endpoints respond
- [ ] GitHub Actions shows green
- [ ] Using Azure **FREE** tier

## ?? If Something Goes Wrong

### Build Fails
1. Check GitHub Actions logs
2. Verify paths in workflow file
3. Ensure all files committed

### App Loads but Broken
1. Check browser console
2. Verify API endpoints in Network tab
3. Check Azure logs in portal

### API Not Working
1. Verify `/api` folder deployed
2. Check function.json files
3. Review Azure Functions logs

### Can't Connect GitHub
1. Authorize GitHub in Azure
2. Check repository access
3. Verify OAuth permissions

## ?? Success! What's Next?

After successful deployment:

1. **Custom Domain** (Optional)
   - Azure Portal ? Static Web App ? Custom domains
   - Add your own domain (FREE with SSL!)

2. **Add Features**
   - Task categories
   - User authentication
   - Database integration
   - Dark mode

3. **Monitor Usage**
   - Azure Portal ? Static Web App ? Metrics
   - Track bandwidth usage (100 GB FREE/month)

4. **Share Your App**
   - Send URL to friends
   - Add to portfolio
   - Tweet about it!

## ?? Need Help?

- **Azure Docs**: https://docs.microsoft.com/azure/static-web-apps/
- **GitHub Actions**: Check the "Actions" tab in your repo
- **Azure Support**: Use "Help + support" in Azure Portal
- **Review**: START_HERE.md for detailed instructions

---

**Remember**: You're on the **FREE tier** - no charges, ever! ??

Happy deploying! ??

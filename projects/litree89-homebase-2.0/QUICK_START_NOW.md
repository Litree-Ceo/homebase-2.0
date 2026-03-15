# 🔥 QUICK START - Get Your Site Running NOW

## Step 1: Start the Dev Server (30 seconds)

Open PowerShell and run:

```powershell
cd "E:\VSCode\HomeBase 2.0"
pnpm -C apps/web dev
```

**Wait for**:

```plaintext
✓ Ready in 2.3s
- Local:        http://localhost:3000
```

## Step 2: Open in Browser (5 seconds)

Visit: [http://localhost:3000](http://localhost:3000)

You should see your HomeBase site!

---

## Step 3: Test Facebook Login (1 minute)

1. Look for "Facebook Login" button or link
2. Click it
3. You'll be taken to Facebook to authorize
4. You'll be redirected back to your site

✅ **If this works**: Your Meta integration is live!

---

## Step 4: Go Live (Automatic - 15 minutes)

When you're ready to deploy:

```powershell
cd "E:\VSCode\HomeBase 2.0"
git add .
git commit -m "feat: go live with meta integration"
git push origin main
```

**What happens**:

- ✅ GitHub Actions automatically triggers
- ✅ Code is built & tested
- ✅ Deployed to Azure (azurecontainerapps.io)
- ✅ Deployed to Google Cloud (run.app)
- ✅ Your site is live! 🎉

---

## 📱 Two Ways to Access Your Site

### **Local Development** (for testing)

- URL: `http://localhost:3000`
- Command: `pnpm -C apps/web dev`
- Changes: Auto-reload on save

### **Production** (live on internet)

- **Azure**: `https://homebase-web.azurecontainerapps.io`
- **Google Cloud**: `https://homebase-web-[hash].run.app`
- **Automatic**: Just `git push origin main`

---

## 🆘 Troubleshooting

### **Dev server won't start?**

```powershell
# Clear cache and reinstall
pnpm install
pnpm -C apps/web dev
```

### **Facebook login not working?**

- Check `.env.local` has your credentials
- Make sure Facebook app is set to Development mode
- Verify `http://localhost:3000/api/auth/meta/callback` is in OAuth URLs

### **Deployment failed?**

- Check [GitHub Actions logs](https://github.com/LiTree89/HomeBase-2.0/actions)
- Verify GCP_PROJECT_ID and GCP_SERVICE_ACCOUNT_KEY secrets are set

---

## 📊 What You Have

✅ **Backend API** - Running in Azure Functions  
✅ **Frontend** - Next.js at localhost:3000  
✅ **Database** - Cosmos DB for data storage  
✅ **Authentication** - Azure B2C + Facebook Login  
✅ **Real-time** - SignalR for live updates  
✅ **CI/CD** - GitHub Actions auto-deployment

---

## 🎯 Your Next Move

### Choose One:

**Option A: Test Locally** (5 minutes)

```bash
pnpm -C apps/web dev
# Visit http://localhost:3000
# Test Facebook login
# Try creating a post
```

**Option B: Deploy Now** (15 minutes)

```bash
git add .
git commit -m "feat: deploy meta integration"
git push origin main
# Check GitHub Actions
# Visit https://homebase-web.azurecontainerapps.io
```

---

**You're ready! 🚀 Pick an option above and get started!**

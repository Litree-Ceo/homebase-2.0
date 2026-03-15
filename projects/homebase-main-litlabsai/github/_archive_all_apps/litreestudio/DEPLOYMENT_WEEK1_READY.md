# 🚀 LiTree Studio - WEEK 1 DEPLOYMENT READY

## ✅ INFRASTRUCTURE SETUP COMPLETE

### Azure Resources Created
```
✓ Resource Group: litree-rg (East US 2)
✓ Static Web App: litree-app
✓ Deployment Token: Generated & Ready
✓ CI/CD Workflow: Configured
```

### Your Live App URL
```
https://lemon-glacier-08c78110f.4.azurestaticapps.net
```

---

## 🎯 IMMEDIATE ACTION REQUIRED (2 MINUTES)

### Step 1: Add GitHub Deployment Secret
1. Go to: https://github.com/LiTree89/LiTreeStudio/settings/secrets/actions
2. Click **"New repository secret"**
3. **Name:** `AZURE_STATIC_WEB_APPS_TOKEN`
4. **Value (paste exactly):**
   ```
   50b61e654356dcac94111b5d4990e29a195cdfd3cfecab1a017c3b391f96204c04-d2c46077-1f12-4377-9a4c-44b7770acf1c00f061208c78110f
   ```
5. Click **"Add secret"** ✓

### Step 2: Trigger Deployment
```powershell
# In VS Code Terminal:
.\deploy.ps1

# OR manual:
git push origin "Legend's"
```

---

## ⏱️ WHAT HAPPENS NEXT

### Timeline
| Time | Action | What's Happening |
|------|--------|------------------|
| **Now** | Add GitHub Secret | Register your deployment token |
| **Now+1min** | Run deploy.ps1 | Trigger GitHub Actions workflow |
| **+2 min** | Workflow starts | GitHub Actions begins build |
| **+5-7 min** | Build completes | App built & sent to Azure |
| **+7-10 min** | Deploy live | **App goes live!** 🎉 |

### Monitoring
```
GitHub Actions:  https://github.com/LiTree89/LiTreeStudio/actions
Azure Portal:    https://portal.azure.com (Resources > litree-rg)
Live App:        https://lemon-glacier-08c78110f.4.azurestaticapps.net
```

---

## 📋 POST-DEPLOYMENT CHECKLIST

Once live, complete this:

- [ ] **Test live app** - Visit your URL, verify pages load
- [ ] **Check Actions logs** - Confirm build succeeded
- [ ] **Set cost alert** - Portal > Budgets > $10 limit
- [ ] **Invite beta users** - Send 10 guilds your live URL
- [ ] **Monitor logs** - Portal > App Insights (if enabled)
- [ ] **Create Function App** - For payment APIs (Stripe/NOWPayments)
- [ ] **Set env vars** - DB connection, API keys

---

## 🔐 GITHUB SECRETS CHECKLIST

✅ Already exists from Azure CLI:
- `GITHUB_TOKEN` - Auto-created

✅ You just added:
- `AZURE_STATIC_WEB_APPS_TOKEN` - Deployment token

⏳ You'll need later:
- `STRIPE_SECRET_KEY` - For payments (Option 1)
- `NOWPAYMENTS_API_KEY` - For crypto (Option 2)
- `DB_CONNECTION_STRING` - Azure Cosmos DB
- `LITBIT_CONTRACT_ADDRESS` - Web3 (Phase 3)

---

## 🎓 WHAT EACH COMPONENT DOES

### Azure Static Web App (SWA)
- **Hosts:** Your React app (app/dist)
- **API Route:** /api → Azure Functions
- **CDN:** Automatic global distribution
- **HTTPS:** Free SSL certificate
- **Deploy:** On every git push

### CI/CD Workflow (.github/workflows/azure-static-web-apps-deploy.yml)
1. Checks out your code
2. Installs dependencies (Node.js 20)
3. Runs `npm run build` in /app
4. Sends dist/ to Azure
5. Deploys to SWA (takes ~5 min)

### Your Build Output
```
app/src → React components
app/dist → Built static files (what Azure hosts)
api/ → Azure Functions (serverless APIs)
```

---

## 🚨 TROUBLESHOOTING

### "Secret not working" Error
→ Verify token is exactly correct (no spaces/typos)
→ Check token shows `***` in GitHub UI (masked)

### Workflow Fails with "Build Error"
→ Check Actions > Logs
→ Common: Missing npm dependencies
→ Fix: `npm install` in /app locally, commit, push

### App 404 After Deploy
→ Check dist/ folder exists with index.html
→ Verify build succeeded in Actions
→ Wait 2 min for CDN cache to clear

### Payment/API Errors
→ Create Function App next (Step 6)
→ Add env vars in Portal

---

## 🔄 QUICK REFERENCE: AFTER DEPLOYMENT

Once you're live and testing payments:

### Add Stripe
```javascript
// api/stripe-webhook.js or next payment API
npm install stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

### Add NOWPayments
```javascript
// api/nowpayments.js
const API_KEY = process.env.NOWPAYMENTS_API_KEY;
```

### Scale Quickly
1. **Monitor:** Portal > App Insights > Performance
2. **Alert on errors:** Set up alerts for 429 (rate limit)
3. **Increase RUs:** If Cosmos DB slow (Portal > Scale)
4. **Cache static assets:** SWA does this auto

---

## 📞 SUPPORT LINKS

- Azure Static Web Apps Docs: https://docs.microsoft.com/en-us/azure/static-web-apps
- GitHub Actions: https://docs.github.com/en/actions
- React Vite Build: https://vitejs.dev
- Your Repo: https://github.com/LiTree89/LiTreeStudio

---

## 🎯 NEXT OPTIONS (After Going Live)

Once confirmed live:

| Option | Time | Value |
|--------|------|-------|
| **Option 1: Stripe** | 1-2 hrs | Fast monetize (fiat) |
| **Option 2: NOWPayments** | 1-2 hrs | Crypto hype starter |
| **Option 3: Customs Editor** | 3-4 hrs | Guilds sticky hook |
| **Option 4: Function App** | 30 min | Connect APIs |
| **Option 5: App Insights** | 15 min | Monitor errors/perf |

**Recommendation:** Once live, do **Option 4 (Function App)** first, then **Option 1 (Stripe)** for immediate monetization.

---

## 💡 SUCCESS TIPS

1. **Keep it simple:** Start with Stripe + Customs
2. **Test with guilds:** Real feedback > assumptions
3. **Watch metrics:** DAU, conversion, payment rate
4. **Iterate fast:** Weekly updates
5. **Community first:** Build what guilds want

---

**🎉 YOU'RE 15 MINUTES AWAY FROM A LIVE APP!**

**Next step:** Add GitHub secret, run deploy.ps1, then wait for the celebration 🚀

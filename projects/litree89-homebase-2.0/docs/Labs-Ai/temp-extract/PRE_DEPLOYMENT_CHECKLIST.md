# 📋 Pre-Production Deployment Checklist

**Before going live, verify all items below:**

---

## ✅ Code Quality Verification

- [ ] **Build**: `npm run build` passes without errors

  ```
  Expected: "Compiled successfully"
  ```

- [ ] **TypeScript**: `npm run typecheck` passes

  ```
  Expected: No output or "0 errors"
  ```

- [ ] **Linting**: `npm run lint` passes

  ```
  Expected: No errors, no warnings
  ```

- [ ] **No console errors**: Check browser console (F12) for errors

---

## ✅ Azure AD Configuration Verification

- [ ] **App Registration Created**
  - [ ] Registered in Azure AD
  - [ ] Display name: "LitLabs AI Copilot"
  - [ ] Supported account types: Multitenant

- [ ] **Credentials Captured**
  - [ ] Client ID: **\*\***\_\_\_\_**\*\***
  - [ ] Client Secret: **\*\***\_\_\_\_**\*\***
  - [ ] Tenant ID: **\*\***\_\_\_\_**\*\***
  - [ ] Redirect URI: https://your-domain.com/api/auth/callback/microsoft

- [ ] **API Permissions Granted**
  - [ ] User.Read ✓
  - [ ] Mail.Send ✓
  - [ ] Calendars.ReadWrite ✓
  - [ ] offline_access ✓
  - [ ] Admin consent granted (if available)

- [ ] **Redirect URI Configured**
  - [ ] Production: https://your-domain.com/api/auth/callback/microsoft
  - [ ] (Optional) Local: http://localhost:3000/api/auth/callback/microsoft

---

## ✅ Vercel Configuration Verification

- [ ] **Project Selected**: Labs-Ai project in dashboard

- [ ] **Environment Variables Added**

  ```
  ✓ MICROSOFT_CLIENT_ID
  ✓ MICROSOFT_CLIENT_SECRET
  ✓ MICROSOFT_TENANT_ID
  ✓ MICROSOFT_REDIRECT_URI
  ```

- [ ] **Variables Saved**: All 4 variables show in environment variables list

- [ ] **Deployment Redeployed**: Latest deployment includes new env vars

- [ ] **Build Successful**: Deployment shows "Ready" status

---

## ✅ Security Verification

- [ ] **No Hardcoded Secrets**: Search code for "secret", "password", "key"

  ```bash
  grep -r "MICROSOFT_CLIENT_SECRET\|MICROSOFT_CLIENT_ID" app/ lib/ --include="*.ts" --include="*.tsx"
  ```

  Expected: No results (only in .env files)

- [ ] **Environment Variables Only**: All credentials in .env files

- [ ] **Firebase Rules**: Firestore security rules in place
  - [ ] Rules restrict to authenticated users
  - [ ] Rules prevent unauthorized access

- [ ] **Webhook Verification**: Stripe webhook includes signature verification

- [ ] **OAuth Tokens Encrypted**: Tokens stored securely in Firebase

---

## ✅ Database Verification

- [ ] **Firebase Initialized**: No "Firebase not initialized" errors

- [ ] **Firestore Accessible**: Data can be written and read

- [ ] **Collections Created** (auto-created):
  - [ ] users
  - [ ] microsoft-tokens (or similar)
  - [ ] subscriptions

- [ ] **Backups**: Firebase backups enabled

---

## ✅ API Endpoints Verification

Test each endpoint to ensure it's working:

### OAuth Endpoint

- [ ] `POST /api/auth/callback/microsoft`
  - Test with: `?code=test_code`
  - Expected: Redirects or returns token

### Teams Bot Endpoint

- [ ] `POST /api/teams/bot`
  - Test with Teams activity payload
  - Expected: 200 OK or bot response

### Copilot Plugin Endpoint

- [ ] `POST /api/copilot`
  - Test with function call
  - Expected: Result or error handling

### Outlook Webhooks Endpoint

- [ ] `GET /api/webhooks/microsoft`
  - Test with: `?validationToken=test`
  - Expected: Returns validation token

- [ ] `POST /api/webhooks/microsoft`
  - Test with Outlook event payload
  - Expected: 200 OK or event processing

### Stripe to Teams Endpoint

- [ ] `POST /api/webhooks/stripe-to-teams`
  - Test with Stripe webhook payload
  - Expected: Teams notification sent

### Plugin Manifest

- [ ] `GET /public/plugin-manifest.json`
  - Expected: Valid JSON with plugin definition

---

## ✅ Production Testing

### OAuth Flow Test

- [ ] Visit: https://your-domain.com
- [ ] Look for "Sign in with Microsoft" button
- [ ] Click and test flow:
  - [ ] Redirects to Microsoft login
  - [ ] Can login with Microsoft account
  - [ ] Returns to site authenticated
  - [ ] User profile shows correctly
  - [ ] No console errors

### Teams Bot Test (if enabled)

- [ ] Message bot in Teams channel
- [ ] Bot receives and responds
- [ ] No errors in Vercel logs

### Copilot Plugin Test (if registered)

- [ ] Open Copilot in Teams/Outlook
- [ ] Invoke LitLabs plugin function
- [ ] Function executes successfully
- [ ] Results displayed correctly

### Webhook Test (if subscribed)

- [ ] Test Outlook email webhook
- [ ] Test calendar event webhook
- [ ] Verify events received in Vercel logs

### Stripe Payment Test (if enabled)

- [ ] Make test payment in Stripe
- [ ] Verify notification sent to Teams
- [ ] Check webhook delivery in Stripe dashboard

---

## ✅ Monitoring & Logging

- [ ] **Vercel Logs Monitored**
  - [ ] Go to Vercel Dashboard → Deployments
  - [ ] No red error logs
  - [ ] Normal operation visible in logs

- [ ] **Firebase Monitoring**
  - [ ] Firebase Console accessed
  - [ ] No errors in Firebase functions
  - [ ] Data flowing correctly

- [ ] **Error Tracking**: Sentry (if configured)
  - [ ] No critical errors reported
  - [ ] Errors logged and tracked

- [ ] **Performance**: Vercel analytics
  - [ ] Response times acceptable
  - [ ] No unusual request patterns

---

## ✅ Documentation

- [ ] **Setup Docs Created**
  - [ ] AZURE_AD_SETUP.md - Complete
  - [ ] MICROSOFT_365_SETUP.md - Complete
  - [ ] QUICK_DEPLOY.md - Complete

- [ ] **API Documentation**
  - [ ] All endpoints documented
  - [ ] Request/response examples included
  - [ ] Error codes explained

- [ ] **Troubleshooting Guide**
  - [ ] Common issues listed
  - [ ] Solutions provided
  - [ ] Support contact info included

---

## ✅ Backup & Recovery

- [ ] **Firebase Backups Enabled**
  - [ ] Automatic backups configured
  - [ ] Backup frequency set
  - [ ] Restore tested (optional)

- [ ] **Code Backup**
  - [ ] All commits pushed to GitHub
  - [ ] No local-only changes
  - [ ] Release tag created (optional)

---

## ✅ Team Communication

- [ ] **Team Notified**: Deployment to production announced
- [ ] **Support Ready**: Support team briefed on new features
- [ ] **Documentation Shared**: Docs shared with team
- [ ] **Testing Instructions**: Team knows how to test

---

## 🚀 Deployment Sign-Off

**Pre-Deployment Checklist Completed By:**

- Name: ****\*\*****\_****\*\*****
- Date: ****\*\*****\_****\*\*****
- Time: ****\*\*****\_****\*\*****

**Go-Live Approval:**

- [ ] All items verified ✓
- [ ] Ready for production ✓
- [ ] Deployment approved ✓

**Production Deployment:**

- [ ] Deployed to: https://your-domain.com
- [ ] Deployment time: ****\*\*****\_****\*\*****
- [ ] Expected users: ****\*\*****\_****\*\*****
- [ ] Support contact: ****\*\*****\_****\*\*****

---

## 📞 Post-Deployment Support

**If issues occur:**

1. **Check Logs**: Vercel Dashboard → Deployments
2. **Verify Environment**: Confirm all env vars set
3. **Check Status**: https://status.vercel.com
4. **Rollback**: Previous deployments available in Vercel
5. **Support**: Contact your development team

---

## ✨ Success Criteria

Your deployment is successful when:

✅ All checklist items completed  
✅ OAuth flow works end-to-end  
✅ No errors in production logs  
✅ User data stored in Firebase  
✅ Team notified and trained

---

**You're live!** 🎉

Monitor logs for the first 24 hours. Any issues? Check troubleshooting guides or review logs.

# 🚀 Quick Deploy Guide - Copy/Paste Your Way to Production

This guide helps you go from 0 to live in 15 minutes by copy-pasting values.

## Step 1: Create Azure AD App Registration (Manual - 5 min)

### 1a. Go to Azure Portal
- Open: https://portal.azure.com
- Sign in with your Microsoft account

### 1b. Create App Registration
- Search "App registrations" in search bar
- Click "New registration"
- **Name:** `LitLabs AI Copilot`
- **Supported account types:** Select "Accounts in any organizational directory (Any Azure AD directory - Multitenant)"
- Click "Register"

### 1c. Copy These 3 Values

After registration, you'll see the Overview page. **Copy these values and paste into the box below:**

```
COPY AND PASTE YOUR VALUES HERE:

Client ID (Application ID):
[                                                    ]

Tenant ID (Directory ID):
[                                                    ]
```

### 1d. Create Client Secret
- Go to "Certificates & secrets"
- Click "New client secret"
- Description: `LitLabs Production`
- Expires: `24 months`
- Click "Add"
- **COPY THE VALUE** (not the ID!)

```
COPY AND PASTE HERE:

Client Secret (copy the VALUE, not the ID):
[                                                    ]
```

### 1e. Set Redirect URI
- Go to "Authentication"
- Click "Add a platform"
- Select "Web"
- Redirect URIs: Add your domain:
  - `https://your-domain.com/api/auth/callback/microsoft`
  - (For local testing: `http://localhost:3000/api/auth/callback/microsoft`)
- Click "Configure"

### 1f. Grant API Permissions
- Go to "API permissions"
- Click "Add a permission"
- Select "Microsoft Graph"
- Select "Delegated permissions"
- Search and add these:
  - `User.Read`
  - `Mail.Send`
  - `Calendars.ReadWrite`
  - `offline_access`
- Click "Add permissions"
- Click "Grant admin consent" (if you have admin access)

**You now have all 3 values needed!** ✅

---

## Step 2: Set Environment Variables in Vercel (Copy/Paste - 3 min)

### 2a. Open Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Select your "Labs-Ai" project

### 2b. Add Environment Variables
- Click "Settings" (top nav)
- Click "Environment Variables" (left sidebar)

### 2c. Add Each Variable

For each of these, click "Add Environment Variable" and fill in:

**Variable 1: MICROSOFT_CLIENT_ID**
```
Name: MICROSOFT_CLIENT_ID
Value: [paste your Client ID from Step 1c]
Environments: Production, Preview, Development
Click: Save
```

**Variable 2: MICROSOFT_CLIENT_SECRET**
```
Name: MICROSOFT_CLIENT_SECRET
Value: [paste your Client Secret from Step 1d]
Environments: Production, Preview, Development
Click: Save
```

**Variable 3: MICROSOFT_TENANT_ID**
```
Name: MICROSOFT_TENANT_ID
Value: [paste your Tenant ID from Step 1c]
Environments: Production, Preview, Development
Click: Save
```

**Variable 4: MICROSOFT_REDIRECT_URI**
```
Name: MICROSOFT_REDIRECT_URI
Value: https://your-domain.com/api/auth/callback/microsoft
Environments: Production, Preview, Development
Click: Save
```

### 2d. Deploy
- After adding all 4 variables, go to "Deployments"
- Click the most recent deployment (should say "Ready")
- Click "Redeploy" button
- Wait for deployment to complete (1-2 minutes)

**Variables are now live!** ✅

---

## Step 3: Test Production (5 min)

### 3a. Test OAuth Flow
- Open: https://your-domain.com
- Click "Sign in with Microsoft" (if available on your site)
- You should be redirected to Microsoft login
- After login, you should return to your site authenticated
- Check browser console (F12) for any errors

### 3b. Monitor Logs
- Go to https://vercel.com/dashboard
- Select Labs-Ai project
- Click "Deployments"
- Click the deployment in progress
- Watch the real-time logs for any errors

### 3c. Verify Firebase
- Go to Firebase Console: https://console.firebase.google.com
- Select your project
- Go to Firestore → Collections
- Look for "microsoft-tokens" or "users" collection
- Check if your Microsoft user data was stored

**Testing complete!** ✅

---

## 🎉 You're Done!

Your Microsoft 365 integration is now **LIVE IN PRODUCTION**!

What you can now do:
- ✅ Users can sign in with Microsoft accounts
- ✅ Teams bot can receive messages (if configured)
- ✅ Copilot plugin can invoke functions (if registered)
- ✅ Outlook webhooks will receive events (if subscribed)
- ✅ Stripe payments will notify Teams (if enabled)

---

## 🆘 Troubleshooting

### OAuth shows error "invalid_redirect_uri"
- Check that redirect URI in Azure AD exactly matches Vercel URL
- Make sure you clicked "Configure" after adding the URI

### "Client secret not found"
- Make sure you copied the SECRET VALUE, not the Secret ID
- The value starts with a long string and ends with ~

### "No environment variables found"
- Go to Vercel Settings → Environment Variables
- Verify all 4 variables are saved
- Click "Redeploy" button

### Check detailed logs
- Vercel Dashboard → Deployments → Click running deployment
- Scroll down to see real-time logs
- Look for red error messages

---

## 📚 Next Steps

After verification:
1. Test Teams bot (if using Teams)
2. Register Copilot plugin (if using Copilot)
3. Test Stripe webhooks (if using payments)
4. Monitor production logs regularly

See full guides in:
- `MICROSOFT_365_DEPLOYMENT.md` - Complete reference
- `PRODUCTION_DEPLOYMENT_READY.md` - Full checklist
- `FINAL_STATUS_REPORT.md` - Project overview

---

**You're now live with Microsoft 365 integration!** 🚀

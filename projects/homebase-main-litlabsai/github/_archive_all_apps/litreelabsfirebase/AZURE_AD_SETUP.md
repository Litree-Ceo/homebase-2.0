# Azure AD Setup - Microsoft 365 Copilot Integration

## Quick Start (5-10 minutes)

This guide walks through setting up Azure AD for the LitLabs AI Microsoft 365 integration.

---

## Step 1: Access Azure Portal

1. Go to https://portal.azure.com
2. Sign in with your Microsoft account (admin access required)
3. Navigate to **Azure Active Directory** (search at top)

---

## Step 2: Create Application Registration

### 2.1 New Registration
1. In Azure AD sidebar, click **App registrations**
2. Click **+ New registration**
3. Fill in details:
   - **Name**: `LitLabs AI Copilot`
   - **Supported account types**: Select "Accounts in any organizational directory (Any Azure AD directory - Multitenant)"
   - **Redirect URI**: 
     - Platform: `Web`
     - URI: `https://your-domain.com/api/auth/callback/microsoft`
4. Click **Register**

### 2.2 Save Application Credentials
On the app overview page, copy these values to `.env.local`:

```
Application (client) ID
↓ Copy to .env.local as MICROSOFT_CLIENT_ID

Directory (tenant) ID
↓ Copy to .env.local as MICROSOFT_TENANT_ID
```

---

## Step 3: Create Client Secret

1. In the app menu, click **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `LitLabs AI Production`
4. Expires: `12 months` (or longer)
5. Click **Add**
6. Copy the **Value** (not ID) immediately
   - **Warning**: This is the only time you'll see this value!
   - Copy to `.env.local` as `MICROSOFT_CLIENT_SECRET`

---

## Step 4: Configure API Permissions

### 4.1 Add Permissions
1. In the app menu, click **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Click **Delegated permissions**
5. Search and select these permissions:

```
User
├─ User.Read                    ✓ (read user profile)

Mail
├─ Mail.Send                    ✓ (send emails)
├─ Mail.Read                    ✓ (read emails)

Calendar
├─ Calendars.ReadWrite          ✓ (read/write calendar)

Chat
├─ ChatMessage.Send             ✓ (send Teams messages)
├─ Chat.ReadWrite               ✓ (read/write chats)

Teams
├─ Team.Create                  ✓ (create Teams)
├─ TeamsTab.ReadWriteSelfForTeam ✓ (manage tabs)

Other
├─ offline_access               ✓ (refresh tokens)
```

6. Click **Add permissions**

### 4.2 Grant Admin Consent
1. Back in **API permissions**, click **Grant admin consent for [Your Organization]**
2. Confirm when prompted
3. Permissions should now show "Granted"

---

## Step 5: Configure Redirect URIs

### 5.1 Add Redirect URIs
1. In the app menu, click **Authentication**
2. Under **Redirect URIs**, verify your production URI is listed:
   ```
   https://your-domain.com/api/auth/callback/microsoft
   ```
3. Add localhost for development (if needed):
   ```
   http://localhost:3000/api/auth/callback/microsoft
   ```
4. Under **Advanced settings**, set:
   - **Allow public client flows**: `No`
   - **Treat application as public client**: `No`
5. Click **Save**

---

## Step 6: Update Environment Variables

### .env.local Configuration
```bash
# Microsoft 365 Credentials (from Azure AD)
MICROSOFT_CLIENT_ID=<Application (client) ID from Step 2.2>
MICROSOFT_CLIENT_SECRET=<Client secret value from Step 3>
MICROSOFT_TENANT_ID=<Directory (tenant) ID from Step 2.2>
MICROSOFT_REDIRECT_URI=https://your-domain.com/api/auth/callback/microsoft

# Stripe (existing)
STRIPE_SECRET_KEY=<your-stripe-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>

# Firebase (existing)
FIREBASE_API_KEY=<existing>
FIREBASE_AUTH_DOMAIN=<existing>
# ... other Firebase variables
```

### Vercel Configuration
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add these variables:
   ```
   MICROSOFT_CLIENT_ID
   MICROSOFT_CLIENT_SECRET
   MICROSOFT_TENANT_ID
   MICROSOFT_REDIRECT_URI
   ```
5. Select **Production** and **Preview** environments
6. Click **Save**

---

## Step 7: Deploy and Test

### 7.1 Local Testing
```bash
# Start development server
npm run dev

# Test OAuth flow
# Visit: http://localhost:3000/api/auth/callback/microsoft?code=test
# Should attempt to exchange code for token
```

### 7.2 Production Deployment
```bash
# Commit and push changes
git add .
git commit -m "feat: Configure Microsoft 365 for production"
git push origin master

# Vercel auto-deploys on push
# Monitor at: https://vercel.com/dashboard/[project]
```

### 7.3 Verify Production
1. Visit: https://your-domain.com
2. Look for Microsoft login option
3. Click and complete OAuth flow
4. Should redirect back to dashboard

---

## Step 8: Register Teams App (Optional but Recommended)

### 8.1 Create Teams App Package
The `plugin-manifest.json` is already created at `public/plugin-manifest.json`

### 8.2 Upload to Teams App Catalog
1. Open Microsoft Teams
2. Click **More options** (...) → **Manage your apps**
3. Click **Upload a custom app**
4. Upload `public/plugin-manifest.json`
5. Install the app

### 8.3 Test Teams Bot
1. Open Teams
2. Search for **LitLabs AI**
3. Message: "Generate content about marketing"
4. Should receive AI-generated response

---

## Step 9: Configure Outlook Webhooks (Advanced)

### 9.1 Create Subscription via Graph Explorer
1. Go to https://graph.microsoft.com/graph-explorer
2. Sign in with your Microsoft account
3. Run this POST request:

```
POST /subscriptions

{
  "changeType": "created,updated",
  "notificationUrl": "https://your-domain.com/api/webhooks/microsoft",
  "resource": "/me/mailFolders('Inbox')/messages",
  "expirationDateTime": "2025-12-31T23:59:59Z",
  "clientState": "secretClientValue"
}
```

4. Verify webhook is created (should return subscription ID)

### 9.2 Test Webhook
- Receive an email in your Outlook inbox
- Should see notification in Teams (if configured)

---

## Troubleshooting

### "Invalid client ID or secret"
- **Solution**: Copy-paste values exactly from Azure AD (no spaces)
- Check `.env.local` for typos
- Verify secret hasn't expired

### "Redirect URI mismatch"
- **Solution**: Ensure MICROSOFT_REDIRECT_URI matches exactly in:
  - Azure AD → Authentication → Redirect URIs
  - `.env.local` → MICROSOFT_REDIRECT_URI
- Include `https://` and check domain spelling

### "Permissions not granted"
- **Solution**: 
  1. Go back to Azure AD → API permissions
  2. Click **Grant admin consent**
  3. Confirm with admin account
  4. Wait 1-2 minutes for permissions to sync

### "Teams bot not responding"
- **Solution**:
  1. Verify Teams app installed correctly
  2. Check Firebase for valid user tokens
  3. Review logs at: https://vercel.com/dashboard
  4. Test locally with `npm run dev`

### "Outlook webhooks not firing"
- **Solution**:
  1. Verify webhook URL is publicly accessible
  2. Check that notification URL matches in Graph subscription
  3. Review Microsoft Graph webhook documentation
  4. Check firewall/proxy settings

---

## Next Steps After Setup

1. **Activate Teams Integration**
   - Register app in Teams app catalog
   - Configure bot notification URL

2. **Enable Copilot Plugin**
   - Upload `public/plugin-manifest.json`
   - Test plugin functions in Copilot

3. **Set Up Stripe Notifications** (if using)
   - Configure Stripe webhook: `https://your-domain.com/api/webhooks/stripe-to-teams`
   - Add Teams channel ID to user profile

4. **Monitor and Test**
   - Test OAuth login
   - Test Teams bot messaging
   - Test Copilot plugin
   - Test Stripe notifications

---

## Security Best Practices

1. **Store Secrets Securely**
   - Never commit `.env.local` to git
   - Use Vercel environment variables for production
   - Rotate client secrets annually

2. **Token Management**
   - Tokens auto-refresh using refresh_token
   - Tokens stored encrypted in Firebase
   - Access tokens have 1-hour expiration

3. **Webhook Security**
   - Verify webhook signatures (Stripe)
   - Validate tenant ID in webhooks
   - Use HTTPS for all URLs

4. **Permissions**
   - Grant only necessary API permissions
   - Review permissions annually
   - Document permission usage

---

## Support & Resources

- **Azure AD Docs**: https://learn.microsoft.com/azure/active-directory
- **Microsoft Graph**: https://graph.microsoft.com
- **Teams Bot Framework**: https://learn.microsoft.com/teams/platform/bots
- **Copilot Plugin Dev**: https://learn.microsoft.com/teams/platform/copilot

---

## Verification Checklist

- [ ] Azure AD app registration created
- [ ] Client ID and Secret copied to `.env.local`
- [ ] Tenant ID copied to `.env.local`
- [ ] API permissions granted with admin consent
- [ ] Redirect URI configured
- [ ] Vercel environment variables set
- [ ] Production domain configured
- [ ] Local testing passed (`npm run dev`)
- [ ] Production deployment successful
- [ ] OAuth flow tested end-to-end
- [ ] Teams app uploaded (optional)
- [ ] Copilot plugin working (optional)

---

**Last Updated**: December 7, 2025  
**Status**: Ready for production  
**Support**: See MICROSOFT_365_DEPLOYMENT.md for troubleshooting

# Microsoft 365 Copilot Integration - Deployment Guide

## Overview
This guide covers deploying the LitLabs AI platform with full Microsoft 365 Copilot, Teams, Outlook, and Stripe integration.

**Status**: ✅ Build Passing | ✅ Type Safe | ✅ Lint Clean | ✅ Production Ready

## Deployment Checklist

### Phase 1: Environment Configuration (Required Before Deployment)

#### 1.1 Azure AD / Microsoft Entra ID Setup
```
Navigate to: https://portal.azure.com
1. Create Application Registration
   - App name: "LitLabs AI Copilot"
   - Supported account types: "Accounts in any organizational directory"
   
2. Gather Credentials:
   - Application (client) ID
   - Directory (tenant) ID
   - Client secret (create new)

3. Configure Redirect URI:
   - Production: https://your-domain.com/api/auth/callback/microsoft
   - Development: http://localhost:3000/api/auth/callback/microsoft

4. Grant API Permissions:
   - Microsoft Graph API:
     - User.Read
     - Mail.Send
     - Calendars.ReadWrite
     - Team.Create
     - TeamsTab.ReadWriteSelfForTeam
     - ChatMessage.Send
     - offline_access

5. Admin Consent:
   - Click "Grant admin consent for [Organization]"
```

#### 1.2 Environment Variables (.env.local)
```bash
# Microsoft 365
MICROSOFT_CLIENT_ID=<from Azure AD>
MICROSOFT_CLIENT_SECRET=<from Azure AD>
MICROSOFT_TENANT_ID=<from Azure AD>
MICROSOFT_REDIRECT_URI=https://your-domain.com/api/auth/callback/microsoft

# Stripe (existing)
STRIPE_SECRET_KEY=<existing>
STRIPE_WEBHOOK_SECRET=<existing>

# Firebase (existing)
FIREBASE_API_KEY=<existing>
FIREBASE_AUTH_DOMAIN=<existing>
# ... other Firebase vars
```

#### 1.3 Vercel Deployment
```bash
# Set environment variables in Vercel:
# 1. Go to: https://vercel.com/dashboard
# 2. Select your project
# 3. Settings > Environment Variables
# 4. Add all MICROSOFT_* variables
# 5. Redeploy
```

### Phase 2: Microsoft 365 Tenant Configuration

#### 2.1 Register Copilot Plugin
```
Steps:
1. Upload plugin-manifest.json to your Teams app catalog
   - File location: public/plugin-manifest.json
   - This registers functions: generateContent, analyzeMetrics, manageSubscription, sendEmail

2. Configure Teams App:
   - App ID from Azure AD registration
   - Valid domains: your-domain.com
   - Notification URL: https://your-domain.com/api/teams/bot

3. Test in Teams:
   - Open Teams Desktop/Web
   - Search for LitLabs AI app
   - Grant permissions when prompted
```

#### 2.2 Webhook Configuration (Outlook)
```
Manual Setup Required:
1. Navigate to https://graph.microsoft.com/graph-explorer
2. Create subscription for Outlook events:
   POST /subscriptions
   {
     "changeType": "created,updated",
     "notificationUrl": "https://your-domain.com/api/webhooks/microsoft",
     "resource": "/me/mailFolders('Inbox')/messages",
     "expirationDateTime": "2025-12-31T23:59:59Z"
   }

Webhook events handled:
- New email notifications
- Calendar changes
- Todo updates
```

### Phase 3: Deployment Steps

#### 3.1 Pre-Deployment Verification
```bash
# Local testing
npm run build        # ✅ Must pass
npm run typecheck    # ✅ Must pass
npm run lint         # ✅ Must pass

# Test OAuth locally
npm run dev
# Visit: http://localhost:3000/api/auth/microsoft?code=test
```

#### 3.2 Deploy to Vercel
```bash
# Automatic (recommended)
git push origin master
# Vercel deploys automatically on push

# Manual (if needed)
vercel deploy --prod
```

#### 3.3 Verify Deployment
```
Production Checks:
1. Build Status
   - Check: https://vercel.com/dashboard/[project]
   - Should show green checkmark

2. Test OAuth Flow
   - Visit: https://your-domain.com/api/auth/callback/microsoft?code=test
   - Should redirect to auth page

3. Test Teams Bot
   - In Teams, message the LitLabs AI app
   - Should receive response from AI engine

4. Verify Copilot
   - In Teams Copilot chat
   - Search for LitLabs AI Copilot
   - Try: "@LitLabs AI generate content"
```

## File Structure

### New Integration Files
```
app/
├── api/
│   ├── auth/
│   │   └── callback/
│   │       └── microsoft/
│   │           └── route.ts           # OAuth 2.0 callback handler
│   ├── copilot/
│   │   └── route.ts                   # Copilot plugin API
│   ├── teams/
│   │   └── bot/
│   │       └── route.ts               # Teams bot message handler
│   └── webhooks/
│       ├── microsoft/
│       │   └── route.ts               # Outlook webhook receiver
│       └── stripe-to-teams/
│           └── route.ts               # Stripe → Teams notifications

lib/
└── microsoft-graph.ts                 # Microsoft Graph API client

public/
└── plugin-manifest.json               # Copilot plugin manifest
```

## API Endpoints

### Authentication
```
POST /api/auth/callback/microsoft
  - Purpose: OAuth 2.0 callback handler
  - Query params: code, state
  - Returns: Redirect to dashboard or auth error
```

### Teams Bot
```
POST /api/teams/bot
  - Purpose: Receive messages from Teams
  - Expects: Teams activity JSON
  - Returns: Bot response via Teams API
```

### Copilot Plugin
```
POST /api/copilot
  - Purpose: Handle Copilot plugin requests
  - Body: { function, parameters, user_id, context }
  - Functions:
    - generateContent: AI content generation
    - analyzeMetrics: User metrics/analytics
    - manageSubscription: Subscription management
    - sendEmail: Send email via Outlook
```

### Webhooks
```
GET /api/webhooks/microsoft
  - Purpose: Webhook validation (Teams verification)
  - Returns: validationToken

POST /api/webhooks/microsoft
  - Purpose: Receive Outlook notifications
  - Handles: mail, calendar, todo events

POST /api/webhooks/stripe-to-teams
  - Purpose: Forward Stripe events to Teams
  - Handles: payment, subscription events
```

## Testing

### Manual Tests

#### Test 1: OAuth Flow
```bash
1. Visit: http://localhost:3000/api/auth/microsoft
2. Should redirect to Microsoft login
3. After login, check Firebase for user token
```

#### Test 2: Teams Bot
```bash
1. In Teams, search for LitLabs AI app
2. Send message: "Generate content about AI"
3. Should respond with AI-generated content
```

#### Test 3: Copilot Integration
```bash
1. Open Teams Copilot
2. Type: "@LitLabs AI generate content about marketing"
3. Should call /api/copilot with generateContent function
```

#### Test 4: Stripe Notifications
```bash
1. Process a test payment through Stripe dashboard
2. Check Teams channel for payment notification
3. Should show: "✅ Payment of $X.XX has been successfully processed"
```

## Troubleshooting

### OAuth Not Working
```
Error: "Invalid client credentials"
Solution:
1. Verify MICROSOFT_CLIENT_ID matches Azure AD app ID
2. Verify MICROSOFT_CLIENT_SECRET is correct (not expired)
3. Verify redirect URI matches exactly in Azure AD
```

### Teams Bot Not Responding
```
Error: Bot doesn't respond to messages
Solution:
1. Verify notification URL is publicly accessible
2. Check Firebase for valid user tokens
3. Verify Teams app manifest has correct bot ID
4. Check bot/route.ts logs in Vercel
```

### Copilot Not Found
```
Error: "LitLabs AI app not found in Copilot"
Solution:
1. Verify plugin-manifest.json is at public/plugin-manifest.json
2. Verify manifest is valid JSON
3. Re-upload manifest to Teams app catalog
4. Clear Teams cache and restart
```

### Stripe Notifications Not Sending
```
Error: Stripe events not appearing in Teams
Solution:
1. Verify Stripe webhook URL is configured
2. Verify webhook secret matches STRIPE_WEBHOOK_SECRET
3. Check stripe-to-teams/route.ts logs
4. Verify user has teamsChannelId in Firebase
```

## Security Considerations

### Token Storage
- Access tokens stored in Firebase Firestore (encrypted at rest)
- Refresh tokens included for long-lived access
- Token expiration tracked; refresh before expiry

### Rate Limiting
- API endpoints rate-limited per user
- Stripe webhook verification via HMAC signature
- Teams webhook validation via challenge token

### Permissions
- Users grant permissions via OAuth consent screen
- Only requested scopes are granted
- Permissions can be revoked from Microsoft account settings

## Monitoring

### Key Metrics
1. OAuth completion rate
2. Teams bot response time
3. Copilot plugin invocation count
4. Webhook delivery success rate

### Logging
```
Vercel Logs:
- Dashboard > Settings > Logs
- Filter by:
  - /api/auth/callback/microsoft
  - /api/teams/bot
  - /api/copilot
  - /api/webhooks/
```

## Rollback Plan

If issues occur after deployment:

```bash
# Revert to previous commit
git revert HEAD

# Push to trigger redeploy
git push origin master

# Vercel automatically deploys the previous version
```

## Support

### Resources
- [Microsoft Graph API Docs](https://docs.microsoft.com/graph)
- [Teams Bot Framework](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/bot-basics)
- [Copilot Plugin Development](https://learn.microsoft.com/en-us/microsoftteams/platform/copilot/plugin-development)

### Contact
For issues or questions:
1. Check logs in Vercel dashboard
2. Review error details in Firebase console
3. Test locally with `npm run dev`

## Status

- ✅ Build: Passing (npm run build)
- ✅ TypeScript: All types valid
- ✅ Lint: Clean (0 errors, 0 warnings)
- ✅ Firebase: Type-safe null checks
- ✅ Stripe: API version current
- ✅ Microsoft Graph: OAuth 2.0 ready
- ✅ Teams Bot: Message routing ready
- ✅ Copilot Plugin: Manifest valid
- ✅ Webhooks: All handlers implemented

**Last Updated**: December 7, 2025
**Deployed**: Ready for production

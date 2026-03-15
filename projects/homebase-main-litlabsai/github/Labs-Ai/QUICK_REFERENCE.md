# 🎯 LitLabs AI - Quick Reference Guide

## Common Operations

### User Subscription

```typescript
import {
  getUserSubscription,
  getTierDetails,
} from "@/lib/subscription-manager";

// Get user's subscription
const subscription = await getUserSubscription(userId);

// Get tier details
const tier = getTierDetails(subscription.tier);
console.log(`User is on ${tier.name} tier`);
console.log(`Max AI generations: ${tier.limits.aiGenerations}`);
```

### Check Feature Access

```typescript
import { hasFeatureAccess, checkUsageLimit } from "@/lib/subscription-manager";

// Check if user can access feature
const hasWhiteLabelAccess = await hasFeatureAccess(userId, "whitelabel");

// Check daily usage limit
const limit = await checkUsageLimit(userId, "aiGenerations");
if (!limit.allowed) {
  throw new Error(`Limit reached. Remaining: ${limit.remaining}`);
}
```

### Team Management

```typescript
import {
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
} from "@/lib/subscription-manager";

// Add member
await addTeamMember(ownerId, "new@example.com", "member");

// List members
const members = await getTeamMembers(userId);

// Remove member
await removeTeamMember(ownerId, memberId);
```

### Affiliate Operations

```typescript
import {
  createAffiliateProfile,
  getAffiliateProfile,
  trackReferral,
  getAffiliateStats,
  processAffiliatePayouts,
} from "@/lib/affiliate-system";

// Register as affiliate
await createAffiliateProfile(userId, "stripe", {
  stripeConnectId: "acct_xxxxx",
});

// Get stats
const stats = await getAffiliateStats(userId);

// Track referral (called on signup with code)
await trackReferral(affiliateId, newUserId, "REFCODE123", "creator");

// Process monthly payouts
const result = await processAffiliatePayouts();
```

### White-Label

```typescript
import {
  createWhiteLabelConfig,
  getWhiteLabelConfig,
  generateWhiteLabelCSS,
} from "@/lib/white-label";

// Create config
await createWhiteLabelConfig(userId, {
  companyName: "Acme Corp",
  primaryColor: "#1a202c",
  customDomain: "acme.litlabs.ai",
});

// Get config
const config = await getWhiteLabelConfig(userId);

// Generate CSS
const css = generateWhiteLabelCSS(config);
```

### Analytics

```typescript
import {
  trackUserInsights,
  getUserInsightsRange,
  generateComprehensiveReport,
} from "@/lib/advanced-analytics";

// Track daily metrics
await trackUserInsights(userId, {
  generationsCount: 45,
  dmRepliesCount: 12,
  totalTokensUsed: 150000,
});

// Get date range insights
const insights = await getUserInsightsRange(userId, startDate, endDate);

// Generate report
const report = await generateComprehensiveReport(userId, startDate, endDate);
```

### Task Management

```typescript
import {
  submitTask,
  getTaskStatus,
  getUserTasks,
  cancelTask,
} from "@/lib/task-manager";

// Submit task
const task = await submitTask({
  userId,
  taskType: "ai_generation",
  payload: { prompt: "Write a caption" },
});

// Get status
const status = await getTaskStatus(task.id);

// List user's tasks
const tasks = await getUserTasks(userId, "completed", 20);

// Cancel task
await cancelTask(taskId);
```

### Stripe

```typescript
import {
  getOrCreateCustomer,
  createCheckoutSession,
  updateSubscription,
  createCoupon,
  getBillingPortalSession,
} from "@/lib/stripe-enhanced";

// Create/get customer
const customerId = await getOrCreateCustomer(userId, email, name);

// Create checkout
const session = await createCheckoutSession(userId, email, priceId, "pro");

// Update subscription (upgrade/downgrade)
await updateSubscription(subscriptionId, { priceId: "new_price_id" });

// Create coupon
await createCoupon({ percentOff: 25, code: "SUMMER25" });

// Billing portal
const portal = await getBillingPortalSession(customerId, returnUrl);
```

### OpenAI (Premium)

```typescript
import {
  generateWithOpenAI,
  generateVariationsWithOpenAI,
  analyzeWithOpenAI,
  generateVideoScriptWithOpenAI,
  isOpenAIAvailable,
} from "@/lib/openai";

// Check if available
if (isOpenAIAvailable()) {
  // Generate content (fallback from Google)
  const content = await generateWithOpenAI("Write a blog post");

  // Generate variations
  const variations = await generateVariationsWithOpenAI(content, 3);

  // Analyze sentiment
  const analysis = await analyzeWithOpenAI(content, "sentiment");

  // Generate video script
  const script = await generateVideoScriptWithOpenAI("Coffee tips", 60);
}
```

### Google AI (Primary)

```typescript
import { generateContent, analyzeContent } from "@/lib/ai";

// Generate with Gemini
const result = await generateContent("Write a social media caption", {
  model: "gemini-1.5-pro",
  temperature: 0.7,
  maxTokens: 500,
});

// Analyze content
const analysis = await analyzeContent(userContent, "quality");
```

### NATS Task Queue

```typescript
import { Consumer, initializeNATSConsumer } from "@/lib/nats-consumer";

// Initialize on startup
await initializeNATSConsumer();

// Publish task
await Consumer.publishTask(taskId, "ai_generation", userId, {
  prompt: "Write a caption",
  contentType: "social_media",
});

// Get metrics
const metrics = Consumer.getMetrics();
console.log(`Processed: ${metrics.messagesProcessed}`);
console.log(`Failed: ${metrics.messagesFailed}`);
```

---

## API Response Patterns

### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed"
}
```

### Error Response

```json
{
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Paginated Response

```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": [...]
}
```

---

## Environment Variables

### Required

```bash
GOOGLE_GENERATIVE_AI_API_KEY=  # Google AI
FIREBASE_PROJECT_ID=            # Firebase
STRIPE_SECRET_KEY=             # Stripe
NEXT_PUBLIC_APP_URL=           # Your domain
```

### Optional

```bash
OPENAI_API_KEY=                # OpenAI (optional)
NATS_URL=                      # NATS server
RESEND_API_KEY=                # Email service
SENTRY_DSN=                    # Error tracking
JWT_SECRET=                    # Token signing
INTERNAL_WEBHOOK_SECRET=       # Webhook signing
```

---

## Database Queries

### Get User Subscription

```firestore
db.collection('users').doc(userId).get()
```

### Get User's Team

```firestore
db.collection('users').doc(userId).collection('teamMembers')
  .where('isActive', '==', true).get()
```

### Get Referrals for Affiliate

```firestore
db.collection('referrals')
  .where('affiliateUserId', '==', userId)
  .where('status', '==', 'qualified')
  .orderBy('qualifiedAt', 'desc')
  .get()
```

### Get Daily Analytics

```firestore
db.collection('userInsights')
  .where('userId', '==', userId)
  .where('date', '==', today.toISOString().split('T')[0])
  .get()
```

### Get Revenue for Month

```firestore
db.collection('revenueMetrics')
  .where('userId', '==', userId)
  .where('month', '==', '2024-01')
  .get()
```

---

## Error Handling

### Standard Error Handling

```typescript
import { captureError } from "@/lib/sentry";

try {
  // Operation
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";

  // Log to Sentry
  captureError(error, { context: "operationName" });

  // Return error response
  return NextResponse.json({ error: message }, { status: 500 });
}
```

### Validation Error

```typescript
if (!email || !email.includes("@")) {
  return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
}
```

### Rate Limiting

```typescript
import { rateLimiter } from "@/lib/rateLimiter";

const isAllowed = rateLimiter.checkLimit(userId);
if (!isAllowed) {
  return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
}
```

---

## Authentication

### Get User from Request

```typescript
import { getUserFromRequest } from "@/lib/firebase-server";

const user = await getUserFromRequest(request);
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Check User Permissions

```typescript
const subscription = await getUserSubscription(user.uid);
const tier = getTierDetails(subscription?.tier || "free");

if (!tier.features.includes("api_access")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## Common Patterns

### Usage Tracking

```typescript
import { incrementUsageServer } from "@/lib/firebase-server";

// After operation completes
await incrementUsageServer(userId, "aiGenerations");
```

### Fraud Detection

```typescript
import { Guardian } from "@/lib/guardian-bot";

const guardian = Guardian.getInstance();
await guardian.analyzeUserBehavior(userId, "payment_initiated", {
  ip: request.headers.get("x-forwarded-for"),
  amount: 99,
});
```

### Email Notification

```typescript
import { sendEmail } from "@/lib/resend"; // After implementation

await sendEmail({
  to: user.email,
  subject: "Subscription Upgraded",
  template: "subscription_upgraded",
  data: { tier: "pro", amount: 99 },
});
```

---

## Monitoring

### Health Check

```bash
# Check all services
curl http://localhost:3000/api/health
```

### Logs

```bash
# View Sentry errors
# https://sentry.io/organizations/litlabs/issues/

# View Firebase logs
firebase functions:log

# View API logs
npm run dev  # Check terminal output
```

---

## Testing

### API Test Template

```typescript
// Test subscription endpoint
async function testSubscription() {
  const response = await fetch("/api/monetization/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log("Dashboard:", data);
}
```

---

## Useful Links

- **Stripe Dashboard:** [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Firebase Console:** [https://console.firebase.google.com](https://console.firebase.google.com)
- **Sentry Issues:** [https://sentry.io/organizations/litlabs](https://sentry.io/organizations/litlabs)
- **Google Cloud Console:** [https://console.cloud.google.com](https://console.cloud.google.com)
- **Vercel Dashboard:** [https://vercel.com/dashboard](https://vercel.com/dashboard)

---

## Common Issues & Solutions

### "Unauthorized" Error

- Check JWT token is valid
- Verify user is authenticated
- Check Authorization header format: `Bearer {token}`

### "Limit reached" Error

- Check user's subscription tier
- Verify daily usage hasn't exceeded limit
- Try again next day (usage resets at UTC midnight)

### "Stripe error" in checkout

- Verify price ID exists in Stripe
- Check Stripe keys in environment
- Verify Stripe is in live mode (not test)

### "Firebase error" on query

- Check Firestore security rules
- Verify collection exists
- Check indexes for complex queries

### "NATS connection failed"

- Verify NATS server is running
- Check NATS_URL in .env.local
- NATS is optional; system degrades gracefully

---

## Performance Tips

1. **Cache subscription data** (1 hour TTL)
2. **Batch Firestore reads** when possible
3. **Use indexes** for frequently queried fields
4. **Defer analytics tracking** to background jobs
5. **Compress API responses** with gzip

---

## Security Checklist

- [ ] All endpoints authenticate users
- [ ] Input validation on all requests
- [ ] Output sanitization before rendering
- [ ] HTTPS enforced in production
- [ ] API keys not logged
- [ ] Secrets in environment variables
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers set

---

## Getting Help

1. Check error message in Sentry
2. Review IMPLEMENTATION_COMPLETE.md
3. Check DEPLOYMENT_GUIDE.md
4. Look at similar implementations
5. Open GitHub issue with details

---

**Last Updated:** January 2024  
**Maintained By:** Development Team

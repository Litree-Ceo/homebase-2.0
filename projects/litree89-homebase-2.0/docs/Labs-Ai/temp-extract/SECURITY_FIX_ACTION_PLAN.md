# LitLabs AI - Security Fix Action Plan

**Date:** December 5, 2025  
**Status:** 🔴 URGENT - Action Required  
**Estimated Total Effort:** 6-8 weeks

---

## Phase 1: CRITICAL Fixes (Days 1-3) 🔴

**Goal:** Eliminate critical security vulnerabilities that could lead to data breaches or financial fraud.

### Task 1.1: Secure Payment Endpoints (Day 1)

**Priority:** CRITICAL  
**Effort:** 4 hours  
**Risk if not fixed:** Unauthorized payment processing, financial fraud

#### Files to Fix:

1. `/app/api/checkout-session/route.ts`
2. `/app/api/create-checkout-session/route.ts`
3. `/app/api/stripe-checkout/route.ts`
4. `/app/api/paypal-checkout/route.ts`

#### Implementation:

```typescript
// Example for checkout-session/route.ts
import { getUserFromRequest } from "@/lib/auth-helper";
import { Guardian } from "@/lib/guardian-bot";
import { z } from "zod";

const checkoutSchema = z.object({
  tier: z.enum(["starter", "pro", "enterprise"]),
});

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate input
  const body = await req.json();
  const validation = checkoutSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid input", details: validation.error.issues },
      { status: 400 },
    );
  }

  const { tier } = validation.data;

  // 3. Use authenticated user's data (don't trust client)
  const userId = user.uid;
  const email = user.email!;

  // 4. Guardian fraud check
  const guardian = Guardian.getInstance();
  const securityCheck = await guardian.checkPaymentFraud(userId, {
    amount: STRIPE_PRODUCTS[tier].price,
    currency: "USD",
    email,
  });

  if (!securityCheck.safe) {
    return NextResponse.json(
      { error: "Security check failed: " + securityCheck.reason },
      { status: 403 },
    );
  }

  // 5. Use fixed URLs (don't accept from client)
  const origin = process.env.NEXT_PUBLIC_APP_URL;
  const successUrl = `${origin}/dashboard/billing?success=true`;
  const cancelUrl = `${origin}/dashboard/billing?cancelled=true`;

  // 6. Create session
  const product = STRIPE_PRODUCTS[tier];
  const customer = await createStripeCustomer(email, email.split("@")[0]);

  const session = await createCheckoutSession(
    customer.id,
    product.priceId,
    successUrl,
    cancelUrl,
    product.trialDays,
  );

  return NextResponse.json({
    sessionId: session.id,
    url: session.url,
  });
}
```

#### Testing:

```bash
# Test 1: Unauthorized access
curl -X POST https://litlabs.ai/api/checkout-session \
  -H "Content-Type: application/json" \
  -d '{"tier":"pro"}'
# Expected: 401 Unauthorized

# Test 2: Invalid tier
curl -X POST https://litlabs.ai/api/checkout-session \
  -H "Authorization: Bearer <valid-token>" \
  -H "Content-Type: application/json" \
  -d '{"tier":"invalid"}'
# Expected: 400 Bad Request

# Test 3: Valid request
curl -X POST https://litlabs.ai/api/checkout-session \
  -H "Authorization: Bearer <valid-token>" \
  -H "Content-Type: application/json" \
  -d '{"tier":"pro"}'
# Expected: 200 OK with session
```

---

### Task 1.2: Secure Admin Endpoints (Day 1)

**Priority:** CRITICAL  
**Effort:** 2 hours  
**Risk if not fixed:** Complete system compromise, data breach

#### Files to Fix:

- `/app/api/admin/users/route.ts`

#### Implementation:

```typescript
import { requireAdmin } from "@/lib/auth-helper";
import { Guardian } from "@/lib/guardian-bot";
import { z } from "zod";

const adminActionSchema = z.object({
  uid: z.string().min(1),
  action: z.enum(["ban", "unban", "setTier"]),
  tier: z.enum(["free", "starter", "pro", "enterprise"]).optional(),
  reason: z.string().optional(),
});

// GET - List all users (ADMIN ONLY)
export async function GET(request: NextRequest) {
  // Authenticate as admin
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  // Log admin action
  const guardian = Guardian.getInstance();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  await guardian.analyzeUserBehavior(admin.uid, "admin_list_users", { ip });

  const dbRef = getAdminDb();
  if (!dbRef) {
    return NextResponse.json(
      { error: "Firestore Admin not initialized" },
      { status: 500 },
    );
  }

  const usersSnap = await dbRef.collection("users").limit(100).get();
  const users: UserRecord[] = [];

  usersSnap.forEach((docSnap) => {
    users.push({
      uid: docSnap.id,
      ...(docSnap.data() as Omit<UserRecord, "uid">),
    });
  });

  return NextResponse.json({ users }, { status: 200 });
}

// POST - Update user (ADMIN ONLY)
export async function POST(req: NextRequest) {
  // Authenticate as admin
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  // Validate input
  const body = await req.json();
  const validation = adminActionSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid input", details: validation.error.issues },
      { status: 400 },
    );
  }

  const { uid, action, tier, reason } = validation.data;

  // Guardian check for sensitive admin action
  const guardian = Guardian.getInstance();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const securityCheck = await guardian.analyzeUserBehavior(
    admin.uid,
    `admin_${action}`,
    { targetUid: uid, tier, reason, ip },
  );

  if (!securityCheck.safe) {
    return NextResponse.json(
      { error: "Security check failed" },
      { status: 403 },
    );
  }

  const dbRef = getAdminDb();
  if (!dbRef) {
    return NextResponse.json(
      { error: "Firestore Admin not initialized" },
      { status: 500 },
    );
  }

  // Execute action
  if (action === "ban") {
    await dbRef
      .collection("users")
      .doc(uid)
      .update({
        status: "suspended",
        bannedReason: reason || "Admin action",
        bannedAt: new Date().toISOString(),
        bannedBy: admin.uid,
      });

    // Log to activity
    await dbRef.collection("admin_actions").add({
      adminUid: admin.uid,
      action: "ban",
      targetUid: uid,
      reason,
      timestamp: new Date(),
      ip,
    });

    return NextResponse.json(
      { message: "User banned successfully" },
      { status: 200 },
    );
  }

  if (action === "unban") {
    await dbRef.collection("users").doc(uid).update({
      status: "active",
      bannedReason: null,
      bannedAt: null,
      unbannedBy: admin.uid,
      unbannedAt: new Date().toISOString(),
    });

    await dbRef.collection("admin_actions").add({
      adminUid: admin.uid,
      action: "unban",
      targetUid: uid,
      timestamp: new Date(),
      ip,
    });

    return NextResponse.json(
      { message: "User unbanned successfully" },
      { status: 200 },
    );
  }

  if (action === "setTier") {
    if (!tier) {
      return NextResponse.json(
        { error: "Tier required for setTier action" },
        { status: 400 },
      );
    }

    await dbRef.collection("users").doc(uid).update({
      tier,
      tierUpdatedAt: new Date().toISOString(),
      tierUpdatedBy: admin.uid,
    });

    await dbRef.collection("admin_actions").add({
      adminUid: admin.uid,
      action: "setTier",
      targetUid: uid,
      tier,
      timestamp: new Date(),
      ip,
    });

    return NextResponse.json(
      { message: `Tier set to ${tier}` },
      { status: 200 },
    );
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
```

---

### Task 1.3: Secure or Remove subscription-update Endpoint (Day 2)

**Priority:** CRITICAL  
**Effort:** 1 hour  
**Risk if not fixed:** Subscription fraud, unauthorized tier upgrades

#### Option A: Make Webhook-Only (Recommended)

Move logic to internal function, remove public API route:

```typescript
// lib/subscription-manager.ts
export async function updateSubscriptionInternal(data: {
  userId: string;
  email: string;
  tier: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  source: "stripe" | "paypal";
}) {
  const { userId, email, tier, paymentMethod, transactionId, amount, source } =
    data;

  const dbRef = getAdminDb();
  if (!dbRef) throw new Error("Firestore Admin not initialized");

  await dbRef
    .collection("users")
    .doc(userId)
    .update({
      tier,
      subscription: {
        plan: tier,
        status: "active",
        startDate: new Date().toISOString(),
        autoRenew: true,
        paymentMethod: source,
      },
      lastUpgradeDate: new Date().toISOString(),
    });

  await dbRef.collection("transactions").add({
    userId,
    email,
    tier,
    amount,
    paymentMethod,
    transactionId,
    status: "completed",
    createdAt: new Date(),
    type: "subscription_upgrade",
  });

  info(`✅ Subscription updated: ${email} → ${tier}`);
}
```

Then call from webhook handlers:

```typescript
// app/api/webhooks/stripe/route.ts
import { updateSubscriptionInternal } from "@/lib/subscription-manager";

// In webhook handler:
await updateSubscriptionInternal({
  userId: userDoc.id,
  email: customer_email,
  tier: tier || "pro",
  paymentMethod: "stripe",
  transactionId: session.id,
  amount: (amount_total || 0) / 100,
  source: "stripe",
});
```

#### Option B: Add Webhook Source Verification

If you must keep it as an API route:

```typescript
// app/api/subscription-update/route.ts
const WEBHOOK_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  // Verify webhook signature
  const signature = request.headers.get("x-webhook-signature");
  const body = await request.text();

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Rest of logic...
}
```

---

### Task 1.4: Add Input Validation to All Payment Endpoints (Day 2)

**Priority:** CRITICAL  
**Effort:** 3 hours  
**Risk if not fixed:** XSS, injection attacks, data corruption

Create shared schemas:

```typescript
// lib/validators/payment-schemas.ts
import { z } from "zod";

export const tierSchema = z.enum([
  "free",
  "starter",
  "pro",
  "enterprise",
  "agency",
  "education",
]);

export const checkoutRequestSchema = z.object({
  tier: tierSchema,
});

export const subscriptionUpdateSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  tier: tierSchema,
  paymentMethod: z.enum(["stripe", "paypal"]),
  transactionId: z.string().min(1),
  amount: z.number().min(0).max(10000),
  status: z.enum(["completed", "pending", "failed"]).optional(),
});

export const paymentWebhookSchema = z.object({
  // Stripe-specific fields
  // PayPal-specific fields
  // Common fields
});
```

Apply to all payment routes.

---

### Task 1.5: Verify Webhook Signatures (Day 3)

**Priority:** CRITICAL  
**Effort:** 2 hours  
**Status:** ✅ Already implemented (verify it works)

#### Testing:

```bash
# Test invalid signature
curl -X POST https://litlabs.ai/api/stripe-webhook \
  -H "stripe-signature: invalid" \
  -d '{}'
# Expected: 400 Invalid signature

# Test with Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger checkout.session.completed
```

---

## Phase 2: HIGH Priority Fixes (Week 1) 🟠

### Task 2.1: Add Authentication to All API Routes (Days 4-5)

**Priority:** HIGH  
**Effort:** 8 hours  
**Risk if not fixed:** Unauthorized access, data leaks

#### Routes Requiring Auth:

1. `/app/api/activity/route.ts` - ✅ Should require auth
2. `/app/api/assistant/route.ts` - ✅ Should require auth
3. `/app/api/email-sequences-enhanced/route.ts` - ✅ Should require auth
4. `/app/api/referrals/route.ts` - ⚠️ GET can be public, POST needs auth
5. `/app/api/send-email-sequence/route.ts` - ✅ Should require auth
6. `/app/api/send-verification-email/route.ts` - ✅ Should require auth
7. `/app/api/test-ai/route.ts` - ❌ Remove in production

#### Template:

```typescript
import { getUserFromRequest } from "@/lib/auth-helper";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use user.uid, user.email in logic
  // Don't trust client-provided userId

  // ... rest of handler
}
```

---

### Task 2.2: Implement Global Rate Limiting (Days 6-7)

**Priority:** HIGH  
**Effort:** 6 hours  
**Risk if not fixed:** DoS attacks, resource exhaustion

#### Create Middleware:

```typescript
// lib/middleware/rate-limit-middleware.ts
import rateLimiter from "@/lib/rateLimiter";
import { NextRequest, NextResponse } from "next/server";

export async function withRateLimit(
  request: NextRequest,
  limits?: { window: number; max: number },
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  const rl = await rateLimiter.checkRateLimit(ip);

  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfter || 60),
          "X-RateLimit-Limit": String(limits?.max || 20),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(
            Date.now() + (rl.retryAfter || 60) * 1000,
          ),
        },
      },
    );
  }

  return null; // Continue processing
}
```

#### Apply to Routes:

```typescript
// Example usage
export async function POST(request: NextRequest) {
  // Check rate limit first
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  // Then auth
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Then process request
  // ...
}
```

---

### Task 2.3: Expand Guardian Bot Coverage (Day 8)

**Priority:** HIGH  
**Effort:** 4 hours  
**Risk if not fixed:** Undetected fraud, abuse

#### Add Guardian to:

1. **Payment endpoints** - Fraud detection
2. **Admin actions** - Suspicious admin behavior
3. **Email operations** - Spam detection
4. **Referral system** - Referral fraud

#### Implementation:

```typescript
// Payment fraud check
const guardian = Guardian.getInstance();
const paymentCheck = await guardian.checkPaymentFraud(userId, {
  amount: priceData.amount,
  currency: "USD",
  email: user.email,
  ip,
});

if (!paymentCheck.safe) {
  return NextResponse.json(
    { error: "Payment blocked: " + paymentCheck.reason },
    { status: 403 },
  );
}

// Admin action monitoring
await guardian.analyzeUserBehavior(adminUid, "admin_ban_user", {
  targetUid,
  reason,
  ip,
});

// Bulk operation monitoring
const requestCount = await getRecentRequestCount(userId, endpoint);
const isAllowed = await guardian.monitorApiUsage(
  userId,
  endpoint,
  requestCount,
);

if (!isAllowed) {
  return NextResponse.json({ error: "API abuse detected" }, { status: 429 });
}
```

---

### Task 2.4: Add Comprehensive Input Validation (Days 9-10)

**Priority:** HIGH  
**Effort:** 8 hours  
**Risk if not fixed:** XSS, injection, data corruption

#### Create Schemas for All Endpoints:

```typescript
// lib/validators/api-schemas.ts
import { z } from "zod";

// Activity
export const activityRequestSchema = z.object({
  type: z.enum(["signup", "upgrade", "referral", "milestone"]),
  details: z.record(z.any()).optional(),
});

// Referrals
export const referralCreateSchema = z.object({
  referrerUid: z.string().uuid(),
});

export const referralLookupSchema = z.object({
  code: z.string().min(1).max(50),
});

// Email
export const emailSequenceSchema = z.object({
  recipientEmail: z.string().email(),
  sequenceType: z.enum(["welcome", "upgrade", "retention"]),
  customization: z.record(z.string()).optional(),
});

// Verification
export const verificationRequestSchema = z.object({
  email: z.string().email(),
});

// AI requests
export const aiGenerationSchema = z.object({
  prompt: z.string().min(10).max(2000),
  type: z.enum(["text", "image", "video"]),
  options: z.record(z.any()).optional(),
});
```

#### Apply Validation:

```typescript
import { z } from "zod";
import { emailSequenceSchema } from "@/lib/validators/api-schemas";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const validation = emailSequenceSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        details: validation.error.issues.map((i) => i.message),
      },
      { status: 400 },
    );
  }

  const { recipientEmail, sequenceType, customization } = validation.data;

  // Safe to use validated data
  // ...
}
```

---

### Task 2.5: Implement CORS Configuration (Day 11)

**Priority:** HIGH  
**Effort:** 2 hours  
**Risk if not fixed:** CSRF attacks, unauthorized API access

#### Create Middleware:

```typescript
// middleware.ts (root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const pathname = request.pathname;

  // Allow requests from same origin
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL!,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  // API routes need CORS
  if (pathname.startsWith("/api/")) {
    // Block requests from unknown origins
    if (origin && !allowedOrigins.includes(origin)) {
      console.warn(`Blocked request from origin: ${origin}`);
      return NextResponse.json(
        { error: "CORS policy violation" },
        { status: 403 },
      );
    }

    const response = NextResponse.next();

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
    }

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
```

---

## Phase 3: MEDIUM Priority (Weeks 2-3) 🟡

### Task 3.1: Environment Variable Validation

**Priority:** MEDIUM  
**Effort:** 4 hours

```typescript
// lib/env-validator.ts
import { z } from "zod";

const envSchema = z.object({
  // Firebase (required)
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),

  // Stripe (required)
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),

  // Auth (required)
  ADMIN_UID: z.string().min(1),

  // AI (required)
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),

  // Optional
  OPENAI_API_KEY: z.string().optional(),
  RECAPTCHA_SECRET: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  // App config
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    console.log("✅ Environment variables validated successfully");
    return parsed;
  } catch (error) {
    console.error("❌ Environment validation failed:");
    if (error instanceof z.ZodError) {
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
    }
    process.exit(1);
  }
}

// Call at startup
if (typeof window === "undefined") {
  validateEnv();
}
```

---

### Task 3.2: Improve Firebase Admin Error Handling

**Priority:** MEDIUM  
**Effort:** 2 hours

```typescript
// lib/firebase-admin.ts
export function getAdminDb(): Firestore {
  initializeAdmin();
  if (!admin.apps.length) {
    throw new Error(
      "Firebase Admin not initialized. Check FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.",
    );
  }
  return admin.firestore();
}

export function getAdminAuth(): Auth {
  initializeAdmin();
  if (!admin.apps.length) {
    throw new Error("Firebase Admin not initialized");
  }
  return admin.auth();
}

// With error handling in routes:
try {
  const db = getAdminDb();
  // ... use db
} catch (error) {
  captureError(error);
  return NextResponse.json(
    { error: "Service temporarily unavailable" },
    { status: 503 },
  );
}
```

---

### Task 3.3: Add Request ID Tracking

**Priority:** MEDIUM  
**Effort:** 3 hours

```typescript
// middleware.ts
import { v4 as uuidv4 } from "uuid";

export function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || uuidv4();
  const response = NextResponse.next();
  response.headers.set("X-Request-ID", requestId);

  // Log request
  console.log(`[${requestId}] ${request.method} ${request.url}`);

  return response;
}
```

---

### Task 3.4: Add Security Headers

**Priority:** MEDIUM  
**Effort:** 2 hours

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Phase 4: LOW Priority (Weeks 4-6) 🟢

### Task 4.1: Add security.txt

**Priority:** LOW  
**Effort:** 30 minutes

```
# public/.well-known/security.txt
Contact: mailto:security@litlabs.ai
Expires: 2026-12-31T23:59:59.000Z
Encryption: https://litlabs.ai/pgp-key.txt
Preferred-Languages: en
Canonical: https://litlabs.ai/.well-known/security.txt
Policy: https://litlabs.ai/security-policy
Acknowledgments: https://litlabs.ai/security-hall-of-fame
```

---

### Task 4.2: Set Up Automated Dependency Audits

**Priority:** LOW  
**Effort:** 1 hour

```yaml
# .github/workflows/security-audit.yml
name: Security Audit
on:
  schedule:
    - cron: "0 0 * * 0" # Weekly
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm audit
      - run: npm audit fix
      - name: Check for vulnerabilities
        run: |
          if npm audit --audit-level=high; then
            echo "No high-severity vulnerabilities"
          else
            echo "High-severity vulnerabilities found!"
            exit 1
          fi
```

---

### Task 4.3: Add Redis for Distributed Rate Limiting

**Priority:** LOW  
**Effort:** 4 hours

```typescript
// lib/rateLimiter.ts (enhanced)
import Redis from "ioredis";

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

export async function checkRateLimit(
  key: string,
): Promise<{ ok: boolean; retryAfter?: number; remaining?: number }> {
  if (redis) {
    return await redisRateLimit(key);
  }
  return await inMemoryRateLimit(key);
}

async function redisRateLimit(key: string) {
  const now = Date.now();
  const window = WINDOW_MS;
  const limit = MAX_PER_WINDOW;

  // Use Redis sorted set for sliding window
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, now - window);
  pipeline.zadd(key, now, now);
  pipeline.zcard(key);
  pipeline.expire(key, Math.ceil(window / 1000));

  const results = await pipeline.exec();
  const count = results?.[2]?.[1] as number;

  if (count > limit) {
    const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
    const retryAfter = Math.ceil((parseInt(oldest[1]) + window - now) / 1000);
    return { ok: false, retryAfter };
  }

  return { ok: true, remaining: limit - count };
}
```

---

## Testing Plan

### Phase 1 Testing (After Critical Fixes)

```bash
# Test Suite 1: Authentication
npm run test:auth

# Test Suite 2: Payment Security
npm run test:payments

# Test Suite 3: Admin Access
npm run test:admin

# Manual Penetration Testing
- Attempt unauthorized payment creation
- Try to access admin endpoints without auth
- Test webhook signature bypasses
```

### Phase 2 Testing (After High Priority)

```bash
# Test Suite 4: Rate Limiting
npm run test:rate-limiting

# Test Suite 5: Input Validation
npm run test:validation

# Test Suite 6: CORS
npm run test:cors
```

---

## Deployment Strategy

### Pre-Deployment Checklist

- [ ] All critical fixes tested locally
- [ ] All high-priority fixes tested in staging
- [ ] Security audit re-run
- [ ] Dependency audit clean
- [ ] Environment variables validated
- [ ] Backup database
- [ ] Rollback plan ready

### Deployment Steps

1. **Deploy to Staging**
   - Run full test suite
   - Manual security testing
   - Performance testing

2. **Deploy to Production**
   - Deploy during low-traffic period
   - Monitor error rates
   - Monitor Guardian bot alerts
   - Check webhook delivery

3. **Post-Deployment**
   - Verify all endpoints responding
   - Check authentication working
   - Verify payments processing
   - Monitor for 24 hours

---

## Success Metrics

### Security KPIs

- ✅ Zero unauthenticated access to protected endpoints
- ✅ Zero failed webhook signature verifications
- ✅ 100% of API routes have rate limiting
- ✅ 100% of user input validated
- ✅ Guardian bot covering 100% of sensitive operations
- ✅ No critical or high vulnerabilities in npm audit

### Performance KPIs

- ✅ API response time < 500ms (p95)
- ✅ Rate limiting overhead < 10ms
- ✅ Auth check overhead < 50ms
- ✅ Guardian analysis < 200ms

---

## Emergency Contacts

- **Security Lead:** TBD
- **DevOps:** TBD
- **On-Call Engineer:** TBD

---

## Revision History

- **v1.0** - December 5, 2025 - Initial security action plan created

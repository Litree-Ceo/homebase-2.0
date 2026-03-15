# 💳 Payment System Setup & Testing Guide

## Overview

Your LitreeLabs payment system is now complete with:

- ✅ Stripe test mode payments
- ✅ Subscription management
- ✅ Automatic tax calculation
- ✅ Invoice & receipt handling
- ✅ Webhook support for real-time updates

---

## 🔧 Setup Instructions

### Step 1: Configure Firebase Cloud Functions

1. **Set Environment Variables in Firebase**

```bash
cd functions
firebase functions:config:set stripe.secret_key="sk_test_YOUR_KEY" stripe.webhook_secret="whsec_YOUR_SECRET"
```

Or set via Firebase Console:

- Go to: **Firebase Console → Your Project → Functions → Runtime Settings → Environment Variables**
- Add:
  - `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
  - `STRIPE_WEBHOOK_SECRET`: Your webhook signing secret (starts with `whsec_`)

2. **Get Your Stripe Keys**

From https://dashboard.stripe.com/apikeys:

- **Publishable Key** (already in `public/stripe-config.js`): `pk_test_51SYJoR3GB9IAma1QpReN5N3dcif52iRRmLMLWVyW7RmI7nJyWjZwZaSdN3hJZmmezEpv1lumZroUm319itZKwHdw00FTM06UOt`
- **Secret Key**: Copy from Restricted API keys section
- **Webhook Secret**: From https://dashboard.stripe.com/webhooks → Click your endpoint → Signing secret

3. **Configure Stripe Webhook**

```bash
# Option A: Use Stripe CLI (Recommended for local testing)
stripe listen --forward-to localhost:5001/studio-6082148059-d1fec/us-central1/stripeWebhook

# Option B: Add webhook via Stripe Dashboard
# Go to https://dashboard.stripe.com/webhooks
# - Endpoint URL: https://us-central1-studio-6082148059-d1fec.cloudfunctions.net/stripeWebhook
# - Events: payment_intent.*, invoice.*, customer.subscription.*
```

### Step 2: Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

### Step 3: Verify Deployment

Check Firebase Console → Functions to ensure all functions are deployed:

- ✅ `createPaymentIntent`
- ✅ `createSubscription`
- ✅ `cancelSubscription`
- ✅ `calculateTax`
- ✅ `getInvoiceWithTax`
- ✅ `listInvoices`
- ✅ `createBillingPortalSession`
- ✅ `createCheckoutSession`
- ✅ `getPaymentMethods`
- ✅ `updatePaymentMethod`
- ✅ `verifyPayment`
- ✅ `resendReceipt`
- ✅ `stripeWebhook`

---

## 🧪 Testing Payment Flows

### Test Mode Cards

Use these Stripe test cards for different scenarios:

| Card Number           | Scenario           |
| --------------------- | ------------------ |
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 3220` | Declined payment   |
| `4000 0025 0000 3155` | 3D Secure required |
| `3782 822463 10005`   | American Express   |

**For all test cards:** Any future expiry date, any 3-digit CVC

### Test 1: Payment Intent (One-Time Payment)

1. **From frontend:**

```javascript
// Open DevTools console on dashboard-premium.html
const handler = await initializeStripePaymentHandler(
  "pk_test_51SYJoR3GB9IAma1QpReN5N3dcif52iRRmLMLWVyW7RmI7nJyWjZwZaSdN3hJZmmezEpv1lumZroUm319itZKwHdw00FTM06UOt",
);
handler.createElements({ amount: 9999, currency: "usd" });
handler.mountAddressElement();
handler.mountPaymentElement();
```

2. **Or use cURL:**

```bash
curl -X POST http://localhost:5001/studio-6082148059-d1fec/us-central1/createPaymentIntent \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9999,
    "currency": "usd",
    "description": "Test Payment"
  }'
```

### Test 2: Subscription Creation

```javascript
// After creating payment intent:
const subResult = await handler.createSubscription(
  "price_1SZ8oA3GB9IAma1QH4VNnccv",
  {
    paymentMethod: "auto",
    metadata: { plan: "pro" },
  },
);
```

**Expected Response:**

```json
{
  "subscriptionId": "sub_...",
  "status": "incomplete_expired",
  "clientSecret": "seti_...",
  "invoiceId": "in_..."
}
```

### Test 3: Tax Calculation

```javascript
const taxResult = await handler.calculateTax({
  line1: "123 Main St",
  city: "San Francisco",
  state: "CA",
  postal_code: "94105",
  country: "US",
});

console.log(taxResult);
// {
//   tax: 725,           // $7.25 (8.25% of $99)
//   total: 10724,       // $107.24
//   taxRate: 0.0725,
//   jurisdiction: "CA"
// }
```

### Test 4: Invoice Retrieval

```javascript
// Get your subscription from Firestore first
const invoices = await getStripePaymentHandler().getInvoiceWithTax({
  invoiceId: "in_YOUR_INVOICE_ID",
});

console.log(invoices);
```

### Test 5: Billing Portal

```javascript
await handler.manageStripeSubscription();
// Opens Stripe Billing Portal in new window
// Users can manage cards, invoices, cancel subscription
```

---

## 📊 Receipts & Invoice Storage

### Where Receipts Go (Architecture)

```
Stripe (Source of Truth)
├── Invoices stored permanently
├── Receipt PDFs accessible via invoice_pdf URL
└── Automatic emails sent to customer

↓ Webhook Sync

Firebase Firestore (Local Cache)
├── Collection: /receipts/{invoiceId}
│   └── amount, currency, status, pdfUrl, paidAt
├── Collection: /invoices/{invoiceId}
│   └── Same data + userId, customerId
└── Collection: /users/{userId}/receipts/{invoiceId}
    └── User-specific receipt copies

Firebase Cloud Storage (Optional PDFs)
├── /receipts/{userId}/{invoiceId}.pdf
└── /receipts/{userId}/{receiptNumber}.pdf
```

### Accessing Receipts

#### For Users (From Frontend):

```javascript
// List all invoices
const invoices = await getStripePaymentHandler().getInvoiceWithTax({
  userId: currentUserId,
});

// Single invoice with receipt link
const receipt = await getStripePaymentHandler().getInvoiceWithTax({
  invoiceId: "in_...",
});

// Download receipt
window.open(receipt.pdfUrl, "_blank");

// Resend receipt email
await httpsCallable(
  functions,
  "resendReceipt",
)({
  invoiceId: "in_...",
});
```

#### For Admins (Backend):

```javascript
// Get all receipts for user
const receipts = db
  .collection("users")
  .doc(userId)
  .collection("receipts")
  .orderBy("paidAt", "desc")
  .get();

// Search invoices by status
const paidInvoices = db
  .collection("invoices")
  .where("userId", "==", userId)
  .where("status", "==", "paid")
  .get();
```

---

## 🔐 Security Checklist

- [x] Stripe secret key stored in Firebase environment variables (not in code)
- [x] Webhook secret stored securely (not in code)
- [x] Public key safe to expose (test key in code is fine)
- [x] All payment operations require authentication (`context.auth` checked)
- [x] Firestore rules should restrict receipt access to owning user
- [x] Webhook endpoint validates signature

### Firestore Security Rules (Add to Firebase Console):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read their own receipts
    match /users/{userId}/receipts/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }

    // Allow reading own invoices
    match /invoices/{document=**} {
      allow read: if resource.data.userId == request.auth.uid;
    }

    // Allow reading own subscriptions
    match /subscriptions/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 Production Checklist

### Before Going Live:

1. **Switch to Live Keys**
   - Update `STRIPE_SECRET_KEY` with `sk_live_...`
   - Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
   - Update public key in `stripe-config.js` to `pk_live_...`

2. **Update Prices**

   ```javascript
   // In stripe-config.js, update to live price IDs
   priceIds: {
     pro: 'price_1SZ8oA3GB9IAma1QH4VNnccv',      // Update with live ID
     enterprise: 'price_1SbNvG3GB9IAma1QXWglHWoa' // Update with live ID
   }
   ```

3. **Webhook Configuration**
   - Update webhook URL to production domain
   - Test webhook delivery in Stripe Dashboard
   - Monitor logs for failed webhooks

4. **Email Notifications**
   - Test receipt emails from Stripe
   - Customize email templates in Stripe Dashboard
   - Verify from address and branding

5. **Deployment**
   ```bash
   firebase deploy
   firebase deploy --only functions
   ```

---

## 📝 API Reference

### `createPaymentIntent(data)`

Creates a one-time payment intent.

**Request:**

```json
{
  "amount": 9999, // cents (required)
  "currency": "usd", // optional
  "description": "Monthly subscription",
  "metadata": {} // optional custom data
}
```

**Response:**

```json
{
  "clientSecret": "pi_...",
  "intentId": "pi_...",
  "status": "requires_payment_method"
}
```

---

### `createSubscription(data)`

Creates a recurring subscription.

**Request:**

```json
{
  "priceId": "price_...", // required
  "paymentMethod": "auto", // optional
  "metadata": {} // optional
}
```

**Response:**

```json
{
  "subscriptionId": "sub_...",
  "status": "incomplete_expired",
  "clientSecret": "seti_...",
  "invoiceId": "in_..."
}
```

---

### `calculateTax(data)`

Calculates tax based on address.

**Request:**

```json
{
  "address": {
    "line1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94105",
    "country": "US"
  },
  "amount": 9999,
  "currency": "usd"
}
```

**Response:**

```json
{
  "tax": 725, // cents
  "total": 10724, // cents
  "taxRate": 0.0725,
  "jurisdiction": "CA"
}
```

---

### `listInvoices()`

Lists all invoices for the current user.

**Response:**

```json
{
  "invoices": [
    {
      "invoiceId": "in_...",
      "number": "0001",
      "amount": 9999,
      "currency": "usd",
      "status": "paid",
      "paidAt": "2024-12-08T10:30:00Z",
      "pdfUrl": "https://invoice.stripe.com/i/...",
      "createdAt": "2024-12-08T10:00:00Z"
    }
  ]
}
```

---

### `getInvoiceWithTax(data)`

Retrieves a specific invoice with tax details.

**Request:**

```json
{
  "invoiceId": "in_..." // required
}
```

**Response:**

```json
{
  "invoiceId": "in_...",
  "number": "0001",
  "amount": 9999,
  "currency": "usd",
  "status": "paid",
  "paidAt": "2024-12-08T10:30:00Z",
  "periodStart": "2024-12-01T00:00:00Z",
  "periodEnd": "2025-01-01T00:00:00Z",
  "items": [
    {
      "description": "Pro Plan - Monthly",
      "amount": 9999,
      "quantity": 1,
      "unitAmount": 9999
    }
  ],
  "tax": 825,
  "subtotal": 9999,
  "total": 10824,
  "pdfUrl": "https://invoice.stripe.com/i/...",
  "receiptUrl": "https://..."
}
```

---

### `createBillingPortalSession()`

Creates a Stripe Billing Portal session for users to manage subscriptions.

**Response:**

```json
{
  "url": "https://billing.stripe.com/..."
}
```

Open this URL to let users:

- View invoices
- Download receipts
- Update payment method
- Cancel subscription

---

## 🆘 Troubleshooting

### Issue: Functions not working

**Solution:**

1. Check Firebase Console → Functions → Logs
2. Verify environment variables are set: `firebase functions:config:get`
3. Check for TypeScript/syntax errors: `npm run build` in functions/
4. Redeploy: `firebase deploy --only functions`

### Issue: Payments failing

**Solution:**

1. Check Stripe Dashboard → Logs → API calls
2. Verify public key matches secret key environment
3. Check browser console for errors
4. Test card might not be in test mode

### Issue: Webhooks not firing

**Solution:**

1. Verify webhook endpoint URL in Stripe Dashboard
2. Check webhook signing secret is correct
3. Monitor webhook delivery in Stripe Dashboard → Webhooks
4. Test webhook manually in Stripe Dashboard → Events

### Issue: Tax not calculating

**Solution:**

1. Verify address is complete (state/country required)
2. Check if country is supported by Stripe Tax
3. Fall back to simple state tax rates if Tax API fails
4. Test with common addresses first (CA, TX, NY)

### Issue: Receipts not saving

**Solution:**

1. Check Firestore rules allow write access
2. Verify webhook is being received
3. Check Cloud Functions logs for errors
4. Ensure userId is being set correctly in metadata

---

## 📞 Support

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Firebase Functions**: https://firebase.google.com/docs/functions
- **Firestore**: https://firebase.google.com/docs/firestore
- **Your Project**: https://studio-6082148059-d1fec.web.app

---

**Status**: ✅ Ready for testing and production deployment

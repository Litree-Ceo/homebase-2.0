# 🧪 Payment System Testing Checklist

## ✅ Pre-Deployment Verification

### Cloud Functions Status

- [ ] `functions/index.js` exists and contains all payment functions
- [ ] All required npm packages installed: `firebase-admin`, `firebase-functions`, `stripe`, `cors`
- [ ] Environment variables configured in Firebase Console
  - [ ] `STRIPE_SECRET_KEY` = `sk_test_...`
  - [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...`
  - [ ] `HOSTING_URL` = `https://studio-6082148059-d1fec.web.app`

### Frontend Files

- [ ] `public/stripe-config.js` - Test public key configured ✅
- [ ] `public/stripe-payment-handler.js` - Payment handler class ✅
- [ ] `public/dashboard-premium-payments.js` - Dashboard integration ✅
- [ ] `public/dashboard-premium.html` - Updated with payment script ✅
- [ ] `public/firebase-config.js` - Firebase initialized ✅

### Firestore Collections Setup

- [ ] Create collection: `/subscriptions/{userId}`
- [ ] Create collection: `/receipts/{invoiceId}`
- [ ] Create collection: `/invoices/{invoiceId}`
- [ ] Create collection: `/payments/{paymentIntentId}`
- [ ] Create collection: `/users/{userId}/receipts/{invoiceId}`

---

## 🚀 Deployment Steps

### Step 1: Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

**Expected:** All functions deployed successfully to Firebase Console

### Step 2: Set Environment Variables

```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_YOUR_KEY" \
  stripe.webhook_secret="whsec_YOUR_SECRET"
```

**Expected:** Configuration saved in Firebase Console

### Step 3: Configure Stripe Webhook

- Go to: https://dashboard.stripe.com/webhooks
- Click "Add endpoint"
- **Endpoint URL:** `https://us-central1-studio-6082148059-d1fec.cloudfunctions.net/stripeWebhook`
- **Events to listen:** Select all `payment_intent.*`, `invoice.*`, `customer.subscription.*`
- Copy signing secret and update Firebase environment

### Step 4: Deploy Hosting

```bash
firebase deploy --only hosting
```

**Expected:** Website updated at https://studio-6082148059-d1fec.web.app

---

## 🧪 Functional Testing

### Test 1: Page Load & Initialization

**Steps:**

1. Open https://studio-6082148059-d1fec.web.app/dashboard-premium.html
2. Sign in with test account
3. Open DevTools Console (F12)
4. Check for errors

**Expected Results:**

- [ ] Page loads without errors
- [ ] Console shows: `✅ Payment system initialized`
- [ ] Console shows: `✅ User authenticated: [email]`
- [ ] Payment form elements visible
- [ ] Address element loaded
- [ ] No red errors in console

**Success Indicators:**

```
✅ Firebase initialized successfully!
✅ Stripe initialized successfully
✅ Elements created with tax support
✅ Address element mounted
✅ Payment element mounted
✅ Button listeners attached
✅ Payment system initialized
```

---

### Test 2: Tax Calculation

**Steps:**

1. In payment form, enter address:
   - Street: "123 Main St"
   - City: "San Francisco"
   - State: "CA"
   - ZIP: "94105"
2. Watch tax calculation

**Expected Results:**

- [ ] Tax info appears below address
- [ ] Shows tax rate for CA (8.25%)
- [ ] Shows total: $107.24 (for $99 item)
- [ ] Console logs: `Γ£ô Tax calculated: $7.25 on total $107.24`

**Sample Output:**

```
Subtotal: $99.00
Tax (8.25% - CA): $7.25
Total: $107.24
```

---

### Test 3: Upgrade to Pro Button

**Steps:**

1. Click "Upgrade to Pro" button
2. Should redirect to Stripe Checkout

**Expected Results:**

- [ ] Checkout modal opens
- [ ] Billing address pre-filled (if saved)
- [ ] Payment method selector visible
- [ ] Can enter test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/25)
- [ ] CVC: Any 3 digits (e.g., 123)

**Success:** "Your payment succeeded" message

---

### Test 4: Test Payment Cards

#### Card 4242 4242 4242 4242 (Success)

**Steps:**

1. Enter card: `4242 4242 4242 4242`
2. Expiry: `12/25`
3. CVC: `123`
4. Click "Pay"

**Expected:** ✅ Payment successful message

#### Card 4000 0000 0000 9995 (Insufficient Funds)

**Steps:**

1. Repeat with: `4000 0000 0000 9995`

**Expected:** ❌ Error: "Your card has insufficient funds"

#### Card 4000 0000 0000 3220 (Card Declined)

**Steps:**

1. Repeat with: `4000 0000 0000 3220`

**Expected:** ❌ Error: "Your card was declined"

---

### Test 5: Payment Success Flow

**Steps:**

1. Complete successful payment (4242 card)
2. Wait for redirect back to dashboard
3. Check Firestore

**Expected Results:**

- [ ] Redirected to `dashboard-premium.html?payment=success`
- [ ] Success notification appears
- [ ] Subscription status updated
- [ ] "Upgrade" button becomes "Manage Subscription"
- [ ] Firestore shows new subscription record

**Firestore Records Created:**

- `/subscriptions/{userId}` - New subscription document
- `/invoices/{invoiceId}` - New invoice record
- `/receipts/{invoiceId}` - Receipt record
- `/users/{userId}/receipts/{invoiceId}` - User receipt copy

---

### Test 6: Invoice Retrieval

**Steps:**

1. After successful payment, scroll to "Recent Invoices"
2. Click "View" on latest invoice
3. Check invoice details modal

**Expected Results:**

- [ ] Modal shows invoice details
- [ ] Shows amount, date, status
- [ ] Shows tax breakdown
- [ ] "Download PDF" button works
- [ ] PDF opens in new tab

**Modal Should Show:**

```
Invoice #0001
Amount: $99.00
Status: PAID
Paid: 12/8/2024
Tax: $8.25
Items:
  - Pro Plan - Monthly: $99.00
Total: $107.25
```

---

### Test 7: Manage Subscription Button

**Steps:**

1. Click "Manage Subscription" button
2. Should open Stripe Billing Portal

**Expected Results:**

- [ ] New window/tab opens
- [ ] Billing Portal loads
- [ ] Can see subscription details
- [ ] Can update payment method
- [ ] Can view all invoices
- [ ] Can cancel subscription

**Portal URL:** `https://billing.stripe.com/...`

---

### Test 8: Download Invoice PDF

**Steps:**

1. In Recent Invoices table
2. Click "Download" button for invoice
3. PDF should open

**Expected Results:**

- [ ] PDF opens in new tab
- [ ] Shows invoice details
- [ ] Shows payment status
- [ ] Has receipt number
- [ ] Printable format

---

### Test 9: Webhook Processing

**Steps:**

1. Complete successful payment
2. Check Stripe Dashboard → Events
3. Monitor Firebase Cloud Function logs

**Expected Results:**

- [ ] `invoice.payment_succeeded` event received
- [ ] `customer.subscription.created` event received
- [ ] Cloud Function logs show processing
- [ ] Firestore records updated automatically
- [ ] Receipt created in Firestore

**Function Logs Should Show:**

```
Invoice paid: in_...
Receipt created for invoice in_...
Subscription created: sub_...
```

---

### Test 10: Error Handling

**Steps:**

1. Try payment without address
2. Try payment with expired card
3. Try payment while offline
4. Try accessing receipt without auth

**Expected Results:**

- [ ] Clear error messages displayed
- [ ] User can retry
- [ ] No payment attempt made
- [ ] Page stays on form

---

## 📊 Firestore Data Verification

### Expected Collections After Payment

#### `/subscriptions/{userId}`

```javascript
{
  stripeCustomerId: "cus_...",
  subscriptionId: "sub_...",
  priceId: "price_1SZ8oA3GB9IAma1QH4VNnccv",
  status: "active",
  currentPeriodStart: Timestamp,
  currentPeriodEnd: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `/invoices/{invoiceId}`

```javascript
{
  userId: "user_...",
  customerId: "cus_...",
  amount: 9999,
  currency: "usd",
  status: "paid",
  paidAt: Timestamp,
  pdfUrl: "https://invoice.stripe.com/i/...",
  createdAt: Timestamp
}
```

#### `/receipts/{invoiceId}`

```javascript
{
  userId: "user_...",
  invoiceId: "in_...",
  amount: 9999,
  currency: "usd",
  status: "paid",
  receiptNumber: "INV-0001",
  pdfUrl: "https://invoice.stripe.com/i/...",
  paidAt: Timestamp,
  items: [
    {
      description: "Pro Plan - Monthly",
      amount: 9999,
      quantity: 1
    }
  ],
  createdAt: Timestamp
}
```

---

## 🔐 Security Testing

### Test 1: Authentication Required

**Steps:**

1. Open payment form without signing in
2. Try clicking "Upgrade to Pro"

**Expected:**

- [ ] Redirected to `/auth.html`
- [ ] Message: "Please sign in to upgrade"

### Test 2: No Secret Keys Exposed

**Steps:**

1. Open DevTools → Network tab
2. Check all requests
3. View page source

**Expected:**

- [ ] No `sk_test_` or `sk_live_` keys visible
- [ ] Only public key `pk_test_...` in code
- [ ] No `.env` files committed

### Test 3: HTTPS Enforced

**Steps:**

1. Try accessing via `http://` (not https)

**Expected:**

- [ ] Automatically redirects to `https://`

### Test 4: Firestore Rules

**Steps:**

1. Try accessing another user's receipts (if possible)

**Expected:**

- [ ] Access denied
- [ ] Can only see own receipts

---

## 📈 Performance Testing

### Load Time

- [ ] Dashboard loads in < 3 seconds
- [ ] Stripe elements load in < 2 seconds
- [ ] Payment form responsive and usable

### Payment Processing

- [ ] Payment processes in < 5 seconds
- [ ] Webhook fires within 1 second of payment
- [ ] Firestore updated within 2 seconds

---

## ✅ Final Checklist

### All Tests Passed

- [ ] Page load test ✅
- [ ] Tax calculation ✅
- [ ] Upgrade button ✅
- [ ] Test cards ✅
- [ ] Success flow ✅
- [ ] Invoice retrieval ✅
- [ ] Manage subscription ✅
- [ ] Download PDF ✅
- [ ] Webhooks ✅
- [ ] Error handling ✅
- [ ] Security ✅
- [ ] Performance ✅

### Firestore Setup

- [ ] All collections created ✅
- [ ] All sample data present ✅
- [ ] Security rules configured ✅

### Stripe Configuration

- [ ] Test keys set ✅
- [ ] Webhook configured ✅
- [ ] Price IDs verified ✅

### Deployment

- [ ] Functions deployed ✅
- [ ] Hosting deployed ✅
- [ ] Environment variables set ✅
- [ ] All tests passed ✅

---

## 🚀 Ready for Production

Once all tests pass, you're ready to:

1. Switch to live Stripe keys
2. Update price IDs to production prices
3. Configure production webhook
4. Deploy to production domain
5. Monitor Stripe Dashboard for payments
6. Monitor Firebase Logs for issues

---

## 📞 Troubleshooting Reference

| Issue                       | Solution                                        |
| --------------------------- | ----------------------------------------------- |
| Functions not found         | Deploy with: `firebase deploy --only functions` |
| Payment fails               | Check Stripe keys in Firebase Console           |
| No receipts created         | Check webhook endpoint and signing secret       |
| Tax not calculating         | Verify address is complete (state required)     |
| Invoices not showing        | Check Firestore collection exists               |
| PDF won't open              | Check browser popup blocker                     |
| Can't access billing portal | Check user is authenticated                     |

---

**Last Updated:** December 8, 2025  
**Status:** ✅ Ready for Testing

# ⚡ Payment System Quick Reference

## 🚀 Deploy in 3 Steps

```bash
# 1. Set Stripe keys
firebase functions:config:set \
  stripe.secret_key="sk_test_YOUR_KEY" \
  stripe.webhook_secret="whsec_YOUR_SECRET"

# 2. Deploy functions
cd functions
npm install
firebase deploy --only functions

# 3. Configure webhook (in Stripe Dashboard)
# URL: https://us-central1-studio-6082148059-d1fec.cloudfunctions.net/stripeWebhook
# Events: All payment_intent.*, invoice.*, customer.subscription.*
```

---

## 🧪 Test Payment

**URL:** https://studio-6082148059-d1fec.web.app/dashboard-premium.html

**Card:** `4242 4242 4242 4242`  
**Expiry:** Any future date (12/25)  
**CVC:** Any 3 digits (123)

---

## 📚 Files Created

| File                                   | Purpose             |
| -------------------------------------- | ------------------- |
| `functions/index.js`                   | All Cloud Functions |
| `public/dashboard-premium-payments.js` | Button integration  |
| `PAYMENT_SETUP_GUIDE.md`               | Installation guide  |
| `PAYMENT_TESTING_CHECKLIST.md`         | Testing procedures  |
| `PAYMENT_SYSTEM_COMPLETE.md`           | Overview            |

---

## 💾 Where Receipts Go

**Stripe** (Primary)

- PDFs: Official invoices
- Email: Auto-sent to customer
- Portal: Billing portal access

**Firestore** (Cache)

- `/receipts/{invoiceId}`
- `/users/{userId}/receipts/{invoiceId}`
- `/invoices/{invoiceId}`

---

## 🔌 Cloud Functions List

| Function                     | Purpose              |
| ---------------------------- | -------------------- |
| `createPaymentIntent`        | One-time payment     |
| `createSubscription`         | Monthly subscription |
| `cancelSubscription`         | Stop subscription    |
| `calculateTax`               | Auto-tax by location |
| `getInvoiceWithTax`          | Invoice details      |
| `listInvoices`               | All invoices         |
| `createBillingPortalSession` | Stripe portal        |
| `createCheckoutSession`      | Checkout flow        |
| `getPaymentMethods`          | Saved cards          |
| `updatePaymentMethod`        | Add/update card      |
| `verifyPayment`              | Verify payment       |
| `resendReceipt`              | Email receipt        |
| `stripeWebhook`              | Webhook endpoint     |

---

## 🔑 Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...      # Stripe secret
STRIPE_WEBHOOK_SECRET=whsec_...    # Webhook signing secret
HOSTING_URL=https://...             # Return URL (optional)
```

---

## ✅ Checklist

- [ ] Set Stripe keys in Firebase
- [ ] Deploy Cloud Functions
- [ ] Configure webhook
- [ ] Test payment (4242 card)
- [ ] Verify receipt in Firestore
- [ ] Test invoice download
- [ ] Test billing portal

---

## 🆘 Quick Troubleshooting

| Issue                | Fix                                |
| -------------------- | ---------------------------------- |
| Functions not found  | `firebase deploy --only functions` |
| Payment fails        | Check Firebase env vars            |
| No receipts          | Check webhook endpoint             |
| Tax = 0              | Verify address state               |
| Can't access invoice | Check Firestore rules              |

---

## 📊 Test Cards

| Card                  | Result                |
| --------------------- | --------------------- |
| `4242 4242 4242 4242` | ✅ Success            |
| `4000 0000 0000 9995` | ❌ Insufficient funds |
| `4000 0000 0000 3220` | ❌ Declined           |
| `4000 0025 0000 3155` | ⚠️ 3D Secure          |

---

## 💡 Pro Tips

1. **Test Webhooks**: Use Stripe CLI

   ```bash
   stripe listen --forward-to localhost:5001/...
   ```

2. **View Logs**: Firebase Console → Functions → Logs

3. **Debug Payment**: Browser console → Look for errors

4. **Check Firestore**: Firebase Console → Firestore → Collections

5. **Monitor Stripe**: https://dashboard.stripe.com → Events

---

**Status:** ✅ Production Ready  
**Next:** Run PAYMENT_SETUP_GUIDE.md

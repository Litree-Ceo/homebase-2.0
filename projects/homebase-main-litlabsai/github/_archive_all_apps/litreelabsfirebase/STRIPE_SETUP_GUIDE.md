# Stripe Products Configuration Guide

## Current Status
✅ Environment variables configured
✅ Webhook secret ready
✅ Test mode keys active
⚠️ Need to create products in Stripe Dashboard

## Step 1: Create Products in Stripe Dashboard

### Access Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/products
2. Make sure you're in **TEST MODE** (toggle in top right)

### Create Each Product

#### Product 1: Starter Plan
```
Name: Starter Plan
Description: Perfect for getting started with AI content creation
Price: $19.00 USD / month
Billing period: Monthly
Price ID: Copy this and update NEXT_PUBLIC_STRIPE_PRICE_STARTER
```

#### Product 2: Creator Plan
```
Name: Creator Plan
Description: Advanced features for growing creators
Price: $39.00 USD / month
Billing period: Monthly
Price ID: Copy this and update NEXT_PUBLIC_STRIPE_PRICE_CREATOR
```

#### Product 3: Pro Plan
```
Name: Pro Plan
Description: Unlimited AI generations with priority support
Price: $79.00 USD / month
Billing period: Monthly
Trial period: 14 days
Price ID: Copy this and update NEXT_PUBLIC_STRIPE_PRICE_PRO
```

#### Product 4: Agency Plan
```
Name: Agency Plan
Description: White-label solution for agencies
Price: $199.00 USD / month
Billing period: Monthly
Price ID: Copy this and update NEXT_PUBLIC_STRIPE_PRICE_AGENCY
```

#### Product 5: Enterprise Plan
```
Name: Enterprise Plan
Description: Custom integrations with dedicated support
Price: $499.00 USD / month
Billing period: Monthly
Price ID: Copy this and update NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE
```

## Step 2: Update Environment Variables

After creating each product, copy the price IDs and update .env.local:

```bash
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_CREATOR=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_AGENCY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
```

## Step 3: Configure Webhook Endpoint

### Local Development (using Stripe CLI)
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET
```

### Production
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - ✅ checkout.session.completed
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed
5. Click "Add endpoint"
6. Copy the "Signing secret" and update STRIPE_WEBHOOK_SECRET in .env.local

## Step 4: Test the Integration

### Test Card Numbers
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Test Flow
1. Start your dev server: `npm run dev`
2. Navigate to: http://localhost:3000/dashboard/billing
3. Click "Upgrade Now" on any tier
4. Use test card: 4242 4242 4242 4242
5. Any future date for expiry
6. Any 3-digit CVC
7. Complete checkout
8. You should be redirected back with success message
9. Check Firebase users collection - your tier should be updated

### Verify Webhook
1. In Stripe Dashboard, go to Webhooks
2. Click on your endpoint
3. Check "Recent deliveries"
4. You should see successful webhook events

## Step 5: Go Live

When ready for production:

1. Switch Stripe to Live Mode
2. Create the same products in Live Mode
3. Update .env.local with live keys:
   - STRIPE_SECRET_KEY=sk_live_...
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
4. Create webhook endpoint for production domain
5. Update STRIPE_WEBHOOK_SECRET with live webhook secret
6. Test with real card (or request test charge)

## Troubleshooting

### Issue: Subscriptions not updating in Firebase
- Check webhook is configured correctly
- Verify STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
- Check webhook logs in Stripe Dashboard
- Check your server logs for errors

### Issue: "No active subscription found"
- User might not have completed checkout
- Check Stripe Dashboard > Customers to verify subscription exists
- Check Firebase user document has stripeSubscriptionId

### Issue: Price IDs not found
- Verify price IDs are correct in .env.local
- Make sure price IDs are from Test Mode if using test keys
- Restart dev server after updating .env.local

## Current Configuration

```
✅ Stripe Test Mode Active
✅ Webhook Secret Configured
✅ 6 Tiers Defined (Free + 5 Paid)
✅ Trial Period: 14 days on Pro tier
✅ Internal Webhook Secret Set
⚠️ Need to create Agency & Enterprise products
```

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Test Stripe CLI locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# View Stripe logs
stripe logs tail

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Test Cards: https://stripe.com/docs/testing
- Stripe CLI: https://stripe.com/docs/stripe-cli
- LitLabs Support: dyingbreed243@gmail.com

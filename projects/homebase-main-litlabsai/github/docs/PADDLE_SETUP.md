# Paddle Integration Guide

## Overview

Paddle is a Merchant-of-Record (MoR) provider. It handles taxes, invoices, and chargebacks,
and pays out to your bank account. This guide focuses on hosted checkout links.

## Step 1: Create a Paddle account

- Sign up at [https://paddle.com](https://paddle.com)
- Complete business verification
- Add your payout bank details

## Step 2: Create products and prices

- Create three prices (Starter, Professional, Enterprise)
- For each price, generate a hosted checkout link
- Save the checkout URL for each tier

## Step 3: Environment configuration

### Next.js app (apps/web)

Set these in `apps/web/.env.local`:

```env
NEXT_PUBLIC_PADDLE_CHECKOUT_URL_STARTER=https://buy.paddle.com/...
NEXT_PUBLIC_PADDLE_CHECKOUT_URL_PROFESSIONAL=https://buy.paddle.com/...
NEXT_PUBLIC_PADDLE_CHECKOUT_URL_ENTERPRISE=https://buy.paddle.com/...
```

### Vite app (app)

Set these in `app/.env`:

```env
VITE_PADDLE_CHECKOUT_URL_STARTER=https://buy.paddle.com/...
VITE_PADDLE_CHECKOUT_URL_PROFESSIONAL=https://buy.paddle.com/...
VITE_PADDLE_CHECKOUT_URL_ENTERPRISE=https://buy.paddle.com/...
```

### Azure Functions (api)

Set these in `api/local.settings.json` (local) or Key Vault (prod):

```env
PADDLE_WEBHOOK_SECRET=your-webhook-secret
PADDLE_ENV=sandbox
```

## Step 4: Configure webhooks

- Add a webhook endpoint in Paddle:
  - `https://your-api.com/api/paddle/webhook`
- Use the same `PADDLE_WEBHOOK_SECRET` in Paddle and Azure Functions.
- The current webhook handler logs events and includes a TODO for signature verification.

## Step 5: Test checkout

1. Start the API and web app:
   - `pnpm -C packages/api start`
   - `pnpm -C apps/web dev`
2. Open the pricing page and click a tier.
3. Use Paddle sandbox test cards and verify the webhook logs.

## Notes

- Paddle is not free; fees apply per transaction.
- Hosted checkout links are the fastest setup and require no backend checkout API.

#!/usr/bin/env node

/**
 * Stripe Product Setup Script
 * Automatically creates products and prices in Stripe
 * Run: node scripts/setup-stripe-products.js
 */

const PRODUCTS = [
  {
    name: 'Starter Plan',
    description: 'Perfect for getting started with AI content creation',
    price: 1900, // $19.00 in cents
    interval: 'month',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_STARTER',
  },
  {
    name: 'Creator Plan',
    description: 'Advanced features for growing creators',
    price: 3900, // $39.00 in cents
    interval: 'month',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_CREATOR',
  },
  {
    name: 'Pro Plan',
    description: 'Unlimited AI generations with priority support',
    price: 7900, // $79.00 in cents
    interval: 'month',
    trialDays: 14,
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_PRO',
  },
  {
    name: 'Agency Plan',
    description: 'White-label solution for agencies',
    price: 19900, // $199.00 in cents
    interval: 'month',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_AGENCY',
  },
  {
    name: 'Enterprise Plan',
    description: 'Custom integrations with dedicated support',
    price: 49900, // $499.00 in cents
    interval: 'month',
    envVar: 'NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE',
  },
];

async function setupStripeProducts() {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY not found in environment variables');
    console.log('Please set STRIPE_SECRET_KEY in your .env.local file');
    process.exit(1);
  }

  console.log('🚀 Starting Stripe product setup...\n');
  console.log(`Using Stripe key: ${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...\n`);

  const results = [];

  for (const productConfig of PRODUCTS) {
    console.log(`📦 Creating product: ${productConfig.name}`);
    
    try {
      // Create product
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
        metadata: {
          tier: productConfig.name.toLowerCase().replace(' plan', ''),
        },
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create price
      const priceConfig = {
        product: product.id,
        unit_amount: productConfig.price,
        currency: 'usd',
        recurring: {
          interval: productConfig.interval,
        },
        metadata: {
          tier: productConfig.name.toLowerCase().replace(' plan', ''),
        },
      };

      if (productConfig.trialDays) {
        priceConfig.recurring.trial_period_days = productConfig.trialDays;
      }

      const price = await stripe.prices.create(priceConfig);

      console.log(`   ✅ Price created: ${price.id}`);
      console.log(`   💵 Price: $${(productConfig.price / 100).toFixed(2)} / ${productConfig.interval}`);
      if (productConfig.trialDays) {
        console.log(`   🎁 Trial period: ${productConfig.trialDays} days`);
      }
      console.log();

      results.push({
        envVar: productConfig.envVar,
        priceId: price.id,
        productName: productConfig.name,
      });
    } catch (error) {
      console.error(`   ❌ Error creating ${productConfig.name}:`, error.message);
      console.log();
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ SETUP COMPLETE!');
  console.log('='.repeat(60) + '\n');

  console.log('Add these to your .env.local file:\n');
  results.forEach(result => {
    console.log(`${result.envVar}=${result.priceId}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('📋 Product Summary:');
  console.log('='.repeat(60) + '\n');
  
  results.forEach(result => {
    console.log(`${result.productName}:`);
    console.log(`  ${result.priceId}`);
    console.log();
  });

  console.log('Next steps:');
  console.log('1. Copy the price IDs above to your .env.local file');
  console.log('2. Restart your development server');
  console.log('3. Visit http://localhost:3000/dashboard/billing');
  console.log('4. Test checkout with card: 4242 4242 4242 4242\n');
}

// Run the setup
setupStripeProducts().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

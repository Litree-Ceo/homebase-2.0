#!/usr/bin/env node

/**
 * Subscription System Configuration Checker
 * Verifies all environment variables and provides setup instructions
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔍 SUBSCRIPTION SYSTEM CONFIGURATION CHECK');
console.log('='.repeat(70) + '\n');

// Check .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Please create .env.local file with your environment variables\n');
  process.exit(1);
}

// Required environment variables
const required = {
  'Stripe Secret Key': 'STRIPE_SECRET_KEY',
  'Stripe Webhook Secret': 'STRIPE_WEBHOOK_SECRET',
  'Stripe Publishable Key': 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'Internal Webhook Secret': 'INTERNAL_WEBHOOK_SECRET',
};

const pricing = {
  'Starter Price ID': 'NEXT_PUBLIC_STRIPE_PRICE_STARTER',
  'Creator Price ID': 'NEXT_PUBLIC_STRIPE_PRICE_CREATOR',
  'Pro Price ID': 'NEXT_PUBLIC_STRIPE_PRICE_PRO',
  'Agency Price ID': 'NEXT_PUBLIC_STRIPE_PRICE_AGENCY',
  'Enterprise Price ID': 'NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE',
};

const optional = {
  'Education Price ID': 'NEXT_PUBLIC_STRIPE_PRICE_EDUCATION',
};

let allGood = true;

// Check required variables
console.log('📋 Required Configuration:');
console.log('-'.repeat(70));
for (const [name, envVar] of Object.entries(required)) {
  const value = process.env[envVar];
  if (value && value.length > 0 && !value.includes('TEMP') && !value.includes('your_')) {
    console.log(`✅ ${name}: Configured`);
  } else {
    console.log(`❌ ${name}: NOT CONFIGURED`);
    allGood = false;
  }
}

console.log('\n💰 Pricing Tiers:');
console.log('-'.repeat(70));
for (const [name, envVar] of Object.entries(pricing)) {
  const value = process.env[envVar];
  if (value && value.startsWith('price_') && !value.includes('TEMP')) {
    console.log(`✅ ${name}: ${value}`);
  } else {
    console.log(`⚠️  ${name}: Not configured (need to create in Stripe)`);
    if (envVar !== 'NEXT_PUBLIC_STRIPE_PRICE_EDUCATION') {
      allGood = false;
    }
  }
}

console.log('\n🔗 Optional Configuration:');
console.log('-'.repeat(70));
for (const [name, envVar] of Object.entries(optional)) {
  const value = process.env[envVar];
  if (value && value.startsWith('price_') && !value.includes('TEMP')) {
    console.log(`✅ ${name}: ${value}`);
  } else {
    console.log(`ℹ️  ${name}: Not configured (optional)`);
  }
}

console.log('\n' + '='.repeat(70));

if (allGood) {
  console.log('✅ ALL REQUIRED CONFIGURATION COMPLETE!');
  console.log('='.repeat(70));
  console.log('\n🚀 You can now:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Visit: http://localhost:3000/dashboard/billing');
  console.log('   3. Test subscription flow with Stripe test cards');
  console.log('\n💳 Test Card: 4242 4242 4242 4242');
  console.log('   Expiry: Any future date');
  console.log('   CVC: Any 3 digits\n');
} else {
  console.log('⚠️  CONFIGURATION INCOMPLETE');
  console.log('='.repeat(70));
  console.log('\n📝 Next Steps:\n');
  
  // Check what's missing
  const missingStripe = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.length === 0;
  const missingPrices = !process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 
                        process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO.includes('TEMP');

  if (missingStripe) {
    console.log('1. ❌ Configure Stripe Keys:');
    console.log('   - Go to: https://dashboard.stripe.com/test/apikeys');
    console.log('   - Copy your keys to .env.local\n');
  }

  if (missingPrices) {
    console.log('2. ❌ Create Stripe Products:');
    console.log('   OPTION A - Automatic (Recommended):');
    console.log('     node scripts/setup-stripe-products.js');
    console.log('\n   OPTION B - Manual:');
    console.log('     - Go to: https://dashboard.stripe.com/test/products');
    console.log('     - Create each product/price');
    console.log('     - Copy price IDs to .env.local\n');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.length === 0) {
    console.log('3. ⚠️  Configure Webhook (for production):');
    console.log('   - Go to: https://dashboard.stripe.com/test/webhooks');
    console.log('   - Add endpoint: https://yourdomain.com/api/webhooks/stripe');
    console.log('   - Copy webhook secret to .env.local\n');
  }

  console.log('📖 For detailed instructions, see: STRIPE_SETUP_GUIDE.md\n');
}

// Show API endpoints
console.log('='.repeat(70));
console.log('📡 Available API Endpoints:');
console.log('='.repeat(70));
console.log('  POST   /api/stripe-checkout       - Create checkout session');
console.log('  GET    /api/subscription-status   - Get current subscription');
console.log('  POST   /api/subscription-cancel   - Cancel at period end');
console.log('  DELETE /api/subscription-cancel   - Cancel immediately');
console.log('  POST   /api/webhooks/stripe       - Stripe webhook handler');
console.log('');

// Show current setup summary
console.log('='.repeat(70));
console.log('📊 System Summary:');
console.log('='.repeat(70));
console.log(`  Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST' : 'LIVE'}`);
console.log(`  Webhook: ${process.env.STRIPE_WEBHOOK_SECRET ? 'Configured' : 'Not configured'}`);
console.log(`  Pricing Tiers: 6 (Free + 5 Paid)`);
console.log(`  Trial Period: 14 days on Pro tier`);
console.log(`  App URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`);
console.log('');

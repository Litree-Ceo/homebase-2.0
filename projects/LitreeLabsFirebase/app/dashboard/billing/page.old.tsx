'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DashboardLayout from '@/components/DashboardLayout';

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; email?: string } | null>(null);
  const [tier, setTier] = useState('free');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      router.push('/auth');
      return;
    }
    
    const authInstance = auth;
    const dbInstance = db;
    
    const unsub = onAuthStateChanged(authInstance, async (authUser) => {
      if (!authUser) {
        router.push('/auth');
        return;
      }

      setUser({ uid: authUser.uid, email: authUser.email ?? undefined });
      const userDoc = await getDoc(doc(dbInstance, 'users', authUser.uid));
      if (userDoc.exists()) {
        setTier(userDoc.data().tier || 'free');
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const handleUpgrade = async (selectedTier: 'pro' | 'enterprise') => {
    if (!user?.email) return;

    setLoading(true);
    try {
      if (paymentMethod === 'stripe') {
        // Stripe checkout
        const response = await fetch('/api/stripe-checkout', {
          method: 'POST',
          body: JSON.stringify({
            email: user.email,
            priceId: selectedTier === 'pro' ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO : process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE,
          }),
        });
        const data = (await response.json()) as { url?: string };
        if (data.url) window.location.href = data.url;
      } else {
        // PayPal checkout
        const amount = selectedTier === 'pro' ? '99' : '299';
        const response = await fetch('/api/paypal-checkout', {
          method: 'POST',
          body: JSON.stringify({
            email: user.email,
            amount,
          }),
        });
        const data = (await response.json()) as { approveUrl?: string };
        if (data.approveUrl) window.location.href = data.approveUrl;
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-sky-500/20 p-12 shadow-2xl">
          <h1 className="text-4xl font-black text-white mb-4">💳 Billing & Upgrade</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Choose the plan that fits your beauty business. All plans include email support and AI assistance.
          </p>
        </div>

        {/* Current Plan */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <p className="text-white/60 text-sm mb-2">Current Plan</p>
          <p className="text-3xl font-bold text-white capitalize">{tier}</p>
          <p className="text-white/70 mt-2">You&apos;re on the {tier} plan. Manage your subscription below.</p>
        </div>

        {/* Payment Method Selector */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Choose Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`p-4 rounded-lg border transition ${
                paymentMethod === 'stripe'
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <p className="font-semibold text-white">💳 Stripe</p>
              <p className="text-sm text-white/70">Credit/Debit Card</p>
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`p-4 rounded-lg border transition ${
                paymentMethod === 'paypal'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <p className="font-semibold text-white">🅿️ PayPal</p>
              <p className="text-sm text-white/70">PayPal Account</p>
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <p className="text-white/60 mb-6">Forever free, upgrade anytime</p>
            <div className="mb-6">
              <p className="text-4xl font-black text-white">$0</p>
              <p className="text-sm text-white/60 mt-1">/month</p>
            </div>
            <ul className="space-y-3 mb-6 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>1 post per day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>DM reply templates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Fraud detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Email support</span>
              </li>
            </ul>
            {tier === 'free' && (
              <button className="w-full px-4 py-2 rounded-lg border border-white/30 text-white font-semibold transition" disabled>
                Current Plan
              </button>
            )}
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-xl border-2 border-pink-500/50 bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-lg shadow-pink-500/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-white/60 mb-6">Perfect for growing beauty pros</p>
            <div className="mb-6">
              <p className="text-4xl font-black text-pink-400">$99</p>
              <p className="text-sm text-white/60 mt-1">/month</p>
            </div>
            <ul className="space-y-3 mb-6 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-pink-400">✓</span>
                <span>Unlimited daily posts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">✓</span>
                <span>Advanced DM replies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">✓</span>
                <span>Real-time analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">✓</span>
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">✓</span>
                <span>Growth templates</span>
              </li>
            </ul>
            {tier === 'pro' ? (
              <button className="w-full px-4 py-2 rounded-lg border border-pink-500/50 text-white font-semibold transition" disabled>
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            )}
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-white/60 mb-6">For scaling beauty empires</p>
            <div className="mb-6">
              <p className="text-4xl font-black text-purple-400">$299</p>
              <p className="text-sm text-white/60 mt-1">/month</p>
            </div>
            <ul className="space-y-3 mb-6 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Unlimited team members</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Custom integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>24/7 phone support</span>
              </li>
            </ul>
            {tier === 'enterprise' ? (
              <button className="w-full px-4 py-2 rounded-lg border border-purple-500/50 text-white font-semibold transition" disabled>
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade('enterprise')}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upgrade to Enterprise'}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
          <h3 className="text-xl font-bold text-white mb-6">❓ FAQ</h3>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-white mb-2">Can I change plans?</p>
              <p className="text-white/70">Yes! Upgrade or downgrade anytime. Changes take effect at the end of your billing cycle.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">What payment methods do you accept?</p>
              <p className="text-white/70">We accept credit cards (via Stripe) and PayPal. All payments are secure and encrypted.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Do you offer refunds?</p>
              <p className="text-white/70">Yes! 30-day money-back guarantee if you&apos;re not satisfied. No questions asked.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

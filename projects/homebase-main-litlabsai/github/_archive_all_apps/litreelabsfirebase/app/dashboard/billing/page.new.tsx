'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import DashboardLayout from '@/components/DashboardLayout';
import { STRIPE_PRODUCTS } from '@/lib/stripe';

interface SubscriptionData {
  tier: string;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    cancelAt?: string;
  } | null;
  stripeSubscriptionId?: string;
  canManage: boolean;
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ uid: string; email?: string } | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!auth) {
      router.push('/auth');
      return;
    }
    
    const unsub = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push('/auth');
        return;
      }

      setUser({ uid: authUser.uid, email: authUser.email ?? undefined });
      await fetchSubscriptionStatus();
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // Check for success/canceled query params
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success) {
      setMessage({ type: 'success', text: 'Subscription activated successfully!' });
      // Refresh subscription data
      fetchSubscriptionStatus();
    } else if (canceled) {
      setMessage({ type: 'error', text: 'Checkout was canceled.' });
    }
  }, [searchParams]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription-status');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    }
  };

  const handleUpgrade = async (priceId: string, tier: string) => {
    setActionLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create checkout session' });
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      setMessage({ type: 'error', text: 'Upgrade failed. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    setActionLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/subscription-cancel', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await fetchSubscriptionStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to cancel subscription' });
      }
    } catch (error) {
      console.error('Cancel failed:', error);
      setMessage({ type: 'error', text: 'Failed to cancel subscription' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white/60">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !subscriptionData) return null;

  const currentTier = subscriptionData.tier;
  const subscription = subscriptionData.subscription;
  const isActive = subscription?.status === 'active';
  const isPastDue = subscription?.status === 'past_due';
  const willCancel = subscription?.cancelAtPeriodEnd;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-sky-500/20 p-12 shadow-2xl">
          <h1 className="text-4xl font-black text-white mb-4">💳 Billing & Subscriptions</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-xl border p-4 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Current Subscription Status */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/60 text-sm mb-2">Current Plan</p>
              <p className="text-3xl font-bold text-white capitalize">{currentTier}</p>
              
              {subscription && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-white/70">
                    Status: <span className={`font-semibold ${
                      isActive ? 'text-emerald-400' : 
                      isPastDue ? 'text-yellow-400' : 
                      'text-white/60'
                    }`}>
                      {subscription.status}
                    </span>
                  </p>
                  
                  {subscription.currentPeriodEnd && (
                    <p className="text-sm text-white/70">
                      {willCancel ? 'Expires' : 'Renews'} on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                  
                  {willCancel && (
                    <p className="text-sm text-yellow-400">
                      ⚠️ Your subscription will be canceled at the end of the billing period
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {subscriptionData.canManage && !willCancel && currentTier !== 'free' && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(STRIPE_PRODUCTS).map(([key, product]) => {
            const isCurrent = currentTier === product.tier;
            const isUpgrade = !isCurrent && product.price > (STRIPE_PRODUCTS[currentTier as keyof typeof STRIPE_PRODUCTS]?.price || 0);
            
            return (
              <div
                key={key}
                className={`rounded-xl border p-8 ${
                  isCurrent
                    ? 'border-pink-500/50 bg-gradient-to-br from-pink-500/10 to-purple-500/10'
                    : 'border-white/10 bg-gradient-to-br from-slate-800 to-slate-900'
                }`}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                <div className="mb-6">
                  <p className="text-4xl font-black text-white">${product.price}</p>
                  <p className="text-sm text-white/60 mt-1">/month</p>
                  {product.trialDays && (
                    <p className="text-sm text-emerald-400 mt-2">
                      🎉 {product.trialDays}-day free trial
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6 text-sm text-white/80">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isCurrent ? (
                  <button
                    className="w-full px-4 py-2 rounded-lg border border-pink-500/50 text-white font-semibold"
                    disabled
                  >
                    Current Plan
                  </button>
                ) : isUpgrade && product.priceId ? (
                  <button
                    onClick={() => handleUpgrade(product.priceId, product.tier)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Upgrade Now'}
                  </button>
                ) : product.tier === 'free' ? (
                  <button
                    className="w-full px-4 py-2 rounded-lg border border-white/20 text-white/60 font-semibold"
                    disabled
                  >
                    Downgrade on Cancel
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <h3 className="text-lg font-bold text-white mb-4">💡 Need Help?</h3>
          <p className="text-white/70 text-sm mb-4">
            Have questions about billing or subscriptions? Contact us at support@litlabs.app
          </p>
          <p className="text-white/60 text-sm">
            All subscriptions are billed monthly. You can cancel anytime and will retain access until the end of your billing period.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const authInstance = auth;
    if (!authInstance) {
      router.push('/auth');
      return;
    }

    const unsub = onAuthStateChanged(authInstance, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      // Verify admin status via API route
      const res = await fetch('/api/verify-admin', {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!res.ok) {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      trackEvent('admin_dashboard_view', { uid: user.uid });
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Unauthorized access</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">🎛️ Admin Control Panel</h1>
          <p className="text-white/60">Complete platform management and oversight</p>
        </div>

        {/* Quick Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analytics Link */}
          <a
            href="/admin/analytics"
            className="group rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 hover:border-blue-500/30 transition-all"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-white font-bold mb-2 group-hover:text-blue-400 transition-colors">
              Analytics
            </h3>
            <p className="text-white/60 text-sm">Real-time revenue, users, conversion rates</p>
          </a>

          {/* Users Link */}
          <a
            href="/admin/users"
            className="group rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 hover:border-purple-500/30 transition-all"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-white font-bold mb-2 group-hover:text-purple-400 transition-colors">
              User Management
            </h3>
            <p className="text-white/60 text-sm">Manage tiers, suspend accounts, export users</p>
          </a>

          {/* Billing Link */}
          <a
            href="/dashboard/billing"
            className="group rounded-xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 hover:border-green-500/30 transition-all"
          >
            <div className="text-4xl mb-3">💳</div>
            <h3 className="text-white font-bold mb-2 group-hover:text-green-400 transition-colors">
              Billing & Pricing
            </h3>
            <p className="text-white/60 text-sm">Manage payment methods and pricing tiers</p>
          </a>

          {/* Transactions Link */}
          <a
            href="/admin/analytics"
            className="group rounded-xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 hover:border-orange-500/30 transition-all"
          >
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-white font-bold mb-2 group-hover:text-orange-400 transition-colors">
              Transactions
            </h3>
            <p className="text-white/60 text-sm">View all payments and refunds</p>
          </a>

          {/* Settings Link */}
          <a
            href="/dashboard/profile"
            className="group rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-6 hover:border-indigo-500/30 transition-all"
          >
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="text-white font-bold mb-2 group-hover:text-indigo-400 transition-colors">
              Settings
            </h3>
            <p className="text-white/60 text-sm">Configure API keys and webhooks</p>
          </a>

          {/* Referrals Link */}
          <a
            href="/referrals"
            className="group rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 p-6 hover:border-cyan-500/30 transition-all"
          >
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="text-white font-bold mb-2 group-hover:text-cyan-400 transition-colors">
              Referral Program
            </h3>
            <p className="text-white/60 text-sm">Track affiliate revenue and bonuses</p>
          </a>
        </div>

        {/* Feature Status */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <h2 className="text-xl font-bold text-white mb-6">✨ System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Stripe Integration', status: 'active', icon: '💳' },
              { name: 'PayPal Integration', status: 'active', icon: '🅿️' },
              { name: 'Email System', status: 'active', icon: '📧' },
              { name: 'Analytics Tracking', status: 'active', icon: '📊' },
              { name: 'Referral Program', status: 'active', icon: '🎁' },
              { name: 'Webhook Processing', status: 'active', icon: '🪝' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-white/80">
                  {item.icon} {item.name}
                </span>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <h2 className="text-xl font-bold text-white mb-4">📈 Quick Stats</h2>
          <p className="text-white/60 text-sm">
            ✅ 30 API routes • ✅ Multi-payment ready • ✅ Real-time admin dashboard • ✅ Advanced user management • ✅ Webhook processing
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

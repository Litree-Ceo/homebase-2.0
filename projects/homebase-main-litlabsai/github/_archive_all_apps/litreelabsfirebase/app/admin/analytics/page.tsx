'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

type AnalyticsData = {
  totalUsers: number;
  activeUsersThisMonth: number;
  totalRevenue: number;
  mrr: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  conversionRate: number;
  churnRate: number;
  avgRevenuePerUser: number;
  recentSignups: number;
  recentTransactions: Transaction[];
  userTierBreakdown: {
    free: number;
    pro: number;
    enterprise: number;
  };
};

type Transaction = {
  id: string;
  createdAt?: { toDate?: () => Date } | string | number | null;
  amount?: number;
  email?: string;
  tier?: string;
  status?: string;
};

function formatDate(value?: Transaction['createdAt']) {
  if (!value) return "";
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  return new Date(value as string | number | Date).toLocaleDateString();
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsersThisMonth: 0,
    totalRevenue: 0,
    mrr: 0,
    freeUsers: 0,
    proUsers: 0,
    enterpriseUsers: 0,
    conversionRate: 0,
    churnRate: 0,
    avgRevenuePerUser: 0,
    recentSignups: 0,
    recentTransactions: [],
    userTierBreakdown: { free: 0, pro: 0, enterprise: 0 },
  });

  useEffect(() => {
    const authInstance = auth;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!authInstance) {
      router.push('/auth');
      return;
    }

    const unsub = onAuthStateChanged(authInstance, async (user) => {
      if (!user || (adminEmail && user.email !== adminEmail)) {
        router.push('/auth');
        return;
      }

      setIsAdmin(true);
      trackEvent('admin_analytics_view', { uid: user.uid });

      // Real-time user analytics
      const dbInstance = db;
      if (!dbInstance) {
        setLoading(false);
        return;
      }
      const usersQuery = query(collection(dbInstance, 'users'));
      const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
        let freeCount = 0,
          proCount = 0,
          enterpriseCount = 0;
        let totalRev = 0;
        const thisMonth = new Date();
        thisMonth.setDate(1);

        snapshot.forEach((doc) => {
          const userData = doc.data();
          const tier = userData.tier || 'free';

          if (tier === 'free') freeCount++;
          else if (tier === 'pro') {
            proCount++;
            totalRev += 99; // Monthly
          } else if (tier === 'enterprise') {
            enterpriseCount++;
            totalRev += 299; // Monthly
          }
        });

        const total = freeCount + proCount + enterpriseCount;
        const conversion = total > 0 ? ((proCount + enterpriseCount) / total) * 100 : 0;

        setAnalytics((prev) => ({
          ...prev,
          totalUsers: total,
          freeUsers: freeCount,
          proUsers: proCount,
          enterpriseUsers: enterpriseCount,
          totalRevenue: totalRev * 12, // Annual
          mrr: totalRev,
          conversionRate: conversion,
          avgRevenuePerUser: total > 0 ? (totalRev * 12) / total : 0,
          userTierBreakdown: { free: freeCount, pro: proCount, enterprise: enterpriseCount },
        }));
      });

      // Real-time transactions
      const txnQuery = query(collection(dbInstance, 'transactions'), orderBy('createdAt', 'desc'), limit(10));
      const unsubTxn = onSnapshot(txnQuery, (snapshot) => {
        const recentTxn = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAnalytics((prev) => ({
          ...prev,
          recentTransactions: recentTxn,
        }));
      });

      setLoading(false);

      return () => {
        unsubUsers();
        unsubTxn();
      };
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading analytics...</p>
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
          <h1 className="text-4xl font-bold text-white mb-2">📊 Analytics Dashboard</h1>
          <p className="text-white/60">Real-time insights into platform performance</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6">
            <p className="text-white/60 text-sm mb-2">Total Users</p>
            <p className="text-4xl font-bold text-blue-400">{analytics.totalUsers}</p>
            <p className="text-white/40 text-xs mt-2">
              {analytics.freeUsers} free • {analytics.proUsers} pro • {analytics.enterpriseUsers} enterprise
            </p>
          </div>

          {/* MRR */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6">
            <p className="text-white/60 text-sm mb-2">Monthly Recurring Revenue</p>
            <p className="text-4xl font-bold text-green-400">${analytics.mrr.toLocaleString()}</p>
            <p className="text-white/40 text-xs mt-2">
              Annual: ${(analytics.totalRevenue).toLocaleString()}
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6">
            <p className="text-white/60 text-sm mb-2">Conversion Rate</p>
            <p className="text-4xl font-bold text-purple-400">{analytics.conversionRate.toFixed(1)}%</p>
            <p className="text-white/40 text-xs mt-2">
              {analytics.proUsers + analytics.enterpriseUsers} paid users
            </p>
          </div>

          {/* ARPU */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6">
            <p className="text-white/60 text-sm mb-2">Avg Revenue Per User</p>
            <p className="text-4xl font-bold text-orange-400">${analytics.avgRevenuePerUser.toFixed(2)}</p>
            <p className="text-white/40 text-xs mt-2">Annual per user</p>
          </div>
        </div>

        {/* Tier Breakdown */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <h2 className="text-xl font-bold text-white mb-6">User Tier Distribution</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Free */}
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <p className="text-white/60 text-sm mb-3">Free Tier</p>
              <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                  style={{
                    width: `${analytics.totalUsers > 0 ? (analytics.freeUsers / analytics.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-blue-400 font-bold mt-2">
                {analytics.freeUsers} users ({analytics.totalUsers > 0 ? ((analytics.freeUsers / analytics.totalUsers) * 100).toFixed(1) : 0}%)
              </p>
            </div>

            {/* Pro */}
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <p className="text-white/60 text-sm mb-3">Pro Tier</p>
              <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{
                    width: `${analytics.totalUsers > 0 ? (analytics.proUsers / analytics.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-purple-400 font-bold mt-2">
                {analytics.proUsers} users ({analytics.totalUsers > 0 ? ((analytics.proUsers / analytics.totalUsers) * 100).toFixed(1) : 0}%)
              </p>
            </div>

            {/* Enterprise */}
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <p className="text-white/60 text-sm mb-3">Enterprise Tier</p>
              <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                  style={{
                    width: `${analytics.totalUsers > 0 ? (analytics.enterpriseUsers / analytics.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-orange-400 font-bold mt-2">
                {analytics.enterpriseUsers} users ({analytics.totalUsers > 0 ? ((analytics.enterpriseUsers / analytics.totalUsers) * 100).toFixed(1) : 0}%)
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Customer</th>
                  <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Plan</th>
                  <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentTransactions.length > 0 ? (
                  analytics.recentTransactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white/80 text-sm">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-white/80 text-sm">{txn.email || 'Unknown'}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">
                        ${txn.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3 text-white/60 text-sm capitalize">{txn.tier || 'pro'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            txn.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : txn.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {txn.status || 'completed'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/40 text-sm">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Growth */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📈 Tier Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Free Users</span>
                <span className="text-blue-400 font-bold">{analytics.userTierBreakdown.free}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Pro Users</span>
                <span className="text-purple-400 font-bold">{analytics.userTierBreakdown.pro}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Enterprise Users</span>
                <span className="text-orange-400 font-bold">{analytics.userTierBreakdown.enterprise}</span>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">💰 Revenue Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Monthly Recurring</span>
                <span className="text-green-400 font-bold">${analytics.mrr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Annual Run Rate</span>
                <span className="text-green-400 font-bold">${(analytics.mrr * 12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Pro Revenue</span>
                <span className="text-green-400 font-bold">${(analytics.proUsers * 99 * 12).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import DashboardLayout from "@/components/DashboardLayout";

interface Metrics {
  users: { total: number; dailyActive: number; byTier: Record<string, number> };
  revenue: { weekly: number; monthlyProjected: number };
  activity: { last24h: number };
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [uptime, setUptime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function loadMetrics() {
    try {
      const [metricsRes, uptimeRes] = await Promise.all([
        fetch('/api/monitoring/metrics'),
        fetch('/api/monitoring/uptime'),
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      if (uptimeRes.ok) {
        const data = await uptimeRes.json();
        setUptime(data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AuthGate>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">Loading metrics...</p>
          </div>
        </DashboardLayout>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Monitoring</h1>
            <p className="text-slate-300">Real-time platform health and metrics</p>
          </div>

          {/* Uptime Status */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">System Status</h2>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-emerald-400">All Systems Operational</span>
                </div>
              </div>
              {uptime && (
                <div className="text-right">
                  <p className="text-sm text-slate-400">Response Time</p>
                  <p className="text-2xl font-bold text-emerald-400">{uptime.responseTime}ms</p>
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics Grid */}
          {metrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400 mb-1">Total Users</p>
                  <p className="text-3xl font-bold">{metrics.users.total}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400 mb-1">Daily Active</p>
                  <p className="text-3xl font-bold text-emerald-400">{metrics.users.dailyActive}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400 mb-1">Weekly Revenue</p>
                  <p className="text-3xl font-bold text-emerald-400">${metrics.revenue.weekly.toFixed(0)}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400 mb-1">MRR Projected</p>
                  <p className="text-3xl font-bold text-purple-400">${metrics.revenue.monthlyProjected.toFixed(0)}</p>
                </div>
              </div>

              {/* Tier Distribution */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h2 className="text-xl font-semibold mb-4">User Tier Distribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(metrics.users.byTier).map(([tier, count]) => (
                    <div key={tier} className="text-center p-4 rounded-lg bg-slate-800">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-slate-400 capitalize">{tier}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h2 className="text-xl font-semibold mb-2">Activity (Last 24h)</h2>
                <p className="text-3xl font-bold text-cyan-400">{metrics.activity.last24h}</p>
                <p className="text-sm text-slate-400 mt-1">Total events logged</p>
              </div>
            </>
          )}

          {/* Quick Links */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">Monitoring Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a
                href="/status"
                className="p-4 rounded-lg border border-slate-700 hover:border-emerald-500 transition text-center"
              >
                <p className="font-semibold">Status Page</p>
                <p className="text-xs text-slate-400 mt-1">Public status</p>
              </a>
              <a
                href="/api/health"
                target="_blank"
                className="p-4 rounded-lg border border-slate-700 hover:border-emerald-500 transition text-center"
              >
                <p className="font-semibold">Health Check</p>
                <p className="text-xs text-slate-400 mt-1">API endpoint</p>
              </a>
              <a
                href="/api/monitoring/uptime"
                target="_blank"
                className="p-4 rounded-lg border border-slate-700 hover:border-emerald-500 transition text-center"
              >
                <p className="font-semibold">Uptime Data</p>
                <p className="text-xs text-slate-400 mt-1">JSON response</p>
              </a>
              <a
                href="/api/monitoring/metrics"
                target="_blank"
                className="p-4 rounded-lg border border-slate-700 hover:border-emerald-500 transition text-center"
              >
                <p className="font-semibold">Metrics API</p>
                <p className="text-xs text-slate-400 mt-1">JSON response</p>
              </a>
            </div>
          </div>

          <div className="text-sm text-slate-500 text-center">
            Last updated: {new Date().toLocaleTimeString()} • Auto-refreshes every minute
          </div>
        </div>
      </DashboardLayout>
    </AuthGate>
  );
}

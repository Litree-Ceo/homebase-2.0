"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminPanel() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-black mb-4">🚫 Access Denied</p>
          <p className="text-gray-400 mb-6">You don&apos;t have permission to view this page.</p>
          <Link href="/dashboard" className="text-[#ff006e] hover:text-[#ff006e]/80">
            ← Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black mb-2">🛠️ Admin Control Panel</h1>
          <p className="text-gray-400">Manage everything across LitLabs OS.</p>
        </div>

        {/* ADMIN STATS */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Total Users</p>
            <p className="text-4xl font-black">2,847</p>
            <p className="text-xs text-green-400 mt-2">+156 this week</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Active Subscriptions</p>
            <p className="text-4xl font-black">1,204</p>
            <p className="text-xs text-blue-400 mt-2">$147,890 MRR</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Fraud Alerts</p>
            <p className="text-4xl font-black">12</p>
            <p className="text-xs text-orange-400 mt-2">7 resolved</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">System Health</p>
            <p className="text-4xl font-black text-green-400">98%</p>
            <p className="text-xs text-gray-400 mt-2">All systems operational</p>
          </div>
        </div>

        {/* ADMIN TOOLS */}
        <div className="border border-white/10 rounded-xl p-6 bg-white/5">
          <h2 className="text-2xl font-black mb-6">Admin Tools</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AdminCard
              icon="📋"
              title="User Management"
              desc="View, edit, and manage user accounts"
              action="Open"
            />
            <AdminCard
              icon="💳"
              title="Subscription Manager"
              desc="Manage plans, trials, and cancellations"
              action="Open"
            />
            <AdminCard
              icon="🚨"
              title="Fraud Detection"
              desc="Review flagged accounts and activities"
              action="Open"
            />
            <AdminCard
              icon="📧"
              title="Email Broadcaster"
              desc="Send system-wide announcements"
              action="Open"
            />
            <AdminCard
              icon="🧠"
              title="AI System Memory"
              desc="View and edit AI training data"
              action="Open"
            />
            <AdminCard
              icon="📊"
              title="Analytics & Reports"
              desc="System performance and user metrics"
              action="Open"
            />
          </div>
        </div>

        {/* RECENT ALERTS */}
        <div className="border border-white/10 rounded-xl p-6 bg-white/5">
          <h2 className="text-2xl font-black mb-6">Recent Alerts</h2>

          <div className="space-y-3">
            <AlertRow
              icon="⚠️"
              title="High Payment Failure Rate"
              desc="12 failed payments in the last hour"
              severity="high"
            />
            <AlertRow
              icon="🚨"
              title="Brute Force Attempt Detected"
              desc="Multiple failed login attempts from IP 192.168.1.100"
              severity="critical"
            />
            <AlertRow
              icon="🔍"
              title="Fraud Check Alert"
              desc="User purchased all plans simultaneously"
              severity="medium"
            />
            <AlertRow
              icon="✓"
              title="System Backup Complete"
              desc="All data successfully backed up to GCS"
              severity="success"
            />
          </div>
        </div>

        {/* BACK LINK */}
        <div className="text-center border-t border-white/10 pt-8">
          <Link href="/dashboard" className="text-[#ff006e] hover:text-[#ff006e]/80">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminCard({
  icon,
  title,
  desc,
  action,
}: {
  icon: string;
  title: string;
  desc: string;
  action: string;
}) {
  return (
    <button className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#ff006e]/30 transition text-left">
      <p className="text-3xl mb-2">{icon}</p>
      <p className="font-bold mb-1">{title}</p>
      <p className="text-gray-400 text-sm mb-3">{desc}</p>
      <p className="text-xs text-[#ff006e] font-bold">{action} →</p>
    </button>
  );
}

function AlertRow({
  icon,
  title,
  desc,
  severity,
}: {
  icon: string;
  title: string;
  desc: string;
  severity: "critical" | "high" | "medium" | "success";
}) {
  const severityColor = {
    critical: "bg-red-500/20 border-red-500/50",
    high: "bg-orange-500/20 border-orange-500/50",
    medium: "bg-yellow-500/20 border-yellow-500/50",
    success: "bg-green-500/20 border-green-500/50",
  };

  return (
    <div className={`p-4 rounded-lg border ${severityColor[severity]}`}>
      <div className="flex items-start gap-3">
        <p className="text-2xl">{icon}</p>
        <div className="flex-1">
          <p className="font-bold">{title}</p>
          <p className="text-gray-400 text-sm">{desc}</p>
        </div>
      </div>
    </div>
  );
}

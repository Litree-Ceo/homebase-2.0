"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SecurityEvent {
  event: string;
  details: string;
  time: string;
}

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    // Fetch security logs
    fetch("/api/security")
      .then((r) => r.json())
      .then((data) => setEvents(data.logs || []))
      .catch((err) => console.error("Failed to fetch security logs:", err));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black mb-2">🔐 Security & Snoop Detection</h1>
          <p className="text-gray-400">
            LitLabs monitors your account for suspicious activity, new devices, brute-force attempts, location changes, and unauthorized access.
          </p>
        </div>

        {/* SECURITY STATS */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-sm">Account Status</p>
            <p className="text-2xl font-black text-green-400">✓ Secure</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-sm">Last Threat</p>
            <p className="text-2xl font-black text-gray-300">None</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-sm">Active Sessions</p>
            <p className="text-2xl font-black text-blue-400">1</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-sm">2FA Status</p>
            <p className="text-2xl font-black text-orange-400">Off</p>
          </div>
        </div>

        {/* SECURITY EVENTS */}
        <div>
          <h2 className="text-2xl font-black mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center text-gray-400">
                No security events recorded. Your account looks clean!
              </div>
            ) : (
              events.map((event, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg">{event.event}</p>
                      <p className="text-gray-400 text-sm">{event.details}</p>
                    </div>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SETTINGS */}
        <div className="border-t border-white/10 pt-8">
          <h2 className="text-2xl font-black mb-4">Security Settings</h2>
          <div className="space-y-4">
            <button className="w-full p-4 rounded-lg border border-white/20 text-left hover:bg-white/10 transition">
              <p className="font-bold">Enable 2-Factor Authentication</p>
              <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
            </button>
            <button className="w-full p-4 rounded-lg border border-white/20 text-left hover:bg-white/10 transition">
              <p className="font-bold">Change Password</p>
              <p className="text-gray-400 text-sm">Update your password for better security</p>
            </button>
            <button className="w-full p-4 rounded-lg border border-red-500/20 text-left hover:bg-red-500/10 transition">
              <p className="font-bold text-red-400">Sign Out Everywhere</p>
              <p className="text-gray-400 text-sm">End all active sessions across all devices</p>
            </button>
          </div>
        </div>

        {/* BACK LINK */}
        <div className="text-center">
          <Link href="/dashboard" className="text-[#ff006e] hover:text-[#ff006e]/80">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

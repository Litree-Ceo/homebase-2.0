"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const { user, userData, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black mb-2">⚙️ Settings</h1>
          <p className="text-gray-400">Manage your account, billing, and preferences.</p>
        </div>

        {/* PROFILE SECTION */}
        <div className="border border-white/10 rounded-xl p-6 bg-white/5">
          <h2 className="text-2xl font-black mb-6">👤 Profile Information</h2>

          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Email</p>
              <p className="font-bold text-lg">{user?.email}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Account Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="font-bold">Active</p>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Current Plan</p>
              <div className="flex items-center justify-between">
                <p className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff006e] to-[#8338ec]">
                  {userData?.tier === "free" ? "Starter" : userData?.tier === "pro" ? "Godmode Pro" : "Enterprise"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Member Since</p>
              <p className="font-bold">
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div className="border border-white/10 rounded-xl p-6 bg-white/5">
          <h2 className="text-2xl font-black mb-6">🔐 Security</h2>

          <div className="space-y-3">
            <button className="w-full p-4 rounded-lg border border-white/20 text-left hover:bg-white/10 transition">
              <p className="font-bold">Change Password</p>
              <p className="text-gray-400 text-sm">Update your password for better security</p>
            </button>

            <button className="w-full p-4 rounded-lg border border-white/20 text-left hover:bg-white/10 transition">
              <p className="font-bold">Enable 2-Factor Authentication</p>
              <p className="text-gray-400 text-sm">Add an extra layer of security</p>
            </button>

            <button className="w-full p-4 rounded-lg border border-white/20 text-left hover:bg-white/10 transition">
              <p className="font-bold">View Security Logs</p>
              <p className="text-gray-400 text-sm">See recent account activity</p>
            </button>
          </div>
        </div>

        {/* PREFERENCES SECTION */}
        <div className="border border-white/10 rounded-xl p-6 bg-white/5">
          <h2 className="text-2xl font-black mb-6">🎨 Preferences</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <div>
                <p className="font-bold">Email Notifications</p>
                <p className="text-gray-400 text-sm">Get updates about your bookings and AI activity</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <div>
                <p className="font-bold">Daily Digest</p>
                <p className="text-gray-400 text-sm">Receive a summary of your AI activities each morning</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <div>
                <p className="font-bold">Marketing Emails</p>
                <p className="text-gray-400 text-sm">Get tips, new features, and special offers</p>
              </div>
            </label>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="border border-red-500/30 rounded-xl p-6 bg-red-500/5">
          <h2 className="text-2xl font-black mb-6 text-red-400">⚠️ Danger Zone</h2>

          <div className="space-y-3">
            <button className="w-full p-4 rounded-lg border border-red-500/30 text-left hover:bg-red-500/10 transition">
              <p className="font-bold">Sign Out Everywhere</p>
              <p className="text-gray-400 text-sm">End all active sessions across all devices</p>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full p-4 rounded-lg border border-red-500/50 bg-red-500/10 text-left hover:bg-red-500/20 transition"
            >
              <p className="font-bold text-red-400">Sign Out of This Device</p>
              <p className="text-gray-400 text-sm">Log out and clear your session</p>
            </button>

            <button className="w-full p-4 rounded-lg border border-red-500/50 text-left hover:bg-red-500/10 transition">
              <p className="font-bold text-red-400">Delete Account</p>
              <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
            </button>
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

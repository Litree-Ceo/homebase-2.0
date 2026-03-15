"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import DashboardLayout from "@/components/DashboardLayout";

type UserProfile = {
  name: string;
  businessName: string;
  email: string;
  city: string;
  services: string;
  idealClient: string;
  priceRange: string;
  slowDays: string;
  createdAt?: string;
  tier: "free" | "pro" | "enterprise";
};

function DashboardProfileInner() {
  const [user, setUser] = useState<{ email?: string; uid: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    businessName: "",
    email: "",
    city: "",
    services: "",
    idealClient: "",
    priceRange: "",
    slowDays: "",
    tier: "free",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const authInstance = auth;
    const dbInstance = db;

    const unsub = authInstance.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser({ uid: currentUser.uid, email: currentUser.email ?? undefined });

      try {
        const userRef = doc(dbInstance, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setProfile((prev) => ({
            ...prev,
            ...data,
            email: currentUser.email || "",
          }));
        } else {
          setProfile((prev) => ({
            ...prev,
            email: currentUser.email || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!user || !db) return;

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          ...profile,
          email: user.email,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      setEditing(false);
      alert("✅ Profile saved!");
    } catch (error) {
      alert("❌ Error saving profile: " + error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2">Your Profile</h1>
        <p className="text-slate-400">
          Manage your business info and personalization settings.
        </p>
      </div>

      {/* Account Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Email Card */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-700 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            📧 Email
          </p>
          <p className="text-lg font-semibold text-white break-all">
            {user.email}
          </p>
        </div>

        {/* Plan Card */}
        <div className="bg-gradient-to-br from-pink-950/40 to-purple-950/40 border border-pink-700/50 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wide text-pink-400 mb-2">
            🎯 Current Plan
          </p>
          <p className="text-lg font-semibold text-pink-200 capitalize">
            {profile.tier}
          </p>
        </div>

        {/* Member Since */}
        <div className="bg-gradient-to-br from-sky-950/40 to-slate-950/40 border border-sky-700/50 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wide text-sky-400 mb-2">
            ⏰ Member Since
          </p>
          <p className="text-lg font-semibold text-sky-200">
            {profile.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : "Just now"}
          </p>
        </div>
      </div>

      {/* Business Profile Section */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Business Profile</h2>
            <p className="text-sm text-slate-400">
              LitLabs uses this info to personalize your content
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition"
          >
            {editing ? "Cancel" : "✏️ Edit"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Your Name
            </label>
            <input
              disabled={!editing}
              value={profile.name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-60 focus:border-pink-500 focus:outline-none transition"
              placeholder="e.g., Sarah"
            />
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Business Name
            </label>
            <input
              disabled={!editing}
              value={profile.businessName}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, businessName: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-60 focus:border-pink-500 focus:outline-none transition"
              placeholder="e.g., Glam Studio NYC"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              City / Location
            </label>
            <input
              disabled={!editing}
              value={profile.city}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, city: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-60 focus:border-pink-500 focus:outline-none transition"
              placeholder="e.g., New York, NY"
            />
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Services You Offer
            </label>
            <input
              disabled={!editing}
              value={profile.services}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, services: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-60 focus:border-pink-500 focus:outline-none transition"
              placeholder="e.g., Lash extensions, nail art"
            />
          </div>

          {/* Ideal Client */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Ideal Client Type
            </label>
            <input
              disabled={!editing}
              value={profile.idealClient}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, idealClient: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-60 focus:border-pink-500 focus:outline-none transition"
              placeholder="e.g., Brides, corporate events"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Typical Price Range
            </label>
            <input
              disabled={!editing}
              value={profile.priceRange}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, priceRange: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-60 focus:border-pink-500 focus:outline-none transition"
              placeholder="e.g., $150-300"
            />
          </div>

          {/* Slow Days */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Slow Days of the Week
            </label>
            <input
              disabled={!editing}
              value={profile.slowDays}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, slowDays: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-60 focus:border-pink-500 focus:outline-none transition"
              placeholder="e.g., Mondays, Tuesdays"
            />
          </div>
        </div>

        {editing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-pink-500/50 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "💾 Save Profile"}
          </button>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/40 to-slate-950/40 border border-emerald-700/40 rounded-3xl p-8">
        <h3 className="text-lg font-bold text-emerald-300 mb-4">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>
            ✓ <span className="font-semibold">Complete your profile</span> so
            LitLabs AI generates content that feels authentically YOU
          </li>
          <li>
            ✓ <span className="font-semibold">Update slow days regularly</span> so
            we know when to suggest promos and fill rates
          </li>
          <li>
            ✓ <span className="font-semibold">List your ideal clients</span> so
            we can tailor DM scripts and offers to your dream customer
          </li>
          <li>
            ✓{" "}
            <span className="font-semibold">
              Visit /dashboard/stats to see your LitLabs command usage
            </span>
          </li>
        </ul>
      </div>
    </div>
    </DashboardLayout>
  );
}

export default function DashboardProfilePage() {
  return <DashboardProfileInner />;
}

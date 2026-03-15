// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import DashboardLayout from "@/components/DashboardLayout";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function ProfileInner() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    services: "",
    city: "",
    idealClient: "",
    priceRange: "",
    slowDays: "",
  });

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const authInstance = auth;
    const dbInstance = db;

    const unsub = authInstance.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      const ref = doc(dbInstance, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setForm((prev) => ({
          ...prev,
          name: data.name || "",
          businessName: data.businessName || "",
          services: data.services || "",
          city: data.city || "",
          idealClient: data.idealClient || "",
          priceRange: data.priceRange || "",
          slowDays: data.slowDays || "",
        }));
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!auth?.currentUser || !db) return;
    const user = auth.currentUser;
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, form, { merge: true });
      alert("✅ Profile updated successfully!");
    } catch (error) {
      alert("❌ Error updating profile: " + error);
    }
    setSaving(false);
  };

  if (loading) return <p className="text-slate-300">Loading...</p>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-slate-300">
            Update your business info. LitLabs uses this to personalize your content,
            DM scripts, and promos.
          </p>
        </div>

        <div className="space-y-4 bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          {[
            ["name", "Your Name"],
            ["businessName", "Business Name"],
            ["services", "Services"],
            ["city", "City / Location"],
            ["idealClient", "Ideal Client"],
            ["priceRange", "Price Range"],
            ["slowDays", "Slow Days"],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="block mb-2 text-slate-200 font-semibold text-sm">
                {label}
              </label>
              <input
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:border-pink-500 focus:outline-none transition"
                placeholder={field}
                value={(form as Record<string, string>)[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-pink-500/50 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "💾 Save Changes"}
        </button>

        <p className="text-xs text-slate-500">
          — Powered by LitLabs Business OS™ 🔥
        </p>
      </div>
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <main>
      <AuthGate>
        <ProfileInner />
      </AuthGate>
    </main>
  );
}

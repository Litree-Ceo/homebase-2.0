"use client";

import { LabAdminGuard } from "@/components/LabAdminGuard";
import { LabAdminSecurity } from "@/components/LabAdminSecurity";
import { useAuth } from "@/context/AuthContext";
import { useAdminGuard } from "@/components/useAdminGuard";

export const dynamic = "force-static";

export default function LabStudioAdminPage() {
  const { user } = useAuth();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = !!user && !!adminEmail && user.email === adminEmail;
  const validated = useAdminGuard();
  const allowed = isAdmin || validated;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Admin surface (stub)</p>
          <h1 className="text-3xl font-semibold text-white">LabStudio Admin Controls</h1>
          <p className="text-sm text-slate-300">
            Lock this route down with real auth middleware. This page only demonstrates the guard + security block and
            should not expose controls until wired to your backend/session logic.
          </p>
        </div>
        <LabAdminGuard />
        {allowed ? (
          <LabAdminSecurity />
        ) : (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-100">
            Not authorized. Set NEXT_PUBLIC_ADMIN_EMAIL and enforce middleware/auth server-side; validation API must return admin/ok.
          </div>
        )}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
          <p className="text-slate-100 font-semibold">Next steps</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside">
            <li>Protect this route with Next middleware using your auth/session cookie.</li>
            <li>Call server APIs to ban/suspend, force logout, and view audits (not implemented here).</li>
            <li>Populate with live data from your admin collections (users, sessions, payments).</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

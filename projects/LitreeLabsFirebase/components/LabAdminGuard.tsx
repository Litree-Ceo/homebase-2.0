'use client';

import { useAuth } from "@/context/AuthContext";

export function LabAdminGuard() {
  const { user } = useAuth();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = !!user && !!adminEmail && user.email === adminEmail;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Admin gate (stub)</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
          Guarded
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-300">
        Only the configured admin email should see protected controls. Wire real enforcement on admin routes.
      </p>
      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <p>
          Status:{" "}
          <span className={isAdmin ? "text-emerald-300 font-semibold" : "text-amber-300 font-semibold"}>
            {isAdmin ? "Admin detected" : "Hidden for non-admins"}
          </span>
        </p>
        {!isAdmin && (
          <p className="mt-1 text-xs text-slate-400">
            Set NEXT_PUBLIC_ADMIN_EMAIL and ensure auth is initialized. Use server-side route middleware to enforce.
          </p>
        )}
      </div>
    </section>
  );
}

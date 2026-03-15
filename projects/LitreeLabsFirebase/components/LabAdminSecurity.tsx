'use client';

export function LabAdminSecurity() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Security · admin-only</p>
          <h3 className="text-xl font-semibold text-white">Hidden controls, loud protection</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
          WAF · MFA · Audits
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3 text-sm text-slate-200">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-slate-100 font-semibold">Controls</p>
          <ul className="mt-2 space-y-1.5">
            <li>Ban/suspend, force logout, session viewer</li>
            <li>IP allowlist, MFA for admin, VPN recommended</li>
            <li>Bot/captcha on risk; WAF + rate limits</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-slate-100 font-semibold">Audits & alerts</p>
          <ul className="mt-2 space-y-1.5">
            <li>Full audit log of payments, bans, config changes</li>
            <li>Fraud alerts from Stripe + AI signals</li>
            <li>Real-time notifications to admin only</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-slate-100 font-semibold">Data & privacy</p>
          <ul className="mt-2 space-y-1.5">
            <li>Encryption at rest + TLS everywhere</li>
            <li>Isolated admin surface, hidden from users</li>
            <li>Backups + incident playbooks</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

'use client';

const paymentMethods = [
  { label: "Visa / MasterCard / AmEx", accent: "bg-emerald-400/60" },
  { label: "Apple Pay / Google Pay", accent: "bg-cyan-400/60" },
  { label: "PayPal", accent: "bg-blue-400/60" },
  { label: "Crypto (BTC / ETH)", accent: "bg-amber-400/70" },
  { label: "Bank Transfer", accent: "bg-purple-400/60" },
];

const tiers = [
  { name: "Starter", price: "$5" },
  { name: "Standard", price: "$15" },
  { name: "Pro", price: "$50" },
  { name: "Elite", price: "$100" },
  { name: "Ultimate", price: "$200" },
];

export function LabPaymentMock() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Payment gateway · holographic</h3>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-emerald-200">
            Secure checkout
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="group rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-3 transition hover:-translate-y-1 hover:border-emerald-300/70 hover:bg-emerald-500/10"
            >
              <div className="flex items-center justify-between text-sm text-slate-100">
                <span>{tier.name}</span>
                <span className="text-emerald-300 font-semibold">{tier.price}</span>
              </div>
              <div className="mt-2 h-1 w-full rounded-full bg-emerald-500/20">
                <div className="h-1 rounded-full bg-emerald-400/80 transition-all group-hover:w-full group-hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-200">Crypto wallet (QR)</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-24 w-24 rounded-lg border border-white/20 bg-black/40 grid place-items-center text-slate-400 text-xs">
              QR
            </div>
            <div className="space-y-1 text-sm text-slate-200">
              <p>Scan to pay with BTC or ETH.</p>
              <p className="text-emerald-300">Auto-detects network · Realtime confirm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Accept everything</h3>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
            PCI + MFA
          </span>
        </div>
        <div className="mt-4 space-y-3 text-sm text-slate-200">
          {paymentMethods.map((method) => (
            <div
              key={method.label}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <span className={`h-2 w-2 rounded-full ${method.accent}`} />
              <span>{method.label}</span>
            </div>
          ))}
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-emerald-200">
            AI assistant can suggest fastest method, auto-apply coupons, and confirm via voice.
          </div>
        </div>
      </div>
    </section>
  );
}

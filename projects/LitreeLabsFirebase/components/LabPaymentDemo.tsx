'use client';

import { useState } from "react";

const methods = ["Cards", "Apple Pay / Google Pay", "PayPal", "Crypto (BTC/ETH)", "Bank"];

export function LabPaymentDemo() {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState("Pro");

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Payment gateway demo</h3>
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/80 hover:bg-emerald-500/20"
        >
          Launch modal
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-300">
        Shows animated tier selection + crypto QR. Wire this to Stripe/PayPal/Coinbase in production.
      </p>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur">
          <div className="w-[480px] max-w-[90vw] rounded-2xl border border-emerald-400/30 bg-slate-950/95 p-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Checkout</p>
                <p className="text-lg font-semibold text-white">Upgrade & pay</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 hover:border-emerald-300/60"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {["Starter", "Standard", "Pro", "Elite", "Ultimate"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    tier === t
                      ? "border-emerald-300 bg-emerald-500/10 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-300/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                <p className="text-slate-100 font-semibold">Payment methods</p>
                <div className="mt-2 space-y-2">
                  {methods.map((m) => (
                    <div key={m} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      {m}
                    </div>
                  ))}
                  <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-emerald-100">
                    AI can suggest fastest method & confirm via voice.
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                <p className="text-slate-100 font-semibold">Crypto QR</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-24 w-24 grid place-items-center rounded-lg border border-white/20 bg-black/40 text-slate-400 text-xs">
                    QR
                  </div>
                  <p className="text-emerald-200">Scan BTC/ETH · auto-detect network · live confirm.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

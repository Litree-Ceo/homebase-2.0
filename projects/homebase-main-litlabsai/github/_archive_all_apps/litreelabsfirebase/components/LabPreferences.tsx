'use client';

import { usePreferences } from "./PreferenceProvider";

export function LabPreferences() {
  const { intensity, particles, sound, setIntensity, setParticles, setSound } = usePreferences();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">User settings</p>
          <h3 className="text-xl font-semibold text-white">Performance & immersion toggles</h3>
          <p className="text-sm text-slate-300">
            Let visitors tune visuals and audio. These can map to saved preferences later.
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
          Client-side demo
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-200">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-slate-100 font-semibold">Animation intensity</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["low", "medium", "ultra"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setIntensity(lvl as typeof intensity)}
                className={`rounded-full border px-3 py-1 transition ${
                  intensity === lvl
                    ? "border-emerald-300 bg-emerald-500/10 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-300/50"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-slate-100 font-semibold">Particles</p>
          <div className="mt-2 flex items-center gap-2">
            <label className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={particles}
                onChange={(e) => setParticles(e.target.checked)}
                className="h-4 w-4 rounded border border-white/20 bg-black/40"
              />
              Enable background particles
            </label>
          </div>
          <p className="mt-2 text-xs text-emerald-200">
            When off, fall back to flat gradients for low-end devices.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-slate-100 font-semibold">Sound cues</p>
          <div className="mt-2 flex items-center gap-2">
            <label className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
                className="h-4 w-4 rounded border border-white/20 bg-black/40"
              />
              UI sound effects
            </label>
          </div>
          <p className="mt-2 text-xs text-emerald-200">
            Tie this to actual audio hooks later; default muted for accessibility.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        Current preference state: intensity={intensity}, particles={particles ? "on" : "off"}, sound={sound ? "on" : "off"}.
        Replace with persisted user settings when wiring to backend.
      </div>
    </section>
  );
}

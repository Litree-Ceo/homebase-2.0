'use client';

import { useEffect, useMemo, useState } from "react";

const themes = [
  { name: "Neon Grid", accent: "emerald", note: "Futuristic green glow" },
  { name: "Galaxy", accent: "purple", note: "Deep space gradient" },
  { name: "Cyber City", accent: "cyan", note: "Blue/cyan skyline" },
];

const widgetNames = ["Game Hub", "Music Universe", "Photos AI", "Marketplace", "AI Assistant", "Security"];

export function LabLiveInteractive() {
  const [theme, setTheme] = useState(themes[0]);
  const [density, setDensity] = useState<"cozy" | "compact">("cozy");
  const [immersion, setImmersion] = useState(false);
  const [widgets, setWidgets] = useState(widgetNames);

  // Load persisted widget order from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("labstudio_widgets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          setWidgets(parsed);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Persist widget order
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("labstudio_widgets", JSON.stringify(widgets));
  }, [widgets]);

  const accentClass = useMemo(() => {
    switch (theme.accent) {
      case "purple":
        return "from-purple-500/30 to-blue-500/20";
      case "cyan":
        return "from-cyan-500/30 to-emerald-500/20";
      default:
        return "from-emerald-500/30 to-lime-500/20";
    }
  }, [theme]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Live mini preview</p>
          <h3 className="text-xl font-semibold text-white">Play with layout toggles</h3>
          <p className="text-sm text-slate-300">
            Swap themes, density, and immersive mode. Full drag-and-drop can hook into this shell.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={() => setImmersion((v) => !v)}
            className={`rounded-full px-3 py-1 border text-emerald-200 transition ${
              immersion ? "border-emerald-300 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "border-white/15 bg-white/5"
            }`}
          >
            Immersive: {immersion ? "On" : "Off"}
          </button>
          <button
            onClick={() => setDensity(density === "cozy" ? "compact" : "cozy")}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-200 transition hover:border-emerald-300/60"
          >
            Density: {density}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t)}
            className={`rounded-full border px-3 py-1 transition ${
              theme.name === t.name
                ? "border-emerald-300 bg-emerald-500/10 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                : "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-300/50"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {widgets.map((w) => (
          <div
            key={w}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", w)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = e.dataTransfer.getData("text/plain");
              if (!from || from === w) return;
              const next = [...widgets];
              const fromIdx = next.indexOf(from);
              const toIdx = next.indexOf(w);
              if (fromIdx === -1 || toIdx === -1) return;
              next.splice(fromIdx, 1);
              next.splice(toIdx, 0, from);
              setWidgets(next);
            }}
            className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition cursor-grab ${
              density === "compact" ? "py-3" : "py-5"
            }`}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentClass} opacity-15`} />
            <div className="relative flex items-center justify-between">
              <p className="text-slate-100 font-semibold">{w}</p>
              <span className="text-xs text-emerald-200">Live</span>
            </div>
            <p className="relative mt-2 text-sm text-slate-300">
              {immersion ? "Immersive glow + particles preview." : "Standard neon tile preview."}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

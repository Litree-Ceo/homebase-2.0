'use client';

import FlashUIPreview from '../../components/FlashUIPreview';
import GodModePanel from '../../components/GodModePanel';
import Link from 'next/link';

export default function FlashPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-hc-purple/20 via-black to-black -z-10"></div>
      <div className="fixed top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-hc-bright-gold to-transparent opacity-50"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
        <div>
          <Link
            href="/"
            className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest mb-2 block"
          >
            ← Back to Studio
          </Link>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white via-gray-200 to-gray-500">
            FLASH <span className="text-hc-bright-gold">CORTEX</span> UI
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-2xl">
            Direct interface to NVIDIA GLM-4 and Llama 3 models, integrated with the
            LiTreeLab'Studio™ Design System.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-[10px] font-bold text-hc-purple uppercase tracking-[0.2em] mb-1">
            System Status
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
            <span className="font-mono text-sm">ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: God Mode */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h2 className="font-black uppercase tracking-widest text-sm text-gray-400">
              AI Operations
            </h2>
          </div>
          <GodModePanel />
        </section>

        {/* Right Column: Flash UI Kit */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h2 className="font-black uppercase tracking-widest text-sm text-gray-400">
              Interface Preview
            </h2>
          </div>
          <div className="sticky top-12">
            <FlashUIPreview />

            <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <h3 className="font-bold text-white mb-2">Quick Shortcuts</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 rounded-lg bg-black/40 hover:bg-hc-purple/20 border border-white/5 hover:border-hc-purple/50 transition-all text-left group">
                  <div className="text-xs text-gray-500 group-hover:text-hc-purple uppercase tracking-wider mb-1">
                    Generate
                  </div>
                  <div className="font-bold text-sm">Marketing Copy</div>
                </button>
                <button className="p-3 rounded-lg bg-black/40 hover:bg-hc-bright-gold/20 border border-white/5 hover:border-hc-bright-gold/50 transition-all text-left group">
                  <div className="text-xs text-gray-500 group-hover:text-hc-bright-gold uppercase tracking-wider mb-1">
                    Analyze
                  </div>
                  <div className="font-bold text-sm">Competitor Data</div>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

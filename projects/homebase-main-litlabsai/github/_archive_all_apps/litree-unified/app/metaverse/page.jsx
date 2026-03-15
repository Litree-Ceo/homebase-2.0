'use client';
import FlashNav from '../../components/FlashNav';

export default function MetaversePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-hc-purple/5 via-black to-black"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] bg-hc-bright-gold/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-hc-purple/5 rounded-full blur-[150px] pointer-events-none"></div>

      <FlashNav activePage="metaverse" />

      <div className="relative z-10 pt-24 max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-hc-purple/10 blur-[100px] pointer-events-none"></div>
          <h1 className="text-8xl font-black tracking-tighter mb-4 bg-linear-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
            METAVERSE
          </h1>
          <p className="text-hc-bright-gold font-black uppercase tracking-[0.8em] text-[10px] opacity-80">
            Beyond Physical Reality
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="flash-card group border-white/5 hover:border-hc-purple/40 overflow-hidden relative p-10!">
            <div className="absolute top-0 right-0 w-64 h-64 bg-hc-purple/5 blur-[80px] group-hover:bg-hc-purple/15 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl mb-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                🌐
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tighter">VIRTUAL WORLDS</h3>
              <p className="text-gray-400 mb-10 leading-relaxed font-medium">
                Enter high-fidelity 3D environments designed for social interaction, global events,
                and decentralized commerce.
              </p>
              <button className="flash-button-primary w-full py-5 text-sm tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(107,33,168,0.1)] group-hover:shadow-[0_0_40px_rgba(107,33,168,0.3)] transition-all">
                INITIALIZE LINK
              </button>
            </div>
          </div>

          <div className="flash-card group border-white/5 hover:border-hc-bright-gold/40 overflow-hidden relative p-10!">
            <div className="absolute top-0 right-0 w-64 h-64 bg-hc-bright-gold/5 blur-[80px] group-hover:bg-hc-bright-gold/15 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl mb-10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                👤
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tighter">AVATAR ENGINE</h3>
              <p className="text-gray-400 mb-10 leading-relaxed font-medium">
                Craft your unique digital identity with our proprietary procedural generation tools
                and NFT-backed wearables.
              </p>
              <button className="flash-button-secondary w-full py-5 text-sm tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(252,211,77,0.1)] group-hover:shadow-[0_0_40px_rgba(252,211,77,0.3)] transition-all">
                MODIFY GENETICS
              </button>
            </div>
          </div>
        </div>

        <div className="flash-preview-bg min-h-125 flex flex-col items-center justify-center p-16 text-center border-white/5 relative overflow-hidden group">
          <div className="flash-orb w-100 h-100 bg-hc-purple/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[120px]"></div>

          <div className="relative z-10">
            <div className="text-9xl mb-12 animate-float drop-shadow-[0_0_50px_rgba(107,33,168,0.3)]">
              🌌
            </div>
            <h2 className="text-5xl font-black mb-6 tracking-tighter">
              NEURAL RENDERER{' '}
              <span className="text-hc-bright-gold text-sm align-top ml-2 font-black uppercase tracking-widest bg-hc-bright-gold/10 px-2 py-1 rounded border border-hc-bright-gold/20">
                BETA
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-12 text-lg font-medium leading-relaxed">
              Experience ultra-low latency streaming with our proprietary WebGL engine featuring
              global illumination, spatial audio, and cross-platform persistence.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <button className="px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-hc-purple hover:text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] uppercase tracking-widest text-xs">
                LAUNCH VR SENSORIUM
              </button>
              <button className="px-12 py-5 border-2 border-white/10 text-white font-black rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all uppercase tracking-widest text-xs">
                BROWSER MODE
              </button>
            </div>
          </div>

          {/* Decorative HUD elements */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-px bg-linear-to-r from-transparent via-hc-purple to-transparent absolute top-1/4 animate-[scan_4s_linear_infinite]"></div>
            <div className="w-full h-px bg-linear-to-r from-transparent via-hc-bright-gold to-transparent absolute top-3/4 animate-[scan_6s_linear_infinite_reverse]"></div>
            <div className="absolute top-10 left-10 font-mono text-[8px] text-hc-purple tracking-[0.5em] vertical-text">
              COORD_X: 42.0012
            </div>
            <div className="absolute bottom-10 right-10 font-mono text-[8px] text-hc-bright-gold tracking-[0.5em] vertical-text">
              SYNC_STATE: OPTIMAL
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-200px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(600px);
            opacity: 0;
          }
        }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
}

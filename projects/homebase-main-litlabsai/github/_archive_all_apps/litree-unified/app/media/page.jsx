'use client';
import FlashNav from '../../components/FlashNav';

export default function MediaPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-gray-900 via-black to-black text-white">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-hc-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

      <FlashNav activePage="media" />

      <div className="pt-24 max-w-7xl mx-auto px-4 py-8">
        <header className="mb-16 text-center md:text-left relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-hc-purple/10 blur-3xl pointer-events-none"></div>
          <h1 className="text-7xl font-black tracking-tighter mb-4 bg-linear-to-r from-white via-white to-white/20 bg-clip-text text-transparent">
            MEDIA<span className="text-hc-purple">HUB</span>
          </h1>
          <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] ml-1">
            The Future of Digital Content
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <MediaCategory icon="🎵" title="Music" count="142 tracks" color="secondary" />
          <MediaCategory icon="🎥" title="Cinema" count="38 films" color="primary" />
          <MediaCategory icon="🎮" title="Arcade" count="12 experiences" color="secondary" />
        </div>

        <div className="flash-card border-hc-purple/30 bg-black/40 p-12! relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-hc-purple/10 blur-[120px] -mr-48 -mt-48 group-hover:bg-hc-purple/20 transition-all duration-1000"></div>

          <div className="flex items-center gap-3 mb-10 relative z-10">
            <div className="w-2 h-2 rounded-full bg-hc-purple animate-pulse"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-hc-purple">
              Now Streaming Global
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="w-64 h-64 rounded-4xl bg-linear-to-br from-hc-bright-gold/20 to-hc-purple/20 p-1 shadow-2xl group-hover:scale-105 group-hover:rotate-2 transition-all duration-700 relative">
              <div className="absolute inset-0 bg-hc-purple/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-full h-full rounded-[1.8rem] bg-black flex items-center justify-center text-8xl shadow-inner relative z-10">
                🎵
              </div>
            </div>

            <div className="flex-1 w-full text-center lg:text-left">
              <h3 className="text-6xl font-black tracking-tighter mb-4 bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent">
                NEON DREAMS
              </h3>
              <p className="text-hc-purple font-black uppercase tracking-[0.3em] text-xs mb-10 opacity-80">
                LiTreeLab'Studio™ Collective • 2026 Edition
              </p>

              <div className="space-y-6 max-w-2xl mx-auto lg:mx-0">
                <div className="bg-white/5 rounded-full h-2 w-full overflow-hidden border border-white/5 p-0.5">
                  <div className="bg-linear-to-r from-hc-bright-gold via-hc-purple to-hc-bright-gold h-full w-1/3 rounded-full animate-pulse shadow-[0_0_15px_rgba(107,33,168,0.5)]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">
                  <span>01:24</span>
                  <div className="flex gap-2 items-center">
                    <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                    <span>Remaining 02:21</span>
                  </div>
                  <span>03:45</span>
                </div>
              </div>

              <div className="flex gap-10 justify-center lg:justify-start mt-12">
                <MediaControl icon="⏮️" />
                <MediaControl icon="▶️" large primary />
                <MediaControl icon="⏭️" />
                <div className="w-px h-12 bg-white/5 mx-2 hidden md:block"></div>
                <MediaControl icon="🔊" />
                <MediaControl icon="📁" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-black tracking-tight uppercase mb-8">Recently Added</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-square rounded-2xl bg-white/5 border border-white/5 mb-4 flex items-center justify-center text-4xl group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
                  {i % 2 === 0 ? '🎬' : '🎵'}
                </div>
                <h4 className="font-black text-[10px] uppercase tracking-widest text-center group-hover:text-hc-bright-gold transition-colors">
                  Media_Asset_{i * 12}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaCategory({ icon, title, count, color }) {
  const glowColor =
    color === 'primary' ? 'group-hover:bg-hc-purple/5' : 'group-hover:bg-hc-bright-gold/5';
  const textColor = color === 'primary' ? 'text-hc-purple' : 'text-hc-bright-gold';
  const borderGlow =
    color === 'primary'
      ? 'group-hover:border-hc-purple/30'
      : 'group-hover:border-hc-bright-gold/30';

  return (
    <div
      className={`flash-card group border-white/5 ${borderGlow} transition-all duration-700 cursor-pointer overflow-hidden relative p-8!`}
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${glowColor}`}
      ></div>
      <div className="relative z-10">
        <div className="text-6xl mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 inline-block drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          {icon}
        </div>
        <h3 className="text-3xl font-black tracking-tighter mb-2">{title}</h3>
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${textColor}`}>{count}</p>
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
        <span className="text-xl">→</span>
      </div>
    </div>
  );
}

function MediaControl({ icon, large, primary }) {
  return (
    <button
      className={`
      ${large ? 'w-20 h-20 text-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'w-14 h-14 text-xl'}
      ${primary ? 'bg-white text-black hover:bg-hc-purple hover:shadow-[0_0_30px_rgba(107,33,168,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}
      rounded-[1.25rem] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 group
    `}
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
    </button>
  );
}

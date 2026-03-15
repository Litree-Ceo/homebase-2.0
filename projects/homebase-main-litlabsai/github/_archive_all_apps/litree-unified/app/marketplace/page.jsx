'use client';
import FlashNav from '../../components/FlashNav';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-gray-900 via-black to-black text-white">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-hc-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

      <FlashNav activePage="marketplace" />

      <div className="pt-24 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-hc-purple/10 blur-3xl pointer-events-none"></div>
          <div>
            <h1 className="text-7xl font-black tracking-tighter mb-4 bg-linear-to-r from-white via-white to-white/20 bg-clip-text text-transparent">
              MARKET<span className="text-hc-purple">PLACE</span>
            </h1>
            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] ml-1">
              The Premium Asset Exchange
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-64 relative group">
              <input
                type="text"
                placeholder="SEARCH ASSETS..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-widest focus:outline-none focus:border-hc-purple/40 focus:bg-white/10 transition-all"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                🔍
              </span>
            </div>
            <button className="flash-button-primary py-4! px-8! text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(107,33,168,0.1)] hover:shadow-[0_0_40px_rgba(107,33,168,0.3)]">
              MINT ASSET
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {['ALL ASSETS', 'ART', 'SKINS', 'AVATARS', 'LAND', 'RARE'].map((tab, i) => (
            <button
              key={tab}
              className={`shrink-0 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-white text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <NFTCard title="Neon Genesis #01" price="4.20" icon="🎨" type="ART" rarity="LEGENDARY" />
          <NFTCard title="Hyper-Suit V2" price="1.50" icon="🛡️" type="SKIN" rarity="EPIC" />
          <NFTCard title="Void-Walker" price="2.30" icon="👤" type="AVATAR" rarity="RARE" />
          <NFTCard title="Sector 7 Plot" price="15.0" icon="🏗️" type="LAND" rarity="UNIQUE" />
          <NFTCard title="Pulse-Wave" price="0.80" icon="🎵" type="AUDIO" rarity="COMMON" />
          <NFTCard title="Gravity-Boots" price="1.20" icon="🥾" type="GEAR" rarity="RARE" />
          <NFTCard title="Data-Shard" price="0.50" icon="💾" type="MISC" rarity="COMMON" />
          <NFTCard title="Star-Core" price="10.0" icon="🌟" type="RARE" rarity="LEGENDARY" />
        </div>
        <div className="mt-20 flash-card border-white/5 bg-linear-to-br from-hc-purple/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-10 p-12! overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-hc-purple/10 blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-4xl font-black tracking-tighter mb-4">WANT TO SELL YOUR OWN?</h2>
            <p className="text-gray-400 font-medium leading-relaxed">
              Join the elite creators of LiTreeLab'Studio™ and start monetizing your digital assets
              today. Our cross-metaverse compatibility ensures your creations reach every sector.
            </p>
          </div>
          <button className="relative z-10 px-12 py-6 bg-white text-black font-black rounded-2xl hover:bg-hc-purple hover:text-white transition-all hover:scale-105 active:scale-95 shadow-2xl uppercase tracking-[0.2em] text-xs">
            BECOME A CREATOR
          </button>
        </div>
      </div>
    </div>
  );
}

function NFTCard({ title, price, icon, type, rarity }) {
  const rarityColor =
    rarity === 'LEGENDARY'
      ? 'text-yellow-500 bg-yellow-500/10'
      : rarity === 'EPIC'
        ? 'text-purple-500 bg-purple-500/10'
        : rarity === 'RARE'
          ? 'text-hc-bright-gold bg-hc-bright-gold/10'
          : 'text-gray-400 bg-white/5';

  return (
    <div className="flash-card p-0! overflow-hidden border-white/5 group hover:border-hc-purple/40 transition-all duration-500 relative">
      <div className="aspect-4/5 relative flex items-center justify-center text-8xl bg-black/40 group-hover:bg-hc-purple/5 transition-colors duration-700">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,rgba(107,33,168,0.15)_0%,transparent_70%)]"></div>
        <span className="relative z-10 group-hover:scale-125 group-hover:rotate-6 transition-all duration-700 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          {icon}
        </span>

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black tracking-[0.2em] text-gray-400 uppercase">
            {type}
          </div>
          <div
            className={`px-2 py-1 rounded-md backdrop-blur-md border border-white/5 text-[8px] font-black tracking-[0.2em] uppercase ${rarityColor}`}
          >
            {rarity}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <span className="text-xl">➕</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-black/40 backdrop-blur-md relative z-10 border-t border-white/5">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-2">
            <h3 className="font-black text-sm tracking-tight mb-1 group-hover:text-hc-purple transition-colors truncate uppercase">
              {title}
            </h3>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Reserve Price
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-white">
              {price}
              <span className="text-hc-bright-gold text-[10px] ml-1">LIT</span>
            </p>
          </div>
        </div>

        <button className="w-full py-4 bg-white/5 hover:bg-white text-gray-400 hover:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-xl transition-all duration-500 border border-white/5 group-hover:border-white/20">
          PLACE A BID
        </button>
      </div>
    </div>
  );
}

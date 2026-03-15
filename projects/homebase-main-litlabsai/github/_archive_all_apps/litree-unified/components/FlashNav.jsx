'use client';
import Link from 'next/link';
import { Bell, User } from 'lucide-react';

export default function FlashNav({ activePage }) {
  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl border-b border-white/10"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.03]"></div>

      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center relative z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hc-purple via-hc-gold to-hc-dark-gold p-[1px] shadow-2xl shadow-hc-purple/20 transition-transform group-hover:scale-110">
            <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center">
              <span className="text-xl font-black text-white">L</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter leading-none text-white group-hover:text-hc-bright-gold transition-colors">
              LiTreeLab'Studio™
            </span>
            <span className="text-[8px] font-black tracking-[0.4em] text-hc-bright-gold opacity-60 uppercase">
              Ecosystem
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          <NavLink href="/dashboard" active={activePage === 'home'}>
            Home
          </NavLink>
          <NavLink href="/social" active={activePage === 'social'}>
            Social
          </NavLink>
          <NavLink href="/metaverse" active={activePage === 'metaverse'}>
            Metaverse
          </NavLink>
          <NavLink href="/marketplace" active={activePage === 'marketplace'}>
            Marketplace
          </NavLink>
          <NavLink href="/media" active={activePage === 'media'}>
            Media
          </NavLink>
          <NavLink href="/blog" active={activePage === 'blog'}>
            Blog
          </NavLink>
          <NavLink href="/cortex" active={activePage === 'cortex'}>
            Cortex
          </NavLink>
          <NavLink href="/builder" active={activePage === 'builder'}>
            Builder
          </NavLink>
        </div>

        <div className="flex gap-4 items-center">
          <div className="hidden sm:flex gap-2">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <Bell size={18} />
            </Link>
          </div>

          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-hc-purple/30 hover:bg-hc-purple/5 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-hc-purple to-hc-dark-purple p-[1px] shadow-lg group-hover:shadow-hc-purple/20">
              <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center overflow-hidden">
                <User
                  size={18}
                  className="text-gray-400 group-hover:text-white transition-colors"
                />
              </div>
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                Member
              </span>
              <span className="text-[8px] font-bold text-hc-bright-gold uppercase tracking-widest opacity-60">
                Verified
              </span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, active }) {
  return (
    <Link
      href={href}
      className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative group/link ${
        active
        ? 'text-white bg-linear-to-r from-hc-purple/40 to-hc-gold/10 border border-white/10 shadow-lg'
          : 'text-gray-500 hover:text-white border border-transparent'
      }`}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-hc-bright-gold rounded-full shadow-[0_0_10px_var(--hc-bright-gold)]"></span>
      )}
    </Link>
  );
}

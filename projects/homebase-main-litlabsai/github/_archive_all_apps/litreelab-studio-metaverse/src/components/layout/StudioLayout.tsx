'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Box, 
  Zap, 
  Settings, 
  Folder, 
  Users, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Bell,
  Menu
} from 'lucide-react';
import { useFirebase } from '@/lib/firebase';

const sidebarItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Metaverse', href: '/world', icon: Box },
  { label: 'ProfitPilot', href: '/finance', icon: Zap },
  { label: 'Files', href: '/files', icon: Folder },
  { label: 'Community', href: '/social', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function StudioSidebar({ isCollapsed, toggleCollapse }: { isCollapsed: boolean; toggleCollapse: () => void }) {
  const pathname = usePathname();
  const { logout } = useFirebase();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed top-0 left-0 h-full bg-black/50 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-70'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
        {!isCollapsed && (
          <span className="font-display font-bold text-xl tracking-wider text-transparent bg-clip-text bg-linear-to-r from-lab-purple-400 to-lab-blue-400">
            LITLABS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {sidebarItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative ${
                isActive
                  ? 'bg-lab-purple-500/20 text-white border border-lab-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-lab-purple-400' : ''}`} />
              
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-14 bg-black border border-white/10 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium">Sign Out</span>}
        </button>
        
        <button
          onClick={toggleCollapse}
          className="mt-4 flex items-center justify-center w-full h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}

export function StudioHeader({ isCollapsed }: { isCollapsed: boolean }) {
  const { user } = useFirebase();

  return (
    <header 
      className={`fixed top-0 right-0 z-30 h-16 bg-lab-dark-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 transition-all duration-300 ${
        isCollapsed ? 'left-20' : 'left-[280px]'
      }`}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search assets, tools, or commands..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-lab-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* ProfitPilot Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-lab-green-500/10 border border-lab-green-500/20">
          <div className="w-2 h-2 rounded-full bg-lab-green-500 animate-pulse" />
          <span className="text-xs font-medium text-lab-green-400">ProfitPilot: +12.4%</span>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-black" />
        </button>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-white">{user?.displayName || 'Creator'}</div>
            <div className="text-xs text-gray-400">Level 5</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 p-0.5">
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`} 
              alt="Profile" 
              className="w-full h-full rounded-[7px] bg-black"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

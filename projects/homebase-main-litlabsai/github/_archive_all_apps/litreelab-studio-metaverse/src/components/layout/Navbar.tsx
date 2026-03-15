'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, LayoutDashboard, Globe, Sparkles, User, Settings, Power } from 'lucide-react';
import { useAgentStore } from '@/lib/store';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Studio', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Metaverse', href: '/world', icon: Globe },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { showAgent, toggleAgent } = useAgentStore();
  const pathname = usePathname();

  // Don't show Navbar on login page
  if (pathname === '/login') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-lab-purple-500 to-lab-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">
              LiTreeLab <span className="text-lab-green-400">Studio™</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/70 
                           hover:text-white hover:bg-white/10 transition-all"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* ProfitPilot Status */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-lab-green-500/20 border border-lab-green-500/30"
              role="status"
              aria-live="polite"
            >
              <div className="w-2 h-2 rounded-full bg-lab-green-400 live-dot" />
              <span className="text-xs text-lab-green-400 font-semibold">ProfitPilot Active</span>
            </div>

            {/* Settings & Profile */}
            <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
                
                {/* Settings Dropdown */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-xl border border-white/10 z-50"
                        >
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Preferences</div>
                            <button 
                                onClick={toggleAgent}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    Agent Zero
                                </span>
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${showAgent ? 'bg-purple-600' : 'bg-gray-600'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${showAgent ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </button>
                            <div className="h-px bg-white/10 my-2" />
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/10 rounded-md transition-colors">
                                <Power className="w-4 h-4" />
                                Sign Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 
                             hover:text-white hover:bg-white/10 transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

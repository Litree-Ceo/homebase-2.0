import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder user data and signout function - will be adapted to the real auth context
const user = {
  photoURL: '/default-avatar.png',
  displayName: 'Sovereign',
};
const handleSignOut = () => {
  console.log('Signing out...');
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 bg-black/50 backdrop-blur-lg border-b border-white/10">
      <div>{/* Logo or other nav items here */}</div>

      {/* Mobile Menu Button - FORCE SHOW ON SMALL SCREENS */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 text-white z-[110]"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 relative flex flex-col justify-between">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-white block"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-full h-0.5 bg-white block"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-white block"
          />
        </div>
      </button>

      {/* Mobile Drawer with Profile Integration */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 top-20 bg-black/95 backdrop-blur-3xl z-40 lg:hidden overflow-y-auto pb-32"
          >
            <div className="p-6 space-y-6">
              {/* Profile Card */}
              {user && (
                <div className="glass-card rounded-2xl p-6 border border-white/10 bg-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={user.photoURL || '/default-avatar.png'}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-lab-purple-500"
                    />
                    <div>
                      <h3 className="font-bold text-white">{user.displayName || 'Sovereign'}</h3>
                      <p className="text-xs text-lab-green-400 uppercase tracking-wider">Rank: Architect</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-black/40 rounded-lg p-2">
                      <div className="text-xs text-white/50 uppercase">XP</div>
                      <div className="font-bold text-electric-cyan">12,450</div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-2">
                      <div className="text-xs text-white/50 uppercase">Capital</div>
                      <div className="font-bold text-lab-purple-400">$8.2K</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-2">
                {[
                  { label: 'Command Deck', href: '/dashboard', icon: '⌘' },
                  { label: 'Metaverse', href: '/world', icon: '🌐' },
                  { label: 'Arcade', href: '/arcade', icon: '🎮' },
                  { label: 'Cinema', href: '/media', icon: '🎬' },
                  { label: 'Market', href: '/marketplace', icon: '💎' },
                  { label: 'Finance', href: '/finance', icon: '📈' },
                  { label: 'Govern', href: '/govern', icon: '⚖️' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-lab-purple-500/50 transition-all"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-bold text-white uppercase tracking-wider">{item.label}</span>
                    <span className="ml-auto text-white/30">→</span>
                  </a>
                ))}
              </div>

              {/* Sign Out */}
              {user && (
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all"
                >
                  Deactivate Session
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
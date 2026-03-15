'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import Login from '@/components/Login';
import Signup from '@/components/Signup';
import Notifications from '@/components/Notifications';
import Feed from '@/components/social/SocialFeed';
import { useAuth } from '@/lib/auth';
import { neonTreeAnimation } from '@/neonTreeAnimation';

// Dynamic import for Lottie player to prevent SSR issues
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-black/30 rounded animate-pulse" />,
});

export default function HomeBase() {
  const { user, logout } = useAuth();
  const [legacyUser] = useState(null);

  // DEV MODE: Bypass authentication for local development
  const isDev = process.env.NODE_ENV === 'development';
  const mockUser = isDev ? { uid: 'dev-user', email: 'dev@litlabs.local' } : null;
  const effectiveUser = isDev ? mockUser : legacyUser || user;

  if (!effectiveUser) {
    return (
      <main className="min-h-screen bg-[var(--honey-dark)] gradient-animate bg-noise text-amber-50 relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-200/80 mb-2">Welcome to</p>
            <h1 className="text-4xl md:text-5xl font-black text-gradient mb-4">HomeBase</h1>
            <p className="text-amber-100/60 max-w-md mx-auto">
              Your premium social hub powered by LITLABS
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <Login />
            <Signup />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--honey-dark)] gradient-animate bg-noise text-amber-50 relative">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-lime-400/6 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Player
                autoplay
                loop
                src={neonTreeAnimation}
                style={{
                  height: '120px',
                  width: '120px',
                  filter: 'drop-shadow(0 0 30px rgba(251,191,36,0.5))',
                }}
              />
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/60 mb-2">Hive feed</p>
          <h1 className="text-4xl font-black text-gradient mb-2">
            Welcome back, {(effectiveUser as any)?.displayName ?? effectiveUser.email ?? 'member'}
          </h1>
          <p className="text-sm text-amber-100/70 max-w-md mx-auto">
            Post updates, react, and drop by the metaverse whenever inspiration hits.
          </p>
          {isDev && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-lime-200 border border-lime-400/30">
              <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" /> Development Mode
            </div>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.4fr,0.9fr]">
          <Feed />
          <Notifications />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/metaverse" className="neon-button">
            Metaverse
          </Link>
          <Link href="/profile" className="neon-button">
            Profile
          </Link>
          <button
            onClick={() => logout()}
            className="neon-button !border-red-500/50 !text-red-400 hover:!bg-red-500/20 hover:!shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}

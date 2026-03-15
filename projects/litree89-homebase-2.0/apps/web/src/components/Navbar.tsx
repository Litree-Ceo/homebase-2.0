'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full backdrop-blur-md bg-honeycomb-black/30 border-b border-honeycomb-gold/20 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-black honeycomb-text">🏠 LiTreeLab</div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <div className="hidden md:flex gap-8">
            <Link
              href="/explore"
              className="text-honeycomb-gold hover:text-honeycomb-brightGold transition"
            >
              🔍 Explore
            </Link>
            <Link
              href="/friends"
              className="text-honeycomb-gold hover:text-honeycomb-brightGold transition"
            >
              👥 Friends
            </Link>
            <Link
              href="/bots"
              className="text-honeycomb-gold hover:text-honeycomb-brightGold transition"
            >
              🤖 Bots
            </Link>
            <Link
              href="/messages"
              className="text-honeycomb-gold hover:text-honeycomb-brightGold transition"
            >
              💬 Messages
            </Link>
          </div>
        )}

        {/* User Menu */}
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="text-honeycomb-gold hover:text-honeycomb-brightGold">
                👤 {user?.name || 'Profile'}
              </Link>
              <button
                onClick={logout}
                className="honeycomb-border px-4 py-2 text-sm text-honeycomb-gold border border-honeycomb-gold rounded-full hover:bg-honeycomb-gold/10"
              >
                Logout
              </button>
            </>
          ) : (
            <button className="honeycomb-cell px-6 py-2 bg-honeycomb-brightGold text-honeycomb-black font-bold rounded-full hover:shadow-lg">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

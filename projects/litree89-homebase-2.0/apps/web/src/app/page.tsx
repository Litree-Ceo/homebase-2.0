'use client';

/**
 * LiTreeLab'Studio™ - Main Social Feed (Facebook-like)
 * @workspace Public-facing social platform home page
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import SocialFeed from '@/components/social/SocialFeed';
import { PostComposer } from '@/components/social/PostComposer';
import NotificationsWidget from '@/components/Notifications';
import TrendingWidget from '@/components/TrendingWidget';
import FriendsWidget from '@/components/FriendsWidget';

export default function Home() {
  const { user, isAuthenticated, login } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // If not authenticated, show marketing page
  if (!isAuthenticated) {
    return (
      <div className="honeycomb-bg min-h-screen">
        {/* Header */}
        <header className="fixed top-0 w-full backdrop-blur-md border-b border-honeycomb-gold/20 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-2xl font-black honeycomb-text">🏠 LiTreeLab'Studio™</div>
            <nav className="hidden md:flex gap-8 text-sm">
              <a
                href="#features"
                className="text-honeycomb-gold hover:text-honeycomb-brightGold transition"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-honeycomb-gold hover:text-honeycomb-brightGold transition"
              >
                Pricing
              </a>
              <a
                href="#community"
                className="text-honeycomb-gold hover:text-honeycomb-brightGold transition"
              >
                Community
              </a>
            </nav>
            <button
              onClick={login}
              className="honeycomb-cell px-6 py-2 bg-honeycomb-brightGold text-honeycomb-black font-bold rounded-full hover:shadow-lg hover:shadow-honeycomb-gold/50 transition"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight honeycomb-float">
              Connect. Create. <span className="honeycomb-text">Earn</span>
            </h1>
            <p className="text-xl text-honeycomb-gold">
              LiTreeLab'Studio™ is the all-in-one platform for creators, bots, and communities.
              Share content, manage bots, monetize your audience - all in one place.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={login}
                className="honeycomb-cell px-8 py-3 bg-honeycomb-brightGold text-honeycomb-black font-bold rounded-full hover:shadow-lg hover:shadow-honeycomb-gold/50 transition"
              >
                Get Started Free
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="honeycomb-border px-8 py-3 border-2 border-honeycomb-purple text-honeycomb-gold font-bold rounded-full hover:bg-honeycomb-purple/10 transition"
              >
                Pro Features
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-black/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-16 text-center">What You Can Do</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎬',
                  title: 'Share Everything',
                  desc: 'Posts, photos, videos, and ideas with your followers',
                },
                {
                  icon: '🤖',
                  title: 'Manage Bots',
                  desc: 'Launch & control your AI agents from Studio HQ',
                },
                {
                  icon: '💰',
                  title: 'Earn Money',
                  desc: 'Monetize content, subscriptions, and bot services',
                },
                {
                  icon: '👥',
                  title: 'Build Community',
                  desc: 'Connect with followers, friends, and collaborators',
                },
                {
                  icon: '📊',
                  title: 'Track Analytics',
                  desc: 'See what works with detailed performance metrics',
                },
                {
                  icon: '🎨',
                  title: 'Customize Everything',
                  desc: 'Design your space exactly how you want it',
                },
              ].map(item => (
                <div
                  key={item.title}
                  className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-purple-200">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-16 text-center">Choose Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  tier: 'Free',
                  price: '$0',
                  color: 'from-purple-400 to-purple-600',
                  features: [
                    '✓ Create posts & stories',
                    '✓ Up to 5 bots',
                    '✓ Basic analytics',
                    '✓ 1 GB storage',
                    '✗ Monetization features',
                  ],
                },
                {
                  tier: 'Pro',
                  price: '$29.99/mo',
                  color: 'from-amber-400 to-amber-600',
                  features: [
                    '✓ All Free features',
                    '✓ Unlimited bots',
                    '✓ Pro analytics',
                    '✓ 100 GB storage',
                    '✓ Monetization tools',
                    '✓ Priority support',
                  ],
                  popular: true,
                },
                {
                  tier: 'Studio (GodMode)',
                  price: '$99.99/mo',
                  color: 'from-purple-400 to-pink-600',
                  features: [
                    '✓ All Pro features',
                    '✓ White-label studio',
                    '✓ Custom integrations',
                    '✓ Unlimited storage',
                    '✓ API access',
                    '✓ Dedicated manager',
                  ],
                },
              ].map(plan => (
                <div
                  key={plan.tier}
                  className={`relative rounded-2xl border-2 p-8 ${
                    plan.popular
                      ? `bg-gradient-to-br ${plan.color} border-amber-400`
                      : 'border-purple-500/20 bg-black/40'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black px-4 py-1 rounded-full text-amber-400 text-xs font-bold">
                      MOST POPULAR
                    </div>
                  )}
                  <h3
                    className={`text-2xl font-black mb-2 ${plan.popular ? 'text-black' : 'text-white'}`}
                  >
                    {plan.tier}
                  </h3>
                  <div
                    className={`text-3xl font-black mb-6 ${plan.popular ? 'text-black' : 'text-amber-400'}`}
                  >
                    {plan.price}
                  </div>
                  <ul
                    className={`space-y-3 mb-8 text-sm ${plan.popular ? 'text-black' : 'text-purple-200'}`}
                  >
                    {plan.features.map(f => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      login();
                      setShowPaymentModal(true);
                    }}
                    className={`w-full py-3 rounded-lg font-bold transition ${
                      plan.popular
                        ? 'bg-black text-amber-400 hover:bg-black/80'
                        : 'bg-purple-600/50 text-white hover:bg-purple-600'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/20 py-12 px-4 bg-black/30">
          <div className="max-w-6xl mx-auto text-center text-purple-300 text-sm">
            <p>© 2026 LiTreeLab'Studio™ All rights reserved</p>
            <div className="flex justify-center gap-6 mt-4">
              <button className="hover:text-amber-400 transition" aria-label="Privacy Policy">
                Privacy
              </button>
              <button className="hover:text-amber-400 transition" aria-label="Terms of Service">
                Terms
              </button>
              <button className="hover:text-amber-400 transition" aria-label="Contact Us">
                Contact
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated user - show the actual Facebook-like social platform
  return (
    <div className="honeycomb-bg min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 py-6 px-4">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden md:block space-y-4">
          <div className="honeycomb-cell honeycomb-glow p-6 border border-honeycomb-gold/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-honeycomb-gold to-honeycomb-purple flex items-center justify-center">
                <span className="text-white font-black">👤</span>
              </div>
              <div>
                <div className="font-bold text-white">{user?.displayName || 'Creator'}</div>
                <div className="text-xs text-honeycomb-gold">@{user?.username || 'user'}</div>
              </div>
            </div>
            <nav className="space-y-3">
              <Link
                href="/"
                className="block px-4 py-3 rounded-lg honeycomb-pulse text-white font-semibold"
              >
                🏠 Feed
              </Link>
              <Link
                href="/friends"
                className="block px-4 py-3 rounded-lg text-honeycomb-gold hover:bg-honeycomb-purple/30"
              >
                👥 Friends
              </Link>
              <Link
                href="/explore"
                className="block px-4 py-3 rounded-lg text-honeycomb-gold hover:bg-honeycomb-purple/30"
              >
                🔍 Explore
              </Link>
              <Link
                href={`/profile/${user?.username}`}
                className="block px-4 py-3 rounded-lg text-honeycomb-gold hover:bg-honeycomb-purple/30"
              >
                📝 My Profile
              </Link>
              <Link
                href="/bots"
                className="block px-4 py-3 rounded-lg text-honeycomb-gold hover:bg-honeycomb-purple/30"
              >
                🤖 My Bots
              </Link>
              <Link
                href="/messages"
                className="block px-4 py-3 rounded-lg text-honeycomb-gold hover:bg-honeycomb-purple/30"
              >
                💬 Messages
              </Link>
              <Link
                href="/addons"
                className="block px-4 py-3 rounded-lg text-honeycomb-gold hover:bg-honeycomb-purple/30"
              >
                📺 Kodi Addons
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-3 rounded-lg text-honeycomb-gold hover:bg-honeycomb-purple/30"
              >
                ⚙️ Settings
              </Link>
            </nav>
          </div>
          <NotificationsWidget />
        </aside>

        {/* Center Feed - Main Content */}
        <div className="md:col-span-1 space-y-6">
          {/* Post Composer */}
          <PostComposer userId="user-default" onPostCreated={() => globalThis.location.reload()} />

          {/* Social Feed */}
          <SocialFeed feedType="home" />
        </div>

        {/* Right Sidebar - Widgets */}
        <aside className="hidden lg:block space-y-4">
          <TrendingWidget />
          <FriendsWidget />

          {/* Premium Upgrade Card */}
          {user?.tier === 'free' && (
            <div className="honeycomb-cell honeycomb-float p-6 text-white border border-honeycomb-gold/20">
              <h3 className="text-lg font-black mb-2 honeycomb-accent">
                ✨ Pro Features Available
              </h3>
              <p className="text-sm text-honeycomb-gold mb-4">
                Unlock monetization, unlimited bots & advanced analytics
              </p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-2 honeycomb-glow bg-honeycomb-darkGold rounded-lg font-bold hover:bg-honeycomb-gold text-honeycomb-black transition-all"
              >
                Learn More
              </button>
              <p className="text-xs text-honeycomb-gold/70 mt-2 text-center">
                When you're ready to grow
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

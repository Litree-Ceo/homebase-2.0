'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authInstance = auth;
      if (!authInstance) throw new Error('Auth not initialized');
      if (mode === 'login') {
        await signInWithEmailAndPassword(authInstance, email, password);
      } else {
        await createUserWithEmailAndPassword(authInstance, email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const authInstance = auth;
      if (!authInstance) throw new Error('Auth not initialized');
      const result = await signInWithPopup(authInstance, provider);
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Google auth failed');
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const authInstance = auth;
      if (!authInstance) throw new Error('Auth not initialized');
      const result = await signInWithPopup(authInstance, provider);
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Apple auth failed');
      setLoading(false);
    }
  };

  const handleMicrosoftAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new OAuthProvider('microsoft.com');
      provider.addScope('email');
      provider.addScope('profile');
      const authInstance = auth;
      if (!authInstance) throw new Error('Auth not initialized');
      const result = await signInWithPopup(authInstance, provider);
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Microsoft auth failed');
      setLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      const authInstance = auth;
      if (!authInstance) throw new Error('Auth not initialized');
      const result = await signInWithPopup(authInstance, provider);
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'GitHub auth failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-[#ff006e]/20 via-[#8338ec]/20 to-[#3a86ff]/20 rounded-full blur-3xl" />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block animate-spin">
              <div className="text-5xl">⚡</div>
            </div>
            <p className="text-lg text-gray-300">Completing sign up...</p>
          </div>
        </div>
      )}

      <div className="min-h-screen flex">
        {/* LEFT SIDE - INFO */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-12">
          <div className="max-w-md space-y-8">
            <Link href="/" className="inline-block">
              <div className="text-4xl font-black bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] bg-clip-text text-transparent">
                ⚡ LitLabs
              </div>
            </Link>

            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-5xl font-black">Join 2,800+ creators scaling their business</h1>
                <p className="text-lg text-gray-300">Your AI marketing team is ready. Let&apos;s go.</p>
              </div>

              {/* Benefits */}
              <div className="space-y-4 pt-8">
                {[
                  { icon: '🤖', text: 'AI handles your DMs, content, & bookings' },
                  { icon: '⚡', text: 'Save 20+ hours every week' },
                  { icon: '💰', text: '3-10x more revenue in 90 days' },
                  { icon: '🎮', text: 'Gamified dashboard keeps you motivated' },
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">{benefit.icon}</span>
                    <p className="text-gray-200 text-lg">{benefit.text}</p>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="pt-8 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-4">Trusted by beauty pros, creators & agencies</p>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-black text-[#ff006e]">2,847</p>
                    <p className="text-xs text-gray-400">Active users</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#8338ec]">$89M+</p>
                    <p className="text-xs text-gray-400">Revenue booked</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#3a86ff]">4.9★</p>
                    <p className="text-xs text-gray-400">User rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - AUTH FORM */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-8">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-4">
              <Link href="/" className="inline-block">
                <div className="text-3xl font-black bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] bg-clip-text text-transparent">
                  ⚡ LitLabs
                </div>
              </Link>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 rounded-lg font-bold transition ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 rounded-lg font-bold transition ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Log In
              </button>
            </div>

            {/* OAuth buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span>🔵</span> Continue with Google
              </button>
              <button
                onClick={handleAppleAuth}
                disabled={loading}
                className="w-full py-3 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span>🍎</span> Continue with Apple
              </button>
              <button
                onClick={handleMicrosoftAuth}
                disabled={loading}
                className="w-full py-3 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span>🟦</span> Continue with Microsoft
              </button>
              <button
                onClick={handleGitHubAuth}
                disabled={loading}
                className="w-full py-3 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span>⬛</span> Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-gray-400">Or with email</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 focus:bg-white/10 focus:border-white/40 transition outline-none text-white placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 focus:bg-white/10 focus:border-white/40 transition outline-none text-white placeholder:text-gray-500"
                  required
                />
              </div>

              {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] text-white font-bold text-lg hover:brightness-110 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Footer */}
            <div className="space-y-3 pt-4 border-t border-white/10 text-center text-sm text-gray-400">
              <p>🔒 Secure. No spam. No setup fees.</p>
              <p>
                By signing up, you agree to our{' '}
                <Link href="/terms-of-service" className="text-[#ff006e] hover:text-[#ff006e]/80">
                  terms
                </Link>
                {' '}and{' '}
                <Link href="/privacy-policy" className="text-[#ff006e] hover:text-[#ff006e]/80">
                  privacy policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

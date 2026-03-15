'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // For signup
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!auth) {
      setError('Authentication service is not initialized. Please check configuration.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with username if provided
        if (username) {
          await updateProfile(userCredential.user, {
            displayName: username,
          });
        }
      }
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    if (!auth) {
      setError('Authentication service is not initialized.');
      setLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err) {
      console.error('Google auth error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-gray-900 via-black to-black text-white flex items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-hc-purple/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-hc-bright-gold/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <Link href="/" className="block text-center mb-12">
          <h1 className="text-5xl font-black tracking-tighter bg-linear-to-r from-hc-purple via-white to-hc-bright-gold bg-clip-text text-transparent">
            LiTreeLab'Studio™
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 mt-2">
            Access the Core
          </p>
        </Link>

        <div className="flash-card border-white/5 bg-black/40 backdrop-blur-2xl p-8!">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${
                isLogin
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${
                !isLogin
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  Identity
                </label>
                <input
                  type="text"
                  placeholder="USERNAME"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/5 focus:border-hc-purple/50 focus:bg-white/10 focus:outline-none transition-all font-bold placeholder:text-gray-700"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Channel
              </label>
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/5 focus:border-hc-purple/50 focus:bg-white/10 focus:outline-none transition-all font-bold placeholder:text-gray-700"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Access Key
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/5 focus:border-hc-purple/50 focus:bg-white/10 focus:outline-none transition-all font-bold placeholder:text-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 mt-4 flash-button-primary text-sm tracking-[0.2em] shadow-[0_0_30px_rgba(107,33,168,0.1)]"
            >
              {loading
                ? 'SYNCHRONIZING...'
                : isLogin
                  ? 'INITIALIZE SESSION'
                  : 'CREATE CORE IDENTITY'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative">
                <span className="bg-black/40 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
                  Secure Gateway
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest group"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google Authority
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

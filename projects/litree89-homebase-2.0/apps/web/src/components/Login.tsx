'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const { login, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      await login();
    } catch (err: any) {
      console.error(err);
      if (err.errorMessage?.includes('AADB2C90118')) {
        setError("To reset your password, please use the 'Forgot Password' link.");
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card w-full max-w-md p-8">
      <h1 className="mb-3 text-2xl font-bold text-gradient">Welcome back</h1>
      <p className="mb-6 text-sm text-amber-100/70">
        Sign in to drop posts, like friends, and stay synced with the hive.
      </p>
      <p className="mb-6 text-xs text-amber-100/50">
        Click below to sign in with your Microsoft account or Azure AD B2C credentials.
      </p>
      {error && (
        <p className="mt-4 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        onClick={handleLogin}
        disabled={loading || isLoading}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black shadow-glow transition-all hover:shadow-glow-lg hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading || isLoading ? 'Signing in…' : 'Sign In with Microsoft'}
      </button>
    </div>
  );
}

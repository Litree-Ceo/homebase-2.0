'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function Signup() {
  const { login, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      // Azure AD B2C handles signup through the same login flow
      // The B2C policy (B2C_1_signupsignin) includes both sign-in and sign-up
      await login();
    } catch (err: any) {
      console.error(err);
      setError('Unable to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card w-full max-w-md p-8">
      <h1 className="mb-3 text-2xl font-bold text-gradient">Join the hive</h1>
      <p className="mb-6 text-sm text-amber-100/70">
        Create an account to post, react, and stroll through the metaverse.
      </p>
      <p className="mb-6 text-xs text-amber-100/50">
        Click below to create your account with Microsoft. You'll be guided through the registration
        process.
      </p>
      {error && (
        <p className="mt-4 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        onClick={handleSignup}
        disabled={loading || isLoading}
        className="neon-button mt-6 w-full"
      >
        {loading || isLoading ? 'Loading…' : 'Sign Up with Microsoft'}
      </button>
    </div>
  );
}

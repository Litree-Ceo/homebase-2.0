import { useState } from 'react';
import { supabase } from '../../lib/auth';

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // Your page to handle the password reset form
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.error_description || err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-md p-8 text-center bg-gray-800 rounded-lg shadow-lg border border-white/10">
          <h1 className="text-xl font-bold text-white">Check your email</h1>
          <p className="mt-4 text-gray-300">A password reset link has been sent to <strong>{email}</strong> if an account with that email exists.</p>
          <a href="/login" className="mt-6 inline-block text-purple-400 hover:text-purple-300">Return to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg border border-white/10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="mt-2 text-sm text-gray-400">Enter your email to receive a reset link.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-md">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
            />
          </div>
          <button type="submit" disabled={loading || !email} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

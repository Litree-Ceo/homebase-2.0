import { useState } from 'react';
import { Shield, Key, Radio } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function Login() {
  const [apiKey, setApiKey] = useState('');
  const [wsToken, setWsToken] = useState('');
  const [error, setError] = useState('');

  const setCredentials = useAuthStore((state) => state.setCredentials);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim() || !wsToken.trim()) {
      setError('Please enter both API key and WebSocket token');
      return;
    }

    setCredentials(apiKey, wsToken);
  };

  return (
    <div className="min-h-screen bg-overlord-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-pink mb-4">
            <Shield className="w-10 h-10 text-overlord-900" />
          </div>
          <h1 className="text-3xl font-bold neon-text-cyan">OVERLORD</h1>
          <p className="text-gray-400 mt-2">System Dashboard v5.0</p>
        </div>

        {/* Login Form */}
        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key
                </span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 bg-overlord-800 border border-overlord-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                placeholder="Enter your API key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  WebSocket Token
                </span>
              </label>
              <input
                type="password"
                value={wsToken}
                onChange={(e) => setWsToken(e.target.value)}
                className="w-full px-4 py-3 bg-overlord-800 border border-overlord-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                placeholder="Enter your WebSocket token"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-pink text-overlord-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Connect to Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Tokens are stored locally in your browser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

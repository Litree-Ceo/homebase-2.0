import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/auth';

// Pre-computed particle positions (fixes hydration mismatch)
const PARTICLES = [
  { left: 15, top: 20, delay: 0.5, duration: 2.5, opacity: 0.6 },
  { left: 85, top: 15, delay: 1.2, duration: 3.1, opacity: 0.4 },
  { left: 45, top: 80, delay: 0.8, duration: 2.8, opacity: 0.7 },
  { left: 70, top: 60, delay: 1.5, duration: 3.5, opacity: 0.5 },
  { left: 25, top: 45, delay: 0.3, duration: 2.2, opacity: 0.8 },
  { left: 90, top: 75, delay: 1.8, duration: 2.9, opacity: 0.4 },
  { left: 10, top: 65, delay: 0.9, duration: 3.2, opacity: 0.6 },
  { left: 55, top: 25, delay: 1.1, duration: 2.6, opacity: 0.5 },
  { left: 35, top: 90, delay: 0.6, duration: 3.0, opacity: 0.7 },
  { left: 80, top: 40, delay: 1.4, duration: 2.4, opacity: 0.6 },
  { left: 5, top: 85, delay: 0.2, duration: 3.3, opacity: 0.5 },
  { left: 60, top: 10, delay: 1.0, duration: 2.7, opacity: 0.8 },
];

// Animated background grid component
function CyberGrid() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Perspective grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center top',
          animation: 'gridMove 20s linear infinite',
        }}
      />

      {/* Floating particles - deterministic positions */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-500 rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
            animation: `pulse ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
    </div>
  );
}

// Glitch text effect component
function GlitchText({ text }: { text: string }) {
  return (
    <div className="relative inline-block" data-testid="login-header">
      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter relative z-10">
        {text}
      </h1>
      <h1
        className="absolute top-0 left-0 text-4xl md:text-5xl font-black text-purple-500 tracking-tighter opacity-70"
        style={{
          clipPath: 'inset(0 0 50% 0)',
          transform: 'translateX(2px)',
          animation: 'glitch 2s infinite',
        }}
      >
        {text}
      </h1>
      <h1
        className="absolute top-0 left-0 text-4xl md:text-5xl font-black text-cyan-500 tracking-tighter opacity-70"
        style={{
          clipPath: 'inset(50% 0 0 0)',
          transform: 'translateX(-2px)',
          animation: 'glitch 2s infinite reverse',
        }}
      >
        {text}
      </h1>
    </div>
  );
}

// System stats ticker
function SystemTicker() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [stats, setStats] = useState({ cpu: 0, mem: 0, net: 0 });

  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * 30) + 20,
        mem: Math.floor(Math.random() * 40) + 30,
        net: Math.floor(Math.random() * 100),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-purple-500/30 p-2 text-xs font-mono z-40">
      <div className="flex justify-center gap-8 text-purple-400">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          CPU: {stats.cpu}%
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          MEM: {stats.mem}%
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          NET: {stats.net} MB/s
        </span>
        <span className="hidden md:flex items-center gap-2 text-cyan-400">
          <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          SYSTEM: ONLINE
        </span>
      </div>
    </div>
  );
}

export function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) {
      setError('Invalid email format');
      return;
    }
    if (password.length < 6) {
      setError('Password must be 6+ characters');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      window.location.href = '/dashboard';
    } catch (err: any) {
      const message = err.message?.toLowerCase() || '';
      if (message.includes('invalid login')) {
        setError('Access denied - Invalid credentials');
      } else if (message.includes('email not confirmed')) {
        setError('Email verification required');
      } else if (message.includes('rate limit')) {
        setError('Rate limit - Try again later');
      } else {
        setError(
          err.error_description || err.message || 'Authentication failed'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (
    provider: 'google' | 'github' | 'discord'
  ) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setError(error.message);
  };

  const providers = [
    {
      id: 'google' as const,
      label: 'Google',
      color: 'hover:bg-red-600/20 hover:border-red-500/50',
    },
    {
      id: 'github' as const,
      label: 'GitHub',
      color: 'hover:bg-gray-600/20 hover:border-gray-500/50',
    },
    {
      id: 'discord' as const,
      label: 'Discord',
      color: 'hover:bg-indigo-600/20 hover:border-indigo-500/50',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-purple-950">
      {/* Cyberpunk background */}
      <CyberGrid />

      {/* Main card */}
      <main
        className="relative w-full max-w-md p-8 mx-4 space-y-6 rounded-2xl backdrop-blur-xl border border-purple-500/30 shadow-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(88, 28, 135, 0.3) 100%)',
          boxShadow:
            '0 0 60px rgba(139, 92, 246, 0.3), inset 0 0 60px rgba(139, 92, 246, 0.1)',
        }}
      >
        {/* Corner decorations */}
        <div
          className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-purple-500/50 rounded-tl-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-purple-500/50 rounded-tr-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-purple-500/50 rounded-bl-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-purple-500/50 rounded-br-2xl"
          aria-hidden="true"
        />

        {/* Header */}
        <header className="text-center space-y-2">
          <div
            className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/50 animate-pulse"
            aria-hidden="true"
          >
            <span className="text-3xl" aria-hidden="true">
              ◈
            </span>
          </div>
          <h1 className="sr-only">Overlord PC Dashboard - Sovereign OS v4.3</h1>
          <GlitchText text="OVERLORD" />
          <p
            className="text-sm text-gray-300 font-mono tracking-widest uppercase"
            aria-label="System version"
          >
            Sovereign OS v4.3
          </p>
          <div
            className="flex items-center justify-center gap-2 text-xs text-cyan-400"
            role="status"
            aria-live="polite"
          >
            <span
              className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
              aria-hidden="true"
            />
            <span>SYSTEM ONLINE</span>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg animate-shake"
          >
            <p className="text-sm text-red-300 text-center font-mono">
              {error}
            </p>
          </div>
        )}

        {/* Login form */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
          aria-label="Login form"
        >
          {/* Email field */}
          <div className="relative group">
            <label
              htmlFor="email"
              className={`absolute left-3 transition-all duration-300 font-mono text-sm pointer-events-none ${
                focusedField === 'email' || email
                  ? '-top-2 text-xs text-purple-400 bg-gray-900 px-2 z-10'
                  : 'top-3 text-gray-400'
              }`}
            >
              EMAIL ID
            </label>
            <input
              ref={emailRef}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              disabled={loading}
              aria-required="true"
              className="block w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-transparent focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50 transition-all font-mono"
              placeholder="email@example.com"
            />
            <div
              className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 ${focusedField === 'email' ? 'w-full' : 'w-0'}`}
              aria-hidden="true"
            />
          </div>

          {/* Password field */}
          <div className="relative group">
            <label
              htmlFor="password"
              className={`absolute left-3 transition-all duration-300 font-mono text-sm pointer-events-none ${
                focusedField === 'password' || password
                  ? '-top-2 text-xs text-purple-400 bg-gray-900 px-2 z-10'
                  : 'top-3 text-gray-400'
              }`}
            >
              ACCESS KEY
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              disabled={loading}
              aria-required="true"
              className="block w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-transparent focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50 transition-all font-mono pr-12"
              placeholder="password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-purple-400 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            <div
              className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 ${focusedField === 'password' ? 'w-full' : 'w-0'}`}
              aria-hidden="true"
            />
          </div>

          {/* Forgot password link */}
          <div className="flex items-center justify-end">
            <a
              href="/forgot-password"
              aria-label="Reset your access key or password"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors hover:underline"
            >
              Forgot your password?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="group relative w-full py-3 px-4 border-0 rounded-lg font-bold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label={loading ? 'Authenticating' : 'Initialize session'}
            aria-busy={loading}
          >
            <span
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500"
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
              aria-hidden="true"
            />
            <span className="relative flex items-center justify-center gap-2 font-mono tracking-wider">
              {loading ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <span aria-hidden="true">🔐</span>
                  INITIALIZE SESSION
                </>
              )}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-gray-900 text-gray-400 font-mono">
              // OR USE OAUTH
            </span>
          </div>
        </div>

        {/* OAuth buttons */}
        <div
          className="grid grid-cols-3 gap-3"
          role="group"
          aria-label="OAuth login options"
        >
          {providers.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => handleOAuthLogin(id)}
              disabled={loading}
              className={`group flex flex-col items-center justify-center py-3 px-2 border border-gray-700 rounded-lg bg-black/30 text-gray-300 transition-all ${color} disabled:opacity-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
              aria-label={`Sign in with ${label}`}
            >
              <span className="text-sm font-mono uppercase">{label}</span>
            </button>
          ))}
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-400 font-mono">
          NO CREDENTIALS?{' '}
          <a
            href="/signup"
            aria-label="Request access or sign up for a new account"
            className="text-purple-400 hover:text-purple-300 font-bold transition-colors hover:underline"
          >
            Request Access
          </a>
        </p>
      </main>

      {/* System ticker */}
      <SystemTicker />

      {/* Styles */}
      <style>{`
        @keyframes gridMove {
          0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
        }
        @keyframes glitch {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

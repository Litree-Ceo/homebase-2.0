import { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../../lib/auth';
import type { Session } from '@supabase/supabase-js';

// ==========================================
// TYPES
// ==========================================

interface GlobalShellProps {
  children: ReactNode;
  requireAuth?: boolean;
  title?: string;
  pathname?: string;
}

interface NavLinkProps {
  to: string;
  children: ReactNode;
  pathname: string;
}

interface SidebarProps {
  session: Session | null;
  pathname: string;
}

// ==========================================
// ICONS
// ==========================================

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const LoginIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

// ==========================================
// COMPONENTS
// ==========================================

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-700 border-t-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-purple-500/30 opacity-20"></div>
        </div>
        <span className="text-gray-400 text-sm animate-pulse">Loading Sovereign OS...</span>
      </div>
    </div>
  );
}

function NavLink({ to, children, pathname }: NavLinkProps) {
  const isActive = pathname === to || pathname.startsWith(`${to}/`);
  return (
    <a
      href={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        isActive 
          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
      }`}
      aria-current={isActive ? 'page' : undefined}
      tabIndex={0}
    >
      {children}
    </a>
  );
}

function Sidebar({ session, pathname }: SidebarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      window.location.href = '/login';
    }
  };

  const userEmail = session?.user?.email;
  const userName = session?.user?.user_metadata?.name || userEmail?.split('@')[0] || 'User';

  return (
    <aside className="w-64 bg-gray-900 border-r border-white/10 flex flex-col flex-shrink-0" aria-label="Main sidebar" role="complementary">
      <div className="p-4 border-b border-white/10">
        <a href="/" className="flex items-center gap-2 text-white font-bold text-xl hover:text-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">
          <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-sm" aria-hidden="true">L</span>
          <span>LiTreeLab</span>
        </a>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3 mt-2" id="nav-main-heading">Main</div>
        <NavLink to="/dashboard" pathname={pathname} aria-labelledby="nav-main-heading">
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>
        
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3 mt-6" id="nav-system-heading">System</div>
        <NavLink to="/settings" pathname={pathname} aria-labelledby="nav-system-heading">
          <SettingsIcon />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-white/10">
        {session ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm font-medium text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate" title={userEmail || ''}>{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label={isLoggingOut ? 'Signing out' : 'Sign out of your account'}
              aria-busy={isLoggingOut}
            >
              <LogoutIcon />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        ) : (
          <NavLink to="/login" pathname={pathname}>
            <LoginIcon />
            <span>Sign In</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
}

// ==========================================
// MAIN
// ==========================================

export default function GlobalShell({
  children,
  requireAuth = true,
  title = '',
  pathname = '',
}: GlobalShellProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) setSession(data.session);
      } catch (err) {
        console.error('Error getting session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSession(session);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading && requireAuth && !session && !isRedirecting) {
      if (pathname === '/login' || pathname === '/forgot-password' || pathname.startsWith('/auth/') || pathname.startsWith('/reset-password')) {
        return;
      }
      setIsRedirecting(true);
      window.location.href = '/login';
    }
  }, [loading, requireAuth, session, pathname, isRedirecting]);

  if (loading) return <LoadingScreen />;
  
  if (requireAuth && !session) {
    if (pathname === '/login' || pathname === '/forgot-password' || pathname.startsWith('/auth/') || pathname.startsWith('/reset-password')) {
      return <>{children}</>;
    }
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-md focus:ring-2 focus:ring-purple-400 transition-all duration-200"
        aria-label="Skip to main content"
      >
        Skip to content
      </a>
      <Sidebar session={session} pathname={pathname} />
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {title && (
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
              <div className="mt-2 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

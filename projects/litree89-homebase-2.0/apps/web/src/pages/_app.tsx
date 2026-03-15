import '../index.css';
import '../styles/smart.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '@/lib/auth/msal-config';
import { startSignalR } from '../lib/signalrClient';
import { analytics } from '@/lib/smartFeatures';

const msalInstance = new PublicClientApplication(msalConfig);
const SIGNALR_ROUTES = new Set(['/homebase', '/metaverse', '/profile/[uid]']);

/**
 * App component with props validation and Azure AD authentication
 */
function App({
  Component,
  pageProps,
}: Readonly<{
  Component: React.ComponentType<Record<string, unknown>>;
  pageProps: Record<string, unknown>;
}>) {
  const router = useRouter();

  useEffect(() => {
    // Track page views
    analytics.track('page_view', {
      path: router.pathname,
      query: router.query,
    });
  }, [router.pathname, router.query]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_SIGNALR !== 'true') return;
    if (!SIGNALR_ROUTES.has(router.pathname)) return;
    startSignalR();
  }, [router.pathname]);

  return (
    <MsalProvider instance={msalInstance}>
      <Component {...pageProps} />
    </MsalProvider>
  );
}
export default App;

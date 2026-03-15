/**
 * useAuth Hook
 * @workspace Client-side authentication state management
 */

import { useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';

export interface User {
  id: string;
  email?: string;
  name?: string;
  photoURL?: string;
}

export function useAuth() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      const account = accounts[0];
      setUser({
        id: account.localAccountId,
        email: account.username,
        name: account.name,
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [isAuthenticated, accounts]);

  const signIn = async () => {
    try {
      await instance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
      });
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await instance.logoutPopup();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
  };
}

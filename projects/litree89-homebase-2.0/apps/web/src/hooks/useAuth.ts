/**
 * useAuth - Modern authentication hook for Entra External ID
 * 
 * @workspace Simplified auth hook with TypeScript
 * Handles: Login, Logout, Token refresh, User state
 */

import { useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest, silentRequest } from '@/lib/auth/msal-config';
import { AccountInfo } from '@azure/msal-browser';

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

export function useAuth() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accounts.length > 0) {
      const account = accounts[0];
      setUser({
        id: account.localAccountId,
        name: account.name || account.username,
        email: account.username,
        photo: undefined, // Can be fetched from Microsoft Graph if needed
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [accounts]);

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!accounts || accounts.length === 0) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...silentRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (error) {
      console.error('Token acquisition failed:', error);
      // If silent fails, trigger interactive login
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error('Interactive token acquisition failed:', popupError);
        return null;
      }
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    getAccessToken,
  };
}

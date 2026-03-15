'use client';

/**
 * Azure AD B2C Authentication Provider
 *
 * @workspace Wraps the entire app to provide MSAL authentication context
 * Supports free user registration via Azure AD B2C (first 50K MAU free)
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  PublicClientApplication,
  EventType,
  AccountInfo,
  AuthenticationResult,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest, b2cPolicies, tokenRequest } from './msal-config';

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// User profile type matching our Cosmos DB schema
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin: string;
  preferences: {
    theme: 'dark' | 'light' | 'system';
    notifications: boolean;
    privateProfile: boolean;
  };
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  stats: {
    followers: number;
    following: number;
    posts: number;
    mediaItems: number;
  };
}

interface AuthContextType {
  user: AccountInfo | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  editProfile: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Inner provider that uses MSAL hooks
 */
function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = accounts[0] || null;

  // Handle login redirect callback
  useEffect(() => {
    const callbackId = instance.addEventCallback(event => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const result = event.payload as AuthenticationResult;
        instance.setActiveAccount(result.account);
      }

      if (event.eventType === EventType.LOGIN_FAILURE) {
        // Handle password reset flow (B2C specific)
        if (event.error?.message.includes('AADB2C90118')) {
          const b2cAuthority = `https://${b2cPolicies.authorityDomain}/tfp/${process.env.NEXT_PUBLIC_ENTRA_TENANT_ID}/${b2cPolicies.names.forgotPassword}`;
          instance.loginRedirect({
            authority: b2cAuthority,
            scopes: loginRequest.scopes,
          });
        }
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance]);

  // Fetch or create user profile in Cosmos DB
  const refreshUserProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      } else if (response.status === 404) {
        // Create new profile for first-time users
        const newProfile = await createUserProfile(token, user);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Create profile for new users (free registration)
  const createUserProfile = async (token: string, account: AccountInfo): Promise<UserProfile> => {
    const newProfile: Partial<UserProfile> = {
      id: account.localAccountId,
      email: account.username,
      displayName: account.name || account.username.split('@')[0],
      isVerified: false,
      preferences: {
        theme: 'dark',
        notifications: true,
        privateProfile: false,
      },
      stats: {
        followers: 0,
        following: 0,
        posts: 0,
        mediaItems: 0,
      },
    };

    const response = await fetch('/api/users/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newProfile),
    });

    return response.json();
  };

  // Get access token for API calls
  const getAccessToken = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...tokenRequest,
        account: user,
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Token expired, need interactive login
        await instance.acquireTokenPopup(tokenRequest);
        const response = await instance.acquireTokenSilent({
          ...tokenRequest,
          account: user,
        });
        return response.accessToken;
      }
      console.error('Failed to acquire token:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Handle redirect promise (for redirect-based login)
        await instance.handleRedirectPromise();

        // Set active account if available
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [instance]);

  // Refresh profile when user changes
  useEffect(() => {
    if (user && !isLoading) {
      refreshUserProfile();
    }
  }, [user, isLoading, refreshUserProfile]);

  // Login handler - FREE registration via Azure AD B2C
  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: '/',
      });
      setUserProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Edit profile using B2C profile edit policy
  const editProfile = async () => {
    try {
      await instance.loginPopup({
        authority: b2cPolicies.authorities.editProfile.authority,
        scopes: loginRequest.scopes,
      });
      await refreshUserProfile();
    } catch (error) {
      console.error('Profile edit failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated,
        isLoading: isLoading || inProgress !== 'none',
        login,
        logout,
        editProfile,
        getAccessToken,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Main Auth Provider wrapping MSAL
 * Use this at the root of your application
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </MsalProvider>
  );
}

export default AuthProvider;

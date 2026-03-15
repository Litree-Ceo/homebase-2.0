/**
 * Lightweight authentication stub for local/dev usage.
 * Provides a stable shape that mirrors the real hook so components can run.
 */

type DemoUser = {
  localAccountId: string;
  name: string;
  email: string;
  id?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  profilePicture?: string;
  tier?: 'free' | 'pro' | 'premium';
};

type DemoUserProfile = {
  id: string;
  displayName: string;
  profilePicture?: string;
};

export function useAuth() {
  const user: DemoUser = {
    localAccountId: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
  };

  const userProfile: DemoUserProfile = {
    id: user.localAccountId,
    displayName: user.name,
  };

  const getAccessToken = async (): Promise<string> => '';

  return {
    login: async () => {
      console.log('[Auth] Login stub - bypassing auth in dev');
    },
    logout: async () => {
      console.log('[Auth] Logout stub');
    },
    isLoading: false,
    isAuthenticated: true,
    user,
    userProfile,
    getAccessToken,
  };
}

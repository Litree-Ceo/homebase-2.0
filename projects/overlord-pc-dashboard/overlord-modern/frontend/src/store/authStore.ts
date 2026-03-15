import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  apiKey: string | null;
  wsToken: string | null;
  setCredentials: (apiKey: string, wsToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      apiKey: null,
      wsToken: null,
      setCredentials: (apiKey, wsToken) =>
        set({ isAuthenticated: true, apiKey, wsToken }),
      logout: () =>
        set({ isAuthenticated: false, apiKey: null, wsToken: null }),
    }),
    {
      name: 'overlord-auth',
    }
  )
);

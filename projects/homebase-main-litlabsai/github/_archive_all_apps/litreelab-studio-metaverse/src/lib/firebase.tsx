'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, onAuthStateChanged, User, signOut, signInWithPopup } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// --- Configuration ---
// Using environment variables is best practice, but falling back to the user-provided config if needed.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// --- Initialization ---
// Export these for usage in non-React files (like services)
export let app: FirebaseApp;
export let auth: Auth;
export let db: Firestore;
export let storage: FirebaseStorage;
export let analytics: Analytics | null = null;

// Helper to check if we have valid keys (not placeholders)
const hasValidKeys = () => {
  return firebaseConfig.apiKey && 
         !firebaseConfig.apiKey.includes('YOUR_FIREBASE') && 
         firebaseConfig.apiKey.length > 20;
};

export const initializeFirebase = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    if (!getApps().length) {
      if (hasValidKeys()) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        
        isSupported().then(supported => {
          if (supported) {
            analytics = getAnalytics(app);
          }
        });
        console.log('[Firebase] Initialized successfully');
      } else {
        console.warn('[Firebase] Invalid or missing API keys. Running in Mock Mode.');
        return null;
      }
    } else {
      app = getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    }
    return { app, auth, db, storage };
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    return null;
  }
};

// Initialize immediately on client side
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// --- Context & Hooks ---

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  isMockMode: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  signInWithGoogle: async () => {},
  db: null,
  storage: null,
  isMockMode: false
});

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    if (!auth) {
      setIsMockMode(true);
      setLoading(false);
      // Mock user for development if no firebase
      // setUser({ uid: 'mock-user', displayName: 'Dev Creator', photoURL: null } as User); 
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    } else {
      setUser(null); // Mock logout
    }
  };

  const signInWithGoogle = async () => {
    if (auth) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error signing in with Google", error);
      }
    } else {
       // Mock Login
       console.log('Mock login triggered');
       // Mock user for development - cast through unknown to satisfy TypeScript
       setUser({ 
         uid: 'mock-123', 
         displayName: 'Mock Creator', 
         email: 'creator@litree.lab',
         photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
         emailVerified: true,
         isAnonymous: false,
         metadata: {},
         providerData: [],
         refreshToken: '',
         tenantId: null,
         delete: async () => {},
         getIdToken: async () => 'mock-token',
         getIdTokenResult: async () => ({} as never),
         reload: async () => {},
         toJSON: () => ({}),
         providerId: 'google.com'
       } as unknown as User);
    }
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      loading, 
      logout, 
      signInWithGoogle,
      db: db || null,
      storage: storage || null,
      isMockMode 
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, DEMO_MODE } from "../config/firebase";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // Auto-login in demo mode
      const demoUser = {
        uid: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        email: 'demo@homebase.local',
        displayName: 'Demo User',
        photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
        emailVerified: true,
        isDemo: true
      };
      
      setTimeout(() => {
        setUser(demoUser);
        setLoading(false);
      }, 500);
      
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Auth state listener error:', err);
      setLoading(false);
    }
  }, []);

  return { user, loading };
};

export default useAuth;

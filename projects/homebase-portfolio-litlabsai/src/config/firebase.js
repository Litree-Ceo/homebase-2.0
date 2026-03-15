import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAI, getGenerativeModel } from 'firebase/ai';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || 
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'AIzaSyA1234567890abcdefghijklmnopqrst';

let app, auth, db;

if (DEMO_MODE) {
  // Demo mode - create minimal Firebase app for testing
  const demoConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '0',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app'
  };
  
  try {
    app = initializeApp(demoConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    // If Firebase init fails in demo mode, set up fallbacks
    console.warn('Firebase initialization in demo mode: Using client-side only');
  }
} else {
  // Production mode with real Firebase config
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { DEMO_MODE };
export const googleProvider = new GoogleAuthProvider();
export { getAI, getGenerativeModel };
export { auth, db };
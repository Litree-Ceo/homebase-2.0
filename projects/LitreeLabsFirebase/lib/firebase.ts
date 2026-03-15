// lib/firebase.ts
"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Minimal client-side config validation to avoid confusing runtime errors
const requiredClientFields = ["apiKey", "projectId", "appId"] as const;
function missingConfigFields(cfg: typeof firebaseConfig) {
  return requiredClientFields.filter((k) => !cfg[k]);
}

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

// Only initialize if we're actually in a browser context (not build time)
// and have valid configuration
if (typeof window !== "undefined") {
  const missing = missingConfigFields(firebaseConfig);
  if (missing.length === 0) {
    try {
      const apps = getApps();
      app = apps.length > 0 ? (apps[0] as FirebaseApp) : initializeApp(firebaseConfig);
      authInstance = getAuth(app);
      dbInstance = getFirestore(app);

      // Only enable App Check debug token when explicitly allowed and not in production.
      // Set `NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN=true` in dev env to enable.
      const allowDebug =
        process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN === "true" &&
        process.env.NODE_ENV !== "production";

      if (allowDebug) {
        window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
    } catch (e) {
      // Silently fail during build - don't log to avoid noise in build output
      if (process.env.NODE_ENV === "development") {
        console.warn("Firebase client init skipped:", e);
      }
    }
  }
}

// Export instances (will be null during SSR/build, ready on client)
export const auth = authInstance as Auth | null;
export const db = dbInstance as Firestore | null;
export { app };


// lib/firebase.ts

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function isClient() {
  return typeof window !== "undefined";
}

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

function missingConfigFields(cfg: ReturnType<typeof getFirebaseConfig>) {
  const required = ["apiKey", "projectId", "appId"] as const;
  return required.filter((k) => !cfg[k]);
}

export function getFirebaseApp(): FirebaseApp {
  if (!isClient()) {
    throw new Error("Firebase can only be initialized on the client.");
  }
  if (!app) {
    // Dynamic import to avoid SSR issues
    const { initializeApp, getApps } = require("firebase/app");
    const config = getFirebaseConfig();
    const missing = missingConfigFields(config);
    if (missing.length > 0) {
      throw new Error("Missing Firebase config fields: " + missing.join(", "));
    }
    const apps = getApps();
    app = apps.length > 0 ? apps[0] : initializeApp(config);
  }
  return app;
}

export function getAuthInstance(): Auth {
  if (!isClient()) {
    throw new Error("Firebase Auth is only available on the client.");
  }
  if (!auth) {
    const { getAuth } = require("firebase/auth");
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getDbInstance(): Firestore {
  if (!isClient()) {
    throw new Error("Firestore is only available on the client.");
  }
  if (!db) {
    const { getFirestore } = require("firebase/firestore");
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

// Export instances for compatibility with legacy imports (will be null during SSR/build, ready on client)
export { app, db, auth };

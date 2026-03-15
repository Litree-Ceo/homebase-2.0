'use client';

/**
 * Firebase Configuration (Disabled - Using Azure B2C + Meta OAuth)
 * @workspace Authentication handled via:
 * - Primary: Azure AD B2C (Enterprise SSO)
 * - Social: Meta/Facebook OAuth (Consumer login)
 * - Data: Cosmos DB (Server-side via /lib/cosmos.ts)
 *
 * Firebase credentials not configured. If you need Firebase:
 * 1. Create Firebase project at https://console.firebase.google.com
 * 2. Add NEXT_PUBLIC_FIREBASE_* vars to .env.local
 * 3. Uncomment the initialization code below
 */

const auth: any = null;
const db: any = null;
const app: any = null;

// Firebase initialization commented out - using Azure B2C instead
// if (typeof window !== 'undefined') {
//   const { initializeApp, getApps, getApp } = require('firebase/app');
//   const { getAuth } = require('firebase/auth');
//   const { getFirestore } = require('firebase/firestore');
//
//   const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   };
//
//   app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
//   auth = getAuth(app);
//   db = getFirestore(app);
// }

export { auth, db, app };

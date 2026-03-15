// ============================================================
// Firebase Configuration — THE GRID by LiTreeLabStudio
// ============================================================
// 1. Go to: https://console.firebase.google.com/
// 2. Create a project (or open existing one)
// 3. Click "Add App" → Web
// 4. Copy your config and replace the values below
// 5. In Firebase Console:
//    - Authentication → Enable "Email/Password" and "Google"
//    - Firestore Database → Create database (start in test mode or use rules below)
//    - Storage → Enable Firebase Storage
//
// Cost: FREE tier includes:
//   • Auth: Unlimited users
//   • Firestore: 1 GB storage, 50K reads/day, 20K writes/day
//   • Storage: 5 GB stored, 1 GB/day download
// ============================================================

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = window.__FIREBASE_CONFIG__ || {
  apiKey: "AIzaSyDvRoWoEBdqdS85YJApVdKG5KcPOYzOg6k",
  authDomain: "studio-6082148059-d1fec.firebaseapp.com",
  projectId: "studio-6082148059-d1fec",
  storageBucket: "studio-6082148059-d1fec.appspot.com",
  messagingSenderId: "144415804580",
  appId: "1:144415804580:web:c254f5bd7dc09170186a31",
};

function hasPlaceholderConfig() {
  return Object.values(firebaseConfig).some((value) =>
    String(value).includes("YOUR_"),
  );
}

let app = null;
if (!hasPlaceholderConfig()) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const firebaseReady = !!app;

if (db) {
  enableIndexedDbPersistence(db, { synchronizeTabs: true }).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn(
        "[Firestore] Multiple tabs open — persistence enabled in first tab only.",
      );
    } else if (err.code === "unimplemented") {
      console.warn("[Firestore] Browser does not support persistence.");
    }
  });
}

if (auth) {
  auth.useDeviceLanguage();
}

if (firebaseReady) {
  console.log("[Firebase] ✓ Connected to project:", firebaseConfig.projectId);
  const badge = document.getElementById("firebaseBadge");
  if (badge) {
    badge.textContent = "⚡ Firebase";
    badge.classList.remove("offline");
  }
}

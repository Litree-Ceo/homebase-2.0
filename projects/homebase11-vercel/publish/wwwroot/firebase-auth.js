// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Firebase configuration - Your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDvRoWoEBdqdS85YJApVdKG5KcPOYzOg6k",
  authDomain: "studio-6082148059-d1fec.firebaseapp.com",
  databaseURL: "https://studio-6082148059-d1fec-default-rtdb.firebaseio.com",
  projectId: "studio-6082148059-d1fec",
  storageBucket: "studio-6082148059-d1fec.firebasestorage.app",
  messagingSenderId: "144415804580",
  appId: "1:144415804580:web:7e6465f633e54e8e186a31"
};

// Initialize Firebase
let app = null;
let auth = null;

export async function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
  return { app, auth };
}

export async function signIn(email, password) {
  if (!auth) await initFirebase();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    idToken: await result.user.getIdToken()
  };
}

export async function signUp(email, password, displayName) {
  if (!auth) await initFirebase();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: displayName,
    idToken: await result.user.getIdToken()
  };
}

export async function logout() {
  if (!auth) await initFirebase();
  await signOut(auth);
}

export function onAuthChange(callback) {
  if (!auth) {
    initFirebase().then(() => onAuthStateChanged(auth, callback));
  } else {
    onAuthStateChanged(auth, callback);
  }
}

export function isInitialized() {
  return auth !== null;
}

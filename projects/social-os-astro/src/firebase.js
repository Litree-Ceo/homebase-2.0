
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "offical-site-f8bd3",
  "appId": "1:302364901806:web:588ac8b0198058d388c83f",
  "storageBucket": "offical-site-f8bd3.firebasestorage.app",
  "apiKey": "AIzaSyAw_rCpAgnRb2_CzYaXomr1LozBvZ8flVY",
  "authDomain": "offical-site-f8bd3.firebaseapp.com",
  "messagingSenderId": "302364901806"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

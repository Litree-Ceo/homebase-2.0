import * as admin from 'firebase-admin';

let adminInitialized = false;

// Lazy initialization of Firebase Admin SDK
function initializeAdmin() {
  if (adminInitialized || admin.apps.length) {
    return;
  }
  
  // Only initialize if we have credentials
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase Admin credentials not found, skipping initialization');
    return;
  }
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    adminInitialized = true;
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Helper to get admin services with lazy init
export function getAdminAuth() {
  initializeAdmin();
  return admin.apps.length ? admin.auth() : null;
}

export function getAdminDb() {
  initializeAdmin();
  return admin.apps.length ? admin.firestore() : null;
}

export function getAdminStorage() {
  initializeAdmin();
  return admin.apps.length ? admin.storage() : null;
}

export default admin;

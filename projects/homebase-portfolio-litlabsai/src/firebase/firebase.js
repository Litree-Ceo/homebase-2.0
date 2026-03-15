// Re-export from config/firebase.js to maintain a single source of truth
// This file exists for backward compatibility
export { auth, googleProvider, db, getAI as genAI, getGenerativeModel } from '../config/firebase.js';
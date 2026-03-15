/**
 * Environment Configuration Module
 * Centralizes all environment-specific settings
 */

// Detect environment
const getEnvironment = () => {
  if (import.meta.env.VITE_APP_ENV) {
    return import.meta.env.VITE_APP_ENV;
  }
  if (import.meta.env.PROD) return 'production';
  if (import.meta.env.DEV) return 'development';
  return 'development';
};

// Feature flags
const getFeatureFlags = () => ({
  enableAI: import.meta.env.VITE_ENABLE_AI_TERMINAL === 'true' || true,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || true,
  enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true' || true,
  devMode: import.meta.env.VITE_DEV_MODE === 'true' || false,
  debugLogging: import.meta.env.VITE_DEBUG_LOGGING === 'true' || false,
});

// Firebase configuration
const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

// API configuration
const getAPIConfig = () => ({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  xaiApiKey: import.meta.env.VITE_XAI_API_KEY || '',
  timeout: 30000,
});

// Application metadata
const getAppMetadata = () => ({
  name: 'HomeBase Pro',
  version: import.meta.env.VITE_APP_VERSION || '2.0.0',
  environment: getEnvironment(),
  buildDate: new Date().toISOString(),
});

// Sync status tracking
class SyncStatus {
  constructor() {
    this.lastSync = null;
    this.syncErrors = [];
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.logSyncEvent('connection', 'Online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.logSyncEvent('connection', 'Offline');
    });
  }
  
  logSyncEvent(type, message) {
    const event = {
      timestamp: new Date().toISOString(),
      type,
      message,
    };
    
    if (type === 'error') {
      this.syncErrors.push(event);
      // Keep only last 50 errors
      if (this.syncErrors.length > 50) {
        this.syncErrors.shift();
      }
    }
    
    if (getFeatureFlags().debugLogging) {
      console.log(`[Sync] ${type}:`, message);
    }
  }
  
  getStatus() {
    return {
      lastSync: this.lastSync,
      isOnline: this.isOnline,
      errorCount: this.syncErrors.length,
      recentErrors: this.syncErrors.slice(-5),
    };
  }
}

// Export configuration
export const env = {
  environment: getEnvironment(),
  isDevelopment: getEnvironment() === 'development',
  isStaging: getEnvironment() === 'staging',
  isProduction: getEnvironment() === 'production',
  features: getFeatureFlags(),
  firebase: getFirebaseConfig(),
  api: getAPIConfig(),
  app: getAppMetadata(),
  sync: new SyncStatus(),
};

export default env;

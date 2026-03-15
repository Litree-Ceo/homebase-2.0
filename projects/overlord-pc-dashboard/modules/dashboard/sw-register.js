/**
 * Service Worker Registration
 * Provides instant-load experience with preloading and cache management
 */

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    swPath: '/sw.js',
    scope: '/',
    preloadDelay: 1000,        // Delay before preloading non-critical assets
    updateCheckInterval: 60000, // Check for updates every minute
    enableDebug: location.hostname === 'localhost'
  };
  
  // State
  let swRegistration = null;
  let isUpdateAvailable = false;
  
  /**
   * Register Service Worker
   */
  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('[SW-Reg] Service Worker not supported');
      return;
    }
    
    try {
      // Register SW
      swRegistration = await navigator.serviceWorker.register(CONFIG.swPath, {
        scope: CONFIG.scope,
        updateViaCache: 'imports'
      });
      
      console.log('[SW-Reg] Service Worker registered:', swRegistration.scope);
      
      // Listen for updates
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('[SW-Reg] New version available');
            isUpdateAvailable = true;
            showUpdateNotification();
          }
        });
      });
      
      // Check for updates periodically
      setInterval(() => {
        swRegistration.update();
      }, CONFIG.updateCheckInterval);
      
      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
      
      // Preload critical assets after initial load
      if (document.readyState === 'complete') {
        setTimeout(preloadAssets, CONFIG.preloadDelay);
      } else {
        window.addEventListener('load', () => {
          setTimeout(preloadAssets, CONFIG.preloadDelay);
        });
      }
      
    } catch (error) {
      console.error('[SW-Reg] Registration failed:', error);
    }
  }
  
  /**
   * Handle messages from Service Worker
   */
  function handleSWMessage(event) {
    switch (event.data.type) {
      case 'CACHE_UPDATED':
        console.log('[SW-Reg] Cache updated:', event.data.url);
        break;
        
      case 'OFFLINE_READY':
        showOfflineReadyNotification();
        break;
    }
  }
  
  /**
   * Preload non-critical assets after initial page load
   */
  async function preloadAssets() {
    if (!swRegistration || !swRegistration.active) return;
    
    const assetsToPreload = [
      // Additional JS modules
      '/mobile-3d-handler.js',
      '/firebase-config.js',
      
      // 3D assets (if using Three.js)
      // '/assets/models/scene.glb',
      // '/assets/textures/grid.png',
      
      // Data endpoints with SWR
      '/api/config',
      '/api/stats'
    ];
    
    // Filter out already cached assets
    const cache = await caches.open(`dynamic-v11.5.0`);
    const uncachedAssets = [];
    
    for (const url of assetsToPreload) {
      const cached = await cache.match(url);
      if (!cached) {
        uncachedAssets.push(url);
      }
    }
    
    if (uncachedAssets.length > 0) {
      console.log('[SW-Reg] Preloading assets:', uncachedAssets);
      
      // Send message to SW to cache these URLs
      swRegistration.active.postMessage({
        type: 'CACHE_URLS',
        urls: uncachedAssets
      });
    }
  }
  
  /**
   * Show update available notification
   */
  function showUpdateNotification() {
    // Create update banner
    const banner = document.createElement('div');
    banner.id = 'sw-update-banner';
    banner.innerHTML = `
      <span>🚀 New version available!</span>
      <button id="sw-update-btn">Update Now</button>
      <button id="sw-dismiss-btn">Later</button>
    `;
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--accent, #00f2ff);
      color: #000;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      z-index: 10000;
      font-family: 'Orbitron', monospace;
      font-size: 14px;
      box-shadow: 0 -4px 20px rgba(0, 242, 255, 0.3);
    `;
    
    document.body.appendChild(banner);
    
    // Update button
    document.getElementById('sw-update-btn').addEventListener('click', () => {
      updateServiceWorker();
      banner.remove();
    });
    
    // Dismiss button
    document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
      banner.remove();
    });
  }
  
  /**
   * Show offline ready notification
   */
  function showOfflineReadyNotification() {
    if (window.showToast) {
      showToast('📦 App ready for offline use', 'success');
    } else {
      console.log('[SW-Reg] App ready for offline use');
    }
  }
  
  /**
   * Update Service Worker to new version
   */
  async function updateServiceWorker() {
    if (!swRegistration || !swRegistration.waiting) return;
    
    // Send skip waiting message
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload page when new SW activates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
  
  /**
   * Get cache size information
   */
  async function getCacheSize() {
    if (!swRegistration || !swRegistration.active) return null;
    
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      swRegistration.active.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [channel.port2]
      );
    });
  }
  
  /**
   * Clear all caches
   */
  async function clearCaches() {
    if (!swRegistration || !swRegistration.active) return;
    
    swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
    console.log('[SW-Reg] Cache clear requested');
  }
  
  /**
   * Check if app is in offline mode
   */
  function isOffline() {
    return !navigator.onLine;
  }
  
  /**
   * Check if content is cached (for instant-load detection)
   */
  async function isContentCached(url) {
    const cacheNames = await caches.keys();
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const match = await cache.match(url);
      if (match) return true;
    }
    
    return false;
  }
  
  /**
   * Preload specific URLs for instant navigation
   */
  async function preloadForInstantNavigation(urls) {
    if (!swRegistration || !swRegistration.active) return;
    
    swRegistration.active.postMessage({
      type: 'CACHE_URLS',
      urls: urls
    });
  }
  
  // === Network Status Monitoring ===
  
  window.addEventListener('online', () => {
    console.log('[SW-Reg] Connection restored');
    document.body.classList.remove('offline-mode');
    
    // Trigger background sync
    if ('sync' in swRegistration) {
      swRegistration.sync.register('sync-data');
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('[SW-Reg] Connection lost - using cached content');
    document.body.classList.add('offline-mode');
  });
  
  // === Public API ===
  
  window.ServiceWorkerAPI = {
    register: registerServiceWorker,
    update: updateServiceWorker,
    getCacheSize,
    clearCaches,
    isOffline,
    isContentCached,
    preload: preloadForInstantNavigation,
    get registration() { return swRegistration; },
    get isUpdateAvailable() { return isUpdateAvailable; }
  };
  
  // Auto-register on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
  } else {
    registerServiceWorker();
  }
  
})();

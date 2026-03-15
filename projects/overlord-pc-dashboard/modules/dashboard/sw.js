/**
 * Overlord Dashboard Service Worker
 * Provides instant-load experience with aggressive caching
 * Supports: App Shell, 3D Assets, API Responses, Offline Mode
 */

const CACHE_VERSION = 'v11.5.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const ASSETS_CACHE = `assets-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// App Shell - Critical files for instant load
const APP_SHELL = [
  '/',
  '/index_v2.html',
  '/style.css',
  '/app.js',
  '/mobile-3d-handler.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// External CDNs to cache
const CDN_ASSETS = [
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-functions-compat.js',
  'https://cdn.socket.io/4.7.5/socket.io.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
  'https://fonts.googleapis.com/css2?family=VT323&family=Orbitron:wght@400;700&family=Inter:wght@400;700&family=Electrolize&display=swap'
];

// Install Event - Cache App Shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching App Shell...');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        // Cache CDN assets in parallel
        return caches.open(ASSETS_CACHE)
          .then((cache) => {
            console.log('[SW] Caching CDN Assets...');
            // Use addAll with error handling for each URL
            const cachePromises = CDN_ASSETS.map(url => 
              fetch(url, { mode: 'no-cors' })
                .then(response => cache.put(url, response))
                .catch(err => console.warn('[SW] Failed to cache:', url, err))
            );
            return Promise.all(cachePromises);
          });
      })
      .then(() => {
        console.log('[SW] App Shell cached successfully');
        self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Cache failed:', err);
      })
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('static-') || 
                     name.startsWith('dynamic-') || 
                     name.startsWith('assets-') ||
                     name.startsWith('api-');
            })
            .filter((name) => {
              return name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE && 
                     name !== ASSETS_CACHE &&
                     name !== API_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// Fetch Event - Serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except CDNs we explicitly cache)
  if (!url.origin.includes(self.location.origin) && !CDN_ASSETS.includes(request.url)) {
    return;
  }
  
  // Route to appropriate strategy
  if (isAppShell(request.url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPI(request.url)) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
  } else if (isImage(request.url)) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE, { maxAge: 30 * 24 * 60 * 60 * 1000 })); // 30 days
  } else if (is3DAsset(request.url)) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE, { maxAge: 365 * 24 * 60 * 60 * 1000 })); // 1 year
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// === Caching Strategies ===

/**
 * Cache First: Serve from cache, fallback to network
 * Best for: App Shell, Images, 3D Assets
 */
async function cacheFirst(request, cacheName, options = {}) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Check if cached response is still fresh
    const cachedTime = cached.headers.get('sw-cached-time');
    const maxAge = options.maxAge || 24 * 60 * 60 * 1000; // Default 1 day
    
    if (cachedTime && (Date.now() - parseInt(cachedTime)) < maxAge) {
      return cached;
    }
    
    // Return cached but refresh in background
    refreshCache(request, cacheName);
    return cached;
  }
  
  // Not in cache, fetch and store
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-time', Date.now().toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      });
      
      cache.put(request, modifiedResponse);
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

/**
 * Network First: Try network, fallback to cache
 * Best for: Dynamic content, API calls
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache...');
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate: Serve from cache immediately, refresh in background
 * Best for: API responses, frequently updated data
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Always try to refresh in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Background refresh failed:', error);
    });
  
  // Return cached immediately if available
  if (cached) {
    // Trigger background refresh
    fetchPromise.catch(() => {});
    return cached;
  }
  
  // No cache, wait for network
  return fetchPromise;
}

/**
 * Refresh cache in background
 */
async function refreshCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-time', Date.now().toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      });
      
      cache.put(request, modifiedResponse);
    }
  } catch (error) {
    console.log('[SW] Background refresh failed:', error);
  }
}

// === Helpers ===

function isAppShell(url) {
  return APP_SHELL.some(path => url.includes(path)) || 
         url.endsWith('.html') || 
         url.endsWith('.css') ||
         (url.endsWith('.js') && !url.includes('firebase'));
}

function isAPI(url) {
  return url.includes('/api/') || 
         url.includes('firebaseio.com') ||
         url.includes('googleapis.com');
}

function isImage(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url);
}

function is3DAsset(url) {
  return /\.(glb|gltf|bin|obj|fbx|dae|stl)$/i.test(url);
}

// === Background Sync ===

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement background sync for offline mutations
  console.log('[SW] Background sync triggered');
}

// === Push Notifications ===

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// === Message Handling (from main thread) ===

self.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(names => 
          Promise.all(names.map(name => caches.delete(name)))
        )
      );
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(ASSETS_CACHE)
          .then(cache => cache.addAll(event.data.urls))
      );
      break;
      
    case 'GET_CACHE_SIZE':
      event.waitUntil(
        caches.keys().then(async (names) => {
          let totalSize = 0;
          for (const name of names) {
            const cache = await caches.open(name);
            const requests = await cache.keys();
            totalSize += requests.length;
          }
          event.ports[0].postMessage({ size: totalSize });
        })
      );
      break;
  }
});

console.log('[SW] Service Worker loaded');

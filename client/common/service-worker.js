// ============================================
// SERVICE WORKER - Offline support with background sync
// ============================================

const CACHE_NAME = 'hotelclean-v2';
const CACHE_STATIC = 'hotelclean-static-v2';
const CACHE_DYNAMIC = 'hotelclean-dynamic-v2';

const STATIC_ASSETS = [
  '/common/login.html',
  '/common/autenticacion.js',
  '/common/api.js',
  '/common/manifest.json',
  '/mucamas/index.html',
  '/mucamas/styles.css',
  '/recepcion/index.html',
  '/recepcion/styles.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js'
];

const DYNAMIC_CACHE_LIMIT = 50;

// ============================================
// Install event - cache static assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v2...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting...');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Installation failed:', err);
      })
  );
});

// ============================================
// Activate event - clean old caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v2...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_STATIC && cacheName !== CACHE_DYNAMIC) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// ============================================
// Fetch event - cache strategies
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response before caching
          const responseClone = response.clone();
          
          caches.open(CACHE_DYNAMIC).then((cache) => {
            cache.put(request, responseClone);
            trimCache(CACHE_DYNAMIC, DYNAMIC_CACHE_LIMIT);
          });
          
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - Cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Cache hit - return cached response
        if (response) {
          return response;
        }

        // Cache miss - fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Cache dynamic content if successful
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_DYNAMIC).then((cache) => {
                cache.put(request, responseClone);
                trimCache(CACHE_DYNAMIC, DYNAMIC_CACHE_LIMIT);
              });
            }
            return networkResponse;
          });
      })
      .catch(() => {
        // Both cache and network failed
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match('/common/login.html');
        }
      })
  );
});

// ============================================
// Background Sync - sync queued requests
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      syncQueuedRequests()
        .then(() => {
          console.log('[SW] Background sync completed');
          // Notify all clients
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'SYNC_COMPLETE',
                timestamp: Date.now()
              });
            });
          });
        })
        .catch((error) => {
          console.error('[SW] Background sync failed:', error);
        })
    );
  }
});

// ============================================
// Push Notifications
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = { title: 'HotelClean', body: 'Nueva notificación' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/common/icon-192.png',
    badge: '/common/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================
// Notification Click
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// ============================================
// Message handler - communicate with app
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

// ============================================
// Helper Functions
// ============================================

/**
 * Trim cache to limit size
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const deletePromises = keys
      .slice(0, keys.length - maxItems)
      .map((key) => cache.delete(key));
    
    await Promise.all(deletePromises);
    console.log(`[SW] Trimmed ${cacheName} cache`);
  }
}

/**
 * Sync queued API requests
 */
async function syncQueuedRequests() {
  try {
    // Get queued requests and sync with backend
    const allClients = await clients.matchAll();
    
    if (allClients.length > 0) {
      // Ask client to process queue through API service
      allClients[0].postMessage({
        type: 'PROCESS_QUEUE'
      });
      
      // Wait for client response
      return new Promise((resolve) => {
        setTimeout(resolve, 5000); // Timeout after 5s
      });
    }
  } catch (error) {
    console.error('[SW] Error syncing queued requests:', error);
    throw error;
  }
}

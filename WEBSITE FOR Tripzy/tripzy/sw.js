// Tripzy Service Worker for PWA Offline Support
const CACHE_NAME = 'tripzy-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/main.css',
  '/js/app.js',
  '/js/utils/state.js',
  '/js/utils/toast.js',
  '/js/utils/api.js',
  '/js/pages/home.js',
  '/js/pages/planner.js',
  '/js/pages/search.js',
  '/js/pages/dashboard.js',
  '/js/pages/calendar.js',
  '/js/pages/vendors.js',
  '/js/pages/trust.js',
  '/js/pages/auth.js',
  '/js/pages/trip-detail.js',
  '/js/pages/booking.js',
  '/data/destinations.json',
  '/data/vendors.json',
  '/data/reviews.json',
  '/data/packages.json',
  '/data/trust_stats.json',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-32.png',
  '/icons/icon-16.png'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a stream and we need to consume it
            const responseToCache = response.clone();
            
            // Put the response in the cache for future use
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Handle push notifications (placeholder for future implementation)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-32.png'
  };
  
  event.waitUntil(
    self.registration.showNotification('Tripzy', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Handle notification click
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === 'https://tripzy.example.com/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('https://tripzy.example.com/');
      }
    })
  );
});
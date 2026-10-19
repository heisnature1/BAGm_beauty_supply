// BAGm Beauty Supply - Service Worker
const CACHE_NAME = 'bagm-beauty-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/images/logo.png',
  '/favicon.ico',
];

// Install event - precache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first with cache fallback for pages, cache first for static images
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin or non-GET requests (e.g., API POST requests to checkout/Paystack)
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Never cache API or admin routes
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
    return;
  }

  // For static assets (images, css, js) -> Cache first, fallback to network
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff2|woff|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // For HTML navigation requests -> Network first, fallback to cached offline shell
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return caches.match('/');
        });
      })
  );
});

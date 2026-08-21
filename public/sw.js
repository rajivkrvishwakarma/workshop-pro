const CACHE_NAME = 'workshop-pro-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Required by Chrome PWA installability criteria: must have a working fetch handler
self.addEventListener('fetch', (event) => {
  // Network-first strategy: try network, fall back to cache
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

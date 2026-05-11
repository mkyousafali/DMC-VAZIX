// DMC-VAZIX Service Worker
// Provides offline fallback and caching for the PWA shell.

const CACHE_NAME = 'dmc-vazix-v1';

// Assets to pre-cache (app shell)
const SHELL_ASSETS = [
  '/',
  '/login',
  '/manifest.json',
  '/favicon.svg'
];

// ── Install: cache the app shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for API, cache-first for assets ────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // For API / server routes: network only (no caching sensitive data)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/?')) return;

  // For navigation: network-first, fallback to cache, then /login
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match('/login'))
        )
    );
    return;
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(request).then(
      (cached) => cached ?? fetch(request).then((res) => {
        if (res.ok && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return res;
      })
    )
  );
});

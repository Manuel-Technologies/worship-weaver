const CACHE_NAME = "ambopro-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/kjv.json",
  "/favicon.png",
  "/placeholder.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network-first for API/dynamic, cache-first for static assets
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/rest") || url.hostname !== location.hostname) {
    return; // let browser handle external/API requests
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cache immediately, update in background
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

/**
 * Minimal service worker for PWA installability.
 * Network-first only — wallet and API routes must always hit the live server.
 */
const SW_VERSION = "bc-pwa-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("Offline — reconnect to use Building Culture.", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      });
    }),
  );
});

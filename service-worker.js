const CACHE_NAME = "image-preview-pwa-v13";
const SCOPE_URL = self.registration.scope;
const APP_SHELL = [
  "./",
  "./index.html",
  "./splash-screen.png",
  "./intro-screen.png",
  "./app-screen.png",
  "./screens/accounts.png",
  "./screens/watchlists.png",
  "./screens/markets.png",
  "./screens/wealth.png",
  "./screens/discover.png",
  "./screens/search.png",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png"
].map((path) => new URL(path, SCOPE_URL).toString());

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin || !url.href.startsWith(SCOPE_URL)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(new URL("./index.html", SCOPE_URL).toString()))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    }))
  );
});

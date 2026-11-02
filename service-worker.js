const CACHE_NAME = "image-preview-pwa-v21";
const SCOPE_URL = self.registration.scope;
const APP_SHELL = [
  "./",
  "./index.html",
  "./splash-screen.png",
  "./splash-screen@2x.png",
  "./intro-screen.png",
  "./app-screen.png",
  "./screens/accounts.png",
  "./screens/accounts@2x.png",
  "./screens/watchlists.png",
  "./screens/watchlists@2x.png",
  "./screens/markets.png",
  "./screens/markets@2x.png",
  "./screens/wealth.png",
  "./screens/wealth@2x.png",
  "./screens/discover.png",
  "./screens/discover@2x.png",
  "./screens/trade.png",
  "./screens/trade@2x.png",
  "./manifest.json",
  "./icons/apple-touch-icon-120.png",
  "./icons/apple-touch-icon-152.png",
  "./icons/apple-touch-icon-167.png",
  "./icons/icon-192.png",
  "./icons/icon-256.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-1024.png",
  "./icons/logo-source-sharp.png"
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

/* PWA service worker for StraemGab - Soundboard App */

const APP_VERSION = "1.0.0";
const CORE_CACHE = "straemgab-core-v6";
const RUNTIME_CACHE = "straemgab-runtime-v6";
const STATIC_CACHE = "straemgab-static-v6";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  // Áudios para cache offline
  "./Biel/assets/audio/audio (1).mp3",
  "./Biel/assets/audio/audio (2).mp3",
  "./Biel/assets/audio/audio (3).mp3",
  "./Biel/assets/audio/audio (4).mp3",
  "./Biel/assets/audio/audio (5).mp3",
  "./Biel/assets/audio/audio (6).mp3",
  "./Biel/assets/audio/audio (7).mp3",
  "./Biel/assets/audio/audio (8).mp3",
  "./Biel/assets/audio/audio (9).mp3",
  "./Biel/assets/audio/audio (10).mp3",
  "./Biel/assets/audio/audio (11).mp3",
  "./Biel/assets/audio/audio (12).mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CORE_CACHE);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const validCaches = [CORE_CACHE, RUNTIME_CACHE, STATIC_CACHE];
      await Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => {
            console.log(`Deletando cache antigo: ${key}`);
            return caches.delete(key);
          })
      );
      await self.clients.claim();
      console.log("Service Worker ativado com sucesso");
    })()
  );
});

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

function isAudioRequest(request) {
  const url = new URL(request.url);
  return request.destination === "audio" || url.pathname.toLowerCase().endsWith(".mp3");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // SPA-ish fallback: always serve index.html for navigations when offline
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(CORE_CACHE);
          const cached = await cache.match("./index.html");
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Cache-first for audio (keeps it snappy after first load)
  if (isAudioRequest(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      })()
    );
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const fetchPromise = fetch(request)
        .then((response) => {
          cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })()
  );
});

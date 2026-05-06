/* PWA service worker for StraemGab - Soundboard App */

const APP_VERSION = "2.0.0";
const CORE_CACHE = "straemgab-core-v7";
const RUNTIME_CACHE = "straemgab-runtime-v7";
const STATIC_CACHE = "straemgab-static-v7";

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
  console.log("Service Worker instalando...");
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CORE_CACHE);
        await cache.addAll(CORE_ASSETS);
        await self.skipWaiting();
        console.log("✓ Service Worker instalado com sucesso");
      } catch (error) {
        console.error("✗ Erro ao instalar Service Worker:", error);
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker ativando...");
  event.waitUntil(
    (async () => {
      try {
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
        console.log("✓ Service Worker ativado com sucesso");
      } catch (error) {
        console.error("✗ Erro ao ativar Service Worker:", error);
      }
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

  // SPA-ish fallback: sempre servir index.html para navegações quando offline
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch (error) {
          console.warn("Navegação falhou, servindo cache:", request.url);
          const cache = await caches.open(CORE_CACHE);
          const cached = await cache.match("./index.html");
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Cache-first para áudio (mantém performático após primeiro carregamento)
  if (isAudioRequest(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          console.warn("Áudio offline:", request.url);
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Stale-while-revalidate para tudo mais
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => {
          console.warn("Fetch falhou, usando cache:", request.url);
          return cached;
        });

      return cached || fetchPromise;
    })()
  );
});

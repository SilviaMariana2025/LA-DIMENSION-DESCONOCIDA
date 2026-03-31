const CACHE_NAME = "series-app-v2";
const DATA_CACHE_NAME = "series-data-v3";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "https://cdn-icons-png.flaticon.com/512/732/732228.png",
  "https://cdn-icons-png.flaticon.com/512/5968/5968756.png",
  "https://cdn-icons-png.flaticon.com/512/5968/5968885.png",
  "https://cdn-icons-png.flaticon.com/512/5968/5968764.png",
  "https://s3.amazonaws.com/arc-wordpress-client-uploads/infobae-wp/wp-content/uploads/2019/05/23190023/twilight-zone-4.jpg",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
];

// INSTALAR
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ACTIVAR
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {

  // 1. ❌ BLOQUEAR VIDEOS (YouTube) sin romper la app
  if (
    event.request.url.includes("youtube.com") ||
    event.request.url.includes("youtu.be")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response("", { status: 204 });
      })
    );
    return;
  }

  // 2. 🖼️ IMÁGENES (Cache First + fallback)
  if (
    event.request.destination === "image" ||
    event.request.url.includes("image.tmdb.org")
  ) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return (
          response ||
          fetch(event.request)
            .then(fetchRes => {
              return caches.open(DATA_CACHE_NAME).then(cache => {
                cache.put(event.request.url, fetchRes.clone());
                return fetchRes;
              });
            })
            .catch(() => {
              return caches.match(
                "https://cdn-icons-png.flaticon.com/512/732/732228.png"
              );
            })
        );
      })
    );
    return;
  }

  // 3. 📡 API TMDB (Network First)
 if (event.request.url.includes("api.themoviedb.org")) {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DATA_CACHE_NAME).then(cache => {
            cache.put(event.request.url, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {

        const cache = await caches.open(DATA_CACHE_NAME);
        const cachedResponses = await cache.matchAll();

        // 🔥 devolver la primera respuesta guardada (fallback real)
        if (cachedResponses.length > 0) {
          return cachedResponses[0];
        }

        // ⚠️ respuesta vacía para que no rompa la app
        return new Response(JSON.stringify({ results: [] }), {
          headers: { "Content-Type": "application/json" }
        });

      })
  );
  return;
}

  // 4. 📦 CACHE GENERAL (Cache First)
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            if (event.request.method === "GET") {
              cache.put(event.request.url, fetchRes.clone());
            }
            return fetchRes;
          });
        })
      );
    })
  );
});
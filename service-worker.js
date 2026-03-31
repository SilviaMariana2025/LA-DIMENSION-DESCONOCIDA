const CACHE_NAME = "series-app-v2";
const DATA_CACHE_NAME = "series-data-v1";

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

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // 1. Excluir específicamente los videos (youtube) para que fallen en offline sin chocar con la app
  if (event.request.url.includes("youtube.com") || event.request.url.includes("youtu.be")) {
    event.respondWith(fetch(event.request)); // Solo usa la red
    return;
  }

  // 2. Caché dinámico para imágenes (TMDB, pósters, fotos de actores) - Caché primero
  if (event.request.destination === 'image' || event.request.url.includes("image.tmdb.org")) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchRes => {
          return caches.open(DATA_CACHE_NAME).then(cache => {
            cache.put(event.request.url, fetchRes.clone());
            return fetchRes;
          });
        });
      })
    );
    return;
  }

  // 3. Peticiones de datos (API TMDB) - Red principal (Network First) con respaldo de caché
  if (event.request.url.includes("api.themoviedb.org")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si conseguimos la info, guardamos una copia y la mandamos
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE_NAME).then(cache => {
              cache.put(event.request.url, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla internet, devolvemos los datos que tengamos cacheados
          return caches.match(event.request);
        })
    );
    return;
  }

  // 4. Estrategia por defecto para lo principal (Cache first, fall back to network)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === "GET") {
             cache.put(event.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    })
  );
});
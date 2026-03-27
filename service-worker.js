const CACHE_NAME = "tmdb-app-v2"; 

const urlsToCache = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/script.js",
  "./manifest.json",
  "./images/icon-192.png",
  "./images/icon-512.png"
];


self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});


self.addEventListener("activate", event => {
  console.log("Service Worker activado");
});

self.addEventListener("fetch", event => {
  // Para peticiones a la API de TMDB o imágenes
  if (event.request.url.includes("api.themoviedb.org") || event.request.url.includes("image.tmdb.org")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Para otras peticiones (archivos estáticos)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            });
        }).catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
        });
      })
  );
});
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
const CACHE_NAME = 'v1.0';

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request.clone()).then((repFromCache) => {
      if (repFromCache) {
        const resourceType = repFromCache.headers.get('content-type');

        // We only return non css/js/html response e.g images
        if (!/\.js|\.css/.test(repFromCache.url) && !/text\/html/.test(resourceType)) {
          return repFromCache;
        }

        // If the CSS/JS didn't change since it's been cached, return the cached version
        if (/\?hash/.test(event.request.url) &&
          /\?hash=(.*)/.exec(event.request.url)[1] === /[?&]hash=(.*)/.exec(repFromCache.url)[1]) {
          return repFromCache;
        }
      }

      let request = event.request.clone();

      return fetch(request).then((repFromNetwork) => {
        if (!repFromNetwork || repFromNetwork.status !== 200 || repFromNetwork.type !== 'basic' ||
          /\/sockjs\//.test(event.request.url)) {
          return repFromNetwork;
        }

        let responseToCache = repFromNetwork.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return repFromNetwork;
      }).catch(() => {
        // If fetch didn't succeed (e.g no network) return the cached HTML
        if (repFromCache) return repFromCache;
      });
    })
  );
});

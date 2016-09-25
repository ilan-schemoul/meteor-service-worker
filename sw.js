const HTMLToCache = '/';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1.0').then((cache) => {
            return cache.addAll([
                HTMLToCache,
            ]);
        })
    );
});

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

            const request = event.request.clone();

            return fetch(request).then((repFromNetwork) => {
                if (!repFromNetwork || repFromNetwork.status !== 200 || repFromNetwork.type !== 'basic' ||
                    /\/sockjs\//.test(event.request.url) || /html/.test(repFromNetwork.headers.get('content-type'))) {
                    return repFromNetwork;
                }

                const responseToCache = repFromNetwork.clone();

                caches.open('v1.0').then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return repFromNetwork;
            }).catch(() => {
                // If HTML is requested get the layout from the cache to let router take the control
                if (/text\/html/.test(event.request.headers.get('accept'))) {
                    return caches.open('v1.0').then(cache => cache.match(HTMLToCache));
                }
                // if another ressource than html is requested return it from the cache
                return caches.open('v1.0').then(cache => cache.match(request));
            });
        })
    );
});

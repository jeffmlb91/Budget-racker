//Defines all variable and prefixes
const APP_PREFIX = 'budget-racker', 
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "/index.html",
    "/css/styles.css",
    "/js/index.js",
    "/js/idb.js",
    "manifest.json",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png"
];
//First We will install for service worker
self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )
});


self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keylist.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);
      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log("delete cache: ' + keyList[i]");
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
})
// Catching all fetch requests
self.addEventListener('fetch', function(even) {
    if (even.request.url.includes('/api/')) {
      even.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then(cache => {
            return fetch(even.request)
              .then(response => {
                if (response.status === 200) {
                  cache.put(even.request.url, response.clone());
                }
  
                return response;
              })
              .catch(err => { //<--- 
                return cache.match(even.request);
              });
          })
          .catch(err => console.log(err))
      );
  
      return;
    }
  
    even.respondWith(
      fetch(even.request).catch(function() {
        return caches.match(even.request).then(function(response) {
          if (response) {
            return response;
          } else if (even.request.headers.get('accept').includes('text/html')) {
            // return the cached home page
            return caches.match('/');
          }
        });
      })
    );
}); 
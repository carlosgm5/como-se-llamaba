var CACHE = "csll-2";
var ASSETS = ["./", "./index.html", "./manifest.webmanifest",
              "./icon.svg", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Red primero para no quedarse con una versión vieja; la caché es el respaldo
// cuando no hay cobertura, que en una nave pasa constantemente.
self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  e.respondWith(
    fetch(req).then(function(res){
      if(res && res.ok && new URL(req.url).origin === self.location.origin){
        var copia = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copia); });
      }
      return res;
    }).catch(function(){
      return caches.match(req).then(function(m){ return m || caches.match("./index.html"); });
    })
  );
});

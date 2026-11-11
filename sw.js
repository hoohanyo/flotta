// Flottakezelő – offline gyorsítótár. Új kiadásnál a VERZIO-t emeld.
var VERZIO = 'flotta-0.4';
var FAJLOK = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERZIO).then(function (c) { return c.addAll(FAJLOK); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n !== VERZIO; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

// saját fájlok: előbb a hálózat (mindig a friss változat), net nélkül a tárolt példány
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // no-cache: a böngésző mindig rákérdez a szerverre, így frissítés után nem a régi fájlt adja
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(function (res) {
    var masolat = res.clone();
    caches.open(VERZIO).then(function (c) { c.put(req, masolat); });
    return res;
  }).catch(function () {
    return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
  }));
});

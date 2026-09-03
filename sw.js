// Service Worker de ONE.
// A propósito NO cachea nada: borra las cachés viejas y deja pasar cada
// petición a la red. Así, cuando se publica una versión nueva, el asesor la
// ve en cuanto recarga — sin tener que borrar datos del navegador.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => e.respondWith(fetch(e.request)));

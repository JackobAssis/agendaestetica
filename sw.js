const CACHE_NAME = 'agendaestetica-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/config.js',
  '/router.js',
  '/styles/main.css',
  '/modules/firebase.js',
  '/modules/auth.js',
  '/modules/agenda.js',
  '/modules/agendamentos.js',
  '/modules/clientes.js',
  '/modules/feedback.js',
  '/modules/notifications.js',
  '/modules/permissions.js',
  '/modules/security.js',
  '/modules/theme.js',
  '/modules/monetization.js',
  '/modules/utils.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
});

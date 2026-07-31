const CACHE_VERSION = 'v2';
const STATIC_CACHE = `agendaestetica-${CACHE_VERSION}`;
const RUNTIME_CACHE = `agendaestetica-runtime-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
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
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/**
 * Navegação (rotas HTML): network-first com fallback offline.
 * - Em online: responde da rede e atualiza o cache de runtime.
 * - Em offline: responde da página em cache (fallback: index.html).
 */
async function navigationStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const indexResponse = await caches.match('/index.html');
    return indexResponse || Response.error();
  }
}

/**
 * Assets estáticos: stale-while-revalidate.
 * - Responde do cache imediatamente e atualiza em segundo plano.
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  if (!request.url.startsWith(self.location.origin)) return;

  const isHtmlPage = request.mode === 'navigate' || /\.html$/.test(new URL(request.url).pathname);

  if (isHtmlPage) {
    event.respondWith(navigationStrategy(request));
    return;
  }

  const destination = request.destination;
  const isAsset =
    destination === 'script' ||
    destination === 'style' ||
    destination === 'font' ||
    destination === 'image';

  if (isAsset) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

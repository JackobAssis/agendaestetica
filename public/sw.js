// Service Worker para PWA - AgendaEstética
const CACHE_NAME = 'agendaestetica-v1';
const STATIC_CACHE = 'agendaestetica-static-v1';

// Assets críticos para cache imediato
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/global.css',
  '/styles/theme.css',
  '/styles/tokens.css',
  '/modules/firebase.js',
  '/modules/auth.js',
  '/assets/images/favicon.svg'
];

// Assets não críticos (cache em background)
const NON_CRITICAL_ASSETS = [
  '/styles/agendamentos.css',
  '/styles/dashboard.css',
  '/styles/login.css',
  '/modules/agenda.js',
  '/modules/agendamentos.js',
  '/modules/clientes.js'
];

// Install event - cache assets críticos
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching critical assets...');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('✅ Critical assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🎯 Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (!url.origin.includes('agendaestetica') && url.origin !== self.location.origin) return;

  // Handle API requests differently
  if (url.pathname.startsWith('/api/') || url.hostname.includes('googleapis.com')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Return offline response for API calls
          return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Você está offline. Tente novamente quando conectar à internet.'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Network request with cache update
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response.ok) return response;

            // Clone response for caching
            const responseClone = response.clone();

            // Cache successful responses
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });

            return response;
          })
          .catch(() => {
            // Offline fallback
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-agendamentos') {
    event.waitUntil(syncAgendamentos());
  }
});

async function syncAgendamentos() {
  try {
    // Implementar sincronização de agendamentos pendentes
    console.log('🔄 Syncing agendamentos...');
    // TODO: Buscar agendamentos pendentes no IndexedDB e enviar para API
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Nova notificação',
    icon: '/assets/images/favicon.svg',
    badge: '/assets/images/favicon.svg',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'dismiss', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'AgendaEstética', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
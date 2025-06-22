// Service Worker for OSINT Framework
const CACHE_NAME = 'osint-framework-v3.0.0';
const urlsToCache = [
    '/',
    '/css/main.css',
    '/css/components.css',
    '/css/dashboard.css',
    '/js/app.js',
    '/js/api.js',
    '/js/ui.js',
    '/js/search.js',
    '/js/dashboard.js',
    '/tools',
    '/analysis',
    '/reports',
    '/search',
    '/inteltechniques'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 
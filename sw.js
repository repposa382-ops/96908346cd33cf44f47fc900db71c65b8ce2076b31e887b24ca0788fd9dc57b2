/* ============================================================
   РЕЗЕРВ+ — Service Worker (PWA offline support)
   ============================================================ */

// 1. Каждый раз, когда меняете CSS или HTML, меняйте версию кэша (например, v1 на v2)
const CACHE = 'test-v2'; 

const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // 💡 ЕСЛИ вы используете кастомные шрифты (например, e-Ukraine), 
  // или отдельные SVG-иконки файлами, добавьте пути к ним сюда:
  // '/fonts/e-Ukraine-Regular.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 2. ИЗМЕНЕНО: Стратегия "Сначала сеть, если нет интернета — берем из кэша"
// Это гарантирует, что на Netlify вы всегда будете видеть актуальный пин-код и шторку
self.addEventListener('fetch', e => {
  // Для обычных запросов пытаемся сначала сходить в сеть
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Если всё ок, клонируем ответ и обновляем кэш на лету
        if (response.status === 200 && e.request.method === 'GET') {
          const cacheCopy = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, cacheCopy));
        }
        return response;
      })
      .catch(() => {
        // Если интернета нет (оффлайн) — отдаем то, что сохранено
        return caches.match(e.request);
      })
  );
});
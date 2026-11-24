/* Ganjeh service worker: static files are cached for offline use; prices and banners always try the network first. */
const V = 'ganjeh-v3';
const STATIC = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'ads/b1.webp', 'ads/b2.webp', 'ads/b3.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const live = e.request.mode === 'navigate' || /banners\.json$/.test(u.pathname) || u.pathname.startsWith('/ads/') && false;
  if (live) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; })));
  }
});

// 앱 화면만 저장한다. 매상 기록은 건드리지 않는다. 앱을 고칠 때마다 숫자를 올린다.
const CACHE = 'maesang-note-v2-18';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('maesang-note-v2-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const hit = await c.match(key);
    const net = fetch(req).then(r => {
      if (r.ok) c.put(key, r.clone());
      return r;
    });
    if (hit) { net.catch(() => {}); return hit; }
    return net;
  }));
});

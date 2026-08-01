/* WBG v2 network-only service worker.
   The page clears every wbg-v2-* Cache Storage entry on refresh. This worker also
   requests current same-origin site resources with cache:'no-store', so an older
   layout or sub-app cannot win after navigation from another tab. */
const CACHE = 'wbg-v2-fd8cf8867d';
const NETWORK_ONLY = /\/wbg-v2\/(assets\/|cifs\/|trajs\/|structgrid\/|landscape\/|wbguniverse\/|.*\.jsongz$|banner\.svg$|atom\.png|sw\.js$)/;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('wbg')) await caches.delete(key);  // wbg-v2-* AND legacy wbg-v3
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  const isNavigation = event.request.mode === 'navigate' ||
    url.pathname === '/wbg-v2/' || url.pathname.endsWith('/index.html');
  if (isNavigation || NETWORK_ONLY.test(url.pathname)) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
  }
});

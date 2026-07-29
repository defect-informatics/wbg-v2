/* WBG site service worker.
   - Navigations / index.html: NETWORK-FIRST so the freshest build always loads.
     (Previously index.html fell through to the browser's 10-min HTTP cache, which
     served a stale bundle reference -> the recurring "old layout". Now uses {cache:'no-store'}
     so index.html is ALWAYS network-fresh, never the browser HTTP cache.)
   - Data (.jsongz): NETWORK-FIRST, checked before the query bypass, so a rebuilt payload is
     never masked (the app also stamps every data URL with a build digest).
   - Heavy VERSIONED assets (bundle, wasm, css): stale-while-revalidate
     for fast repeat visits. Versioned filenames make cached copies immutable, so a fresh
     index.html always requests the current bundle url.
   - Requests carrying a query string (?v=, ?fresh=) bypass the cache (deploy checks). */
const CACHE = 'wbg-v2-6bef18ca44';
const CACHEABLE = /\/wbg-v2\/(assets\/|cifs\/|trajs\/|.*\.jsongz$|banner\.svg$|atom\.png)/;

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  // DATA (.jsongz) -> NETWORK-FIRST: stale-while-revalidate used to hand back the previous
  // payload on the first visit to a tab, so a rebuilt table/plot showed its old layout until
  // a second reload. Payloads are small; correctness wins. Cache stays as the offline fallback.
  if (url.pathname.endsWith('.jsongz')) {
    e.respondWith((async () => {
      try {
        const r = await fetch(e.request, { cache: 'no-cache' });
        // keep an offline copy, but ONLINE the network answer always wins
        if (r && r.ok) { const c = await caches.open(CACHE); c.put(e.request, r.clone()); }
        return r;
      } catch (err) { return (await caches.match(e.request)) || Promise.reject(err); }
    })());
    return;
  }
  // Navigations / index.html -> NETWORK-FIRST (always the current bundle ref), cache fallback offline.
  if (e.request.mode === 'navigate' || url.pathname === '/wbg-v2/' || url.pathname.endsWith('/index.html')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(() => caches.match(e.request)));
    return;
  }
  if (url.search) return;                       // cache-busted requests go to network
  if (!CACHEABLE.test(url.pathname)) return;    // everything else: browser default
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(e.request);
      const refresh = fetch(e.request).then((resp) => {
        if (resp && resp.ok) c.put(e.request, resp.clone());
        return resp;
      }).catch(() => hit);
      return hit || refresh;
    })
  );
});

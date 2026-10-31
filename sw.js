/* Offline cache for this GitHub Pages app, scoped to the current repository. */
const CACHE='production-calculator-v25-test-build-3-line3-v1';
const FILES=['./','./index.html','./app.js','./styles.css','./brain.js','./brain.css','./manifest.webmanifest','./version.json','./assets/js-studio.png','./assets/prod-calc-qr.png','./assets/prod-calc-test-180.png','./assets/prod-calc-test-192.png','./assets/prod-calc-test-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('production-calculator-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;if(new URL(req.url).searchParams.has('refresh_check')||new URL(req.url).searchParams.has('update_check'))return;event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}return response;}).catch(()=>caches.match(req,{ignoreSearch:true}).then(cached=>cached||caches.match('./index.html'))));});

self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});

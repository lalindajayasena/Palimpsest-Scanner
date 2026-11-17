const V='palimpsest-v2';
const CORE=['./','index.html','reader.html','manifest.json','icon-192.png','icon-512.png'];
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js','https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
 const c=await caches.open(V);
 await Promise.all(CORE.map(u=>c.add(u).catch(()=>{})));
 await Promise.all(LIBS.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r)).catch(()=>{})));
 self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
 for(const k of await caches.keys())if(k!==V)await caches.delete(k);
 await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const same=new URL(r.url).origin===location.origin;
 if(same){ // own files: newest first, saved copy when offline
  e.respondWith(fetch(r.url,{cache:'no-cache'}).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(x=>x||caches.match('index.html'))))}
 else{ // libraries and fonts: saved copy first
  e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})))}});

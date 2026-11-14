/* Schnellstart: sofort aus dem Cache, im Hintergrund aktualisieren (neue Version beim nächsten Öffnen).
   Funktioniert auch offline, z. B. im Bus. */
const CACHE = "bst-0bc0a40ba0";
const DATEIEN = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const seite = req.mode === "navigate";
  const schluessel = seite ? "index.html" : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const alt = await c.match(schluessel, { ignoreSearch: seite });
    const neu = fetch(req, seite ? { cache: "no-cache" } : {}).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(schluessel, r.clone()); return r; }).catch(() => null);
    if (alt) { e.waitUntil(neu); return alt; }
    return (await neu) || c.match("index.html");
  }));
});

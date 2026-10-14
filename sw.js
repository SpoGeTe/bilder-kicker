// Offline-Speicher: erst Netz (für Updates und neue Aufnahmen), sonst gespeicherte Version.
const CACHE = 'bilder-kicker-v3';
const DATEIEN = ['./', './index.html', './aufnahmen.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const STIMMEN = ['hallo', 'los', 'gleich', 'anders', 'froehlich', 'traurig', 'wuetend', 'ueberrascht', 'muede', 'schatten',
  'suchen', 'memory', 'tor', 'super', 'klasse', 'toll', 'nochmal', 'pokal', 'noch10', 'noch8', 'noch6', 'noch4', 'noch2',
  'abpfiff', 'morgen'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    await c.addAll(DATEIEN);
    // Vorhandene Aufnahmen gleich mit speichern, damit sie offline funktionieren (fehlende werden übersprungen)
    await Promise.all(STIMMEN.flatMap((id) => ['m4a', 'mp3'].map((f) =>
      fetch(`./stimme/${id}.${f}`).then((r) => (r.ok ? c.put(`./stimme/${id}.${f}`, r) : null)).catch(() => null))));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((antwort) => {
        if (antwort.ok) {
          const kopie = antwort.clone();
          caches.open(CACHE).then((c) => c.put(e.request, kopie));
        }
        return antwort;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || Response.error()))
  );
});

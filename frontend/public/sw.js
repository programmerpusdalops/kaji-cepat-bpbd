/**
 * Service Worker — Kaji Cepat BPBD PWA
 *
 * Strategies:
 *   Static assets     → Cache First
 *   Dashboard API     → Stale While Revalidate
 *   Other API GETs    → Network First
 *   API POST/PUT      → Queue to IndexedDB when offline
 *   Navigation (SPA)  → Network First, fallback to cached index.html
 */

const CACHE_NAME = "bpbd-pwa-v1";
const API_CACHE_NAME = "bpbd-api-v1";

// Shell assets to pre-cache on install
const PRECACHE_URLS = ["/", "/index.html"];

// ── IndexedDB helpers (mirror offlineDB.ts logic) ──────

const DB_NAME = "bpbd_offline_db";
const DB_VERSION = 1;
const STORE_PENDING = "pending_sync";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        const store = db.createObjectStore(STORE_PENDING, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db.objectStoreNames.contains("api_cache")) {
        db.createObjectStore("api_cache", { keyPath: "url" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllPending() {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PENDING, "readonly");
        const store = tx.objectStore(STORE_PENDING);
        const index = store.index("status");
        const req = index.getAll("pending");
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      })
  );
}

function deletePendingById(id) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PENDING, "readwrite");
        const store = tx.objectStore(STORE_PENDING);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      })
  );
}

function markFailed(id, errorMessage) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PENDING, "readwrite");
        const store = tx.objectStore(STORE_PENDING);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const record = getReq.result;
          if (record) {
            record.status = "failed";
            record.errorMessage = errorMessage;
            store.put(record);
          }
          resolve();
        };
        getReq.onerror = () => reject(getReq.error);
        tx.oncomplete = () => db.close();
      })
  );
}

// ── Install ────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ───────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // ── API Requests ──
  if (url.pathname.startsWith("/api/v1/")) {
    // POST/PUT/PATCH while offline → already handled by apiService (queued to IDB)
    // We do NOT intercept writes here; the client-side code handles offline queuing.
    if (request.method !== "GET") return;

    // Dashboard → Stale While Revalidate
    if (url.pathname.includes("/dashboard")) {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }

    // Other API GETs → Network First
    event.respondWith(networkFirst(request));
    return;
  }

  // ── Static assets (JS, CSS, images, fonts) → Cache First ──
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Navigation (SPA) → Network First, fallback to cached index.html ──
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }
});

// ── Caching Strategies ─────────────────────────────────

/** Cache First: serve from cache, only network if cache miss */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

/** Network First: try network, fallback to cache */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({
        success: false,
        message: "Anda sedang offline dan data belum tersedia di cache",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/** Stale While Revalidate: return cache immediately, update in background */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached version immediately, or wait for network
  return cached || (await fetchPromise) || new Response(
    JSON.stringify({
      success: false,
      message: "Offline — tidak ada data cache",
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ── Helpers ────────────────────────────────────────────

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|webp)(\?.*)?$/.test(
    pathname
  );
}

// ── Background Sync ────────────────────────────────────

self.addEventListener("sync", (event) => {
  if (event.tag === "offline-sync") {
    event.waitUntil(syncPendingRequests());
  }
});

async function syncPendingRequests() {
  const pending = await getAllPending();
  let syncedCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });

      if (response.ok || response.status < 500) {
        await deletePendingById(item.id);
        syncedCount++;
      } else {
        await markFailed(item.id, `Server error: ${response.status}`);
        failedCount++;
      }
    } catch (err) {
      // Still offline, keep in queue
      failedCount++;
    }
  }

  // Notify all clients about sync results
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: "SYNC_COMPLETE",
      syncedCount,
      failedCount,
      remainingCount: failedCount,
    });
  });
}

// ── Message handling ───────────────────────────────────

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data === "TRIGGER_SYNC") {
    syncPendingRequests();
  }
});

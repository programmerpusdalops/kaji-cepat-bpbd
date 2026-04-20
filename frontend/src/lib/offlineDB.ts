/**
 * offlineDB.ts — IndexedDB utility for PWA offline support
 *
 * Database: bpbd_offline_db
 * Stores:
 *   - pending_sync : queued POST/PUT requests to replay when online
 *   - api_cache    : cached GET responses for offline reads
 */

const DB_NAME = "bpbd_offline_db";
const DB_VERSION = 1;

const STORE_PENDING = "pending_sync";
const STORE_CACHE = "api_cache";

// ── Types ──────────────────────────────────────────────

export interface PendingRequest {
  id?: number; // auto-increment key
  url: string;
  method: string;
  body: string; // JSON-stringified
  headers: Record<string, string>;
  timestamp: number;
  status: "pending" | "synced" | "failed";
  errorMessage?: string;
}

export interface CachedResponse {
  url: string; // primary key
  data: any;
  timestamp: number;
}

// ── Database connection ────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        const store = db.createObjectStore(STORE_PENDING, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: "url" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Pending Sync (POST/PUT queue) ──────────────────────

/** Save a failed/offline request to the pending queue */
export async function saveOfflineRequest(
  url: string,
  method: string,
  body: string,
  headers: Record<string, string>
): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, "readwrite");
    const store = tx.objectStore(STORE_PENDING);

    const record: PendingRequest = {
      url,
      method,
      body,
      headers,
      timestamp: Date.now(),
      status: "pending",
    };

    const req = store.add(record);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Get all pending (not-synced) requests, ordered by timestamp */
export async function getAllPendingRequests(): Promise<PendingRequest[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, "readonly");
    const store = tx.objectStore(STORE_PENDING);
    const index = store.index("status");
    const req = index.getAll("pending");

    req.onsuccess = () => {
      const results = (req.result as PendingRequest[]).sort(
        (a, b) => a.timestamp - b.timestamp
      );
      resolve(results);
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Mark a single request as synced and remove it */
export async function markAsSynced(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, "readwrite");
    const store = tx.objectStore(STORE_PENDING);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Mark a request as failed with an error message */
export async function markAsFailed(
  id: number,
  errorMessage: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, "readwrite");
    const store = tx.objectStore(STORE_PENDING);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const record = getReq.result as PendingRequest;
      if (record) {
        record.status = "failed";
        record.errorMessage = errorMessage;
        store.put(record);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
    tx.oncomplete = () => db.close();
  });
}

/** Delete all synced/completed entries */
export async function clearAllSynced(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, "readwrite");
    const store = tx.objectStore(STORE_PENDING);
    const index = store.index("status");
    const req = index.openCursor("synced");

    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Get number of pending (unsynced) requests */
export async function getPendingCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, "readonly");
    const store = tx.objectStore(STORE_PENDING);
    const index = store.index("status");
    const req = index.count("pending");

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

// ── API Cache (GET responses) ──────────────────────────

/** Cache an API GET response */
export async function cacheApiResponse(
  url: string,
  data: any
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CACHE, "readwrite");
    const store = tx.objectStore(STORE_CACHE);

    const record: CachedResponse = {
      url,
      data,
      timestamp: Date.now(),
    };

    store.put(record);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/** Get a cached API response */
export async function getCachedResponse(
  url: string
): Promise<CachedResponse | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CACHE, "readonly");
    const store = tx.objectStore(STORE_CACHE);
    const req = store.get(url);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Clear all cached API responses */
export async function clearApiCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CACHE, "readwrite");
    const store = tx.objectStore(STORE_CACHE);
    store.clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

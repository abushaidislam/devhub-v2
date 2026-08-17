export type HistoryEntry = { id: string; slug: string; visitedAt: number };

export const HISTORY_LIMIT = 50;
export const HISTORY_CHANGED = "devhub:history:changed";

const DB_NAME = "devhub-history";
const DB_VERSION = 1;
const STORE = "entries";
const SETTING = "devhub:history-enabled";

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(HISTORY_CHANGED));
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("History storage is unavailable."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("visitedAt", "visitedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("History storage could not be opened."));
    request.onblocked = () => reject(new Error("History storage is blocked."));
  });
}

export function historySupported() {
  try {
    return typeof indexedDB !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function historyEnabled() {
  try {
    return historySupported() && localStorage.getItem(SETTING) === "true";
  } catch {
    return false;
  }
}

export function setHistoryEnabled(enabled: boolean) {
  try {
    if (!historySupported()) return false;
    localStorage.setItem(SETTING, String(enabled));
    notify();
    return true;
  } catch {
    return false;
  }
}

export async function recordHistory(slug: string) {
  if (!historyEnabled()) return false;
  let db: IDBDatabase | undefined;
  try {
    db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(STORE, "readwrite");
      const store = transaction.objectStore(STORE);

      // The slug is a stable key: revisiting a tool refreshes its timestamp rather than duplicating it.
      store.put({ id: slug, slug, visitedAt: Date.now() } satisfies HistoryEntry);

      let seen = 0;
      const cursor = store.index("visitedAt").openCursor(null, "prev");
      cursor.onsuccess = () => {
        const current = cursor.result;
        if (!current) return;
        seen += 1;
        if (seen > HISTORY_LIMIT) current.delete();
        current.continue();
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("History could not be saved."));
      transaction.onabort = () => reject(transaction.error ?? new Error("History save was aborted."));
    });
    notify();
    return true;
  } catch {
    return false;
  } finally {
    db?.close();
  }
}

export async function readHistory() {
  if (!historySupported()) return [];
  let db: IDBDatabase | undefined;
  try {
    db = await openDb();
    return await new Promise<HistoryEntry[]>((resolve, reject) => {
      const entries: HistoryEntry[] = [];
      const seenSlugs = new Set<string>();
      const transaction = db!.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).index("visitedAt").openCursor(null, "prev");
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || entries.length === HISTORY_LIMIT) {
          resolve(entries);
          return;
        }
        const entry = cursor.value as HistoryEntry;
        if (!seenSlugs.has(entry.slug)) {
          seenSlugs.add(entry.slug);
          entries.push(entry);
        }
        cursor.continue();
      };
      request.onerror = () => reject(request.error ?? new Error("History could not be read."));
    });
  } catch {
    return [];
  } finally {
    db?.close();
  }
}

export async function clearHistory() {
  if (!historySupported()) return false;
  let db: IDBDatabase | undefined;
  try {
    db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("History could not be cleared."));
      transaction.onabort = () => reject(transaction.error ?? new Error("History clear was aborted."));
    });
    notify();
    return true;
  } catch {
    return false;
  } finally {
    db?.close();
  }
}

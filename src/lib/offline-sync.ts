export type MutationAction = {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
};

const DB_NAME = "devhub-offline-sync";
const DB_VERSION = 1;
const STORE = "mutations";
export const SYNC_STARTED = "devhub:sync:started";
export const SYNC_COMPLETED = "devhub:sync:completed";

function notify(event: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(event));
  }
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Offline Sync DB could not be opened."));
    request.onblocked = () => reject(new Error("Offline Sync DB is blocked."));
  });
}

/**
 * Registers an action in the offline mutation queue.
 * This is called when the user is offline and performs a write action.
 */
export async function registerMutation(type: string, payload: unknown) {
  let db: IDBDatabase | undefined;
  try {
    db = await openDb();
    const action: MutationAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
    };
    await new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(STORE, "readwrite");
      const store = transaction.objectStore(STORE);
      store.put(action);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to register mutation."));
    });
    return action;
  } catch (error) {
    console.error("registerMutation error:", error);
    return null;
  } finally {
    db?.close();
  }
}

/**
 * Replays and clears the offline mutation queue.
 * This is called automatically when connectivity is restored.
 */
export async function syncUp(replayFn: (action: MutationAction) => Promise<boolean>) {
  notify(SYNC_STARTED);
  let db: IDBDatabase | undefined;
  try {
    db = await openDb();
    const actions = await new Promise<MutationAction[]>((resolve, reject) => {
      const entries: MutationAction[] = [];
      const transaction = db!.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).index("timestamp").openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(entries);
          return;
        }
        entries.push(cursor.value as MutationAction);
        cursor.continue();
      };
      request.onerror = () => reject(request.error ?? new Error("Failed to read mutations."));
    });

    if (actions.length === 0) {
      notify(SYNC_COMPLETED);
      return;
    }

    // Replay actions sequentially
    for (const action of actions) {
      const success = await replayFn(action);
      if (success) {
        // Remove successfully replayed action
        await new Promise<void>((resolve, reject) => {
          const transaction = db!.transaction(STORE, "readwrite");
          transaction.objectStore(STORE).delete(action.id);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      } else {
        console.warn(`Failed to sync action: ${action.id}`);
        // Optionally halt sync if sequential dependency exists
      }
    }
  } catch (error) {
    if (typeof indexedDB !== "undefined") console.error("syncUp error:", error);
  } finally {
    db?.close();
    notify(SYNC_COMPLETED);
  }
}

/**
 * Sets up the window event listener to automatically sync when coming back online.
 * @param replayFn A function that implements the logic to replay a given action.
 */
export function setupOfflineSyncListener(replayFn: (action: MutationAction) => Promise<boolean>) {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => {
    syncUp(replayFn);
  };

  window.addEventListener("online", handleOnline);

  // Attempt initial sync on load if online
  if (navigator.onLine) {
    syncUp(replayFn);
  }

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}

// Minimal IndexedDB wrapper for uploaded PDF bytes.
// Metadata lives in localStorage (see state/store.tsx); PDFs are too large for it.
// Everything stays in this browser only — nothing is uploaded to a server.

const DB = 'employer-md-files';
const STORE = 'pdfs';
const memoryFallback = new Map<string, Blob>();

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Returns true when the file was persisted to IndexedDB, false when kept in memory only. */
export async function putFile(key: string, blob: Blob): Promise<boolean> {
  try {
    await tx('readwrite', (s) => s.put(blob, key));
    return true;
  } catch {
    memoryFallback.set(key, blob);
    return false;
  }
}

export async function getFile(key: string): Promise<Blob | null> {
  if (memoryFallback.has(key)) return memoryFallback.get(key)!;
  try {
    return ((await tx('readonly', (s) => s.get(key))) as Blob | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function deleteFile(key: string): Promise<void> {
  memoryFallback.delete(key);
  try { await tx('readwrite', (s) => s.delete(key)); } catch { /* ignore */ }
}

export async function clearFiles(): Promise<void> {
  memoryFallback.clear();
  try { await tx('readwrite', (s) => s.clear()); } catch { /* ignore */ }
}

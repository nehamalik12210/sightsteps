/**
 * SightSteps — IndexedDB Session Storage
 *
 * Persists answers and session state locally so the user doesn't lose
 * progress if the app is closed or refreshed.
 *
 * Uses a single object store 'sessions' keyed by sessionId.
 * Also stores the latest session ID in a 'meta' store for quick resume.
 */

const DB_NAME = 'SightSteps';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';
const STORE_META = 'meta';

let dbPromise = null;

/**
 * Open (or create) the database. Returns a promise that resolves to the db.
 * Safe to call multiple times — returns the same promise.
 */
function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('[Storage] IndexedDB not available');
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const store = db.createObjectStore(STORE_SESSIONS, { keyPath: 'sessionId' });
        store.createIndex('timestamp', 'startedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error('[Storage] Failed to open DB:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Save the current session state to IndexedDB.
 */
export async function saveSession(state) {
  try {
    const db = await openDB();

    if (!state.sessionId) return;

    const record = {
      sessionId: state.sessionId,
      startedAt: state.startedAt,
      language: state.language,
      isDemo: state.isDemo,
      answers: state.answers,
      visionResults: state.visionResults,
      report: state.report,
      updatedAt: new Date().toISOString(),
    };

    const tx = db.transaction([STORE_SESSIONS, STORE_META], 'readwrite');

    // Save session
    tx.objectStore(STORE_SESSIONS).put(record);

    // Update meta with latest session ID
    tx.objectStore(STORE_META).put({ key: 'latestSessionId', value: state.sessionId });

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[Storage] Save failed:', err.message);
  }
}

/**
 * Load the latest session from IndexedDB.
 * Returns the session record or null if none exists.
 */
export async function loadLatestSession() {
  try {
    const db = await openDB();

    // Get the latest session ID
    const metaTx = db.transaction(STORE_META, 'readonly');
    const metaReq = metaTx.objectStore(STORE_META).get('latestSessionId');

    const meta = await new Promise((resolve, reject) => {
      metaReq.onsuccess = () => resolve(metaReq.result);
      metaReq.onerror = () => reject(metaReq.error);
    });

    if (!meta?.value) return null;

    // Get the session
    const sessionTx = db.transaction(STORE_SESSIONS, 'readonly');
    const sessionReq = sessionTx.objectStore(STORE_SESSIONS).get(meta.value);

    const session = await new Promise((resolve, reject) => {
      sessionReq.onsuccess = () => resolve(sessionReq.result);
      sessionReq.onerror = () => reject(sessionReq.error);
    });

    return session || null;
  } catch (err) {
    console.warn('[Storage] Load failed:', err.message);
    return null;
  }
}

/**
 * Clear the latest session pointer (on reset).
 * The session data itself is kept for potential history feature.
 */
export async function clearLatestSession() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_META, 'readwrite');
    tx.objectStore(STORE_META).delete('latestSessionId');
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[Storage] Clear failed:', err.message);
  }
}

/**
 * Get count of all sessions (for potential history feature).
 */
export async function getSessionCount() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readonly');
    const req = tx.objectStore(STORE_SESSIONS).count();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}


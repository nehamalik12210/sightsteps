/**
 * SightSteps local session storage.
 * Session records remain in this browser/device only; no network request is made.
 * If IndexedDB is unavailable, the app continues without persistence.
 */

const DB_NAME = 'SightSteps';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';
const STORE_META = 'meta';

let dbPromise;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const sessions = db.createObjectStore(STORE_SESSIONS, {
          keyPath: 'sessionId',
        });
        sessions.createIndex('startedAt', 'startedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };

    request.onerror = () => reject(
      request.error || new Error('Could not open local storage.'),
    );

    request.onblocked = () => reject(
      new Error('Local storage upgrade is blocked by another tab.'),
    );
  });

  // Permit a later retry after a transient browser/storage error.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(
      transaction.error || new Error('Storage transaction failed.'),
    );
    transaction.onabort = () => reject(
      transaction.error || new Error('Storage transaction was aborted.'),
    );
  });
}

export async function saveSession(state) {
  if (!state?.sessionId) return false;

  try {
    const db = await openDB();
    const transaction = db.transaction(
      [STORE_SESSIONS, STORE_META],
      'readwrite',
    );

    const record = {
      sessionId: state.sessionId,
      startedAt: state.startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: state.language || 'en',
      consentGiven: Boolean(state.consentGiven),
      isDemo: Boolean(state.isDemo),
      demoPersona: state.demoPersona || null,
      demoStepIndex: Number(state.demoStepIndex || 0),
      answers: state.answers || {},
      visionResults: state.visionResults || null,
      report: state.report || null,
    };

    transaction.objectStore(STORE_SESSIONS).put(record);
    transaction.objectStore(STORE_META).put({
      key: 'latestSessionId',
      value: state.sessionId,
    });

    await transactionDone(transaction);
    return true;
  } catch (error) {
    console.warn(
      '[SightSteps] Local save unavailable:',
      error?.message || error,
    );
    return false;
  }
}

export async function loadLatestSession() {
  try {
    const db = await openDB();
    const metaTransaction = db.transaction(STORE_META, 'readonly');
    const metaRequest = metaTransaction
      .objectStore(STORE_META)
      .get('latestSessionId');

    const latestId = await new Promise((resolve, reject) => {
      metaRequest.onsuccess = () => resolve(metaRequest.result?.value || null);
      metaRequest.onerror = () => reject(
        metaRequest.error || new Error('Could not read session pointer.'),
      );
    });

    if (!latestId) return null;

    const sessionTransaction = db.transaction(STORE_SESSIONS, 'readonly');
    const sessionRequest = sessionTransaction
      .objectStore(STORE_SESSIONS)
      .get(latestId);

    return await new Promise((resolve, reject) => {
      sessionRequest.onsuccess = () => resolve(sessionRequest.result || null);
      sessionRequest.onerror = () => reject(
        sessionRequest.error || new Error('Could not read saved session.'),
      );
    });
  } catch (error) {
    console.warn(
      '[SightSteps] Local restore unavailable:',
      error?.message || error,
    );
    return null;
  }
}

/** Remove the current session and its latest-session pointer on an explicit reset. */
export async function clearLatestSession(sessionId = null) {
  try {
    const db = await openDB();
    const transaction = db.transaction(
      [STORE_META, STORE_SESSIONS],
      'readwrite',
    );

    const metaStore = transaction.objectStore(STORE_META);
    const sessionStore = transaction.objectStore(STORE_SESSIONS);

    const pointerRequest = metaStore.get('latestSessionId');

    pointerRequest.onsuccess = () => {
      const latestId = pointerRequest.result?.value || null;

      if (!sessionId || latestId === sessionId) {
        metaStore.delete('latestSessionId');
        const idToDelete = sessionId || latestId;
        if (idToDelete) sessionStore.delete(idToDelete);
      } else if (sessionId) {
        sessionStore.delete(sessionId);
      }
    };

    await transactionDone(transaction);
    return true;
  } catch (error) {
    console.warn(
      '[SightSteps] Could not clear local session:',
      error?.message || error,
    );
    return false;
  }
}

export async function getSessionCount() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_SESSIONS, 'readonly');
    const request = transaction.objectStore(STORE_SESSIONS).count();

    return await new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || 0);
      request.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}
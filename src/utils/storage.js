/**
 * SightSteps local session storage.
 * All participant session data remains in this browser/device.
 * No network request is made by this module.
 */

import { normalizeVisionTimelineEntries } from './visionTimeline.js';
import { limitSavedSessionRecords, toSavedSessionSummaries } from './sessionHistory.js';

const DB_NAME = 'SightSteps';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';
const STORE_META = 'meta';

let dbPromise;
let writeQueue = Promise.resolve();

/** Serialize writes so an older pending save cannot recreate data after reset. */
function enqueueWrite(operation) {
  const next = writeQueue.then(operation, operation);
  writeQueue = next.then(() => undefined, () => undefined);
  return next;
}

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
        const sessions = db.createObjectStore(STORE_SESSIONS, { keyPath: 'sessionId' });
        sessions.createIndex('startedAt', 'startedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        // Close stale connections and allow the next operation to reopen the
        // database after another tab upgrades its schema.
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = () => reject(
      request.error || new Error('Could not open local storage.'),
    );

    request.onblocked = () => reject(
      new Error('Local storage upgrade is blocked by another tab.'),
    );
  });

  // Allow later retries after a transient browser/storage failure.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}


/** Pure, testable shape of the record persisted for the active participant. */
export function createSessionRecord(state) {
  return {
    schemaVersion: 5,
    sessionId: state.sessionId,
    startedAt: state.startedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: state.language || 'en',
    consentGiven: Boolean(state.consentGiven),
    historyConsentGiven: Boolean(state.historyConsentGiven),
    isDemo: Boolean(state.isDemo),
    demoPersona: state.demoPersona || null,
    demoStepIndex: Number(state.demoStepIndex || 0),
    activities: Array.isArray(state.activities) ? state.activities : [],
    primaryActivity: state.primaryActivity || null,
    participantNote: typeof state.participantNote === 'string' ? state.participantNote : '',
    answers: state.answers || {},
    visionResults: state.visionResults || null,
    amslerResults: state.amslerResults || null,
    report: state.report || null,
    appointmentFollowUp: state.appointmentFollowUp || { appointmentDate: '', professionalNotes: '', followUpPlan: '', nextAppointmentDate: '' },
    visionTimelineEntries: normalizeVisionTimelineEntries(state.visionTimelineEntries),
    discussionPriorities: Array.isArray(state.discussionPriorities) ? state.discussionPriorities.slice(0, 2) : [],
    questionsToAsk: typeof state.questionsToAsk === 'string' ? state.questionsToAsk : '',
    conversationReview: {
      confirmed: Boolean(state.conversationReview?.confirmed),
      correction: typeof state.conversationReview?.correction === 'string' ? state.conversationReview.correction.slice(0, 500) : '',
    },
    assistedCompletion: Boolean(state.assistedCompletion),
    kioskMode: Boolean(state.kioskMode),
  };
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

export function saveSession(state) {
  if (!state?.sessionId) return Promise.resolve(false);

  return enqueueWrite(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_SESSIONS, STORE_META], 'readwrite');
      const record = createSessionRecord(state);

      const sessionsStore = transaction.objectStore(STORE_SESSIONS);
      sessionsStore.put(record);
      // Keep the newest ten records; prune in the same transaction as the save.
      const existingRecordsRequest = sessionsStore.getAll();
      existingRecordsRequest.onsuccess = () => {
        const records = existingRecordsRequest.result || [];
        const newestRecord = (predicate) => records
          .filter(predicate)
          .sort((a, b) => Date.parse(b.updatedAt || b.startedAt || '') - Date.parse(a.updatedAt || a.startedAt || ''))[0];
        const retainedIds = new Set(
          limitSavedSessionRecords(records.filter((item) => !item.isDemo && !item.kioskMode))
            .map((item) => item.sessionId),
        );
        // Keep at most one demo and one active kiosk record separately, so
        // repeated demos can never evict a participant's saved history.
        const latestDemo = newestRecord((item) => item.isDemo);
        const latestKiosk = newestRecord((item) => item.kioskMode);
        if (latestDemo) retainedIds.add(latestDemo.sessionId);
        if (latestKiosk) retainedIds.add(latestKiosk.sessionId);
        // Preserve a legacy single-session record only while it remains active.
        // archiveLatestSession removes it when the participant starts a new journey.
        if (state.consentGiven && !state.historyConsentGiven && !state.isDemo && !state.kioskMode) {
          retainedIds.add(record.sessionId);
        }
        for (const item of records) {
          if (!retainedIds.has(item.sessionId)) sessionsStore.delete(item.sessionId);
        }
      };
      // Demo progress is not a participant session and must never take over
      // the participant's resume pointer.
      if (!state.isDemo) {
        transaction.objectStore(STORE_META).put({
          key: 'latestSessionId',
          value: state.sessionId,
        });
      }

      await transactionDone(transaction);
      return true;
    } catch (error) {
      console.warn('[SightSteps] Local save unavailable:', error?.message || error);
      return false;
    }
  });
}

export async function loadLatestSession() {
  try {
    await writeQueue;
    const db = await openDB();
    const transaction = db.transaction([STORE_META], 'readonly');
    const request = transaction.objectStore(STORE_META).get('latestSessionId');

    const latestId = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(
        request.error || new Error('Could not read the latest-session pointer.'),
      );
    });

    if (!latestId) return null;

    const sessionTransaction = db.transaction([STORE_SESSIONS], 'readonly');
    const sessionRequest = sessionTransaction.objectStore(STORE_SESSIONS).get(latestId);

    return await new Promise((resolve, reject) => {
      sessionRequest.onsuccess = () => resolve(sessionRequest.result || null);
      sessionRequest.onerror = () => reject(
        sessionRequest.error || new Error('Could not read the saved session.'),
      );
    });
  } catch (error) {
    console.warn('[SightSteps] Local restore unavailable:', error?.message || error);
    return null;
  }
}

/**
 * Remove every SightSteps session and the latest-session pointer.
 * This matches the product's explicit "Clear my data" action.
 */
export async function loadSessionById(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId.trim()) return null;
  try {
    await writeQueue;
    const db = await openDB();
    const transaction = db.transaction([STORE_SESSIONS], 'readonly');
    const request = transaction.objectStore(STORE_SESSIONS).get(sessionId);
    return await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Could not read saved session.'));
    });
  } catch (error) {
    console.warn('[SightSteps] Could not load saved session:', error?.message || error);
    return null;
  }
}

export async function getSavedSessions() {
  try {
    await writeQueue;
    const db = await openDB();
    const transaction = db.transaction([STORE_SESSIONS], 'readonly');
    const request = transaction.objectStore(STORE_SESSIONS).getAll();
    const records = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error('Could not list saved sessions.'));
    });
    return toSavedSessionSummaries(records);
  } catch (error) {
    console.warn('[SightSteps] Could not list saved sessions:', error?.message || error);
    return [];
  }
}

export function archiveLatestSession() {
  return enqueueWrite(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_META, STORE_SESSIONS], 'readwrite');
      const metaStore = transaction.objectStore(STORE_META);
      const sessionsStore = transaction.objectStore(STORE_SESSIONS);
      const done = transactionDone(transaction);
      const pointerRequest = metaStore.get('latestSessionId');
      pointerRequest.onsuccess = () => {
        const latestId = pointerRequest.result?.value || null;
        metaStore.delete('latestSessionId');
        if (!latestId) return;
        const recordRequest = sessionsStore.get(latestId);
        recordRequest.onsuccess = () => {
          // A record created under the older single-session consent must not
          // silently become part of the new multi-session history.
          if (!recordRequest.result?.historyConsentGiven) sessionsStore.delete(latestId);
        };
      };
      await done;
      return true;
    } catch (error) {
      console.warn('[SightSteps] Could not archive latest session:', error?.message || error);
      return false;
    }
  });
}

export function setLatestSessionId(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId.trim()) return Promise.resolve(false);
  return enqueueWrite(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_META, STORE_SESSIONS], 'readwrite');
      const done = transactionDone(transaction);
      const request = transaction.objectStore(STORE_SESSIONS).get(sessionId);
      let selected = false;
      request.onsuccess = () => {
        const record = request.result;
        if (record && record.consentGiven && record.historyConsentGiven && !record.isDemo && !record.kioskMode) {
          transaction.objectStore(STORE_META).put({ key: 'latestSessionId', value: sessionId });
          selected = true;
        }
      };
      await done;
      return selected;
    } catch (error) {
      console.warn('[SightSteps] Could not select saved session:', error?.message || error);
      return false;
    }
  });
}

export function deleteSavedSession(sessionId) {
  return clearLatestSession(sessionId);
}

export function clearAllSessions() {
  return enqueueWrite(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_META, STORE_SESSIONS], 'readwrite');
      transaction.objectStore(STORE_META).clear();
      transaction.objectStore(STORE_SESSIONS).clear();
      await transactionDone(transaction);
      return true;
    } catch (error) {
      console.warn('[SightSteps] Could not clear local session data:', error?.message || error);
      return false;
    }
  });
}

/** Backwards-compatible helper for callers that only need to remove one session. */
export function clearLatestSession(sessionId = null) {
  return enqueueWrite(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_META, STORE_SESSIONS], 'readwrite');
      const metaStore = transaction.objectStore(STORE_META);
      const sessionStore = transaction.objectStore(STORE_SESSIONS);
      const pointerRequest = metaStore.get('latestSessionId');

      pointerRequest.onsuccess = () => {
        const latestId = pointerRequest.result?.value || null;
        if (!sessionId || latestId === sessionId) {
          metaStore.delete('latestSessionId');
          const idToDelete = sessionId || latestId;
          if (idToDelete) sessionStore.delete(idToDelete);
        } else {
          sessionStore.delete(sessionId);
        }
      };

      await transactionDone(transaction);
      return true;
    } catch (error) {
      console.warn('[SightSteps] Could not clear local session:', error?.message || error);
      return false;
    }
  });
}

export async function getSessionCount() {
  try {
    await writeQueue;
    const db = await openDB();
    const transaction = db.transaction([STORE_SESSIONS], 'readonly');
    const request = transaction.objectStore(STORE_SESSIONS).count();
    return await new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || 0);
      request.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

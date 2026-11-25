/**
 * Bounded local-only history policy for participant sessions.
 * No identity matching or cross-device synchronization is performed.
 */
export const MAX_SAVED_SESSIONS = 10;

function timestamp(record) {
  const value = Date.parse(record?.updatedAt || record?.startedAt || '');
  return Number.isFinite(value) ? value : 0;
}

export function limitSavedSessionRecords(records, limit = MAX_SAVED_SESSIONS) {
  const safeLimit = Math.max(1, Math.min(MAX_SAVED_SESSIONS, Number(limit) || MAX_SAVED_SESSIONS));
  const unique = new Map();

  for (const record of Array.isArray(records) ? records : []) {
    if (record?.consentGiven && record?.historyConsentGiven && !record.isDemo && !record.kioskMode
      && typeof record.sessionId === 'string' && record.sessionId.trim()) {
      unique.set(record.sessionId, record);
    }
  }

  return [...unique.values()]
    .sort((a, b) => timestamp(b) - timestamp(a))
    .slice(0, safeLimit);
}

export function toSavedSessionSummaries(records) {
  const eligibleRecords = (Array.isArray(records) ? records : [])
    .filter((record) => record?.consentGiven && record?.historyConsentGiven && !record.isDemo && !record.kioskMode);

  return limitSavedSessionRecords(eligibleRecords)
    .map((record) => ({
      sessionId: record.sessionId,
      startedAt: record.startedAt || null,
      updatedAt: record.updatedAt || record.startedAt || null,
      language: record.language === 'hi' ? 'hi' : 'en',
      primaryActivity: typeof record.primaryActivity === 'string' ? record.primaryActivity : null,
      answeredCount: record.answers && typeof record.answers === 'object'
        ? Object.keys(record.answers).length
        : 0,
      hasReport: Boolean(record.report),
    }))
    .sort((a, b) => timestamp(b) - timestamp(a));
}

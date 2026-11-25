import assert from 'node:assert/strict';
import { limitSavedSessionRecords, toSavedSessionSummaries, MAX_SAVED_SESSIONS } from '../src/utils/sessionHistory.js';

const records = Array.from({ length: 14 }, (_, index) => ({
  sessionId: `session-${index}`,
  startedAt: `2026-11-${String(index + 1).padStart(2, '0')}T10:00:00.000Z`,
  updatedAt: `2026-11-${String(index + 1).padStart(2, '0')}T10:30:00.000Z`,
  consentGiven: true,
  historyConsentGiven: true,
  language: index % 2 ? 'hi' : 'en',
  primaryActivity: 'reading',
  answers: { one: { value: 'sample' } },
}));

assert.equal(MAX_SAVED_SESSIONS, 10);
assert.equal(limitSavedSessionRecords(records).length, 10);
assert.equal(limitSavedSessionRecords(records)[0].sessionId, 'session-13');
assert.equal(limitSavedSessionRecords(records)[9].sessionId, 'session-4');
assert.equal(limitSavedSessionRecords([...records, records[0]]).length, 10, 'duplicate IDs do not inflate retained history');

const summaries = toSavedSessionSummaries([
  ...records,
  { sessionId: 'kiosk', consentGiven: true, historyConsentGiven: true, kioskMode: true, updatedAt: '2026-11-25T11:00:00Z' },
  { sessionId: 'demo', consentGiven: true, historyConsentGiven: true, isDemo: true, updatedAt: '2026-11-25T12:00:00Z' },
  { sessionId: 'no-history-consent', consentGiven: true, historyConsentGiven: false },
  { sessionId: 'no-consent', consentGiven: false, historyConsentGiven: true, updatedAt: '2026-11-25T13:00:00Z' },
]);
assert.equal(summaries.length, 10, 'history excludes kiosk, demo, legacy-consent and unconsented records');
assert.equal(summaries[0].sessionId, 'session-13');
assert.equal(summaries[0].answeredCount, 1);
assert.equal(summaries[0].language, 'hi');
console.log('Session history policy: 10 passed, 0 failed');

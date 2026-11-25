import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {
  archiveLatestSession,
  clearAllSessions,
  deleteSavedSession,
  getSavedSessions,
  getSessionCount,
  loadLatestSession,
  loadSessionById,
  saveSession,
  setLatestSessionId,
} from '../src/utils/storage.js';

let passed = 0;
function check(condition, message) {
  assert.ok(condition, message);
  passed += 1;
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

assert.equal(await clearAllSessions(), true, 'test starts from an empty database');

for (let index = 0; index < 12; index += 1) {
  const saved = await saveSession({
    sessionId: `participant-${index}`,
    startedAt: `2026-11-${String(index + 1).padStart(2, '0')}T09:00:00.000Z`,
    consentGiven: true,
    historyConsentGiven: true,
    language: index % 2 ? 'hi' : 'en',
    primaryActivity: 'reading',
    answers: { primary_concern: { value: 'blurred_vision' } },
    report: { completed: true },
  });
  check(saved === true, `session ${index} saves successfully`);
  await pause(3);
}

const summaries = await getSavedSessions();
check(summaries.length === 10, 'only ten saved participant summaries are returned');
check(summaries[0].sessionId === 'participant-11', 'most recently updated session appears first');
check(summaries.at(-1).sessionId === 'participant-2', 'oldest two saved sessions are pruned');
check(await loadSessionById('participant-0') === null, 'pruned session is no longer loadable');
check((await loadSessionById('participant-2'))?.sessionId === 'participant-2', 'retained session can be loaded by ID');
check((await loadLatestSession())?.sessionId === 'participant-11', 'latest-session pointer targets the most recent save');
check((await loadSessionById('participant-11'))?.historyConsentGiven === true, 'history consent survives an IndexedDB save and reload round trip');
check(await archiveLatestSession() === true, 'archiving clears the auto-resume pointer');
check(await loadLatestSession() === null, 'archived session is not restored automatically');
check((await loadSessionById('participant-11'))?.sessionId === 'participant-11', 'archiving preserves the underlying participant record');
check(await setLatestSessionId('participant-5') === true, 'a valid saved participant can be selected');
check((await loadLatestSession())?.sessionId === 'participant-5', 'selecting a saved session updates the resume pointer');

await saveSession({ sessionId: 'demo-session', consentGiven: true, historyConsentGiven: false, isDemo: true, startedAt: '2026-11-25T12:00:00.000Z' });
check((await getSavedSessions()).every((record) => record.sessionId !== 'demo-session'), 'demo records are not exposed in participant history');
check((await getSavedSessions()).length === 10, 'saving a demo does not evict a participant history slot');
check(await setLatestSessionId('demo-session') === false, 'demo records cannot be selected as participant sessions');
check((await loadLatestSession())?.sessionId === 'participant-5', 'saving a demo does not replace the selected participant resume pointer');

check(await deleteSavedSession('participant-5') === true, 'individual saved session can be deleted');
check(await loadSessionById('participant-5') === null, 'deleted session cannot be loaded');
check(await loadLatestSession() === null, 'deleting the selected session clears its resume pointer');

// Verify write-queue ordering: a pending save must never recreate data after a full wipe.
const legacySave = await saveSession({ sessionId: 'legacy-single-consent', consentGiven: true, historyConsentGiven: false, startedAt: '2026-11-20T09:00:00.000Z' });
check(legacySave === true, 'legacy single-session record can still be written while active');
check((await loadSessionById('legacy-single-consent'))?.sessionId === 'legacy-single-consent', 'legacy active session remains resumable until the participant ends it');
check((await getSavedSessions()).every((record) => record.sessionId !== 'legacy-single-consent'), 'legacy single-session consent is not promoted into saved history');
check(await setLatestSessionId('legacy-single-consent') === false, 'legacy consent cannot select a saved-history record');
check(await archiveLatestSession() === true, 'archiving a legacy session succeeds');
check(await loadSessionById('legacy-single-consent') === null, 'archiving removes a legacy record that lacks the new history consent');
const pendingSave = saveSession({ sessionId: 'queued-before-wipe', consentGiven: true });
const pendingWipe = clearAllSessions();
check(await pendingSave === true, 'queued save completes before the following wipe');
check(await pendingWipe === true, 'full-store wipe completes after queued writes');
check(await getSessionCount() === 0, 'full-store wipe removes all session records');
check(await getSavedSessions().then((records) => records.length) === 0, 'full-store wipe empties the participant history view');
check(await loadLatestSession() === null, 'full-store wipe removes the resume pointer');

console.log(`IndexedDB session storage: ${passed} checks passed, 0 failed`);

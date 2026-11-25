import assert from 'node:assert/strict';
import rameshPersona, { rameshActivityDemoPersona } from '../src/data/demoPersona.js';

const visibleQuestions = rameshPersona.demoQuestionIds || [];
assert.equal(visibleQuestions.length, 7, 'the short and activity-inclusive walkthroughs share seven guided questions');
assert.equal(new Set(visibleQuestions).size, 7, 'guided demo question IDs are unique');
assert.equal(rameshPersona.skipVision, true, 'the short Ramesh demo intentionally skips optional vision activities');
assert.equal(rameshActivityDemoPersona.skipVision, false, 'the activity-inclusive Ramesh demo continues into vision activities');
assert.deepEqual(rameshActivityDemoPersona.demoQuestionIds, rameshPersona.demoQuestionIds, 'both demos use the same guided intake questions');
assert.deepEqual(rameshActivityDemoPersona.activities, rameshPersona.activities, 'both demos use the same activity profile');
assert.deepEqual(rameshActivityDemoPersona.primaryActivity, rameshPersona.primaryActivity, 'both demos retain the same primary activity');
assert.deepEqual(rameshActivityDemoPersona.answers, rameshPersona.answers, 'both demos share the same scripted source answers');
assert.deepEqual(rameshActivityDemoPersona.timelineEntries, rameshPersona.timelineEntries, 'both demos share the same explicitly scripted timeline data');

console.log('Demo walkthrough policy: 9 passed, 0 failed');

/**
 * SightSteps — Rule Engine Test Script
 * Tests evaluateAnswers output against Ramesh persona and a healthy-person persona.
 * Run with: node src/engine/testEngine.mjs
 */

// Inline the evaluateAnswers logic since we can't use ESM import directly in a simple node script.
// Instead, we replicate the test by importing the module.

import { evaluateAnswers } from './ruleEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

// ─── Test 1: Ramesh Persona ───
console.log('\n=== Test 1: Ramesh Persona ===');

const rameshAnswers = {
  blurred_vision: { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } },
  blur_distance: { value: 'near', label: { en: 'Near objects', hi: 'पास की चीज़ें' } },
  headaches: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
  screen_hours: { value: 'moderate', label: { en: '2-6 hours', hi: '2-6 घंटे' } },
  close_work: { value: 'daily', label: { en: 'Daily, for hours', hi: 'रोज़, घंटों' } },
  eye_exam: { value: 'never', label: { en: 'Never', hi: 'कभी नहीं' } },
  existing_glasses: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  age_group: { value: 'middle', label: { en: '40-55', hi: '40-55' } },
  night_vision: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
  squinting: { value: 'yes', label: { en: 'Yes, often', hi: 'हाँ, अक्सर' } },
  outdoor_time: { value: 'moderate', label: { en: 'A few hours', hi: 'कुछ घंटे' } },
  experience_frequency: { value: 'daily', label: { en: 'Every day', hi: 'रोज़' } },
  which_eye: { value: 'both', label: { en: 'Both eyes', hi: 'दोनों आँखें' } },
};

const rameshContext = {
  activities: ['fine_detail', 'reading', 'screen_work'],
  primaryActivity: 'fine_detail',
  participantNote: '',
};

const rameshResult = evaluateAnswers(rameshAnswers, rameshContext);

assert(rameshResult.answeredCount === 13, `answeredCount should be 13, got ${rameshResult.answeredCount}`);
assert(rameshResult.groups.length === 3, `should have 3 groups, got ${rameshResult.groups.length}`);

// Check experiences group exists
const expGroup = rameshResult.groups.find(g => g.id === 'experiences');
assert(expGroup, 'experiences group exists');
assert(expGroup && expGroup.observations.length >= 5, `experiences should have >=5 observations, got ${expGroup?.observations.length}`);

// Check daily habits group
const habitsGroup = rameshResult.groups.find(g => g.id === 'dailyHabits');
assert(habitsGroup, 'dailyHabits group exists');
assert(habitsGroup && habitsGroup.observations.length >= 3, `dailyHabits should have >=3 observations, got ${habitsGroup?.observations.length}`);

// Check eye care group
const eyeGroup = rameshResult.groups.find(g => g.id === 'eyeCare');
assert(eyeGroup, 'eyeCare group exists');

// Discussion points
assert(rameshResult.discussionPoints.length >= 2, `should have >=2 discussion points, got ${rameshResult.discussionPoints.length}`);

// Activity-based discussion point for fine_detail
const activityPoint = rameshResult.discussionPoints.find(p => p.id === 'primary_activity_context');
assert(activityPoint, 'has primary_activity_context discussion point');

// Screen comfort discussion point
const screenPoint = rameshResult.discussionPoints.find(p => p.id === 'screen_comfort');
assert(screenPoint, 'has screen_comfort discussion point');

// Follow-up notes
assert(rameshResult.followUpNotes.length >= 1, `should have >=1 follow-up notes, got ${rameshResult.followUpNotes.length}`);

// No previous exam note
const noExamNote = rameshResult.followUpNotes.find(n => n.id === 'no_previous_exam');
assert(noExamNote, 'has no_previous_exam follow-up note');

// Activities context
assert(rameshResult.activitiesContext, 'activitiesContext exists');
assert(rameshResult.activitiesContext?.selected.length === 3, `should have 3 selected activities, got ${rameshResult.activitiesContext?.selected.length}`);
assert(rameshResult.activitiesContext?.primary?.id === 'fine_detail', `primary should be fine_detail, got ${rameshResult.activitiesContext?.primary?.id}`);

// Traceability: each observation has question, answer, detail
if (expGroup) {
  expGroup.observations.forEach(obs => {
    assert(obs.question && obs.question.en, `observation ${obs.id} has question.en`);
    assert(obs.answer && obs.answer.en, `observation ${obs.id} has answer.en`);
    assert(obs.detail && obs.detail.en, `observation ${obs.id} has detail.en`);
    assert(obs.question.hi, `observation ${obs.id} has question.hi`);
    assert(obs.detail.hi, `observation ${obs.id} has detail.hi`);
  });
}

// ─── Test 2: Healthy Person (all "no" / minimal) ───
console.log('\n=== Test 2: Healthy Person ===');

const healthyAnswers = {
  blurred_vision: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  headaches: { value: 'rarely', label: { en: 'Rarely / Never', hi: 'कभी नहीं' } },
  squinting: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  screen_hours: { value: 'low', label: { en: 'Less than 2 hours', hi: '2 घंटे से कम' } },
  outdoor_time: { value: 'low', label: { en: 'Very little', hi: 'बहुत कम' } },
  close_work: { value: 'rarely', label: { en: 'Rarely', hi: 'बहुत कम' } },
  night_vision: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  existing_glasses: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  eye_exam: { value: 'recent', label: { en: 'Within last year', hi: 'पिछले साल' } },
  age_group: { value: 'adult', label: { en: '18-39', hi: '18-39' } },
};

const healthyResult = evaluateAnswers(healthyAnswers);

assert(healthyResult.answeredCount === 10, `healthy answeredCount should be 10, got ${healthyResult.answeredCount}`);
assert(healthyResult.groups.length >= 2, `healthy should have >=2 groups, got ${healthyResult.groups.length}`);

// No follow-up notes expected for healthy person with recent exam
assert(healthyResult.followUpNotes.length === 0, `healthy should have 0 follow-up notes, got ${healthyResult.followUpNotes.length}`);

// No discussion points for low screen/outdoor
assert(healthyResult.discussionPoints.length === 0, `healthy should have 0 discussion points, got ${healthyResult.discussionPoints.length}`);

// No activities context when not provided
assert(healthyResult.activitiesContext === null, 'healthy activitiesContext should be null');

// ─── Test 3: Empty answers ───
console.log('\n=== Test 3: Empty Answers ===');

const emptyResult = evaluateAnswers({});
assert(emptyResult.answeredCount === 0, `empty answeredCount should be 0, got ${emptyResult.answeredCount}`);
assert(emptyResult.groups.length === 0, `empty groups should be 0, got ${emptyResult.groups.length}`);
assert(emptyResult.discussionPoints.length === 0, `empty discussionPoints should be 0, got ${emptyResult.discussionPoints.length}`);
assert(emptyResult.followUpNotes.length === 0, `empty followUpNotes should be 0, got ${emptyResult.followUpNotes.length}`);

// ─── Test 4: Participant note flow ───
console.log('\n=== Test 4: Participant Note ===');

const noteResult = evaluateAnswers(rameshAnswers, {
  ...rameshContext,
  participantNote: 'My left eye feels strained after sewing.',
});
assert(noteResult.participantNote === 'My left eye feels strained after sewing.', 'participantNote flows through');

// ─── Test 5: Hindi content completeness ───
console.log('\n=== Test 5: Hindi Content ===');

if (expGroup) {
  expGroup.observations.forEach(obs => {
    assert(obs.question.hi && obs.question.hi.length > 0, `observation ${obs.id} has non-empty Hindi question`);
    assert(obs.detail.hi && obs.detail.hi.length > 0, `observation ${obs.id} has non-empty Hindi detail`);
  });
}

rameshResult.discussionPoints.forEach(dp => {
  assert(dp.title.hi && dp.title.hi.length > 0, `discussion point ${dp.id} has Hindi title`);
  assert(dp.context.hi && dp.context.hi.length > 0, `discussion point ${dp.id} has Hindi context`);
  assert(dp.prompt.hi && dp.prompt.hi.length > 0, `discussion point ${dp.id} has Hindi prompt`);
});

rameshResult.followUpNotes.forEach(note => {
  assert(note.title.hi && note.title.hi.length > 0, `follow-up ${note.id} has Hindi title`);
  assert(note.detail.hi && note.detail.hi.length > 0, `follow-up ${note.id} has Hindi detail`);
});

// ─── Summary ───
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(40)}\n`);

process.exit(failed > 0 ? 1 : 0);

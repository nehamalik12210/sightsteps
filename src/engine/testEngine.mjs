/**
 * SightSteps regression tests.
 * Run from the project root: node src/engine/testEngine.mjs
 * Tests the deterministic report engine and resume-route decisions.
 */

import { evaluateAnswers } from './ruleEngine.js';
import { getBackNavigationAnswerIds, getAmslerReturnPath, getNewSessionRedirect, getPendingSessionQuestion, getProtectedRouteRedirect, getResumePath } from '../utils/sessionRouting.js';
import questionBank, { getActivityDependentAnswerIds, getActivityLabel, getSelectedAdditionalExperienceIds, getNextQuestion, getQuestionForActivities, getProgress, getQuestionCompletionProgress, getVisibleQuestions, isAnswerComplete } from '../data/questions.js';
import strings from '../data/i18n.js';
import { createSessionRecord } from '../utils/storage.js';
import { hasKioskSessionExpired, shouldDiscardKioskSessionOnRestore, KIOSK_IDLE_LIMIT_MS } from '../utils/kioskPolicy.js';
import { normalizeVisionTimelineEntries, sortVisionTimelineEntries, validateVisionTimelineDraft, MAX_VISION_TIMELINE_ENTRIES } from '../utils/visionTimeline.js';
import rameshPersona from '../data/demoPersona.js';
import { buildAppointmentPreparationPack } from '../utils/appointmentPack.js';
import { normalizeDiscussionPriorities } from '../utils/reportPreferences.js';
import { getLocalSaveStatusCopy } from '../utils/saveStatus.js';
import { buildDirectionAwarenessResult } from '../utils/visionActivity.js';
import { evaluatePatterns } from './patternEngine.js';
import { buildVisionExperienceProfile, buildCompactExperienceSummary } from './visionExperienceProfile.js';
import {
  calculateGridSizePx,
  canCalibrateAmsler,
  doesCalibratedGridFit,
  getMaxCalibrationSliderWidth,
} from './amslerCalibration.js';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`  FAIL: ${label}`);
  }
}

const rameshAnswers = {
  blurred_vision: { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } },
  blur_distance: { value: 'near', label: { en: 'Near objects', hi: 'पास की चीज़ें' } },
  headaches: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
  screen_hours: { value: 'moderate', label: { en: '2–6 hours', hi: '2–6 घंटे' } },
  close_work: { value: 'daily', label: { en: 'Daily, for hours', hi: 'रोज़, कई घंटे' } },
  eye_exam: { value: 'never', label: { en: 'Never', hi: 'कभी नहीं' } },
  existing_glasses: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  age_group: { value: 'middle', label: { en: '40–55', hi: '40–55' } },
  night_vision: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
  squinting: { value: 'yes', label: { en: 'Yes, often', hi: 'हाँ, अक्सर' } },
  outdoor_time: { value: 'moderate', label: { en: 'A few hours', hi: 'कुछ घंटे' } },
  primary_concern: { value: 'blurred_vision', label: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' } },
  additional_concerns: { value: ['none'], label: { en: 'No other experience to add', hi: 'कोई अन्य अनुभव नहीं जोड़ना' } },
  experience_onset: { value: 'recent_months', label: { en: 'Within the last few months', hi: 'पिछले कुछ महीनों में' } },
  experience_change: { value: 'varies', label: { en: 'It varies', hi: 'इसमें उतार-चढ़ाव होता है' } },
  experience_context: { value: ['near_tasks', 'screens'], label: { en: 'Reading or other near tasks, Using screens', hi: 'पढ़ना या पास के काम, स्क्रीन का उपयोग' } },
  experience_frequency: { value: 'daily', label: { en: 'Every day', hi: 'रोज़' } },
  which_eye: { value: 'both', label: { en: 'Both eyes', hi: 'दोनों आँखें' } },
  affected_activities: { value: ['fine_detail'], label: { en: 'Fine-detail work & crafts', hi: 'बारीक काम और दस्तकारी' } },
  activity_impact_fine_detail: { value: ['takes_longer', 'adjustments'], label: { en: 'It takes me longer than usual, I need to adjust distance, lighting or position', hi: 'इसमें सामान्य से अधिक समय लगता है, मुझे दूरी, रोशनी या स्थिति बदलनी पड़ती है' } },
  activity_impact_frequency_fine_detail: { value: 'often', label: { en: 'Often', hi: 'अक्सर' } },
};

const rameshContext = {
  activities: ['fine_detail', 'reading', 'screen_work'],
  primaryActivity: 'fine_detail',
  participantNote: '',
};

console.log('\n=== Ramesh profile ===');
const rameshResult = evaluateAnswers(rameshAnswers, rameshContext);
assert(rameshResult.answeredCount === 21, `Ramesh should have 21 stored responses, got ${rameshResult.answeredCount}`);
assert(rameshResult.groups.length === 3, `Ramesh should have 3 non-empty groups, got ${rameshResult.groups.length}`);
const experienceGroup = rameshResult.groups.find((group) => group.id === 'experiences');
const habitGroup = rameshResult.groups.find((group) => group.id === 'dailyHabits');
const careGroup = rameshResult.groups.find((group) => group.id === 'eyeCare');
assert(Boolean(experienceGroup), 'experiences group exists');
assert(Boolean(habitGroup), 'daily habits group exists');
assert(Boolean(careGroup), 'eye-care group exists');
assert(experienceGroup?.observations.some((item) => item.id === 'affected_activities'), 'affected activities are shown in observations');
assert(habitGroup?.observations.length === 5, 'screen, outdoor, close-work, per-activity impact and frequency observations are present');
assert(rameshResult.activitiesContext?.selected.length === 3, 'three selected daily activities are returned');
assert(rameshResult.activitiesContext?.primary?.id === 'fine_detail', 'primary activity is returned');
assert(rameshResult.activitiesContext?.affected?.[0]?.id === 'fine_detail', 'affected activity is returned separately from routine');
assert(rameshResult.discussionPoints.some((point) => point.id === 'affected_activity_context'), 'affected-activity discussion point is generated');
assert(rameshResult.discussionPoints.some((point) => point.id === 'main_experience_timeline'), 'main concern, onset, change and context generate a structured discussion point');
assert(rameshResult.discussionPoints.some((point) => point.id === 'additional_experience_headaches' && point.sources.some((source) => source.id === 'headaches')), 'secondary reported experiences produce their own traceable discussion prompts');
assert(rameshResult.discussionPoints.some((point) => point.id === 'activity_impact_detail'), 'per-activity impact details generate a discussion point');
assert(rameshResult.activitiesContext?.impactDetails?.[0]?.impacts.includes('takes_longer'), 'per-activity impact choices are available to the report');
assert(rameshResult.activitiesContext?.impactDetails?.[0]?.frequency === 'often', 'per-activity impact frequency is available to the report');
assert(rameshResult.experienceProfiles?.find((item) => item.isPrimary)?.affectedActivities?.[0]?.frequency?.en === 'Often', 'primary experience profile includes linked activity-impact frequency');
assert(rameshResult.experienceProfiles?.length === 4, 'reported experiences are exposed as structured experience profiles');
assert(rameshResult.experienceProfiles?.find((item) => item.isPrimary)?.id === 'blurred_vision', 'the selected main experience is marked in the structured profile');
assert(rameshResult.experienceProfiles?.find((item) => item.isPrimary)?.affectedActivities?.[0]?.id === 'fine_detail', 'main experience profile links to selected affected activity details');
assert(rameshResult.discussionPoints.some((point) => point.id === 'primary_activity_context'), 'primary-activity discussion point is generated');
assert(rameshResult.discussionPoints.some((point) => point.id === 'screen_comfort'), 'screen discussion point is generated');
assert(rameshResult.discussionPoints.every((point) => Array.isArray(point.sources) && point.sources.length > 0), 'every discussion point has traceable source references');
assert(rameshResult.discussionPoints.find((point) => point.id === 'activity_impact_detail')?.sources.some((source) => source.id === 'activity_impact_frequency_fine_detail'), 'activity-impact discussion prompt cites its frequency response');
assert(rameshResult.discussionPoints.find((point) => point.id === 'main_experience_timeline')?.sources.some((source) => source.id === 'blurred_vision'), 'main-experience discussion prompt cites the original reported experience response');
assert(rameshResult.followUpNotes.some((note) => note.id === 'no_previous_exam'), 'no-previous-exam follow-up note exists');

console.log('\n=== Countable responses for guided demo ===');
const demoCount = evaluateAnswers(rameshAnswers, {
  ...rameshContext,
  countableQuestionIds: rameshPersona.demoQuestionIds,
});
assert(demoCount.answeredCount === 7, `guided demo count should be 7, got ${demoCount.answeredCount}`);
const visibleDemoIds = getVisibleQuestions(rameshAnswers).filter((question) => rameshPersona.demoQuestionIds.includes(question.id)).map((question) => question.id);
assert(visibleDemoIds.length === 7, `guided demo should display 7 questions, got ${visibleDemoIds.length}`);
assert(visibleDemoIds.includes('affected_activities'), 'guided demo includes affected-activities context');
assert(rameshPersona.timelineEntries?.length >= 2, 'guided demo seeds multiple participant-entered timeline records');
const demoExperienceProfile = buildVisionExperienceProfile(rameshPersona.answers, rameshPersona.timelineEntries);
assert(demoExperienceProfile.mainExperience?.id === 'blurred_vision', 'guided demo profile has a main reported experience');
assert(demoExperienceProfile.additionalExperiences.length > 0, 'guided demo profile has additional reported experiences');
assert(demoExperienceProfile.mainExperience?.contexts.length > 0, 'guided demo profile has reported situations');
assert(demoExperienceProfile.activityImpacts.length > 0, 'guided demo profile has activity-impact detail');
assert(demoExperienceProfile.timeline.totalEntries >= 2, 'guided demo profile includes participant-entered timeline examples');
assert(demoExperienceProfile.timeline.mainExperienceEntryCount >= 1, 'guided demo timeline links at least one entry to the main experience');

console.log('\n=== Healthy/minimal profile ===');
const healthyAnswers = {
  blurred_vision: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  headaches: { value: 'rarely', label: { en: 'Rarely / Never', hi: 'बहुत कम / कभी नहीं' } },
  squinting: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  screen_hours: { value: 'low', label: { en: 'Less than 2 hours', hi: '2 घंटे से कम' } },
  outdoor_time: { value: 'low', label: { en: 'Very little', hi: 'बहुत कम' } },
  close_work: { value: 'rarely', label: { en: 'Rarely', hi: 'बहुत कम' } },
  night_vision: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  existing_glasses: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  eye_exam: { value: 'recent', label: { en: 'Within the last year', hi: 'पिछले एक साल में' } },
  age_group: { value: 'adult', label: { en: '18–39', hi: '18–39' } },
};
const healthyResult = evaluateAnswers(healthyAnswers);
assert(healthyResult.followUpNotes.length === 0, 'minimal profile with recent exam has no follow-up flags');
assert(healthyResult.discussionPoints.length === 0, 'minimal profile without activity context has no discussion points');
assert(healthyResult.activitiesContext === null, 'no activity context is returned when none was supplied');

console.log('\n=== None/unsure affected-activity choices ===');
const noAffectedResult = evaluateAnswers({
  ...rameshAnswers,
  affected_activities: { value: ['none'], label: { en: 'None of these', hi: 'इनमें से कोई नहीं' } },
}, rameshContext);
assert(!noAffectedResult.discussionPoints.some((point) => point.id === 'affected_activity_context'), 'none choice does not generate an affected-activity prompt');
assert(noAffectedResult.activitiesContext?.affectedStatus === 'none', 'none status is retained for the report');

const unsureResult = evaluateAnswers({
  ...rameshAnswers,
  affected_activities: { value: ['unsure'], label: { en: 'Not sure', hi: 'निश्चित नहीं' } },
}, rameshContext);
assert(!unsureResult.discussionPoints.some((point) => point.id === 'affected_activity_context'), 'unsure choice does not generate an affected-activity prompt');
assert(unsureResult.activitiesContext?.affectedStatus === 'unsure', 'unsure status is retained for the report');

console.log('\n=== Empty input and participant note ===');
const emptyResult = evaluateAnswers({});
assert(emptyResult.answeredCount === 0, 'empty input has zero answered responses');
assert(emptyResult.groups.length === 0, 'empty input has no groups');
assert(emptyResult.discussionPoints.length === 0, 'empty input has no discussion points');
const noteText = 'My left eye feels strained after sewing.';
const noteResult = evaluateAnswers(rameshAnswers, { ...rameshContext, participantNote: noteText });
assert(noteResult.participantNote === noteText, 'participant note is passed through');

console.log('\n=== Hindi content completeness ===');
for (const group of rameshResult.groups) {
  assert(Boolean(group.title.hi && group.description.hi), `${group.id} group has Hindi content`);
  for (const observation of group.observations) {
    assert(Boolean(observation.question.hi && observation.answer.hi && observation.detail.hi), `${observation.id} observation has Hindi content`);
  }
}
for (const point of rameshResult.discussionPoints) {
  assert(Boolean(point.title.hi && point.context.hi && point.prompt.hi), `${point.id} discussion point has Hindi content`);
}
for (const note of rameshResult.followUpNotes) {
  assert(Boolean(note.title.hi && note.detail.hi), `${note.id} follow-up has Hindi content`);
}

console.log('\n=== Vision timeline validation and ordering ===');
const validTimelineDraft = {
  date: '2026-11-16',
  time: '09:30',
  experienceId: 'blurred_vision',
  experienceLabel: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' },
  context: 'Reading',
  impact: 'Needed to pause and adjust the page position.',
};
assert(validateVisionTimelineDraft(validTimelineDraft, { today: '2026-11-17' }) === null, 'valid participant timeline entry passes validation');
assert(validateVisionTimelineDraft({ ...validTimelineDraft, date: '2026-11-18' }, { today: '2026-11-17' }) === 'futureDate', 'future timeline dates are rejected');
assert(validateVisionTimelineDraft({ ...validTimelineDraft, date: '2026-02-30' }, { today: '2026-11-17' }) === 'date', 'impossible calendar dates are rejected');
assert(validateVisionTimelineDraft({ ...validTimelineDraft, time: '25:70' }, { today: '2026-11-17' }) === 'time', 'invalid approximate times are rejected');
assert(validateVisionTimelineDraft({ ...validTimelineDraft, experienceLabel: '' }, { today: '2026-11-17' }) === 'experience', 'timeline entries require a described experience');
assert(validateVisionTimelineDraft({ ...validTimelineDraft, context: 'x'.repeat(161) }, { today: '2026-11-17' }) === 'contextTooLong', 'timeline context length is bounded');
assert(validateVisionTimelineDraft({ ...validTimelineDraft, impact: 'x'.repeat(601) }, { today: '2026-11-17' }) === 'impactTooLong', 'timeline note length is bounded');

const unsortedTimeline = [
  { id: 'older', date: '2026-11-12', time: '', experienceId: 'blurred_vision', experienceLabel: 'Blurred vision' },
  { id: 'newer', date: '2026-11-16', time: '09:30', experienceId: 'headaches', experienceLabel: 'Headaches' },
];
assert(sortVisionTimelineEntries(unsortedTimeline)[0].id === 'newer', 'timeline entries sort newest first');
const normalizedTimeline = normalizeVisionTimelineEntries(unsortedTimeline.concat([
  { id: 'invalid', date: '2026-02-30', experienceId: 'other', experienceLabel: 'Invalid' },
]));
assert(normalizedTimeline.length === 2, 'malformed timeline entries are excluded from persisted data');

const duplicateTimeline = normalizeVisionTimelineEntries([
  { id: 'duplicate-id', date: '2026-11-12', time: '', experienceId: 'other', experienceLabel: 'Older version' },
  { id: 'duplicate-id', date: '2026-11-16', time: '', experienceId: 'other', experienceLabel: 'Newest version' },
  null,
]);
assert(duplicateTimeline.length === 1 && duplicateTimeline[0].experienceLabel === 'Newest version', 'timeline normalization keeps only the newest valid row for each ID');
assert(sortVisionTimelineEntries([null, unsortedTimeline[0]]).length === 1, 'timeline sorting safely ignores non-object rows');
const overflowTimeline = Array.from({ length: MAX_VISION_TIMELINE_ENTRIES + 5 }, (_, index) => ({
  id: 'entry-' + index,
  date: '2026-11-16',
  time: '',
  experienceId: 'other',
  experienceLabel: 'Participant note',
}));
assert(normalizeVisionTimelineEntries(overflowTimeline).length === MAX_VISION_TIMELINE_ENTRIES, 'persisted timeline is capped at its configured entry limit');

const packTimeline = Array.from({ length: 7 }, (_, index) => ({
  id: 'pack-entry-' + (index + 1),
  date: `2026-11-${String(index + 1).padStart(2, '0')}`,
  time: '09:30',
  experienceId: 'blurred_vision',
  experienceLabel: { en: 'Blurred vision', hi: 'धुंधला दिखाई देना' },
  context: 'Reading',
  impact: 'Needed to pause.',
}));
const preparationPack = buildAppointmentPreparationPack({
  language: 'en',
  priorities: [
    { id: 'blurred_vision', label: { en: 'Blurred vision', hi: 'धुंधला दिखाई देना' } },
    { id: 'headaches', label: { en: 'Headaches', hi: 'सिरदर्द' } },
    { id: 'squinting', label: { en: 'Squinting', hi: 'आँखें सिकोड़ना' } },
  ],
  activities: ['Reading', 'Screen work', 'Driving', 'Outdoor', 'Other', 'Extra'],
  discussionPoints: Array.from({ length: 4 }, (_, index) => ({
    id: 'topic-' + index,
    title: { en: 'Topic ' + index, hi: 'विषय ' + index },
    context: { en: 'Context ' + index, hi: 'संदर्भ ' + index },
    prompt: { en: 'Prompt ' + index, hi: 'सवाल ' + index },
    sources: index === 0 ? [{
      id: 'blurred_vision',
      label: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' },
      answer: { en: 'Yes', hi: 'हाँ' },
    }] : [],
  })),
  questionsToAsk: 'Q'.repeat(520),
  conversationReview: { confirmed: true, correction: 'The blur also affects jewellery making.' },
  timelineEntries: packTimeline,
  now: new Date('2026-11-18T10:00:00.000Z'),
});
assert(preparationPack.priorities.length === 2, 'appointment pack keeps no more than two participant priorities');
assert(preparationPack.activities.length === 5, 'appointment pack keeps the compact activity context within five items');
assert(preparationPack.discussionPoints.length === 3, 'appointment pack keeps the three most relevant discussion prompts');
assert(preparationPack.discussionPoints[0].sources[0]?.id === 'blurred_vision', 'appointment pack preserves discussion source identifiers');
assert(preparationPack.discussionPoints[0].sources[0]?.label === 'Blurred or unclear vision' && preparationPack.discussionPoints[0].sources[0]?.answer === 'Yes', 'appointment pack localizes and preserves source labels and answers');
assert(preparationPack.questionsToAsk.length <= 480, 'appointment pack bounds the personal question text');
assert(preparationPack.conversationReview.confirmed === true, 'appointment pack preserves participant summary confirmation');
assert(preparationPack.conversationReview.correction.includes('jewellery making'), 'appointment pack preserves participant corrections within its bounded review record');
const compactQuestionPack = buildAppointmentPreparationPack({ language: 'en', questionsToAsk: '  Can   we\n review  this?  ' });
assert(compactQuestionPack.questionsToAsk === 'Can we review this?', 'appointment pack collapses repeated whitespace in personal questions');
assert(preparationPack.timelineEntries.length === 5 && preparationPack.timelineEntries[0].id === 'pack-entry-7', 'appointment pack includes only the five newest timeline entries');
assert(preparationPack.timelineEntries[0].dateValue === '2026-11-07', 'appointment pack timeline dates remain machine-readable');
assert(preparationPack.language === 'en' && Boolean(preparationPack.preparedDate), 'appointment pack retains language and preparation date');
const hindiPack = buildAppointmentPreparationPack({ language: 'hi', priorities: [{ id: 'x', label: { en: 'Blurred vision', hi: 'धुंधला दिखाई देना' } }], now: new Date('2026-11-18T10:00:00.000Z') });
assert(hindiPack.priorities[0].label === 'धुंधला दिखाई देना', 'appointment pack uses Hindi labels when Hindi is selected');

assert(
  JSON.stringify(normalizeDiscussionPriorities(
    ['blurred_vision', 'old_concern', 'blurred_vision', 'headaches', 'squinting'],
    ['blurred_vision', 'headaches', 'squinting'],
  )) === JSON.stringify(['blurred_vision', 'headaches']),
  'report priorities discard stale and duplicate concerns and remain capped at two',
);
assert(
  normalizeDiscussionPriorities(['old_concern'], ['blurred_vision']).length === 0,
  'report priorities clear when none of the saved choices remain reported',
);

console.log('\n=== Saved session record completeness ===');
assert(getLocalSaveStatusCopy('saving', 'en')?.text === 'Saving on this device…', 'save status exposes an English saving state');
assert(getLocalSaveStatusCopy('saved', 'hi')?.text === 'इसी डिवाइस पर सहेजा गया', 'save status exposes a Hindi saved state');
assert(getLocalSaveStatusCopy('error', 'en')?.tone === 'error', 'save failure is distinguishable from a successful save');
assert(getLocalSaveStatusCopy('idle', 'en') === null, 'idle sessions do not display a redundant save message');
assert(getLocalSaveStatusCopy('saved', 'fr')?.text === 'Saved on this device', 'save status safely falls back to English for unsupported languages');

const savedRecord = createSessionRecord({
  sessionId: 'test-session',
  activities: ['fine_detail', 'reading'],
  primaryActivity: 'fine_detail',
  participantNote: 'Strain after sewing',
  answers: rameshAnswers,
  conversationReview: { confirmed: true, correction: 'Mention stitching work.' },
  language: 'hi',
});
assert(savedRecord.activities.length === 2, 'saved record includes selected daily activities');
assert(savedRecord.primaryActivity === 'fine_detail', 'saved record includes primary activity');
assert(savedRecord.participantNote === 'Strain after sewing', 'saved record includes participant note');
assert(savedRecord.answers === rameshAnswers, 'saved record includes questionnaire answers');
assert(savedRecord.conversationReview.confirmed === true && savedRecord.conversationReview.correction === 'Mention stitching work.', 'saved record preserves participant confirmation and correction');
assert(Array.isArray(savedRecord.visionTimelineEntries) && savedRecord.visionTimelineEntries.length === 0, 'saved record safely defaults to an empty vision timeline');

console.log('\n=== Questionnaire branching and answer validity ===');
assert(!isAnswerComplete({ value: undefined }), 'legacy undefined answer is treated as unanswered');
assert(!isAnswerComplete({ value: [] }), 'empty multi-select answer is treated as unanswered');
assert(isAnswerComplete({ value: '' }), 'empty optional note can be intentionally skipped');
assert(getNextQuestion({ blurred_vision: { value: undefined } })?.id === 'blurred_vision', 'next-question selection ignores legacy undefined answer objects');
const noBlurQuestions = getVisibleQuestions({ blurred_vision: { value: 'no' } });
assert(!noBlurQuestions.some((question) => question.id === 'blur_distance'), 'near/far question stays hidden when blur is not reported');
assert(!noBlurQuestions.some((question) => question.id === 'affected_activities'), 'affected-activity question stays hidden when no experience is reported');
const headacheQuestions = getVisibleQuestions({ headaches: { value: 'sometimes' } });
assert(headacheQuestions.some((question) => question.id === 'primary_concern'), 'main concern selection is shown for a reported experience');
const reportedOptions = getVisibleQuestions({ blurred_vision: { value: 'yes' }, headaches: { value: 'rarely' } }).find((question) => question.id === 'primary_concern')?.options || [];
assert(reportedOptions.length === 1 && reportedOptions[0].value === 'blurred_vision', 'main concern choices are limited to experiences the participant reported');
const headacheFollowUps = getVisibleQuestions({ headaches: { value: 'sometimes' }, primary_concern: { value: 'headaches' } });
assert(headacheFollowUps.some((question) => question.id === 'affected_activities'), 'affected-activity question is shown after a main concern is selected');

const multiConcernAnswers = {
  blurred_vision: { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } },
  headaches: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
  night_vision: { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } },
  squinting: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
  primary_concern: { value: 'blurred_vision', label: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' } },
  additional_concerns: { value: ['headaches', 'night_vision'], label: { en: 'Headaches, Difficulty in low light', hi: 'सिरदर्द, कम रोशनी में कठिनाई' } },
};
const multiConcernQuestions = getVisibleQuestions(multiConcernAnswers);
const additionalIds = multiConcernQuestions.map((question) => question.id);
assert(additionalIds.includes('additional_experience_headaches_onset'), 'selecting headaches as a secondary concern creates its own onset question');
assert(additionalIds.includes('additional_experience_headaches_frequency'), 'secondary headache follow-up includes frequency');
assert(additionalIds.includes('additional_experience_headaches_context'), 'secondary headache follow-up includes context');
assert(!additionalIds.includes('additional_experience_headaches_eye'), 'secondary headache follow-up does not ask an inapplicable eye-side question');
assert(additionalIds.includes('additional_experience_night_vision_eye'), 'another secondary experience includes an eye-side follow-up');
assert(!getVisibleQuestions({ ...multiConcernAnswers, additional_concerns: { value: ['none'] } }).some((question) => question.id.startsWith('additional_experience_')), 'choosing no additional experience does not generate secondary follow-ups');
assert(getSelectedAdditionalExperienceIds({ ...multiConcernAnswers, headaches: { value: 'rarely' } }).includes('headaches') === false, 'secondary selection is ignored when its originating experience is no longer reported');
const otherActivityQuestion = questionBank.find((question) => question.id === 'affected_activities');
const customActivityAnswers = { custom_activity_name: { value: 'Jewellery making', label: { en: 'Jewellery making', hi: 'आभूषण बनाना' } } };
const customActivityOptions = getQuestionForActivities(otherActivityQuestion, ['other'], customActivityAnswers).options;
assert(customActivityOptions.find((option) => option.value === 'other')?.label.en === 'Jewellery making', 'affected-activity choice uses the participant-defined Other activity label');
assert(getActivityLabel('other', customActivityAnswers)?.en === 'Jewellery making', 'custom activity helper resolves participant wording');
assert(getActivityLabel('other', customActivityAnswers)?.hi === 'आभूषण बनाना', 'custom activity helper retains the participant-entered Hindi wording');

const customActivityContextAnswers = {
  ...customActivityAnswers,
  affected_activities: { value: ['other'], label: { en: 'Other', hi: 'अन्य' } },
  activity_impact_other: { value: ['takes_longer'], label: { en: 'It takes longer than usual', hi: 'इसमें सामान्य से अधिक समय लगता है' } },
};
const customActivityReport = evaluateAnswers(customActivityContextAnswers, {
  activities: ['other'],
  primaryActivity: 'other',
});
const customAffectedTopic = customActivityReport.discussionPoints.find((point) => point.id === 'affected_activity_context');
const customPrimaryTopic = customActivityReport.discussionPoints.find((point) => point.id === 'primary_activity_context');
assert(customAffectedTopic?.sources.some((source) => source.id === 'custom_activity_name' && source.label.en === 'Participant-entered activity name' && source.answer.en === 'Jewellery making' && source.answer.hi === 'आभूषण बनाना'), 'affected-activity topic cites the actual participant-entered Other activity name in both languages');
assert(customPrimaryTopic?.sources.some((source) => source.id === 'custom_activity_name' && source.answer.en === 'Jewellery making'), 'primary-activity topic cites the actual participant-entered Other activity name');
const customActivityHindiPack = buildAppointmentPreparationPack({
  language: 'hi',
  discussionPoints: [customAffectedTopic],
});
assert(customActivityHindiPack.discussionPoints[0].sources.some((source) => source.id === 'custom_activity_name' && source.label === 'प्रतिभागी द्वारा दर्ज गतिविधि का नाम' && source.answer === 'आभूषण बनाना'), 'Hindi appointment pack retains the custom activity source label and answer');

const savedDirectionResult = { completed: true, skipped: false, data: { activityType: 'direction-awareness' } };
assert(getAmslerReturnPath(savedDirectionResult) === '/report', 'Amsler returns to the report after a completed E activity');
assert(getAmslerReturnPath({ skipped: true }) === '/report', 'Amsler returns to the report after a skipped E activity');
assert(getAmslerReturnPath(null) === '/vision', 'Amsler returns to the E activity when it was opened before E completion');
assert(getAmslerReturnPath({ completed: true, data: { activityType: 'other' } }) === '/vision', 'Amsler does not treat unrelated activity results as E-test completion');
const directionResultFixture = buildDirectionAwarenessResult({ left: [{ correct: true }, { correct: false }], right: [{ correct: true }] });
assert(directionResultFixture.completed === true && directionResultFixture.data.activityType === 'direction-awareness', 'direction result builder marks the E activity as completed');
assert(directionResultFixture.data.left.correct === 1 && directionResultFixture.data.left.total === 2, 'direction result builder preserves left-round counts and trials');
assert(directionResultFixture.data.right.correct === 1 && directionResultFixture.data.right.total === 1, 'direction result builder preserves right-round counts and trials');
assert(buildDirectionAwarenessResult({}).data.left.total === 0 && buildDirectionAwarenessResult({}).data.right.total === 0, 'direction result builder safely handles empty round data');

console.log('\n=== Resume routing regressions ===');
assert(getResumePath({ activities: [], primaryActivity: null, answers: {} }) === '/activities', 'new session resumes at activity profile');
assert(getResumePath({ activities: ['reading'], primaryActivity: null, answers: {} }) === '/activities', 'session without primary activity returns to activity profile');
assert(getResumePath({ activities: ['reading'], primaryActivity: 'reading', answers: {} }) === '/intake', 'completed activity profile resumes at intake');
const completedNormalAnswers = { ...rameshAnswers, participant_note: { value: '', label: { en: '', hi: '' } } };
assert(getResumePath({ activities: ['fine_detail'], primaryActivity: 'fine_detail', answers: completedNormalAnswers }) === '/vision', 'completed questionnaire resumes at optional direction activity');
assert(getResumePath({ activities: ['fine_detail'], primaryActivity: 'fine_detail', answers: {}, visionResults: { skipped: true } }) === '/report', 'completed or skipped direction activity resumes at report');
assert(getResumePath({ isDemo: true, demoPersona: rameshPersona, answers: {}, activities: rameshPersona.activities, primaryActivity: rameshPersona.primaryActivity }) === '/intake', 'demo resume returns to scripted intake flow');
assert(getProtectedRouteRedirect({}) === '/', 'protected pages send a cleared or unconsented session to Landing');
assert(getNewSessionRedirect({ sessionId: 'active' }) === '/', 'an active session cannot be overwritten by opening onboarding directly');
assert(getNewSessionRedirect({ sessionId: null }) === null, 'a new session can enter onboarding when no participant session is active');
assert(getNewSessionRedirect({ sessionId: 'new-session' }, true) === null, 'a newly-started journey explicitly marked by Landing is allowed through onboarding');
assert(getNewSessionRedirect({ sessionId: 'active' }, true) === null, 'the fresh-journey marker prevents a redirect race after consent creates the session');
assert(getNewSessionRedirect({ sessionId: 'active' }, false) === '/', 'a direct onboarding visit with an existing session still returns to Landing');
assert(getNewSessionRedirect({ sessionId: null }, false) === null, 'a cleared session can enter onboarding without a marker');
assert(getProtectedRouteRedirect({ sessionId: 's', consentGiven: true }, { requireProfile: true }) === '/activities', 'protected intake route requires a completed activity profile');
assert(getProtectedRouteRedirect({ sessionId: 's', consentGiven: true, activities: ['reading'], primaryActivity: 'reading', answers: {} }, { requireProfile: true, requireIntake: true }) === '/intake', 'protected vision route returns to the first unanswered question');
assert(getProtectedRouteRedirect({ sessionId: 's', consentGiven: true, activities: ['reading'], primaryActivity: 'reading', answers: completedNormalAnswers }, { requireProfile: true, requireIntake: true, requireVision: true }) === '/vision', 'protected report route requires the optional direction step to be completed or skipped');
assert(getProtectedRouteRedirect({ sessionId: 's', consentGiven: true, activities: ['reading'], primaryActivity: 'reading', answers: completedNormalAnswers, visionResults: { skipped: true } }, { requireProfile: true, requireIntake: true, requireVision: true }) === null, 'complete session is allowed to open the report');
const demoProtectedSession = { sessionId: 'demo', consentGiven: true, isDemo: true, demoPersona: rameshPersona, activities: rameshPersona.activities, primaryActivity: rameshPersona.primaryActivity, answers: rameshAnswers };
assert(getPendingSessionQuestion(demoProtectedSession) === null, 'demo route guard ignores hidden scripted questions and checks only visible demo steps');
assert(getProtectedRouteRedirect(demoProtectedSession, { requireProfile: true, requireIntake: true, requireVision: true }) === null, 'demo can reach its report while its explicitly skipped vision activity is being recorded');


// Back-navigation invalidation must not lose completed work before the edit point.
const branchEditAnswers = {
  blurred_vision: { value: 'yes' },
  headaches: { value: 'sometimes' },
  primary_concern: { value: 'headaches' },
  which_eye: { value: 'left' }, // stale conditional answer: headaches do not show which_eye
  experience_onset: { value: 'recent_weeks' },
  activity_impact_reading: { value: ['discomfort'] },
  activity_impact_frequency_reading: { value: 'often' },
};
const branchEditQuestions = getVisibleQuestions(branchEditAnswers, ['reading']);
const clearAfterPrimary = getBackNavigationAnswerIds(branchEditQuestions, 'experience_onset', branchEditAnswers);
assert(clearAfterPrimary.includes('which_eye'), 'backtracking clears hidden answers from a changed conditional branch');
assert(clearAfterPrimary.includes('activity_impact_reading'), 'backtracking before activity details clears downstream dynamic answers');
assert(!clearAfterPrimary.includes('blurred_vision'), 'backtracking preserves answers before the edit point');

const multiActivityAnswers = {
  affected_activities: { value: ['reading', 'fine_detail'] },
  activity_impact_reading: { value: ['discomfort'] },
  activity_impact_frequency_reading: { value: 'often' },
  activity_impact_fine_detail: { value: ['takes_longer'] },
  activity_impact_frequency_fine_detail: { value: 'sometimes' },
};
const multiActivityQuestions = getVisibleQuestions(multiActivityAnswers, ['reading', 'fine_detail']);
const clearFineDetail = getBackNavigationAnswerIds(
  multiActivityQuestions,
  'activity_impact_frequency_fine_detail',
  multiActivityAnswers,
);
assert(clearFineDetail.includes('activity_impact_fine_detail'), 'backtracking revisits the selected activity impact answer');
assert(clearFineDetail.includes('activity_impact_frequency_fine_detail'), 'backtracking clears the affected activity frequency');
assert(!clearFineDetail.includes('activity_impact_reading'), 'backtracking preserves earlier activity-impact responses');
assert(!clearFineDetail.includes('activity_impact_frequency_reading'), 'backtracking preserves earlier activity frequency');
assert(getBackNavigationAnswerIds([{ id: 'only-question' }], 'only-question').length === 0, 'backtracking from the first question does not clear answers');

console.log('\n=== Full questionnaire branch matrix ===');
for (const value of ['yes', 'sometimes']) {
  const visible = getVisibleQuestions({ blurred_vision: { value } });
  assert(visible.some((question) => question.id === 'blur_distance'), `blur distance is visible for blur=${value}`);
}
for (const value of ['no']) {
  const visible = getVisibleQuestions({ blurred_vision: { value } });
  assert(!visible.some((question) => question.id === 'blur_distance'), `blur distance is hidden for blur=${value}`);
}
const experienceSources = [
  ['blurred_vision', 'yes'],
  ['headaches', 'sometimes'],
  ['squinting', 'yes'],
  ['night_vision', 'sometimes'],
];
for (const [questionId, value] of experienceSources) {
  const visible = getVisibleQuestions({ [questionId]: { value } });
  assert(visible.some((question) => question.id === 'primary_concern'), `${questionId}=${value} reveals main concern selection`);
  const concernFollowUps = getVisibleQuestions({ [questionId]: { value }, primary_concern: { value: questionId } });
  const expectedFollowUps = questionId === 'headaches'
    ? ['experience_onset', 'experience_change', 'experience_context', 'experience_frequency', 'affected_activities']
    : ['experience_onset', 'experience_change', 'experience_context', 'experience_frequency', 'which_eye', 'affected_activities'];
  for (const followUpId of expectedFollowUps) {
    assert(concernFollowUps.some((question) => question.id === followUpId), `${questionId}=${value} reveals ${followUpId} after main concern selection`);
  }
}
const noReportedExperience = getVisibleQuestions({
  blurred_vision: { value: 'no' },
  headaches: { value: 'rarely' },
  squinting: { value: 'no' },
  night_vision: { value: 'no' },
});
for (const questionId of ['primary_concern', 'experience_onset', 'experience_change', 'experience_context', 'experience_frequency', 'which_eye', 'affected_activities']) {
  assert(!noReportedExperience.some((question) => question.id === questionId), `${questionId} stays hidden with no reported experience`);
}
const glassesAnswers = getVisibleQuestions({ existing_glasses: { value: 'glasses' } });
assert(glassesAnswers.some((question) => question.id === 'glasses_age'), 'prescription age appears for glasses users');
const noGlassesAnswers = getVisibleQuestions({ existing_glasses: { value: 'no' } });
assert(!noGlassesAnswers.some((question) => question.id === 'glasses_age'), 'prescription age is hidden when no correction is reported');

console.log('\n=== Affected activity option scoping ===');
const affectedQuestion = questionBank.find((question) => question.id === 'affected_activities');
const scopedQuestion = getQuestionForActivities(affectedQuestion, ['reading', 'fine_detail']);
assert(scopedQuestion.options.map((option) => option.value).join(',') === 'reading,fine_detail,none,unsure', 'affected-activity options are limited to selected activities plus none/unsure');
assert(getQuestionForActivities(affectedQuestion, []).options.map((option) => option.value).join(',') === 'none,unsure', 'no routine activities exposes only none/unsure choices');
assert(getQuestionForActivities(questionBank[0], ['reading']) === questionBank[0], 'unrelated questions are returned unchanged');
const activityImpactBaseAnswers = { primary_concern: { value: 'blurred_vision' }, affected_activities: { value: ['reading', 'fine_detail'] } };
const activityImpactQuestions = getVisibleQuestions(activityImpactBaseAnswers);
assert(activityImpactQuestions.some((question) => question.id === 'activity_impact_reading'), 'a dedicated impact follow-up is generated for each affected activity');
assert(activityImpactQuestions.some((question) => question.id === 'activity_impact_fine_detail'), 'multiple selected activities receive their own impact follow-up');
assert(!activityImpactQuestions.some((question) => question.id === 'activity_impact_driving'), 'unselected activities do not receive an impact follow-up');
assert(!activityImpactQuestions.some((question) => question.id === 'activity_impact_frequency_reading'), 'impact frequency is not asked before a positive impact is selected');
const positiveImpactQuestions = getVisibleQuestions({ ...activityImpactBaseAnswers, activity_impact_reading: { value: ['takes_longer'] } });
assert(positiveImpactQuestions.some((question) => question.id === 'activity_impact_frequency_reading'), 'impact frequency appears after a positive impact is selected');
const noImpactQuestions = getVisibleQuestions({ ...activityImpactBaseAnswers, activity_impact_reading: { value: ['none'] } });
assert(!noImpactQuestions.some((question) => question.id === 'activity_impact_frequency_reading'), 'impact frequency stays hidden when participant reports no impact');
const unsureImpactQuestions = getVisibleQuestions({ ...activityImpactBaseAnswers, activity_impact_reading: { value: ['unsure'] } });
assert(!unsureImpactQuestions.some((question) => question.id === 'activity_impact_frequency_reading'), 'impact frequency stays hidden when participant is unsure about impact');
const staleActivityAnswers = {
  affected_activities: { value: ['reading'] },
  activity_impact_reading: { value: ['discomfort'] },
  activity_impact_frequency_reading: { value: 'often' },
  blurred_vision: { value: 'yes' },
};
assert(getActivityDependentAnswerIds(staleActivityAnswers, ['reading'], ['reading']).length === 0, 'unchanged activity profile retains its contextual answers');
assert(getActivityDependentAnswerIds(staleActivityAnswers, ['reading'], ['screen_work']).sort().join(',') === 'activity_impact_frequency_reading,activity_impact_reading,affected_activities', 'editing daily activities clears only activity-dependent follow-ups');

console.log('\n=== Questionnaire and translation schema audit ===');
const ids = questionBank.map((question) => question.id);
assert(new Set(ids).size === ids.length, 'question IDs are unique');
for (const question of questionBank) {
  assert(Boolean(question.text?.en?.trim() && question.text?.hi?.trim()), `${question.id} has English and Hindi question text`);
  assert(['single', 'multi', 'textarea'].includes(question.type), `${question.id} uses a supported question type`);
  if (question.type !== 'textarea') {
    assert(question.options.length > 0, `${question.id} has answer options`);
    const optionIds = question.options.map((option) => option.value);
    assert(new Set(optionIds).size === optionIds.length, `${question.id} option values are unique`);
    for (const option of question.options) {
      assert(Boolean(option.label?.en?.trim() && option.label?.hi?.trim()), `${question.id}/${option.value} has bilingual option labels`);
      assert(Boolean(option.icon?.trim()), `${question.id}/${option.value} has a Material Symbols name`);
    }
  }
}
for (const [key, entry] of Object.entries(strings)) {
  assert(Boolean(entry.en?.trim()), `${key} has English copy`);
  assert(Boolean(entry.hi?.trim()), `${key} has Hindi copy`);
}
for (const questionId of rameshPersona.demoQuestionIds) {
  assert(ids.includes(questionId), `demo question ${questionId} exists in the question bank`);
  assert(Boolean(rameshPersona.answers[questionId]), `demo question ${questionId} has a scripted answer`);
}

console.log('\n=== Progress and answer-shape edge cases ===');
const zeroProgress = getProgress({});
assert(zeroProgress.answered === 0 && zeroProgress.total > 0 && zeroProgress.fraction === 0, 'empty progress starts at zero');
const skippedNoteProgress = getProgress({ participant_note: { value: '' } });
assert(skippedNoteProgress.answered === 1, 'intentionally skipped optional note counts as complete');
assert(!isAnswerComplete({ value: null }), 'null response is treated as unanswered');
assert(!isAnswerComplete(null), 'missing response is treated as unanswered');
assert(isAnswerComplete({ value: ['reading'] }), 'non-empty multi-select response is complete');
const sevenQuestionFixture = Array.from({ length: 7 }, (_, index) => ({ id: `q${index + 1}` }));
const sixCompletedAnswers = Object.fromEntries(sevenQuestionFixture.slice(0, 6).map((question) => [question.id, { value: 'answered' }]));
const beforeFinalAnswer = getQuestionCompletionProgress(sevenQuestionFixture, sixCompletedAnswers);
assert(beforeFinalAnswer.completed === 6 && beforeFinalAnswer.total === 7 && beforeFinalAnswer.percent === 86, 'the seventh active question shows 6 of 7 completed and 86 percent before its answer is submitted');
const afterFinalAnswer = getQuestionCompletionProgress(sevenQuestionFixture, { ...sixCompletedAnswers, q7: { value: 'answered' } });
assert(afterFinalAnswer.completed === 7 && afterFinalAnswer.total === 7 && afterFinalAnswer.percent === 100, 'progress reaches 7 of 7 and 100 percent after the final answer is submitted');
const firstAnswerProgress = getQuestionCompletionProgress(sevenQuestionFixture, { q1: { value: 'answered' } });
assert(firstAnswerProgress.completed === 1 && firstAnswerProgress.total === 7 && firstAnswerProgress.percent === 14, 'one completed answer out of seven rounds to 14 percent');
const noAnswersProgress = getQuestionCompletionProgress(sevenQuestionFixture, {});
assert(noAnswersProgress.completed === 0 && noAnswersProgress.total === 7 && noAnswersProgress.percent === 0, 'no completed answers produce zero progress');
const emptyCompletionProgress = getQuestionCompletionProgress([], {});
assert(emptyCompletionProgress.completed === 0 && emptyCompletionProgress.total === 0 && emptyCompletionProgress.percent === 0, 'empty visible question list has zero progress without division errors');
const shortBranch = getVisibleQuestions({ blurred_vision: { value: 'no' } });
const shortBranchProgress = getQuestionCompletionProgress(shortBranch, { [shortBranch[0].id]: { value: 'yes' } });
assert(shortBranchProgress.completed === 1 && shortBranchProgress.percent === Math.round(100 / shortBranch.length), 'completed-question percentage uses the current short conditional branch total');
const longBranch = getVisibleQuestions({ blurred_vision: { value: 'yes' } });
const longBranchProgress = getQuestionCompletionProgress(longBranch, { [longBranch[0].id]: { value: 'yes' } });
assert(longBranchProgress.completed === 1 && longBranchProgress.percent === Math.round(100 / longBranch.length), 'completed-question percentage recalculates when conditional questions are visible');

console.log('\n=== Traceability schema and non-diagnostic output ===');
for (const point of rameshResult.discussionPoints) {
  for (const source of point.sources) {
    assert(Boolean(source.type && source.id && source.label?.en && source.label?.hi && source.answer?.en && source.answer?.hi), `${point.id} source includes bilingual label and answer`);
  }
}
for (const note of rameshResult.followUpNotes) {
  assert(Array.isArray(note.sources) && note.sources.length > 0, `${note.id} has source references`);
}
assert(!Object.hasOwn(rameshResult, 'riskScore'), 'report engine exposes no risk score');
assert(!Object.hasOwn(rameshResult, 'diagnosis'), 'report engine exposes no diagnosis field');
assert(!Object.hasOwn(rameshResult, 'urgency'), 'report engine exposes no urgency classification');

console.log('\n=== Storage failure contract ===');
const minimalSavedRecord = createSessionRecord({ sessionId: 'empty-test' });
assert(minimalSavedRecord.schemaVersion === 5, 'saved record has the current schema version');
assert(Array.isArray(minimalSavedRecord.visionTimelineEntries), 'legacy sessions safely hydrate with an empty timeline list');
assert(minimalSavedRecord.activities.length === 0, 'missing activities restore to a safe empty list');
assert(minimalSavedRecord.answers && typeof minimalSavedRecord.answers === 'object', 'missing answers restore to a safe object');
assert(minimalSavedRecord.participantNote === '', 'missing participant note restores to an empty string');
assert(Array.isArray(minimalSavedRecord.discussionPriorities), 'saved record includes a safe discussion priority list');
assert(minimalSavedRecord.appointmentFollowUp && typeof minimalSavedRecord.appointmentFollowUp === 'object', 'saved record includes appointment follow-up fields');
assert(minimalSavedRecord.kioskMode === false, 'saved record defaults to non-kiosk mode');
assert(minimalSavedRecord.questionsToAsk === '', 'saved record defaults to an empty list of participant questions');
const extendedRecord = createSessionRecord({ sessionId: 'extended', kioskMode: true, assistedCompletion: true, visionTimelineEntries: unsortedTimeline, discussionPriorities: ['blurred_vision', 'headaches', 'squinting'], questionsToAsk: 'What should I ask?', appointmentFollowUp: { appointmentDate: '2026-11-15' } });
assert(extendedRecord.kioskMode && extendedRecord.assistedCompletion, 'shared-device and assisted-completion flags persist');
assert(extendedRecord.discussionPriorities.length === 2, 'only two discussion priorities are persisted');
assert(extendedRecord.appointmentFollowUp.appointmentDate === '2026-11-15', 'appointment follow-up data persists');
assert(extendedRecord.questionsToAsk === 'What should I ask?', 'participant questions persist');
assert(extendedRecord.visionTimelineEntries.length === 2 && extendedRecord.visionTimelineEntries[0].id === 'newer', 'timeline entries are normalized and persisted newest first');
assert(shouldDiscardKioskSessionOnRestore(extendedRecord), 'kiosk session is discarded after reload rather than restored');
assert(!shouldDiscardKioskSessionOnRestore(minimalSavedRecord), 'ordinary sessions remain eligible for resume');
assert(hasKioskSessionExpired(1000, 1000 + KIOSK_IDLE_LIMIT_MS), 'kiosk idle policy expires at its configured limit');
assert(!hasKioskSessionExpired(1000, 1000 + KIOSK_IDLE_LIMIT_MS - 1), 'kiosk idle policy does not expire before its limit');

console.log('\n=== Pattern Detection Engine ===');
const emptyPatterns = evaluatePatterns({});
assert(emptyPatterns.length === 0, 'empty answers produce no patterns');
assert(Array.isArray(emptyPatterns), 'evaluatePatterns returns an array');

const healthyPatterns = evaluatePatterns(healthyAnswers);
assert(healthyPatterns.length === 0, 'healthy/minimal profile triggers no patterns');

const rameshPatterns = evaluatePatterns(rameshAnswers);
assert(rameshPatterns.length > 0, 'Ramesh profile triggers at least one pattern');
// Ramesh: headaches=sometimes, close_work=daily, squinting=yes → close-work-headache
assert(rameshPatterns.some((p) => p.id === 'close-work-headache'), 'Ramesh triggers close-work-headache pattern');
// Ramesh: eye_exam=never + 3 experiences → overdue-exam
assert(rameshPatterns.some((p) => p.id === 'overdue-exam'), 'Ramesh triggers overdue-exam pattern');
// Outdoor time alone must not be treated as evidence of low-light difficulty.
assert(!rameshPatterns.some((p) => p.id === 'low-light-contrast'), 'low-light pattern does not fire from outdoor time alone');

const lowLightAnswers = {
  night_vision: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
  experience_context: { value: ['low_light'], label: { en: 'Low-light situations', hi: 'कम रोशनी की स्थिति' } },
  squinting: { value: 'yes', label: { en: 'Yes, often', hi: 'हाँ, अक्सर' } },
};
const lowLightPatterns = evaluatePatterns(lowLightAnswers);
assert(lowLightPatterns.some((p) => p.id === 'low-light-contrast'), 'low-light pattern requires explicit low-light context, night difficulty and squinting');

for (const pattern of rameshPatterns) {
  assert(pattern.sources.length >= 2, `matched pattern ${pattern.id} has ≥2 source links`);
  assert(Boolean(pattern.title?.en && pattern.title?.hi), `matched pattern ${pattern.id} has bilingual title`);
  assert(Boolean(pattern.description?.en && pattern.description?.hi), `matched pattern ${pattern.id} has bilingual description`);
  assert(Boolean(pattern.discussionPrompt?.en && pattern.discussionPrompt?.hi), `matched pattern ${pattern.id} has bilingual discussion prompt`);
  for (const source of pattern.sources) {
    assert(Boolean(source.type && source.id && source.label?.en && source.label?.hi && source.answer?.en && source.answer?.hi), `${pattern.id} source ${source.id} has complete bilingual data`);
  }
}

// Specific trigger isolation tests
const screenStrainAnswers = {
  screen_hours: { value: 'high', label: { en: '6+ hours', hi: '6+ घंटे' } },
  blur_distance: { value: 'far', label: { en: 'Far objects', hi: 'दूर की चीज़ें' } },
  eye_exam: { value: 'never', label: { en: 'Never', hi: 'कभी नहीं' } },
};
const screenStrainPatterns = evaluatePatterns(screenStrainAnswers);
assert(screenStrainPatterns.some((p) => p.id === 'screen-strain'), 'screen-strain fires on its specific triggers');

const asymmetryAnswers = {
  which_eye: { value: 'left', label: { en: 'Left eye', hi: 'बाईं आँख' } },
  experience_onset: { value: 'recent_weeks', label: { en: 'Within the last few weeks', hi: 'पिछले कुछ हफ़्तों में' } },
};
const asymmetryPatterns = evaluatePatterns(asymmetryAnswers);
assert(asymmetryPatterns.some((p) => p.id === 'asymmetry'), 'asymmetry fires on one-eye + recent onset');

const presbyopiaAnswers = {
  blur_distance: { value: 'near', label: { en: 'Near objects', hi: 'पास की चीज़ें' } },
  age_group: { value: 'senior', label: { en: '55+', hi: '55+' } },
  experience_change: { value: 'more_noticeable', label: { en: 'Getting worse', hi: 'बढ़ रहा है' } },
};
const presbyopiaPatterns = evaluatePatterns(presbyopiaAnswers);
assert(presbyopiaPatterns.some((p) => p.id === 'presbyopia'), 'presbyopia fires on near blur + older age + worsening');

// Partial triggers should not fire
const partialScreenAnswers = {
  screen_hours: { value: 'high', label: { en: '6+ hours', hi: '6+ घंटे' } },
  // Missing blur_distance and eye_exam
};
assert(evaluatePatterns(partialScreenAnswers).every((p) => p.id !== 'screen-strain'), 'screen-strain does not fire on partial triggers');

const partialAsymmetry = {
  which_eye: { value: 'both', label: { en: 'Both eyes', hi: 'दोनों आँखें' } },
  experience_onset: { value: 'recent_weeks', label: { en: 'Within the last few weeks', hi: 'पिछले कुछ हफ़्तों में' } },
};
assert(evaluatePatterns(partialAsymmetry).every((p) => p.id !== 'asymmetry'), 'asymmetry does not fire when both eyes are reported');

// Null/undefined safety
assert(evaluatePatterns(null).length === 0, 'null answers produce no patterns');
assert(evaluatePatterns(undefined).length === 0, 'undefined answers produce no patterns');

// === Amsler Grid Math & Integration ===
console.log('\n=== Amsler Grid math and integration ===');

// Grid geometry
const GRID_SIZE = 20;
const GRID_PHYSICAL_CM = 10;
const CARD_WIDTH_MM = 85.6;
const testSliderPx = 300;
const testPxPerMm = testSliderPx / CARD_WIDTH_MM;
const testGridSizePx = testPxPerMm * GRID_PHYSICAL_CM * 10;
const testCellSizePx = testGridSizePx / GRID_SIZE;

assert(testPxPerMm > 0, 'calibration produces a positive px-per-mm');
assert(Math.abs(testPxPerMm - 300 / 85.6) < 0.001, 'calibration math: 300px / 85.6mm');
assert(testGridSizePx > 0, 'calibrated grid has positive dimensions');
assert(Math.abs(testCellSizePx - testGridSizePx / 20) < 0.001, 'cell size is grid / 20');
assert(GRID_SIZE * testCellSizePx === testGridSizePx, 'cells tile exactly to fill the grid');

// Tap-to-cell mapping (simulated)
const tapCellRow = Math.floor(5.3 * testCellSizePx / testCellSizePx);
const tapCellCol = Math.floor(12.9 * testCellSizePx / testCellSizePx);
assert(tapCellRow === 5, 'tap maps to correct row');
assert(tapCellCol === 12, 'tap maps to correct col');

// Center dot position
const centerRow = Math.floor(GRID_SIZE / 2);
const centerCol = Math.floor(GRID_SIZE / 2);
assert(centerRow === 10 && centerCol === 10, 'center dot is at row 10, col 10');

// Result shape validation
const mockAmslerResult = {
  completed: true,
  skipped: false,
  calibrated: true,
  timestamp: new Date().toISOString(),
  data: {
    right: { eye: 'right', flaggedCells: [{ row: 5, col: 7 }, { row: 6, col: 8 }], cellCount: 2, calibrated: true, timestamp: new Date().toISOString() },
    left: { eye: 'left', flaggedCells: [], cellCount: 0, calibrated: true, timestamp: new Date().toISOString() },
  },
};
assert(mockAmslerResult.data.right.eye === 'right', 'right eye result has correct eye label');
assert(mockAmslerResult.data.left.eye === 'left', 'left eye result has correct eye label');
assert(mockAmslerResult.data.right.cellCount === 2, 'right eye flagged cell count is correct');
assert(mockAmslerResult.data.left.cellCount === 0, 'left eye flagged cell count is zero when no cells flagged');
assert(Array.isArray(mockAmslerResult.data.right.flaggedCells), 'flagged cells are an array');
assert(mockAmslerResult.data.right.flaggedCells[0].row === 5 && mockAmslerResult.data.right.flaggedCells[0].col === 7, 'flagged cell stores row and col');
assert(typeof mockAmslerResult.timestamp === 'string', 'result has ISO timestamp');
assert(mockAmslerResult.calibrated === true, 'result reports calibration status');

// Skip result shape
const mockSkipResult = { completed: false, skipped: true, data: null };
assert(mockSkipResult.skipped === true, 'skipped result has skipped flag');
assert(mockSkipResult.data === null, 'skipped result has null data');

// Toggle (undo) logic
const flaggedCells = [{ row: 3, col: 4 }, { row: 7, col: 10 }];
const toggleExisting = flaggedCells.filter((c) => !(c.row === 3 && c.col === 4));
assert(toggleExisting.length === 1 && toggleExisting[0].row === 7, 'tapping a flagged cell removes it (undo)');
const toggleNew = [...flaggedCells, { row: 1, col: 1 }];
assert(toggleNew.length === 3, 'tapping an unflagged cell adds it');

// Calibration edge cases
assert(150 / CARD_WIDTH_MM > 0, 'minimum slider value still produces valid calibration');
assert(500 / CARD_WIDTH_MM > 0, 'maximum slider value still produces valid calibration');
assert(Math.abs(calculateGridSizePx(300) - testGridSizePx) < 0.001, 'shared grid-size helper matches 10cm calibration math');
assert(
  canCalibrateAmsler(600, 800, getMaxCalibrationSliderWidth(600)),
  '600x800 viewport fits the maximum allowed calibrated grid in both dimensions'
);
assert(
  !canCalibrateAmsler(599, 900, getMaxCalibrationSliderWidth(599)),
  'narrow viewports cannot start Amsler calibration'
);
assert(
  !canCalibrateAmsler(600, 650, getMaxCalibrationSliderWidth(600)),
  'portrait viewport is blocked when calibrated grid plus controls do not fit vertically'
);
assert(
  !canCalibrateAmsler(850, 390, getMaxCalibrationSliderWidth(850)),
  'landscape phone viewport is blocked even when width fits but height does not'
);
assert(
  !canCalibrateAmsler(600, 800, 500),
  'calibration is blocked when the full grid would overflow horizontally'
);
assert(
  doesCalibratedGridFit(600, 800, 568),
  'calibrated grid fits when viewport includes width margin and vertical control reserve'
);
assert(
  !doesCalibratedGridFit(900, 650, 568),
  'grid is blocked when viewport height cannot fit square plus controls'
);
assert(
  !doesCalibratedGridFit(599, 800, 568),
  'grid no longer fits when viewport width narrows'
);
assert(
  !doesCalibratedGridFit(Number.NaN, 800, 300),
  'invalid viewport measurements fail closed'
);

// === Appointment Pack — Amsler Integration ===
console.log('\n=== Appointment pack Amsler integration ===');

const packExperienceProfile = buildVisionExperienceProfile(rameshPersona.answers, []);
const amslerPack = buildAppointmentPreparationPack({
  language: 'en',
  amslerResults: mockAmslerResult,
  experienceProfile: packExperienceProfile,
});
assert(amslerPack.amsler !== null, 'appointment pack includes Amsler results when completed');
assert(amslerPack.amsler.right === 2, 'appointment pack Amsler right eye count matches');
assert(amslerPack.amsler.left === 0, 'appointment pack Amsler left eye count matches');
assert(amslerPack.experienceProfile !== null, 'appointment pack includes a compact experience headline when supplied');
assert(typeof amslerPack.experienceProfile.summary === 'string', 'appointment pack stores one compact profile summary');
assert(amslerPack.experienceProfile.summary.includes('Blurred or unclear vision'), 'appointment pack summary retains the main reported experience');
assert(amslerPack.experienceProfile.summary.length <= 260, 'appointment pack profile summary is length-limited');

const noAmslerPack = buildAppointmentPreparationPack({ language: 'en', amslerResults: null });
assert(noAmslerPack.amsler === null, 'appointment pack has null Amsler when not completed');

const skippedAmslerPack = buildAppointmentPreparationPack({ language: 'en', amslerResults: mockSkipResult });
assert(skippedAmslerPack.amsler === null, 'appointment pack has null Amsler when skipped');

const hindiAmslerPack = buildAppointmentPreparationPack({ language: 'hi', amslerResults: mockAmslerResult });
assert(hindiAmslerPack.amsler !== null, 'Hindi appointment pack includes Amsler results');

// === Pattern source link resolution ===
console.log('\n=== Pattern source link resolution ===');
for (const pattern of rameshPatterns) {
  for (const source of pattern.sources) {
    assert(rameshAnswers[source.id] !== undefined, `pattern ${pattern.id} source ${source.id} exists in Ramesh answers`);
  }
}

// === Amsler Spatial Analysis ===
console.log('\n=== Amsler spatial analysis ===');
import { analyzeEye, analyzeSpatial, describeSpatial } from './amslerSpatial.js';
import { evaluateClusters } from '../data/patternClusters.js';

// Empty cells
const emptyAnalysis = analyzeEye([]);
assert(emptyAnalysis.count === 0, 'empty cells → count 0');
assert(emptyAnalysis.spread === 'none', 'empty cells → spread "none"');
assert(emptyAnalysis.hasQuadrantConcentration === false, 'empty cells → no quadrant concentration');
assert(emptyAnalysis.centroid === null, 'empty cells → null centroid');
assert(emptyAnalysis.dominantQuadrant === null, 'empty cells → no dominant quadrant');

// Single cell
const singleAnalysis = analyzeEye([{ row: 2, col: 3 }]);
assert(singleAnalysis.count === 1, 'single cell → count 1');
assert(singleAnalysis.spread === 'single', 'single cell → spread "single"');
assert(singleAnalysis.centroid.row === 2 && singleAnalysis.centroid.col === 3, 'single cell centroid matches');

// Concentrated in the upper-left quadrant (not necessarily adjacent cells)
const ulCells = [{ row: 1, col: 2 }, { row: 2, col: 1 }, { row: 3, col: 3 }, { row: 0, col: 0 }];
const ulAnalysis = analyzeEye(ulCells);
assert(ulAnalysis.quadrants.UL === 4, 'all 4 cells in UL quadrant');
assert(ulAnalysis.dominantQuadrant === 'UL', 'dominant quadrant is UL');
assert(ulAnalysis.spread === 'quadrant-concentrated', 'UL flags → quadrant-concentrated');
assert(ulAnalysis.hasQuadrantConcentration === true, 'UL flags → hasQuadrantConcentration true');

// Scattered across quadrants
const scatteredCells = [
  { row: 1, col: 1 }, { row: 1, col: 15 },
  { row: 15, col: 1 }, { row: 15, col: 15 },
];
const scatteredAnalysis = analyzeEye(scatteredCells);
assert(scatteredAnalysis.spread === 'distributed', '4 corners → spread "distributed"');
assert(scatteredAnalysis.dominantQuadrant === null, '4 corners → no dominant quadrant');
assert(scatteredAnalysis.hasQuadrantConcentration === false, '4 corners → no quadrant concentration');

// Central vs peripheral
const centralCells = [{ row: 8, col: 9 }, { row: 10, col: 10 }, { row: 7, col: 12 }];
const centralAnalysis = analyzeEye(centralCells);
assert(centralAnalysis.centralCount === 3, '3 cells in middle grid area');
const middleAreaDesc = describeSpatial(analyzeSpatial({ right: centralCells, left: [] }), 'en');
assert(middleAreaDesc.right.some((line) => line.includes('middle area of this grid')), 'spatial text describes grid middle rather than anatomy');
assert(centralAnalysis.peripheralCount === 0, '0 cells peripheral');

const peripheralCells = [{ row: 0, col: 0 }, { row: 19, col: 19 }];
const peripheralAnalysis = analyzeEye(peripheralCells);
assert(peripheralAnalysis.centralCount === 0, '2 corner cells → 0 central');
assert(peripheralAnalysis.peripheralCount === 2, '2 corner cells → 2 peripheral');

// Inter-eye asymmetry
const asymSpatial = analyzeSpatial({
  right: [{ row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }, { row: 4, col: 4 }, { row: 5, col: 5 }, { row: 6, col: 6 }],
  left: [{ row: 1, col: 1 }],
});
assert(asymSpatial.hasAsymmetry === true, '6 vs 1 flags → hasAsymmetry');
assert(asymSpatial.asymmetryRatio === 6, '6:1 ratio');

const symSpatial = analyzeSpatial({
  right: [{ row: 1, col: 1 }, { row: 2, col: 2 }],
  left: [{ row: 3, col: 3 }, { row: 4, col: 4 }],
});
assert(symSpatial.hasAsymmetry === false, '2 vs 2 flags → no asymmetry');
assert(symSpatial.asymmetryRatio === 1, '2:2 ratio = 1');

// Both eyes empty
const bothEmptySpatial = analyzeSpatial({ right: [], left: [] });
assert(bothEmptySpatial.asymmetryRatio === 1, 'both empty → ratio 1');
assert(bothEmptySpatial.hasAsymmetry === false, 'both empty → no asymmetry');

// One eye has flags, other empty
const oneEmptySpatial = analyzeSpatial({
  right: [{ row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }],
  left: [],
});
assert(oneEmptySpatial.asymmetryRatio === Infinity, '3 vs 0 → Infinity ratio');
assert(oneEmptySpatial.hasAsymmetry === true, '3 vs 0 → hasAsymmetry');

// One eye empty — text says "Only the X eye" not a ratio
const oneEmptyDesc = describeSpatial(oneEmptySpatial, 'en');
assert(oneEmptyDesc.comparison.length > 0, 'one-empty comparison text generated');
assert(oneEmptyDesc.comparison[0].includes('Only'), 'one-empty text uses "Only" not a ratio');
assert(!oneEmptyDesc.comparison[0].includes('×'), 'one-empty text has no × ratio');

// Center dot cell (row 10, col 10) — consistent quadrant assignment
const centerDotAnalysis = analyzeEye([{ row: 10, col: 10 }]);
assert(centerDotAnalysis.count === 1, 'center dot counts as 1 cell');
assert(centerDotAnalysis.centralCount === 1, 'center dot is in central zone');
assert(centerDotAnalysis.spread === 'single', 'single center dot → spread single');
// row 10 >= midR(10), col 10 >= midC(10) → LR quadrant
assert(centerDotAnalysis.quadrants.LR === 1, 'center dot assigned to LR quadrant');

// Center line cells (row 10, col 5) and (row 5, col 10) — no double-counting
const centerLineCells = [{ row: 10, col: 5 }, { row: 5, col: 10 }];
const centerLineAnalysis = analyzeEye(centerLineCells);
const totalQuadrantCount = Object.values(centerLineAnalysis.quadrants).reduce((a, b) => a + b, 0);
assert(totalQuadrantCount === 2, 'center-line cells: quadrant sum equals cell count (no double-count)');

// Single flag text — no "concentrate" or "scattered" language
const singleFlagSpatial = analyzeSpatial({ right: [{ row: 5, col: 5 }], left: [] });
const singleFlagDesc = describeSpatial(singleFlagSpatial, 'en');
assert(singleFlagDesc.right[0].includes('1 region flagged'), 'single flag says "1 region flagged"');
assert(!singleFlagDesc.right[0].includes('concentrate'), 'single flag does not say "concentrate"');
assert(!singleFlagDesc.right[0].includes('scattered'), 'single flag does not say "scattered"');

// === Pattern Cluster Narratives ===
console.log('\n=== Pattern cluster narratives ===');

// Ramesh matches a subset of the defined patterns; outdoor time alone no longer creates a low-light match.
const rameshPatternIds = rameshPatterns.map((p) => p.id);
const rameshClusters = evaluateClusters(rameshPatternIds);
assert(rameshClusters.length > 0, 'Ramesh triggers at least one cluster');
const nearVisionCluster = rameshClusters.find((c) => c.id === 'near-vision-strain');
assert(nearVisionCluster !== undefined, 'Ramesh triggers near-vision-strain cluster');
assert(nearVisionCluster.matchedMembers.length >= 2, 'near-vision-strain has >= 2 matched members');

// All matched patterns are still individually available (clusters don't hide them)
assert(rameshPatterns.length >= 2, 'Ramesh still has multiple individual patterns after clustering');

// Empty patterns → no clusters
const emptyClusters = evaluateClusters([]);
assert(emptyClusters.length === 0, 'no patterns → no clusters');

// Single pattern → no clusters
const singleClusters = evaluateClusters(['presbyopia']);
assert(singleClusters.length === 0, 'single pattern → no clusters');

// Digital cluster needs both screen-strain + digital-eye-strain
const digitalClusters = evaluateClusters(['screen-strain', 'digital-eye-strain']);
assert(digitalClusters.length === 1, 'screen-strain + digital-eye-strain triggers digital cluster');
assert(digitalClusters[0].id === 'digital-screen-cluster', 'digital cluster ID correct');

// Cluster text is bilingual
assert(nearVisionCluster.title.en && nearVisionCluster.title.hi, 'cluster title is bilingual');
assert(nearVisionCluster.summary.en && nearVisionCluster.summary.hi, 'cluster summary is bilingual');
assert(
  !/good sign/i.test(strings['patterns.noneMatched.subtitle']?.en || ''),
  'unmatched patterns copy does not reassure users that this is a good sign'
);
assert(
  /does not mean vision concerns are absent/i.test(strings['patterns.noneMatched.subtitle']?.en || ''),
  'unmatched patterns copy explicitly avoids ruling out concerns'
);
assert(
  !/screening results/i.test(strings['disclaimer.full']?.en || ''),
  'shared report disclaimer does not call activity records screening results'
);

// Text descriptions — English
const descEN = describeSpatial(asymSpatial, 'en');
assert(descEN.disclaimer.includes('not a map of your retina'), 'EN disclaimer present');
assert(descEN.right.length > 0, 'EN right eye description generated');
assert(descEN.left.length > 0, 'EN left eye description generated');
assert(descEN.comparison.length > 0, 'EN comparison generated for asymmetric result');

// Text descriptions — Hindi
const descHI = describeSpatial(asymSpatial, 'hi');
assert(descHI.disclaimer.includes('रेटिना'), 'HI disclaimer present');
const middleAreaHindi = describeSpatial(analyzeSpatial({ right: centralCells, left: [] }), 'hi');
assert(middleAreaHindi.right.some((line) => line.includes('ग्रिड के मध्य वाले हिस्से')), 'Hindi spatial text describes grid middle');
assert(descHI.right.length > 0, 'HI right eye description generated');
assert(descHI.left.length > 0, 'HI left eye description generated');

// No comparison when symmetric
const symDesc = describeSpatial(symSpatial, 'en');
assert(symDesc.comparison.length === 0, 'no comparison text for symmetric result');

// Empty result descriptions
const emptyDesc = describeSpatial(bothEmptySpatial, 'en');
assert(emptyDesc.right[0].includes('no regions flagged'), 'empty right eye says no regions');
assert(emptyDesc.left[0].includes('no regions flagged'), 'empty left eye says no regions');

// Clustered description mentions quadrant
const concentratedSpatial = analyzeSpatial({ right: ulCells, left: [] });
const concentratedDesc = describeSpatial(concentratedSpatial, 'en');
assert(concentratedDesc.right[0].includes('upper-left'), 'quadrant-concentration description mentions quadrant name');

assert(!concentratedDesc.right[0].toLowerCase().includes('cluster'), 'spatial description does not claim physical clustering');

// === Everyday Vision Experience Profile ===
console.log('\\n=== Everyday vision experience profile ===');

const profileTimelineFixtures = [
  {
    id: 'profile-main-entry',
    date: '2026-10-12',
    time: '09:30',
    experienceId: 'blurred_vision',
    experienceLabel: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' },
    context: 'During screen work',
    impact: 'Needed to adjust distance',
    createdAt: '2026-10-12T09:30:00.000Z',
    updatedAt: '2026-10-12T09:30:00.000Z',
  },
  {
    id: 'profile-other-entry',
    date: '2026-10-10',
    time: '',
    experienceId: 'headaches',
    experienceLabel: { en: 'Headaches around visual activities', hi: 'दृष्टि गतिविधियों के दौरान सिरदर्द' },
    context: 'After reading',
    impact: 'Took a break',
    createdAt: '2026-10-10T12:00:00.000Z',
    updatedAt: '2026-10-10T12:00:00.000Z',
  },
];
const experienceProfile = buildVisionExperienceProfile(rameshPersona.answers, profileTimelineFixtures);
assert(experienceProfile.mainExperience?.id === 'blurred_vision', 'profile uses the current main reported experience');
assert(experienceProfile.mainExperience?.contexts.length === 2, 'profile retains both reported experience contexts');
assert(experienceProfile.mainExperience?.sourceIds.includes('experience_onset'), 'main experience links to onset source answer');
assert(experienceProfile.mainExperience?.sourceIds.includes('which_eye'), 'main experience links to reported eye-side answer');
assert(experienceProfile.mainExperience?.narrative.en.includes('main experience'), 'profile creates an English main-experience narrative');
assert(experienceProfile.mainExperience?.narrative.hi.includes('आपने'), 'profile creates a Hindi main-experience narrative');
assert(experienceProfile.additionalExperiences.length === 3, 'profile keeps other reported experiences separate from the main experience');
assert(experienceProfile.activityImpacts.length === 1, 'profile includes the participant-selected affected activity');
assert(experienceProfile.activityImpacts[0].impactStatus === 'reported', 'profile distinguishes a reported activity impact');
assert(experienceProfile.activityImpacts[0].frequency.en === 'Often', 'profile retains activity-specific impact frequency');
assert(experienceProfile.activityImpacts[0].sourceIds.includes('activity_impact_fine_detail'), 'activity impact links to its source answer');
assert(experienceProfile.activityImpacts[0].sourceIds.includes('activity_impact_frequency_fine_detail'), 'activity impact frequency links to its source answer');
assert(experienceProfile.connections?.narrative.en.includes('feel affected'), 'profile connects reported contexts and affected activities without diagnosing');
assert(experienceProfile.timeline.totalEntries === 2, 'profile preserves normalized timeline entries');
assert(experienceProfile.timeline.mainExperienceEntryCount === 1, 'profile links only matching participant-selected timeline experience IDs');
assert(experienceProfile.limitations.participantReportedOnly === true, 'profile explicitly remains participant-reported');
assert(experienceProfile.limitations.usesClinicalScoring === false, 'profile does not introduce clinical scoring');
assert(experienceProfile.limitations.measuresVisualPerformance === false, 'profile does not claim visual-performance measurement');
const compactProfileSummary = buildCompactExperienceSummary(experienceProfile, 'en', 360, 3);
assert(compactProfileSummary.includes('Main reported experience: Blurred or unclear vision'), 'compact summary leads with the participant selected main experience');
assert(compactProfileSummary.includes('Reported situations:'), 'compact summary preserves participant reported contexts');
assert(compactProfileSummary.includes('Reported daily-activity impact:'), 'compact summary connects the selected daily-activity impact');
assert(compactProfileSummary.length <= 360, 'compact summary respects its configured character limit');
const compactHindiSummary = buildCompactExperienceSummary(experienceProfile, 'hi', 360, 3);
assert(compactHindiSummary.includes('मुख्य बताया गया अनुभव'), 'compact summary has a Hindi version');
assert(buildCompactExperienceSummary({}, 'en') === '', 'compact summary omits a profile with no reportable content');

const secondaryProfile = buildVisionExperienceProfile({
  ...multiConcernAnswers,
  additional_experience_headaches_onset: { value: 'recent_months', label: { en: 'Within the last few months', hi: 'पिछले कुछ महीनों में' } },
  additional_experience_headaches_frequency: { value: 'weekly', label: { en: 'A few times a week', hi: 'हफ़्ते में कुछ बार' } },
  additional_experience_headaches_context: { value: ['near_tasks'], label: { en: 'Reading or other near tasks', hi: 'पढ़ना या पास के काम' } },
  additional_experience_night_vision_onset: { value: 'recent_weeks', label: { en: 'Within the last few weeks', hi: 'पिछले कुछ हफ़्तों में' } },
  additional_experience_night_vision_frequency: { value: 'daily', label: { en: 'Every day', hi: 'रोज़' } },
  additional_experience_night_vision_context: { value: ['low_light'], label: { en: 'Low-light situations', hi: 'कम रोशनी की स्थिति' } },
  additional_experience_night_vision_eye: { value: 'both', label: { en: 'Both eyes', hi: 'दोनों आँखें' } },
});
const secondaryHeadaches = secondaryProfile.additionalExperiences.find((item) => item.id === 'headaches');
const secondaryNightVision = secondaryProfile.additionalExperiences.find((item) => item.id === 'night_vision');
assert(secondaryHeadaches.selectedForDiscussion === true && secondaryHeadaches.onset.en === 'Within the last few months', 'profile connects the selected secondary experience with its own onset answer');
assert(secondaryHeadaches.contexts[0].id === 'near_tasks' && secondaryHeadaches.frequency.en === 'A few times a week', 'profile retains secondary experience context and frequency');
assert(secondaryHeadaches.sourceIds.includes('additional_experience_headaches_context'), 'secondary experience links to its own context source answer');
assert(secondaryNightVision.eye.en === 'Both eyes' && secondaryNightVision.contexts[0].id === 'low_light', 'profile retains a second secondary experience eye-side and context');
assert(secondaryProfile.additionalExperiences.find((item) => item.id === 'squinting').selectedForDiscussion === false, 'reported but unselected experiences remain distinct from selected discussion topics');
const secondaryCompactSummary = buildCompactExperienceSummary(secondaryProfile, 'en', 500, 3);
assert(secondaryCompactSummary.includes('Also to discuss — Headaches around visual activities'), 'compact profile summary includes a selected secondary experience');
const customActivityProfile = buildVisionExperienceProfile(customActivityContextAnswers);
assert(customActivityProfile.activityImpacts[0].label.en === 'Jewellery making', 'experience profile uses the participant-defined activity label');
assert(customActivityProfile.activityImpacts[0].sourceIds.includes('custom_activity_name'), 'experience profile traces the custom activity label to the participant-entered answer');

const staleMainProfile = buildVisionExperienceProfile({
  ...rameshPersona.answers,
  blurred_vision: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
}, profileTimelineFixtures);
assert(staleMainProfile.mainExperience === null, 'stale main selection is not shown when the experience is no longer reported');
assert(staleMainProfile.additionalExperiences.some((item) => item.id === 'blurred_vision') === false, 'a no-longer-reported experience is not included as additional experience');
assert(staleMainProfile.timeline.mainExperienceEntryCount === 0, 'stale main selection does not create a false timeline link');

const emptyExperienceProfile = buildVisionExperienceProfile({}, []);
assert(emptyExperienceProfile.mainExperience === null, 'empty answers produce no main experience');
assert(emptyExperienceProfile.activityImpacts.length === 0, 'empty answers produce no activity-impact rows');
assert(emptyExperienceProfile.timeline.totalEntries === 0, 'empty timeline produces zero entries');
assert(emptyExperienceProfile.connections === null, 'profile does not invent a connection without data');

const noImpactProfile = buildVisionExperienceProfile({
  affected_activities: { value: ['reading'], label: { en: 'Reading & study', hi: 'पढ़ाई और अध्ययन' } },
  activity_impact_reading: { value: ['none'], label: { en: 'No impact', hi: 'कोई प्रभाव नहीं' } },
});
assert(noImpactProfile.activityImpacts[0].impactStatus === 'no_impact_reported', 'profile preserves explicit no-impact answers without converting them into missing data');



console.log(`\n${'='.repeat(44)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(44)}\n`);
process.exit(failed > 0 ? 1 : 0);

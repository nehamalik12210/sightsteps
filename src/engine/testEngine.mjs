/**
 * SightSteps regression tests.
 * Run from the project root: node src/engine/testEngine.mjs
 * Tests the deterministic report engine and resume-route decisions.
 */

import { evaluateAnswers } from './ruleEngine.js';
import { getBackNavigationAnswerIds, getNewSessionRedirect, getPendingSessionQuestion, getProtectedRouteRedirect, getResumePath } from '../utils/sessionRouting.js';
import questionBank, { getActivityDependentAnswerIds, getNextQuestion, getQuestionForActivities, getProgress, getVisibleQuestions, isAnswerComplete } from '../data/questions.js';
import strings from '../data/i18n.js';
import { createSessionRecord } from '../utils/storage.js';
import { hasKioskSessionExpired, shouldDiscardKioskSessionOnRestore, KIOSK_IDLE_LIMIT_MS } from '../utils/kioskPolicy.js';
import { normalizeVisionTimelineEntries, sortVisionTimelineEntries, validateVisionTimelineDraft, MAX_VISION_TIMELINE_ENTRIES } from '../utils/visionTimeline.js';
import rameshPersona from '../data/demoPersona.js';
import { buildAppointmentPreparationPack } from '../utils/appointmentPack.js';

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
assert(rameshResult.answeredCount === 20, `Ramesh should have 20 stored responses, got ${rameshResult.answeredCount}`);
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
  })),
  questionsToAsk: 'Q'.repeat(520),
  timelineEntries: packTimeline,
  now: new Date('2026-11-18T10:00:00.000Z'),
});
assert(preparationPack.priorities.length === 2, 'appointment pack keeps no more than two participant priorities');
assert(preparationPack.activities.length === 5, 'appointment pack keeps the compact activity context within five items');
assert(preparationPack.discussionPoints.length === 3, 'appointment pack keeps the three most relevant discussion prompts');
assert(preparationPack.questionsToAsk.length <= 480, 'appointment pack bounds the personal question text');
const compactQuestionPack = buildAppointmentPreparationPack({ language: 'en', questionsToAsk: '  Can   we\n review  this?  ' });
assert(compactQuestionPack.questionsToAsk === 'Can we review this?', 'appointment pack collapses repeated whitespace in personal questions');
assert(preparationPack.timelineEntries.length === 5 && preparationPack.timelineEntries[0].id === 'pack-entry-7', 'appointment pack includes only the five newest timeline entries');
assert(preparationPack.timelineEntries[0].dateValue === '2026-11-07', 'appointment pack timeline dates remain machine-readable');
assert(preparationPack.language === 'en' && Boolean(preparationPack.preparedDate), 'appointment pack retains language and preparation date');
const hindiPack = buildAppointmentPreparationPack({ language: 'hi', priorities: [{ id: 'x', label: { en: 'Blurred vision', hi: 'धुंधला दिखाई देना' } }], now: new Date('2026-11-18T10:00:00.000Z') });
assert(hindiPack.priorities[0].label === 'धुंधला दिखाई देना', 'appointment pack uses Hindi labels when Hindi is selected');

console.log('\n=== Saved session record completeness ===');
const savedRecord = createSessionRecord({
  sessionId: 'test-session',
  activities: ['fine_detail', 'reading'],
  primaryActivity: 'fine_detail',
  participantNote: 'Strain after sewing',
  answers: rameshAnswers,
  language: 'hi',
});
assert(savedRecord.activities.length === 2, 'saved record includes selected daily activities');
assert(savedRecord.primaryActivity === 'fine_detail', 'saved record includes primary activity');
assert(savedRecord.participantNote === 'Strain after sewing', 'saved record includes participant note');
assert(savedRecord.answers === rameshAnswers, 'saved record includes questionnaire answers');
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
assert(minimalSavedRecord.schemaVersion === 4, 'saved record has the current schema version');
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

console.log(`\n${'='.repeat(44)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(44)}\n`);
process.exit(failed > 0 ? 1 : 0);

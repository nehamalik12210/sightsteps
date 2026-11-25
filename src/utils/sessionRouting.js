import questionBank, { getNextQuestion, getVisibleQuestions, isAnswerComplete } from '../data/questions.js';

function isAnswered(entry) {
  if (!entry || entry.value === undefined || entry.value === null) return false;
  if (Array.isArray(entry.value)) return entry.value.length > 0;
  return true; // Empty text is a valid completed response for the optional note.
}

/** Resolve the correct resume destination from saved journey state. */
export function getResumePath(session = {}) {
  const answers = session.answers || {};

  if (session.visionResults) return '/report';

  const activities = Array.isArray(session.activities) && session.activities.length
    ? session.activities
    : (session.isDemo ? session.demoPersona?.activities || [] : []);
  const primaryActivity = session.primaryActivity || (session.isDemo ? session.demoPersona?.primaryActivity : null);

  if (!activities.length || !primaryActivity || !activities.includes(primaryActivity)) {
    return '/activities';
  }

  if (session.isDemo && session.demoPersona?.skipVision) {
    // Let Intake's completion effect set the explicit skipped state before showing Report.
    return '/intake';
  }

  if (getNextQuestion(answers)) return '/intake';
  return '/vision';
}

/**
 * After the optional Amsler activity, continue to the report when the
 * direction-awareness activity has already been completed or skipped.
 * If Amsler was opened earlier in the journey, return to the E activity.
 */
export function getAmslerReturnPath(visionResults = null) {
  const directionActivityComplete = visionResults?.skipped === true
    || (visionResults?.completed === true && visionResults?.data?.activityType === 'direction-awareness');
  return directionActivityComplete ? '/report' : '/vision';
}

/** Return the next visible question, respecting the scripted demo's short flow. */
export function getPendingSessionQuestion(session = {}) {
  const answers = session.answers || {};
  const activities = Array.isArray(session.activities) ? session.activities : [];
  let visible = getVisibleQuestions(answers, activities);
  if (session.isDemo && Array.isArray(session.demoPersona?.demoQuestionIds)) {
    const allowed = new Set(session.demoPersona.demoQuestionIds);
    visible = visible.filter((question) => allowed.has(question.id));
  }
  return visible.find((question) => !isAnswerComplete(answers[question.id])) || null;
}

/**
 * Return the answers that must be revisited when moving one step backward.
 * Includes hidden conditional answers from the downstream static branch and
 * generated activity-impact answers, while retaining completed earlier work.
 */
export function getBackNavigationAnswerIds(visibleQuestions = [], currentQuestionId, answers = {}) {
  if (!Array.isArray(visibleQuestions)) return [];

  const currentIndex = visibleQuestions.findIndex((question) => question?.id === currentQuestionId);
  if (currentIndex <= 0) return [];

  const previousQuestion = visibleQuestions[currentIndex - 1];
  const previousStaticIndex = questionBank.findIndex((question) => question.id === previousQuestion?.id);

  if (previousStaticIndex >= 0) {
    const downstreamStaticIds = questionBank.slice(previousStaticIndex).map((question) => question.id);
    const participantNoteIndex = questionBank.findIndex((question) => question.id === 'participant_note');
    const downstreamActivityIds = previousStaticIndex < participantNoteIndex
      ? Object.keys(answers).filter((id) => id.startsWith('activity_impact_'))
      : [];
    return [...new Set([...downstreamStaticIds, ...downstreamActivityIds])];
  }

  // Dynamic activity-impact questions are ordered by the participant's
  // affected_activities selection. Clear the current and later activities,
  // including a conditionally hidden frequency answer, but preserve earlier
  // activity details already completed.
  const affectedActivities = Array.isArray(answers.affected_activities?.value)
    ? answers.affected_activities.value
    : [];
  const previousActivityIndex = affectedActivities.indexOf(previousQuestion?.dynamicActivityId);
  const downstreamActivities = previousActivityIndex >= 0
    ? affectedActivities.slice(previousActivityIndex)
    : [];
  const downstreamActivityIds = Object.keys(answers).filter((id) => (
    id.startsWith('activity_impact_')
    && downstreamActivities.some((activityId) => (
      id === `activity_impact_${activityId}`
      || id === `activity_impact_frequency_${activityId}`
    ))
  ));

  return [...new Set([
    ...visibleQuestions.slice(currentIndex - 1).map((question) => question.id),
    ...downstreamActivityIds,
  ])];
}

/** Route guard policy for directly opened or refreshed application URLs. */
export function getProtectedRouteRedirect(session = {}, requirements = {}) {
  // A failed shared-device deletion blocks every participant route until the
  // cleanup can be retried successfully from KioskSetup.
  if (session.kioskCleanupFailed) return '/kiosk?clearError=1';
  if (!session.sessionId || !session.consentGiven) return '/';

  const activities = Array.isArray(session.activities) ? session.activities : [];
  const primaryActivity = session.primaryActivity || null;
  if (requirements.requireProfile && (!activities.length || !primaryActivity || !activities.includes(primaryActivity))) {
    return '/activities';
  }

  if (requirements.requireIntake && getPendingSessionQuestion(session)) return '/intake';
  if (requirements.requireVision && !session.visionResults && !(session.isDemo && session.demoPersona?.skipVision)) return '/vision';
  return null;
}

export function getNewSessionRedirect(session = {}, allowNewSession = false) {
  // The app marks a fresh onboarding transition only after clearing any old
  // participant session. A direct visit to onboarding with an active session
  // returns home, while a newly-created session is allowed to continue.
  return session?.sessionId && !allowNewSession ? '/' : null;
}

export { isAnswered as isSessionAnswerComplete };

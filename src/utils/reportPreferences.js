/**
 * Pure helpers for participant-controlled report preferences.
 * Keep only distinct priorities that still correspond to an experience
 * reported in the current questionnaire session.
 */
export function normalizeDiscussionPriorities(priorities, reportedExperienceIds = []) {
  const allowed = new Set(
    Array.isArray(reportedExperienceIds)
      ? reportedExperienceIds.filter((id) => typeof id === 'string' && id.length > 0)
      : [],
  );

  return [...new Set(Array.isArray(priorities) ? priorities : [])]
    .filter((id) => typeof id === 'string' && allowed.has(id))
    .slice(0, 2);
}

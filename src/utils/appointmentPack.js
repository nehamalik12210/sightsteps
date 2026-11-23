import { formatVisionTimelineDate, normalizeVisionTimelineEntries } from './visionTimeline.js';
import { analyzeSpatial, describeSpatial } from '../engine/amslerSpatial.js';

function localized(value, language = 'en') {
  if (value && typeof value === 'object') return value[language] || value.en || '';
  return typeof value === 'string' ? value : '';
}

function compactText(value, limit) {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  if (text.length <= limit) return text;
  return text.slice(0, Math.max(0, limit - 1)).trimEnd() + '…';
}

/**
 * Build a compact, participant-owned preparation pack.
 * This helper only formats information already supplied by the participant or
 * the deterministic conversation engine; it never adds clinical conclusions.
 */
export function buildAppointmentPreparationPack({
  language = 'en',
  priorities = [],
  activities = [],
  discussionPoints = [],
  questionsToAsk = '',
  timelineEntries = [],
  amslerResults = null,
  experienceProfile = null,
  now = new Date(),
} = {}) {
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const date = now instanceof Date ? now : new Date(now);
  const preparedDate = Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

  const safePriorities = (Array.isArray(priorities) ? priorities : [])
    .filter((item) => item && typeof item === 'object')
    .slice(0, 2)
    .map((item) => ({
      id: compactText(item.id, 80),
      label: compactText(localized(item.label, language), 90),
    }))
    .filter((item) => item.label);

  const safeActivities = (Array.isArray(activities) ? activities : [])
    .map((item) => compactText(localized(item, language), 32))
    .filter(Boolean)
    .slice(0, 5);

  const safeDiscussionPoints = (Array.isArray(discussionPoints) ? discussionPoints : [])
    .filter((point) => point && localized(point.prompt, language))
    .slice(0, 3)
    .map((point) => ({
      id: compactText(point.id, 80),
      title: compactText(localized(point.title, language), 72),
      context: compactText(localized(point.context, language), 105),
      prompt: compactText(localized(point.prompt, language), 190),
    }));

  const orderedTimeline = normalizeVisionTimelineEntries(timelineEntries)
    .slice(0, 5)
    .map((entry) => ({
      id: compactText(entry.id, 80),
      dateValue: entry.date,
      date: formatVisionTimelineDate(entry.date, language),
      time: compactText(entry.time, 5),
      experience: compactText(localized(entry.experienceLabel, language), 72),
      context: compactText(entry.context, 70),
      note: compactText(entry.impact, 96),
    }));

  const safeAmsler = amslerResults?.completed && amslerResults.data
    ? {
        right: amslerResults.data.right?.cellCount ?? amslerResults.data.right?.flaggedCells?.length ?? 0,
        left: amslerResults.data.left?.cellCount ?? amslerResults.data.left?.flaggedCells?.length ?? 0,
        calibrated: amslerResults.calibrated ?? false,
      }
    : null;

  const safeExperienceProfile = experienceProfile && typeof experienceProfile === 'object'
    ? {
        mainExperience: experienceProfile.mainExperience
          ? {
              label: compactText(localized(experienceProfile.mainExperience.label, language), 72),
              summary: compactText(localized(experienceProfile.mainExperience.narrative, language), 260),
            }
          : null,
        additionalExperiences: (experienceProfile.additionalExperiences || [])
          .slice(0, 3)
          .map((item) => compactText(localized(item.label, language), 64))
          .filter(Boolean),
        activityImpacts: (experienceProfile.activityImpacts || [])
          .slice(0, 2)
          .map((item) => ({
            activity: compactText(localized(item.label, language), 48),
            summary: compactText(localized(item.summary, language), 130),
          })),
      }
    : null;

  // Spatial analysis for the prep pack
  let amslerSpatialText = null;
  if (safeAmsler && amslerResults.data) {
    const flagged = {
      right: amslerResults.data.right?.flaggedCells || [],
      left: amslerResults.data.left?.flaggedCells || [],
    };
    if (flagged.right.length > 0 || flagged.left.length > 0) {
      const spatial = analyzeSpatial(flagged);
      amslerSpatialText = describeSpatial(spatial, language);
    }
  }

  return {
    preparedDate,
    priorities: safePriorities,
    activities: safeActivities,
    discussionPoints: safeDiscussionPoints,
    questionsToAsk: compactText(questionsToAsk, 480),
    timelineEntries: orderedTimeline,
    experienceProfile: safeExperienceProfile,
    amsler: safeAmsler,
    amslerSpatial: amslerSpatialText,
    language: language === 'hi' ? 'hi' : 'en',
  };
}

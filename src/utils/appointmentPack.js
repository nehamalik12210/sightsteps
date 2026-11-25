import { formatVisionTimelineDate, normalizeVisionTimelineEntries } from './visionTimeline.js';
import { analyzeSpatial, describeSpatial, getFlaggedCellCount, normalizeFlaggedCells } from '../engine/amslerSpatial.js';
import { buildCompactExperienceSummary } from '../engine/visionExperienceProfile.js';
import { normalizeDirectionAwarenessResult } from './visionActivity.js';

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
  visionResults = null,
  experienceProfile = null,
  evidencePathways = null,
  conversationReview = null,
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
      sources: (Array.isArray(point.sources) ? point.sources : [])
        .filter((source) => source && typeof source === 'object')
        .slice(0, 8)
        .map((source) => ({
          id: compactText(source.id, 80),
          label: compactText(localized(source.label, language), 90),
          answer: compactText(localized(source.answer, language), 90),
        }))
        .filter((source) => source.id && source.label),
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

  const safeAmslerCells = amslerResults?.completed && amslerResults.data
    ? {
        right: normalizeFlaggedCells(amslerResults.data.right?.flaggedCells),
        left: normalizeFlaggedCells(amslerResults.data.left?.flaggedCells),
      }
    : null;
  const safeAmsler = safeAmslerCells
    ? {
        right: getFlaggedCellCount(amslerResults.data.right),
        left: getFlaggedCellCount(amslerResults.data.left),
        calibrated: amslerResults.calibrated ?? false,
      }
    : null;

  const normalizedVisionResults = normalizeDirectionAwarenessResult(visionResults);
  const safeVisionActivity = normalizedVisionResults?.completed
    ? {
        completed: true,
        round1: normalizedVisionResults.data.left,
        round2: normalizedVisionResults.data.right,
      }
    : normalizedVisionResults?.skipped
      ? { skipped: true }
      : null;

  const compactExperienceSummary = experienceProfile
    ? buildCompactExperienceSummary(experienceProfile, language, 260, 2)
    : '';
  const safeExperienceProfile = compactExperienceSummary
    ? { summary: compactExperienceSummary }
    : null;

  const safeConversationReview = conversationReview && (
    Boolean(conversationReview.confirmed) || String(conversationReview.correction || '').trim()
  ) ? {
    confirmed: Boolean(conversationReview.confirmed),
    correction: compactText(conversationReview.correction, 360),
  } : null;

  // Spatial analysis for the prep pack
  let amslerSpatialText = null;
  if (safeAmsler && safeAmslerCells) {
    if (safeAmslerCells.right.length > 0 || safeAmslerCells.left.length > 0) {
      const spatial = analyzeSpatial(safeAmslerCells);
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
    evidencePathways,
    conversationReview: safeConversationReview,
    amsler: safeAmsler,
    amslerSpatial: amslerSpatialText,
    visionActivity: safeVisionActivity,
    language: language === 'hi' ? 'hi' : 'en',
  };
}

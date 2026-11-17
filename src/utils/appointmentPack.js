import { formatVisionTimelineDate, sortVisionTimelineEntries } from './visionTimeline.js';

function localized(value, language = 'en') {
  if (value && typeof value === 'object') return value[language] || value.en || '';
  return typeof value === 'string' ? value : '';
}

function compactText(value, limit) {
  const text = String(value || '').trim().replace(/\\s+/g, ' ');
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

  const orderedTimeline = sortVisionTimelineEntries(timelineEntries)
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

  return {
    preparedDate,
    priorities: safePriorities,
    activities: safeActivities,
    discussionPoints: safeDiscussionPoints,
    questionsToAsk: compactText(questionsToAsk, 480),
    timelineEntries: orderedTimeline,
    language: language === 'hi' ? 'hi' : 'en',
  };
}

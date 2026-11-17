/**
 * Validation and normalization helpers for participant-recorded experiences.
 * Timeline entries are descriptive notes only; they are never scored or interpreted.
 */

export const MAX_VISION_TIMELINE_ENTRIES = 30;
export const TIMELINE_CONTEXT_MAX_LENGTH = 160;
export const TIMELINE_IMPACT_MAX_LENGTH = 600;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function cleanText(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const parts = value.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.getFullYear() === parts[0]
    && date.getMonth() === parts[1] - 1
    && date.getDate() === parts[2];
}

function cleanExperienceLabel(value) {
  if (typeof value === 'string') return cleanText(value, 120);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const en = cleanText(value.en, 120);
  const hi = cleanText(value.hi, 120);
  return en || hi ? { en: en || hi, hi: hi || en } : '';
}

export function getLocalDateInputValue(now = new Date()) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) return '';
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

/** Return a field key so the UI can provide a localized validation message. */
export function validateVisionTimelineDraft(draft = {}, options = {}) {
  const today = options.today || getLocalDateInputValue();

  if (!isValidDateString(draft.date)) return 'date';
  if (isValidDateString(today) && draft.date > today) return 'futureDate';
  if (draft.time && !TIME_PATTERN.test(draft.time)) return 'time';

  const experienceId = cleanText(draft.experienceId, 80);
  const experienceLabel = cleanExperienceLabel(draft.experienceLabel);
  if (!experienceId || !experienceLabel) return 'experience';

  if (cleanText(draft.context, TIMELINE_CONTEXT_MAX_LENGTH + 1).length > TIMELINE_CONTEXT_MAX_LENGTH) {
    return 'contextTooLong';
  }
  if (cleanText(draft.impact, TIMELINE_IMPACT_MAX_LENGTH + 1).length > TIMELINE_IMPACT_MAX_LENGTH) {
    return 'impactTooLong';
  }
  return null;
}

/** Bound stored text and safely ignore malformed rows from old/corrupt sessions. */
export function normalizeVisionTimelineEntries(entries) {
  if (!Array.isArray(entries)) return [];

  const normalized = entries
    .filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
    .map((entry) => ({
      id: cleanText(entry.id, 80),
      date: typeof entry.date === 'string' ? entry.date : '',
      time: typeof entry.time === 'string' && TIME_PATTERN.test(entry.time) ? entry.time : '',
      experienceId: cleanText(entry.experienceId, 80),
      experienceLabel: cleanExperienceLabel(entry.experienceLabel),
      context: cleanText(entry.context, TIMELINE_CONTEXT_MAX_LENGTH),
      impact: cleanText(entry.impact, TIMELINE_IMPACT_MAX_LENGTH),
      createdAt: cleanText(entry.createdAt, 40),
      updatedAt: cleanText(entry.updatedAt, 40),
    }))
    .filter((entry) => (
      entry.id
      && isValidDateString(entry.date)
      && entry.experienceId
      && entry.experienceLabel
    ));

  return sortVisionTimelineEntries(normalized).slice(0, MAX_VISION_TIMELINE_ENTRIES);
}

/** Sort newest calendar date/time first without changing the caller's array. */
export function sortVisionTimelineEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return [...entries].sort((a, b) => {
    const dateOrder = String((b && b.date) || '').localeCompare(String((a && a.date) || ''));
    if (dateOrder !== 0) return dateOrder;
    const timeOrder = String((b && b.time) || '').localeCompare(String((a && a.time) || ''));
    if (timeOrder !== 0) return timeOrder;
    return String((b && b.createdAt) || '').localeCompare(String((a && a.createdAt) || ''));
  });
}

export function createVisionTimelineEntryId() {
  if (globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  return 'timeline-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

export function formatVisionTimelineDate(value, language = 'en') {
  if (!isValidDateString(value)) return value || '';
  const parts = value.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * SightSteps — Pattern Detection Engine
 *
 * Evaluates combinations of participant-reported answers to infer clinically
 * meaningful patterns that the participant did not explicitly state.
 *
 * This module makes the app genuinely "intelligent" in the sense the ZEISS
 * "No-Device Vision Intelligence" theme requires: it tells the participant
 * something they didn't already say, backed by source links and framed as
 * a discussion prompt — never a conclusion or diagnosis.
 */

import patterns from '../data/patterns.js';

const SOURCE_LABELS = {
  blurred_vision: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' },
  blur_distance: { en: 'Distance at which blur occurs', hi: 'किस दूरी पर धुंधलापन होता है' },
  headaches: { en: 'Headaches around visual activities', hi: 'दृष्टि से जुड़ी गतिविधियों के दौरान सिरदर्द' },
  squinting: { en: 'Squinting to see clearly', hi: 'स्पष्ट देखने के लिए आँखें सिकोड़ना' },
  night_vision: { en: 'Vision in low light', hi: 'कम रोशनी में देखने का अनुभव' },
  screen_hours: { en: 'Daily screen use', hi: 'दैनिक स्क्रीन उपयोग' },
  outdoor_time: { en: 'Outdoor time', hi: 'बाहर बिताया गया समय' },
  close_work: { en: 'Close-up activities', hi: 'पास से किए जाने वाले काम' },
  eye_exam: { en: 'Previous eye examination', hi: 'पिछली आँखों की जाँच' },
  age_group: { en: 'Age group', hi: 'आयु वर्ग' },
  which_eye: { en: 'Eye(s) involved', hi: 'शामिल आँख(ें)' },
  experience_onset: { en: 'When first noticed', hi: 'पहली बार कब महसूस हुआ' },
  experience_change: { en: 'Change over time', hi: 'समय के साथ बदलाव' },
  experience_context: { en: 'Situations reported', hi: 'बताई गई परिस्थितियाँ' },
  affected_activities: { en: 'Activities reported as affected', hi: 'प्रभावित बताई गई गतिविधियाँ' },
  existing_glasses: { en: 'Current vision correction', hi: 'वर्तमान दृष्टि सुधार' },
};

function hasAnswer(answer) {
  if (!answer || answer.value === undefined || answer.value === null) return false;
  if (Array.isArray(answer.value)) return answer.value.length > 0;
  return typeof answer.value === 'string' ? answer.value.trim().length > 0 : true;
}

function buildSourceLink(key, answers) {
  const answer = answers[key];
  if (!hasAnswer(answer)) return null;
  const label = SOURCE_LABELS[key] || { en: key, hi: key };
  const answerLabel = answer.label || {
    en: Array.isArray(answer.value) ? answer.value.join(', ') : String(answer.value),
    hi: Array.isArray(answer.value) ? answer.value.join(', ') : String(answer.value),
  };
  return {
    type: 'question',
    id: key,
    label,
    answer: answerLabel,
  };
}

/**
 * Evaluate all patterns against the participant's answers.
 *
 * @param {Record<string, {value: unknown, label?: object}>} answers
 * @returns {Array<{id: string, title: object, description: object, discussionPrompt: object, icon: string, sources: Array}>}
 */
export function evaluatePatterns(answers = {}) {
  const safeAnswers = answers && typeof answers === 'object' ? answers : {};

  return patterns
    .filter((pattern) => {
      try {
        return pattern.triggers(safeAnswers);
      } catch {
        return false;
      }
    })
    .map((pattern) => {
      const sources = pattern.sourceKeys
        .map((key) => buildSourceLink(key, safeAnswers))
        .filter(Boolean);

      return {
        id: pattern.id,
        title: pattern.title,
        description: pattern.description,
        discussionPrompt: pattern.discussionPrompt,
        icon: pattern.icon,
        sources,
      };
    })
    .filter((matched) => matched.sources.length >= 2);
}

export default evaluatePatterns;

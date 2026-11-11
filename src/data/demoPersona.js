/**
 * Demo Persona: Ramesh
 *
 * Pre-scripted answers that naturally trigger interesting branching.
 * The persona follows the REAL question engine — answers are fed one
 * at a time through the same branching logic. No hardcoded skips.
 *
 * For demo mode, only 6 questions are shown (the ones triggered by
 * Ramesh's branching path that are most visually interesting).
 */

const rameshPersona = {
  name: 'Ramesh',
  nameHi: 'रमेश',
  age: 42,
  occupation: 'Tailor',
  occupationHi: 'दर्ज़ी',
  language: 'hi',

  // Pre-scripted answers keyed by question ID
  // These are fed into the real engine — branching is natural
  answers: {
    blurred_vision: { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } },
    blur_distance: { value: 'near', label: { en: 'Near objects', hi: 'पास की चीज़ें' } },
    headaches: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
    screen_hours: { value: 'moderate', label: { en: '2–6 hours', hi: '2–6 घंटे' } },
    close_work: { value: 'daily', label: { en: 'Daily, for hours', hi: 'रोज़, घंटों' } },
    eye_exam: { value: 'never', label: { en: 'Never', hi: 'कभी नहीं' } },
    existing_glasses: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
    age_group: { value: 'middle', label: { en: '40–55', hi: '40–55' } },
    night_vision: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
    squinting: { value: 'yes', label: { en: 'Yes, often', hi: 'हाँ, अक्सर' } },
    outdoor_time: { value: 'moderate', label: { en: 'A few hours', hi: 'कुछ घंटे' } },
  },

  // The 6 questions shown in demo (picked for max branching visibility)
  // Other questions are auto-answered silently
  demoQuestionIds: [
    'blurred_vision',   // Q1 — triggers blur_distance branch
    'blur_distance',    // Q2 — shows conditional question
    'headaches',        // Q3 — symptom signal
    'close_work',       // Q4 — lifestyle signal
    'eye_exam',         // Q5 — awareness signal (never → high urgency)
    'age_group',        // Q6 — presbyopia trigger (40–55)
  ],

  // TTS is spoken aloud only for Q1 and Q2 in Hindi
  ttsQuestionIds: ['blurred_vision', 'blur_distance'],

  // Vision activity is skipped in demo
  skipVision: true,
};

export default rameshPersona;


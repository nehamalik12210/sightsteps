/**
 * SightSteps Question Bank
 *
 * Each question has:
 *  - id: unique key (used in answers map and rule engine)
 *  - text: { en, hi } — bilingual text
 *  - type: 'single' | 'multi' | 'number' | 'textarea'
 *  - options: array of { value, label: { en, hi }, icon? }
 *  - showIf: optional function(answers) → boolean for conditional branching
 *  - category: which signal category this feeds ('refractive', 'lifestyle', 'awareness')
 *
 * Icons use Material Symbols icon names — not emojis.
 */

const questions = [
  {
    id: 'blurred_vision',
    text: {
      en: 'Do you experience blurred or unclear vision?',
      hi: 'क्या आपको धुंधला दिखाई देता है?',
    },
    type: 'single',
    category: 'refractive',
    options: [
      { value: 'yes', label: { en: 'Yes', hi: 'हाँ' }, icon: 'blur_on' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'help' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: 'check_circle' },
    ],
  },
  {
    id: 'blur_distance',
    text: {
      en: 'Is the blur more for near objects or far objects?',
      hi: 'धुंधलापन पास की चीज़ों में ज़्यादा है या दूर की?',
    },
    type: 'single',
    category: 'refractive',
    showIf: (answers) =>
      answers.blurred_vision?.value === 'yes' ||
      answers.blurred_vision?.value === 'sometimes',
    options: [
      { value: 'near', label: { en: 'Near objects', hi: 'पास की चीज़ें' }, icon: 'menu_book' },
      { value: 'far', label: { en: 'Far objects', hi: 'दूर की चीज़ें' }, icon: 'landscape' },
      { value: 'both', label: { en: 'Both', hi: 'दोनों' }, icon: 'visibility' },
    ],
  },
  {
    id: 'headaches',
    text: {
      en: 'Do you get headaches, especially after reading or screen use?',
      hi: 'क्या आपको सिरदर्द होता है, खासकर पढ़ने या स्क्रीन देखने के बाद?',
    },
    type: 'single',
    category: 'refractive',
    options: [
      { value: 'often', label: { en: 'Often', hi: 'अक्सर' }, icon: 'sentiment_very_dissatisfied' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'sentiment_neutral' },
      { value: 'rarely', label: { en: 'Rarely / Never', hi: 'कभी नहीं' }, icon: 'sentiment_satisfied' },
    ],
  },
  {
    id: 'squinting',
    text: {
      en: 'Do you find yourself squinting to see things clearly?',
      hi: 'क्या आप साफ देखने के लिए आँखें सिकोड़ते हैं?',
    },
    type: 'single',
    category: 'refractive',
    options: [
      { value: 'yes', label: { en: 'Yes, often', hi: 'हाँ, अक्सर' }, icon: 'visibility_off' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'help' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: 'check_circle' },
    ],
  },
  {
    id: 'screen_hours',
    text: {
      en: 'How many hours per day do you spend on screens (phone, TV, computer)?',
      hi: 'आप दिन में कितने घंटे स्क्रीन (फ़ोन, टीवी, कंप्यूटर) पर बिताते हैं?',
    },
    type: 'single',
    category: 'lifestyle',
    options: [
      { value: 'low', label: { en: 'Less than 2 hours', hi: '2 घंटे से कम' }, icon: 'smartphone' },
      { value: 'moderate', label: { en: '2–6 hours', hi: '2–6 घंटे' }, icon: 'laptop' },
      { value: 'high', label: { en: 'More than 6 hours', hi: '6 घंटे से ज़्यादा' }, icon: 'desktop_windows' },
    ],
  },
  {
    id: 'outdoor_time',
    text: {
      en: 'How much time do you spend outdoors in sunlight?',
      hi: 'आप धूप में बाहर कितना समय बिताते हैं?',
    },
    type: 'single',
    category: 'lifestyle',
    options: [
      { value: 'high', label: { en: 'Most of the day', hi: 'दिन का ज़्यादातर समय' }, icon: 'wb_sunny' },
      { value: 'moderate', label: { en: 'A few hours', hi: 'कुछ घंटे' }, icon: 'partly_cloudy_day' },
      { value: 'low', label: { en: 'Very little', hi: 'बहुत कम' }, icon: 'home' },
    ],
  },
  {
    id: 'close_work',
    text: {
      en: 'Do you do close-up work like reading, sewing, or crafts?',
      hi: 'क्या आप पास का काम करते हैं जैसे पढ़ना, सिलाई, या दस्तकारी?',
    },
    type: 'single',
    category: 'lifestyle',
    options: [
      { value: 'daily', label: { en: 'Daily, for hours', hi: 'रोज़, घंटों' }, icon: 'draw' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'edit_note' },
      { value: 'rarely', label: { en: 'Rarely', hi: 'बहुत कम' }, icon: 'block' },
    ],
  },
  {
    id: 'night_vision',
    text: {
      en: 'Do you have difficulty seeing at night or in low light?',
      hi: 'क्या आपको रात में या कम रोशनी में देखने में दिक्कत होती है?',
    },
    type: 'single',
    category: 'refractive',
    options: [
      { value: 'yes', label: { en: 'Yes', hi: 'हाँ' }, icon: 'dark_mode' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'help' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: 'check_circle' },
    ],
  },
  // ─── Stage 3: Context Questions ───
  {
    id: 'experience_frequency',
    text: {
      en: 'How often do you notice these vision experiences?',
      hi: 'आप इन दृष्टि अनुभवों को कितनी बार महसूस करते हैं?',
    },
    type: 'single',
    category: 'refractive',
    showIf: (answers) =>
      answers.blurred_vision?.value === 'yes' ||
      answers.blurred_vision?.value === 'sometimes' ||
      answers.headaches?.value === 'often' ||
      answers.headaches?.value === 'sometimes' ||
      answers.squinting?.value === 'yes' ||
      answers.squinting?.value === 'sometimes' ||
      answers.night_vision?.value === 'yes' ||
      answers.night_vision?.value === 'sometimes',
    options: [
      { value: 'daily', label: { en: 'Every day', hi: 'रोज़' }, icon: 'today' },
      { value: 'weekly', label: { en: 'A few times a week', hi: 'हफ़्ते में कुछ बार' }, icon: 'date_range' },
      { value: 'occasional', label: { en: 'Occasionally', hi: 'कभी-कभी' }, icon: 'event' },
    ],
  },
  {
    id: 'which_eye',
    text: {
      en: 'Do you notice it in one eye, both eyes, or are you unsure?',
      hi: 'क्या यह एक आँख में है, दोनों में, या आप अनिश्चित हैं?',
    },
    type: 'single',
    category: 'refractive',
    showIf: (answers) =>
      answers.blurred_vision?.value === 'yes' ||
      answers.blurred_vision?.value === 'sometimes' ||
      answers.squinting?.value === 'yes',
    options: [
      { value: 'left', label: { en: 'Left eye', hi: 'बाईं आँख' }, icon: 'visibility' },
      { value: 'right', label: { en: 'Right eye', hi: 'दाईं आँख' }, icon: 'visibility' },
      { value: 'both', label: { en: 'Both eyes', hi: 'दोनों आँखें' }, icon: 'remove_red_eye' },
      { value: 'unsure', label: { en: 'Not sure', hi: 'पता नहीं' }, icon: 'help' },
    ],
  },
  // ─── Stage 4: Eye-care Background ───
  {
    id: 'existing_glasses',
    text: {
      en: 'Do you currently wear glasses or contact lenses?',
      hi: 'क्या आप अभी चश्मा या कॉन्टैक्ट लेंस पहनते हैं?',
    },
    type: 'single',
    category: 'awareness',
    options: [
      { value: 'glasses', label: { en: 'Yes, glasses', hi: 'हाँ, चश्मा' }, icon: 'eyeglasses' },
      { value: 'contacts', label: { en: 'Yes, contacts', hi: 'हाँ, कॉन्टैक्ट लेंस' }, icon: 'lens' },
      { value: 'both', label: { en: 'Both', hi: 'दोनों' }, icon: 'add_circle' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: 'block' },
    ],
  },
  {
    id: 'glasses_age',
    text: {
      en: 'How old is your current prescription?',
      hi: 'आपका मौजूदा चश्मा कितना पुराना है?',
    },
    type: 'single',
    category: 'awareness',
    showIf: (answers) =>
      answers.existing_glasses?.value === 'glasses' ||
      answers.existing_glasses?.value === 'contacts' ||
      answers.existing_glasses?.value === 'both',
    options: [
      { value: 'recent', label: { en: 'Less than 1 year', hi: '1 साल से कम' }, icon: 'new_releases' },
      { value: 'old', label: { en: '1–2 years', hi: '1–2 साल' }, icon: 'calendar_month' },
      { value: 'very_old', label: { en: 'More than 2 years', hi: '2 साल से ज़्यादा' }, icon: 'schedule' },
      { value: 'unknown', label: { en: "Don't know", hi: 'पता नहीं' }, icon: 'help' },
    ],
  },
  {
    id: 'eye_exam',
    text: {
      en: 'When was your last professional eye examination?',
      hi: 'आपकी आखिरी आँखों की जाँच कब हुई थी?',
    },
    type: 'single',
    category: 'awareness',
    options: [
      { value: 'recent', label: { en: 'Within last year', hi: 'पिछले साल' }, icon: 'check_circle' },
      { value: 'old', label: { en: '1–3 years ago', hi: '1–3 साल पहले' }, icon: 'calendar_month' },
      { value: 'very_old', label: { en: 'More than 3 years', hi: '3 साल से ज़्यादा' }, icon: 'schedule' },
      { value: 'never', label: { en: 'Never', hi: 'कभी नहीं' }, icon: 'cancel' },
    ],
  },
  {
    id: 'age_group',
    text: {
      en: 'Which age group do you belong to?',
      hi: 'आपकी उम्र कितनी है?',
    },
    type: 'single',
    category: 'awareness',
    options: [
      { value: 'young', label: { en: 'Under 18', hi: '18 से कम' }, icon: 'child_care' },
      { value: 'adult', label: { en: '18–39', hi: '18–39' }, icon: 'person' },
      { value: 'middle', label: { en: '40–55', hi: '40–55' }, icon: 'person_3' },
      { value: 'senior', label: { en: 'Above 55', hi: '55 से ऊपर' }, icon: 'elderly' },
    ],
  },
  // ─── Stage 5: Optional Note ───
  {
    id: 'participant_note',
    text: {
      en: 'Is there anything else you would like to mention about your vision?',
      hi: 'क्या आप अपनी दृष्टि के बारे में कुछ और बताना चाहेंगे?',
    },
    type: 'textarea',
    category: 'awareness',
    optional: true,
    options: [],
  },
];

export default questions;

/**
 * Get the ordered list of questions that should be shown
 * based on current answers (respecting showIf branching).
 */
export function getVisibleQuestions(answers) {
  return questions.filter((q) => {
    if (!q.showIf) return true;
    return q.showIf(answers);
  });
}

/**
 * Get the next unanswered question from the visible list.
 */
export function getNextQuestion(answers) {
  const visible = getVisibleQuestions(answers);
  return visible.find((q) => !answers[q.id]) || null;
}

/**
 * Get progress as a fraction.
 */
export function getProgress(answers) {
  const visible = getVisibleQuestions(answers);
  const answered = visible.filter((q) => answers[q.id]).length;
  return { answered, total: visible.length, fraction: answered / visible.length };
}

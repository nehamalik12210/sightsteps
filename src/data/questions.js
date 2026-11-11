/**
 * SightSteps Question Bank
 *
 * Each question has:
 *  - id: unique key (used in answers map and rule engine)
 *  - text: { en, hi } — bilingual text
 *  - type: 'single' | 'multi' | 'number'
 *  - options: array of { value, label: { en, hi }, icon? }
 *  - showIf: optional function(answers) → boolean for conditional branching
 *  - category: which signal category this feeds ('refractive', 'lifestyle', 'awareness')
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
      { value: 'yes', label: { en: 'Yes', hi: 'हाँ' }, icon: '😵‍💫' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: '🤔' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: '👍' },
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
      { value: 'near', label: { en: 'Near objects', hi: 'पास की चीज़ें' }, icon: '📖' },
      { value: 'far', label: { en: 'Far objects', hi: 'दूर की चीज़ें' }, icon: '🏔️' },
      { value: 'both', label: { en: 'Both', hi: 'दोनों' }, icon: '👀' },
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
      { value: 'often', label: { en: 'Often', hi: 'अक्सर' }, icon: '🤕' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: '😐' },
      { value: 'rarely', label: { en: 'Rarely / Never', hi: 'कभी नहीं' }, icon: '😊' },
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
      { value: 'yes', label: { en: 'Yes, often', hi: 'हाँ, अक्सर' }, icon: '😑' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: '🤔' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: '👍' },
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
      { value: 'low', label: { en: 'Less than 2 hours', hi: '2 घंटे से कम' }, icon: '📱' },
      { value: 'moderate', label: { en: '2–6 hours', hi: '2–6 घंटे' }, icon: '💻' },
      { value: 'high', label: { en: 'More than 6 hours', hi: '6 घंटे से ज़्यादा' }, icon: '🖥️' },
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
      { value: 'high', label: { en: 'Most of the day', hi: 'दिन का ज़्यादातर समय' }, icon: '☀️' },
      { value: 'moderate', label: { en: 'A few hours', hi: 'कुछ घंटे' }, icon: '🌤️' },
      { value: 'low', label: { en: 'Very little', hi: 'बहुत कम' }, icon: '🏠' },
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
      { value: 'daily', label: { en: 'Daily, for hours', hi: 'रोज़, घंटों' }, icon: '🧵' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: '📝' },
      { value: 'rarely', label: { en: 'Rarely', hi: 'बहुत कम' }, icon: '🙅' },
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
      { value: 'yes', label: { en: 'Yes', hi: 'हाँ' }, icon: '🌙' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: '🤔' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: '👍' },
    ],
  },
  {
    id: 'existing_glasses',
    text: {
      en: 'Do you currently wear glasses or contact lenses?',
      hi: 'क्या आप अभी चश्मा या कॉन्टैक्ट लेंस पहनते हैं?',
    },
    type: 'single',
    category: 'awareness',
    options: [
      { value: 'glasses', label: { en: 'Yes, glasses', hi: 'हाँ, चश्मा' }, icon: '👓' },
      { value: 'contacts', label: { en: 'Yes, contacts', hi: 'हाँ, कॉन्टैक्ट लेंस' }, icon: '🔵' },
      { value: 'both', label: { en: 'Both', hi: 'दोनों' }, icon: '👓🔵' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: '🙅' },
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
      { value: 'recent', label: { en: 'Less than 1 year', hi: '1 साल से कम' }, icon: '🆕' },
      { value: 'old', label: { en: '1–2 years', hi: '1–2 साल' }, icon: '📅' },
      { value: 'very_old', label: { en: 'More than 2 years', hi: '2 साल से ज़्यादा' }, icon: '⏰' },
      { value: 'unknown', label: { en: "Don't know", hi: 'पता नहीं' }, icon: '🤷' },
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
      { value: 'recent', label: { en: 'Within last year', hi: 'पिछले साल' }, icon: '✅' },
      { value: 'old', label: { en: '1–3 years ago', hi: '1–3 साल पहले' }, icon: '📅' },
      { value: 'very_old', label: { en: 'More than 3 years', hi: '3 साल से ज़्यादा' }, icon: '⏰' },
      { value: 'never', label: { en: 'Never', hi: 'कभी नहीं' }, icon: '❌' },
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
      { value: 'young', label: { en: 'Under 18', hi: '18 से कम' }, icon: '🧒' },
      { value: 'adult', label: { en: '18–39', hi: '18–39' }, icon: '🧑' },
      { value: 'middle', label: { en: '40–55', hi: '40–55' }, icon: '🧑‍🦳' },
      { value: 'senior', label: { en: 'Above 55', hi: '55 से ऊपर' }, icon: '👴' },
    ],
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


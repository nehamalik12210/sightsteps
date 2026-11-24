/**
 * SightSteps bilingual question bank.
 * Question IDs are stable because saved sessions and the rules engine use them.
 */

const questions = [
  {
    id: 'blurred_vision',
    text: { en: 'Do you experience blurred or unclear vision?', hi: 'क्या आपको धुंधला दिखाई देता है?' },
    type: 'single', category: 'refractive',
    options: [
      { value: 'yes', label: { en: 'Yes', hi: 'हाँ' }, icon: 'blur_on' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'help' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: 'check_circle' },
    ],
  },
  {
    id: 'blur_distance',
    text: { en: 'Is the blur more noticeable with near objects or far objects?', hi: 'धुंधलापन पास की चीज़ों में ज़्यादा है या दूर की?' },
    type: 'single', category: 'refractive',
    showIf: (answers) => ['yes', 'sometimes'].includes(answers.blurred_vision?.value),
    options: [
      { value: 'near', label: { en: 'Near objects', hi: 'पास की चीज़ें' }, icon: 'menu_book' },
      { value: 'far', label: { en: 'Far objects', hi: 'दूर की चीज़ें' }, icon: 'landscape' },
      { value: 'both', label: { en: 'Both', hi: 'दोनों' }, icon: 'visibility' },
    ],
  },
  {
    id: 'headaches',
    text: { en: 'How often do you get headaches?', hi: 'आपको कितनी बार सिरदर्द होता है?' },
    type: 'single', category: 'refractive',
    options: [
      { value: 'often', label: { en: 'Often', hi: 'अक्सर' }, icon: 'sentiment_very_dissatisfied' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'sentiment_neutral' },
      { value: 'rarely', label: { en: 'Rarely / Never', hi: 'बहुत कम / कभी नहीं' }, icon: 'sentiment_satisfied' },
    ],
  },
  {
    id: 'squinting',
    text: { en: 'Do you find yourself squinting to see things clearly?', hi: 'क्या आप साफ देखने के लिए आँखें सिकोड़ते हैं?' },
    type: 'single', category: 'refractive',
    options: [
      { value: 'yes', label: { en: 'Yes, often', hi: 'हाँ, अक्सर' }, icon: 'visibility_off' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'help' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: 'check_circle' },
    ],
  },
  {
    id: 'screen_hours',
    text: { en: 'How many hours per day do you spend on screens (phone, TV, computer)?', hi: 'आप दिन में कितने घंटे स्क्रीन (फ़ोन, टीवी, कंप्यूटर) पर बिताते हैं?' },
    type: 'single', category: 'lifestyle',
    options: [
      { value: 'low', label: { en: 'Less than 2 hours', hi: '2 घंटे से कम' }, icon: 'smartphone' },
      { value: 'moderate', label: { en: '2–6 hours', hi: '2–6 घंटे' }, icon: 'laptop' },
      { value: 'high', label: { en: 'More than 6 hours', hi: '6 घंटे से ज़्यादा' }, icon: 'desktop_windows' },
    ],
  },
  {
    id: 'outdoor_time',
    text: { en: 'How much time do you spend outdoors in a typical day?', hi: 'आप आम तौर पर दिन में कितना समय बाहर बिताते हैं?' },
    type: 'single', category: 'lifestyle',
    options: [
      { value: 'high', label: { en: 'Most of the day', hi: 'दिन का ज़्यादातर समय' }, icon: 'wb_sunny' },
      { value: 'moderate', label: { en: 'A few hours', hi: 'कुछ घंटे' }, icon: 'partly_cloudy_day' },
      { value: 'low', label: { en: 'Very little', hi: 'बहुत कम' }, icon: 'home' },
    ],
  },
  {
    id: 'close_work',
    text: { en: 'How often do you spend extended periods doing close-up work?', hi: 'आप कितनी बार लंबे समय तक पास से देखने वाला काम करते हैं?' },
    type: 'single', category: 'lifestyle',
    options: [
      { value: 'daily', label: { en: 'Daily, for hours', hi: 'रोज़, कई घंटे' }, icon: 'draw' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'edit_note' },
      { value: 'rarely', label: { en: 'Rarely', hi: 'बहुत कम' }, icon: 'block' },
    ],
  },
  {
    id: 'night_vision',
    text: { en: 'Do you have difficulty seeing at night or in low light?', hi: 'क्या आपको रात में या कम रोशनी में देखने में दिक्कत होती है?' },
    type: 'single', category: 'refractive',
    options: [
      { value: 'yes', label: { en: 'Yes', hi: 'हाँ' }, icon: 'dark_mode' },
      { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'help' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: 'check_circle' },
    ],
  },
  {
    id: 'primary_concern',
    text: { en: 'Which reported experience would you most like to discuss first?', hi: 'आप सबसे पहले किस बताए गए अनुभव पर चर्चा करना चाहेंगे?' },
    type: 'single', category: 'refractive',
    showIf: (answers) => hasReportedExperience(answers),
    options: [
      { value: 'blurred_vision', label: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' }, icon: 'blur_on' },
      { value: 'headaches', label: { en: 'Headaches around visual activities', hi: 'दृष्टि से जुड़ी गतिविधियों के दौरान सिरदर्द' }, icon: 'sentiment_neutral' },
      { value: 'squinting', label: { en: 'Squinting to see clearly', hi: 'स्पष्ट देखने के लिए आँखें सिकोड़ना' }, icon: 'visibility_off' },
      { value: 'night_vision', label: { en: 'Difficulty in low light', hi: 'कम रोशनी में देखने में कठिनाई' }, icon: 'dark_mode' },
    ],
  },
  {
    id: 'additional_concerns',
    text: {
      en: 'Are there other experiences you would also like to discuss? Select any that apply.',
      hi: 'क्या ऐसे अन्य अनुभव भी हैं जिन पर आप चर्चा करना चाहेंगे? लागू विकल्प चुनें।',
    },
    type: 'multi', category: 'refractive',
    showIf: (answers) => Boolean(answers.primary_concern?.value)
      && getReportedExperienceOptions(answers).some((item) => item.value !== answers.primary_concern?.value),
    options: [
      { value: 'none', label: { en: 'No other experience to add', hi: 'कोई अन्य अनुभव नहीं जोड़ना' }, icon: 'do_not_disturb_on' },
      { value: 'unsure', label: { en: 'Not sure', hi: 'निश्चित नहीं' }, icon: 'help' },
    ],
  },
  {
    id: 'experience_onset',
    text: { en: 'When did you first notice this main experience?', hi: 'आपने यह मुख्य अनुभव पहली बार कब महसूस किया?' },
    type: 'single', category: 'refractive',
    showIf: (answers) => Boolean(answers.primary_concern?.value),
    options: [
      { value: 'recent_weeks', label: { en: 'Within the last few weeks', hi: 'पिछले कुछ हफ़्तों में' }, icon: 'event' },
      { value: 'recent_months', label: { en: 'Within the last few months', hi: 'पिछले कुछ महीनों में' }, icon: 'calendar_month' },
      { value: 'over_year', label: { en: 'More than a year ago', hi: 'एक वर्ष से अधिक पहले' }, icon: 'history' },
      { value: 'unsure', label: { en: 'Not sure', hi: 'निश्चित नहीं' }, icon: 'help' },
    ],
  },
  {
    id: 'experience_change',
    text: { en: 'How has this experience changed over time?', hi: 'समय के साथ यह अनुभव कैसे बदला है?' },
    type: 'single', category: 'refractive',
    showIf: (answers) => Boolean(answers.primary_concern?.value),
    options: [
      { value: 'more_noticeable', label: { en: 'It has become more noticeable', hi: 'यह अधिक महसूस होने लगा है' }, icon: 'trending_up' },
      { value: 'less_noticeable', label: { en: 'It has become less noticeable', hi: 'यह कम महसूस होने लगा है' }, icon: 'trending_down' },
      { value: 'unchanged', label: { en: 'It feels about the same', hi: 'यह लगभग पहले जैसा है' }, icon: 'horizontal_rule' },
      { value: 'varies', label: { en: 'It varies', hi: 'इसमें उतार-चढ़ाव होता है' }, icon: 'sync' },
      { value: 'unsure', label: { en: 'Not sure', hi: 'निश्चित नहीं' }, icon: 'help' },
    ],
  },
  {
    id: 'experience_context',
    text: { en: 'In which situations do you notice this experience? Select all that apply.', hi: 'आप किन परिस्थितियों में यह अनुभव महसूस करते हैं? सभी लागू विकल्प चुनें।' },
    type: 'multi', category: 'refractive',
    showIf: (answers) => Boolean(answers.primary_concern?.value),
    options: [
      { value: 'near_tasks', label: { en: 'Reading or other near tasks', hi: 'पढ़ना या पास के काम' }, icon: 'menu_book' },
      { value: 'distance_tasks', label: { en: 'Looking at distant objects', hi: 'दूर की वस्तुएँ देखना' }, icon: 'landscape' },
      { value: 'screens', label: { en: 'Using screens', hi: 'स्क्रीन का उपयोग' }, icon: 'devices' },
      { value: 'low_light', label: { en: 'Low-light situations', hi: 'कम रोशनी की स्थिति' }, icon: 'dark_mode' },
      { value: 'outdoors', label: { en: 'Outdoors or bright conditions', hi: 'बाहर या तेज़ रोशनी में' }, icon: 'wb_sunny' },
      { value: 'driving', label: { en: 'Driving or travelling', hi: 'ड्राइविंग या यात्रा' }, icon: 'directions_car' },
      { value: 'varies', label: { en: 'It varies / no clear pattern', hi: 'अलग-अलग / कोई स्पष्ट पैटर्न नहीं' }, icon: 'help' },
    ],
  },
  {
    id: 'experience_frequency',
    text: { en: 'How often do you notice the main vision experience you want to discuss?', hi: 'जिस मुख्य दृष्टि अनुभव पर आप बात करना चाहते हैं, वह कितनी बार होता है?' },
    type: 'single', category: 'refractive',
    showIf: (answers) => Boolean(answers.primary_concern?.value) && answers.primary_concern.value !== 'headaches',
    options: [
      { value: 'daily', label: { en: 'Every day', hi: 'रोज़' }, icon: 'today' },
      { value: 'weekly', label: { en: 'A few times a week', hi: 'हफ़्ते में कुछ बार' }, icon: 'date_range' },
      { value: 'occasional', label: { en: 'Occasionally', hi: 'कभी-कभी' }, icon: 'event' },
    ],
  },
  {
    id: 'which_eye',
    text: { en: 'For that main experience, do you notice it in one eye, both eyes, or are you unsure?', hi: 'उस मुख्य अनुभव में दिक्कत एक आँख में है, दोनों में, या आप अनिश्चित हैं?' },
    type: 'single', category: 'refractive',
    showIf: (answers) => Boolean(answers.primary_concern?.value) && answers.primary_concern.value !== 'headaches',
    options: [
      { value: 'left', label: { en: 'Left eye', hi: 'बाईं आँख' }, icon: 'visibility' },
      { value: 'right', label: { en: 'Right eye', hi: 'दाईं आँख' }, icon: 'visibility' },
      { value: 'both', label: { en: 'Both eyes', hi: 'दोनों आँखें' }, icon: 'remove_red_eye' },
      { value: 'unsure', label: { en: 'Not sure', hi: 'पता नहीं' }, icon: 'help' },
    ],
  },
  {
    id: 'affected_activities',
    text: {
      en: 'Which of your everyday activities feel affected by the vision experience you reported? Select all that apply.',
      hi: 'आपके बताए गए दृष्टि अनुभव से रोज़मर्रा की कौन-सी गतिविधियाँ प्रभावित महसूस होती हैं? एक या अधिक चुनें।',
    },
    type: 'multi', category: 'lifestyle',
    showIf: (answers) => Boolean(answers.primary_concern?.value),
    options: [
      { value: 'screen_work', label: { en: 'Screen work', hi: 'स्क्रीन पर काम' }, icon: 'devices' },
      { value: 'reading', label: { en: 'Reading & study', hi: 'पढ़ाई और अध्ययन' }, icon: 'menu_book' },
      { value: 'fine_detail', label: { en: 'Fine-detail work & crafts', hi: 'बारीक काम और दस्तकारी' }, icon: 'draw' },
      { value: 'driving', label: { en: 'Driving & travel', hi: 'ड्राइविंग और यात्रा' }, icon: 'directions_car' },
      { value: 'outdoor', label: { en: 'Outdoor activities', hi: 'बाहरी गतिविधियाँ' }, icon: 'park' },
      { value: 'other', label: { en: 'Other', hi: 'अन्य' }, icon: 'more_horiz' },
      { value: 'none', label: { en: 'None of these', hi: 'इनमें से कोई नहीं' }, icon: 'check_circle' },
      { value: 'unsure', label: { en: 'Not sure', hi: 'निश्चित नहीं' }, icon: 'help' },
    ],
  },
  {
    id: 'existing_glasses',
    text: { en: 'Do you currently wear glasses or contact lenses?', hi: 'क्या आप अभी चश्मा या कॉन्टैक्ट लेंस पहनते हैं?' },
    type: 'single', category: 'awareness',
    options: [
      { value: 'glasses', label: { en: 'Yes, glasses', hi: 'हाँ, चश्मा' }, icon: 'eyeglasses' },
      { value: 'contacts', label: { en: 'Yes, contacts', hi: 'हाँ, कॉन्टैक्ट लेंस' }, icon: 'lens' },
      { value: 'both', label: { en: 'Both', hi: 'दोनों' }, icon: 'add_circle' },
      { value: 'no', label: { en: 'No', hi: 'नहीं' }, icon: 'block' },
    ],
  },
  {
    id: 'glasses_age',
    text: { en: 'How old is your current prescription?', hi: 'आपका मौजूदा चश्मे का प्रिस्क्रिप्शन कितना पुराना है?' },
    type: 'single', category: 'awareness',
    showIf: (answers) => ['glasses', 'contacts', 'both'].includes(answers.existing_glasses?.value),
    options: [
      { value: 'recent', label: { en: 'Less than 1 year', hi: '1 साल से कम' }, icon: 'new_releases' },
      { value: 'old', label: { en: '1–2 years', hi: '1–2 साल' }, icon: 'calendar_month' },
      { value: 'very_old', label: { en: 'More than 2 years', hi: '2 साल से ज़्यादा' }, icon: 'schedule' },
      { value: 'unknown', label: { en: "Don't know", hi: 'पता नहीं' }, icon: 'help' },
    ],
  },
  {
    id: 'eye_exam',
    text: { en: 'When was your last professional eye examination?', hi: 'आपकी आखिरी पेशेवर आँखों की जाँच कब हुई थी?' },
    type: 'single', category: 'awareness',
    options: [
      { value: 'recent', label: { en: 'Within the last year', hi: 'पिछले एक साल में' }, icon: 'check_circle' },
      { value: 'old', label: { en: '1–3 years ago', hi: '1–3 साल पहले' }, icon: 'calendar_month' },
      { value: 'very_old', label: { en: 'More than 3 years ago', hi: '3 साल से ज़्यादा पहले' }, icon: 'schedule' },
      { value: 'never', label: { en: 'Never', hi: 'कभी नहीं' }, icon: 'cancel' },
    ],
  },
  {
    id: 'age_group',
    text: { en: 'Which age group do you belong to?', hi: 'आप किस आयु वर्ग में आते हैं?' },
    type: 'single', category: 'awareness',
    options: [
      { value: 'young', label: { en: 'Under 18', hi: '18 से कम' }, icon: 'child_care' },
      { value: 'adult', label: { en: '18–39', hi: '18–39' }, icon: 'person' },
      { value: 'middle', label: { en: '40–55', hi: '40–55' }, icon: 'person_3' },
      { value: 'senior', label: { en: 'Above 55', hi: '55 से ऊपर' }, icon: 'elderly' },
    ],
  },
  {
    id: 'participant_note',
    text: { en: 'Is there anything else you would like to mention about your vision?', hi: 'क्या आप अपनी दृष्टि के बारे में कुछ और बताना चाहेंगे?' },
    type: 'textarea', category: 'awareness', optional: true, options: [],
  },
];

export default questions;

const EXPERIENCE_ANSWER_VALUES = {
  blurred_vision: ['yes', 'sometimes'],
  headaches: ['often', 'sometimes'],
  squinting: ['yes', 'sometimes'],
  night_vision: ['yes', 'sometimes'],
};

const ACTIVITY_LABELS = {
  screen_work: { en: 'Screen work', hi: 'स्क्रीन पर काम' },
  reading: { en: 'Reading & study', hi: 'पढ़ाई और अध्ययन' },
  fine_detail: { en: 'Fine-detail work & crafts', hi: 'बारीक काम और दस्तकारी' },
  driving: { en: 'Driving & travel', hi: 'ड्राइविंग और यात्रा' },
  outdoor: { en: 'Outdoor activities', hi: 'बाहरी गतिविधियाँ' },
  other: { en: 'Other', hi: 'अन्य' },
};

const IMPACT_FREQUENCY_OPTIONS = [
  { value: 'most_times', label: { en: 'Most times I do this activity', hi: 'जब भी मैं यह गतिविधि करता/करती हूँ, अधिकतर बार' }, icon: 'repeat' },
  { value: 'often', label: { en: 'Often', hi: 'अक्सर' }, icon: 'event_repeat' },
  { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' }, icon: 'schedule' },
  { value: 'rarely', label: { en: 'Rarely', hi: 'बहुत कम' }, icon: 'event' },
  { value: 'varies', label: { en: 'It varies', hi: 'यह बदलता रहता है' }, icon: 'sync' },
  { value: 'unsure', label: { en: 'Not sure', hi: 'निश्चित नहीं' }, icon: 'help' },
];

const IMPACT_OPTIONS = [
  { value: 'takes_longer', label: { en: 'It takes me longer than usual', hi: 'इसमें सामान्य से अधिक समय लगता है' }, icon: 'schedule' },
  { value: 'discomfort', label: { en: 'I feel discomfort', hi: 'मुझे असहजता महसूस होती है' }, icon: 'sentiment_dissatisfied' },
  { value: 'avoid_stop', label: { en: 'I avoid or stop the activity', hi: 'मैं गतिविधि टालता/रोकता हूँ' }, icon: 'pause_circle' },
  { value: 'adjustments', label: { en: 'I need to adjust distance, lighting or position', hi: 'मुझे दूरी, रोशनी या स्थिति बदलनी पड़ती है' }, icon: 'tune' },
  { value: 'other', label: { en: 'Something else', hi: 'कुछ और' }, icon: 'more_horiz' },
  { value: 'none', label: { en: 'Actually, I do not notice an impact', hi: 'वास्तव में, मुझे कोई प्रभाव महसूस नहीं होता' }, icon: 'check_circle' },
  { value: 'unsure', label: { en: 'Not sure how to describe it', hi: 'कैसे बताएँ, निश्चित नहीं' }, icon: 'help' },
];

export function isAnswerComplete(answer) {
  if (!answer || answer.value === undefined || answer.value === null) return false;
  if (Array.isArray(answer.value)) return answer.value.length > 0;
  return true;
}

export function hasReportedExperience(answers = {}) {
  return Object.entries(EXPERIENCE_ANSWER_VALUES).some(([id, values]) => values.includes(answers[id]?.value));
}

export function getReportedExperienceOptions(answers = {}) {
  const labels = {
    blurred_vision: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' },
    headaches: { en: 'Headaches around visual activities', hi: 'दृष्टि से जुड़ी गतिविधियों के दौरान सिरदर्द' },
    squinting: { en: 'Squinting to see clearly', hi: 'स्पष्ट देखने के लिए आँखें सिकोड़ना' },
    night_vision: { en: 'Difficulty in low light', hi: 'कम रोशनी में देखने में कठिनाई' },
  };
  return Object.entries(EXPERIENCE_ANSWER_VALUES)
    .filter(([id, values]) => values.includes(answers[id]?.value))
    .map(([id]) => ({ value: id, label: labels[id], icon: questions.find((q) => q.id === id)?.options?.[0]?.icon || 'visibility' }));
}

const EXPERIENCE_CONTEXT_EXCLUSIONS = {
  // Blur distance is already captured by the dedicated near/far question.
  blurred_vision: ['near_tasks', 'distance_tasks'],
  // The initial night-vision response already establishes the low-light context.
  night_vision: ['low_light'],
};

function getExperienceContextOptions(experienceId, options) {
  const excluded = EXPERIENCE_CONTEXT_EXCLUSIONS[experienceId] || [];
  return options.filter((option) => !excluded.includes(option.value));
}

const ADDITIONAL_CONCERN_EXCLUSIONS = [
  { value: 'none', label: { en: 'No other experience to add', hi: 'कोई अन्य अनुभव नहीं जोड़ना' }, icon: 'do_not_disturb_on' },
  { value: 'unsure', label: { en: 'Not sure', hi: 'निश्चित नहीं' }, icon: 'help' },
];

export function getSelectedAdditionalExperienceIds(answers = {}) {
  const primaryId = answers?.primary_concern?.value;
  const reportedIds = new Set(getReportedExperienceOptions(answers).map((item) => item.value));
  return [...new Set(Array.isArray(answers?.additional_concerns?.value) ? answers.additional_concerns.value : [])]
    .filter((id) => id !== primaryId && reportedIds.has(id));
}

export function getActivityLabel(activityId, answers = {}) {
  if (activityId === 'other') {
    const custom = typeof answers?.custom_activity_name?.value === 'string' ? answers.custom_activity_name.value.trim() : '';
    if (custom) return { en: custom, hi: custom };
  }
  return ACTIVITY_LABELS[activityId] || null;
}

function buildAdditionalExperienceQuestions(answers = {}) {
  const reported = new Map(getReportedExperienceOptions(answers).map((item) => [item.value, item.label]));
  const onsetOptions = questions.find((question) => question.id === 'experience_onset')?.options || [];
  const frequencyOptions = questions.find((question) => question.id === 'experience_frequency')?.options || [];
  const contextOptions = questions.find((question) => question.id === 'experience_context')?.options || [];
  const eyeOptions = questions.find((question) => question.id === 'which_eye')?.options || [];
  return getSelectedAdditionalExperienceIds(answers).flatMap((experienceId) => {
    const label = reported.get(experienceId) || { en: experienceId, hi: experienceId };
    const prefix = 'additional_experience_' + experienceId;
    const visible = (currentAnswers) => getSelectedAdditionalExperienceIds(currentAnswers).includes(experienceId);
    const detail = (suffix, en, hi, type, options) => ({
      id: prefix + '_' + suffix,
      text: { en: en + ' ' + String(label.en || label.hi).toLowerCase() + '?', hi: String(label.hi || label.en) + ' — ' + hi },
      type, category: 'refractive', showIf: visible, additionalExperienceId: experienceId, options,
    });
    return [
      detail('onset', 'When did you first notice', 'आपने इसे पहली बार कब महसूस किया?', 'single', onsetOptions),
      ...(experienceId === 'headaches' ? [] : [detail('frequency', 'How often do you notice', 'यह कितनी बार महसूस होता है?', 'single', frequencyOptions)]),
      detail('context', 'In which situations do you notice', 'किन परिस्थितियों में यह महसूस होता है? सभी लागू विकल्प चुनें।', 'multi', getExperienceContextOptions(experienceId, contextOptions)),
      ...(experienceId === 'headaches' ? [] : [detail('eye', 'Where do you notice', 'यह किस आँख में महसूस होता है?', 'single', eyeOptions)]),
    ];
  });
}

/**
 * Keep the affected-activities follow-up constrained to the participant's
 * previously selected routine, while retaining explicit none/unsure choices.
 */
export function getQuestionForActivities(question, activities = [], answers = {}) {
  if (question?.id !== 'affected_activities') return question;
  const selectedActivities = new Set(Array.isArray(activities) ? activities : []);
  return {
    ...question,
    options: question.options
      .filter((option) => ['none', 'unsure'].includes(option.value) || selectedActivities.has(option.value))
      .map((option) => option.value === 'other' && getActivityLabel('other', answers)
        ? { ...option, label: getActivityLabel('other', answers) }
        : option),
  };
}

function buildActivityImpactQuestions(selectedActivities = [], answers = {}) {
  const activityIds = Array.isArray(selectedActivities) ? selectedActivities : [];
  return activityIds
    .filter((id) => ACTIVITY_LABELS[id])
    .flatMap((activityId) => {
      const activityLabel = getActivityLabel(activityId, answers) || ACTIVITY_LABELS[activityId];
      return [
        {
          id: `activity_impact_${activityId}`,
          text: {
            en: `How does ${activityLabel.en.toLowerCase()} feel affected? Select all that apply.`,
            hi: `${activityLabel.hi} किस तरह प्रभावित महसूस होती है? सभी लागू विकल्प चुनें।`,
          },
          type: 'multi',
          category: 'lifestyle',
          dynamicActivityId: activityId,
          showIf: (currentAnswers) => Boolean(currentAnswers.affected_activities?.value?.includes(activityId)),
          options: IMPACT_OPTIONS,
        },
        {
          id: `activity_impact_frequency_${activityId}`,
          text: {
            en: `How often do you notice this impact during ${activityLabel.en.toLowerCase()}?`,
            hi: `${activityLabel.hi} के दौरान आप यह प्रभाव कितनी बार महसूस करते हैं?`,
          },
          type: 'single',
          category: 'lifestyle',
          dynamicActivityId: activityId,
          showIf: (currentAnswers) => {
            const values = currentAnswers[`activity_impact_${activityId}`]?.value;
            return Boolean(currentAnswers.affected_activities?.value?.includes(activityId))
              && Array.isArray(values)
              && values.some((value) => !['none', 'unsure'].includes(value));
          },
          options: IMPACT_FREQUENCY_OPTIONS,
        },
      ];
    });
}
/** Invalidate activity-specific answers when a participant edits their routine. */
export function getActivityDependentAnswerIds(answers = {}, previousActivities = [], nextActivities = []) {
  const previous = [...new Set(Array.isArray(previousActivities) ? previousActivities : [])].sort();
  const next = [...new Set(Array.isArray(nextActivities) ? nextActivities : [])].sort();
  if (previous.length === next.length && previous.every((id, index) => id === next[index])) return [];
  return Object.keys(answers).filter((id) => id === 'affected_activities' || id.startsWith('activity_impact_'));
}


export function getVisibleQuestions(answers = {}, activities = []) {
  const visible = questions.filter((question) => !question.showIf || question.showIf(answers)).map((question) => ({ ...question, options: [...(question.options || [])] }));
  const primaryIndex = visible.findIndex((question) => question.id === 'primary_concern');
  if (primaryIndex >= 0) visible[primaryIndex] = { ...visible[primaryIndex], options: getReportedExperienceOptions(answers) };
  const mainContextIndex = visible.findIndex((question) => question.id === 'experience_context');
  if (mainContextIndex >= 0) {
    const experienceId = answers.primary_concern?.value;
    visible[mainContextIndex] = {
      ...visible[mainContextIndex],
      options: getExperienceContextOptions(experienceId, visible[mainContextIndex].options),
    };
  }
  const additionalIndex = visible.findIndex((question) => question.id === 'additional_concerns');
  if (additionalIndex >= 0) {
    const additionalOptions = getReportedExperienceOptions(answers).filter((item) => item.value !== answers.primary_concern?.value);
    visible[additionalIndex] = { ...visible[additionalIndex], options: [...additionalOptions, ...ADDITIONAL_CONCERN_EXCLUSIONS] };
  }
  const additionalExperienceQuestions = buildAdditionalExperienceQuestions(answers);
  if (additionalExperienceQuestions.length) {
    const anchorIndex = visible.findIndex((question) => question.id === 'which_eye');
    const fallbackIndex = visible.findIndex((question) => question.id === 'experience_frequency');
    const insertionIndex = (anchorIndex >= 0 ? anchorIndex : fallbackIndex) + 1;
    if (insertionIndex > 0) visible.splice(insertionIndex, 0, ...additionalExperienceQuestions);
  }
  const affected = Array.isArray(answers.affected_activities?.value) ? answers.affected_activities.value : [];
  const impactQuestions = buildActivityImpactQuestions(affected, answers).filter((question) => !question.showIf || question.showIf(answers));
  const noteIndex = visible.findIndex((question) => question.id === 'participant_note');
  if (noteIndex >= 0) visible.splice(noteIndex, 0, ...impactQuestions);
  else visible.push(...impactQuestions);

  return visible;
}

export function getNextQuestion(answers = {}, activities = []) {
  return getVisibleQuestions(answers, activities).find((question) => !isAnswerComplete(answers[question.id])) || null;
}

export function getProgress(answers = {}, activities = []) {
  const visible = getVisibleQuestions(answers, activities);
  const answered = visible.filter((question) => isAnswerComplete(answers[question.id])).length;
  return {
    answered,
    total: visible.length,
    fraction: visible.length ? answered / visible.length : 0,
  };
}

/**
 * Progress reports completed visible questions, not the position of the
 * question currently on screen. The count, percentage, bar and ARIA value
 * all use this same completed-answer total.
 */
export function getQuestionCompletionProgress(visibleQuestions = [], answers = {}) {
  const questions = Array.isArray(visibleQuestions) ? visibleQuestions : [];
  const total = questions.length;
  const completed = questions.filter((question) => isAnswerComplete(answers?.[question?.id])).length;
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}

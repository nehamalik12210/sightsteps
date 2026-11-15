/**
 * Scripted Ramesh persona for the guided demo.
 * Seven visible questions demonstrate symptom context and affected activities.
 * Additional seeded answers provide a consistent complete example report and are
 * explicitly identified as scripted demo context in the report.
 */

const rameshPersona = {
  name: 'Ramesh',
  nameHi: 'रमेश',
  age: 42,
  occupation: 'Tailor',
  occupationHi: 'दर्ज़ी',
  language: 'hi',
  activities: ['fine_detail', 'reading', 'screen_work'],
  primaryActivity: 'fine_detail',
  answers: {
    blurred_vision: { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } },
    blur_distance: { value: 'near', label: { en: 'Near objects', hi: 'पास की चीज़ें' } },
    headaches: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
    screen_hours: { value: 'moderate', label: { en: '2–6 hours', hi: '2–6 घंटे' } },
    close_work: { value: 'daily', label: { en: 'Daily, for hours', hi: 'रोज़, कई घंटे' } },
    eye_exam: { value: 'never', label: { en: 'Never', hi: 'कभी नहीं' } },
    existing_glasses: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
    age_group: { value: 'middle', label: { en: '40–55', hi: '40–55' } },
    night_vision: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
    squinting: { value: 'yes', label: { en: 'Yes, often', hi: 'हाँ, अक्सर' } },
    outdoor_time: { value: 'moderate', label: { en: 'A few hours', hi: 'कुछ घंटे' } },
    primary_concern: { value: 'blurred_vision', label: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' } },
    experience_onset: { value: 'recent_months', label: { en: 'Within the last few months', hi: 'पिछले कुछ महीनों में' } },
    experience_change: { value: 'varies', label: { en: 'It varies', hi: 'इसमें उतार-चढ़ाव होता है' } },
    experience_context: { value: ['near_tasks', 'screens'], label: { en: 'Reading or other near tasks, Using screens', hi: 'पढ़ना या पास के काम, स्क्रीन का उपयोग' } },
    experience_frequency: { value: 'daily', label: { en: 'Every day', hi: 'रोज़' } },
    which_eye: { value: 'both', label: { en: 'Both eyes', hi: 'दोनों आँखें' } },
    affected_activities: {
      value: ['fine_detail'],
      label: { en: 'Fine-detail work & crafts', hi: 'बारीक काम और दस्तकारी' },
    },
    activity_impact_fine_detail: {
      value: ['takes_longer', 'adjustments'],
      label: { en: 'It takes me longer than usual, I need to adjust distance, lighting or position', hi: 'इसमें सामान्य से अधिक समय लगता है, मुझे दूरी, रोशनी या स्थिति बदलनी पड़ती है' },
    },
    activity_impact_frequency_fine_detail: {
      value: 'often',
      label: { en: 'Often', hi: 'अक्सर' },
    },
  },
  demoQuestionIds: [
    'blurred_vision',
    'blur_distance',
    'headaches',
    'close_work',
    'affected_activities',
    'eye_exam',
    'age_group',
  ],
  ttsQuestionIds: ['blurred_vision', 'blur_distance'],
  skipVision: true,
};

export default rameshPersona;

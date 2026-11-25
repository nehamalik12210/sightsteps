/**
 * Scripted Ramesh persona for the guided demo.
 * Seven visible questions demonstrate symptom context and affected activities.
 * Additional seeded answers provide a consistent complete example report and are
 * explicitly identified as scripted demo context in the report.
 */


function localDateDaysAgo(days, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}
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
    additional_concerns: { value: ['night_vision'], label: { en: 'Difficulty in low light', hi: 'कम रोशनी में देखने में कठिनाई' } },
    additional_experience_night_vision_context: { value: ['driving'], label: { en: 'Driving or travelling', hi: 'ड्राइविंग या यात्रा' } },
    experience_onset: { value: 'recent_months', label: { en: 'Within the last few months', hi: 'पिछले कुछ महीनों में' } },
    experience_change: { value: 'more_noticeable', label: { en: 'Getting more noticeable', hi: 'अधिक ध्यान देने योग्य हो रहा है' } },
    experience_context: { value: ['near_tasks', 'screens', 'driving'], label: { en: 'Reading or other near tasks, Using screens, Driving or travelling', hi: 'पढ़ना या पास के काम, स्क्रीन का उपयोग, ड्राइविंग या यात्रा' } },
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
  timelineEntries: [
    {
      id: 'demo-ramesh-blur-1',
      date: localDateDaysAgo(6),
      time: '09:15',
      experienceId: 'blurred_vision',
      experienceLabel: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' },
      context: 'During detailed stitching work',
      impact: 'Needed to adjust working distance',
      createdAt: localDateDaysAgo(6) + 'T09:15:00.000Z',
      updatedAt: localDateDaysAgo(6) + 'T09:15:00.000Z',
    },
    {
      id: 'demo-ramesh-blur-2',
      date: localDateDaysAgo(2),
      time: '19:00',
      experienceId: 'blurred_vision',
      experienceLabel: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' },
      context: 'While using a phone after work',
      impact: 'Took a short break before continuing',
      createdAt: localDateDaysAgo(2) + 'T19:00:00.000Z',
      updatedAt: localDateDaysAgo(2) + 'T19:00:00.000Z',
    },
  ],
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

/**
 * i18n — Simple bilingual strings (en/hi)
 */

const strings = {
  // Landing page
  'landing.title': {
    en: 'SightSteps',
    hi: 'SightSteps',
  },
  'landing.tagline': {
    en: 'Smart vision support for every optical shop',
    hi: 'हर ऑप्टिकल शॉप के लिए स्मार्ट दृष्टि सहायता',
  },
  'landing.description': {
    en: 'Answer a few simple questions about your vision and daily habits. Get personalized lens recommendations and know when to see an eye care professional.',
    hi: 'अपनी दृष्टि और दैनिक आदतों के बारे में कुछ सवालों के जवाब दें। व्यक्तिगत लेंस सुझाव पाएं और जानें कब आँखों के डॉक्टर से मिलना चाहिए।',
  },
  'landing.start': {
    en: 'Start Assessment',
    hi: 'जाँच शुरू करें',
  },
  'landing.tryDemo': {
    en: 'Try Demo: Ramesh, 42, Tailor',
    hi: 'डेमो देखें: रमेश, 42, दर्ज़ी',
  },
  'landing.notMedical': {
    en: 'This is not a medical diagnosis tool.',
    hi: 'यह कोई चिकित्सा निदान उपकरण नहीं है।',
  },
  'landing.features.offline': {
    en: 'Works Offline',
    hi: 'ऑफ़लाइन काम करता है',
  },
  'landing.features.private': {
    en: 'Private & Local',
    hi: 'निजी और स्थानीय',
  },
  'landing.features.minutes': {
    en: '3 Minutes',
    hi: '3 मिनट',
  },

  // Onboarding
  'onboarding.chooseLanguage': {
    en: 'Choose your language',
    hi: 'अपनी भाषा चुनें',
  },
  'onboarding.consent.title': {
    en: 'Before we begin',
    hi: 'शुरू करने से पहले',
  },
  'onboarding.consent.text': {
    en: 'SightSteps helps suggest lens features based on your answers. It does not diagnose eye conditions or replace a professional eye exam. All data stays on this device.',
    hi: 'SightSteps आपके जवाबों के आधार पर लेंस सुविधाओं का सुझाव देता है। यह आँखों की बीमारियों का निदान नहीं करता और न ही पेशेवर जाँच की जगह लेता है। सारा डेटा इस डिवाइस पर रहता है।',
  },
  'onboarding.consent.agree': {
    en: 'I understand, continue',
    hi: 'मैं समझता/समझती हूँ, आगे बढ़ें',
  },

  // Intake
  'intake.title': {
    en: 'Vision Questions',
    hi: 'दृष्टि संबंधी सवाल',
  },
  'intake.questionOf': {
    en: 'Question {current} of {total}',
    hi: 'सवाल {current} / {total}',
  },

  // Vision Activity
  'vision.title': {
    en: 'Vision Activity',
    hi: 'दृष्टि गतिविधि',
  },
  'vision.skip': {
    en: 'Skip this step',
    hi: 'यह चरण छोड़ें',
  },

  // Report
  'report.title': {
    en: 'Your Vision Summary',
    hi: 'आपकी दृष्टि रिपोर्ट',
  },
  'report.seeWhy': {
    en: 'See why',
    hi: 'कारण देखें',
  },
  'report.recommendations': {
    en: 'Lens Recommendations',
    hi: 'लेंस सुझाव',
  },
  'report.urgency': {
    en: 'Professional Eye Exam',
    hi: 'पेशेवर आँखों की जाँच',
  },
  'report.urgency.high': {
    en: 'Recommended soon',
    hi: 'जल्द सलाह लें',
  },
  'report.urgency.medium': {
    en: 'Recommended within 6 months',
    hi: '6 महीने में सलाह लें',
  },
  'report.urgency.low': {
    en: 'Routine check-up',
    hi: 'नियमित जाँच',
  },
  'report.startNew': {
    en: 'Start New Assessment',
    hi: 'नई जाँच शुरू करें',
  },
  'report.visionSkipped': {
    en: 'Vision activity skipped — no awareness data available',
    hi: 'दृष्टि गतिविधि छोड़ी गई — कोई जागरूकता डेटा उपलब्ध नहीं',
  },

  // Demo mode
  'demo.banner': {
    en: 'Demo Mode — Ramesh, 42, Tailor',
    hi: 'डेमो मोड — रमेश, 42, दर्ज़ी',
  },
  'demo.next': {
    en: 'Next →',
    hi: 'अगला →',
  },

  // Common
  'common.back': {
    en: 'Back',
    hi: 'वापस',
  },
  'common.continue': {
    en: 'Continue',
    hi: 'आगे बढ़ें',
  },
  'common.loading': {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
  },
};

/**
 * Get a translated string.
 * Supports {placeholder} interpolation.
 */
export function t(key, lang = 'en', params = {}) {
  const entry = strings[key];
  if (!entry) return key;

  let text = entry[lang] || entry.en || key;

  // Replace {placeholders}
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });

  return text;
}

export default strings;


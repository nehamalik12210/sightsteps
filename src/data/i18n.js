/** Small bilingual dictionary for the English and Hindi user interfaces. */

const strings = {
  'landing.title': {
    en: 'SightSteps',
    hi: 'SightSteps',
  },

  'landing.tagline': {
    en: 'Accessible vision-support conversations for optical shops',
    hi: 'ऑप्टिकल शॉप के लिए आसान दृष्टि-सहायता बातचीत',
  },

  'landing.description': {
    en: 'Answer a few questions about your vision experiences and daily habits. Review a plain-language summary and topics you may wish to discuss with an eye-care professional.',
    hi: 'अपने दृष्टि अनुभव और दैनिक आदतों के बारे में कुछ सवालों के जवाब दें। आसान भाषा में सारांश और नेत्र-देखभाल पेशेवर से चर्चा के विषय देखें।',
  },

  'landing.start': {
    en: 'Start Assessment',
    hi: 'शुरू करें',
  },

  'landing.tryDemo': {
    en: 'Try Demo: Ramesh, 42, Tailor',
    hi: 'डेमो देखें: रमेश, 42, दर्ज़ी',
  },

  'landing.notMedical': {
    en: 'This is not a medical diagnosis or vision test.',
    hi: 'यह चिकित्सा निदान या दृष्टि परीक्षण नहीं है।',
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

  'onboarding.chooseLanguage': {
    en: 'Choose your language',
    hi: 'अपनी भाषा चुनें',
  },

  'onboarding.consent.title': {
    en: 'Before we begin',
    hi: 'शुरू करने से पहले',
  },

  'onboarding.consent.text': {
    en: 'SightSteps organizes the experiences and habits you report into discussion points. It does not diagnose eye conditions, determine a prescription, or replace a professional eye examination. Session data is stored locally on this device.',
    hi: 'SightSteps आपके बताए अनुभवों और आदतों को चर्चा के विषयों में व्यवस्थित करता है। यह आँखों की बीमारी का निदान, चश्मे का नंबर निर्धारित या पेशेवर जाँच का विकल्प नहीं है। सेशन डेटा इसी डिवाइस पर सेव होता है।',
  },

  'onboarding.consent.agree': {
    en: 'I understand, continue',
    hi: 'मैं समझता/समझती हूँ, आगे बढ़ें',
  },

  'intake.title': {
    en: 'Vision Questions',
    hi: 'दृष्टि संबंधी सवाल',
  },

  'intake.questionOf': {
    en: 'Question {current} of {total}',
    hi: 'सवाल {current} / {total}',
  },

  'vision.title': {
    en: 'Vision Awareness Activity',
    hi: 'दृष्टि जागरूकता गतिविधि',
  },

  'vision.skip': {
    en: 'Skip this activity',
    hi: 'यह गतिविधि छोड़ें',
  },

  'report.title': {
    en: 'Your Vision Insights',
    hi: 'आपकी दृष्टि संबंधी जानकारी',
  },

  'report.seeWhy': {
    en: 'See why',
    hi: 'कारण देखें',
  },

  'report.recommendations': {
    en: 'Topics to Discuss',
    hi: 'चर्चा के विषय',
  },

  'report.urgency': {
    en: 'Professional Eye-care Follow-up',
    hi: 'नेत्र-देखभाल फॉलो-अप',
  },

  'report.urgency.high': {
    en: 'Discuss promptly with an eye-care professional',
    hi: 'नेत्र-देखभाल पेशेवर से जल्द चर्चा करें',
  },

  'report.urgency.medium': {
    en: 'Consider arranging an eye examination',
    hi: 'आँखों की जाँच कराने पर विचार करें',
  },

  'report.urgency.low': {
    en: 'Routine eye-care follow-up',
    hi: 'नियमित नेत्र-देखभाल फॉलो-अप',
  },

  'report.startNew': {
    en: 'Start New Assessment',
    hi: 'नई शुरुआत करें',
  },

  'report.visionSkipped': {
    en: 'Optional direction activity skipped — no activity responses recorded.',
    hi: 'वैकल्पिक दिशा गतिविधि छोड़ी गई — कोई गतिविधि उत्तर दर्ज नहीं हुआ।',
  },

  'demo.banner': {
    en: 'Demo Mode — Ramesh, 42, Tailor',
    hi: 'डेमो मोड — रमेश, 42, दर्ज़ी',
  },

  'demo.next': {
    en: 'Next',
    hi: 'अगला',
  },

  'common.back': {
    en: 'Back',
    hi: 'वापस',
  },

  'common.continue': {
    en: 'Continue',
    hi: 'आगे बढ़ें',
  },

  'common.loading': {
    en: 'Loading…',
    hi: 'लोड हो रहा है…',
  },
};

/** Return a translated string and replace any {placeholder} values. */
export function t(key, lang = 'en', params = {}) {
  const entry = strings[key];
  if (!entry) return key;

  let translated = entry[lang] || entry.en || key;

  Object.entries(params).forEach(([placeholder, value]) => {
    translated = translated.replaceAll(
      `{${placeholder}}`,
      String(value),
    );
  });

  return translated;
}

export default strings;
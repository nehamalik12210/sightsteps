/** Small bilingual dictionary for the English and Hindi user interfaces. */

const strings = {
  'landing.title': { en: 'SightSteps', hi: 'SightSteps' },
  'landing.tagline': { en: 'A clearer conversation starts here.', hi: 'एक स्पष्ट बातचीत यहाँ से शुरू होती है।' },
  'landing.description': {
    en: 'Organise your everyday vision experiences and prepare for a conversation with an eye-care professional.',
    hi: 'अपने रोज़मर्रा के दृष्टि अनुभवों को व्यवस्थित करें और नेत्र-देखभाल पेशेवर से बातचीत की तैयारी करें।',
  },
  'landing.start': { en: 'Start your journey', hi: 'अपनी यात्रा शुरू करें' },
  'landing.tryDemo': { en: "Explore Ramesh's demo", hi: 'रमेश का डेमो देखें' },
  'landing.trust.bilingual': { en: 'English & Hindi', hi: 'अंग्रेज़ी और हिंदी' },
  'landing.trust.local': { en: 'Local session storage', hi: 'स्थानीय सेशन स्टोरेज' },
  'landing.trust.accessible': { en: 'Accessible experience', hi: 'सुलभ अनुभव' },
  'landing.notMedical': { en: 'This is not a medical diagnosis or vision test.', hi: 'यह चिकित्सा निदान या दृष्टि परीक्षण नहीं है।' },
  'landing.features.offline': { en: 'Works Offline', hi: 'ऑफ़लाइन काम करता है' },
  'landing.features.private': { en: 'Private & Local', hi: 'निजी और स्थानीय' },
  'landing.features.minutes': { en: '3 Minutes', hi: '3 मिनट' },

  'onboarding.chooseLanguage': { en: 'Choose your language', hi: 'अपनी भाषा चुनें' },
  'onboarding.consent.title': { en: 'Before we begin', hi: 'शुरू करने से पहले' },
  'onboarding.consent.text': {
    en: 'SightSteps organises the experiences and habits you report into discussion points. It does not diagnose eye conditions, determine a prescription or replace a professional eye examination. Session data is saved in this device’s browser when browser storage is available.',
    hi: 'SightSteps आपके बताए अनुभवों और आदतों को चर्चा के विषयों में व्यवस्थित करता है। यह आँखों की बीमारी का निदान, चश्मे का नंबर निर्धारित या पेशेवर जाँच का विकल्प नहीं है। ब्राउज़र स्टोरेज उपलब्ध होने पर सेशन डेटा इसी डिवाइस में सहेजा जाता है।',
  },
  'onboarding.consent.agree': { en: 'I understand, continue', hi: 'मैं समझता/समझती हूँ, आगे बढ़ें' },

  'activities.title': { en: 'Daily Activities', hi: 'दैनिक गतिविधियाँ' },
  'activities.heading': { en: 'Your everyday visual activities', hi: 'आपकी रोज़मर्रा की गतिविधियाँ' },
  'activities.description': { en: 'What activities are part of your daily routine? Select one or more.', hi: 'आपकी दिनचर्या का हिस्सा कौन-कौन सी गतिविधियाँ हैं? एक या अधिक चुनें।' },
  'activities.primaryHeading': { en: 'Which activity takes up most of your day?', hi: 'सबसे ज़्यादा समय किसमें लगता है?' },
  'activities.primaryDescription': { en: 'Choose one from the activities you selected.', hi: 'अपनी चुनी हुई गतिविधियों में से एक चुनें।' },

  'intake.title': { en: 'Vision Questions', hi: 'दृष्टि संबंधी सवाल' },
  'intake.questionOf': { en: 'Question {current} of {total}', hi: 'सवाल {current} / {total}' },
  'intake.note.placeholder': { en: 'Type here (optional)...', hi: 'यहाँ लिखें (वैकल्पिक)...' },
  'intake.note.skip': { en: 'Skip', hi: 'छोड़ें' },
  'intake.note.save': { en: 'Save', hi: 'सहेजें' },

  'vision.title': { en: 'Vision Awareness Activity', hi: 'दृष्टि जागरूकता गतिविधि' },
  'vision.skip': { en: 'Skip this activity', hi: 'यह गतिविधि छोड़ें' },

  'amsler.title': { en: 'Amsler Grid Home Screening', hi: 'एम्सलर ग्रिड होम स्क्रीनिंग' },
  'amsler.skip': { en: 'Skip this screening', hi: 'यह स्क्रीनिंग छोड़ें' },

  'patterns.title': { en: 'Patterns Worth Discussing', hi: 'चर्चा के लिए अनुमानित पैटर्न' },
  'patterns.subtitle': { en: 'These patterns are inferred from combinations of your responses. They surface observations you may not have stated directly — framed as discussion points, never conclusions.', hi: 'ये पैटर्न आपके जवाबों के संयोजन से अनुमानित हैं। ये ऐसे अवलोकन सामने लाते हैं जो आपने सीधे नहीं बताए होंगे — चर्चा बिंदुओं के रूप में, कभी निष्कर्ष नहीं।' },
  'patterns.whySuggesting': { en: 'Why we are suggesting this', hi: 'हम यह क्यों सुझा रहे हैं' },
  'patterns.noneMatched.title': { en: 'What our pattern engine looks for', hi: 'हमारा पैटर्न इंजन क्या देखता है' },
  'patterns.noneMatched.subtitle': { en: 'Your responses did not trigger any inferred patterns — which is a good sign. Here is what the engine checks for, so you know the kinds of combinations it evaluates:', hi: 'आपके जवाबों से कोई अनुमानित पैटर्न नहीं मिला — जो एक अच्छा संकेत है। यहाँ बताया गया है कि इंजन किन संयोजनों की जाँच करता है:' },

  'clinicianBrief.title': { en: 'Clinician Brief', hi: 'क्लिनिशियन सारांश' },
  'clinicianBrief.open': { en: 'View clinician brief', hi: 'क्लिनिशियन सारांश देखें' },

  'disclaimer.full': { en: 'SightSteps is not a diagnostic tool. The observations, patterns and screening results below are participant-reported and are intended only to support a conversation with an eye-care professional.', hi: 'SightSteps एक निदान उपकरण नहीं है। नीचे दिए गए अवलोकन, पैटर्न और स्क्रीनिंग परिणाम प्रतिभागी द्वारा बताए गए हैं और केवल नेत्र देखभाल पेशेवर के साथ बातचीत को सहायता देने के लिए हैं।' },

  'report.title': { en: 'Your Vision Insights', hi: 'आपकी दृष्टि संबंधी जानकारी' },
  'report.seeWhy': { en: 'See why', hi: 'कारण देखें' },
  'report.recommendations': { en: 'Topics to Discuss', hi: 'चर्चा के विषय' },
  // Retained for compatibility with older saved UI references; the current report does not use urgency labels.
  'report.urgency': { en: 'Professional Eye-care Follow-up', hi: 'नेत्र-देखभाल फॉलो-अप' },
  'report.urgency.high': { en: 'Discuss promptly with an eye-care professional', hi: 'नेत्र-देखभाल पेशेवर से जल्द चर्चा करें' },
  'report.urgency.medium': { en: 'Consider arranging an eye examination', hi: 'आँखों की जाँच कराने पर विचार करें' },
  'report.urgency.low': { en: 'Routine eye-care follow-up', hi: 'नियमित नेत्र-देखभाल फॉलो-अप' },
  'report.startNew': { en: 'Start New Assessment', hi: 'नई शुरुआत करें' },
  'report.visionSkipped': { en: 'Optional direction activity skipped — no activity responses recorded.', hi: 'वैकल्पिक दिशा गतिविधि छोड़ दी गई — कोई गतिविधि उत्तर दर्ज नहीं हुआ।' },
  'report.printBrief': { en: 'Prepare my conversation brief', hi: 'मेरा वार्तालाप सारांश तैयार करें' },
  'report.clearData': { en: 'Clear my data', hi: 'मेरा डेटा हटाएँ' },
  'report.deleteConfirm': { en: 'Are you sure you want to delete all saved session data? This action cannot be undone.', hi: 'क्या आप वाकई अपना सारा सेशन डेटा हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।' },
  'report.privacy.title': { en: 'Your data stays on this device', hi: 'आपकी जानकारी इसी डिवाइस पर रहती है' },
  'report.privacy.text': {
    en: 'Responses are saved in this device’s browser when local storage is available. Your answers are not sent to an application server.',
    hi: 'स्थानीय स्टोरेज उपलब्ध होने पर जवाब इसी डिवाइस के ब्राउज़र में सहेजे जाते हैं। आपके जवाब किसी ऐप सर्वर पर नहीं भेजे जाते।',
  },

  'demo.banner': { en: 'Demo Mode — Ramesh, 42, Tailor', hi: 'डेमो मोड — रमेश, 42, दर्ज़ी' },
  'demo.next': { en: 'Next', hi: 'अगला' },
  'common.back': { en: 'Back', hi: 'वापस' },
  'common.continue': { en: 'Continue', hi: 'आगे बढ़ें' },
  'common.loading': { en: 'Loading…', hi: 'लोड हो रहा है…' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.yesDelete': { en: 'Yes, delete', hi: 'हाँ, हटाएँ' },

  'amsler.spatial.title': { en: 'Spatial Analysis', hi: 'स्थानिक विश्लेषण' },
  'amsler.spatial.subtitle': {
    en: 'Where you flagged regions on the grid',
    hi: 'आपने ग्रिड पर कहाँ क्षेत्र चिह्नित किए',
  },
  'amsler.spatial.disclaimer': {
    en: 'This shows where you flagged regions on the grid — not a map of your retina.',
    hi: 'यह दर्शाता है कि आपने ग्रिड पर कहाँ क्षेत्र चिह्नित किए — यह आपकी रेटिना का मानचित्र नहीं है।',
  },
  'amsler.spatial.noFlags': {
    en: 'No regions flagged.',
    hi: 'कोई क्षेत्र चिह्नित नहीं किया गया।',
  },
  'amsler.spatial.centralZone': {
    en: 'central zone',
    hi: 'केंद्रीय ज़ोन',
  },
};

/** Return a translated string and replace any {placeholder} values. */
export function t(key, lang = 'en', params = {}) {
  const entry = strings[key];
  if (!entry) return key;

  let translated = entry[lang] || entry.en || key;
  Object.entries(params).forEach(([placeholder, value]) => {
    translated = translated.replaceAll(`{${placeholder}}`, String(value));
  });
  return translated;
}

export default strings;

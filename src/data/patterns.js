/**
 * SightSteps — Clinically-defensible pattern definitions.
 *
 * Each pattern fires only when a specific combination of participant-reported
 * answers is present. The app then infers something the participant did not
 * explicitly state, surfacing it as a discussion prompt — never a conclusion.
 *
 * Every description uses non-diagnostic language:
 *   ✅ "Your responses suggest…" / "Worth discussing"
 *   ❌ "You have…" / "You suffer from…" / "Diagnosis"
 */

const EXPERIENCE_ANSWER_VALUES = {
  blurred_vision: ['yes', 'sometimes'],
  headaches: ['often', 'sometimes'],
  squinting: ['yes', 'sometimes'],
  night_vision: ['yes', 'sometimes'],
};

function hasReportedExperience(answers, experienceId) {
  return (EXPERIENCE_ANSWER_VALUES[experienceId] || [])
    .includes(answers?.[experienceId]?.value);
}

function getExperienceContext(answers, experienceId) {
  if (answers?.primary_concern?.value === experienceId) {
    return Array.isArray(answers?.experience_context?.value)
      ? answers.experience_context.value
      : [];
  }
  const selectedAdditional = Array.isArray(answers?.additional_concerns?.value)
    && answers.additional_concerns.value.includes(experienceId);
  if (selectedAdditional && hasReportedExperience(answers, experienceId)) {
    const value = answers?.[`additional_experience_${experienceId}_context`]?.value;
    return Array.isArray(value) ? value : [];
  }
  return [];
}

function getExperienceContextSourceKeys(answers, experienceId) {
  if (answers?.primary_concern?.value === experienceId) {
    return ['primary_concern', 'experience_context'];
  }
  const selectedAdditional = Array.isArray(answers?.additional_concerns?.value)
    && answers.additional_concerns.value.includes(experienceId);
  return selectedAdditional && hasReportedExperience(answers, experienceId)
    ? ['additional_concerns', `additional_experience_${experienceId}_context`]
    : [];
}

const patterns = [
  {
    id: 'screen-strain',
    title: {
      en: 'Screen use, distance blur and examination history',
      hi: 'स्क्रीन उपयोग, दूर का धुंधलापन और जाँच का इतिहास',
    },
    description: {
      en: 'Your responses suggest a combination of heavy screen use, blurred distance vision and infrequent eye examinations. These factors together may be worth discussing with an eye-care professional to determine whether your current vision needs have been assessed recently.',
      hi: 'आपके जवाब स्क्रीन के अधिक उपयोग, दूर की धुंधली दृष्टि और आँखों की जाँच में लंबे अंतराल का संयोजन सुझाते हैं। इन कारकों पर नेत्र देखभाल पेशेवर से चर्चा करना उचित हो सकता है।',
    },
    discussionPrompt: {
      en: 'You may want to ask your eye-care professional whether your screen-work viewing distance and current vision correction (if any) have been evaluated recently.',
      hi: 'आप नेत्र देखभाल पेशेवर से पूछना चाह सकते हैं कि क्या आपकी स्क्रीन-कार्य दूरी और वर्तमान दृष्टि सुधार (यदि कोई हो) का हाल ही में मूल्यांकन किया गया है।',
    },
    icon: 'devices',
    triggers: (answers) => {
      const screenHigh = ['moderate', 'high'].includes(answers.screen_hours?.value);
      const blurReported = hasReportedExperience(answers, 'blurred_vision');
      const blurFar = ['far', 'both'].includes(answers.blur_distance?.value);
      const noRecentExam = ['old', 'very_old', 'never'].includes(answers.eye_exam?.value);
      return screenHigh && blurReported && blurFar && noRecentExam;
    },
    sourceKeys: ['screen_hours', 'blurred_vision', 'blur_distance', 'eye_exam'],
  },
  {
    id: 'night-vision',
    title: {
      en: 'Night-vision difficulty and driving context',
      hi: 'रात में देखने की कठिनाई और ड्राइविंग का संदर्भ',
    },
    description: {
      en: 'You reported difficulty seeing at night or in low light and selected night vision as the main experience you want to discuss. You also selected driving or travelling as a situation or activity where you notice this experience. These details can be discussed with an eye-care professional; they do not identify a cause.',
      hi: 'आपके जवाब कम रोशनी में देखने में कठिनाई, ड्राइविंग जैसी गतिविधियों और उस आयु वर्ग का संयोजन सुझाते हैं जहाँ रात की दृष्टि में बदलाव अधिक बताए जाते हैं। यह संयोजन नेत्र देखभाल पेशेवर से चर्चा के लायक हो सकता है।',
    },
    discussionPrompt: {
      en: 'You may want to describe your low-light experiences to an eye-care professional and ask whether any further assessment is appropriate for your age group.',
      hi: 'आप नेत्र देखभाल पेशेवर को अपनी कम रोशनी के अनुभवों के बारे में बताना और अपनी आयु वर्ग के लिए किसी अतिरिक्त जाँच की उपयुक्तता पूछना चाह सकते हैं।',
    },
    icon: 'dark_mode',
    triggers: (answers) => {
      const nightIssue = hasReportedExperience(answers, 'night_vision');
      const isMainExperience = answers.primary_concern?.value === 'night_vision';
      const olderAge = ['middle', 'senior'].includes(answers.age_group?.value);
      const contexts = getExperienceContext(answers, 'night_vision');
      const affectedActivities = Array.isArray(answers.affected_activities?.value)
        ? answers.affected_activities.value
        : [];
      // Activity impact is asked about the main experience only.
      const hasDrivingContext = isMainExperience
        && (contexts.includes('driving') || affectedActivities.includes('driving'));
      return nightIssue && isMainExperience && olderAge && hasDrivingContext;
    },
    sourceKeys: ['night_vision', 'primary_concern', 'age_group', 'experience_context', 'affected_activities'],
  },
  {
    id: 'close-work-headache',
    title: {
      en: 'Headaches, close-up work and squinting reported together',
      hi: 'सिरदर्द, पास का काम और आँखें सिकोड़ने का साथ में बताया जाना',
    },
    description: {
      en: 'You reported headaches, extended periods of close-up work and squinting. These are separate reported experiences and habits; their combination does not establish that one causes another. You can describe each to an eye-care professional.',
      hi: 'आपके जवाब दृष्टि गतिविधियों के दौरान सिरदर्द, नियमित पास का काम और आँखें सिकोड़ने का संयोजन सुझाते हैं। ये मिलकर अनसुधारित अपवर्तन दोष या समंजन तनाव की ओर इशारा कर सकते हैं — नेत्र देखभाल पेशेवर से चर्चा के योग्य।',
    },
    discussionPrompt: {
      en: 'You may want to ask whether a refraction check would be appropriate, given your reported headaches and close-work habits.',
      hi: 'आप पूछना चाह सकते हैं कि क्या आपके बताए गए सिरदर्द और पास के काम की आदतों को देखते हुए एक अपवर्तन जाँच उचित होगी।',
    },
    icon: 'neurology',
    triggers: (answers) => {
      const headaches = ['often', 'sometimes'].includes(answers.headaches?.value);
      const closeWork = answers.close_work?.value === 'daily';
      const squinting = ['yes', 'sometimes'].includes(answers.squinting?.value);
      return headaches && closeWork && squinting;
    },
    sourceKeys: ['headaches', 'close_work', 'squinting'],
  },
  {
    id: 'asymmetry',
    title: {
      en: 'Asymmetric symptoms',
      hi: 'असमान लक्षण',
    },
    description: {
      en: 'Your responses suggest that the main experience you reported is primarily noticed in one eye and was first noticed recently. Single-eye symptoms with recent onset may be worth raising soon with an eye-care professional.',
      hi: 'आपके जवाब सुझाते हैं कि आपका मुख्य बताया गया अनुभव मुख्य रूप से एक आँख में महसूस होता है और हाल ही में पहली बार देखा गया। एक आँख के लक्षण जो हाल ही में शुरू हुए हैं, नेत्र देखभाल पेशेवर से जल्द चर्चा करने योग्य हो सकते हैं।',
    },
    discussionPrompt: {
      en: 'You may want to mention to your eye-care professional that the experience is primarily in one eye and when you first noticed it.',
      hi: 'आप नेत्र देखभाल पेशेवर को बताना चाह सकते हैं कि अनुभव मुख्य रूप से एक आँख में है और आपने इसे पहली बार कब महसूस किया।',
    },
    icon: 'visibility',
    triggers: (answers) => {
      const oneEye = ['left', 'right'].includes(answers.which_eye?.value);
      const recentOnset = ['recent_weeks', 'recent_months'].includes(answers.experience_onset?.value);
      return oneEye && recentOnset;
    },
    sourceKeys: ['which_eye', 'experience_onset'],
  },
  {
    id: 'presbyopia',
    title: {
      en: 'Near-vision changes reported with age and over time',
      hi: 'आयु और समय के साथ बताए गए निकट-दृष्टि बदलाव',
    },
    description: {
      en: 'You reported near-vision blur, selected an age group and said the experience has become more noticeable. These responses describe your experience over time; they do not establish an age-related eye condition.',
      hi: 'आपके जवाब पास की वस्तुओं में कठिनाई, उस आयु वर्ग जहाँ प्रेसबायोपिया (उम्र-संबंधी निकट-दृष्टि परिवर्तन) आमतौर पर बताया जाता है, और समय के साथ बिगड़ने की प्रवृत्ति का संयोजन सुझाते हैं। नेत्र देखभाल पेशेवर से चर्चा करना उचित हो सकता है।',
    },
    discussionPrompt: {
      en: 'You may want to ask about near-vision correction options suitable for your daily activities and working distances.',
      hi: 'आप अपनी दैनिक गतिविधियों और काम की दूरी के लिए उपयुक्त निकट-दृष्टि सुधार विकल्पों के बारे में पूछना चाह सकते हैं।',
    },
    icon: 'menu_book',
    triggers: (answers) => {
      const blurIsMainExperience = answers.primary_concern?.value === 'blurred_vision';
      const blurReported = hasReportedExperience(answers, 'blurred_vision');
      const nearBlur = ['near', 'both'].includes(answers.blur_distance?.value);
      const olderAge = ['middle', 'senior'].includes(answers.age_group?.value);
      const worsening = answers.experience_change?.value === 'more_noticeable';
      return blurIsMainExperience && blurReported && nearBlur && olderAge && worsening;
    },
    sourceKeys: ['primary_concern', 'blurred_vision', 'blur_distance', 'age_group', 'experience_change'],
  },
  {
    id: 'digital-eye-strain',
    title: {
      en: 'Frequent screen use and headaches during screen use',
      hi: 'स्क्रीन उपयोग के दौरान सिरदर्द और अधिक स्क्रीन समय',
    },
    description: {
      en: 'You reported more than six hours of screen use per day and headaches that you also selected as occurring during screen use. These responses do not establish a cause, but the combination may be useful to discuss with an eye-care professional.',
      hi: 'आपके जवाब स्क्रीन के बार-बार उपयोग और दृष्टि गतिविधियों के दौरान सिरदर्द का संयोजन सुझाते हैं। यह संयोजन आमतौर पर डिजिटल आँखों के तनाव से जुड़ा होता है और नेत्र देखभाल पेशेवर से चर्चा के योग्य हो सकता है।',
    },
    discussionPrompt: {
      en: 'You may want to describe your screen setup, viewing distance and break habits to your eye-care professional and ask whether any adjustment or correction could help.',
      hi: 'आप अपने स्क्रीन सेटअप, देखने की दूरी और ब्रेक की आदतों के बारे में नेत्र देखभाल पेशेवर को बताना और पूछना चाह सकते हैं कि क्या कोई समायोजन या सुधार सहायक हो सकता है।',
    },
    icon: 'monitor_heart',
    triggers: (answers) => {
      const highScreen = answers.screen_hours?.value === 'high';
      const headaches = hasReportedExperience(answers, 'headaches');
      const headacheContexts = getExperienceContext(answers, 'headaches');
      return highScreen && headaches && headacheContexts.includes('screens');
    },
    sourceKeys: (answers) => [
      'screen_hours',
      'headaches',
      ...getExperienceContextSourceKeys(answers, 'headaches'),
    ],
  },
  {
    id: 'low-light-contrast',
    title: {
      en: 'Co-reported low-light difficulty and squinting',
      hi: 'कम रोशनी में कठिनाई और आँखें सिकोड़ने की दोनों रिपोर्ट',
    },
    description: {
      en: 'You reported difficulty seeing at night or in low light, and separately reported squinting to see clearly. The questionnaire does not establish that squinting occurs in low light or that the experiences share a cause. You can describe both experiences to an eye-care professional.',
      hi: 'आपने कम रोशनी की स्थितियों में देखने में कठिनाई और उन स्थितियों में आँखें सिकोड़ने की बात बताई। इन अनुभवों के बारे में नेत्र-देखभाल पेशेवर को बताएँ; ये अपने आप किसी कारण की पहचान नहीं करते।',
    },
    discussionPrompt: {
      en: 'You may want to describe when the low-light difficulty and squinting occur, and ask what kind of eye examination is appropriate.',
      hi: 'आप बता सकते हैं कि कम रोशनी में कठिनाई और आँखें सिकोड़ना कब होता है, और पूछ सकते हैं कि कौन-सी नेत्र जाँच उपयुक्त होगी।',
    },
    icon: 'contrast',
    triggers: (answers) => {
      const nightIssue = hasReportedExperience(answers, 'night_vision');
      const squinting = hasReportedExperience(answers, 'squinting');
      return nightIssue && squinting;
    },
    sourceKeys: ['night_vision', 'squinting'],
  },
  {
    id: 'overdue-exam',
    title: {
      en: 'Extended period without professional examination',
      hi: 'पेशेवर जाँच के बिना लंबी अवधि',
    },
    description: {
      en: 'You reported that your last professional eye examination was more than three years ago or that you have never had one, alongside two or more reported vision experiences. You can ask an eye-care professional whether an examination is appropriate for you.',
      hi: 'आपके जवाब सुझाते हैं कि आपने हाल ही में पेशेवर आँखों की जाँच नहीं करवाई है, साथ ही एक या अधिक दृष्टि-संबंधी अनुभव भी बताए हैं। नियमित जाँच शुरुआती बदलावों का पता लगाने में मदद कर सकती है।',
    },
    discussionPrompt: {
      en: 'You may want to ask an eye-care professional about scheduling a comprehensive eye examination.',
      hi: 'आप नेत्र देखभाल पेशेवर से एक व्यापक आँखों की जाँच शेड्यूल करने के बारे में पूछना चाह सकते हैं।',
    },
    icon: 'event_upcoming',
    triggers: (answers) => {
      const noRecentExam = ['very_old', 'never'].includes(answers.eye_exam?.value);
      const hasBlur = ['yes', 'sometimes'].includes(answers.blurred_vision?.value);
      const hasSquinting = ['yes', 'sometimes'].includes(answers.squinting?.value);
      const hasNight = ['yes', 'sometimes'].includes(answers.night_vision?.value);
      const hasHeadaches = ['often', 'sometimes'].includes(answers.headaches?.value);
      const experienceCount = [hasBlur, hasSquinting, hasNight, hasHeadaches].filter(Boolean).length;
      return noRecentExam && experienceCount >= 2;
    },
    sourceKeys: ['eye_exam', 'blurred_vision', 'squinting', 'night_vision', 'headaches'],
  },
];

export default patterns;

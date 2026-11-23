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

const patterns = [
  {
    id: 'screen-strain',
    title: {
      en: 'Screen-related strain vs. uncorrected refractive error',
      hi: 'स्क्रीन से जुड़ा तनाव बनाम अनसुधारित अपवर्तन दोष',
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
      const blurFar = ['far', 'both'].includes(answers.blur_distance?.value);
      const noRecentExam = ['old', 'very_old', 'never'].includes(answers.eye_exam?.value);
      return screenHigh && blurFar && noRecentExam;
    },
    sourceKeys: ['screen_hours', 'blur_distance', 'eye_exam'],
  },
  {
    id: 'night-vision',
    title: {
      en: 'Night vision changes',
      hi: 'रात की दृष्टि में बदलाव',
    },
    description: {
      en: 'Your responses suggest difficulty seeing in low light, combined with activities such as driving and an age group where night-vision changes are more commonly reported. This combination may be worth raising with an eye-care professional.',
      hi: 'आपके जवाब कम रोशनी में देखने में कठिनाई, ड्राइविंग जैसी गतिविधियों और उस आयु वर्ग का संयोजन सुझाते हैं जहाँ रात की दृष्टि में बदलाव अधिक बताए जाते हैं। यह संयोजन नेत्र देखभाल पेशेवर से चर्चा के लायक हो सकता है।',
    },
    discussionPrompt: {
      en: 'You may want to describe your low-light experiences to an eye-care professional and ask whether any further assessment is appropriate for your age group.',
      hi: 'आप नेत्र देखभाल पेशेवर को अपनी कम रोशनी के अनुभवों के बारे में बताना और अपनी आयु वर्ग के लिए किसी अतिरिक्त जाँच की उपयुक्तता पूछना चाह सकते हैं।',
    },
    icon: 'dark_mode',
    triggers: (answers) => {
      const nightIssue = ['yes', 'sometimes'].includes(answers.night_vision?.value);
      const olderAge = ['middle', 'senior'].includes(answers.age_group?.value);
      // Driving context from affected activities or primary activity
      const affectedActivities = Array.isArray(answers.affected_activities?.value) ? answers.affected_activities.value : [];
      const hasDriving = affectedActivities.includes('driving');
      const contextValues = Array.isArray(answers.experience_context?.value) ? answers.experience_context.value : [];
      const hasLowLightContext = contextValues.includes('low_light') || contextValues.includes('driving');
      return nightIssue && olderAge && (hasDriving || hasLowLightContext);
    },
    sourceKeys: ['night_vision', 'age_group', 'affected_activities', 'experience_context'],
  },
  {
    id: 'close-work-headache',
    title: {
      en: 'Uncorrected refractive error or accommodative strain',
      hi: 'अनसुधारित अपवर्तन दोष या समंजन तनाव',
    },
    description: {
      en: 'Your responses suggest a combination of headaches around visual activities, frequent close-up work and squinting. Together, these may point toward uncorrected refractive error or accommodative strain — worth discussing with an eye-care professional.',
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
      en: 'Presbyopia-related changes',
      hi: 'प्रेसबायोपिया-संबंधी बदलाव',
    },
    description: {
      en: 'Your responses suggest difficulty with near objects, combined with an age group where presbyopia (age-related near-vision changes) is commonly reported, and a worsening trend over time. These together may be worth discussing with an eye-care professional.',
      hi: 'आपके जवाब पास की वस्तुओं में कठिनाई, उस आयु वर्ग जहाँ प्रेसबायोपिया (उम्र-संबंधी निकट-दृष्टि परिवर्तन) आमतौर पर बताया जाता है, और समय के साथ बिगड़ने की प्रवृत्ति का संयोजन सुझाते हैं। नेत्र देखभाल पेशेवर से चर्चा करना उचित हो सकता है।',
    },
    discussionPrompt: {
      en: 'You may want to ask about near-vision correction options suitable for your daily activities and working distances.',
      hi: 'आप अपनी दैनिक गतिविधियों और काम की दूरी के लिए उपयुक्त निकट-दृष्टि सुधार विकल्पों के बारे में पूछना चाह सकते हैं।',
    },
    icon: 'menu_book',
    triggers: (answers) => {
      const nearBlur = ['near', 'both'].includes(answers.blur_distance?.value);
      const olderAge = ['middle', 'senior'].includes(answers.age_group?.value);
      const worsening = answers.experience_change?.value === 'more_noticeable';
      return nearBlur && olderAge && worsening;
    },
    sourceKeys: ['blur_distance', 'age_group', 'experience_change'],
  },
  {
    id: 'digital-eye-strain',
    title: {
      en: 'Digital eye strain',
      hi: 'डिजिटल आँखों का तनाव',
    },
    description: {
      en: 'Your responses suggest frequent screen use combined with headaches around visual activities. This combination is commonly associated with digital eye strain and may be worth discussing with an eye-care professional.',
      hi: 'आपके जवाब स्क्रीन के बार-बार उपयोग और दृष्टि गतिविधियों के दौरान सिरदर्द का संयोजन सुझाते हैं। यह संयोजन आमतौर पर डिजिटल आँखों के तनाव से जुड़ा होता है और नेत्र देखभाल पेशेवर से चर्चा के योग्य हो सकता है।',
    },
    discussionPrompt: {
      en: 'You may want to describe your screen setup, viewing distance and break habits to your eye-care professional and ask whether any adjustment or correction could help.',
      hi: 'आप अपने स्क्रीन सेटअप, देखने की दूरी और ब्रेक की आदतों के बारे में नेत्र देखभाल पेशेवर को बताना और पूछना चाह सकते हैं कि क्या कोई समायोजन या सुधार सहायक हो सकता है।',
    },
    icon: 'monitor_heart',
    triggers: (answers) => {
      const highScreen = answers.screen_hours?.value === 'high';
      const headaches = ['often', 'sometimes'].includes(answers.headaches?.value);
      return highScreen && headaches;
    },
    sourceKeys: ['screen_hours', 'headaches'],
  },
  {
    id: 'low-light-contrast',
    title: {
      en: 'Contrast sensitivity changes',
      hi: 'कंट्रास्ट संवेदनशीलता में बदलाव',
    },
    description: {
      en: 'Your responses suggest difficulty in low-light conditions, outdoor activity exposure and squinting to see clearly. Together, these may suggest changes in contrast sensitivity that are worth discussing with an eye-care professional.',
      hi: 'आपके जवाब कम रोशनी में कठिनाई, बाहरी गतिविधि और स्पष्ट देखने के लिए आँखें सिकोड़ने का संयोजन सुझाते हैं। ये मिलकर कंट्रास्ट संवेदनशीलता में बदलाव सुझा सकते हैं जो नेत्र देखभाल पेशेवर से चर्चा के योग्य हैं।',
    },
    discussionPrompt: {
      en: 'You may want to describe the lighting conditions in which you notice difficulty and ask whether a contrast sensitivity assessment would be appropriate.',
      hi: 'आप उन रोशनी की स्थितियों का वर्णन करना चाह सकते हैं जिनमें आपको कठिनाई महसूस होती है और पूछ सकते हैं कि क्या कंट्रास्ट संवेदनशीलता का मूल्यांकन उचित होगा।',
    },
    icon: 'contrast',
    triggers: (answers) => {
      const nightIssue = ['yes', 'sometimes'].includes(answers.night_vision?.value);
      const outdoorTime = ['moderate', 'high'].includes(answers.outdoor_time?.value);
      const squinting = ['yes', 'sometimes'].includes(answers.squinting?.value);
      return nightIssue && outdoorTime && squinting;
    },
    sourceKeys: ['night_vision', 'outdoor_time', 'squinting'],
  },
  {
    id: 'overdue-exam',
    title: {
      en: 'Extended period without professional examination',
      hi: 'पेशेवर जाँच के बिना लंबी अवधि',
    },
    description: {
      en: 'Your responses suggest that you have not had a professional eye examination recently, while also reporting one or more vision-related experiences. Routine examinations can help detect changes early and are worth discussing.',
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

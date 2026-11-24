/**
 * SightSteps — transparent, answer-based conversation engine.
 *
 * Produces observations, activity context, discussion prompts and follow-up notes.
 * It does not diagnose, triage, score clinical risk, measure visual acuity or prescribe.
 */
import { getActivityLabel } from '../data/questions.js';

const GROUPS = [
  {
    id: 'experiences',
    title: { en: 'Vision Experiences', hi: 'दृष्टि संबंधी अनुभव' },
    description: { en: 'What you shared about your day-to-day vision experiences.', hi: 'आपने अपनी रोज़मर्रा की दृष्टि के बारे में जो बताया।' },
    icon: 'visibility',
  },
  {
    id: 'dailyHabits',
    title: { en: 'Daily Habits', hi: 'दैनिक आदतें' },
    description: { en: 'Your reported screen use, outdoor time and daily activities.', hi: 'आपका स्क्रीन उपयोग, बाहर बिताया गया समय और दैनिक गतिविधियाँ।' },
    icon: 'self_improvement',
  },
  {
    id: 'eyeCare',
    title: { en: 'Eye-care Background', hi: 'नेत्र देखभाल का इतिहास' },
    description: { en: 'Your reported use of vision correction and examination history.', hi: 'चश्मे या कॉन्टैक्ट लेंस के उपयोग और जाँच का आपका बताया हुआ इतिहास।' },
    icon: 'health_and_safety',
  },
];

const ACTIVITY_LABELS = {
  screen_work: { en: 'Screen work', hi: 'स्क्रीन पर काम' },
  reading: { en: 'Reading & study', hi: 'पढ़ाई और अध्ययन' },
  fine_detail: { en: 'Fine-detail work & crafts', hi: 'बारीक काम और दस्तकारी' },
  driving: { en: 'Driving & travel', hi: 'ड्राइविंग और यात्रा' },
  outdoor: { en: 'Outdoor activities', hi: 'बाहरी गतिविधियाँ' },
  other: { en: 'Other', hi: 'अन्य' },
};

const OBSERVATIONS = {
  blurred_vision: {
    group: 'experiences', question: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' },
    notes: {
      yes: { en: 'You reported experiencing blurred or unclear vision.', hi: 'आपने धुंधला या अस्पष्ट दिखाई देने की बात बताई।' },
      sometimes: { en: 'You reported occasional blurred or unclear vision.', hi: 'आपने कभी-कभी धुंधला या अस्पष्ट दिखाई देने की बात बताई।' },
      no: { en: 'You did not report blurred or unclear vision.', hi: 'आपने धुंधला या अस्पष्ट दिखाई देने की शिकायत नहीं बताई।' },
    },
  },
  blur_distance: {
    group: 'experiences', question: { en: 'Distance at which blur occurs', hi: 'किस दूरी पर धुंधलापन होता है' },
    notes: {
      near: { en: 'You reported more difficulty with near objects.', hi: 'आपने पास की वस्तुओं को देखने में अधिक कठिनाई बताई।' },
      far: { en: 'You reported more difficulty with distant objects.', hi: 'आपने दूर की वस्तुओं को देखने में अधिक कठिनाई बताई।' },
      both: { en: 'You reported difficulty with both near and distant objects.', hi: 'आपने पास और दूर दोनों की वस्तुओं को देखने में कठिनाई बताई।' },
    },
  },
  headaches: {
    group: 'experiences', question: { en: 'Headaches around visual activities', hi: 'दृष्टि से जुड़ी गतिविधियों के दौरान सिरदर्द' },
    notes: {
      often: { en: 'You reported frequent headaches, particularly around reading or screen use.', hi: 'आपने पढ़ने या स्क्रीन देखने के दौरान अक्सर सिरदर्द होने की बात बताई।' },
      sometimes: { en: 'You reported occasional headaches around reading or screen use.', hi: 'आपने पढ़ने या स्क्रीन देखने के दौरान कभी-कभी सिरदर्द होने की बात बताई।' },
      rarely: { en: 'You reported rarely or never experiencing these headaches.', hi: 'आपने ऐसा सिरदर्द बहुत कम या कभी नहीं होने की बात बताई।' },
    },
  },
  squinting: {
    group: 'experiences', question: { en: 'Squinting to see clearly', hi: 'स्पष्ट देखने के लिए आँखें सिकोड़ना' },
    notes: {
      yes: { en: 'You reported frequently squinting to see things clearly.', hi: 'आपने स्पष्ट देखने के लिए अक्सर आँखें सिकोड़ने की बात बताई।' },
      sometimes: { en: 'You reported occasionally squinting to see things clearly.', hi: 'आपने कभी-कभी स्पष्ट देखने के लिए आँखें सिकोड़ने की बात बताई।' },
      no: { en: 'You did not report squinting to see clearly.', hi: 'आपने स्पष्ट देखने के लिए आँखें सिकोड़ने की शिकायत नहीं बताई।' },
    },
  },
  night_vision: {
    group: 'experiences', question: { en: 'Vision in low light', hi: 'कम रोशनी में देखने का अनुभव' },
    notes: {
      yes: { en: 'You reported difficulty seeing at night or in low-light conditions.', hi: 'आपने रात में या कम रोशनी में देखने में कठिनाई बताई।' },
      sometimes: { en: 'You reported occasional difficulty seeing at night or in low light.', hi: 'आपने रात में या कम रोशनी में कभी-कभी कठिनाई बताई।' },
      no: { en: 'You did not report difficulty seeing at night or in low light.', hi: 'आपने रात में या कम रोशनी में देखने में कठिनाई नहीं बताई।' },
    },
  },
  experience_frequency: {
    group: 'experiences', question: { en: 'Frequency of the main experience', hi: 'मुख्य अनुभव कितनी बार होता है' },
    notes: {
      daily: { en: 'You reported noticing the main experience every day.', hi: 'आपने मुख्य अनुभव रोज़ महसूस करने की बात बताई।' },
      weekly: { en: 'You reported noticing the main experience a few times a week.', hi: 'आपने मुख्य अनुभव हफ़्ते में कुछ बार महसूस करने की बात बताई।' },
      occasional: { en: 'You reported noticing the main experience occasionally.', hi: 'आपने मुख्य अनुभव कभी-कभी महसूस करने की बात बताई।' },
    },
  },
  which_eye: {
    group: 'experiences', question: { en: 'Eye(s) involved in the main experience', hi: 'मुख्य अनुभव किस आँख में होता है' },
    notes: {
      left: { en: 'You reported that the left eye is primarily involved.', hi: 'आपने बताया कि मुख्य रूप से बाईं आँख में यह अनुभव होता है।' },
      right: { en: 'You reported that the right eye is primarily involved.', hi: 'आपने बताया कि मुख्य रूप से दाईं आँख में यह अनुभव होता है।' },
      both: { en: 'You reported that both eyes are involved.', hi: 'आपने बताया कि दोनों आँखों में यह अनुभव होता है।' },
      unsure: { en: 'You were not sure which eye is involved.', hi: 'आप निश्चित नहीं थे कि कौन-सी आँख में यह अनुभव होता है।' },
    },
  },
  primary_concern: {
    group: 'experiences', question: { en: 'Main experience to discuss first', hi: 'पहले चर्चा करने वाला मुख्य अनुभव' }, notes: {},
  },
  experience_onset: {
    group: 'experiences', question: { en: 'When the main experience was first noticed', hi: 'मुख्य अनुभव पहली बार कब महसूस हुआ' }, notes: {},
  },
  experience_change: {
    group: 'experiences', question: { en: 'How the main experience has changed', hi: 'मुख्य अनुभव में समय के साथ बदलाव' }, notes: {},
  },
  experience_context: {
    group: 'experiences', question: { en: 'Situations when the main experience is noticed', hi: 'मुख्य अनुभव महसूस होने की परिस्थितियाँ' }, notes: {},
  },
  affected_activities: {
    group: 'experiences', question: { en: 'Activities you said feel affected', hi: 'आपके अनुसार प्रभावित गतिविधियाँ' }, notes: {},
  },
  screen_hours: {
    group: 'dailyHabits', question: { en: 'Daily screen use', hi: 'दैनिक स्क्रीन उपयोग' },
    notes: {
      low: { en: 'You reported spending less than two hours per day on screens.', hi: 'आपने प्रतिदिन दो घंटे से कम स्क्रीन उपयोग बताया।' },
      moderate: { en: 'You reported spending two to six hours per day on screens.', hi: 'आपने प्रतिदिन दो से छह घंटे स्क्रीन उपयोग बताया।' },
      high: { en: 'You reported spending more than six hours per day on screens.', hi: 'आपने प्रतिदिन छह घंटे से अधिक स्क्रीन उपयोग बताया।' },
    },
  },
  outdoor_time: {
    group: 'dailyHabits', question: { en: 'Time spent outdoors', hi: 'बाहर बिताया गया समय' },
    notes: {
      high: { en: 'You reported spending most of the day outdoors.', hi: 'आपने दिन का अधिकांश समय बाहर बिताने की बात बताई।' },
      moderate: { en: 'You reported spending a few hours outdoors.', hi: 'आपने कुछ घंटे बाहर बिताने की बात बताई।' },
      low: { en: 'You reported spending very little time outdoors.', hi: 'आपने बाहर बहुत कम समय बिताने की बात बताई।' },
    },
  },
  close_work: {
    group: 'dailyHabits', question: { en: 'Close-up activities', hi: 'पास से किए जाने वाले काम' },
    notes: {
      daily: { en: 'You reported doing close-up work such as reading, sewing or crafts for several hours daily.', hi: 'आपने पढ़ने, सिलाई या हस्तकला जैसे पास के काम रोज़ कई घंटे करने की बात बताई।' },
      sometimes: { en: 'You reported doing close-up work occasionally.', hi: 'आपने कभी-कभी पास से किए जाने वाले काम करने की बात बताई।' },
      rarely: { en: 'You reported rarely doing close-up work.', hi: 'आपने पास से किए जाने वाले काम बहुत कम करने की बात बताई।' },
    },
  },
  existing_glasses: {
    group: 'eyeCare', question: { en: 'Current vision correction', hi: 'वर्तमान दृष्टि सुधार' },
    notes: {
      glasses: { en: 'You reported currently wearing glasses.', hi: 'आपने वर्तमान में चश्मा पहनने की बात बताई।' },
      contacts: { en: 'You reported currently using contact lenses.', hi: 'आपने वर्तमान में कॉन्टैक्ट लेंस उपयोग करने की बात बताई।' },
      both: { en: 'You reported using both glasses and contact lenses.', hi: 'आपने चश्मे और कॉन्टैक्ट लेंस दोनों का उपयोग बताया।' },
      no: { en: 'You reported not currently using glasses or contact lenses.', hi: 'आपने वर्तमान में चश्मा या कॉन्टैक्ट लेंस उपयोग नहीं करने की बात बताई।' },
    },
  },
  glasses_age: {
    group: 'eyeCare', question: { en: 'Age of current prescription', hi: 'वर्तमान प्रिस्क्रिप्शन की अवधि' },
    notes: {
      recent: { en: 'You reported that your current prescription is less than one year old.', hi: 'आपने बताया कि आपका वर्तमान प्रिस्क्रिप्शन एक वर्ष से कम पुराना है।' },
      old: { en: 'You reported that your current prescription is one to two years old.', hi: 'आपने बताया कि आपका वर्तमान प्रिस्क्रिप्शन एक से दो वर्ष पुराना है।' },
      very_old: { en: 'You reported that your current prescription is more than two years old.', hi: 'आपने बताया कि आपका वर्तमान प्रिस्क्रिप्शन दो वर्ष से अधिक पुराना है।' },
      unknown: { en: 'You were unsure how old your current prescription is.', hi: 'आपको अपने वर्तमान प्रिस्क्रिप्शन की अवधि के बारे में निश्चित जानकारी नहीं थी।' },
    },
  },
  eye_exam: {
    group: 'eyeCare', question: { en: 'Previous professional eye examination', hi: 'पिछली पेशेवर आँखों की जाँच' },
    notes: {
      recent: { en: 'You reported having an eye examination within the last year.', hi: 'आपने पिछले एक वर्ष के भीतर आँखों की जाँच करवाने की बात बताई।' },
      old: { en: 'You reported that your last eye examination was one to three years ago.', hi: 'आपने बताया कि आपकी पिछली आँखों की जाँच एक से तीन वर्ष पहले हुई थी।' },
      very_old: { en: 'You reported that your last eye examination was more than three years ago.', hi: 'आपने बताया कि आपकी पिछली आँखों की जाँच तीन वर्ष से अधिक पहले हुई थी।' },
      never: { en: 'You reported that you have never had a professional eye examination.', hi: 'आपने बताया कि आपने कभी पेशेवर आँखों की जाँच नहीं करवाई।' },
    },
  },
  age_group: {
    group: 'eyeCare', question: { en: 'Age group', hi: 'आयु वर्ग' }, notes: {},
  },
};

const SOURCE_LABELS = {
  screen_hours: { en: 'Daily screen use', hi: 'दैनिक स्क्रीन उपयोग' },
  outdoor_time: { en: 'Outdoor time', hi: 'बाहर बिताया गया समय' },
  close_work: { en: 'Close-up work', hi: 'पास से किया जाने वाला काम' },
  glasses_age: { en: 'Prescription age', hi: 'प्रिस्क्रिप्शन की अवधि' },
  affected_activities: { en: 'Activities reported as affected', hi: 'प्रभावित बताई गई गतिविधियाँ' },
  custom_activity_name: { en: 'Participant-entered activity name', hi: 'प्रतिभागी द्वारा दर्ज गतिविधि का नाम' },
  primary_concern: { en: 'Main concern selected by participant', hi: 'प्रतिभागी द्वारा चुनी गई मुख्य चिंता' },
  experience_onset: { en: 'When first noticed', hi: 'पहली बार कब महसूस हुआ' },
  experience_change: { en: 'Change over time', hi: 'समय के साथ बदलाव' },
  experience_context: { en: 'Situations reported', hi: 'बताई गई परिस्थितियाँ' },
};

function localized(value, language, fallback = '') {
  if (value && typeof value === 'object') return value[language] || value.en || fallback;
  return typeof value === 'string' ? value : fallback;
}

function hasAnswer(answer) {
  if (!answer || answer.value === undefined || answer.value === null) return false;
  if (Array.isArray(answer.value)) return answer.value.length > 0;
  return typeof answer.value === 'string' ? answer.value.trim().length > 0 : true;
}

function buildObservation(questionId, answer, definition) {
  const value = answer.value;
  const answerEn = localized(answer.label, 'en', Array.isArray(value) ? value.join(', ') : String(value));
  const answerHi = localized(answer.label, 'hi', Array.isArray(value) ? value.join(', ') : String(value));
  let detail = definition.notes?.[value];

  if (questionId === 'affected_activities') {
    const values = Array.isArray(value) ? value : [];
    const isNone = values.includes('none');
    const isUnsure = values.includes('unsure');
    detail = isNone
      ? { en: 'You did not identify any of the listed daily activities as affected by the experience.', hi: 'आपने सूचीबद्ध दैनिक गतिविधियों में से किसी को भी इस अनुभव से प्रभावित नहीं बताया।' }
      : isUnsure
        ? { en: 'You were unsure which daily activities are affected.', hi: 'आप निश्चित नहीं थे कि कौन-सी दैनिक गतिविधियाँ प्रभावित हैं।' }
        : { en: 'You identified these activities as feeling affected. This records your experience; it does not assess visual performance.', hi: 'आपने इन गतिविधियों को प्रभावित महसूस होने की बात बताई। यह आपके अनुभव को दर्ज करता है; दृष्टि क्षमता का आकलन नहीं करता।' };
  }

  if (!detail) {
    detail = {
      en: `You selected: ${answerEn}.`,
      hi: `आपने यह विकल्प चुना: ${answerHi}।`,
    };
  }

  return {
    id: questionId,
    question: definition.question,
    answer: { en: answerEn, hi: answerHi },
    detail,
  };
}

function getActivityImpactMeta(questionId) {
  if (questionId.startsWith('activity_impact_frequency_')) {
    return { activityId: questionId.slice('activity_impact_frequency_'.length), kind: 'frequency' };
  }
  if (questionId.startsWith('activity_impact_')) {
    return { activityId: questionId.slice('activity_impact_'.length), kind: 'impact' };
  }
  return null;
}

function makeQuestionSource(questionId, answers) {
  const answer = answers[questionId];
  if (!hasAnswer(answer)) return null;
  const definition = OBSERVATIONS[questionId];
  const impactMeta = getActivityImpactMeta(questionId);
  const activityLabel = getActivityLabel(impactMeta?.activityId, answers) || ACTIVITY_LABELS[impactMeta?.activityId];
  const activityNameEn = activityLabel?.en || impactMeta?.activityId || '';
  const activityNameHi = activityLabel?.hi || impactMeta?.activityId || '';
  const generatedLabel = impactMeta?.kind === 'frequency'
    ? { en: `Frequency of impact on ${activityNameEn}`, hi: `${activityNameHi} पर प्रभाव की आवृत्ति` }
    : impactMeta
      ? { en: `Impact on ${activityNameEn}`, hi: `${activityNameHi} पर प्रभाव` }
      : null;
  const secondaryMatch = questionId.match(/^additional_experience_(.+)_(onset|frequency|context|eye)$/);
  const secondaryExperience = secondaryMatch ? OBSERVATIONS[secondaryMatch[1]]?.question : null;
  const secondarySuffix = secondaryMatch ? {
    onset: { en: 'When first noticed', hi: 'पहली बार कब महसूस हुआ' },
    frequency: { en: 'Frequency', hi: 'आवृत्ति' },
    context: { en: 'Situations', hi: 'परिस्थितियाँ' },
    eye: { en: 'Eye(s) involved', hi: 'किस आँख में' },
  }[secondaryMatch[2]] : null;
  const secondaryLabel = secondaryExperience && secondarySuffix
    ? {
        en: secondaryExperience.en + ' — ' + secondarySuffix.en,
        hi: secondaryExperience.hi + ' — ' + secondarySuffix.hi,
      }
    : null;
  return {
    type: 'question',
    id: questionId,
    label: SOURCE_LABELS[questionId] || generatedLabel || secondaryLabel || definition?.question || { en: questionId, hi: questionId },
    answer: answer.label || { en: String(answer.value), hi: String(answer.value) },
  };
}

function makeActivitySource(field, activityId, answers = {}) {
  if (!activityId) return null;
  return {
    type: 'activity_profile',
    id: field,
    label: field === 'primaryActivity'
      ? { en: 'Primary daily activity', hi: 'मुख्य दैनिक गतिविधि' }
      : { en: 'Selected daily activities', hi: 'चुनी गई दैनिक गतिविधियाँ' },
    answer: getActivityLabel(activityId, answers) || ACTIVITY_LABELS[activityId] || { en: activityId, hi: activityId },
  };
}

function nonEmptySources(sources) {
  return sources.filter(Boolean);
}

function buildDiscussionPoints(answers, context = {}) {
  const points = [];
  const primaryActivity = context.primaryActivity;

  if (primaryActivity) {
    const activityPrompts = {
      screen_work: {
        en: ['Screen-based tasks', 'You selected screen work as your main daily activity.', 'Describe your screen tasks, viewing distance, duration and any situations that feel uncomfortable.'],
        hi: ['स्क्रीन से जुड़े काम', 'आपने स्क्रीन पर काम को अपनी मुख्य दैनिक गतिविधि चुना।', 'अपने स्क्रीन वाले काम, देखने की दूरी, अवधि और असहज महसूस होने वाली परिस्थितियों के बारे में बताएं।'], icon: 'devices',
      },
      reading: {
        en: ['Reading and study', 'You selected reading and study as your main daily activity.', 'Describe your usual reading distance, duration and the situations in which you notice difficulty.'],
        hi: ['पढ़ाई और अध्ययन', 'आपने पढ़ाई और अध्ययन को अपनी मुख्य दैनिक गतिविधि चुना।', 'पढ़ने की सामान्य दूरी, अवधि और जिन परिस्थितियों में कठिनाई महसूस होती है, उनके बारे में बताएं।'], icon: 'menu_book',
      },
      fine_detail: {
        en: ['Fine-detail work', 'You selected fine-detail work or crafts as your main daily activity.', 'Describe the working distance, lighting and duration of your detailed tasks. Ask the eye-care professional what should be assessed for these activities.'],
        hi: ['बारीक काम', 'आपने बारीक काम या दस्तकारी को अपनी मुख्य दैनिक गतिविधि चुना।', 'बारीक काम करते समय दूरी, रोशनी और अवधि के बारे में बताएं। इन गतिविधियों के लिए क्या जाँचना चाहिए, यह नेत्र देखभाल पेशेवर से पूछें।'], icon: 'draw',
      },
      driving: {
        en: ['Driving and travel', 'You selected driving and travel as your main daily activity.', 'Describe your driving conditions and any difficulty with road signs, low light or glare. Discuss these experiences with an eye-care professional before relying on your vision for driving.'],
        hi: ['ड्राइविंग और यात्रा', 'आपने ड्राइविंग और यात्रा को अपनी मुख्य दैनिक गतिविधि चुना।', 'ड्राइविंग की परिस्थितियों और सड़क संकेतों, कम रोशनी या चकाचौंध में होने वाली कठिनाई के बारे में बताएं। ड्राइविंग के लिए दृष्टि पर निर्भर होने से पहले इन अनुभवों पर नेत्र देखभाल पेशेवर से चर्चा करें।'], icon: 'directions_car',
      },
      outdoor: {
        en: ['Outdoor activities', 'You selected outdoor activities as your main daily activity.', 'Describe your typical outdoor conditions, lighting and any discomfort you notice. Ask what eye protection is appropriate for your circumstances.'],
        hi: ['बाहरी गतिविधियाँ', 'आपने बाहरी गतिविधियों को अपनी मुख्य दैनिक गतिविधि चुना।', 'बाहर की सामान्य परिस्थितियों, रोशनी और होने वाली असहजता के बारे में बताएं। अपनी परिस्थितियों के लिए उचित आँखों की सुरक्षा के बारे में पूछें।'], icon: 'park',
      },
      other: {
        en: ['Your main daily activity', 'You selected another activity as the one that takes most of your day.', 'Explain what the activity involves, how long you do it and what visual tasks it requires.'],
        hi: ['आपकी मुख्य दैनिक गतिविधि', 'आपने किसी अन्य गतिविधि को अपनी दिनचर्या का सबसे बड़ा हिस्सा बताया।', 'बताएं कि इस गतिविधि में क्या शामिल है, आप इसे कितनी देर करते हैं और इसमें किस तरह के दृश्य कार्य शामिल हैं।'], icon: 'more_horiz',
      },
    };
    let content = activityPrompts[primaryActivity];
    if (primaryActivity === 'other') {
      const customActivity = getActivityLabel('other', answers);
      if (customActivity?.en) {
        content = {
          en: [customActivity.en, `You selected ${customActivity.en} as your main daily activity.`, `Describe what ${customActivity.en.toLowerCase()} involves, how long you do it and what visual tasks it requires.`],
          hi: [customActivity.hi, `आपने ${customActivity.hi} को अपनी मुख्य दैनिक गतिविधि चुना।`, `बताएं कि ${customActivity.hi} में क्या शामिल है, आप इसे कितनी देर करते हैं और इसमें किस तरह के दृश्य कार्य शामिल हैं।`],
          icon: 'more_horiz',
        };
      }
    }
    if (content) {
      points.push({
        id: 'primary_activity_context',
        title: { en: content.en[0], hi: content.hi[0] },
        context: { en: content.en[1], hi: content.hi[1] },
        prompt: { en: content.en[2], hi: content.hi[2] },
        icon: content.icon,
        sources: nonEmptySources([
          makeActivitySource('primaryActivity', primaryActivity, answers),
          ...(primaryActivity === 'other' ? [makeQuestionSource('custom_activity_name', answers)] : []),
        ]),
      });
    }
  }

  const affected = Array.isArray(answers.affected_activities?.value) ? answers.affected_activities.value : [];
  const affectedIds = affected.filter((id) => ACTIVITY_LABELS[id] && !['none', 'unsure'].includes(id));
  if (affectedIds.length) {
    const labels = affectedIds.map((id) => getActivityLabel(id, answers) || ACTIVITY_LABELS[id]);
    points.push({
      id: 'affected_activity_context',
      title: { en: 'Activities you said are affected', hi: 'आपके अनुसार प्रभावित गतिविधियाँ' },
      context: {
        en: `You identified ${labels.map((item) => item.en).join(', ')} as activities that feel affected.`,
        hi: `आपने ${labels.map((item) => item.hi).join(', ')} को प्रभावित महसूस होने वाली गतिविधियों के रूप में चुना।`,
      },
      prompt: {
        en: 'For each activity, describe what becomes difficult, how often you notice it, and the usual working distance or lighting. These details can help the professional understand your day-to-day experience.',
        hi: 'हर गतिविधि के लिए बताएं कि क्या कठिन लगता है, यह कितनी बार होता है और काम की सामान्य दूरी या रोशनी कैसी होती है। ये विवरण पेशेवर को आपका रोज़मर्रा का अनुभव समझने में मदद कर सकते हैं।',
      },
      icon: 'fact_check',
      sources: nonEmptySources([
        makeQuestionSource('affected_activities', answers),
        ...(affectedIds.includes('other') ? [makeQuestionSource('custom_activity_name', answers)] : []),
      ]),
    });
  }

  const primaryConcern = answers.primary_concern?.value;
  if (primaryConcern) {
    const concernDef = OBSERVATIONS[primaryConcern];
    const concernQuestion = concernDef?.question || { en: primaryConcern, hi: primaryConcern };
    const contextAnswer = answers.experience_context?.label;
    const onsetAnswer = answers.experience_onset?.label;
    const changeAnswer = answers.experience_change?.label;
    points.push({
      id: 'main_experience_timeline',
      title: { en: 'Your main reported experience', hi: 'आपका मुख्य बताया गया अनुभव' },
      context: {
        en: `You selected ${concernQuestion.en} as the first topic you would like to discuss.`,
        hi: `आपने ${concernQuestion.hi} को पहले चर्चा करने वाला विषय चुना।`,
      },
      prompt: {
        en: `Share when you first noticed it (${localized(onsetAnswer, 'en', 'not recorded')}), how it has changed (${localized(changeAnswer, 'en', 'not recorded')}) and the situations you selected (${localized(contextAnswer, 'en', 'not recorded')}).`,
        hi: `बताएँ कि आपने इसे पहली बार कब महसूस किया (${localized(onsetAnswer, 'hi', 'दर्ज नहीं')}) और समय के साथ इसमें क्या बदलाव आया (${localized(changeAnswer, 'hi', 'दर्ज नहीं')})। आपने जो परिस्थितियाँ चुनीं (${localized(contextAnswer, 'hi', 'दर्ज नहीं')}), उनके बारे में भी बताएँ।`,
      },
      icon: 'timeline',
      sources: nonEmptySources([
        makeQuestionSource('primary_concern', answers),
        makeQuestionSource(primaryConcern, answers),
        makeQuestionSource('experience_onset', answers),
        makeQuestionSource('experience_change', answers),
        makeQuestionSource('experience_context', answers),
        makeQuestionSource('experience_frequency', answers),
        makeQuestionSource('which_eye', answers),
      ]),
    });
  }

  const reportedExperienceIds = [
    ['blurred_vision', ['yes', 'sometimes']],
    ['headaches', ['often', 'sometimes']],
    ['squinting', ['yes', 'sometimes']],
    ['night_vision', ['yes', 'sometimes']],
  ].filter(([id, values]) => values.includes(answers[id]?.value)).map(([id]) => id);
  for (const experienceId of reportedExperienceIds.filter((id) => id !== primaryConcern)) {
    const experienceLabel = OBSERVATIONS[experienceId]?.question || { en: experienceId, hi: experienceId };
    points.push({
      id: `additional_experience_${experienceId}`,
      title: { en: 'Another experience you reported', hi: 'आपका एक अन्य बताया गया अनुभव' },
      context: {
        en: `You also reported: ${experienceLabel.en}.`,
        hi: `आपने यह अनुभव भी बताया: ${experienceLabel.hi}।`,
      },
      prompt: {
        en: 'If you would like to discuss this too, describe when you notice it and whether it affects any of your everyday activities.',
        hi: 'यदि आप इस पर भी चर्चा करना चाहते हैं, तो बताएँ कि यह कब महसूस होता है और क्या इसका असर आपकी रोज़मर्रा की गतिविधियों पर पड़ता है।',
      },
      icon: 'chat',
      sources: nonEmptySources([makeQuestionSource(experienceId, answers)]),
    });
  }

  const affectedValuesForMap = Array.isArray(answers.affected_activities?.value) ? answers.affected_activities.value : [];
  const activityImpact = affectedValuesForMap
    .filter((activityId) => ACTIVITY_LABELS[activityId])
    .map((activityId) => ({
      id: activityId,
      label: getActivityLabel(activityId, answers) || ACTIVITY_LABELS[activityId],
      impacts: Array.isArray(answers[`activity_impact_${activityId}`]?.value)
        ? answers[`activity_impact_${activityId}`].value
        : [],
      answer: answers[`activity_impact_${activityId}`]?.label || null,
      frequency: answers[`activity_impact_frequency_${activityId}`]?.label || null,
    }));
  const completedImpact = activityImpact.filter((entry) => entry.impacts.some((impact) => !['none', 'unsure'].includes(impact)));
  if (completedImpact.length) {
    points.push({
      id: 'activity_impact_detail',
      title: { en: 'How daily activities feel affected', hi: 'दैनिक गतिविधियाँ किस तरह प्रभावित महसूस होती हैं' },
      context: {
        en: completedImpact.map((entry) => `${entry.label.en}: ${localized(entry.answer, 'en', entry.impacts.join(', '))}${entry.frequency ? ` (frequency: ${localized(entry.frequency, 'en')})` : ''}`).join('; '),
        hi: completedImpact.map((entry) => `${entry.label.hi}: ${localized(entry.answer, 'hi', entry.impacts.join(', '))}${entry.frequency ? ` (आवृत्ति: ${localized(entry.frequency, 'hi')})` : ''}`).join('। '),
      },
      prompt: {
        en: 'Use these examples to explain what changes during each activity and how often you notice it. The selections are self-reported descriptions, not a measurement of visual performance.',
        hi: 'हर गतिविधि के दौरान क्या बदलता है और यह कितनी बार महसूस होता है, यह समझाने के लिए इन उदाहरणों का उपयोग करें। ये आपके बताए अनुभव हैं, दृष्टि क्षमता का मापन नहीं।',
      },
      icon: 'fact_check',
      sources: nonEmptySources(completedImpact.flatMap((entry) => [
        makeQuestionSource(`activity_impact_${entry.id}`, answers),
        makeQuestionSource(`activity_impact_frequency_${entry.id}`, answers),
      ])),
    });
  }

  const screenUse = answers.screen_hours?.value;
  if (['moderate', 'high'].includes(screenUse)) {
    points.push({
      id: 'screen_comfort',
      title: { en: 'Comfort during screen use', hi: 'स्क्रीन उपयोग के दौरान आराम' },
      context: {
        en: screenUse === 'high' ? 'You reported more than six hours of daily screen use.' : 'You reported two to six hours of daily screen use.',
        hi: screenUse === 'high' ? 'आपने प्रतिदिन छह घंटे से अधिक स्क्रीन उपयोग बताया।' : 'आपने प्रतिदिन दो से छह घंटे स्क्रीन उपयोग बताया।',
      },
      prompt: {
        en: 'Describe your screen setup, viewing distance, breaks and any discomfort. Ask the eye-care professional what should be assessed; screen time alone does not determine a prescription.',
        hi: 'अपने स्क्रीन सेटअप, देखने की दूरी, ब्रेक और किसी भी असहजता के बारे में बताएं। नेत्र देखभाल पेशेवर से पूछें कि क्या जाँचना चाहिए; केवल स्क्रीन उपयोग से प्रिस्क्रिप्शन तय नहीं होता।',
      },
      icon: 'devices',
      sources: nonEmptySources([makeQuestionSource('screen_hours', answers)]),
    });
  }

  if (['moderate', 'high'].includes(answers.outdoor_time?.value)) {
    const outdoorTime = answers.outdoor_time.value;
    points.push({
      id: 'outdoor_protection',
      title: { en: 'Outdoor conditions and eye protection', hi: 'बाहरी परिस्थितियाँ और आँखों की सुरक्षा' },
      context: {
        en: outdoorTime === 'high' ? 'You reported spending most of the day outdoors.' : 'You reported spending a few hours outdoors.',
        hi: outdoorTime === 'high' ? 'आपने दिन का अधिकांश समय बाहर बिताने की बात बताई।' : 'आपने कुछ घंटे बाहर बिताने की बात बताई।',
      },
      prompt: {
        en: 'Describe your typical exposure to sunlight, glare, dust or wind. Ask an eye-care professional what eye protection is appropriate for your actual conditions.',
        hi: 'धूप, चकाचौंध, धूल या हवा के संपर्क के बारे में बताएं। अपनी वास्तविक परिस्थितियों के लिए उचित आँखों की सुरक्षा के बारे में नेत्र देखभाल पेशेवर से पूछें।',
      },
      icon: 'wb_sunny',
      sources: nonEmptySources([makeQuestionSource('outdoor_time', answers)]),
    });
  }

  if (answers.close_work?.value === 'daily') {
    points.push({
      id: 'near_work',
      title: { en: 'Comfort during close-up work', hi: 'पास से काम करते समय आराम' },
      context: { en: 'You reported doing close-up activities for several hours daily.', hi: 'आपने प्रतिदिन कई घंटे पास से किए जाने वाले काम करने की बात बताई।' },
      prompt: {
        en: 'Explain the types of close-up tasks you do, their working distance, lighting and duration. Ask the professional whether any further assessment is appropriate.',
        hi: 'अपने पास के काम के प्रकार, काम की दूरी, रोशनी और अवधि के बारे में बताएं। पूछें कि क्या किसी अतिरिक्त जाँच की आवश्यकता है।',
      },
      icon: 'menu_book',
      sources: nonEmptySources([makeQuestionSource('close_work', answers)]),
    });
  }

  if (['old', 'very_old', 'unknown'].includes(answers.glasses_age?.value)) {
    points.push({
      id: 'prescription_review',
      title: { en: 'Review of current prescription', hi: 'वर्तमान प्रिस्क्रिप्शन की समीक्षा' },
      context: { en: 'You reported that your current prescription is not recent or that its age is unknown.', hi: 'आपने बताया कि आपका वर्तमान प्रिस्क्रिप्शन नया नहीं है या उसकी अवधि ज्ञात नहीं है।' },
      prompt: { en: 'Bring your current glasses or prescription details, if available, and ask whether a professional examination or prescription review is appropriate.', hi: 'यदि उपलब्ध हो, तो अपना मौजूदा चश्मा या प्रिस्क्रिप्शन विवरण साथ लाएँ और पूछें कि पेशेवर जाँच या प्रिस्क्रिप्शन समीक्षा उचित है या नहीं।' },
      icon: 'description',
      sources: nonEmptySources([makeQuestionSource('glasses_age', answers)]),
    });
  }

  return points;
}

function buildFollowUpNotes(answers) {
  const notes = [];
  const experienceIds = [
    ['blurred_vision', ['yes', 'sometimes']],
    ['headaches', ['often', 'sometimes']],
    ['squinting', ['yes', 'sometimes']],
    ['night_vision', ['yes', 'sometimes']],
  ];
  const reportedIds = experienceIds.filter(([id, values]) => values.includes(answers[id]?.value)).map(([id]) => id);

  if (reportedIds.length) {
    notes.push({
      id: 'reported_experiences',
      title: { en: 'Share your reported vision experiences', hi: 'अपने बताए गए दृष्टि संबंधी अनुभव साझा करें' },
      detail: {
        en: 'You reported one or more vision-related experiences. Share the selected main concern, when you first noticed it, how it has changed and the situations in which you notice it. This tool cannot determine cause or urgency.',
        hi: 'आपने दृष्टि से जुड़े एक या अधिक अनुभव बताए हैं। चुनी गई मुख्य चिंता, पहली बार कब महसूस हुई, समय के साथ बदलाव और जिन परिस्थितियों में यह महसूस होती है, वे साझा करें। यह टूल कारण या तात्कालिकता तय नहीं कर सकता।',
      },
      sources: [...reportedIds, 'primary_concern', 'experience_onset', 'experience_change', 'experience_context', 'experience_frequency', 'which_eye', 'affected_activities'].map((id) => makeQuestionSource(id, answers)).filter(Boolean),
    });
  }

  if (answers.eye_exam?.value === 'never') {
    notes.push({
      id: 'no_previous_exam',
      title: { en: 'Professional eye examination history', hi: 'पेशेवर आँखों की जाँच का इतिहास' },
      detail: { en: 'You reported never having a professional eye examination. Ask an eye-care professional about arranging an appropriate examination.', hi: 'आपने बताया कि आपने कभी पेशेवर आँखों की जाँच नहीं करवाई। उचित जाँच की व्यवस्था के बारे में नेत्र देखभाल पेशेवर से पूछें।' },
      sources: [makeQuestionSource('eye_exam', answers)].filter(Boolean),
    });
  } else if (['old', 'very_old'].includes(answers.eye_exam?.value)) {
    notes.push({
      id: 'previous_exam',
      title: { en: 'Previous eye examination', hi: 'पिछली आँखों की जाँच' },
      detail: { en: 'You reported that your last professional eye examination was more than a year ago. Ask an eye-care professional when another examination would be appropriate for you.', hi: 'आपने बताया कि आपकी पिछली पेशेवर आँखों की जाँच एक वर्ष से अधिक पहले हुई थी। अपने लिए अगली जाँच कब उचित होगी, इस बारे में नेत्र देखभाल पेशेवर से पूछें।' },
      sources: [makeQuestionSource('eye_exam', answers)].filter(Boolean),
    });
  }

  return notes;
}

/**
 * @param {Record<string, {value: unknown, label?: object}>} answers
 * @param {{activities?: string[], primaryActivity?: string|null, participantNote?: string, countableQuestionIds?: string[]}} context
 */
export function evaluateAnswers(answers = {}, context = {}) {
  const safeAnswers = answers && typeof answers === 'object' ? answers : {};

  const groups = GROUPS.map((group) => {
    const observations = Object.entries(OBSERVATIONS)
      .filter(([questionId, definition]) => definition.group === group.id && hasAnswer(safeAnswers[questionId]))
      .map(([questionId, definition]) => buildObservation(questionId, safeAnswers[questionId], definition));
    if (group.id === 'dailyHabits') {
      for (const [questionId, answer] of Object.entries(safeAnswers)) {
        const impactMeta = getActivityImpactMeta(questionId);
        if (!impactMeta || !hasAnswer(answer)) continue;
        const label = getActivityLabel(impactMeta.activityId, safeAnswers) || ACTIVITY_LABELS[impactMeta.activityId] || { en: impactMeta.activityId, hi: impactMeta.activityId };
        const isFrequency = impactMeta.kind === 'frequency';
        observations.push({
          id: questionId,
          question: isFrequency
            ? { en: `Frequency of impact on ${label.en}`, hi: `${label.hi} पर प्रभाव की आवृत्ति` }
            : { en: `Reported impact on ${label.en}`, hi: `${label.hi} पर बताया गया प्रभाव` },
          answer: answer.label || { en: String(answer.value), hi: String(answer.value) },
          detail: isFrequency
            ? { en: `You described how often the impact is noticed during ${label.en.toLowerCase()}.`, hi: `आपने बताया कि ${label.hi} के दौरान प्रभाव कितनी बार महसूस होता है।` }
            : { en: `You described how ${label.en.toLowerCase()} feels affected.`, hi: `आपने बताया कि ${label.hi} किस तरह प्रभावित महसूस होती है।` },
        });
      }
    }
    return { ...group, observations };
  }).filter((group) => group.observations.length > 0);

  const countableIds = Array.isArray(context.countableQuestionIds)
    ? new Set(context.countableQuestionIds)
    : null;
  const answeredCount = Object.entries(safeAnswers).filter(([questionId, answer]) => (
    (!countableIds || countableIds.has(questionId)) && hasAnswer(answer)
  )).length;

  const selectedActivities = Array.isArray(context.activities) ? context.activities : [];
  const affectedValues = Array.isArray(safeAnswers.affected_activities?.value)
    ? safeAnswers.affected_activities.value
    : [];
  const affectedIds = affectedValues.filter((id) => ACTIVITY_LABELS[id] && !['none', 'unsure'].includes(id));
  const affectedStatus = affectedValues.includes('none') ? 'none' : affectedValues.includes('unsure') ? 'unsure' : null;

  const activitiesContext = selectedActivities.length || context.primaryActivity || affectedValues.length
    ? {
        selected: selectedActivities.map((id) => ({ id, label: getActivityLabel(id, safeAnswers) || ACTIVITY_LABELS[id] || { en: id, hi: id } })),
        primary: context.primaryActivity
          ? { id: context.primaryActivity, label: getActivityLabel(context.primaryActivity, safeAnswers) || ACTIVITY_LABELS[context.primaryActivity] || { en: context.primaryActivity, hi: context.primaryActivity } }
          : null,
        affected: affectedIds.map((id) => ({ id, label: getActivityLabel(id, safeAnswers) || ACTIVITY_LABELS[id] })),
        affectedStatus,
        impactDetails: affectedIds.map((id) => ({
          id,
          label: getActivityLabel(id, safeAnswers) || ACTIVITY_LABELS[id],
          impacts: Array.isArray(safeAnswers[`activity_impact_${id}`]?.value) ? safeAnswers[`activity_impact_${id}`].value : [],
          answer: safeAnswers[`activity_impact_${id}`]?.label || null,
          frequency: safeAnswers[`activity_impact_frequency_${id}`]?.value || null,
          frequencyAnswer: safeAnswers[`activity_impact_frequency_${id}`]?.label || null,
        })),
      }
    : null;

  const participantNote = context.participantNote || safeAnswers.participant_note?.value || '';
  const reportedExperienceIds = [
    ['blurred_vision', ['yes', 'sometimes']],
    ['headaches', ['often', 'sometimes']],
    ['squinting', ['yes', 'sometimes']],
    ['night_vision', ['yes', 'sometimes']],
  ].filter(([id, values]) => values.includes(safeAnswers[id]?.value)).map(([id]) => id);
  const mainConcernId = safeAnswers.primary_concern?.value || null;
  const experienceProfiles = reportedExperienceIds.map((id) => ({
    id,
    label: OBSERVATIONS[id]?.question || { en: id, hi: id },
    response: safeAnswers[id]?.label || { en: String(safeAnswers[id]?.value || ''), hi: String(safeAnswers[id]?.value || '') },
    isPrimary: id === mainConcernId,
    ...(id === mainConcernId ? {
      onset: safeAnswers.experience_onset?.label || null,
      change: safeAnswers.experience_change?.label || null,
      frequency: safeAnswers.experience_frequency?.label || null,
      eye: safeAnswers.which_eye?.label || null,
      contexts: safeAnswers.experience_context?.label || null,
      affectedActivities: (activitiesContext?.impactDetails || []).map((entry) => ({ id: entry.id, label: entry.label, impact: entry.answer, frequency: entry.frequencyAnswer })),
    } : {}),
  }));

  return {
    answeredCount,
    groups,
    experienceProfiles,
    discussionPoints: buildDiscussionPoints(safeAnswers, context),
    followUpNotes: buildFollowUpNotes(safeAnswers),
    activitiesContext,
    participantNote,
  };
}

export default evaluateAnswers;

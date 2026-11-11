
/**
 * SightSteps — Transparent Insights Engine
 *
 * Converts questionnaire responses into:
 * 1. Answer-based observations.
 * 2. Groups of user-reported information.
 * 3. Optional topics to discuss with an optician.
 * 4. Notes that may be shared with an eye-care professional.
 *
 * SAFETY AND SCOPE:
 * - No clinical risk score is calculated.
 * - No diagnosis is generated.
 * - No examination urgency or timeframe is assigned.
 * - No lens prescription is generated.
 * - Lens features are discussion topics, not recommendations
 *   that replace professional assessment.
 */

const GROUPS = [
  {
    id: 'experiences',
    title: {
      en: 'Vision Experiences',
      hi: 'दृष्टि संबंधी अनुभव',
    },
    description: {
      en: 'What you shared about your day-to-day vision experiences.',
      hi: 'आपने अपनी रोज़मर्रा की दृष्टि के बारे में जो बताया।',
    },
    icon: 'visibility',
  },
  {
    id: 'dailyHabits',
    title: {
      en: 'Daily Habits',
      hi: 'दैनिक आदतें',
    },
    description: {
      en: 'Your reported screen use, outdoor time and daily activities.',
      hi: 'आपका स्क्रीन उपयोग, बाहर बिताया गया समय और दैनिक गतिविधियाँ।',
    },
    icon: 'self_improvement',
  },
  {
    id: 'eyeCare',
    title: {
      en: 'Eye-care Background',
      hi: 'नेत्र देखभाल का इतिहास',
    },
    description: {
      en: 'Your reported use of vision correction and examination history.',
      hi: 'चश्मे या कॉन्टैक्ट लेंस के उपयोग और जाँच का आपका बताया हुआ इतिहास।',
    },
    icon: 'health_and_safety',
  },
];

/**
 * Every observation maps directly to a question ID and
 * one of that question's actual answer values.
 *
 * Unknown values are handled through the original answer label.
 */

const OBSERVATION_DEFINITIONS = {
  blurred_vision: {
    group: 'experiences',
    question: {
      en: 'Blurred or unclear vision',
      hi: 'धुंधला या अस्पष्ट दिखाई देना',
    },
    notes: {
      yes: {
        en: 'You reported experiencing blurred or unclear vision.',
        hi: 'आपने धुंधला या अस्पष्ट दिखाई देने की बात बताई।',
      },
      sometimes: {
        en: 'You reported occasional blurred or unclear vision.',
        hi: 'आपने कभी-कभी धुंधला या अस्पष्ट दिखाई देने की बात बताई।',
      },
      no: {
        en: 'You did not report blurred or unclear vision.',
        hi: 'आपने धुंधला या अस्पष्ट दिखाई देने की शिकायत नहीं बताई।',
      },
    },
  },

  blur_distance: {
    group: 'experiences',
    question: {
      en: 'Distance at which blur occurs',
      hi: 'किस दूरी पर धुंधलापन होता है',
    },
    notes: {
      near: {
        en: 'You reported more difficulty with near objects.',
        hi: 'आपने पास की वस्तुओं को देखने में अधिक कठिनाई बताई।',
      },
      far: {
        en: 'You reported more difficulty with distant objects.',
        hi: 'आपने दूर की वस्तुओं को देखने में अधिक कठिनाई बताई।',
      },
      both: {
        en: 'You reported difficulty with both near and distant objects.',
        hi: 'आपने पास और दूर दोनों की वस्तुओं को देखने में कठिनाई बताई।',
      },
    },
  },

  headaches: {
    group: 'experiences',
    question: {
      en: 'Headaches during visual activities',
      hi: 'दृष्टि से जुड़ी गतिविधियों के दौरान सिरदर्द',
    },
    notes: {
      often: {
        en: 'You reported frequent headaches, particularly around reading or screen use.',
        hi: 'आपने पढ़ने या स्क्रीन देखने के दौरान अक्सर सिरदर्द होने की बात बताई।',
      },
      sometimes: {
        en: 'You reported occasional headaches around reading or screen use.',
        hi: 'आपने पढ़ने या स्क्रीन देखने के दौरान कभी-कभी सिरदर्द होने की बात बताई।',
      },
      rarely: {
        en: 'You reported rarely or never experiencing these headaches.',
        hi: 'आपने ऐसा सिरदर्द बहुत कम या कभी नहीं होने की बात बताई।',
      },
    },
  },

  squinting: {
    group: 'experiences',
    question: {
      en: 'Squinting to see clearly',
      hi: 'स्पष्ट देखने के लिए आँखें सिकोड़ना',
    },
    notes: {
      yes: {
        en: 'You reported frequently squinting to see things clearly.',
        hi: 'आपने स्पष्ट देखने के लिए अक्सर आँखें सिकोड़ने की बात बताई।',
      },
      sometimes: {
        en: 'You reported occasionally squinting to see things clearly.',
        hi: 'आपने कभी-कभी स्पष्ट देखने के लिए आँखें सिकोड़ने की बात बताई।',
      },
      no: {
        en: 'You did not report squinting to see clearly.',
        hi: 'आपने स्पष्ट देखने के लिए आँखें सिकोड़ने की शिकायत नहीं बताई।',
      },
    },
  },

  night_vision: {
    group: 'experiences',
    question: {
      en: 'Vision in low light',
      hi: 'कम रोशनी में देखने का अनुभव',
    },
    notes: {
      yes: {
        en: 'You reported difficulty seeing at night or in low-light conditions.',
        hi: 'आपने रात में या कम रोशनी में देखने में कठिनाई बताई।',
      },
      sometimes: {
        en: 'You reported occasional difficulty seeing at night or in low light.',
        hi: 'आपने रात में या कम रोशनी में कभी-कभी कठिनाई बताई।',
      },
      no: {
        en: 'You did not report difficulty seeing at night or in low light.',
        hi: 'आपने रात में या कम रोशनी में देखने में कठिनाई नहीं बताई।',
      },
    },
  },

  screen_hours: {
    group: 'dailyHabits',
    question: {
      en: 'Daily screen use',
      hi: 'दैनिक स्क्रीन उपयोग',
    },
    notes: {
      low: {
        en: 'You reported spending less than two hours per day on screens.',
        hi: 'आपने प्रतिदिन दो घंटे से कम स्क्रीन उपयोग बताया।',
      },
      moderate: {
        en: 'You reported spending two to six hours per day on screens.',
        hi: 'आपने प्रतिदिन दो से छह घंटे स्क्रीन उपयोग बताया।',
      },
      high: {
        en: 'You reported spending more than six hours per day on screens.',
        hi: 'आपने प्रतिदिन छह घंटे से अधिक स्क्रीन उपयोग बताया।',
      },
    },
  },

  outdoor_time: {
    group: 'dailyHabits',
    question: {
      en: 'Time spent outdoors',
      hi: 'बाहर बिताया गया समय',
    },
    notes: {
      high: {
        en: 'You reported spending most of the day outdoors.',
        hi: 'आपने दिन का अधिकांश समय बाहर बिताने की बात बताई।',
      },
      moderate: {
        en: 'You reported spending a few hours outdoors.',
        hi: 'आपने कुछ घंटे बाहर बिताने की बात बताई।',
      },
      low: {
        en: 'You reported spending very little time outdoors.',
        hi: 'आपने बाहर बहुत कम समय बिताने की बात बताई।',
      },
    },
  },

  close_work: {
    group: 'dailyHabits',
    question: {
      en: 'Close-up activities',
      hi: 'पास से किए जाने वाले काम',
    },
    notes: {
      daily: {
        en: 'You reported doing close-up work such as reading, sewing or crafts for several hours daily.',
        hi: 'आपने पढ़ने, सिलाई या हस्तकला जैसे पास के काम रोज़ कई घंटे करने की बात बताई।',
      },
      sometimes: {
        en: 'You reported doing close-up work occasionally.',
        hi: 'आपने कभी-कभी पास से किए जाने वाले काम करने की बात बताई।',
      },
      rarely: {
        en: 'You reported rarely doing close-up work.',
        hi: 'आपने पास से किए जाने वाले काम बहुत कम करने की बात बताई।',
      },
    },
  },

  existing_glasses: {
    group: 'eyeCare',
    question: {
      en: 'Current vision correction',
      hi: 'वर्तमान दृष्टि सुधार',
    },
    notes: {
      glasses: {
        en: 'You reported currently wearing glasses.',
        hi: 'आपने वर्तमान में चश्मा पहनने की बात बताई।',
      },
      contacts: {
        en: 'You reported currently using contact lenses.',
        hi: 'आपने वर्तमान में कॉन्टैक्ट लेंस उपयोग करने की बात बताई।',
      },
      both: {
        en: 'You reported using both glasses and contact lenses.',
        hi: 'आपने चश्मे और कॉन्टैक्ट लेंस दोनों का उपयोग बताया।',
      },
      no: {
        en: 'You reported not currently using glasses or contact lenses.',
        hi: 'आपने वर्तमान में चश्मा या कॉन्टैक्ट लेंस उपयोग नहीं करने की बात बताई।',
      },
    },
  },

  glasses_age: {
    group: 'eyeCare',
    question: {
      en: 'Age of current prescription',
      hi: 'वर्तमान चश्मे के प्रिस्क्रिप्शन की अवधि',
    },
    notes: {
      recent: {
        en: 'You reported that your current prescription is less than one year old.',
        hi: 'आपने बताया कि आपका वर्तमान प्रिस्क्रिप्शन एक वर्ष से कम पुराना है।',
      },
      old: {
        en: 'You reported that your current prescription is one to two years old.',
        hi: 'आपने बताया कि आपका वर्तमान प्रिस्क्रिप्शन एक से दो वर्ष पुराना है।',
      },
      very_old: {
        en: 'You reported that your current prescription is more than two years old.',
        hi: 'आपने बताया कि आपका वर्तमान प्रिस्क्रिप्शन दो वर्ष से अधिक पुराना है।',
      },
      unknown: {
        en: 'You were unsure how old your current prescription is.',
        hi: 'आपको अपने वर्तमान प्रिस्क्रिप्शन की अवधि के बारे में निश्चित जानकारी नहीं थी।',
      },
    },
  },

  eye_exam: {
    group: 'eyeCare',
    question: {
      en: 'Previous professional eye examination',
      hi: 'पिछली पेशेवर आँखों की जाँच',
    },
    notes: {
      recent: {
        en: 'You reported having an eye examination within the last year.',
        hi: 'आपने पिछले एक वर्ष के भीतर आँखों की जाँच करवाने की बात बताई।',
      },
      old: {
        en: 'You reported that your last eye examination was one to three years ago.',
        hi: 'आपने बताया कि आपकी पिछली आँखों की जाँच एक से तीन वर्ष पहले हुई थी।',
      },
      very_old: {
        en: 'You reported that your last eye examination was more than three years ago.',
        hi: 'आपने बताया कि आपकी पिछली आँखों की जाँच तीन वर्ष से अधिक पहले हुई थी।',
      },
      never: {
        en: 'You reported that you have never had a professional eye examination.',
        hi: 'आपने बताया कि आपने कभी पेशेवर आँखों की जाँच नहीं करवाई।',
      },
    },
  },

  age_group: {
    group: 'eyeCare',
    question: {
      en: 'Age group',
      hi: 'आयु वर्ग',
    },
    notes: {},
  },
};

/**
 * Safely resolve bilingual strings or answer labels.
 */
function getLocalizedText(value, language, fallback = '') {
  if (value && typeof value === 'object') {
    return value[language] || value.en || fallback;
  }

  return typeof value === 'string' ? value : fallback;
}

function hasAnswer(value) {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Build one observation from an actual stored answer.
 */
function buildObservation(questionId, answer, definition) {
  const value = answer.value;

  const answerEnglish = getLocalizedText(
    answer.label,
    'en',
    String(value)
  );

  const answerHindi = getLocalizedText(
    answer.label,
    'hi',
    String(value)
  );

  const detail = definition.notes[value] || {
    en: `You selected: ${answerEnglish}.`,
    hi: `आपने यह विकल्प चुना: ${answerHindi}।`,
  };

  return {
    id: questionId,
    question: definition.question,
    answer: {
      en: answerEnglish,
      hi: answerHindi,
    },
    detail,
  };
}

/**
 * Build optional optician discussion topics.
 *
 * These are generated only from relevant questionnaire answers.
 * They do not determine a prescription or diagnose a condition.
 */
function buildDiscussionPoints(answers) {
  const points = [];

  const screenUse = answers.screen_hours?.value;

  if (screenUse === 'moderate' || screenUse === 'high') {
    points.push({
      id: 'screen_comfort',

      title: {
        en: 'Comfort during screen use',
        hi: 'स्क्रीन उपयोग के दौरान आराम',
      },

      context: {
        en: screenUse === 'high'
          ? 'You reported more than six hours of daily screen use.'
          : 'You reported two to six hours of daily screen use.',

        hi: screenUse === 'high'
          ? 'आपने प्रतिदिन छह घंटे से अधिक स्क्रीन उपयोग बताया।'
          : 'आपने प्रतिदिन दो से छह घंटे स्क्रीन उपयोग बताया।',
      },

      prompt: {
        en: 'Ask the optician about available lens options for your screen-related tasks and whether changes to your viewing setup may be useful. Screen time alone does not determine a lens prescription.',

        hi: 'अपने स्क्रीन से जुड़े काम के लिए उपलब्ध लेंस विकल्पों और देखने की व्यवस्था में उपयोगी बदलावों के बारे में ऑप्टिशियन से पूछें। केवल स्क्रीन उपयोग से लेंस का प्रिस्क्रिप्शन निर्धारित नहीं होता।',
      },

      icon: 'devices',
    });
  }

  const outdoorTime = answers.outdoor_time?.value;

  if (outdoorTime === 'moderate' || outdoorTime === 'high') {
    points.push({
      id: 'outdoor_protection',

      title: {
        en: 'Outdoor eyewear options',
        hi: 'बाहर उपयोग के लिए चश्मे के विकल्प',
      },

      context: {
        en: outdoorTime === 'high'
          ? 'You reported spending most of your day outdoors.'
          : 'You reported spending a few hours outdoors.',

        hi: outdoorTime === 'high'
          ? 'आपने दिन का अधिकांश समय बाहर बिताने की बात बताई।'
          : 'आपने कुछ घंटे बाहर बिताने की बात बताई।',
      },

      prompt: {
        en: 'Ask about suitable UV-protective eyewear and whether photochromic lenses would fit your everyday activities. Check product specifications and intended uses with the optician.',

        hi: 'उपयुक्त UV-सुरक्षा वाले चश्मे और फोटोक्रोमिक लेंस आपकी दैनिक गतिविधियों के लिए सही हैं या नहीं, इस बारे में पूछें। ऑप्टिशियन से उत्पाद की विशेषताओं और उपयोग की जानकारी लें।',
      },

      icon: 'wb_sunny',
    });
  }

  if (answers.close_work?.value === 'daily') {
    points.push({
      id: 'near_work',

      title: {
        en: 'Comfort during close-up work',
        hi: 'पास से काम करते समय आराम',
      },

      context: {
        en: 'You reported doing close-up activities for several hours daily.',
        hi: 'आपने प्रतिदिन कई घंटे पास से किए जाने वाले काम करने की बात बताई।',
      },

      prompt: {
        en: 'Explain the types of close-up tasks you do and their typical working distance. Ask the eye-care professional whether any lens options are relevant after an appropriate examination.',

        hi: 'अपने पास के काम और काम करते समय सामान्य दूरी के बारे में बताएं। उचित जाँच के बाद कौन से लेंस विकल्प उपयुक्त हो सकते हैं, इस बारे में नेत्र देखभाल पेशेवर से पूछें।',
      },

      icon: 'menu_book',
    });
  }

  const prescriptionNeedsReview = [
    'old',
    'very_old',
    'unknown',
  ].includes(answers.glasses_age?.value);

  if (prescriptionNeedsReview) {
    points.push({
      id: 'prescription_review',

      title: {
        en: 'Review of current prescription',
        hi: 'वर्तमान प्रिस्क्रिप्शन की समीक्षा',
      },

      context: {
        en: 'You reported that your current prescription is not recent or that its age is unknown.',

        hi: 'आपने बताया कि आपका वर्तमान प्रिस्क्रिप्शन नया नहीं है या उसकी अवधि ज्ञात नहीं है।',
      },

      prompt: {
        en: 'Discuss your current prescription and ask whether a professional eye examination or prescription review is appropriate.',

        hi: 'अपने वर्तमान प्रिस्क्रिप्शन के बारे में चर्चा करें और पूछें कि पेशेवर आँखों की जाँच या प्रिस्क्रिप्शन की समीक्षा उचित होगी या नहीं।',
      },

      icon: 'description',
    });
  }

  return points;
}

/**
 * Build neutral follow-up notes from reported experiences.
 */
function buildFollowUpNotes(answers) {
  const notes = [];

  const reportedVisionExperiences = [
    ['blurred_vision', ['yes', 'sometimes']],
    ['headaches', ['often', 'sometimes']],
    ['squinting', ['yes', 'sometimes']],
    ['night_vision', ['yes', 'sometimes']],
  ].some(([questionId, values]) =>
    values.includes(answers[questionId]?.value)
  );

  if (reportedVisionExperiences) {
    notes.push({
      id: 'reported_experiences',

      title: {
        en: 'Share your reported vision experiences',
        hi: 'अपने बताए गए दृष्टि संबंधी अनुभव साझा करें',
      },

      detail: {
        en: 'You reported one or more vision-related experiences in this questionnaire. Consider sharing these responses with a qualified eye-care professional. This tool cannot determine their cause or urgency.',

        hi: 'आपने इस प्रश्नावली में दृष्टि से जुड़े एक या अधिक अनुभव बताए हैं। इन जवाबों को किसी योग्य नेत्र देखभाल पेशेवर के साथ साझा करने पर विचार करें। यह टूल इनके कारण या तात्कालिकता का निर्धारण नहीं कर सकता।',
      },
    });
  }

  if (answers.eye_exam?.value === 'never') {
    notes.push({
      id: 'no_previous_exam',

      title: {
        en: 'Professional eye examination history',
        hi: 'पेशेवर आँखों की जाँच का इतिहास',
      },

      detail: {
        en: 'You reported never having a professional eye examination. Ask an eye-care professional about arranging an appropriate examination.',

        hi: 'आपने बताया कि आपने कभी पेशेवर आँखों की जाँच नहीं करवाई। उचित जाँच की व्यवस्था के बारे में नेत्र देखभाल पेशेवर से पूछें।',
      },
    });
  } else if (
    answers.eye_exam?.value === 'old' ||
    answers.eye_exam?.value === 'very_old'
  ) {
    notes.push({
      id: 'previous_exam',

      title: {
        en: 'Previous eye examination',
        hi: 'पिछली आँखों की जाँच',
      },

      detail: {
        en: 'You reported that your last professional eye examination was more than a year ago. Ask an eye-care professional when your next examination would be appropriate.',

        hi: 'आपने बताया कि आपकी पिछली पेशेवर आँखों की जाँच एक वर्ष से अधिक पहले हुई थी। अगली जाँच कब उचित होगी, इस बारे में नेत्र देखभाल पेशेवर से पूछें।',
      },
    });
  }

  return notes;
}

/**
 * Main public API.
 *
 * @param {Record<string, {value: string, label?: object}>} answers
 *
 * @returns {{
 *   answeredCount: number,
 *   groups: Array,
 *   discussionPoints: Array,
 *   followUpNotes: Array
 * }}
 */
export function evaluateAnswers(answers = {}) {
  const safeAnswers =
    answers && typeof answers === 'object' ? answers : {};

  const groups = GROUPS.map((group) => {
    const observations = Object.entries(OBSERVATION_DEFINITIONS)
      .filter(([questionId, definition]) => {
        return (
          definition.group === group.id &&
          hasAnswer(safeAnswers[questionId]?.value)
        );
      })
      .map(([questionId, definition]) => {
        return buildObservation(
          questionId,
          safeAnswers[questionId],
          definition
        );
      });

    return {
      ...group,
      observations,
    };
  }).filter((group) => group.observations.length > 0);

  const answeredCount = Object.values(safeAnswers).filter(
    (answer) => answer && hasAnswer(answer.value)
  ).length;

  return {
    answeredCount,
    groups,
    discussionPoints: buildDiscussionPoints(safeAnswers),
    followUpNotes: buildFollowUpNotes(safeAnswers),
  };
}

export default evaluateAnswers;

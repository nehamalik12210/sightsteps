/**
 * SightSteps Rule Engine
 *
 * 12-signal weighted scoring system with explainability.
 * Each rule maps answer patterns → signal scores.
 * Scores are categorized into: refractive, lifestyle, awareness.
 *
 * Heatmap denominator = max possible score for questions ACTUALLY ASKED
 * (not all questions — respects branching).
 */

// --- Signal Rules ---
const rules = [
  // REFRACTIVE signals
  {
    id: 'blur_present',
    category: 'refractive',
    maxPoints: 3,
    evaluate: (a) => {
      if (a.blurred_vision?.value === 'yes') return { score: 3, reason: { en: 'Reports blurred vision', hi: 'धुंधला दिखाई देता है' } };
      if (a.blurred_vision?.value === 'sometimes') return { score: 1, reason: { en: 'Occasional blurred vision', hi: 'कभी-कभी धुंधला दिखता है' } };
      return { score: 0, reason: { en: 'No blurred vision reported', hi: 'धुंधलापन नहीं' } };
    },
  },
  {
    id: 'blur_type',
    category: 'refractive',
    maxPoints: 2,
    appliesIf: (a) => a.blur_distance, // only scored if question was shown
    evaluate: (a) => {
      if (a.blur_distance?.value === 'both') return { score: 2, reason: { en: 'Blur at both near and far distances', hi: 'पास और दूर दोनों में धुंधलापन' } };
      if (a.blur_distance?.value === 'near') return { score: 1, reason: { en: 'Near vision blur', hi: 'पास की दृष्टि में धुंधलापन' } };
      if (a.blur_distance?.value === 'far') return { score: 1, reason: { en: 'Distance vision blur', hi: 'दूर की दृष्टि में धुंधलापन' } };
      return { score: 0, reason: { en: 'No specific blur pattern', hi: 'कोई विशेष धुंधलापन नहीं' } };
    },
  },
  {
    id: 'headache_signal',
    category: 'refractive',
    maxPoints: 2,
    evaluate: (a) => {
      if (a.headaches?.value === 'often') return { score: 2, reason: { en: 'Frequent headaches with visual tasks', hi: 'पढ़ने/स्क्रीन के बाद अक्सर सिरदर्द' } };
      if (a.headaches?.value === 'sometimes') return { score: 1, reason: { en: 'Occasional headaches with visual tasks', hi: 'कभी-कभी सिरदर्द' } };
      return { score: 0, reason: { en: 'No vision-related headaches', hi: 'दृष्टि संबंधी सिरदर्द नहीं' } };
    },
  },
  {
    id: 'squint_signal',
    category: 'refractive',
    maxPoints: 2,
    evaluate: (a) => {
      if (a.squinting?.value === 'yes') return { score: 2, reason: { en: 'Frequently squints to see clearly', hi: 'साफ देखने के लिए अक्सर आँखें सिकोड़ते हैं' } };
      if (a.squinting?.value === 'sometimes') return { score: 1, reason: { en: 'Sometimes squints', hi: 'कभी-कभी आँखें सिकोड़ते हैं' } };
      return { score: 0, reason: { en: 'Does not squint', hi: 'आँखें नहीं सिकोड़ते' } };
    },
  },
  {
    id: 'night_difficulty',
    category: 'refractive',
    maxPoints: 1,
    evaluate: (a) => {
      if (a.night_vision?.value === 'yes') return { score: 1, reason: { en: 'Difficulty seeing at night', hi: 'रात में देखने में दिक्कत' } };
      return { score: 0, reason: { en: 'No night vision issues', hi: 'रात की दृष्टि ठीक' } };
    },
  },

  // LIFESTYLE signals
  {
    id: 'screen_exposure',
    category: 'lifestyle',
    maxPoints: 2,
    evaluate: (a) => {
      if (a.screen_hours?.value === 'high') return { score: 2, reason: { en: 'Heavy screen usage (6+ hours)', hi: '6+ घंटे स्क्रीन पर' } };
      if (a.screen_hours?.value === 'moderate') return { score: 1, reason: { en: 'Moderate screen usage (2–6 hours)', hi: '2–6 घंटे स्क्रीन पर' } };
      return { score: 0, reason: { en: 'Low screen usage', hi: 'कम स्क्रीन उपयोग' } };
    },
  },
  {
    id: 'outdoor_exposure',
    category: 'lifestyle',
    maxPoints: 2,
    evaluate: (a) => {
      if (a.outdoor_time?.value === 'high') return { score: 2, reason: { en: 'High outdoor/sunlight exposure', hi: 'धूप में ज़्यादा समय' } };
      if (a.outdoor_time?.value === 'moderate') return { score: 1, reason: { en: 'Moderate outdoor exposure', hi: 'कुछ समय बाहर' } };
      return { score: 0, reason: { en: 'Minimal outdoor exposure', hi: 'बहुत कम बाहर' } };
    },
  },
  {
    id: 'close_work_strain',
    category: 'lifestyle',
    maxPoints: 2,
    evaluate: (a) => {
      if (a.close_work?.value === 'daily') return { score: 2, reason: { en: 'Daily close-up work for hours', hi: 'रोज़ घंटों पास का काम' } };
      if (a.close_work?.value === 'sometimes') return { score: 1, reason: { en: 'Occasional close-up work', hi: 'कभी-कभी पास का काम' } };
      return { score: 0, reason: { en: 'Minimal close-up work', hi: 'पास का काम बहुत कम' } };
    },
  },

  // AWARENESS signals
  {
    id: 'correction_status',
    category: 'awareness',
    maxPoints: 2,
    evaluate: (a) => {
      if (a.existing_glasses?.value === 'no') return { score: 2, reason: { en: 'No current vision correction', hi: 'अभी कोई चश्मा नहीं' } };
      return { score: 0, reason: { en: 'Currently uses vision correction', hi: 'चश्मा/लेंस पहनते हैं' } };
    },
  },
  {
    id: 'prescription_age',
    category: 'awareness',
    maxPoints: 2,
    appliesIf: (a) => a.glasses_age, // conditional question
    evaluate: (a) => {
      if (a.glasses_age?.value === 'very_old') return { score: 2, reason: { en: 'Prescription over 2 years old', hi: 'चश्मा 2 साल से पुराना' } };
      if (a.glasses_age?.value === 'old') return { score: 1, reason: { en: 'Prescription 1–2 years old', hi: 'चश्मा 1–2 साल पुराना' } };
      return { score: 0, reason: { en: 'Recent prescription', hi: 'नया चश्मा' } };
    },
  },
  {
    id: 'exam_recency',
    category: 'awareness',
    maxPoints: 3,
    evaluate: (a) => {
      if (a.eye_exam?.value === 'never') return { score: 3, reason: { en: 'Never had a professional eye exam', hi: 'कभी आँखों की जाँच नहीं हुई' } };
      if (a.eye_exam?.value === 'very_old') return { score: 2, reason: { en: 'Last eye exam over 3 years ago', hi: 'आखिरी जाँच 3+ साल पहले' } };
      if (a.eye_exam?.value === 'old') return { score: 1, reason: { en: 'Last eye exam 1–3 years ago', hi: 'आखिरी जाँच 1–3 साल पहले' } };
      return { score: 0, reason: { en: 'Recent eye exam', hi: 'हाल की जाँच' } };
    },
  },
  {
    id: 'age_risk',
    category: 'awareness',
    maxPoints: 2,
    evaluate: (a) => {
      if (a.age_group?.value === 'senior') return { score: 2, reason: { en: 'Age 55+ — higher risk for presbyopia and cataracts', hi: '55+ उम्र — प्रेस्बायोपिया और मोतियाबिंद का जोखिम' } };
      if (a.age_group?.value === 'middle') return { score: 1, reason: { en: 'Age 40–55 — presbyopia likely developing', hi: '40–55 उम्र — प्रेस्बायोपिया संभव' } };
      return { score: 0, reason: { en: 'Lower age-related risk', hi: 'उम्र संबंधी जोखिम कम' } };
    },
  },
];

/**
 * Run the rule engine on a set of answers.
 * Returns category scores, individual signals, recommendations, and urgency.
 */
export function evaluateAnswers(answers) {
  const signals = [];
  const categories = {
    refractive: { score: 0, max: 0, signals: [] },
    lifestyle: { score: 0, max: 0, signals: [] },
    awareness: { score: 0, max: 0, signals: [] },
  };

  for (const rule of rules) {
    // Skip rules for conditional questions that weren't shown
    if (rule.appliesIf && !rule.appliesIf(answers)) continue;

    const result = rule.evaluate(answers);
    const signal = {
      id: rule.id,
      category: rule.category,
      score: result.score,
      maxPoints: rule.maxPoints,
      reason: result.reason,
    };

    signals.push(signal);
    categories[rule.category].score += result.score;
    categories[rule.category].max += rule.maxPoints;
    categories[rule.category].signals.push(signal);
  }

  const totalScore = Object.values(categories).reduce((s, c) => s + c.score, 0);
  const totalMax = Object.values(categories).reduce((s, c) => s + c.max, 0);

  const recommendations = generateRecommendations(answers, categories, signals);
  const urgency = determineUrgency(answers, categories, totalScore, totalMax);

  return {
    categories,
    signals,
    totalScore,
    totalMax,
    recommendations,
    urgency,
  };
}

/**
 * Generate lens recommendations based on signals.
 */
function generateRecommendations(answers, categories, signals) {
  const recs = [];

  // Blue light filtering
  if (answers.screen_hours?.value === 'high' || answers.screen_hours?.value === 'moderate') {
    recs.push({
      id: 'blue_light',
      title: { en: 'Blue Light Filter Lenses', hi: 'ब्लू लाइट फ़िल्टर लेंस' },
      icon: 'filter_b_and_w',
      reason: {
        en: `Based on ${answers.screen_hours?.value === 'high' ? 'heavy' : 'moderate'} screen usage`,
        hi: `${answers.screen_hours?.value === 'high' ? 'ज़्यादा' : 'मध्यम'} स्क्रीन उपयोग के आधार पर`,
      },
      why: {
        en: 'Blue light from screens can cause digital eye strain, disrupted sleep, and long-term retinal stress.',
        hi: 'स्क्रीन की नीली रोशनी से डिजिटल आई स्ट्रेन, नींद में बाधा, और रेटिना पर तनाव हो सकता है।',
      },
      priority: answers.screen_hours?.value === 'high' ? 'high' : 'medium',
    });
  }

  // Photochromic / UV protection
  if (answers.outdoor_time?.value === 'high' || answers.outdoor_time?.value === 'moderate') {
    recs.push({
      id: 'photochromic',
      title: { en: 'Photochromic Lenses', hi: 'फ़ोटोक्रोमिक लेंस' },
      icon: 'contrast',
      reason: {
        en: `Based on ${answers.outdoor_time?.value === 'high' ? 'significant' : 'moderate'} outdoor time`,
        hi: `${answers.outdoor_time?.value === 'high' ? 'ज़्यादा' : 'कुछ'} बाहरी समय के आधार पर`,
      },
      why: {
        en: 'Photochromic lenses darken in sunlight, protecting against UV damage and reducing glare without needing separate sunglasses.',
        hi: 'फ़ोटोक्रोमिक लेंस धूप में काले हो जाते हैं, UV से बचाते हैं, और अलग सनग्लास की ज़रूरत नहीं।',
      },
      priority: answers.outdoor_time?.value === 'high' ? 'high' : 'medium',
    });
  }

  // Anti-fatigue / reading lenses
  if (answers.close_work?.value === 'daily' || (answers.age_group?.value === 'middle' || answers.age_group?.value === 'senior')) {
    recs.push({
      id: 'anti_fatigue',
      title: { en: 'Anti-Fatigue / Reading Lenses', hi: 'एंटी-फ़ैटीग / पढ़ने के लेंस' },
      icon: 'menu_book',
      reason: {
        en: answers.close_work?.value === 'daily'
          ? 'Based on daily close-up work and near blur'
          : 'Based on age group — presbyopia support',
        hi: answers.close_work?.value === 'daily'
          ? 'रोज़ पास के काम और पास के धुंधलेपन के आधार पर'
          : 'उम्र के आधार पर — प्रेस्बायोपिया सहायता',
      },
      why: {
        en: 'Anti-fatigue lenses have a slight power gradient that eases focus strain during prolonged near-work.',
        hi: 'एंटी-फ़ैटीग लेंस में हल्का पावर ग्रेडिएंट होता है जो लंबे समय तक पास के काम में आँखों पर ज़ोर कम करता है।',
      },
      priority: 'high',
    });
  }

  // Anti-glare
  if (answers.night_vision?.value === 'yes' || answers.headaches?.value === 'often') {
    recs.push({
      id: 'anti_glare',
      title: { en: 'Anti-Glare Coating', hi: 'एंटी-ग्लेयर कोटिंग' },
      icon: 'auto_awesome',
      reason: {
        en: 'Based on night vision difficulty and/or frequent headaches',
        hi: 'रात की दृष्टि की दिक्कत और/या बार-बार सिरदर्द के आधार पर',
      },
      why: {
        en: 'Anti-glare coating reduces reflections from artificial light, easing eye strain and improving clarity at night.',
        hi: 'एंटी-ग्लेयर कोटिंग कृत्रिम रोशनी के रिफ्लेक्शन कम करता है, रात में स्पष्टता बढ़ाता है।',
      },
      priority: 'medium',
    });
  }

  // Scratch resistance (always a safe recommendation)
  if (answers.close_work?.value === 'daily' || answers.outdoor_time?.value === 'high') {
    recs.push({
      id: 'scratch_resistant',
      title: { en: 'Scratch-Resistant Coating', hi: 'स्क्रैच-रेसिस्टेंट कोटिंग' },
      icon: 'shield',
      reason: {
        en: 'Based on active work environment',
        hi: 'सक्रिय कार्य वातावरण के आधार पर',
      },
      why: {
        en: 'Scratch-resistant coating extends lens life, especially for active lifestyles or dusty environments.',
        hi: 'स्क्रैच-रेसिस्टेंट कोटिंग लेंस की उम्र बढ़ाता है, खासकर सक्रिय या धूल भरे वातावरण में।',
      },
      priority: 'low',
    });
  }

  return recs.sort((a, b) => {
    const p = { high: 3, medium: 2, low: 1 };
    return (p[b.priority] || 0) - (p[a.priority] || 0);
  });
}

/**
 * Determine urgency of professional eye exam.
 */
function determineUrgency(answers, categories, totalScore, totalMax) {
  const percentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

  // High urgency triggers
  if (
    answers.eye_exam?.value === 'never' ||
    answers.blurred_vision?.value === 'yes' && answers.existing_glasses?.value === 'no' ||
    percentage >= 60
  ) {
    return {
      level: 'high',
      reason: {
        en: answers.eye_exam?.value === 'never'
          ? 'No prior eye exam on record — a professional examination is strongly recommended'
          : 'Multiple vision signals suggest a professional examination is needed soon',
        hi: answers.eye_exam?.value === 'never'
          ? 'कभी आँखों की जाँच नहीं हुई — पेशेवर जाँच की सिफ़ारिश है'
          : 'कई दृष्टि संकेत बताते हैं कि जल्द पेशेवर जाँच ज़रूरी है',
      },
    };
  }

  // Medium urgency
  if (percentage >= 35) {
    return {
      level: 'medium',
      reason: {
        en: 'Some vision concerns were identified — consider an eye exam within 6 months',
        hi: 'कुछ दृष्टि चिंताएं पाई गईं — 6 महीने में आँखों की जाँच करवाएं',
      },
    };
  }

  // Low urgency
  return {
    level: 'low',
    reason: {
      en: 'No significant concerns — maintain regular check-up schedule',
      hi: 'कोई बड़ी चिंता नहीं — नियमित जाँच जारी रखें',
    },
  };
}

export default rules;


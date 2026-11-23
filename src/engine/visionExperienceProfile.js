/**
 * Build an explainable, participant-reported everyday vision experience profile.
 *
 * This module connects existing questionnaire answers and participant-entered
 * timeline records. It does not measure visual performance, infer a diagnosis,
 * score severity or determine clinical urgency.
 */
import { getReportedExperienceOptions } from '../data/questions.js';
import { normalizeVisionTimelineEntries } from '../utils/visionTimeline.js';

const ACTIVITY_LABELS = {
  screen_work: { en: 'Screen work', hi: 'स्क्रीन पर काम' },
  reading: { en: 'Reading and study', hi: 'पढ़ाई और अध्ययन' },
  fine_detail: { en: 'Fine-detail work and crafts', hi: 'बारीक काम और दस्तकारी' },
  driving: { en: 'Driving and travel', hi: 'ड्राइविंग और यात्रा' },
  outdoor: { en: 'Outdoor activities', hi: 'बाहरी गतिविधियाँ' },
  other: { en: 'Other activities', hi: 'अन्य गतिविधियाँ' },
};

const CONTEXT_LABELS = {
  near_tasks: { en: 'Reading or other near tasks', hi: 'पढ़ना या पास के काम' },
  distance_tasks: { en: 'Looking at distant objects', hi: 'दूर की वस्तुएँ देखना' },
  screens: { en: 'Using screens', hi: 'स्क्रीन का उपयोग' },
  low_light: { en: 'Low-light situations', hi: 'कम रोशनी की स्थिति' },
  outdoors: { en: 'Outdoors or bright conditions', hi: 'बाहर या तेज़ रोशनी में' },
  driving: { en: 'Driving or travelling', hi: 'ड्राइविंग या यात्रा' },
  varies: { en: 'It varies or has no clear pattern', hi: 'यह अलग-अलग होता है या कोई स्पष्ट पैटर्न नहीं है' },
};

const IMPACT_LABELS = {
  takes_longer: { en: 'It takes longer than usual', hi: 'इसमें सामान्य से अधिक समय लगता है' },
  discomfort: { en: 'Discomfort', hi: 'असहजता' },
  avoid_stop: { en: 'Avoiding or stopping the activity', hi: 'गतिविधि टालना या रोकना' },
  adjustments: { en: 'Adjusting distance, lighting or position', hi: 'दूरी, रोशनी या स्थिति बदलना' },
  other: { en: 'Another impact', hi: 'अन्य प्रभाव' },
};

function safeValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function localizedLabel(label, fallback = null) {
  if (typeof label === 'string' && label.trim()) {
    return { en: label.trim(), hi: label.trim() };
  }
  if (label && typeof label === 'object' && !Array.isArray(label)) {
    const en = safeValue(label.en) || safeValue(label.hi);
    const hi = safeValue(label.hi) || safeValue(label.en);
    if (en || hi) return { en: en || hi, hi: hi || en };
  }
  return fallback;
}

function answerLabel(answers, key, fallback = null) {
  return localizedLabel(answers?.[key]?.label, fallback);
}

function presentSourceIds(answers, ids) {
  return ids.filter((id) => (
    answers?.[id]
    && answers[id].value !== undefined
    && answers[id].value !== null
  ));
}

function buildMainExperience(answers, reportedExperiences) {
  const mainId = safeValue(answers?.primary_concern?.value);
  if (!mainId) return null;

  const selected = reportedExperiences.find((item) => item.value === mainId);
  // A stale primary selection must not override the participant's current answer.
  if (!selected) return null;

  const contextValues = Array.isArray(answers?.experience_context?.value)
    ? answers.experience_context.value.filter((value) => typeof value === 'string')
    : [];
  const contexts = contextValues.map((id) => ({
    id,
    label: CONTEXT_LABELS[id] || { en: id, hi: id },
  }));
  const sources = presentSourceIds(answers, [
    'primary_concern',
    mainId,
    'experience_onset',
    'experience_change',
    'experience_frequency',
    'experience_context',
    ...(mainId === 'headaches' ? [] : ['which_eye']),
  ]);

  const mainLabel = localizedLabel(selected.label, answerLabel(answers, mainId));
  const onset = answerLabel(answers, 'experience_onset');
  const change = answerLabel(answers, 'experience_change');
  const frequency = answerLabel(answers, 'experience_frequency');
  const eye = mainId === 'headaches' ? null : answerLabel(answers, 'which_eye');

  const buildNarrative = (language) => {
    const label = mainLabel?.[language];
    if (!label) return '';
    if (language === 'hi') {
      const parts = [`आपने ${label} को उस मुख्य अनुभव के रूप में चुना जिस पर आप चर्चा करना चाहते हैं।`];
      if (onset?.hi) parts.push(`आपने इसे पहली बार ${onset.hi.toLowerCase()} महसूस किया।`);
      if (change?.hi) parts.push(`समय के साथ बदलाव के बारे में आपने यह बताया: ${change.hi}।`);
      if (frequency?.hi) parts.push(`आपने बताया कि यह कितनी बार महसूस होता है: ${frequency.hi}।`);
      if (contexts.length) {
        parts.push(`आपने ये परिस्थितियाँ चुनीं: ${contexts.map((item) => item.label.hi).join(', ')}।`);
      }
      if (eye?.hi) parts.push(`आपने बताया कि यह ${eye.hi} में महसूस होता है।`);
      return parts.join(' ');
    }

    const parts = [`You selected ${label.toLowerCase()} as the main experience you would like to discuss.`];
    if (onset?.en) parts.push(`You first noticed it ${onset.en.toLowerCase()}.`);
    if (change?.en) parts.push(`You described its change over time as: ${change.en.toLowerCase()}.`);
    if (frequency?.en) parts.push(`You said you notice it: ${frequency.en.toLowerCase()}.`);
    if (contexts.length) {
      parts.push(`You selected these situations: ${contexts.map((item) => item.label.en).join(', ')}.`);
    }
    if (eye?.en) parts.push(`You said it is noticed in ${eye.en.toLowerCase()}.`);
    return parts.join(' ');
  };

  return {
    id: mainId,
    label: mainLabel,
    eye,
    onset,
    change,
    frequency,
    contexts,
    sourceIds: sources,
    narrative: {
      en: buildNarrative('en'),
      hi: buildNarrative('hi'),
    },
  };
}

function buildAdditionalExperiences(reportedExperiences, mainId, answers) {
  return reportedExperiences
    .filter((item) => item.value !== mainId)
    .map((item) => ({
      id: item.value,
      label: localizedLabel(item.label),
      answer: answerLabel(answers, item.value, localizedLabel(item.label)),
      sourceIds: presentSourceIds(answers, [item.value]),
    }));
}

function buildActivityImpacts(answers) {
  const selected = Array.isArray(answers?.affected_activities?.value)
    ? answers.affected_activities.value
    : [];

  return selected
    .filter((activityId) => Object.prototype.hasOwnProperty.call(ACTIVITY_LABELS, activityId))
    .map((activityId) => {
      const impactKey = `activity_impact_${activityId}`;
      const frequencyKey = `activity_impact_frequency_${activityId}`;
      const rawImpacts = Array.isArray(answers?.[impactKey]?.value)
        ? answers[impactKey].value.filter((value) => typeof value === 'string')
        : [];
      const impacts = rawImpacts
        .filter((value) => !['none', 'unsure'].includes(value))
        .map((id) => ({ id, label: IMPACT_LABELS[id] || { en: id, hi: id } }));
      const noImpactReported = rawImpacts.includes('none');
      const unsure = rawImpacts.includes('unsure');
      const impactStatus = impacts.length
        ? 'reported'
        : noImpactReported
          ? 'no_impact_reported'
          : unsure
            ? 'unsure'
            : 'not_recorded';
      const frequency = answerLabel(answers, frequencyKey);
      const sources = presentSourceIds(answers, [
        'affected_activities',
        impactKey,
        ...(frequency ? [frequencyKey] : []),
      ]);

      const summary = {
        en: impactStatus === 'reported'
          ? `For ${ACTIVITY_LABELS[activityId].en.toLowerCase()}, you reported: ${impacts.map((item) => item.label.en.toLowerCase()).join(', ')}.${frequency?.en ? ` You notice this impact ${frequency.en.toLowerCase()}.` : ''}`
          : impactStatus === 'no_impact_reported'
            ? `You selected ${ACTIVITY_LABELS[activityId].en.toLowerCase()} and reported no impact for this activity.`
            : impactStatus === 'unsure'
              ? `You selected ${ACTIVITY_LABELS[activityId].en.toLowerCase()} but were unsure how to describe the impact.`
              : `You selected ${ACTIVITY_LABELS[activityId].en.toLowerCase()}; no impact details were recorded.`,
        hi: impactStatus === 'reported'
          ? `${ACTIVITY_LABELS[activityId].hi} में आपने यह बताया: ${impacts.map((item) => item.label.hi).join(', ')}।${frequency?.hi ? ` आपने यह प्रभाव ${frequency.hi.toLowerCase()} महसूस होने की बात बताई।` : ''}`
          : impactStatus === 'no_impact_reported'
            ? `आपने ${ACTIVITY_LABELS[activityId].hi} चुना और बताया कि इस गतिविधि पर कोई प्रभाव महसूस नहीं होता।`
            : impactStatus === 'unsure'
              ? `आपने ${ACTIVITY_LABELS[activityId].hi} चुना, लेकिन प्रभाव का वर्णन करने को लेकर अनिश्चितता बताई।`
              : `आपने ${ACTIVITY_LABELS[activityId].hi} चुना; प्रभाव का विवरण दर्ज नहीं किया गया।`,
      };

      return {
        activityId,
        label: ACTIVITY_LABELS[activityId],
        impacts,
        frequency,
        impactStatus,
        summary,
        sourceIds: sources,
      };
    });
}

function buildConnections(mainExperience, activityImpacts) {
  if (!mainExperience || activityImpacts.length === 0) return null;
  const activityLabels = activityImpacts.map((item) => item.label);
  const contexts = mainExperience.contexts;

  return {
    contextCount: contexts.length,
    activityCount: activityImpacts.length,
    sourceIds: [...new Set([
      ...mainExperience.sourceIds,
      ...activityImpacts.flatMap((item) => item.sourceIds),
    ])],
    narrative: {
      en: [
        contexts.length
          ? `When describing ${mainExperience.label.en.toLowerCase()}, you selected ${contexts.map((item) => item.label.en).join(', ')} as situations where you notice it.`
          : '',
        `You also identified ${activityLabels.map((item) => item.en.toLowerCase()).join(', ')} as everyday activities that feel affected by the experience you reported.`,
      ].filter(Boolean).join(' '),
      hi: [
        contexts.length
          ? `${mainExperience.label.hi} के बारे में बताते हुए, आपने ${contexts.map((item) => item.label.hi).join(', ')} को ऐसी परिस्थितियों के रूप में चुना जहाँ यह महसूस होता है।`
          : '',
        `आपने ${activityLabels.map((item) => item.hi).join(', ')} को ऐसी रोज़मर्रा की गतिविधियों के रूप में भी चुना जो आपके बताए अनुभव से प्रभावित महसूस होती हैं।`,
      ].filter(Boolean).join(' '),
    },
  };
}

/**
 * @param {object} answers Existing questionnaire answers from AppContext.
 * @param {Array} timelineEntries Participant-authored timeline entries.
 * @returns {object} Bilingual, traceable profile with no clinical score.
 */
export function buildVisionExperienceProfile(answers = {}, timelineEntries = []) {
  const safeAnswers = answers && typeof answers === 'object' && !Array.isArray(answers)
    ? answers
    : {};
  const reportedExperiences = getReportedExperienceOptions(safeAnswers);
  const mainExperience = buildMainExperience(safeAnswers, reportedExperiences);
  const activeMainId = mainExperience?.id || null;
  const activityImpacts = buildActivityImpacts(safeAnswers);
  const timeline = normalizeVisionTimelineEntries(timelineEntries);
  const mainExperienceTimelineEntries = activeMainId
    ? timeline.filter((entry) => entry.experienceId === activeMainId)
    : [];

  return {
    mainExperience,
    additionalExperiences: buildAdditionalExperiences(reportedExperiences, activeMainId, safeAnswers),
    activityImpacts,
    connections: buildConnections(mainExperience, activityImpacts),
    timeline: {
      entries: timeline,
      totalEntries: timeline.length,
      mainExperienceEntryIds: mainExperienceTimelineEntries.map((entry) => entry.id),
      mainExperienceEntryCount: mainExperienceTimelineEntries.length,
    },
    hasReportedExperience: reportedExperiences.length > 0,
    hasActivityImpact: activityImpacts.length > 0,
    hasTimelineEntries: timeline.length > 0,
    limitations: {
      participantReportedOnly: true,
      usesClinicalScoring: false,
      measuresVisualPerformance: false,
      establishesDiagnosis: false,
    },
  };
}


function profileValue(value, language) {
  if (value && typeof value === 'object') return value[language] || value.en || value.hi || '';
  return typeof value === 'string' ? value : '';
}

function truncateSummary(value, limit) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  const clipped = text.slice(0, Math.max(0, limit - 1));
  const lastSpace = clipped.lastIndexOf(' ');
  return (lastSpace > Math.floor(limit * 0.7) ? clipped.slice(0, lastSpace) : clipped).trimEnd() + '…';
}

/**
 * Build a short, factual headline from the same participant-reported profile.
 * The brief and appointment pack use this formatter to avoid separate summaries.
 */
export function buildCompactExperienceSummary(profile, language = 'en', maxLength = 360, maxActivities = 3) {
  if (!profile || typeof profile !== 'object') return '';
  const hi = language === 'hi';
  const parts = [];
  const main = profile.mainExperience;

  if (main) {
    const label = profileValue(main.label, language);
    if (label) {
      const details = [];
      const onset = profileValue(main.onset, language);
      const change = profileValue(main.change, language);
      const frequency = profileValue(main.frequency, language);
      const eye = profileValue(main.eye, language);
      if (onset) details.push(hi ? `पहली बार: ${onset}` : `first noticed ${onset}`);
      if (change) details.push(hi ? `समय के साथ बदलाव: ${change}` : `change over time: ${change}`);
      if (frequency) details.push(hi ? `आवृत्ति: ${frequency}` : `frequency: ${frequency}`);
      if (eye) details.push(hi ? `आँख: ${eye}` : `eye: ${eye}`);
      parts.push(hi
        ? `मुख्य बताया गया अनुभव: ${label}${details.length ? `; ${details.join('; ')}` : ''}।`
        : `Main reported experience: ${label}${details.length ? `; ${details.join('; ')}` : ''}.`);

      const contexts = (main.contexts || [])
        .map((item) => profileValue(item.label, language))
        .filter(Boolean);
      if (contexts.length) {
        parts.push(hi
          ? `बताई गई परिस्थितियाँ: ${contexts.join(', ')}।`
          : `Reported situations: ${contexts.join(', ')}.`);
      }
    }
  }

  const activityItems = (Array.isArray(profile.activityImpacts) ? profile.activityImpacts : [])
    .slice(0, Math.max(0, maxActivities))
    .map((item) => {
      const activity = profileValue(item.label, language);
      const impacts = (item.impacts || [])
        .map((impact) => profileValue(impact.label, language))
        .filter(Boolean);
      const frequency = profileValue(item.frequency, language);
      const impactText = item.impactStatus === 'reported'
        ? impacts.join(', ')
        : item.impactStatus === 'no_impact_reported'
          ? (hi ? 'कोई प्रभाव नहीं बताया' : 'no impact reported')
          : item.impactStatus === 'unsure'
            ? (hi ? 'प्रभाव के बारे में अनिश्चित' : 'impact described as uncertain')
            : (hi ? 'प्रभाव का विवरण दर्ज नहीं' : 'impact details not recorded');
      if (!activity) return '';
      return `${activity}: ${impactText}${frequency ? ` (${frequency})` : ''}`;
    })
    .filter(Boolean);

  if (activityItems.length) {
    parts.push(hi
      ? `दैनिक गतिविधियों पर बताया गया प्रभाव: ${activityItems.join('; ')}।`
      : `Reported daily-activity impact: ${activityItems.join('; ')}.`);
  }

  if (!parts.length) {
    return hi ? 'कोई मुख्य अनुभव या गतिविधि-प्रभाव विवरण दर्ज नहीं है।' : 'No main experience or activity-impact details were recorded.';
  }
  return truncateSummary(parts.join(' '), maxLength);
}

export default buildVisionExperienceProfile;

/**
 * Build participant-visible, source-traceable vision evidence pathways.
 *
 * This is a deterministic explanation layer over existing participant answers
 * and participant-authored timeline entries. It creates one new relationship:
 * a context independently selected for two different experiences.
 *
 * Activity impacts are intentionally not linked to a specific experience here:
 * the current questionnaire stores them separately and does not establish that
 * relationship. Do not infer a link from similar wording alone.
 */
import { buildVisionExperienceProfile } from './visionExperienceProfile.js';
import { getSelectedAdditionalExperienceIds } from '../data/questions.js';

function localized(value, fallback = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const en = typeof value.en === 'string' ? value.en.trim() : '';
    const hi = typeof value.hi === 'string' ? value.hi.trim() : '';
    return { en: en || hi || fallback, hi: hi || en || fallback };
  }
  const text = typeof value === 'string' ? value.trim() : '';
  return { en: text || fallback, hi: text || fallback };
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()))];
}

function answerText(answer, fallback = '') {
  if (!answer || typeof answer !== 'object') return localized(fallback);
  if (answer.label && typeof answer.label === 'object') return localized(answer.label, fallback);
  if (typeof answer.label === 'string') return localized(answer.label, fallback);
  if (Array.isArray(answer.value)) return localized(answer.value.join(', '), fallback);
  if (typeof answer.value === 'string' || typeof answer.value === 'number') {
    return localized(String(answer.value), fallback);
  }
  return localized(fallback);
}

function hasAnswer(answers, id) {
  return Boolean(
    id
    && answers?.[id]
    && answers[id].value !== undefined
    && answers[id].value !== null
    && answers[id].value !== ''
    && !(Array.isArray(answers[id].value) && answers[id].value.length === 0),
  );
}

function sourceRecord(id, label, answers, fallback = '') {
  if (!hasAnswer(answers, id)) return null;
  return {
    id,
    label: localized(label),
    value: answerText(answers[id], fallback),
  };
}

function buildExperienceSources(experience, contextKey, contextLabels, answers, language) {
  const responseLabel = {
    en: `${localized(experience.label).en} response`,
    hi: `${localized(experience.label).hi} का जवाब`,
  };
  const contextLabel = { en: 'Situations selected', hi: 'चुनी गई परिस्थितियाँ' };
  const experienceSource = sourceRecord(experience.id, responseLabel, answers, experience.label?.en || '');
  const contextText = localized(
    contextLabels.map((item) => item.label?.[language] || item.label?.en || item.id).join(', '),
  );
  const contextSource = sourceRecord(contextKey, contextLabel, answers, contextText[language]);
  return [experienceSource, contextSource].filter(Boolean);
}

function sharedContextDescription(experiences, contextLabel) {
  const enLabels = experiences.map((item) => localized(item.label).en);
  const hiLabels = experiences.map((item) => localized(item.label).hi);
  const english = enLabels.length === 2
    ? `${enLabels[0]} and ${enLabels[1]}`
    : `${enLabels.slice(0, -1).join(', ')} and ${enLabels.at(-1)}`;
  const hindi = hiLabels.length === 2
    ? `${hiLabels[0]} और ${hiLabels[1]}`
    : `${hiLabels.slice(0, -1).join(', ')} और ${hiLabels.at(-1)}`;
  return {
    en: `You reported ${english} as separate experiences and selected ${contextLabel.en} for each. SightSteps connects those responses because they share a context you reported. This is a connection across your answers, not a medical conclusion or explanation of cause.`,
    hi: `आपने ${hindi} को अलग-अलग अनुभवों के रूप में बताया और दोनों के लिए ${contextLabel.hi} चुना। SightSteps इन जवाबों को इसलिए जोड़ता है क्योंकि इनमें आपके बताए गए संदर्भ समान हैं। यह आपके जवाबों के बीच संबंध है, चिकित्सकीय निष्कर्ष या कारण की व्याख्या नहीं।`,
  };
}

function missingFieldsForExperience(experience, isMain, answers) {
  const missing = [];
  const onsetKey = isMain ? 'experience_onset' : `additional_experience_${experience.id}_onset`;
  const contextKey = isMain ? 'experience_context' : `additional_experience_${experience.id}_context`;
  const frequencyKey = isMain ? 'experience_frequency' : `additional_experience_${experience.id}_frequency`;

  if (!hasAnswer(answers, onsetKey)) {
    missing.push({
      id: 'onset',
      label: { en: 'When you first noticed it', hi: 'यह पहली बार कब महसूस हुआ' },
    });
  }
  if (!Array.isArray(experience.contexts) || experience.contexts.length === 0) {
    missing.push({
      id: 'context',
      label: { en: 'Situations where you notice it', hi: 'वे परिस्थितियाँ जहाँ यह महसूस होता है' },
    });
  }
  if (experience.id !== 'headaches' && !hasAnswer(answers, frequencyKey)) {
    missing.push({
      id: 'frequency',
      label: { en: 'How often you notice it', hi: 'यह कितनी बार महसूस होता है' },
    });
  }
  // The questionnaire reuses the original headache response as frequency, so
  // no separate frequency gap is reported for headaches.
  return { missing, onsetKey, contextKey };
}

/**
 * @param {object} answers Current participant answers (not a precomputed summary).
 * @param {Array} timelineEntries Participant-authored timeline entries.
 */
export function buildVisionEvidencePathways(answers = {}, timelineEntries = []) {
  const safeAnswers = answers && typeof answers === 'object' && !Array.isArray(answers)
    ? answers
    : {};
  const profile = buildVisionExperienceProfile(safeAnswers, timelineEntries);
  const selectedAdditionalIds = new Set(getSelectedAdditionalExperienceIds(safeAnswers));
  const experiences = [];

  if (profile.mainExperience) {
    experiences.push({
      ...profile.mainExperience,
      isMain: true,
      contextAnswerId: 'experience_context',
    });
  }

  for (const item of profile.additionalExperiences || []) {
    if (!selectedAdditionalIds.has(item.id)) continue;
    experiences.push({
      ...item,
      isMain: false,
      contextAnswerId: `additional_experience_${item.id}_context`,
    });
  }

  const relationships = [];
  const contextMap = new Map();

  for (const experience of experiences) {
    const contexts = Array.isArray(experience.contexts) ? experience.contexts : [];
    if (!contexts.length) continue;
    const sources = buildExperienceSources(
      experience,
      experience.contextAnswerId,
      contexts,
      safeAnswers,
      'en',
    );

    for (const context of contexts) {
      if (!contextMap.has(context.id)) contextMap.set(context.id, []);
      contextMap.get(context.id).push({ experience, sources, context });
      relationships.push({
        id: `experience-context:${experience.id}:${context.id}`,
        type: 'experience-context',
        title: {
          en: 'Experience and reported context',
          hi: 'अनुभव और बताया गया संदर्भ',
        },
        statement: {
          en: `You reported ${localized(experience.label).en.toLowerCase()} in ${localized(context.label).en.toLowerCase()}.`,
          hi: `आपने ${localized(context.label).hi} में ${localized(experience.label).hi} महसूस होने की बात बताई।`,
        },
        sourceAnswerIds: unique(sources.map((source) => source.id)),
        sourceAnswers: sources,
        sourceTimelineIds: [],
        sourceTimeline: [],
      });
    }
  }

  for (const [contextId, linked] of contextMap.entries()) {
    const distinct = [...new Map(linked.map((item) => [item.experience.id, item])).values()];
    if (contextId === 'varies' || distinct.length < 2) continue;
    const contextLabel = localized(distinct[0].context.label);
    const sources = distinct.flatMap((item) => item.sources);
    relationships.push({
      id: `shared-context:${contextId}:${distinct.map((item) => item.experience.id).sort().join(':')}`,
      type: 'shared-context',
      title: {
        en: 'Shared context across experiences',
        hi: 'अलग-अलग अनुभवों में साझा संदर्भ',
      },
      statement: sharedContextDescription(distinct.map((item) => item.experience), contextLabel),
      contextId,
      contextLabel,
      experienceIds: distinct.map((item) => item.experience.id),
      sourceAnswerIds: unique(sources.map((source) => source.id)),
      sourceAnswers: sources,
      sourceTimelineIds: [],
      sourceTimeline: [],
    });
  }

  const experienceById = new Map(
    (profile.additionalExperiences || [])
      .concat(profile.mainExperience ? [profile.mainExperience] : [])
      .map((item) => [item.id, item]),
  );
  for (const entry of profile.timeline?.entries || []) {
    const experience = experienceById.get(entry.experienceId);
    if (!experience) continue;
    const label = localized(experience.label);
    const date = typeof entry.date === 'string' ? entry.date : '';
    const detail = [entry.context, entry.impact, entry.note].filter((value) => typeof value === 'string' && value.trim()).join(' · ');
    const sources = sourceRecord(
      experience.id,
      { en: `${label.en} response`, hi: `${label.hi} का जवाब` },
      safeAnswers,
      label.en,
    );
    relationships.push({
      id: `timeline-experience:${entry.id}`,
      type: 'timeline-experience',
      title: { en: 'Participant timeline entry', hi: 'प्रतिभागी की टाइमलाइन प्रविष्टि' },
      statement: {
        en: `You recorded an entry for ${label.en} on ${date || 'an undated entry'}.${detail ? ` Your note: ${detail}` : ''}`,
        hi: `आपने ${label.hi} के लिए ${date || 'बिना तारीख की प्रविष्टि'} दर्ज की।${detail ? ` आपका नोट: ${detail}` : ''}`,
      },
      sourceAnswerIds: sources ? [sources.id] : [],
      sourceAnswers: sources ? [sources] : [],
      sourceTimelineIds: [entry.id],
      sourceTimeline: [{
        id: entry.id,
        date,
        detail: localized(detail),
      }],
    });
  }

  const gapTargets = [];
  if (profile.mainExperience) gapTargets.push({ experience: profile.mainExperience, isMain: true });
  for (const item of profile.additionalExperiences || []) {
    if (selectedAdditionalIds.has(item.id)) gapTargets.push({ experience: item, isMain: false });
  }

  const informationGaps = gapTargets.flatMap(({ experience, isMain }) => {
    const { missing } = missingFieldsForExperience(experience, isMain, safeAnswers);
    if (!missing.length) return [];
    const sourceIds = isMain
      ? ['primary_concern', experience.id, 'experience_onset', 'experience_frequency', 'experience_context']
      : ['additional_concerns', experience.id, `additional_experience_${experience.id}_onset`, `additional_experience_${experience.id}_frequency`, `additional_experience_${experience.id}_context`];
    const sourceAnswers = sourceIds
      .map((id) => sourceRecord(
        id,
        {
          en: id === 'primary_concern' ? 'Main experience selected'
            : id === 'additional_concerns' ? 'Additional experience selected'
              : id === experience.id ? 'Reported experience response'
                : id.includes('_onset') ? 'When first noticed'
                  : id.includes('_frequency') ? 'How often noticed'
                    : id.includes('_context') ? 'Situations selected' : 'Response',
          hi: id === 'primary_concern' ? 'मुख्य अनुभव'
            : id === 'additional_concerns' ? 'चुना गया अतिरिक्त अनुभव'
              : id === experience.id ? 'बताए गए अनुभव का जवाब'
                : id.includes('_onset') ? 'पहली बार कब महसूस हुआ'
                  : id.includes('_frequency') ? 'कितनी बार महसूस होता है'
                    : id.includes('_context') ? 'चुनी गई परिस्थितियाँ' : 'जवाब',
        },
        safeAnswers,
        localized(experience.label).en,
      ))
      .filter(Boolean);
    const labelsEn = missing.map((field) => field.label.en.toLowerCase());
    const labelsHi = missing.map((field) => field.label.hi);
    return [{
      id: `information-gap:${experience.id}:${missing.map((field) => field.id).join(':')}`,
      type: 'information-gap',
      title: { en: 'Information not recorded', hi: 'दर्ज नहीं की गई जानकारी' },
      statement: {
        en: `You reported ${localized(experience.label).en.toLowerCase()}, but these details were not recorded: ${labelsEn.join(', ')}. This describes a gap in the information, not a conclusion about your vision.`,
        hi: `आपने ${localized(experience.label).hi} के बारे में बताया, लेकिन ये विवरण दर्ज नहीं हुए: ${labelsHi.join(', ')}। यह जानकारी में कमी बताता है, आपकी दृष्टि के बारे में कोई निष्कर्ष नहीं।`,
      },
      experienceId: experience.id,
      missingFields: missing,
      sourceAnswerIds: unique(sourceAnswers.map((source) => source.id)),
      sourceAnswers,
    }];
  });

  const orderedRelationships = [
    ...relationships.filter((item) => item.type === 'shared-context'),
    ...relationships.filter((item) => item.type === 'experience-context'),
    ...relationships.filter((item) => item.type === 'timeline-experience'),
  ];

  return {
    relationships: orderedRelationships,
    informationGaps,
    hasRelationships: orderedRelationships.length > 0,
    hasInformationGaps: informationGaps.length > 0,
    limitations: {
      participantReportedOnly: true,
      oneNewInferenceType: 'shared-context-across-experiences',
      activityImpactsLinkedToSpecificExperiences: false,
      usesClinicalScoring: false,
      establishesDiagnosis: false,
    },
  };
}

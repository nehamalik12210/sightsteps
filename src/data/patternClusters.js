/**
 * SightSteps — grouped discussion patterns.
 *
 * Clusters organise patterns that match the same participant's answers. Patterns
 * can reuse overlapping answers, so a cluster is not an additional inference,
 * independent confirmation or measure of clinical certainty.
 *
 * Rules:
 * 1. Include only pattern IDs that actually matched.
 * 2. Preserve every individual pattern in the report.
 * 3. Label shared-answer overlap honestly in the cluster summary.
 * 4. Keep all text non-diagnostic and participant-reported.
 */

const clusters = [
  {
    id: 'near-vision-strain',
    memberIds: ['presbyopia', 'close-work-headache'],
    minMatch: 2,
    title: {
      en: 'Near-vision and strain indicators',
      hi: 'निकट-दृष्टि और तनाव संकेतक',
    },
    summary: {
      en: 'The matched patterns group two different sets of details you reported: near-vision blur with age and change over time, and headaches alongside close-up work and squinting. They may be useful to discuss together; this grouping does not say that one experience explains the other.',
      hi: 'मिले हुए पैटर्न आपके द्वारा बताए गए दो अलग-अलग विवरणों को साथ रखते हैं: आयु और समय के साथ बदलाव के संदर्भ में निकट-दृष्टि का धुंधलापन, तथा पास के काम और आँखें सिकोड़ने के साथ सिरदर्द। इन पर साथ में चर्चा की जा सकती है; यह समूह यह नहीं कहता कि एक अनुभव दूसरे का कारण है।',
    },
    icon: 'link',
  },
  {
    id: 'digital-screen-cluster',
    memberIds: ['screen-strain', 'digital-eye-strain'],
    minMatch: 2,
    title: {
      en: 'Screen-related indicators',
      hi: 'स्क्रीन-संबंधी संकेतक',
    },
    summary: {
      en: 'The matched patterns both include your reported screen use, and one also uses your report of headaches during screen use. They reuse some of the same answers, so they are overlapping discussion prompts rather than independent confirmations.',
      hi: 'मिले हुए दोनों पैटर्न में आपका स्क्रीन उपयोग शामिल है और एक में स्क्रीन देखते समय सिरदर्द का आपका जवाब भी शामिल है। इनमें कुछ वही जवाब दोबारा उपयोग होते हैं, इसलिए ये स्वतंत्र पुष्टि नहीं बल्कि जुड़े हुए चर्चा-विषय हैं।',
    },
    icon: 'link',
  },
  {
    id: 'low-light-age-cluster',
    memberIds: ['night-vision', 'low-light-contrast'],
    minMatch: 2,
    title: {
      en: 'Low-light vision experiences',
      hi: 'कम रोशनी में दृष्टि के अनुभव',
    },
    summary: {
      en: 'Both matched patterns relate to your reported night-vision difficulty: one includes the driving context linked to that experience and the other records squinting separately. The patterns may reuse the same night-vision response, so this grouping is not additional or independent evidence.',
      hi: 'दोनों मिले हुए पैटर्न आपकी बताई रात में देखने की कठिनाई से जुड़े हैं: एक में उसी अनुभव से जुड़ा ड्राइविंग का संदर्भ है और दूसरे में अलग से बताई गई आँखें सिकोड़ने की बात है। पैटर्न रात में देखने की कठिनाई वाले उसी जवाब का पुनः उपयोग कर सकते हैं; इसलिए यह समूह अतिरिक्त या स्वतंत्र प्रमाण नहीं है।',
    },
    icon: 'link',
  },
];

/**
 * Find which clusters are active given the matched pattern IDs.
 *
 * @param {string[]} matchedPatternIds - IDs of patterns that co-fired
 * @returns {Array<{id, title, summary, icon, matchedMembers: string[]}>}
 */
export function evaluateClusters(matchedPatternIds = []) {
  const idSet = new Set(Array.isArray(matchedPatternIds)
    ? matchedPatternIds.filter((id) => typeof id === 'string')
    : []);
  return clusters
    .map((cluster) => {
      const matchedMembers = cluster.memberIds.filter((id) => idSet.has(id));
      if (matchedMembers.length >= cluster.minMatch) {
        return {
          id: cluster.id,
          title: cluster.title,
          summary: cluster.summary,
          icon: cluster.icon,
          matchedMembers,
        };
      }
      return null;
    })
    .filter(Boolean);
}

export default clusters;

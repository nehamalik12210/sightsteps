/**
 * SightSteps — Pattern Cluster Definitions
 *
 * When multiple patterns co-fire, cluster narratives surface the relationship
 * between them. This adds inference: independent pattern matches are survey
 * logic; recognising that patterns form a coherent group is intelligence.
 *
 * Rules:
 * 1. Only cluster patterns that actually co-fired for this user.
 * 2. Never hide an individual pattern because it's in a cluster.
 * 3. Show all matched patterns, then cluster summary above them.
 * 4. All text uses non-diagnostic framing.
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
      en: 'The matched patterns connect your reported near-vision blur with your reported headaches, close-up work or squinting. Some answers can contribute to more than one pattern, so these matches are overlapping discussion prompts, not independent confirmations.',
      hi: 'मिले हुए पैटर्न आपके बताए निकट-दृष्टि धुंधलेपन को सिरदर्द, पास के काम या आँखें सिकोड़ने के आपके जवाबों से जोड़ते हैं। कुछ जवाब एक से अधिक पैटर्न में शामिल हो सकते हैं; इसलिए ये आपस में जुड़े चर्चा-विषय हैं, स्वतंत्र पुष्टि नहीं।',
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
    memberIds: ['night-vision', 'low-light-contrast', 'overdue-exam'],
    minMatch: 2,
    title: {
      en: 'Low-light vision experiences',
      hi: 'कम रोशनी में दृष्टि के अनुभव',
    },
    summary: {
      en: 'More than one discussion pattern relates to your reported night-vision difficulty, squinting or examination history. Some patterns share the same reported answers; a cluster is an organisational summary, not additional or independent evidence.',
      hi: 'एक से अधिक चर्चा-पैटर्न आपकी बताई रात में देखने की कठिनाई, आँखें सिकोड़ने या नेत्र-जाँच के इतिहास से जुड़े हैं। कुछ पैटर्न में वही जवाब साझा हो सकते हैं; क्लस्टर केवल जानकारी व्यवस्थित करता है, यह अतिरिक्त या स्वतंत्र प्रमाण नहीं है।',
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

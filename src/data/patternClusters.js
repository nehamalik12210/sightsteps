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
    memberIds: ['presbyopia', 'close-work-headache', 'overdue-exam'],
    minMatch: 2,
    title: {
      en: 'Near-vision and strain indicators',
      hi: 'निकट-दृष्टि और तनाव संकेतक',
    },
    summary: {
      en: 'Multiple patterns in your responses relate to near-vision difficulty and visual strain during close work. These often share common factors and may be addressed together in a single comprehensive examination.',
      hi: 'आपके जवाबों में कई पैटर्न निकट-दृष्टि कठिनाई और पास के काम के दौरान तनाव से संबंधित हैं। इनमें अक्सर सामान्य कारक होते हैं और इन्हें एक व्यापक जाँच में एक साथ संबोधित किया जा सकता है।',
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
      en: 'Two patterns in your responses relate to screen use and its effects on your vision. These often share underlying factors such as viewing distance, screen time duration and break habits that an eye-care professional can assess together.',
      hi: 'आपके जवाबों में दो पैटर्न स्क्रीन उपयोग और आपकी दृष्टि पर इसके प्रभावों से संबंधित हैं। इनमें अक्सर अंतर्निहित कारक जैसे देखने की दूरी, स्क्रीन समय और ब्रेक की आदतें होती हैं जिनका नेत्र देखभाल पेशेवर एक साथ मूल्यांकन कर सकते हैं।',
    },
    icon: 'link',
  },
  {
    id: 'low-light-age-cluster',
    memberIds: ['night-vision', 'low-light-contrast', 'overdue-exam'],
    minMatch: 2,
    title: {
      en: 'Low-light and contrast indicators',
      hi: 'कम रोशनी और कंट्रास्ट संकेतक',
    },
    summary: {
      en: 'Multiple patterns in your responses relate to difficulty in low-light conditions and contrast sensitivity. These experiences may share common age-related or optical factors worth discussing together with an eye-care professional.',
      hi: 'आपके जवाबों में कई पैटर्न कम रोशनी में कठिनाई और कंट्रास्ट संवेदनशीलता से संबंधित हैं। ये अनुभव सामान्य उम्र-संबंधी या ऑप्टिकल कारक साझा कर सकते हैं जो नेत्र देखभाल पेशेवर से मिलकर चर्चा करने योग्य हैं।',
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
  const idSet = new Set(matchedPatternIds);
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

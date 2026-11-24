import questionBank from '../data/questions.js';
import { formatVisionTimelineDate } from '../utils/visionTimeline.js';
import { buildCompactExperienceSummary } from '../engine/visionExperienceProfile.js';
import './VisionExperienceProfile.css';

function localized(value, language) {
  if (value && typeof value === 'object') {
    return value[language] || value.en || value.hi || '';
  }
  return typeof value === 'string' ? value : '';
}

function sourceLabel(sourceId, profile, language) {
  if (sourceId === 'custom_activity_name') {
    return language === 'hi'
      ? 'प्रतिभागी द्वारा दर्ज गतिविधि का नाम'
      : 'Participant-entered activity name';
  }
  const question = questionBank.find((item) => item.id === sourceId);
  if (question?.text) return localized(question.text, language);

  const additionalMatch = sourceId.match(/^additional_experience_(.+)_(onset|frequency|context|eye)$/);
  if (additionalMatch) {
    const experience = profile.additionalExperiences.find((item) => item.id === additionalMatch[1]);
    const label = localized(experience?.label, language);
    const suffix = {
      onset: language === 'hi' ? 'पहली बार कब महसूस हुआ' : 'When first noticed',
      frequency: language === 'hi' ? 'आवृत्ति' : 'Frequency',
      context: language === 'hi' ? 'परिस्थितियाँ' : 'Situations',
      eye: language === 'hi' ? 'किस आँख में' : 'Eye(s) involved',
    }[additionalMatch[2]];
    return label + ' — ' + suffix;
  }

  const impactFrequency = sourceId.startsWith('activity_impact_frequency_');
  const impactDetail = sourceId.startsWith('activity_impact_');
  if (impactFrequency || impactDetail) {
    const activityId = sourceId.replace(
      impactFrequency ? 'activity_impact_frequency_' : 'activity_impact_',
      '',
    );
    const activity = profile.activityImpacts.find((item) => item.activityId === activityId);
    const activityName = localized(activity?.label, language) || activityId;
    return language === 'hi'
      ? (impactFrequency ? `${activityName} के दौरान प्रभाव की आवृत्ति` : `${activityName} पर प्रभाव का विवरण`)
      : (impactFrequency ? `Frequency of impact during ${activityName}` : `Impact details for ${activityName}`);
  }

  return sourceId;
}

function answerText(answer, language) {
  if (!answer) return '';
  if (answer.label) return localized(answer.label, language);
  if (Array.isArray(answer.value)) return answer.value.join(', ');
  return typeof answer.value === 'string' ? answer.value : '';
}

function MetadataItem({ label, value }) {
  if (!value) return null;
  return (
    <div className="vep__meta-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function VisionExperienceProfile({
  profile,
  summary = '',
  answers = {},
  language = 'en',
  verbosity = 'full',
}) {
  const lang = language === 'hi' ? 'hi' : 'en';
  const isHindi = lang === 'hi';
  if (verbosity === 'brief' || verbosity === 'pack') {
    const compactSummary = summary || buildCompactExperienceSummary(
      profile,
      lang,
      verbosity === 'brief' ? 360 : 240,
      verbosity === 'brief' ? 3 : 2,
    );
    if (!compactSummary) return null;
    return (
      <section className={`vep vep--compact vep--${verbosity}`} aria-label={isHindi ? 'दर्ज किए गए दृष्टि अनुभव का सारांश' : 'Summary of reported vision experiences'}>
        {verbosity === 'brief' ? (
          <p className="vep__brief-label">{isHindi ? 'प्रतिभागी द्वारा बताए गए अनुभव' : 'PARTICIPANT-REPORTED CONTEXT'}</p>
        ) : (
          <h2 className="vep__compact-title">{isHindi ? 'बताए गए दृष्टि अनुभव' : 'Reported vision experience'}</h2>
        )}
        <p className="vep__compact-summary">{compactSummary}</p>
      </section>
    );
  }
  if (!profile) return null;
  const main = profile.mainExperience;
  const sourceIds = [...new Set([
    ...(main?.sourceIds || []),
    ...profile.additionalExperiences.flatMap((item) => item.sourceIds || []),
    ...profile.activityImpacts.flatMap((item) => item.sourceIds || []),
  ])];

  return (
    <section className="vep" aria-labelledby="vep-heading">
      <header className="vep__header">
        <div>
          <p className="vep__kicker">{isHindi ? 'आपके बताए अनुभव' : 'YOUR REPORTED EXPERIENCES'}</p>
          <h2 id="vep-heading">{isHindi ? 'रोज़मर्रा के दृष्टि अनुभव की प्रोफ़ाइल' : 'Everyday Vision Experience Profile'}</h2>
          <p className="vep__intro">
            {isHindi
              ? 'आपके जवाबों, दैनिक गतिविधियों और टाइमलाइन रिकॉर्ड को एक साथ रखकर बनाया गया सारांश।'
              : 'A connected summary of the experiences, daily activities and timeline records you entered.'}
          </p>
        </div>
        <span className="material-symbols-outlined vep__header-icon" aria-hidden="true">account_tree</span>
      </header>

      <div className="vep__section">
        <h3>{isHindi ? 'मुख्य बताया गया अनुभव' : 'Main reported experience'}</h3>
        {main ? (
          <>
            <p className="vep__main-label">{localized(main.label, lang)}</p>
            <p className="vep__narrative">{localized(main.narrative, lang)}</p>
            <dl className="vep__meta-grid">
              <MetadataItem label={isHindi ? 'पहली बार कब महसूस हुआ' : 'First noticed'} value={localized(main.onset, lang)} />
              <MetadataItem label={isHindi ? 'समय के साथ बदलाव' : 'Change over time'} value={localized(main.change, lang)} />
              <MetadataItem label={isHindi ? 'आवृत्ति' : 'Frequency'} value={localized(main.frequency, lang)} />
              <MetadataItem label={isHindi ? 'किस आँख में' : 'Eye involved'} value={localized(main.eye, lang)} />
            </dl>
            {main.contexts.length > 0 && (
              <div className="vep__context">
                <span className="vep__field-label">{isHindi ? 'बताई गई परिस्थितियाँ' : 'Reported situations'}</span>
                <div className="vep__chips">
                  {main.contexts.map((item) => (
                    <span className="vep__chip" key={item.id}>{localized(item.label, lang)}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="vep__empty">
            {isHindi
              ? 'वर्तमान जवाबों से कोई मुख्य अनुभव निर्धारित नहीं किया गया। अधूरी या अनिश्चित जानकारी को अनुमान से नहीं भरा गया है।'
              : 'No current main experience could be selected from the reported responses. Missing or uncertain information has not been inferred.'}
          </p>
        )}
      </div>

      {profile.additionalExperiences.length > 0 && (
        <div className="vep__section">
          <h3>{isHindi ? 'अन्य बताए गए अनुभव' : 'Other reported experiences'}</h3>
          <ul className="vep__experience-list">
            {profile.additionalExperiences.map((item) => (
              <li key={item.id}>
                <span>{localized(item.label, lang)}</span>
                <strong>{localized(item.answer, lang)}</strong>
                {item.selectedForDiscussion && item.narrative && localized(item.narrative, lang) && (
                  <p className="vep__additional-detail">{localized(item.narrative, lang)}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {profile.connections && (
        <div className="vep__connection">
          <h3>{isHindi ? 'आपके जवाबों के बीच संबंध' : 'How your responses connect'}</h3>
          <p>{localized(profile.connections.narrative, lang)}</p>
        </div>
      )}

      <div className="vep__section">
        <h3>{isHindi ? 'दैनिक गतिविधियों पर बताया गया प्रभाव' : 'Reported impact on daily activities'}</h3>
        {profile.activityImpacts.length > 0 ? (
          <div className="vep__activity-list">
            {profile.activityImpacts.map((item) => (
              <article className="vep__activity" key={item.activityId}>
                <div className="vep__activity-heading">
                  <strong>{localized(item.label, lang)}</strong>
                  <span className={`vep__status vep__status--${item.impactStatus}`}>
                    {item.impactStatus === 'reported'
                      ? (isHindi ? 'प्रभाव बताया' : 'Impact reported')
                      : item.impactStatus === 'no_impact_reported'
                        ? (isHindi ? 'कोई प्रभाव नहीं बताया' : 'No impact reported')
                        : item.impactStatus === 'unsure'
                          ? (isHindi ? 'अनिश्चित' : 'Unsure')
                          : (isHindi ? 'विवरण दर्ज नहीं' : 'Details not recorded')}
                  </span>
                </div>
                <p>{localized(item.summary, lang)}</p>
                {item.frequency && (
                  <small>{isHindi ? 'प्रभाव की आवृत्ति: ' : 'Impact frequency: '}{localized(item.frequency, lang)}</small>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="vep__empty">
            {isHindi ? 'किसी प्रभावित दैनिक गतिविधि का विवरण दर्ज नहीं है।' : 'No affected daily activity details were recorded.'}
          </p>
        )}
      </div>

      <div className="vep__section">
        <div className="vep__timeline-heading">
          <h3>{isHindi ? 'आपकी टाइमलाइन' : 'Your timeline'}</h3>
          <span>{profile.timeline.totalEntries} {isHindi ? 'रिकॉर्ड' : 'entries'}</span>
        </div>
        {profile.timeline.entries.length > 0 ? (
          <ol className="vep__timeline">
            {profile.timeline.entries.slice(0, 4).map((entry) => (
              <li key={entry.id}>
                <time dateTime={entry.date}>{formatVisionTimelineDate(entry.date, lang)}{entry.time ? ` · ${entry.time}` : ''}</time>
                <strong>{localized(entry.experienceLabel, lang)}</strong>
                {entry.context && <p>{entry.context}</p>}
                {entry.impact && <p>{entry.impact}</p>}
                {main && entry.experienceId === main.id && (
                  <small>{isHindi ? 'मुख्य अनुभव की इसी श्रेणी से जुड़ी आपकी टाइमलाइन एंट्री' : 'Participant-entered entry for the same experience category as the main report'}</small>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="vep__empty">
            {isHindi ? 'अभी कोई टाइमलाइन एंट्री दर्ज नहीं है।' : 'No timeline entries have been recorded yet.'}
          </p>
        )}
      </div>

      {sourceIds.length > 0 && (
        <details className="vep__sources">
          <summary>{isHindi ? 'इस प्रोफ़ाइल में उपयोग किए गए जवाब देखें' : 'See the responses used in this profile'}</summary>
          <ul>
            {sourceIds.map((id) => (
              <li key={id}>
                <span>{sourceLabel(id, profile, lang)}</span>
                <strong>{answerText(answers[id], lang)}</strong>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="vep__disclaimer">
        {isHindi
          ? 'यह प्रोफ़ाइल केवल आपके बताए गए जवाबों और टाइमलाइन रिकॉर्ड को जोड़ती है। यह दृष्टि को मापती नहीं, किसी स्थिति का निदान नहीं करती और चिकित्सकीय गंभीरता या तात्कालिकता तय नहीं करती।'
          : 'This profile connects only the answers and timeline records you supplied. It does not measure vision, diagnose a condition or determine clinical severity or urgency.'}
      </p>
    </section>
  );
}

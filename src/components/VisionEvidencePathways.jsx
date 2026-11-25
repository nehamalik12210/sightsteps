import { useId } from 'react';
import './VisionEvidencePathways.css';

function localized(value, language) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[language] || value.en || value.hi || '';
  }
  return typeof value === 'string' ? value : '';
}

export default function VisionEvidencePathways({ pathways, language = 'en', compact = false }) {
  const titleId = useId();
  const gapsId = `${titleId}-gaps`;
  if (!pathways || (!pathways.relationships?.length && !pathways.informationGaps?.length)) {
    return null;
  }

  const hi = language === 'hi';
  const sharedRelationships = pathways.relationships.filter((item) => item.type === 'shared-context');
  const relationships = compact
    ? (sharedRelationships.length ? sharedRelationships.slice(0, 1) : pathways.relationships.slice(0, 2))
    : pathways.relationships;
  const gaps = compact ? pathways.informationGaps.slice(0, 2) : pathways.informationGaps;
  const remainingRelationships = Math.max(0, pathways.relationships.length - relationships.length);
  const remainingGaps = Math.max(0, pathways.informationGaps.length - gaps.length);

  return (
    <section className={`vision-evidence${compact ? ' vision-evidence--compact' : ''}`} aria-labelledby={titleId}>
      <header className="vision-evidence__header">
        <div>
          <p className="vision-evidence__eyebrow">{hi ? 'जवाबों के बीच संबंध' : 'HOW YOUR RESPONSES CONNECT'}</p>
          <h2 id={titleId}>{hi ? 'विज़न एविडेंस पाथवे' : 'Vision Evidence Pathways'}</h2>
        </div>
        <span className="material-symbols-outlined" aria-hidden="true">account_tree</span>
      </header>
      <p className="vision-evidence__intro">
        {hi
          ? 'ये संबंध आपके दिए गए जवाबों और टाइमलाइन रिकॉर्ड से बनाए गए हैं। साझा संदर्भ का मतलब यह नहीं है कि अनुभवों का एक ही कारण है।'
          : 'These connections are built from your answers and timeline entries. A shared context does not mean the experiences have the same cause.'}
      </p>

      {relationships.length > 0 && (
        <div className="vision-evidence__list">
          {relationships.map((item) => (
            <article className="vision-evidence__card" key={item.id}>
              <div className="vision-evidence__card-heading">
                <span className={`vision-evidence__type vision-evidence__type--${item.type}`}>
                  {item.type === 'shared-context'
                    ? (hi ? 'साझा संदर्भ' : 'SHARED CONTEXT')
                    : item.type === 'timeline-experience'
                      ? (hi ? 'टाइमलाइन' : 'TIMELINE LINK')
                      : (hi ? 'अनुभव और संदर्भ' : 'EXPERIENCE · CONTEXT')}
                </span>
                <h3>{localized(item.title, language)}</h3>
              </div>
              <p>{localized(item.statement, language)}</p>

              {item.sourceAnswers?.length > 0 && (
                <div className="vision-evidence__sources">
                  <strong>{hi ? 'स्रोत जवाब' : 'Source responses'}</strong>
                  <ul>
                    {item.sourceAnswers.map((source) => (
                      <li key={source.id}>
                        <span>{localized(source.label, language)}</span>
                        <b>{localized(source.value, language)}</b>
                        <code>{source.id}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.sourceTimeline?.length > 0 && (
                <div className="vision-evidence__sources">
                  <strong>{hi ? 'स्रोत टाइमलाइन रिकॉर्ड' : 'Source timeline record'}</strong>
                  <ul>
                    {item.sourceTimeline.map((source) => (
                      <li key={source.id}>
                        <span>{source.date || (hi ? 'तारीख दर्ज नहीं' : 'Date not recorded')}</span>
                        <b>{localized(source.detail, language) || '—'}</b>
                        <code>{source.id}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
          {remainingRelationships > 0 && (
            <p className="vision-evidence__omitted">
              {hi ? `इस संक्षिप्त सारांश में ${remainingRelationships} अन्य संबंध शामिल नहीं हैं।` : `${remainingRelationships} additional relationships are available in the detailed report.`}
            </p>
          )}
        </div>
      )}

      {gaps.length > 0 && (
        <section className="vision-evidence__gaps" aria-labelledby={gapsId}>
          <h3 id={gapsId}>{hi ? 'जानकारी जो दर्ज नहीं हुई' : 'Information not recorded'}</h3>
          <p>
            {hi
              ? 'ये केवल उपलब्ध जवाबों में छूटी हुई जानकारी दिखाते हैं; यह आपकी दृष्टि के बारे में निष्कर्ष नहीं है।'
              : 'These identify details absent from the available responses; they are not conclusions about your vision.'}
          </p>
          {gaps.map((gap) => (
            <article className="vision-evidence__gap" key={gap.id}>
              <strong>{localized(gap.statement, language)}</strong>
              {gap.missingFields?.length > 0 && (
                <ul>
                  {gap.missingFields.map((field) => <li key={field.id}>{localized(field.label, language)}</li>)}
                </ul>
              )}
              {gap.sourceAnswers?.length > 0 && (
                <div className="vision-evidence__gap-sources">
                  {gap.sourceAnswers.map((source) => (
                    <span key={source.id}>
                      {localized(source.label, language)}: {localized(source.value, language)}
                      <code>{source.id}</code>
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
          {remainingGaps > 0 && (
            <p className="vision-evidence__omitted">
              {hi ? `इस सारांश में ${remainingGaps} अन्य जानकारी-अंतर शामिल नहीं हैं।` : `${remainingGaps} additional information gaps are available in the detailed report.`}
            </p>
          )}
        </section>
      )}
      <p className="vision-evidence__disclaimer">
        {hi
          ? 'यह पारदर्शी सारांश केवल प्रतिभागी द्वारा बताई गई जानकारी को व्यवस्थित करता है। यह निदान, कारण या चिकित्सकीय पुष्टि नहीं है।'
          : 'This explainability summary organises participant-reported information only. It is not a diagnosis, cause or clinical confirmation.'}
      </p>
    </section>
  );
}

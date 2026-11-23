import './AppointmentPreparationPack.css';

export default function AppointmentPreparationPack({ pack, language = 'en' }) {
  const hi = language === 'hi';
  return (
    <section className="appointment-pack" aria-label={hi ? 'अपॉइंटमेंट की तैयारी का सारांश' : 'Appointment preparation pack'}>
      <header className="appointment-pack__header">
        <div>
          <p className="appointment-pack__eyebrow">{hi ? 'SIGHTSTEPS · बातचीत की तैयारी' : 'SIGHTSTEPS · CONVERSATION PREPARATION'}</p>
          <h1>{hi ? 'अपॉइंटमेंट तैयारी पैक' : 'Appointment Preparation Pack'}</h1>
          <p className="appointment-pack__subtitle">
            {hi ? 'आपके बताए अनुभवों और आपके चुने हुए बातचीत के विषयों का एक पृष्ठ सारांश।' : 'A one-page summary of the experiences you reported and the topics you chose to discuss.'}
          </p>
        </div>
        <div className="appointment-pack__date">
          <span>{hi ? 'तैयार किया गया' : 'Prepared on'}</span>
          <strong>{pack.preparedDate || '—'}</strong>
        </div>
      </header>

      <div className="appointment-pack__top-grid">
        <section className="appointment-pack__section" aria-labelledby="appointment-pack-priorities">
          <h2 id="appointment-pack-priorities">{hi ? 'मेरी प्राथमिकताएँ' : 'My priorities'}</h2>
          {pack.priorities.length ? (
            <ol className="appointment-pack__priorities">
              {pack.priorities.map((item) => <li key={item.id}>{item.label}</li>)}
            </ol>
          ) : (
            <p className="appointment-pack__empty">{hi ? 'कोई प्राथमिकता नहीं चुनी गई।' : 'No conversation priorities selected.'}</p>
          )}
          {pack.activities.length > 0 && (
            <p className="appointment-pack__context">
              <strong>{hi ? 'प्रभावित गतिविधियाँ: ' : 'Activities reported as affected: '}</strong>
              {pack.activities.join(hi ? ' · ' : ' · ')}
            </p>
          )}
        </section>

        <section className="appointment-pack__section" aria-labelledby="appointment-pack-questions">
          <h2 id="appointment-pack-questions">{hi ? 'मैं जो सवाल पूछना चाहता/चाहती हूँ' : 'Questions I want to ask'}</h2>
          {pack.questionsToAsk ? (
            <p className="appointment-pack__questions">{pack.questionsToAsk}</p>
          ) : (
            <p className="appointment-pack__empty">{hi ? 'अभी कोई व्यक्तिगत सवाल नहीं जोड़ा गया।' : 'No personal questions added yet.'}</p>
          )}
        </section>
      </div>

      <section className="appointment-pack__section appointment-pack__discussion" aria-labelledby="appointment-pack-discussion">
        <h2 id="appointment-pack-discussion">{hi ? 'चर्चा के लिए विषय' : 'Topics to discuss'}</h2>
        {pack.discussionPoints.length ? (
          <ol className="appointment-pack__discussion-list">
            {pack.discussionPoints.map((point, index) => (
              <li key={point.id || index}>
                <h3>{point.title || (hi ? 'चर्चा का विषय' : 'Discussion topic')}</h3>
                {point.context && <p className="appointment-pack__context">{point.context}</p>}
                <p>{point.prompt}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="appointment-pack__empty">{hi ? 'आपकी रिपोर्ट में कोई विशेष चर्चा विषय नहीं बना। अपनी दिनचर्या और किसी भी चिंता के बारे में बात करें।' : 'No specific discussion prompts were generated. You can still describe your routine and any concerns.'}</p>
        )}
      </section>

      <section className="appointment-pack__section appointment-pack__timeline" aria-labelledby="appointment-pack-timeline">
        <div className="appointment-pack__section-head">
          <h2 id="appointment-pack-timeline">{hi ? 'हाल के टाइमलाइन अनुभव' : 'Recent timeline experiences'}</h2>
          <span>{hi ? 'नवीनतम 5 तक' : 'Up to the latest 5'}</span>
        </div>
        {pack.timelineEntries.length ? (
          <ol className="appointment-pack__timeline-list">
            {pack.timelineEntries.map((entry) => (
              <li key={entry.id}>
                <time dateTime={entry.dateValue}>{entry.date}{entry.time ? ` · ${entry.time}` : ''}</time>
                <strong>{entry.experience}</strong>
                {(entry.context || entry.note) && (
                  <p>{[entry.context, entry.note].filter(Boolean).join(' · ')}</p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="appointment-pack__empty">{hi ? 'कोई टाइमलाइन अनुभव दर्ज नहीं किया गया।' : 'No timeline experiences have been recorded.'}</p>
        )}
      </section>

      {pack.amsler && (
        <section className="appointment-pack__section" aria-labelledby="appointment-pack-amsler">
          <h2 id="appointment-pack-amsler">{hi ? 'एम्सलर ग्रिड होम स्क्रीनिंग' : 'Amsler Grid Home Screening'}</h2>
          <div className="appointment-pack__amsler-grid">
            <p><strong>{hi ? 'दाईं आँख:' : 'Right eye:'}</strong> {pack.amsler.right} {hi ? 'क्षेत्र चिह्नित' : 'regions flagged'}</p>
            <p><strong>{hi ? 'बाईं आँख:' : 'Left eye:'}</strong> {pack.amsler.left} {hi ? 'क्षेत्र चिह्नित' : 'regions flagged'}</p>
          </div>
          {pack.amslerSpatial && (
            <div className="appointment-pack__amsler-spatial">
              {pack.amslerSpatial.right.map((line, i) => <p key={`r${i}`}>{line}</p>)}
              {pack.amslerSpatial.left.map((line, i) => <p key={`l${i}`}>{line}</p>)}
              {pack.amslerSpatial.comparison.map((line, i) => <p key={`c${i}`} className="appointment-pack__spatial-highlight">{line}</p>)}
              <p className="appointment-pack__spatial-disclaimer">{pack.amslerSpatial.disclaimer}</p>
            </div>
          )}
          <p className="appointment-pack__context">{hi ? 'होम स्क्रीनिंग परिणाम — निदान नहीं। ये परिणाम अपने ऑप्टोमेट्रिस्ट को दिखाएँ।' : 'Home screening result — not a diagnosis. Show these results to your optometrist.'}</p>
        </section>
      )}

      <footer className="appointment-pack__footer">
        {hi
          ? 'यह पैक केवल आपकी स्वयं बताई गई जानकारी और बातचीत के विषयों को व्यवस्थित करता है। यह आँखों की जाँच, निदान, तात्कालिकता का आकलन या प्रिस्क्रिप्शन नहीं है।'
          : 'This pack organises only your self-reported information and conversation topics. It is not an eye examination, diagnosis, urgency assessment or prescription.'}
      </footer>
    </section>
  );
}

import VisionExperienceProfile from './VisionExperienceProfile.jsx';
import VisionEvidencePathways from './VisionEvidencePathways.jsx';
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

      {pack.visionActivity && (
        <section className="appointment-pack__section" aria-labelledby="appointment-pack-direction">
          <h2 id="appointment-pack-direction">{hi ? 'दिशा पहचान गतिविधि' : 'Direction Awareness Activity'}</h2>
          {pack.visionActivity.skipped ? (
            <p className="appointment-pack__empty">
              {hi ? 'प्रतिभागी ने यह वैकल्पिक गतिविधि छोड़ दी।' : 'The participant skipped this optional activity.'}
            </p>
          ) : (
            <div className="appointment-pack__amsler-grid">
              <p><strong>{hi ? 'राउंड 1:' : 'Round 1:'}</strong> {pack.visionActivity.round1.correct}/{pack.visionActivity.round1.total}</p>
              <p><strong>{hi ? 'राउंड 2:' : 'Round 2:'}</strong> {pack.visionActivity.round2.correct}/{pack.visionActivity.round2.total}</p>
            </div>
          )}
          <p className="appointment-pack__context">
            {hi
              ? 'ये केवल इस गतिविधि में चुनी गई दिशाओं की गिनती हैं। ये दृष्टि की तीक्ष्णता या आँखों के बीच अंतर नहीं बताते।'
              : 'These are counts of direction selections in this interaction only. They do not describe visual acuity or differences between your eyes.'}
          </p>
        </section>
      )}

      {pack.experienceProfile?.summary && (
        <VisionExperienceProfile
          verbosity="pack"
          summary={pack.experienceProfile.summary}
          language={language}
        />
      )}

      <VisionEvidencePathways pathways={pack.evidencePathways} language={language} compact />

      {pack.conversationReview && (
        <section className="appointment-pack__section appointment-pack__participant-review" aria-labelledby="appointment-pack-review">
          <h2 id="appointment-pack-review">{hi ? 'मेरी समीक्षा' : 'Participant review'}</h2>
          <p>
            {pack.conversationReview.confirmed
              ? (hi ? 'प्रतिभागी ने पुष्टि की कि सारांश उनकी बताई बात को दर्शाता है।' : 'The participant confirmed that the summary reflects what they wanted to share.')
              : (hi ? 'प्रतिभागी ने सारांश की पुष्टि नहीं की।' : 'The participant has not confirmed the summary.')}
          </p>
          {pack.conversationReview.correction && (
            <blockquote>{pack.conversationReview.correction}</blockquote>
          )}
        </section>
      )}

      <section className="appointment-pack__section appointment-pack__discussion" aria-labelledby="appointment-pack-discussion">
        <h2 id="appointment-pack-discussion">{hi ? 'चर्चा के लिए विषय' : 'Topics to discuss'}</h2>
        {pack.discussionPoints.length ? (
          <ol className="appointment-pack__discussion-list">
            {pack.discussionPoints.map((point, index) => (
              <li key={point.id || index}>
                <h3>{point.title || (hi ? 'चर्चा का विषय' : 'Discussion topic')}</h3>
                {point.context && <p className="appointment-pack__context">{point.context}</p>}
                <p>{point.prompt}</p>
                {point.sources?.length > 0 && (
                  <p className="appointment-pack__context">
                    <strong>{hi ? 'इस विषय से जुड़े आपके जवाब:' : 'Your responses linked to this topic:'}</strong>{' '}
                    {point.sources.map((source) => (
                      source.answer ? source.label + ': ' + source.answer : source.label
                    )).join(' · ')}
                  </p>
                )}
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
          <h2 id="appointment-pack-amsler">{hi ? 'एम्सलर ग्रिड स्व-निगरानी गतिविधि' : 'Amsler Grid Self-Monitoring Activity'}</h2>
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
          <p className="appointment-pack__context">{hi ? 'यह केवल आपके द्वारा चिह्नित क्षेत्रों का रिकॉर्ड है। कोई क्षेत्र चिह्नित न होना दृष्टि की समस्या को खारिज नहीं करता। नई टेढ़ी, धुंधली या गायब रेखाएँ/क्षेत्र दिखें तो शीघ्र नेत्र-देखभाल पेशेवर से संपर्क करें।' : 'This records only the areas you chose to flag. No areas flagged does not rule out a vision problem. If you notice new distortion, blurred or missing areas, contact an eye-care professional promptly.'}</p>
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

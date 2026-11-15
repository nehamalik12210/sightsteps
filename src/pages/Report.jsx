import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { evaluateAnswers } from '../engine/ruleEngine.js';
import { getReportedExperienceOptions } from '../data/questions.js';
import VoiceNoteField from '../components/VoiceNoteField.jsx';
import './Report.css';

function localized(value, lang) {
  if (value && typeof value === 'object') return value[lang] || value.en || '';
  return value ?? '';
}

export default function Report() {
  const navigate = useNavigate();
  const {
    isHydrated,
    storageAvailable,
    language,
    answers,
    activities,
    primaryActivity,
    participantNote,
    visionResults,
    isDemo,
    demoPersona,
    reset,
    appointmentFollowUp,
    discussionPriorities,
    questionsToAsk,
    assistedCompletion,
    kioskMode,
    setDiscussionPriorities,
    setQuestionsToAsk,
  } = useApp();

  const lang = language || 'en';
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [printMode, setPrintMode] = useState('detail');

  const report = useMemo(() => evaluateAnswers(answers, {
    activities,
    primaryActivity,
    participantNote,
    countableQuestionIds: isDemo ? demoPersona?.demoQuestionIds : undefined,
  }), [answers, activities, primaryActivity, participantNote, isDemo, demoPersona]);

  // Do not redirect while IndexedDB is still restoring the saved session.
  useEffect(() => {
    if (isHydrated && Object.keys(answers).length === 0) {
      navigate('/', { replace: true });
    }
  }, [isHydrated, answers, navigate]);

  const toggleGroup = (id) => setExpandedGroups((previous) => ({ ...previous, [id]: !previous[id] }));
  const handleNew = async () => { await reset(); navigate(kioskMode ? '/kiosk' : '/', { replace: true }); };
  const finishKiosk = async () => { await reset(); navigate('/kiosk', { replace: true }); };
  // A demo's language is seeded from its persona (Ramesh uses Hindi).
  // Clear demo state before returning home so it does not change the landing page language.
  const handleGoHome = async () => {
    if (kioskMode) {
      await finishKiosk();
      return;
    }
    if (isDemo) await reset();
    navigate('/', { replace: true });
  };
  const handlePriorityToggle = (id) => {
    const current = selectedPriorities;
    if (current.includes(id)) setDiscussionPriorities(current.filter((item) => item !== id));
    else if (current.length < 2) setDiscussionPriorities([...current, id]);
  };
  const printBrief = (mode) => {
    setPrintMode(mode);
    window.setTimeout(() => window.print(), 120);
  };
  useEffect(() => {
    const restorePrintMode = () => setPrintMode('detail');
    window.addEventListener('afterprint', restorePrintMode);
    return () => window.removeEventListener('afterprint', restorePrintMode);
  }, []);

  if (!isHydrated) {
    return <main className="rpt rpt__body" aria-live="polite"><p>{t('common.loading', lang)}</p></main>;
  }
  if (Object.keys(answers).length === 0) return null;

  const hasVisionData = visionResults?.completed === true
    && Boolean(visionResults?.data?.left)
    && Boolean(visionResults?.data?.right);
  const hasFollowUp = report.followUpNotes.length > 0;
  const reportedConcerns = getReportedExperienceOptions(answers);
  const selectedPriorities = Array.isArray(discussionPriorities) ? discussionPriorities : [];
  const hasAppointmentNotes = Boolean(appointmentFollowUp?.appointmentDate || appointmentFollowUp?.professionalNotes || appointmentFollowUp?.followUpPlan || appointmentFollowUp?.nextAppointmentDate);
  const hasDiscussion = report.discussionPoints.length > 0;
  const orderedDiscussionPoints = [...report.discussionPoints].sort((a, b) => {
    const score = (point) => {
      const sourceIds = new Set((point.sources || []).map((source) => source.id));
      const selectedIndex = selectedPriorities.findIndex((priorityId) => sourceIds.has(priorityId));
      if (selectedIndex >= 0) return 10 - selectedIndex;
      if (point.id === 'activity_impact_detail' && report.activitiesContext?.affected?.length) return 1;
      return 0;
    };
    return score(b) - score(a);
  });
  const sourcesText = (sources = []) => sources
    .map((source) => `${localized(source.label, lang)}: ${localized(source.answer, lang)}`)
    .join(' · ');

  return (
    <div className={`rpt${printMode === 'brief' ? ' rpt--brief-print' : ''}`}>
      {isDemo && (
        <div className="rpt__demo-banner" role="status">
          <span className="material-symbols-outlined" aria-hidden="true">target</span>
          <span>{t('demo.banner', lang)}</span>
        </div>
      )}

      {kioskMode && <p className="rpt__kiosk-banner" role="status">{lang === 'hi' ? 'साझा टैबलेट मोड: पाँच मिनट की निष्क्रियता के बाद सेशन और स्थानीय डेटा साफ़ होगा।' : 'Shared tablet mode: the session and local data clear after five minutes of inactivity.'}</p>}

      <header className="rpt__topbar">
        <button className="rpt__back-btn" type="button" onClick={handleGoHome} aria-label={t('common.back', lang)}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>
        <span className="rpt__topbar-title">
          {lang === 'hi' ? 'आपका वार्तालाप मानचित्र' : 'Your Conversation Map'}
        </span>
        <span className="rpt__topbar-spacer" />
      </header>

      <main className="rpt__body">
        <section className="rpt__intro">
          <p className="rpt__kicker">{lang === 'hi' ? 'सत्र सारांश' : 'SESSION SUMMARY'}</p>
          <h1 className="rpt__headline">
            {lang === 'hi' ? 'आपका दृष्टि वार्तालाप मानचित्र' : 'Your Vision Conversation Map'}
          </h1>
          <p className="rpt__intro-desc">
            {lang === 'hi'
              ? 'आपके जवाबों का सारांश। इसे ऑप्टिशियन या नेत्र देखभाल पेशेवर के साथ बातचीत के लिए उपयोग करें।'
              : 'A structured summary of your responses. Use it to guide a conversation with an optician or eye-care professional.'}
          </p>
          <div className="rpt__meta-pill">
            <span className="material-symbols-outlined" aria-hidden="true">checklist</span>
            {lang === 'hi' ? `${report.answeredCount} निर्देशित जवाब` : `${report.answeredCount} guided responses`}
          </div>
          {isDemo && (
            <p className="rpt__sec-intro">
              {lang === 'hi'
                ? 'डेमो में 7 सवाल दिखाए गए हैं। रिपोर्ट के कुछ अतिरिक्त विवरण रमेश के तय किए गए उदाहरण डेटा से आते हैं, जिन्हें बातचीत का पूरा उदाहरण दिखाने के लिए शामिल किया गया है।'
                : 'The guided demo shows 7 questions. Some additional details in this example report are scripted Ramesh profile data, included to demonstrate the full conversation summary.'}
            </p>
          )}
        </section>

        {storageAvailable === false && (
          <div className="rpt__notice" role="status">
            <span className="material-symbols-outlined" aria-hidden="true">warning</span>
            <p>{lang === 'hi' ? 'इस ब्राउज़र में सेशन सेव नहीं हो पा रहा था। इस डिवाइस पर आपका डेटा सुरक्षित रूप से सहेजा नहीं गया हो सकता है।' : 'This browser could not save the session. Your data may not have been stored on this device.'}</p>
          </div>
        )}

        <div className="rpt__notice">
          <span className="material-symbols-outlined" aria-hidden="true">info</span>
          <p>
            {lang === 'hi'
              ? 'यह रिपोर्ट केवल आपके बताए गए जवाबों को व्यवस्थित करती है। यह आँखों की जाँच, निदान, दृष्टि मापन या प्रिस्क्रिप्शन नहीं है।'
              : 'This report organises self-reported responses only. It is not an eye examination, diagnosis, visual acuity measurement or prescription.'}
          </p>
        </div>

        {assistedCompletion && (
          <div className="rpt__notice" role="note">
            <span className="material-symbols-outlined" aria-hidden="true">record_voice_over</span>
            <p>{lang === 'hi' ? 'इस प्रश्नावली को पूरा करने में किसी सहायक ने प्रतिभागी की मदद की। जवाब प्रतिभागी के बताए अनुसार दर्ज किए गए।' : 'Someone assisted the participant in completing this questionnaire. Responses were recorded as provided by the participant.'}</p>
          </div>
        )}

        <section className="rpt__section rpt__print-summary" aria-labelledby="rpt-summary-priorities">
          <div className="rpt__sec-head">
            <div>
              <p className="rpt__kicker">{lang === 'hi' ? 'आपकी प्राथमिकताएँ' : 'YOUR PRIORITIES'}</p>
              <h2 id="rpt-summary-priorities" className="rpt__sec-title">{lang === 'hi' ? 'आप पहले किन बातों पर चर्चा करना चाहते हैं?' : 'What would you like to discuss first?'}</h2>
            </div>
            <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">flag</span>
          </div>
          <p className="rpt__sec-intro">{lang === 'hi' ? 'अधिकतम दो मुख्य अनुभव चुनें। यह आपकी बातचीत की प्राथमिकता है, चिकित्सकीय महत्व का क्रम नहीं।' : 'Choose up to two experiences. This is your conversation preference, not a clinical ranking.'}</p>
          <div className="rpt__priority-options" role="group" aria-label={lang === 'hi' ? 'चर्चा की प्राथमिकताएँ' : 'Conversation priorities'}>
            {reportedConcerns.map((concern) => {
              const selected = selectedPriorities.includes(concern.value);
              return <button key={concern.value} type="button" className={`rpt__priority-option${selected ? ' rpt__priority-option--selected' : ''}`} onClick={() => handlePriorityToggle(concern.value)} aria-pressed={selected} disabled={!selected && selectedPriorities.length >= 2}>
                <span className="material-symbols-outlined" aria-hidden="true">{selected ? 'check_circle' : 'radio_button_unchecked'}</span>
                {localized(concern.label, lang)}
              </button>;
            })}
          </div>
          {selectedPriorities.length > 0 && <p className="rpt__sec-intro">{lang === 'hi' ? `चुनी गई प्राथमिकताएँ: ${selectedPriorities.map((id) => localized(reportedConcerns.find((item) => item.value === id)?.label, lang)).join(' · ')}` : `Selected priorities: ${selectedPriorities.map((id) => localized(reportedConcerns.find((item) => item.value === id)?.label, lang)).join(' · ')}`}</p>}
          <div className="rpt__priority-context">
            {answers.primary_concern?.label && <p className="rpt__sec-intro"><strong>{lang === 'hi' ? 'मुख्य अनुभव: ' : 'Main experience: '}</strong>{localized(answers.primary_concern.label, lang)}</p>}
            {report.activitiesContext?.affected?.length > 0 && <p className="rpt__sec-intro"><strong>{lang === 'hi' ? 'प्रभावित गतिविधियाँ: ' : 'Activities reported as affected: '}</strong>{report.activitiesContext.affected.map((item) => localized(item.label, lang)).join(', ')}</p>}
            {report.activitiesContext?.impactDetails?.filter((item) => item.impacts.length > 0).map((item) => <p key={item.id} className="rpt__sec-intro"><strong>{localized(item.label, lang)}: </strong>{localized(item.answer, lang)}{item.frequencyAnswer ? ` · ${lang === 'hi' ? 'आवृत्ति: ' : 'Frequency: '}${localized(item.frequencyAnswer, lang)}` : ''}</p>)}
            {participantNote && <p className="rpt__sec-intro"><strong>{lang === 'hi' ? 'अतिरिक्त टिप्पणी: ' : 'Additional note: '}</strong>{participantNote}</p>}
          </div>
          {orderedDiscussionPoints.find((point) => ['main_experience_timeline', 'activity_impact_detail'].includes(point.id)) && (
            <div className="rpt__summary-prompt">
              <strong>{lang === 'hi' ? 'बातचीत शुरू करने का सुझाव' : 'Conversation starter'}</strong>
              <p>{localized(orderedDiscussionPoints.find((point) => ['main_experience_timeline', 'activity_impact_detail'].includes(point.id))?.prompt, lang)}</p>
            </div>
          )}
          {questionsToAsk && <p className="rpt__print-questions"><strong>{lang === 'hi' ? 'मेरे सवाल: ' : 'My questions: '}</strong>{questionsToAsk}</p>}
          <p className="rpt__print-scope">
            {lang === 'hi'
              ? 'यह सारांश केवल आपके बताए गए जवाबों को व्यवस्थित करता है। यह आँखों की जाँच, निदान या प्रिस्क्रिप्शन नहीं है।'
              : 'This brief summarises self-reported responses only. It is not an eye examination, diagnosis or prescription.'}
          </p>
          <div className="rpt__priority-notes">
            <VoiceNoteField
              id="rpt-questions-to-ask"
              label={lang === 'hi' ? 'मैं पेशेवर से ये सवाल पूछना चाहता/चाहती हूँ' : 'Questions I would like to ask the professional'}
              value={questionsToAsk || ''}
              onChange={setQuestionsToAsk}
              placeholder={lang === 'hi' ? 'अपने सवाल लिखें…' : 'Write questions you want to remember…'}
              rows={3}
              maxLength={1200}
              language={lang}
            />
          </div>
        </section>

        {report.activitiesContext && (
          <section className="rpt__section" aria-labelledby="rpt-activities">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'आपकी दिनचर्या' : 'YOUR ROUTINE'}</p>
                <h2 id="rpt-activities" className="rpt__sec-title">
                  {lang === 'hi' ? 'दैनिक दृष्टि संबंधी गतिविधियाँ' : 'Daily visual activities'}
                </h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">routine</span>
            </div>
            <div className="rpt__chip-row">
              {report.activitiesContext.selected.map((activity) => (
                <span key={activity.id} className={`rpt__chip${report.activitiesContext.primary?.id === activity.id ? ' rpt__chip--primary' : ''}`}>
                  {localized(activity.label, lang)}
                  {report.activitiesContext.primary?.id === activity.id && (
                    <span className="rpt__chip-tag">
                      <span className="material-symbols-outlined" aria-hidden="true">star</span>
                      {lang === 'hi' ? 'मुख्य' : 'Primary'}
                    </span>
                  )}
                </span>
              ))}
            </div>

            {report.activitiesContext.affected.length > 0 && (
              <>
                <p className="rpt__sec-intro">
                  {lang === 'hi' ? 'आपने बताया कि ये गतिविधियाँ प्रभावित महसूस होती हैं:' : 'Activities you said feel affected by the experience:'}
                </p>
                <div className="rpt__chip-row">
                  {report.activitiesContext.affected.map((activity) => (
                    <span key={activity.id} className="rpt__chip rpt__chip--primary">{localized(activity.label, lang)}</span>
                  ))}
                </div>
                {report.activitiesContext.impactDetails?.filter((entry) => entry.impacts.length > 0).map((entry) => (
                  <div key={entry.id} className="rpt__impact-detail">
                    <strong>{localized(entry.label, lang)}</strong>
                    <p>{localized(entry.answer, lang)}</p>
                    {entry.frequencyAnswer && <p>{lang === 'hi' ? 'आवृत्ति: ' : 'Frequency: '}{localized(entry.frequencyAnswer, lang)}</p>}
                  </div>
                ))}
              </>
            )}
            {report.activitiesContext.affectedStatus && (
              <p className="rpt__sec-intro">
                {report.activitiesContext.affectedStatus === 'none'
                  ? (lang === 'hi' ? 'आपने सूचीबद्ध गतिविधियों में से किसी को प्रभावित नहीं बताया।' : 'You did not identify any listed activity as affected.')
                  : (lang === 'hi' ? 'आपने प्रभावित गतिविधियों के बारे में अनिश्चितता बताई।' : 'You were unsure which activities are affected.')}
              </p>
            )}
          </section>
        )}

        <section className="rpt__section" aria-labelledby="rpt-responses">
          <div className="rpt__sec-head">
            <div>
              <p className="rpt__kicker">{lang === 'hi' ? 'आपके जवाब' : 'YOUR RESPONSES'}</p>
              <h2 id="rpt-responses" className="rpt__sec-title">
                {lang === 'hi' ? 'बताए गए दृष्टि अनुभव और पृष्ठभूमि' : 'Reported experiences and background'}
              </h2>
            </div>
            <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">visibility</span>
          </div>

          <div className="rpt__groups">
            {report.groups.map((group) => {
              const isOpen = expandedGroups[group.id] ?? true;
              const panelId = `rpt-panel-${group.id}`;
              return (
                <article key={group.id} className="rpt__group">
                  <div className="rpt__group-head">
                    <div className="rpt__group-icon-box"><span className="material-symbols-outlined" aria-hidden="true">{group.icon}</span></div>
                    <div className="rpt__group-info">
                      <h3 className="rpt__group-title">{localized(group.title, lang)}</h3>
                      <p className="rpt__group-desc">{localized(group.description, lang)}</p>
                    </div>
                    <span className="rpt__group-count">{group.observations.length}</span>
                  </div>

                  <button type="button" className="rpt__expand-btn" onClick={() => toggleGroup(group.id)} aria-expanded={isOpen} aria-controls={panelId}>
                    <span>{isOpen ? (lang === 'hi' ? 'छिपाएँ' : 'Hide') : (lang === 'hi' ? 'देखें' : 'View')}</span>
                    <span className="material-symbols-outlined" aria-hidden="true">{isOpen ? 'expand_less' : 'expand_more'}</span>
                  </button>

                  <div id={panelId} className="rpt__obs-list" hidden={!isOpen}>
                    {group.observations.map((observation) => (
                      <div key={observation.id} className="rpt__obs">
                        <div className="rpt__obs-row">
                          <h4 className="rpt__obs-q">{localized(observation.question, lang)}</h4>
                          <span className="rpt__obs-answer">{localized(observation.answer, lang)}</span>
                        </div>
                        <p className="rpt__obs-detail">{localized(observation.detail, lang)}</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rpt__section" aria-labelledby="rpt-discuss">
          <div className="rpt__sec-head">
            <div>
              <p className="rpt__kicker">{lang === 'hi' ? 'अगली बातचीत' : 'NEXT CONVERSATION'}</p>
              <h2 id="rpt-discuss" className="rpt__sec-title">
                {lang === 'hi' ? 'ऑप्टिशियन से चर्चा के विषय' : 'Topics to discuss with an optician'}
              </h2>
            </div>
            <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">forum</span>
          </div>
          <p className="rpt__sec-intro">
            {lang === 'hi'
              ? 'ये विषय आपकी बताई गई गतिविधियों और जवाबों के आधार पर बातचीत शुरू करने में मदद कर सकते हैं। ये प्रिस्क्रिप्शन या चिकित्सा सलाह नहीं हैं।'
              : 'These topics are generated from the activities and answers you reported. They can help start a conversation; they are not prescriptions or medical advice.'}
          </p>

          {hasDiscussion ? (
            <div className="rpt__discuss-list">
              {orderedDiscussionPoints.map((point) => (
                <article key={point.id} className="rpt__discuss-item">
                  <div className="rpt__discuss-icon-box"><span className="material-symbols-outlined" aria-hidden="true">{point.icon}</span></div>
                  <div className="rpt__discuss-body">
                    <h3>{localized(point.title, lang)}</h3>
                    <p className="rpt__discuss-ctx">{localized(point.context, lang)}</p>
                    <div className="rpt__discuss-prompt">
                      <span className="material-symbols-outlined" aria-hidden="true">chat</span>
                      <p>{localized(point.prompt, lang)}</p>
                    </div>
                    {point.sources?.length > 0 && (
                      <p className="rpt__discuss-ctx">
                        <strong>{lang === 'hi' ? 'आधार:' : 'Based on:'}</strong> {sourcesText(point.sources)}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rpt__empty">
              <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
              <p>{lang === 'hi'
                ? 'आपके जवाबों से कोई विशेष चर्चा विषय नहीं निकला। आप अपनी सामान्य गतिविधियों और किसी भी चिंता के बारे में नेत्र देखभाल पेशेवर से बात कर सकते हैं।'
                : 'Your answers did not generate a specific discussion topic. You can still discuss your usual activities and any concerns with an eye-care professional.'}</p>
            </div>
          )}
        </section>

        {hasFollowUp && (
          <section className="rpt__section" aria-labelledby="rpt-followup">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'साझा करने योग्य बातें' : 'POINTS TO SHARE'}</p>
                <h2 id="rpt-followup" className="rpt__sec-title">
                  {lang === 'hi' ? 'पेशेवर से चर्चा करें' : 'Discuss with a professional'}
                </h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">medical_services</span>
            </div>
            <div className="rpt__followup-list">
              {report.followUpNotes.map((note) => (
                <article key={note.id} className="rpt__followup-item">
                  <h3>{localized(note.title, lang)}</h3>
                  <p>{localized(note.detail, lang)}</p>
                  {note.sources?.length > 0 && <p className="rpt__discuss-ctx"><strong>{lang === 'hi' ? 'आधार:' : 'Based on:'}</strong> {sourcesText(note.sources)}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {hasVisionData && (
          <section className="rpt__section" aria-labelledby="rpt-activity">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'वैकल्पिक गतिविधि' : 'OPTIONAL ACTIVITY'}</p>
                <h2 id="rpt-activity" className="rpt__sec-title">
                  {lang === 'hi' ? 'दिशा पहचान गतिविधि के जवाब' : 'Direction activity responses'}
                </h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">explore</span>
            </div>
            <div className="rpt__eye-grid">
              {['left', 'right'].map((eye) => {
                const result = visionResults.data[eye];
                const correct = Number.isFinite(result?.correct) ? result.correct : 0;
                const total = Number.isFinite(result?.total) ? result.total : 0;
                return (
                  <div key={eye} className="rpt__eye-card">
                    <span className="rpt__eye-label">{eye === 'left' ? (lang === 'hi' ? 'राउंड 1' : 'Round 1') : (lang === 'hi' ? 'राउंड 2' : 'Round 2')}</span>
                    <strong className="rpt__eye-score">{correct}/{total}</strong>
                    <span className="rpt__eye-caption">{lang === 'hi' ? 'दिखाई गई दिशा से मेल खाते चयन' : 'Selections matching the displayed orientation'}</span>
                  </div>
                );
              })}
            </div>
            <div className="rpt__inline-note">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
              <p>{lang === 'hi'
                ? 'ये केवल दो गतिविधि राउंड में दिए गए जवाब हैं। ये दृष्टि की तीक्ष्णता या दोनों आँखों के बीच अंतर नहीं बताते।'
                : 'These are responses from two activity rounds only. They do not describe visual acuity or differences between your eyes.'}</p>
            </div>
          </section>
        )}

        {visionResults?.skipped && (
          <div className="rpt__skipped">
            <span className="material-symbols-outlined" aria-hidden="true">visibility_off</span>
            <p>{lang === 'hi' ? 'आपने वैकल्पिक दिशा पहचान गतिविधि छोड़ दी।' : 'You skipped the optional direction awareness activity.'}</p>
          </div>
        )}

        {report.participantNote && (
          <section className="rpt__section" aria-labelledby="rpt-note">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'आपकी टिप्पणी' : 'YOUR NOTE'}</p>
                <h2 id="rpt-note" className="rpt__sec-title">{lang === 'hi' ? 'अतिरिक्त जानकारी' : 'Additional information'}</h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">edit_note</span>
            </div>
            <blockquote className="rpt__note-block"><p>{report.participantNote}</p></blockquote>
          </section>
        )}

        {hasAppointmentNotes && (
          <section className="rpt__section" aria-labelledby="rpt-appointment-followup">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'अपॉइंटमेंट नोट्स' : 'APPOINTMENT NOTES'}</p>
                <h2 id="rpt-appointment-followup" className="rpt__sec-title">{lang === 'hi' ? 'आपके दर्ज किए गए अगले कदम' : 'Your recorded follow-up'}</h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">event_available</span>
            </div>
            {appointmentFollowUp.appointmentDate && <p className="rpt__sec-intro">{lang === 'hi' ? 'अपॉइंटमेंट की तारीख: ' : 'Appointment date: '}{appointmentFollowUp.appointmentDate}</p>}
            {appointmentFollowUp.professionalNotes && <blockquote className="rpt__note-block"><p>{appointmentFollowUp.professionalNotes}</p></blockquote>}
            {appointmentFollowUp.followUpPlan && <blockquote className="rpt__note-block"><p>{appointmentFollowUp.followUpPlan}</p></blockquote>}
            {appointmentFollowUp.nextAppointmentDate && <p className="rpt__sec-intro">{lang === 'hi' ? 'अगली अपॉइंटमेंट: ' : 'Next appointment: '}{appointmentFollowUp.nextAppointmentDate}</p>}
          </section>
        )}

        <div className="rpt__disclaimer">
          <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
          <div>
            <h3>{lang === 'hi' ? 'महत्वपूर्ण सूचना' : 'Important reminder'}</h3>
            <p>{lang === 'hi'
              ? 'SightSteps एक जागरूकता और बातचीत सहायता टूल है। यह चिकित्सा निदान, पेशेवर जाँच या प्रिस्क्रिप्शन का विकल्प नहीं है।'
              : 'SightSteps is an awareness and conversation-support tool. It does not replace a medical diagnosis, professional eye examination or prescribed vision correction.'}</p>
          </div>
        </div>

        <div className="rpt__privacy">
          <span className="material-symbols-outlined" aria-hidden="true">shield</span>
          <div>
            <h3>{lang === 'hi' ? 'आपकी जानकारी इसी डिवाइस पर रहती है' : 'Your data stays on this device'}</h3>
            <p>{lang === 'hi'
              ? 'जवाब इसी डिवाइस के ब्राउज़र में सहेजे जाते हैं, जब स्थानीय स्टोरेज उपलब्ध हो। आपके जवाब किसी ऐप सर्वर पर नहीं भेजे जाते।'
              : 'Responses are saved in this device’s browser when local storage is available. Your answers are not sent to an application server.'}</p>
          </div>
        </div>

        <div className="rpt__actions">
          <button type="button" className="btn btn--primary btn--full btn--lg rpt__print-btn" onClick={() => printBrief('brief')}>
            <span className="material-symbols-outlined" aria-hidden="true">summarize</span>
            {lang === 'hi' ? 'एक-पृष्ठ प्राथमिकता सारांश प्रिंट करें' : 'Print one-page priority brief'}
          </button>
          <button type="button" className="btn btn--secondary btn--full" onClick={() => printBrief('detail')}>
            <span className="material-symbols-outlined" aria-hidden="true">print</span>
            {lang === 'hi' ? 'विस्तृत रिपोर्ट प्रिंट करें' : 'Print detailed report'}
          </button>
          <button type="button" className="btn btn--outline btn--full" onClick={() => navigate('/follow-up')}>
            <span className="material-symbols-outlined" aria-hidden="true">event_note</span>
            {lang === 'hi' ? 'अपॉइंटमेंट के बाद नोट्स जोड़ें' : 'Add after-appointment notes'}
          </button>
          {kioskMode && <button type="button" className="btn btn--danger btn--full" onClick={finishKiosk}>
            <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>
            {lang === 'hi' ? 'सेशन समाप्त करें और डेटा साफ़ करें' : 'Finish and clear kiosk session'}
          </button>}

          <button type="button" className="btn btn--secondary btn--full" onClick={handleNew}>
            <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
            {kioskMode ? (lang === 'hi' ? 'अगले प्रतिभागी के लिए सेशन शुरू करें' : 'Start next participant') : t('report.startNew', lang)}
          </button>

          {!showDeleteConfirm ? (
            <button type="button" className="btn btn--danger-outline btn--full" onClick={() => setShowDeleteConfirm(true)}>
              <span className="material-symbols-outlined" aria-hidden="true">delete</span>
              {lang === 'hi' ? 'मेरा डेटा हटाएँ' : 'Clear my data'}
            </button>
          ) : (
            <div className="rpt__delete-confirm">
              <p>
                <span className="material-symbols-outlined" aria-hidden="true">warning</span>
                {lang === 'hi' ? 'क्या आप वाकई अपना सारा सेशन डेटा हटाना चाहते हैं? यह पूर्ववत नहीं होगा।' : 'Are you sure you want to delete all saved SightSteps session data on this device? This cannot be undone.'}
              </p>
              <div className="rpt__delete-actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel', lang)}</button>
                <button type="button" className="btn btn--danger btn--sm" onClick={async () => { await reset(); navigate('/', { replace: true }); }}>
                  <span className="material-symbols-outlined" aria-hidden="true">delete_forever</span>
                  {t('common.yesDelete', lang)}
                </button>
              </div>
            </div>
          )}

          <button type="button" className="btn btn--ghost btn--full" onClick={handleGoHome}>
            {lang === 'hi' ? 'मुख्य पृष्ठ पर जाएँ' : 'Back to home'}
          </button>
        </div>
      </main>
    </div>
  );
}

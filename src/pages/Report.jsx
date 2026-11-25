import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { evaluateAnswers } from '../engine/ruleEngine.js';
import { evaluatePatterns } from '../engine/patternEngine.js';
import { getFlaggedCellCount } from '../engine/amslerSpatial.js';
import { normalizeDirectionAwarenessResult } from '../utils/visionActivity.js';
import { evaluateClusters } from '../data/patternClusters.js';
import patternDefinitions from '../data/patterns.js';
import { getReportedExperienceOptions } from '../data/questions.js';
import VoiceNoteField from '../components/VoiceNoteField.jsx';
import AppointmentPreparationPack from '../components/AppointmentPreparationPack.jsx';
import ClinicianBrief from '../components/ClinicianBrief.jsx';
import VisionExperienceProfile from '../components/VisionExperienceProfile.jsx';
import VisionEvidencePathways from '../components/VisionEvidencePathways.jsx';
import ConversationReview from '../components/ConversationReview.jsx';
import { buildAppointmentPreparationPack } from '../utils/appointmentPack.js';
import { normalizeDiscussionPriorities } from '../utils/reportPreferences.js';
import { buildVisionExperienceProfile } from '../engine/visionExperienceProfile.js';
import { buildVisionEvidencePathways } from '../engine/visionEvidencePathways.js';
import LocalSaveStatus from '../components/LocalSaveStatus.jsx';
import { formatVisionTimelineDate, sortVisionTimelineEntries } from '../utils/visionTimeline.js';
import './Report.css';

function localized(value, lang) {
  if (value && typeof value === 'object') return value[lang] || value.en || '';
  return value ?? '';
}

export default function Report() {
  const navigate = useNavigate();
  const {
    isHydrated,
    saveStatus,
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
    visionTimelineEntries,
    discussionPriorities,
    questionsToAsk,
    conversationReview,
    setConversationReview,
    assistedCompletion,
    kioskMode,
    markKioskCleanupFailed,
    amslerResults,
    setDiscussionPriorities,
    setQuestionsToAsk,
  } = useApp();

  const lang = language || 'en';
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [printMode, setPrintMode] = useState('detail');
  const [appointmentPack, setAppointmentPack] = useState(null);
  const [sessionActionError, setSessionActionError] = useState('');
  const [showClinicianBrief, setShowClinicianBrief] = useState(false);
  const [expandedPatterns, setExpandedPatterns] = useState({});

  const matchedPatterns = useMemo(() => evaluatePatterns(answers), [answers]);
  const matchedClusters = useMemo(
    () => evaluateClusters(matchedPatterns.map((p) => p.id)),
    [matchedPatterns]
  );

  const report = useMemo(() => evaluateAnswers(answers, {
    activities,
    primaryActivity,
    participantNote,
    countableQuestionIds: isDemo ? demoPersona?.demoQuestionIds : undefined,
  }), [answers, activities, primaryActivity, participantNote, isDemo, demoPersona]);
  const sortedTimelineEntries = useMemo(
    () => sortVisionTimelineEntries(visionTimelineEntries || []),
    [visionTimelineEntries],
  );
  const experienceProfile = useMemo(
    () => buildVisionExperienceProfile(answers, visionTimelineEntries || []),
    [answers, visionTimelineEntries],
  );
  const evidencePathways = useMemo(
    () => buildVisionEvidencePathways(answers, visionTimelineEntries || []),
    [answers, visionTimelineEntries],
  );

  // Do not redirect while IndexedDB is still restoring the saved session.
  useEffect(() => {
    if (isHydrated && Object.keys(answers).length === 0) {
      navigate('/', { replace: true });
    }
  }, [isHydrated, answers, navigate]);

  const toggleGroup = (id) => setExpandedGroups((previous) => ({ ...previous, [id]: !previous[id] }));
  const resetAndNavigate = async (path) => {
    setSessionActionError('');
    const cleared = await reset();
    if (cleared) navigate(path, { replace: true });
    else if (kioskMode) markKioskCleanupFailed();
    else setSessionActionError(lang === 'hi'
      ? 'स्थानीय डेटा साफ़ नहीं हो सका। कृपया फिर से प्रयास करें।'
      : 'Local session data could not be cleared. Please try again.');
  };
  const handleNew = () => resetAndNavigate(kioskMode ? '/kiosk' : '/');
  const finishKiosk = () => resetAndNavigate('/kiosk');
  // A demo's language is seeded from its persona (Ramesh uses Hindi).
  // Clear demo state before returning home so it does not change the landing page language.
  const handleGoHome = async () => {
    if (kioskMode || isDemo) {
      await resetAndNavigate(kioskMode ? '/kiosk' : '/');
      return;
    }
    navigate('/', { replace: true });
  };
  const handlePriorityToggle = (id) => {
    const current = selectedPriorities;
    if (current.includes(id)) setDiscussionPriorities(current.filter((item) => item !== id));
    else if (current.length < 2) setDiscussionPriorities([...current, id]);
  };
  const printBrief = (mode) => {
    if (mode === 'brief') {
      const priorities = selectedPriorities.map((id) => ({
        id,
        label: reportedConcerns.find((item) => item.value === id)?.label || '',
      }));
      setAppointmentPack(buildAppointmentPreparationPack({
        language: lang,
        priorities,
        activities: report.activitiesContext?.affected?.map((item) => item.label) || [],
        discussionPoints: orderedDiscussionPoints.slice(0, 3),
        questionsToAsk,
        timelineEntries: sortedTimelineEntries,
        amslerResults,
        visionResults,
        experienceProfile,
        evidencePathways,
        conversationReview,
        now: new Date(),
      }));
    } else {
      setAppointmentPack(null);
    }
    setPrintMode(mode);
    const openPrintDialog = () => window.print();
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => window.requestAnimationFrame(openPrintDialog));
    } else {
      window.setTimeout(openPrintDialog, 180);
    }
  };
  useEffect(() => {
    const restorePrintMode = () => {
      setPrintMode('detail');
      setAppointmentPack(null);
    };
    window.addEventListener('afterprint', restorePrintMode);
    return () => window.removeEventListener('afterprint', restorePrintMode);
  }, []);

  if (!isHydrated) {
    return <main className="rpt rpt__body" id="report-loading" tabIndex="-1" aria-live="polite"><p>{t('common.loading', lang)}</p></main>;
  }
  if (Object.keys(answers).length === 0) return null;

  const safeVisionResults = normalizeDirectionAwarenessResult(visionResults);
  const hasVisionData = safeVisionResults?.completed === true;
  const hasFollowUp = report.followUpNotes.length > 0;
  const reportedConcerns = getReportedExperienceOptions(answers);
  const selectedPriorities = normalizeDiscussionPriorities(
    discussionPriorities,
    reportedConcerns.map((concern) => concern.value),
  );
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

      <main className="rpt__body" id="main-content" tabIndex="-1">
        {sessionActionError && <p className="rpt__notice" role="alert">{sessionActionError}</p>}
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

        <LocalSaveStatus status={saveStatus} language={lang} />

        <div className="rpt__notice rpt__notice--compact" role="note">
          <span className="material-symbols-outlined" aria-hidden="true">info</span>
          <p>
            {lang === 'hi'
              ? 'प्रतिभागी द्वारा बताए गए अनुभवों का सारांश — यह निदान या आँखों की जाँच नहीं है।'
              : 'Participant-reported summary — not a diagnosis or an eye examination.'}
          </p>
        </div>

        {assistedCompletion && (
          <div className="rpt__notice" role="note">
            <span className="material-symbols-outlined" aria-hidden="true">record_voice_over</span>
            <p>{lang === 'hi' ? 'इस प्रश्नावली को पूरा करने में किसी सहायक ने प्रतिभागी की मदद की। जवाब प्रतिभागी के बताए अनुसार दर्ज किए गए।' : 'Someone assisted the participant in completing this questionnaire. Responses were recorded as provided by the participant.'}</p>
          </div>
        )}

        {(experienceProfile.hasReportedExperience || experienceProfile.hasActivityImpact || experienceProfile.hasTimelineEntries) && (
          <VisionExperienceProfile
            profile={experienceProfile}
            answers={answers}
            language={lang}
          />
        )}

        <VisionEvidencePathways pathways={evidencePathways} language={lang} />

        <ConversationReview
          value={conversationReview}
          onChange={setConversationReview}
          language={lang}
        />

        {matchedPatterns.length > 0 && (
          <section className="rpt__section rpt__patterns-section" aria-labelledby="rpt-patterns-heading">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'विश्लेषण' : 'ANALYSIS'}</p>
                <h2 id="rpt-patterns-heading" className="rpt__sec-title">{t('patterns.title', lang)}</h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">psychology</span>
            </div>
            <p className="rpt__sec-intro">{t('patterns.subtitle', lang)}</p>
            {matchedClusters.length > 0 && (
              <div className="rpt__clusters">
                {matchedClusters.map((cluster) => (
                  <div key={cluster.id} className="rpt__cluster-card">
                    <span className="material-symbols-outlined" aria-hidden="true">{cluster.icon}</span>
                    <div>
                      <strong>{localized(cluster.title, lang)}</strong>
                      <p>{localized(cluster.summary, lang)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="rpt__patterns-list">
              {matchedPatterns.map((pattern) => {
                const isExpanded = expandedPatterns[pattern.id] ?? false;
                return (
                  <article key={pattern.id} className="rpt__pattern-card">
                    <div className="rpt__pattern-head">
                      <div className="rpt__pattern-icon-box">
                        <span className="material-symbols-outlined" aria-hidden="true">{pattern.icon}</span>
                      </div>
                      <div className="rpt__pattern-info">
                        <h3 className="rpt__pattern-title">{localized(pattern.title, lang)}</h3>
                        <p className="rpt__pattern-desc">{localized(pattern.description, lang)}</p>
                      </div>
                    </div>
                    <div className="rpt__discuss-prompt">
                      <span className="material-symbols-outlined" aria-hidden="true">chat</span>
                      <p>{localized(pattern.discussionPrompt, lang)}</p>
                    </div>
                    <button
                      type="button"
                      className="rpt__pattern-expand-btn"
                      onClick={() => setExpandedPatterns((prev) => ({ ...prev, [pattern.id]: !prev[pattern.id] }))}
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? (lang === 'hi' ? 'छिपाएँ' : 'Hide') : (lang === 'hi' ? 'हम यह क्यों सुझा रहे हैं' : 'Why we are suggesting this')}</span>
                      <span className="material-symbols-outlined" aria-hidden="true">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    {isExpanded && (
                      <div className="rpt__pattern-sources">
                        {pattern.sources.map((source) => (
                          <p key={source.id} className="rpt__pattern-source-item">
                            <strong>{localized(source.label, lang)}:</strong> {localized(source.answer, lang)}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {matchedPatterns.length === 0 && (
          <section className="rpt__section rpt__patterns-section" aria-labelledby="rpt-patterns-zero-heading">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'विश्लेषण' : 'ANALYSIS'}</p>
                <h2 id="rpt-patterns-zero-heading" className="rpt__sec-title">{t('patterns.noneMatched.title', lang)}</h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">psychology</span>
            </div>
            <p className="rpt__sec-intro">{t('patterns.noneMatched.subtitle', lang)}</p>
            <div className="rpt__patterns-list">
              {patternDefinitions.map((pattern) => (
                <article key={pattern.id} className="rpt__pattern-card rpt__pattern-card--inactive">
                  <div className="rpt__pattern-head">
                    <div className="rpt__pattern-icon-box">
                      <span className="material-symbols-outlined" aria-hidden="true">{pattern.icon}</span>
                    </div>
                    <div className="rpt__pattern-info">
                      <h3 className="rpt__pattern-title">{localized(pattern.title, lang)}</h3>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {amslerResults?.completed && amslerResults.data && (
          <section className="rpt__section rpt__amsler-section" aria-labelledby="rpt-amsler-heading">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'स्व-निगरानी गतिविधि' : 'SELF-MONITORING'}</p>
                <h2 id="rpt-amsler-heading" className="rpt__sec-title">{lang === 'hi' ? 'एम्सलर ग्रिड गतिविधि का रिकॉर्ड' : 'Amsler Grid Activity Record'}</h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">grid_on</span>
            </div>
            <div className="rpt__amsler-grid">
              {['right', 'left'].map((eye) => {
                const eyeData = amslerResults.data[eye];
                const count = getFlaggedCellCount(eyeData);
                return (
                  <div key={eye} className="rpt__amsler-eye-card">
                    <span className="rpt__amsler-eye-label">{eye === 'right' ? (lang === 'hi' ? 'दाईं आँख' : 'Right Eye') : (lang === 'hi' ? 'बाईं आँख' : 'Left Eye')}</span>
                    <strong className="rpt__amsler-eye-count">{count}</strong>
                    <span className="rpt__amsler-eye-caption">{lang === 'hi' ? 'क्षेत्र चिह्नित' : 'regions flagged'}</span>
                  </div>
                );
              })}
            </div>
            <div className="rpt__inline-note">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
              <p>{lang === 'hi'
                ? 'यह प्रतिभागी द्वारा ग्रिड पर चिह्नित क्षेत्रों का रिकॉर्ड है। कोई क्षेत्र चिह्नित न होना दृष्टि की समस्या को खारिज नहीं करता। नई टेढ़ी, धुंधली या गायब रेखाएँ/क्षेत्र दिखें तो नियमित अपॉइंटमेंट की प्रतीक्षा किए बिना शीघ्र नेत्र-देखभाल पेशेवर से संपर्क करें।'
                : 'This records only the areas the participant chose to flag. No areas flagged does not rule out a vision problem. If new distortion, blurred or missing areas are noticed, contact an eye-care professional promptly rather than waiting for a routine appointment.'}</p>
            </div>
          </section>
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

        <section className="rpt__section rpt__timeline-section" aria-labelledby="rpt-timeline-heading">
          <div className="rpt__sec-head">
            <div>
              <p className="rpt__kicker">{lang === 'hi' ? 'समय के साथ आपके अनुभव' : 'YOUR EXPERIENCES OVER TIME'}</p>
              <h2 id="rpt-timeline-heading" className="rpt__sec-title">{lang === 'hi' ? 'मेरी दृष्टि टाइमलाइन' : 'My Vision Timeline'}</h2>
            </div>
            <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">timeline</span>
          </div>
          <p className="rpt__sec-intro">{lang === 'hi' ? 'आपके द्वारा तारीख के अनुसार दर्ज किए गए अनुभव। ये आपके अपने नोट्स हैं, कोई जाँच या चिकित्सकीय निष्कर्ष नहीं।' : 'Experiences you recorded by date. These are your own notes, not a test or clinical conclusion.'}</p>
          {sortedTimelineEntries.length > 0 ? (
            <ol className="rpt__timeline-list">
              {sortedTimelineEntries.map((entry) => (
                <li key={entry.id} className="rpt__timeline-entry">
                  <div className="rpt__timeline-meta">
                    <time dateTime={entry.date}>{formatVisionTimelineDate(entry.date, lang) + (entry.time ? ' · ' + entry.time : '')}</time>
                    <span>{lang === 'hi' ? 'आपके द्वारा दर्ज' : 'Participant-reported'}</span>
                  </div>
                  <h3>{localized(entry.experienceLabel, lang)}</h3>
                  {entry.context && <p><strong>{lang === 'hi' ? 'उस समय: ' : 'At the time: '}</strong>{entry.context}</p>}
                  {entry.impact && <p><strong>{lang === 'hi' ? 'आपका नोट: ' : 'Your note: '}</strong>{entry.impact}</p>}
                </li>
              ))}
            </ol>
          ) : (
            <div className="rpt__timeline-empty">
              <span className="material-symbols-outlined" aria-hidden="true">history</span>
              <p>{lang === 'hi' ? 'अभी कोई टाइमलाइन एंट्री नहीं है। अलग-अलग दिनों में अनुभव दर्ज करने से बातचीत के लिए समय-क्रम तैयार हो सकता है।' : 'There are no timeline entries yet. Recording experiences on different days can help you organise a chronological account for your conversation.'}</p>
            </div>
          )}
          <div className="rpt__timeline-actions">
            <p>{lang === 'hi' ? 'आप कभी भी एंट्री जोड़, बदल या हटा सकते हैं।' : 'You can add, edit or delete entries at any time.'}</p>
            <button type="button" className="btn btn--outline btn--full" onClick={() => navigate('/timeline')}>
              <span className="material-symbols-outlined" aria-hidden="true">edit_calendar</span>
              {sortedTimelineEntries.length > 0
                ? (lang === 'hi' ? 'टाइमलाइन बदलें' : 'Add or edit timeline')
                : (lang === 'hi' ? 'पहला अनुभव दर्ज करें' : 'Start your timeline')}
            </button>
          </div>
        </section>

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
                        <strong>{lang === 'hi' ? 'इस विषय से जुड़े आपके जवाब:' : 'Your responses linked to this topic:'}</strong> {sourcesText(point.sources)}
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
                  {note.sources?.length > 0 && <p className="rpt__discuss-ctx"><strong>{lang === 'hi' ? 'इस फॉलो-अप नोट से जुड़े आपके जवाब:' : 'Your responses linked to this follow-up note:'}</strong> {sourcesText(note.sources)}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="rpt__section rpt__appointment-section" aria-labelledby="rpt-appointment-followup">
          <div className="rpt__sec-head">
            <div>
              <p className="rpt__kicker">{lang === 'hi' ? 'अपॉइंटमेंट के बाद' : 'AFTER YOUR APPOINTMENT'}</p>
              <h2 id="rpt-appointment-followup" className="rpt__sec-title">{lang === 'hi' ? 'अपनी मुलाक़ात के नोट्स रखें' : 'Keep a record of your visit'}</h2>
            </div>
            <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">event_available</span>
          </div>
          <p className="rpt__sec-intro">
            {lang === 'hi'
              ? 'मुलाक़ात के बाद यहाँ चर्चा की गई बातों, अपने नोट्स और अगले कदमों को दर्ज करें।'
              : 'After your appointment, record what was discussed, your notes and any next steps.'}
          </p>
          {hasAppointmentNotes && (
            <div className="rpt__appointment-summary">
              {appointmentFollowUp.appointmentDate && <p><strong>{lang === 'hi' ? 'अपॉइंटमेंट की तारीख: ' : 'Appointment date: '}</strong>{appointmentFollowUp.appointmentDate}</p>}
              {appointmentFollowUp.professionalNotes && <p><strong>{lang === 'hi' ? 'चर्चा के नोट्स: ' : 'Visit notes: '}</strong>{appointmentFollowUp.professionalNotes}</p>}
              {appointmentFollowUp.followUpPlan && <p><strong>{lang === 'hi' ? 'अगले कदम: ' : 'Next steps: '}</strong>{appointmentFollowUp.followUpPlan}</p>}
              {appointmentFollowUp.nextAppointmentDate && <p><strong>{lang === 'hi' ? 'अगली अपॉइंटमेंट: ' : 'Next appointment: '}</strong>{appointmentFollowUp.nextAppointmentDate}</p>}
            </div>
          )}
          <div className="rpt__appointment-action">
            <button type="button" className="rpt__inline-action" onClick={() => navigate('/follow-up')}>
              <span className="material-symbols-outlined" aria-hidden="true">{hasAppointmentNotes ? 'edit_note' : 'add_circle'}</span>
              {hasAppointmentNotes
                ? (lang === 'hi' ? 'नोट्स देखें या संपादित करें' : 'View or edit appointment notes')
                : (lang === 'hi' ? 'अपॉइंटमेंट के बाद नोट्स जोड़ें' : 'Add after-appointment notes')}
              <span className="material-symbols-outlined rpt__inline-action-arrow" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        </section>

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
                const result = safeVisionResults.data[eye];
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

        {safeVisionResults?.skipped && (
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

        <div className="rpt__privacy">
          <span className="material-symbols-outlined" aria-hidden="true">shield</span>
          <div>
            <h3>{lang === 'hi' ? 'आपकी जानकारी इसी डिवाइस पर रहती है' : 'Your data stays on this device'}</h3>
            <p>{lang === 'hi'
              ? 'जवाब इसी डिवाइस के ब्राउज़र में सहेजे जाते हैं, जब स्थानीय स्टोरेज उपलब्ध हो। आपके जवाब किसी ऐप सर्वर पर नहीं भेजे जाते।'
              : 'Responses are saved in this device’s browser when local storage is available. Your answers are not sent to an application server.'}</p>
          </div>
        </div>

        <section className="rpt__disclaimer" aria-labelledby="rpt-full-disclaimer">
          <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
          <div>
            <h3 id="rpt-full-disclaimer">{lang === 'hi' ? 'महत्वपूर्ण सूचना और सीमाएँ' : 'Important information and limitations'}</h3>
            <p>{t('disclaimer.reportFull', lang)}</p>
          </div>
        </section>

        {appointmentPack && <AppointmentPreparationPack pack={appointmentPack} language={lang} />}

        <section className="rpt__clinician-section">
          <div className="rpt__clinician-card">
            <div className="rpt__clinician-copy">
              <span className="material-symbols-outlined rpt__clinician-icon" aria-hidden="true">clinical_notes</span>
              <div>
                <h3>{lang === 'hi' ? 'क्लिनिशियन सारांश' : 'Clinician Brief'}</h3>
                <p>{lang === 'hi'
                  ? 'एक पृष्ठ का प्रिंट-अनुकूल सारांश जिसमें अनुमानित पैटर्न, प्रतिभागी के अवलोकन, एम्सलर स्व-निगरानी गतिविधि का रिकॉर्ड और चर्चा विषय हैं।'
                  : 'A one-page print-friendly summary with inferred patterns, participant observations, the Amsler activity record and discussion topics.'}</p>
              </div>
            </div>
            <button type="button" className="btn btn--outline btn--full" onClick={() => setShowClinicianBrief(true)}>
              <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span>
              {t('clinicianBrief.open', lang)}
            </button>
          </div>
        </section>

        <section className="rpt__export-section" aria-labelledby="rpt-export-heading">
          <div className="rpt__export-card">
            <div className="rpt__export-copy">
              <p className="rpt__kicker">{lang === 'hi' ? 'अपॉइंटमेंट की तैयारी' : 'APPOINTMENT PREPARATION'}</p>
              <h2 id="rpt-export-heading">{lang === 'hi' ? 'अपना तैयारी पैक साथ ले जाएँ' : 'Take your preparation pack with you'}</h2>
              <p>{lang === 'hi'
                ? 'आपकी प्राथमिकताएँ, सवाल, चर्चा के विषय और हाल के पाँच टाइमलाइन अनुभव एक पृष्ठ पर।'
                : 'Your priorities, personal questions, discussion prompts and up to five recent timeline entries on one page.'}</p>
            </div>
            <p className="rpt__pack-includes">
              {lang === 'hi'
                ? `${selectedPriorities.length} प्राथमिकताएँ · ${questionsToAsk.trim() ? 'व्यक्तिगत सवाल' : 'सवाल जोड़ें'} · ${Math.min(3, orderedDiscussionPoints.length)} चर्चा विषय · ${Math.min(5, sortedTimelineEntries.length)} हाल के टाइमलाइन अनुभव`
                : `${selectedPriorities.length} priorities · ${questionsToAsk.trim() ? 'personal questions' : 'no personal questions yet'} · ${Math.min(3, orderedDiscussionPoints.length)} discussion prompts · ${Math.min(5, sortedTimelineEntries.length)} recent timeline entries`}
            </p>
            <button type="button" className="btn btn--primary btn--full btn--lg rpt__print-btn" onClick={() => printBrief('brief')}>
              <span className="material-symbols-outlined" aria-hidden="true">summarize</span>
              {lang === 'hi' ? 'अपॉइंटमेंट पैक प्रिंट करें' : 'Print appointment preparation pack'}
            </button>
            <div className="rpt__export-secondary">
              <span>{lang === 'hi' ? 'जवाबों सहित पूरी रिपोर्ट चाहिए?' : 'Need the complete report with all responses?'}</span>
              <button type="button" className="rpt__text-action" onClick={() => printBrief('detail')}>
                {lang === 'hi' ? 'विस्तृत रिपोर्ट प्रिंट करें' : 'Print detailed report'}
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        <section className="rpt__session-tools" aria-labelledby="rpt-session-heading">
          <div className="rpt__session-copy">
            <p className="rpt__kicker">{lang === 'hi' ? 'सेशन' : 'SESSION'}</p>
            <h2 id="rpt-session-heading">{lang === 'hi' ? 'सेशन प्रबंधित करें' : 'Manage this session'}</h2>
          </div>
          <div className="rpt__session-actions">
            <button type="button" className="rpt__session-link" onClick={kioskMode ? finishKiosk : handleNew}>
              <span className="material-symbols-outlined" aria-hidden="true">{kioskMode ? 'lock_reset' : 'refresh'}</span>
              {kioskMode
                ? (lang === 'hi' ? 'अगले प्रतिभागी के लिए साफ़ करें' : 'Clear for the next participant')
                : t('report.startNew', lang)}
            </button>
            {!showDeleteConfirm ? (
              <button type="button" className="rpt__session-link rpt__session-link--danger" onClick={() => setShowDeleteConfirm(true)}>
                <span className="material-symbols-outlined" aria-hidden="true">delete_outline</span>
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
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => resetAndNavigate(kioskMode ? '/kiosk' : '/')}>
                    <span className="material-symbols-outlined" aria-hidden="true">delete_forever</span>
                    {t('common.yesDelete', lang)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      {showClinicianBrief && <ClinicianBrief onClose={() => setShowClinicianBrief(false)} />}
    </div>
  );
}

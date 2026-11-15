import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { evaluateAnswers } from '../engine/ruleEngine.js';
import './Report.css';

function localized(value, lang) {
  if (value && typeof value === 'object') return value[lang] || value.en || '';
  return value || '';
}

export default function Report() {
  const navigate = useNavigate();
  const {
    language, answers, activities, primaryActivity,
    participantNote, visionResults, isDemo, reset,
  } = useApp();

  const lang = language || 'en';
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const report = useMemo(
    () => evaluateAnswers(answers, { activities, primaryActivity, participantNote }),
    [answers, activities, primaryActivity, participantNote]
  );

  useEffect(() => {
    if (Object.keys(answers).length === 0) navigate('/', { replace: true });
  }, [answers, navigate]);

  const toggleGroup = (id) => setExpandedGroups((p) => ({ ...p, [id]: !p[id] }));
  const handleNew = () => { reset(); navigate('/', { replace: true }); };

  const hasVisionData = visionResults?.completed === true && visionResults?.data?.left && visionResults?.data?.right;
  const hasFollowUp = report.followUpNotes.length > 0;
  const hasDiscussion = report.discussionPoints.length > 0;

  if (Object.keys(answers).length === 0) return null;

  return (
    <div className="rpt">
      {isDemo && (
        <div className="rpt__demo-banner" role="status">
          <span className="material-symbols-outlined" aria-hidden="true">target</span>
          <span>{t('demo.banner', lang)}</span>
        </div>
      )}

      <header className="rpt__topbar">
        <button className="rpt__back-btn" type="button" onClick={() => navigate('/')}
          aria-label={t('common.back', lang)}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>
        <span className="rpt__topbar-title">
          {lang === 'hi' ? 'आपका वार्तालाप मानचित्र' : 'Your Conversation Map'}
        </span>
        <span className="rpt__topbar-spacer" />
      </header>

      <main className="rpt__body">
        {/* ── 1. Introduction ── */}
        <section className="rpt__intro animate-fade-in">
          <p className="rpt__kicker">
            {lang === 'hi' ? 'सत्र सारांश' : 'SESSION SUMMARY'}
          </p>
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
            {lang === 'hi' ? `${report.answeredCount} जवाब शामिल` : `${report.answeredCount} responses included`}
          </div>
        </section>

        {/* ── Notice ── */}
        <div className="rpt__notice">
          <span className="material-symbols-outlined" aria-hidden="true">info</span>
          <p>
            {lang === 'hi'
              ? 'यह रिपोर्ट केवल आपके बताए गए जवाबों को व्यवस्थित करती है। यह आँखों की जाँच, निदान, दृष्टि मापन या प्रिस्क्रिप्शन नहीं है।'
              : 'This report organises only your self-reported responses. It is not an eye examination, diagnosis, visual acuity measurement or prescription.'}
          </p>
        </div>

        {/* ── 3. Daily visual activities ── */}
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
              {report.activitiesContext.selected.map((act) => (
                <span key={act.id} className={`rpt__chip${report.activitiesContext.primary?.id === act.id ? ' rpt__chip--primary' : ''}`}>
                  {localized(act.label, lang)}
                  {report.activitiesContext.primary?.id === act.id && (
                    <span className="rpt__chip-tag">
                      <span className="material-symbols-outlined" aria-hidden="true">star</span>
                      {lang === 'hi' ? 'मुख्य' : 'Primary'}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── 2. Reported vision experiences ── */}
        <section className="rpt__section" aria-labelledby="rpt-responses">
          <div className="rpt__sec-head">
            <div>
              <p className="rpt__kicker">{lang === 'hi' ? 'आपके जवाब' : 'YOUR RESPONSES'}</p>
              <h2 id="rpt-responses" className="rpt__sec-title">
                {lang === 'hi' ? 'बताए गए दृष्टि अनुभव' : 'Reported vision experiences'}
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
                    <div className="rpt__group-icon-box">
                      <span className="material-symbols-outlined" aria-hidden="true">{group.icon}</span>
                    </div>
                    <div className="rpt__group-info">
                      <h3 className="rpt__group-title">{localized(group.title, lang)}</h3>
                      <p className="rpt__group-desc">{localized(group.description, lang)}</p>
                    </div>
                    <span className="rpt__group-count">{group.observations.length}</span>
                  </div>

                  <button type="button" className="rpt__expand-btn" onClick={() => toggleGroup(group.id)}
                    aria-expanded={isOpen} aria-controls={panelId}>
                    <span>{isOpen ? (lang === 'hi' ? 'छिपाएँ' : 'Hide') : (lang === 'hi' ? 'देखें' : 'View')}</span>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  <div id={panelId} className="rpt__obs-list" hidden={!isOpen}>
                    {group.observations.map((obs) => (
                      <div key={obs.id} className="rpt__obs">
                        <div className="rpt__obs-row">
                          <h4 className="rpt__obs-q">{localized(obs.question, lang)}</h4>
                          <span className="rpt__obs-answer">{localized(obs.answer, lang)}</span>
                        </div>
                        <p className="rpt__obs-detail">{localized(obs.detail, lang)}</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── 4. Eye-care background is part of groups above ── */}

        {/* ── 5. Discussion topics ── */}
        <section className="rpt__section" aria-labelledby="rpt-discuss">
          <div className="rpt__sec-head">
            <div>
              <p className="rpt__kicker">{lang === 'hi' ? 'अगला कदम' : 'NEXT CONVERSATION'}</p>
              <h2 id="rpt-discuss" className="rpt__sec-title">
                {lang === 'hi' ? 'ऑप्टिशियन से चर्चा के विषय' : 'Topics to discuss with an optician'}
              </h2>
            </div>
            <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">forum</span>
          </div>

          <p className="rpt__sec-intro">
            {lang === 'hi'
              ? 'ये विषय आपकी बताई गई आदतों के आधार पर बातचीत शुरू करने में मदद कर सकते हैं। ये प्रिस्क्रिप्शन या चिकित्सा सलाह नहीं हैं।'
              : 'These topics can help start a conversation based on the habits you reported. They are not prescriptions or medical advice.'}
          </p>

          {hasDiscussion ? (
            <div className="rpt__discuss-list">
              {report.discussionPoints.map((pt) => (
                <article key={pt.id} className="rpt__discuss-item">
                  <div className="rpt__discuss-icon-box">
                    <span className="material-symbols-outlined" aria-hidden="true">{pt.icon}</span>
                  </div>
                  <div className="rpt__discuss-body">
                    <h3>{localized(pt.title, lang)}</h3>
                    <p className="rpt__discuss-ctx">{localized(pt.context, lang)}</p>
                    <div className="rpt__discuss-prompt">
                      <span className="material-symbols-outlined" aria-hidden="true">chat</span>
                      <p>{localized(pt.prompt, lang)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rpt__empty">
              <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
              <p>{lang === 'hi'
                ? 'आपके जवाबों से कोई विशेष चर्चा विषय नहीं निकला। ऑप्टिशियन आपकी ज़रूरतों के आधार पर सामान्य विकल्प बता सकते हैं।'
                : 'Your responses did not identify a specific discussion topic. An optician can explain general options based on your needs.'}</p>
            </div>
          )}
        </section>

        {/* ── Follow-up notes ── */}
        {hasFollowUp && (
          <section className="rpt__section" aria-labelledby="rpt-followup">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'ध्यान देने योग्य' : 'POINTS TO SHARE'}</p>
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
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Direction activity results ── */}
        {hasVisionData && (
          <section className="rpt__section" aria-labelledby="rpt-activity">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'वैकल्पिक गतिविधि' : 'OPTIONAL ACTIVITY'}</p>
                <h2 id="rpt-activity" className="rpt__sec-title">
                  {lang === 'hi' ? 'दिशा पहचान गतिविधि' : 'Direction activity responses'}
                </h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">explore</span>
            </div>
            <div className="rpt__eye-grid">
              {['left', 'right'].map((eye) => {
                const r = visionResults.data[eye];
                const correct = Number.isFinite(r?.correct) ? r.correct : 0;
                const total = Number.isFinite(r?.total) ? r.total : 0;
                return (
                  <div key={eye} className="rpt__eye-card">
                    <span className="rpt__eye-label">
                      {eye === 'left' ? (lang === 'hi' ? 'बाईं ओर' : 'Left side') : (lang === 'hi' ? 'दाईं ओर' : 'Right side')}
                    </span>
                    <strong className="rpt__eye-score">{correct}/{total}</strong>
                    <span className="rpt__eye-caption">
                      {lang === 'hi' ? 'सही दिशा पहचान' : 'Matching directions'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="rpt__inline-note">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
              <p>{lang === 'hi'
                ? 'ये केवल गतिविधि के दौरान दिए गए जवाब हैं। दृष्टि तीक्ष्णता या चिकित्सा परिणाम के रूप में न समझें।'
                : 'These are only responses recorded during the activity. They must not be interpreted as visual acuity or a medical result.'}</p>
            </div>
          </section>
        )}

        {visionResults?.skipped && (
          <div className="rpt__skipped">
            <span className="material-symbols-outlined" aria-hidden="true">visibility_off</span>
            <p>{lang === 'hi'
              ? 'आपने वैकल्पिक दिशा पहचान गतिविधि छोड़ दी।'
              : 'You skipped the optional direction awareness activity.'}</p>
          </div>
        )}

        {/* ── 6. Participant note ── */}
        {report.participantNote && (
          <section className="rpt__section" aria-labelledby="rpt-note">
            <div className="rpt__sec-head">
              <div>
                <p className="rpt__kicker">{lang === 'hi' ? 'आपकी टिप्पणी' : 'YOUR NOTE'}</p>
                <h2 id="rpt-note" className="rpt__sec-title">
                  {lang === 'hi' ? 'अतिरिक्त जानकारी' : 'Additional information'}
                </h2>
              </div>
              <span className="material-symbols-outlined rpt__sec-icon" aria-hidden="true">edit_note</span>
            </div>
            <blockquote className="rpt__note-block">
              <p>{report.participantNote}</p>
            </blockquote>
          </section>
        )}

        {/* ── Disclaimer ── */}
        <div className="rpt__disclaimer">
          <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
          <div>
            <h3>{lang === 'hi' ? 'महत्वपूर्ण सूचना' : 'Important reminder'}</h3>
            <p>{lang === 'hi'
              ? 'SightSteps एक जागरूकता और बातचीत सहायता टूल है। यह चिकित्सा निदान, पेशेवर जाँच या प्रिस्क्रिप्शन का विकल्प नहीं है।'
              : 'SightSteps is an awareness and conversation-support tool. It does not replace a medical diagnosis, professional eye examination or prescribed vision correction.'}</p>
          </div>
        </div>

        {/* ── Privacy ── */}
        <div className="rpt__privacy">
          <span className="material-symbols-outlined" aria-hidden="true">shield</span>
          <div>
            <h3>{lang === 'hi' ? 'आपकी जानकारी सुरक्षित है' : 'Your data stays on this device'}</h3>
            <p>{lang === 'hi'
              ? 'सभी जवाब केवल इस डिवाइस पर सहेजे जाते हैं। कोई डेटा सर्वर पर नहीं भेजा जाता।'
              : 'All responses are saved locally on this device. No data is sent to any server.'}</p>
          </div>
        </div>

        {/* ── 7. Handoff actions ── */}
        <div className="rpt__actions">
          <button type="button" className="btn btn--primary btn--full btn--lg rpt__print-btn" onClick={() => window.print()}>
            <span className="material-symbols-outlined" aria-hidden="true">print</span>
            {lang === 'hi' ? 'मेरा वार्तालाप सारांश तैयार करें' : 'Prepare my conversation brief'}
          </button>

          <button type="button" className="btn btn--secondary btn--full" onClick={handleNew}>
            <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
            {t('report.startNew', lang)}
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
                {lang === 'hi'
                  ? 'क्या आप वाकई अपना सारा डेटा हटाना चाहते हैं? यह पूर्ववत नहीं होगा।'
                  : 'Are you sure? This action cannot be undone.'}
              </p>
              <div className="rpt__delete-actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowDeleteConfirm(false)}>
                  {t('common.cancel', lang)}
                </button>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => { reset(); navigate('/', { replace: true }); }}>
                  <span className="material-symbols-outlined" aria-hidden="true">delete_forever</span>
                  {t('common.yesDelete', lang)}
                </button>
              </div>
            </div>
          )}

          <button type="button" className="btn btn--ghost btn--full" onClick={() => navigate('/')}>
            {lang === 'hi' ? 'मुख्य पृष्ठ पर जाएँ' : 'Back to home'}
          </button>
        </div>
      </main>
    </div>
  );
}

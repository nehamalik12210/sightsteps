import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import rameshPersona, { rameshActivityDemoPersona } from '../data/demoPersona.js';
import { getResumePath } from '../utils/sessionRouting.js';
import { initVoices } from '../utils/tts.js';
import { getSavedSessions } from '../utils/storage.js';
import './Landing.css';

/** Optical-lens-inspired SVG illustration. Kept intentionally consistent with the current design. */
function OpticalIllustration({ className }) {
  return (
    <svg className={className} viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <circle cx="160" cy="160" r="150" stroke="#D4D9E2" strokeWidth="1" />
      <circle cx="160" cy="160" r="130" stroke="#D4D9E2" strokeWidth="0.5" strokeDasharray="4 6" />
      <path d="M60 160 A100 100 0 0 1 260 160" stroke="#1769D2" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <path d="M80 160 A80 80 0 0 0 240 160" stroke="#1769D2" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
      <defs>
        <radialGradient id="lens-grad" cx="0.45" cy="0.4" r="0.55">
          <stop offset="0%" stopColor="#E8F2FC" />
          <stop offset="70%" stopColor="#1769D2" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1769D2" stopOpacity="0.25" />
        </radialGradient>
        <radialGradient id="pupil-grad" cx="0.4" cy="0.35" r="0.5">
          <stop offset="0%" stopColor="#2B7AE8" />
          <stop offset="100%" stopColor="#12243A" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="160" r="90" fill="url(#lens-grad)" stroke="#1769D2" strokeWidth="1.5" opacity="0.8" />
      <circle cx="160" cy="160" r="55" fill="none" stroke="#1769D2" strokeWidth="2" opacity="0.4" />
      <circle cx="160" cy="160" r="45" fill="none" stroke="#1769D2" strokeWidth="1" opacity="0.2" />
      <circle cx="160" cy="160" r="28" fill="url(#pupil-grad)" />
      <ellipse cx="148" cy="148" rx="10" ry="6" fill="white" opacity="0.6" transform="rotate(-25 148 148)" />
      <circle cx="170" cy="145" r="3" fill="white" opacity="0.4" />
      <line x1="160" y1="40" x2="160" y2="65" stroke="#187A72" strokeWidth="1" opacity="0.5" />
      <line x1="160" y1="255" x2="160" y2="280" stroke="#187A72" strokeWidth="1" opacity="0.5" />
      <line x1="40" y1="160" x2="65" y2="160" stroke="#187A72" strokeWidth="1" opacity="0.5" />
      <line x1="255" y1="160" x2="280" y2="160" stroke="#187A72" strokeWidth="1" opacity="0.5" />
      <circle cx="160" cy="38" r="2" fill="#187A72" opacity="0.5" />
      <circle cx="160" cy="282" r="2" fill="#187A72" opacity="0.5" />
      <circle cx="38" cy="160" r="2" fill="#187A72" opacity="0.5" />
      <circle cx="282" cy="160" r="2" fill="#187A72" opacity="0.5" />
      <path d="M60 60 L75 60 M60 60 L60 75" stroke="#8C95A6" strokeWidth="0.75" opacity="0.4" />
      <path d="M260 60 L245 60 M260 60 L260 75" stroke="#8C95A6" strokeWidth="0.75" opacity="0.4" />
      <path d="M60 260 L75 260 M60 260 L60 245" stroke="#8C95A6" strokeWidth="0.75" opacity="0.4" />
      <path d="M260 260 L245 260 M260 260 L260 245" stroke="#8C95A6" strokeWidth="0.75" opacity="0.4" />
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const {
    isHydrated,
    sessionId,
    consentGiven,
    language,
    answers,
    activities,
    primaryActivity,
    visionResults,
    kioskMode,
    kioskCleanupFailed,
    markKioskCleanupFailed,
    isDemo,
    demoPersona,
    startDemo,
    reset,
    resumeSavedSession,
    removeSavedSession,
  } = useApp();

  const lang = language || 'en';
  const [demoStartPending, setDemoStartPending] = useState(false);
  const [includeVisionActivities, setIncludeVisionActivities] = useState(false);
  const [newJourneyPending, setNewJourneyPending] = useState(false);
  const [sessionActionError, setSessionActionError] = useState('');
  const hasSavedSession = Boolean(isHydrated && sessionId && consentGiven);

  useEffect(() => { void initVoices(); }, []);

  useEffect(() => {
    if (isHydrated && kioskCleanupFailed) {
      navigate('/kiosk?clearError=1', { replace: true });
    }
  }, [isHydrated, kioskCleanupFailed, navigate]);

  useEffect(() => {
    if (demoStartPending && isDemo && sessionId && consentGiven) {
      navigate('/intake', { replace: true });
    }
  }, [demoStartPending, isDemo, sessionId, consentGiven, navigate]);

  useEffect(() => {
    if (newJourneyPending && isHydrated && !sessionId && !consentGiven && !isDemo) {
      setNewJourneyPending(false);
      navigate('/onboarding', { state: { allowNewSession: true } });
    }
  }, [newJourneyPending, isHydrated, sessionId, consentGiven, isDemo, navigate]);

  const [savedSessions, setSavedSessions] = useState([]);
  const [historyBusyId, setHistoryBusyId] = useState(null);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    if (!isHydrated) return undefined;
    let active = true;
    getSavedSessions().then((records) => {
      if (active) setSavedSessions(records.filter((record) => record.sessionId !== sessionId));
    });
    return () => { active = false; };
  }, [isHydrated, sessionId]);

  const handleStart = async () => {
    if (newJourneyPending) return;
    setSessionActionError('');
    setNewJourneyPending(true);
    const cleared = await reset({ preserveHistory: !kioskMode });
    if (!cleared) {
      setNewJourneyPending(false);
      setSessionActionError(lang === 'hi'
        ? 'पिछला सेशन डेटा साफ़ नहीं हो सका। कृपया दोबारा प्रयास करें।'
        : 'The previous session could not be cleared. Please try again.');
    }
  };

  const handleResume = () => {
    navigate(getResumePath({
      answers,
      activities,
      primaryActivity,
      visionResults,
      isDemo,
      demoPersona,
    }));
  };

  const handleResumeSaved = async (savedSessionId) => {
    setHistoryBusyId(savedSessionId);
    setHistoryError('');
    try {
      const record = await resumeSavedSession(savedSessionId);
      if (!record) {
        setHistoryError(lang === 'hi'
          ? 'यह सेशन उपलब्ध नहीं है। सूची को रीफ़्रेश करें।'
          : 'This saved session is unavailable. Refresh the list and try again.');
        return;
      }
      navigate(getResumePath(record), { replace: true });
    } finally {
      setHistoryBusyId(null);
    }
  };

  const handleDeleteSaved = async (savedSessionId) => {
    const confirmed = window.confirm(lang === 'hi'
      ? 'क्या इस सहेजे गए सेशन को इस डिवाइस से हटाना है?'
      : 'Delete this saved session from this device?');
    if (!confirmed) return;
    setHistoryBusyId(savedSessionId);
    setHistoryError('');
    const deleted = await removeSavedSession(savedSessionId);
    if (deleted) setSavedSessions((items) => items.filter((item) => item.sessionId !== savedSessionId));
    else setHistoryError(lang === 'hi'
      ? 'सेशन हटाया नहीं जा सका। कृपया दोबारा प्रयास करें।'
      : 'The saved session could not be deleted. Please try again.');
    setHistoryBusyId(null);
  };

  const handleEndKiosk = async () => {
    setSessionActionError('');
    const cleared = await reset({ preserveHistory: false });
    if (cleared) navigate('/kiosk', { replace: true });
    else {
      markKioskCleanupFailed();
      setSessionActionError(lang === 'hi'
        ? 'सेशन डेटा साफ़ नहीं हो सका। कृपया फिर से प्रयास करें।'
        : 'Session data could not be cleared. Please try again.');
    }
  };

  const handleDemo = async () => {
    if (demoStartPending) return;
    setSessionActionError('');
    setDemoStartPending(true);
    const cleared = await reset({ preserveHistory: true });
    if (!cleared) {
      setDemoStartPending(false);
      setSessionActionError(lang === 'hi'
        ? 'पिछला सेशन डेटा साफ़ नहीं हो सका। कृपया दोबारा प्रयास करें।'
        : 'The previous session could not be cleared. Please try again.');
      return;
    }
    startDemo(includeVisionActivities ? rameshActivityDemoPersona : rameshPersona);
  };

  return (
    <main className="landing" id="main-content" tabIndex="-1">
      <div className="landing__layout">
        <div className="landing__content">
          <div className="landing__wordmark-row">
            <img
              className="landing__wordmark-logo"
              src="/sightsteps_logo.png"
              alt="SightSteps"
              width="1510"
              height="360"
              decoding="async"
            />
          </div>

          <h1 className="landing__headline" id="landing-title">
            {t('landing.tagline', lang)}
          </h1>
          <p className="landing__subheading">{t('landing.description', lang)}</p>

          <div className="landing__actions">
            {sessionActionError && <p role="alert" className="landing__subheading">{sessionActionError}</p>}
            {kioskMode ? (
              <>
                {sessionId ? (
                  <button className="btn btn--primary btn--full btn--lg" type="button" onClick={handleResume}>
                    <span className="material-symbols-outlined" aria-hidden="true">play_circle</span>
                    {lang === 'hi' ? 'वर्तमान प्रतिभागी का सेशन जारी रखें' : 'Continue current participant session'}
                  </button>
                ) : (
                  <button className="btn btn--primary btn--full btn--lg" type="button" onClick={() => navigate('/onboarding', { state: { allowNewSession: true } })}>
                    {lang === 'hi' ? 'कियोस्क सेटअप जारी रखें' : 'Continue kiosk setup'}
                  </button>
                )}
                <button className="btn btn--danger btn--full" type="button" onClick={handleEndKiosk}>
                  <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>
                  {lang === 'hi' ? 'सेशन समाप्त करें और डेटा साफ़ करें' : 'End session and clear data'}
                </button>
              </>
            ) : <>
            {hasSavedSession && (
              <button className="btn btn--secondary btn--full btn--lg landing__resume-btn" type="button" onClick={handleResume}>
                <span className="material-symbols-outlined" aria-hidden="true">play_circle</span>
                {lang === 'hi' ? 'सेशन जारी रखें' : 'Continue saved session'}
              </button>
            )}

            <button className="btn btn--primary btn--full btn--lg landing__start-btn" type="button" onClick={handleStart} disabled={!isHydrated || newJourneyPending}>
              {hasSavedSession
                ? (lang === 'hi' ? 'नई शुरुआत करें' : 'Start a new journey')
                : t('landing.start', lang)}
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </button>

            <section className="landing__demo-card" aria-labelledby="landing-demo-heading">
              <button className="landing__demo-btn" type="button" onClick={handleDemo} disabled={!isHydrated || demoStartPending}>
                <span className="landing__demo-avatar" aria-hidden="true">र</span>
                <span className="landing__demo-text">
                  <span className="landing__demo-label" id="landing-demo-heading">{t('landing.tryDemo', lang)}</span>
                  <span className="landing__demo-sub">
                    {includeVisionActivities
                      ? t('landing.demo.fullSummary', lang)
                      : t('landing.demo.shortSummary', lang)}
                  </span>
                </span>
                <span className="material-symbols-outlined landing__demo-arrow" aria-hidden="true">arrow_forward</span>
              </button>
              <label className="landing__demo-option" htmlFor="landing-demo-include-vision">
                <input
                  id="landing-demo-include-vision"
                  type="checkbox"
                  checked={includeVisionActivities}
                  onChange={(event) => setIncludeVisionActivities(event.target.checked)}
                  disabled={demoStartPending}
                />
                <span className="landing__demo-option-text">
                  <strong>{t('landing.demo.includeVision', lang)}</strong>
                  <small>{t('landing.demo.includeVisionHelp', lang)}</small>
                </span>
              </label>
            </section>
            <button className="btn btn--outline btn--full" type="button" onClick={() => navigate('/kiosk')} disabled={!isHydrated}>
              <span className="material-symbols-outlined" aria-hidden="true">tablet_mac</span>
              {lang === 'hi' ? 'साझा टैबलेट / कियोस्क मोड' : 'Shared tablet / kiosk mode'}
            </button>
            </>}
          </div>

          <div className="landing__trust-strip">
            <div className="landing__trust-item"><span className="material-symbols-outlined" aria-hidden="true">translate</span><span>{t('landing.trust.bilingual', lang)}</span></div>
            <div className="landing__trust-item"><span className="material-symbols-outlined" aria-hidden="true">smartphone</span><span>{t('landing.trust.local', lang)}</span></div>
            <div className="landing__trust-item"><span className="material-symbols-outlined" aria-hidden="true">accessibility_new</span><span>{t('landing.trust.accessible', lang)}</span></div>
          </div>

          <p className="landing__disclaimer">
            <span className="material-symbols-outlined" aria-hidden="true">info</span>
            {t('landing.notMedical', lang)}
          </p>
        </div>

        <div className="landing__illustration" aria-hidden="true">
          <OpticalIllustration className="landing__optical-svg" />
        </div>
      </div>

      <div className="landing__footer">
        <span className="landing__footer-badge">
          <span className="material-symbols-outlined" aria-hidden="true">verified</span>
          ZEISS Beyond Code 2026
        </span>
      </div>
          {!kioskMode && savedSessions.length > 0 && (
        <section className="saved-session-history" aria-labelledby="saved-session-heading">
          <div className="saved-session-history__heading">
            <div>
              <p className="saved-session-history__eyebrow">{lang === 'hi' ? 'इस डिवाइस पर' : 'ON THIS DEVICE'}</p>
              <h2 id="saved-session-heading">{lang === 'hi' ? 'सहेजे गए सेशन' : 'Saved sessions'}</h2>
              <p>{lang === 'hi' ? 'आप पिछले सेशन को फिर से खोल सकते हैं या हटा सकते हैं। डेटा केवल इसी डिवाइस पर रहता है।' : 'Resume a previous session or remove it. These records stay only on this device.'}</p>
            </div>
            <span className="saved-session-history__count">{savedSessions.length}/10</span>
          </div>
          <div className="saved-session-history__list">
            {savedSessions.map((record) => {
              const dateValue = record.updatedAt || record.startedAt;
              const dateLabel = dateValue && Number.isFinite(Date.parse(dateValue))
                ? new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateValue))
                : (lang === 'hi' ? 'तारीख उपलब्ध नहीं' : 'Date unavailable');
              return (
                <article className="saved-session-history__item" key={record.sessionId}>
                  <div className="saved-session-history__meta">
                    <strong>{lang === 'hi' ? 'दृष्टि अनुभव सेशन' : 'Vision experience session'}</strong>
                    <span>{dateLabel}</span>
                  </div>
                  <div className="saved-session-history__actions">
                    <button type="button" className="btn btn--secondary" onClick={() => handleResumeSaved(record.sessionId)} disabled={historyBusyId !== null}>
                      {historyBusyId === record.sessionId ? (lang === 'hi' ? 'खोल रहे हैं…' : 'Opening…') : (lang === 'hi' ? 'फिर खोलें' : 'Resume')}
                    </button>
                    <button type="button" className="saved-session-history__delete" onClick={() => handleDeleteSaved(record.sessionId)} disabled={historyBusyId !== null}>
                      {lang === 'hi' ? 'हटाएँ' : 'Delete'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {historyError && <p className="saved-session-history__error" role="alert">{historyError}</p>}
        </section>
      )}
</main>
  );
}

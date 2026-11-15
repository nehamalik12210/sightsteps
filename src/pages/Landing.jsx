import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import rameshPersona from '../data/demoPersona.js';
import { getResumePath } from '../utils/sessionRouting.js';
import { initVoices } from '../utils/tts.js';
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
    isDemo,
    demoPersona,
    startDemo,
    reset,
  } = useApp();

  const lang = language || 'en';
  const [demoStartPending, setDemoStartPending] = useState(false);
  const [newJourneyPending, setNewJourneyPending] = useState(false);
  const hasSavedSession = Boolean(isHydrated && sessionId && consentGiven);

  useEffect(() => { void initVoices(); }, []);

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

  const handleStart = async () => {
    if (newJourneyPending) return;
    setNewJourneyPending(true);
    await reset();
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

  const handleEndKiosk = async () => { await reset(); navigate('/kiosk', { replace: true }); };

  const handleDemo = () => {
    if (demoStartPending) return;
    setDemoStartPending(true);
    startDemo(rameshPersona);
  };

  return (
    <main className="landing">
      <div className="landing__layout">
        <div className="landing__content">
          <div className="landing__wordmark-row">
            <svg className="landing__wordmark-icon" viewBox="0 0 40 40" width="36" height="36" focusable="false" aria-hidden="true">
              <circle cx="20" cy="20" r="18" fill="#1769D2" />
              <circle cx="20" cy="20" r="10" fill="#FFFFFF" />
              <circle cx="20" cy="20" r="5" fill="#12243A" />
              <ellipse cx="17" cy="17" rx="2" ry="1.2" fill="white" opacity="0.7" transform="rotate(-20 17 17)" />
            </svg>
            <span className="landing__wordmark-text">SightSteps</span>
          </div>

          <h1 className="landing__headline" id="landing-title">
            {t('landing.tagline', lang)}
          </h1>
          <p className="landing__subheading">{t('landing.description', lang)}</p>

          <div className="landing__actions">
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

            <button className="landing__demo-btn" type="button" onClick={handleDemo} disabled={!isHydrated || demoStartPending}>
              <span className="landing__demo-avatar" aria-hidden="true">र</span>
              <span className="landing__demo-text">
                <span className="landing__demo-label">{t('landing.tryDemo', lang)}</span>
                <span className="landing__demo-sub">
                  {lang === 'hi' ? 'रमेश, 42, दर्ज़ी · 7 सवाल · लगभग 1 मिनट' : 'Ramesh, 42, Tailor · 7 guided questions · ~1 min'}
                </span>
              </span>
              <span className="material-symbols-outlined landing__demo-arrow" aria-hidden="true">arrow_forward</span>
            </button>
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
    </main>
  );
}

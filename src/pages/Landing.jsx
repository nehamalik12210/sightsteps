import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { getNextQuestion } from '../data/questions.js';
import rameshPersona from '../data/demoPersona.js';
import { initVoices } from '../utils/tts.js';
import './Landing.css';

function getResumePath(session) {
  if (session.visionResults) return '/report';
  if (getNextQuestion(session.answers || {})) return '/intake';
  if (!session.activities || session.activities.length === 0) return '/activities';
  if (session.isDemo && session.demoPersona?.skipVision) return '/intake';
  return '/vision';
}

/** Optical-lens-inspired SVG illustration */
function OpticalIllustration({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* Outermost ring — warm ivory stroke */}
      <circle cx="160" cy="160" r="150" stroke="#D4D9E2" strokeWidth="1" />
      <circle cx="160" cy="160" r="130" stroke="#D4D9E2" strokeWidth="0.5" strokeDasharray="4 6" />

      {/* Refraction arcs — cobalt blue */}
      <path
        d="M60 160 A100 100 0 0 1 260 160"
        stroke="#1769D2"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M80 160 A80 80 0 0 0 240 160"
        stroke="#1769D2"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.2"
      />

      {/* Main lens circle — gradient fill */}
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

      {/* Lens body */}
      <circle cx="160" cy="160" r="90" fill="url(#lens-grad)" stroke="#1769D2" strokeWidth="1.5" opacity="0.8" />

      {/* Iris ring */}
      <circle cx="160" cy="160" r="55" fill="none" stroke="#1769D2" strokeWidth="2" opacity="0.4" />
      <circle cx="160" cy="160" r="45" fill="none" stroke="#1769D2" strokeWidth="1" opacity="0.2" />

      {/* Pupil */}
      <circle cx="160" cy="160" r="28" fill="url(#pupil-grad)" />

      {/* Light refraction highlight */}
      <ellipse cx="148" cy="148" rx="10" ry="6" fill="white" opacity="0.6" transform="rotate(-25 148 148)" />
      <circle cx="170" cy="145" r="3" fill="white" opacity="0.4" />

      {/* Geometric measurement lines */}
      <line x1="160" y1="40" x2="160" y2="65" stroke="#187A72" strokeWidth="1" opacity="0.5" />
      <line x1="160" y1="255" x2="160" y2="280" stroke="#187A72" strokeWidth="1" opacity="0.5" />
      <line x1="40" y1="160" x2="65" y2="160" stroke="#187A72" strokeWidth="1" opacity="0.5" />
      <line x1="255" y1="160" x2="280" y2="160" stroke="#187A72" strokeWidth="1" opacity="0.5" />

      {/* Small teal calibration marks */}
      <circle cx="160" cy="38" r="2" fill="#187A72" opacity="0.5" />
      <circle cx="160" cy="282" r="2" fill="#187A72" opacity="0.5" />
      <circle cx="38" cy="160" r="2" fill="#187A72" opacity="0.5" />
      <circle cx="282" cy="160" r="2" fill="#187A72" opacity="0.5" />

      {/* Corner precision marks */}
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
    answers,
    activities,
    visionResults,
    isDemo,
    demoPersona,
    startDemo,
    reset,
  } = useApp();

  const hasSavedSession = Boolean(
    isHydrated && sessionId && consentGiven,
  );

  useEffect(() => {
    void initVoices();
  }, []);

  const handleStart = () => {
    reset();
    navigate('/onboarding');
  };

  const handleResume = () => {
    navigate(getResumePath({
      answers,
      activities,
      visionResults,
      isDemo,
      demoPersona,
    }));
  };

  const handleDemo = () => {
    startDemo(rameshPersona);
    navigate('/intake');
  };

  const lang = 'en';

  return (
    <main className="landing">
      <div className="landing__layout">
        {/* Left / top content column */}
        <div className="landing__content">
          <div className="landing__wordmark-row">
            <svg
              className="landing__wordmark-icon"
              viewBox="0 0 40 40"
              width="36"
              height="36"
              focusable="false"
              aria-hidden="true"
            >
              <circle cx="20" cy="20" r="18" fill="#1769D2" />
              <circle cx="20" cy="20" r="10" fill="#FFFFFF" />
              <circle cx="20" cy="20" r="5" fill="#12243A" />
              <ellipse cx="17" cy="17" rx="2" ry="1.2" fill="white" opacity="0.7" transform="rotate(-20 17 17)" />
            </svg>
            <span className="landing__wordmark-text">SightSteps</span>
          </div>

          <h1 className="landing__headline" id="landing-title">
            A clearer conversation starts here.
          </h1>

          <p className="landing__subheading">
            {t('landing.description', lang)}
          </p>

          {/* Actions */}
          <div className="landing__actions">
            {hasSavedSession && (
              <button
                className="btn btn--secondary btn--full btn--lg landing__resume-btn"
                type="button"
                onClick={handleResume}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  play_circle
                </span>
                Continue saved session
              </button>
            )}

            <button
              className="btn btn--primary btn--full btn--lg landing__start-btn"
              type="button"
              onClick={handleStart}
              disabled={!isHydrated}
            >
              {hasSavedSession
                ? 'Start a new journey'
                : t('landing.start', lang)}
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </button>

            <button
              className="landing__demo-btn"
              type="button"
              onClick={handleDemo}
              disabled={!isHydrated}
            >
              <span className="landing__demo-avatar" aria-hidden="true">र</span>
              <span className="landing__demo-text">
                <span className="landing__demo-label">
                  {t('landing.tryDemo', lang)}
                </span>
                <span className="landing__demo-sub">
                  Ramesh, 42, Tailor · 6 questions · ~45 sec
                </span>
              </span>
              <span className="material-symbols-outlined landing__demo-arrow" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Trust points */}
          <div className="landing__trust-strip">
            <div className="landing__trust-item">
              <span className="material-symbols-outlined" aria-hidden="true">translate</span>
              <span>{t('landing.trust.bilingual', lang)}</span>
            </div>
            <div className="landing__trust-item">
              <span className="material-symbols-outlined" aria-hidden="true">smartphone</span>
              <span>{t('landing.trust.local', lang)}</span>
            </div>
            <div className="landing__trust-item">
              <span className="material-symbols-outlined" aria-hidden="true">accessibility_new</span>
              <span>{t('landing.trust.accessible', lang)}</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="landing__disclaimer">
            <span className="material-symbols-outlined" aria-hidden="true">info</span>
            {t('landing.notMedical', lang)}
          </p>
        </div>

        {/* Right / bottom illustration column */}
        <div className="landing__illustration" aria-hidden="true">
          <OpticalIllustration className="landing__optical-svg" />
        </div>
      </div>

      {/* Footer badge */}
      <div className="landing__footer">
        <span className="landing__footer-badge">
          <span className="material-symbols-outlined" aria-hidden="true">verified</span>
          ZEISS Beyond Code 2026
        </span>
      </div>
    </main>
  );
}

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
  if (session.isDemo && session.demoPersona?.skipVision) return '/intake';
  return '/vision';
}

export default function Landing() {
  const navigate = useNavigate();

  const {
    isHydrated,
    sessionId,
    consentGiven,
    answers,
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
      <div className="landing__gradient-bg" aria-hidden="true" />

      <section
        className="landing__hero"
        aria-labelledby="landing-title"
      >
        <div className="landing__logo-ring" aria-hidden="true">
          <svg
            viewBox="0 0 100 100"
            width="80"
            height="80"
            focusable="false"
          >
            <defs>
              <linearGradient
                id="logo-grad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#0066CC" />
                <stop offset="100%" stopColor="#004e9f" />
              </linearGradient>
            </defs>

            <circle cx="50" cy="50" r="45" fill="url(#logo-grad)" />
            <circle cx="50" cy="50" r="25" fill="#fff" />
            <circle cx="50" cy="50" r="12" fill="#0066CC" />
            <circle cx="50" cy="50" r="5" fill="#1A1D23" />
          </svg>
        </div>

        <h1 id="landing-title" className="landing__title">
          SightSteps
        </h1>

        <p className="landing__tagline">
          {t('landing.tagline', lang)}
        </p>
      </section>

      <div className="landing__pills" aria-label="App features">
        <span className="landing__pill">
          <span className="material-symbols-outlined" aria-hidden="true">
            wifi_off
          </span>
          {t('landing.features.offline', lang)}
        </span>

        <span className="landing__pill">
          <span className="material-symbols-outlined" aria-hidden="true">
            lock
          </span>
          {t('landing.features.private', lang)}
        </span>

        <span className="landing__pill">
          <span className="material-symbols-outlined" aria-hidden="true">
            timer
          </span>
          {t('landing.features.minutes', lang)}
        </span>
      </div>

      <p className="landing__desc">
        {t('landing.description', lang)}
      </p>

      <div className="landing__actions">
        {hasSavedSession && (
          <button
            className="btn btn--secondary btn--full btn--lg landing__resume"
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
          className="btn btn--primary btn--full btn--lg landing__cta"
          type="button"
          onClick={handleStart}
          disabled={!isHydrated}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            visibility
          </span>
          {hasSavedSession
            ? 'Start a new assessment'
            : t('landing.start', lang)}
        </button>

        <button
          className="landing__demo-card"
          type="button"
          onClick={handleDemo}
          disabled={!isHydrated}
        >
          <span className="landing__demo-avatar" aria-hidden="true">
            र
          </span>

          <span className="landing__demo-info">
            <span className="landing__demo-label">
              {t('landing.tryDemo', lang)}
            </span>

            <span className="landing__demo-sub">
              6 questions · ~45 sec · optional Hindi voice
            </span>
          </span>

          <span
            className="material-symbols-outlined landing__demo-arrow"
            aria-hidden="true"
          >
            arrow_forward
          </span>
        </button>
      </div>

      <div className="landing__trust">
        <div className="landing__trust-item">
          <span className="material-symbols-outlined" aria-hidden="true">
            verified_user
          </span>
          <span>ZEISS Beyond Code 2026</span>
        </div>

        <span
          className="landing__trust-divider"
          aria-hidden="true"
        />

        <div className="landing__trust-item">
          <span className="material-symbols-outlined" aria-hidden="true">
            smartphone
          </span>
          <span>PWA · Works Offline</span>
        </div>
      </div>

      <p className="landing__disclaimer">
        <span className="material-symbols-outlined" aria-hidden="true">
          info
        </span>
        {t('landing.notMedical', lang)}
      </p>
    </main>
  );
}
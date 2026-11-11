import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { initVoices, unlockAudio, speakWhenReady } from '../utils/tts.js';
import questions from '../data/questions.js';
import rameshPersona from '../data/demoPersona.js';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { startSession, startDemo, reset } = useApp();

  // Always reset state when landing page mounts (fixes Hindi sticking after demo back)
  useEffect(() => {
    reset();
    initVoices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Language is always 'en' on landing after reset
  const lang = 'en';

  const handleStart = () => {
    startSession();
    navigate('/onboarding');
  };

  const handleDemo = () => {
    unlockAudio();
    // Speak Q1 in Hindi directly from this click (user gesture context)
    const q1Text = questions[0].text.hi;
    speakWhenReady(q1Text, 'hi', { rate: 0.85, pitch: 0.95 });
    startDemo(rameshPersona);
    navigate('/intake');
  };

  return (
    <div className="landing">
      {/* Gradient top section */}
      <div className="landing__gradient-bg" />

      {/* Hero */}
      <div className="landing__hero">
        <div className="landing__logo-ring">
          <svg viewBox="0 0 100 100" width="80" height="80">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#0066CC' }} />
                <stop offset="100%" style={{ stopColor: '#004e9f' }} />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#logo-grad)" />
            <circle cx="50" cy="50" r="25" fill="white" />
            <circle cx="50" cy="50" r="12" fill="#0066CC" />
            <circle cx="50" cy="50" r="5" fill="#1A1D23" />
          </svg>
        </div>
        <h1 className="landing__title">SightSteps</h1>
        <p className="landing__tagline">{t('landing.tagline', lang)}</p>
      </div>

      {/* Feature pills */}
      <div className="landing__pills">
        <div className="landing__pill">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>wifi_off</span>
          {t('landing.features.offline', lang)}
        </div>
        <div className="landing__pill">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
          {t('landing.features.private', lang)}
        </div>
        <div className="landing__pill">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>timer</span>
          {t('landing.features.minutes', lang)}
        </div>
      </div>

      {/* Description */}
      <p className="landing__desc">{t('landing.description', lang)}</p>

      {/* Actions */}
      <div className="landing__actions">
        <button className="btn btn--primary btn--full btn--lg landing__cta" onClick={handleStart}>
          <span className="material-symbols-outlined">visibility</span>
          {t('landing.start', lang)}
        </button>

        <div className="landing__demo-card" onClick={handleDemo}>
          <div className="landing__demo-avatar">
            <span>र</span>
          </div>
          <div className="landing__demo-info">
            <span className="landing__demo-label">{t('landing.tryDemo', lang)}</span>
            <span className="landing__demo-sub">6 questions · ~45 sec · Hindi voice</span>
          </div>
          <span className="material-symbols-outlined landing__demo-arrow">arrow_forward</span>
        </div>
      </div>

      {/* Trust section */}
      <div className="landing__trust">
        <div className="landing__trust-item">
          <span className="material-symbols-outlined">verified_user</span>
          <span>ZEISS Beyond Code 2026</span>
        </div>
        <div className="landing__trust-divider" />
        <div className="landing__trust-item">
          <span className="material-symbols-outlined">smartphone</span>
          <span>PWA · Works Offline</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="landing__disclaimer">
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
        {t('landing.notMedical', lang)}
      </p>
    </div>
  );
}

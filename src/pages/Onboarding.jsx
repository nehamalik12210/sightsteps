import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const { setLanguage, startSession, language, sessionId, consentGiven, assistedCompletion, setAssistedCompletion, kioskMode } = useApp();
  const [step, setStep] = useState(language ? 'consent' : 'language');
  const [selectedLang, setSelectedLang] = useState(language || null);
  const [startPending, setStartPending] = useState(false);
  const [historyConsentSelected, setHistoryConsentSelected] = useState(false);
  const lang = selectedLang || 'en';

  useEffect(() => {
    if (startPending && sessionId && consentGiven) {
      navigate('/activities', { replace: true });
    }
  }, [startPending, sessionId, consentGiven, navigate]);

  const handleLanguageSelect = (chosen) => {
    setSelectedLang(chosen);
    setLanguage(chosen);
    setStep('consent');
  };

  const handleExitLanguageStep = () => {
    // A language picked during an abandoned onboarding attempt is provisional;
    // do not leak it into the next home/participant experience.
    setLanguage(null);
    navigate(kioskMode ? '/kiosk' : '/', { replace: true });
  };

  const handleConsent = () => {
    if (startPending) return;
    setStartPending(true);
    startSession(selectedLang || language || 'en', !kioskMode && historyConsentSelected);
  };

  if (step === 'language') {
    return (
      <main className="onboarding" id="main-content" tabIndex="-1">
        <div className="onboarding__container animate-fade-in">
          <button className="onboarding__back" type="button" onClick={handleExitLanguageStep} aria-label={t('common.back', lang)}>
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          </button>
          <div className="onboarding__header">
            <div className="onboarding__step-indicator" aria-hidden="true">
              <span className="onboarding__step-dot onboarding__step-dot--active" />
              <span className="onboarding__step-dot" />
            </div>
            <h1 className="onboarding__heading" id="onboarding-language-title">Choose your language</h1>
            <p className="onboarding__heading-hi text-hindi">अपनी भाषा चुनें</p>
          </div>

          <div className="onboarding__lang-grid" role="group" aria-labelledby="onboarding-language-title">
            <button
              className={`onboarding__lang-card${selectedLang === 'en' ? ' onboarding__lang-card--selected' : ''}`}
              type="button"
              onClick={() => handleLanguageSelect('en')}
              aria-pressed={selectedLang === 'en'}
            >
              <span className="onboarding__lang-icon-box" aria-hidden="true"><span className="material-symbols-outlined">language</span></span>
              <span className="onboarding__lang-name">English</span>
              <span className="onboarding__lang-code">EN</span>
              {selectedLang === 'en' && <span className="onboarding__lang-check material-symbols-outlined" aria-hidden="true">check_circle</span>}
            </button>

            <button
              className={`onboarding__lang-card${selectedLang === 'hi' ? ' onboarding__lang-card--selected' : ''}`}
              type="button"
              onClick={() => handleLanguageSelect('hi')}
              aria-pressed={selectedLang === 'hi'}
            >
              <span className="onboarding__lang-icon-box onboarding__lang-icon-box--hi" aria-hidden="true"><span className="text-hindi onboarding__devanagari-char">अ</span></span>
              <span className="onboarding__lang-name text-hindi">हिन्दी</span>
              <span className="onboarding__lang-code">HI</span>
              {selectedLang === 'hi' && <span className="onboarding__lang-check material-symbols-outlined" aria-hidden="true">check_circle</span>}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="onboarding" id="main-content" tabIndex="-1">
      <div className="onboarding__container animate-fade-in">
        <button className="onboarding__back" type="button" onClick={() => setStep('language')} aria-label={t('common.back', lang)}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>

        <div className="onboarding__header">
          <div className="onboarding__step-indicator" aria-hidden="true">
            <span className="onboarding__step-dot onboarding__step-dot--done" />
            <span className="onboarding__step-dot onboarding__step-dot--active" />
          </div>
          <h1 className="onboarding__heading" id="onboarding-consent-title">{t('onboarding.consent.title', lang)}</h1>
        </div>

        <div className="onboarding__consent-card"><p className="onboarding__consent-text">{t('onboarding.consent.text', lang)}</p></div>

        <ul className="onboarding__points" role="list">
          <li className="onboarding__point">
            <span className="material-symbols-outlined onboarding__point-icon onboarding__point-icon--teal" aria-hidden="true">smartphone</span>
            <span>{lang === 'hi' ? 'सेशन डेटा केवल इसी डिवाइस पर सेव होता है' : 'Session data is stored locally on this device when browser storage is available'}</span>
          </li>
          <li className="onboarding__point">
            <span className="material-symbols-outlined onboarding__point-icon" aria-hidden="true">info</span>
            <span>{lang === 'hi' ? 'यह आँखों की जाँच, निदान या चश्मे का नंबर नहीं है' : 'This is not an eye examination, diagnosis or prescription'}</span>
          </li>
          <li className="onboarding__point">
            <span className="material-symbols-outlined onboarding__point-icon onboarding__point-icon--teal" aria-hidden="true">shield</span>
            <span>{lang === 'hi' ? 'यह पेशेवर नेत्र-देखभाल का विकल्प नहीं है' : 'It does not replace a professional eye-care consultation'}</span>
          </li>
        </ul>

        <label className="onboarding__assisted-toggle">
          <input type="checkbox" checked={assistedCompletion} onChange={(event) => setAssistedCompletion(event.target.checked)} />
          <span>{lang === 'hi' ? 'मैं किसी दूसरे प्रतिभागी की जवाब देने में मदद कर रहा/रही हूँ।' : 'I am helping another participant complete these answers.'}</span>
        </label>
        {!kioskMode && (
          <fieldset className="onboarding__history-consent">
            <legend>{lang === 'hi' ? 'सेशन इतिहास (वैकल्पिक)' : 'Saved session history (optional)'}</legend>
            <label className="onboarding__history-consent-option">
              <input
                id="history-consent-checkbox"
                type="checkbox"
                checked={historyConsentSelected}
                onChange={(event) => setHistoryConsentSelected(event.target.checked)}
                aria-describedby="history-consent-note"
              />
              <span>{t('onboarding.historyConsent.label', lang)}</span>
            </label>
            <p id="history-consent-note">{t('onboarding.historyConsent.note', lang)}</p>
          </fieldset>
        )}
        {kioskMode && <p className="onboarding__kiosk-note">{lang === 'hi' ? 'साझा-डिवाइस मोड सक्रिय है: पाँच मिनट की निष्क्रियता के बाद डेटा साफ़ होगा।' : 'Shared-device mode is active: session data clears after five minutes of inactivity.'}</p>}

        <button className="btn btn--primary btn--full btn--lg onboarding__continue-btn" type="button" onClick={handleConsent} disabled={startPending}>
          {t('onboarding.consent.agree', lang)}
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </main>
  );
}

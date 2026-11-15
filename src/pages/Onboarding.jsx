import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const { setLanguage, startSession, language } = useApp();

  const [step, setStep] = useState(
    language ? 'consent' : 'language',
  );
  const [selectedLang, setSelectedLang] = useState(language || null);

  const lang = selectedLang || 'en';

  const handleLanguageSelect = (chosen) => {
    setSelectedLang(chosen);
    setLanguage(chosen);
    setStep('consent');
  };

  const handleBack = () => {
    setStep('language');
  };

  const handleConsent = () => {
    startSession();
    navigate('/activities');
  };

  /* ---- STATE A: Language selection ---- */
  if (step === 'language') {
    return (
      <main className="onboarding">
        <div className="onboarding__container animate-fade-in">
          {/* Back to landing */}
          <button
            className="onboarding__back"
            type="button"
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          </button>

          <div className="onboarding__header">
            <div className="onboarding__step-indicator" aria-hidden="true">
              <span className="onboarding__step-dot onboarding__step-dot--active" />
              <span className="onboarding__step-dot" />
            </div>

            <h1 className="onboarding__heading" id="onboarding-language-title">
              {t('onboarding.chooseLanguage', 'en')}
            </h1>
            <p className="onboarding__heading-hi text-hindi">
              अपनी भाषा चुनें
            </p>
          </div>

          <div
            className="onboarding__lang-grid"
            role="group"
            aria-labelledby="onboarding-language-title"
          >
            {/* English */}
            <button
              className={`onboarding__lang-card${selectedLang === 'en' ? ' onboarding__lang-card--selected' : ''}`}
              type="button"
              onClick={() => handleLanguageSelect('en')}
            >
              <span className="onboarding__lang-icon-box" aria-hidden="true">
                <span className="material-symbols-outlined">language</span>
              </span>
              <span className="onboarding__lang-name">English</span>
              <span className="onboarding__lang-code">EN</span>
              {selectedLang === 'en' && (
                <span className="onboarding__lang-check material-symbols-outlined" aria-hidden="true">
                  check_circle
                </span>
              )}
            </button>

            {/* Hindi */}
            <button
              className={`onboarding__lang-card${selectedLang === 'hi' ? ' onboarding__lang-card--selected' : ''}`}
              type="button"
              onClick={() => handleLanguageSelect('hi')}
            >
              <span className="onboarding__lang-icon-box onboarding__lang-icon-box--hi" aria-hidden="true">
                <span className="text-hindi onboarding__devanagari-char">अ</span>
              </span>
              <span className="onboarding__lang-name text-hindi">हिन्दी</span>
              <span className="onboarding__lang-code">HI</span>
              {selectedLang === 'hi' && (
                <span className="onboarding__lang-check material-symbols-outlined" aria-hidden="true">
                  check_circle
                </span>
              )}
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ---- STATE B: Consent ---- */
  return (
    <main className="onboarding">
      <div className="onboarding__container animate-fade-in">
        {/* Back to language */}
        <button
          className="onboarding__back"
          type="button"
          onClick={handleBack}
          aria-label={t('common.back', lang)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>

        <div className="onboarding__header">
          <div className="onboarding__step-indicator" aria-hidden="true">
            <span className="onboarding__step-dot onboarding__step-dot--done" />
            <span className="onboarding__step-dot onboarding__step-dot--active" />
          </div>

          <h1 className="onboarding__heading" id="onboarding-consent-title">
            {t('onboarding.consent.title', lang)}
          </h1>
        </div>

        {/* Purpose explanation */}
        <div className="onboarding__consent-card">
          <p className="onboarding__consent-text">
            {t('onboarding.consent.text', lang)}
          </p>
        </div>

        {/* Key points */}
        <ul className="onboarding__points" role="list">
          <li className="onboarding__point">
            <span className="material-symbols-outlined onboarding__point-icon onboarding__point-icon--teal" aria-hidden="true">
              smartphone
            </span>
            <span>
              {lang === 'hi'
                ? 'सेशन डेटा केवल इसी डिवाइस पर सेव होता है'
                : 'Session data is stored locally on this device'}
            </span>
          </li>
          <li className="onboarding__point">
            <span className="material-symbols-outlined onboarding__point-icon" aria-hidden="true">
              info
            </span>
            <span>
              {lang === 'hi'
                ? 'यह आँखों की जाँच, निदान या चश्मे का नंबर नहीं है'
                : 'This is not an eye examination, diagnosis or prescription'}
            </span>
          </li>
          <li className="onboarding__point">
            <span className="material-symbols-outlined onboarding__point-icon onboarding__point-icon--teal" aria-hidden="true">
              shield
            </span>
            <span>
              {lang === 'hi'
                ? 'यह पेशेवर नेत्र-देखभाल का विकल्प नहीं है'
                : 'It does not replace a professional eye-care consultation'}
            </span>
          </li>
        </ul>

        {/* Continue */}
        <button
          className="btn btn--primary btn--full btn--lg onboarding__continue-btn"
          type="button"
          onClick={handleConsent}
        >
          {t('onboarding.consent.agree', lang)}
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
        </button>
      </div>
    </main>
  );
}

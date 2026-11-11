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

  const lang = language || 'en';

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setStep('consent');
  };

  const handleConsent = () => {
    // A new session is created once, after language selection and consent.
    startSession();
    navigate('/intake');
  };

  if (step === 'language') {
    return (
      <main className="onboarding animate-fade-in">
        <section
          className="onboarding__content"
          aria-labelledby="onboarding-language-title"
        >
          <div className="onboarding__icon-wrap" aria-hidden="true">
            <span className="material-symbols-outlined">
              translate
            </span>
          </div>

          <h1
            id="onboarding-language-title"
            className="onboarding__title"
          >
            {t('onboarding.chooseLanguage', 'en')}
          </h1>

          <p className="onboarding__subtitle text-hindi">
            अपनी भाषा चुनें
          </p>

          <div
            className="onboarding__language-grid"
            role="group"
            aria-label="Choose language"
          >
            <button
              className="onboarding__language-btn"
              type="button"
              onClick={() => handleLanguageSelect('en')}
            >
              <span
                className="onboarding__lang-icon-wrap"
                aria-hidden="true"
              >
                <span className="material-symbols-outlined">
                  language
                </span>
              </span>

              <span className="onboarding__language-name">
                English
              </span>

              <span className="onboarding__language-sub">
                EN
              </span>
            </button>

            <button
              className="onboarding__language-btn"
              type="button"
              onClick={() => handleLanguageSelect('hi')}
            >
              <span
                className="onboarding__lang-icon-wrap onboarding__lang-icon-wrap--hi"
                aria-hidden="true"
              >
                <span className="text-hindi onboarding__devanagari">
                  अ
                </span>
              </span>

              <span className="onboarding__language-name text-hindi">
                हिन्दी
              </span>

              <span className="onboarding__language-sub">
                HI
              </span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="onboarding animate-fade-in">
      <section
        className="onboarding__content"
        aria-labelledby="onboarding-consent-title"
      >
        <div
          className="onboarding__icon-wrap onboarding__icon-wrap--shield"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined">
            shield
          </span>
        </div>

        <h1
          id="onboarding-consent-title"
          className="onboarding__title"
        >
          {t('onboarding.consent.title', lang)}
        </h1>

        <div className="onboarding__consent-box">
          <p>{t('onboarding.consent.text', lang)}</p>
        </div>

        <ul className="onboarding__checklist">
          <li>
            <span
              className="onboarding__check-icon material-symbols-outlined"
              aria-hidden="true"
            >
              check_circle
            </span>
            <span>
              {lang === 'hi'
                ? 'सेशन डेटा इसी डिवाइस पर सेव होता है'
                : 'Session data is saved on this device'}
            </span>
          </li>

          <li>
            <span
              className="onboarding__check-icon material-symbols-outlined"
              aria-hidden="true"
            >
              check_circle
            </span>
            <span>
              {lang === 'hi'
                ? 'यह चिकित्सा निदान नहीं है'
                : 'This is not a medical diagnosis'}
            </span>
          </li>

          <li>
            <span
              className="onboarding__check-icon material-symbols-outlined"
              aria-hidden="true"
            >
              check_circle
            </span>
            <span>
              {lang === 'hi'
                ? 'यह पेशेवर आँखों की जाँच का विकल्प नहीं है'
                : 'It does not replace a professional eye examination'}
            </span>
          </li>
        </ul>

        <button
          className="btn btn--primary btn--full btn--lg"
          type="button"
          onClick={handleConsent}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
          {t('onboarding.consent.agree', lang)}
        </button>
      </section>
    </main>
  );
}
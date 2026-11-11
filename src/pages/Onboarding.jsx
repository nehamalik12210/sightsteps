import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const { setLanguage, giveConsent, startSession, language } = useApp();
  const [step, setStep] = useState(language ? 'consent' : 'language');

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setStep('consent');
  };

  const handleConsent = () => {
    giveConsent();
    startSession();
    navigate('/intake');
  };

  const lang = language || 'en';

  if (step === 'language') {
    return (
      <div className="onboarding animate-fade-in">
        <div className="onboarding__content">
          <div className="onboarding__icon-wrap">
            <span className="material-symbols-outlined">translate</span>
          </div>
          <h2 className="onboarding__title">
            {t('onboarding.chooseLanguage', 'en')}
          </h2>
          <p className="onboarding__subtitle text-hindi">
            अपनी भाषा चुनें
          </p>

          <div className="onboarding__language-grid">
            <button
              className="onboarding__language-btn"
              onClick={() => handleLanguageSelect('en')}
            >
              <div className="onboarding__lang-icon-wrap">
                <span className="material-symbols-outlined">language</span>
              </div>
              <span className="onboarding__language-name">English</span>
              <span className="onboarding__language-sub">EN</span>
            </button>
            <button
              className="onboarding__language-btn"
              onClick={() => handleLanguageSelect('hi')}
            >
              <div className="onboarding__lang-icon-wrap onboarding__lang-icon-wrap--hi">
                <span className="text-hindi" style={{ fontSize: '1.5rem', fontWeight: 700 }}>अ</span>
              </div>
              <span className="onboarding__language-name text-hindi">हिन्दी</span>
              <span className="onboarding__language-sub">HI</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding animate-fade-in">
      <div className="onboarding__content">
        <div className="onboarding__icon-wrap onboarding__icon-wrap--shield">
          <span className="material-symbols-outlined">shield</span>
        </div>
        <h2 className="onboarding__title">
          {t('onboarding.consent.title', lang)}
        </h2>

        <div className="onboarding__consent-box">
          <p>{t('onboarding.consent.text', lang)}</p>
        </div>

        <ul className="onboarding__checklist">
          <li>
            <span className="onboarding__check-icon material-symbols-outlined">check_circle</span>
            <span>{lang === 'hi' ? 'कोई डेटा क्लाउड पर नहीं जाता' : 'No data leaves this device'}</span>
          </li>
          <li>
            <span className="onboarding__check-icon material-symbols-outlined">check_circle</span>
            <span>{lang === 'hi' ? 'चिकित्सा निदान नहीं' : 'Not a medical diagnosis'}</span>
          </li>
          <li>
            <span className="onboarding__check-icon material-symbols-outlined">check_circle</span>
            <span>{lang === 'hi' ? 'केवल लेंस सुविधा सुझाव' : 'Lens feature suggestions only'}</span>
          </li>
        </ul>

        <button className="btn btn--primary btn--full btn--lg" onClick={handleConsent}>
          <span className="material-symbols-outlined">arrow_forward</span>
          {t('onboarding.consent.agree', lang)}
        </button>
      </div>
    </div>
  );
}

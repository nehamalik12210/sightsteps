import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import './ActivityProfile.css';

const ACTIVITY_OPTIONS = [
  {
    id: 'screen_work',
    label: { en: 'Screen work', hi: 'स्क्रीन पर काम' },
    desc: { en: 'Computer, phone, digital tasks', hi: 'कंप्यूटर, फ़ोन, डिजिटल काम' },
    icon: 'devices',
  },
  {
    id: 'reading',
    label: { en: 'Reading & study', hi: 'पढ़ाई और अध्ययन' },
    desc: { en: 'Books, documents, close reading', hi: 'किताबें, दस्तावेज़, पढ़ाई' },
    icon: 'menu_book',
  },
  {
    id: 'fine_detail',
    label: { en: 'Fine-detail work & crafts', hi: 'बारीक काम और दस्तकारी' },
    desc: { en: 'Tailoring, craft, detailed work', hi: 'सिलाई, शिल्प, बारीक काम' },
    icon: 'draw',
  },
  {
    id: 'driving',
    label: { en: 'Driving & travel', hi: 'ड्राइविंग और यात्रा' },
    desc: { en: 'Road use and distance viewing', hi: 'सड़क यात्रा और दूर देखना' },
    icon: 'directions_car',
  },
  {
    id: 'outdoor',
    label: { en: 'Outdoor activities', hi: 'बाहरी गतिविधियाँ' },
    desc: { en: 'Outdoor work, sunlight, varied surroundings', hi: 'बाहरी काम, धूप, विविध वातावरण' },
    icon: 'park',
  },
  {
    id: 'other',
    label: { en: 'Other', hi: 'अन्य' },
    desc: { en: 'Something not listed above', hi: 'ऊपर न दिया गया कोई काम' },
    icon: 'more_horiz',
  },
];

export default function ActivityProfile() {
  const navigate = useNavigate();
  const {
    language,
    activities: savedActivities,
    primaryActivity: savedPrimary,
    setActivities,
    setPrimaryActivity,
    isDemo,
    demoPersona,
  } = useApp();

  const lang = language || 'en';

  const [selected, setSelected] = useState(
    savedActivities.length ? new Set(savedActivities) : new Set()
  );
  const [step, setStep] = useState(
    savedActivities.length && savedPrimary ? 'primary' : 'select'
  );
  const [primary, setPrimary] = useState(savedPrimary || null);

  // Demo mode → skip to intake with pre-set activities
  useEffect(() => {
    if (isDemo && demoPersona) {
      if (!savedActivities.length && demoPersona.activities) {
        setActivities(demoPersona.activities);
        if (demoPersona.primaryActivity) {
          setPrimaryActivity(demoPersona.primaryActivity);
        }
      }
      navigate('/intake', { replace: true });
    }
  }, [isDemo, demoPersona, savedActivities, setActivities, setPrimaryActivity, navigate]);

  if (isDemo && demoPersona) return null;

  const toggleActivity = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (primary === id) setPrimary(null);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    if (selected.size === 0) return;

    if (selected.size === 1) {
      const onlyActivity = [...selected][0];
      setActivities([...selected]);
      setPrimaryActivity(onlyActivity);
      navigate('/intake');
      return;
    }

    if (step === 'select') {
      setActivities([...selected]);
      setStep('primary');
      return;
    }

    if (primary) {
      setPrimaryActivity(primary);
      navigate('/intake');
    }
  };

  const handleBack = () => {
    if (step === 'primary') {
      setStep('select');
      return;
    }
    navigate('/onboarding');
  };

  const progressValue = step === 'select' ? 1 : 2;
  const progressTotal = 2;

  return (
    <main className="ap">
      {/* Top bar */}
      <header className="ap__topbar">
        <button
          className="ap__back-btn"
          type="button"
          onClick={handleBack}
          aria-label={t('common.back', lang)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>

        <div className="ap__progress-wrap">
          <div className="ap__progress-track" role="progressbar" aria-valuenow={progressValue} aria-valuemin={1} aria-valuemax={progressTotal}>
            <div className="ap__progress-fill" style={{ width: `${(progressValue / progressTotal) * 100}%` }} />
          </div>
          <span className="ap__progress-label">
            {lang === 'hi'
              ? `चरण ${progressValue}/${progressTotal}`
              : `Step ${progressValue} of ${progressTotal}`}
          </span>
        </div>
      </header>

      <div className="ap__body">
        {/* ─── Step 1: Multi-select ─── */}
        {step === 'select' && (
          <div className="ap__section animate-fade-in">
            <div className="ap__heading-group">
              <h1 className="ap__title">
                {lang === 'hi'
                  ? 'आपकी रोज़मर्रा की दृश्य गतिविधियाँ'
                  : 'Your everyday visual activities'}
              </h1>
              <p className="ap__subtitle">
                {lang === 'hi'
                  ? 'आपकी दिनचर्या का हिस्सा कौन-कौन सी गतिविधियाँ हैं? एक या अधिक चुनें।'
                  : 'What activities are part of your daily routine? Select one or more.'}
              </p>
            </div>

            <div
              className="ap__grid"
              role="group"
              aria-label={lang === 'hi' ? 'गतिविधियाँ चुनें' : 'Select activities'}
            >
              {ACTIVITY_OPTIONS.map((act) => {
                const isOn = selected.has(act.id);
                return (
                  <button
                    key={act.id}
                    type="button"
                    className={`ap__card${isOn ? ' ap__card--on' : ''}`}
                    onClick={() => toggleActivity(act.id)}
                    aria-pressed={isOn}
                  >
                    <span className="ap__card-icon-wrap" aria-hidden="true">
                      <span className="material-symbols-outlined ap__card-icon">
                        {act.icon}
                      </span>
                    </span>

                    <span className="ap__card-label">
                      {act.label[lang] || act.label.en}
                    </span>
                    <span className="ap__card-desc">
                      {act.desc[lang] || act.desc.en}
                    </span>

                    {isOn && (
                      <span className="material-symbols-outlined ap__card-check" aria-hidden="true">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="ap__context-note">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
              {lang === 'hi'
                ? 'यह जानकारी आपकी बातचीत को अधिक उपयोगी बनाने के लिए है।'
                : 'This helps provide useful context for your conversation.'}
            </p>
          </div>
        )}

        {/* ─── Step 2: Primary activity ─── */}
        {step === 'primary' && (
          <div className="ap__section animate-fade-in">
            <div className="ap__heading-group">
              <h1 className="ap__title">
                {lang === 'hi'
                  ? 'सबसे ज़्यादा समय किसमें लगता है?'
                  : 'Which activity takes up most of your day?'}
              </h1>
              <p className="ap__subtitle">
                {lang === 'hi'
                  ? 'अपनी चुनी हुई गतिविधियों में से एक चुनें।'
                  : 'Choose one from the activities you selected.'}
              </p>
            </div>

            <div
              className="ap__primary-list"
              role="radiogroup"
              aria-label={lang === 'hi' ? 'मुख्य गतिविधि' : 'Primary activity'}
            >
              {ACTIVITY_OPTIONS.filter((a) => selected.has(a.id)).map((act) => {
                const isPrimary = primary === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    className={`ap__primary-row${isPrimary ? ' ap__primary-row--on' : ''}`}
                    onClick={() => setPrimary(act.id)}
                    role="radio"
                    aria-checked={isPrimary}
                  >
                    <span className="material-symbols-outlined ap__primary-row-icon" aria-hidden="true">
                      {act.icon}
                    </span>
                    <span className="ap__primary-row-label">
                      {act.label[lang] || act.label.en}
                    </span>
                    <span className="material-symbols-outlined ap__primary-radio" aria-hidden="true">
                      {isPrimary ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="ap__footer">
        <button
          type="button"
          className="btn btn--primary btn--full btn--lg ap__continue-btn"
          onClick={handleContinue}
          disabled={step === 'select' ? selected.size === 0 : !primary}
        >
          {t('common.continue', lang)}
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </main>
  );
}

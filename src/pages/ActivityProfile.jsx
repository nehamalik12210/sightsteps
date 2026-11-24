import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { getActivityDependentAnswerIds } from '../data/questions.js';
import LocalSaveStatus from '../components/LocalSaveStatus.jsx';
import './ActivityProfile.css';

const ACTIVITY_OPTIONS = [
  { id: 'screen_work', label: { en: 'Screen work', hi: 'स्क्रीन पर काम' }, desc: { en: 'Computer, phone, digital tasks', hi: 'कंप्यूटर, फ़ोन, डिजिटल काम' }, icon: 'devices' },
  { id: 'reading', label: { en: 'Reading & study', hi: 'पढ़ाई और अध्ययन' }, desc: { en: 'Books, documents, close reading', hi: 'किताबें, दस्तावेज़, पढ़ाई' }, icon: 'menu_book' },
  { id: 'fine_detail', label: { en: 'Fine-detail work & crafts', hi: 'बारीक काम और दस्तकारी' }, desc: { en: 'Tailoring, craft, detailed work', hi: 'सिलाई, शिल्प, बारीक काम' }, icon: 'draw' },
  { id: 'driving', label: { en: 'Driving & travel', hi: 'ड्राइविंग और यात्रा' }, desc: { en: 'Road use and distance viewing', hi: 'सड़क यात्रा और दूर देखना' }, icon: 'directions_car' },
  { id: 'outdoor', label: { en: 'Outdoor activities', hi: 'बाहरी गतिविधियाँ' }, desc: { en: 'Outdoor work, sunlight, varied surroundings', hi: 'बाहरी काम, धूप, विविध वातावरण' }, icon: 'park' },
  { id: 'other', label: { en: 'Other', hi: 'अन्य' }, desc: { en: 'Something not listed above', hi: 'ऊपर न दिया गया कोई काम' }, icon: 'more_horiz' },
];

export default function ActivityProfile() {
  const navigate = useNavigate();
  const {
    isHydrated,
    saveStatus,
    language,
    activities: savedActivities,
    primaryActivity: savedPrimary,
    answers,
    setActivities,
    setPrimaryActivity,
    setAnswer,
    clearAnswers,
    isDemo,
    demoPersona,
  } = useApp();

  const lang = language || 'en';
  const [selected, setSelected] = useState(() => new Set(savedActivities || []));
  const [step, setStep] = useState(savedActivities?.length && savedPrimary ? 'primary' : 'select');
  const [primary, setPrimary] = useState(savedPrimary || null);
  const [pendingProfile, setPendingProfile] = useState(null);
  const [customActivity, setCustomActivity] = useState(answers?.custom_activity_name?.value || '');
  const [customActivityError, setCustomActivityError] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    setSelected(new Set(savedActivities || []));
    setPrimary(savedPrimary || null);
    setCustomActivity(answers?.custom_activity_name?.value || '');
    setStep(savedActivities?.length && savedPrimary ? 'primary' : 'select');
  }, [isHydrated, answers?.custom_activity_name?.value]);

  useEffect(() => {
    if (!isDemo || !demoPersona) return;
    if (!savedActivities?.length && Array.isArray(demoPersona.activities)) {
      setActivities(demoPersona.activities);
      return;
    }
    if (!savedPrimary && demoPersona.primaryActivity) {
      setPrimaryActivity(demoPersona.primaryActivity);
      return;
    }
    if (savedActivities?.length && savedPrimary && savedActivities.includes(savedPrimary)) {
      navigate('/intake', { replace: true });
    }
  }, [isDemo, demoPersona, savedActivities, savedPrimary, setActivities, setPrimaryActivity, navigate]);

  // Wait until the activity profile has actually reached shared state before
  // entering the guarded questionnaire route.
  useEffect(() => {
    if (!pendingProfile) return;
    const activitiesMatch = savedActivities.length === pendingProfile.activities.length
      && savedActivities.every((id, index) => id === pendingProfile.activities[index]);
    if (activitiesMatch && savedPrimary === pendingProfile.primary) {
      setPendingProfile(null);
      navigate('/intake', { replace: true });
    }
  }, [pendingProfile, savedActivities, savedPrimary, navigate]);

  if (!isHydrated) {
    return <main className="ap" id="main-content" tabIndex="-1" aria-live="polite"><div className="ap__body"><p>{t('common.loading', lang)}</p></div></main>;
  }

  if (isDemo && demoPersona) return null;

  const toggleActivity = (id) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
      if (primary === id) {
        setPrimary(null);
        setPrimaryActivity(null);
      }
      if (id === 'other') {
        clearAnswers(['custom_activity_name']);
        setCustomActivity('');
        setCustomActivityError('');
      }
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const handleContinue = () => {
    if (pendingProfile || !selected.size) return;

    const selectedValues = [...selected];
    if (selectedValues.includes('other')) {
      const customLabel = customActivity.trim().slice(0, 80);
      if (!customLabel) {
        setCustomActivityError(lang === 'hi' ? 'कृपया अपनी अन्य गतिविधि लिखें।' : 'Please describe your other activity.');
        return;
      }
      setAnswer('custom_activity_name', customLabel, { en: customLabel, hi: customLabel });
      setCustomActivityError('');
    } else if (answers?.custom_activity_name) {
      clearAnswers(['custom_activity_name']);
    }
    const staleActivityAnswers = getActivityDependentAnswerIds(answers, savedActivities, selectedValues);
    if (staleActivityAnswers.length) clearAnswers(staleActivityAnswers);
    if (step === 'select') {
      setActivities(selectedValues);
      if (selectedValues.length === 1) {
        setPrimaryActivity(selectedValues[0]);
        setPendingProfile({ activities: selectedValues, primary: selectedValues[0] });
      } else {
        setStep('primary');
        if (primary && !selected.has(primary)) setPrimary(null);
      }
      return;
    }

    if (primary && selected.has(primary)) {
      setActivities(selectedValues);
      setPrimaryActivity(primary);
      setPendingProfile({ activities: selectedValues, primary });
    }
  };

  const handleBack = () => {
    if (step === 'primary') {
      setStep('select');
      return;
    }
    navigate('/', { replace: true });
  };

  const progressValue = step === 'select' ? 1 : 2;

  return (
    <main className="ap" id="main-content" tabIndex="-1">
      <header className="ap__topbar">
        <button className="ap__back-btn" type="button" onClick={handleBack} disabled={Boolean(pendingProfile)} aria-label={t('common.back', lang)}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>
        <div className="ap__progress-wrap">
          <div className="ap__progress-track" role="progressbar" aria-label={lang === 'hi' ? 'प्रोफ़ाइल प्रगति' : 'Profile progress'} aria-valuenow={progressValue} aria-valuemin={1} aria-valuemax={2}>
            <div className="ap__progress-fill" style={{ width: `${progressValue * 50}%` }} />
          </div>
          <span className="ap__progress-label">{lang === 'hi' ? `चरण ${progressValue}/2` : `Step ${progressValue} of 2`}</span>
        </div>
      </header>

      <div className="ap__body">
        <LocalSaveStatus status={saveStatus} language={lang} />
        {step === 'select' && (
          <div className="ap__section animate-fade-in">
            <div className="ap__heading-group">
              <h1 className="ap__title">{lang === 'hi' ? 'आपकी रोज़मर्रा की दृश्य गतिविधियाँ' : 'Your everyday visual activities'}</h1>
              <p className="ap__subtitle">{lang === 'hi' ? 'आपकी दिनचर्या का हिस्सा कौन-कौन सी गतिविधियाँ हैं? एक या अधिक चुनें।' : 'What activities are part of your daily routine? Select one or more.'}</p>
            </div>
            <div className="ap__grid" role="group" aria-label={lang === 'hi' ? 'गतिविधियाँ चुनें' : 'Select activities'}>
              {ACTIVITY_OPTIONS.map((activity) => {
                const isOn = selected.has(activity.id);
                return (
                  <button key={activity.id} type="button" className={`ap__card${isOn ? ' ap__card--on' : ''}`} onClick={() => toggleActivity(activity.id)} disabled={Boolean(pendingProfile)} aria-pressed={isOn}>
                    <span className="ap__card-icon-wrap" aria-hidden="true"><span className="material-symbols-outlined ap__card-icon">{activity.icon}</span></span>
                    <span className="ap__card-label">{activity.id === 'other' && customActivity.trim() ? (activity.label[lang] || activity.label.en) + ': ' + customActivity.trim() : (activity.label[lang] || activity.label.en)}</span>
                    <span className="ap__card-desc">{activity.desc[lang] || activity.desc.en}</span>
                    {isOn && <span className="material-symbols-outlined ap__card-check" aria-hidden="true">check_circle</span>}
                  </button>
                );
              })}
            </div>
            {selected.has('other') && (
              <div className="ap__custom-activity">
                <label htmlFor="ap-custom-activity">{lang === 'hi' ? 'आपकी अन्य गतिविधि क्या है?' : 'What is your other everyday activity?'}</label>
                <input
                  id="ap-custom-activity"
                  type="text"
                  value={customActivity}
                  maxLength={80}
                  placeholder={lang === 'hi' ? 'जैसे गहने बनाना, मरम्मत का काम…' : 'e.g. jewellery making, repair work…'}
                  onChange={(event) => { setCustomActivity(event.target.value); setCustomActivityError(''); }}
                  aria-invalid={Boolean(customActivityError)}
                  aria-describedby={customActivityError ? 'ap-custom-activity-error' : undefined}
                />
                {customActivityError && <p id="ap-custom-activity-error" className="ap__custom-error" role="alert">{customActivityError}</p>}
                <p>{lang === 'hi' ? 'आपके अपने शब्द प्रोफ़ाइल और बातचीत सारांश में उपयोग होंगे।' : 'Your own wording will appear in your profile and conversation summary.'}</p>
              </div>
            )}
            <p className="ap__context-note">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
              {lang === 'hi' ? 'यह जानकारी आपकी बातचीत को अधिक उपयोगी बनाने के लिए है। बाद में आप बताएँगे कि इनमें से कौन-सी गतिविधियाँ प्रभावित महसूस होती हैं।' : 'This gives context for your conversation. Later, you can tell us which of these activities feel affected.'}
            </p>
          </div>
        )}

        {step === 'primary' && (
          <div className="ap__section animate-fade-in">
            <div className="ap__heading-group">
              <h1 className="ap__title">{lang === 'hi' ? 'सबसे ज़्यादा समय किसमें लगता है?' : 'Which activity takes up most of your day?'}</h1>
              <p className="ap__subtitle">{lang === 'hi' ? 'अपनी चुनी हुई गतिविधियों में से एक चुनें।' : 'Choose one from the activities you selected.'}</p>
            </div>
            <div className="ap__primary-list" role="group" aria-label={lang === 'hi' ? 'मुख्य गतिविधि चुनें' : 'Choose your primary activity'}>
              {ACTIVITY_OPTIONS.filter((activity) => selected.has(activity.id)).map((activity) => {
                const isPrimary = primary === activity.id;
                return (
                  <button key={activity.id} type="button" className={`ap__primary-row${isPrimary ? ' ap__primary-row--on' : ''}`} onClick={() => setPrimary(activity.id)} disabled={Boolean(pendingProfile)} aria-pressed={isPrimary}>
                    <span className="material-symbols-outlined ap__primary-row-icon" aria-hidden="true">{activity.icon}</span>
                    <span className="ap__primary-row-label">{activity.id === 'other' && customActivity.trim() ? (activity.label[lang] || activity.label.en) + ': ' + customActivity.trim() : (activity.label[lang] || activity.label.en)}</span>
                    <span className="material-symbols-outlined ap__primary-radio" aria-hidden="true">{isPrimary ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="ap__footer">
        <button type="button" className="btn btn--primary btn--full btn--lg ap__continue-btn" onClick={handleContinue} disabled={Boolean(pendingProfile) || (step === 'select' ? selected.size === 0 : !primary || !selected.has(primary))}>
          {t('common.continue', lang)}
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </main>
  );
}

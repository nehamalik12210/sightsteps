import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import './AccessibilityControls.css';

const DEFAULT_PREFERENCES = {
  textScale: 100,
  highContrast: false,
  largeTargets: false,
  reducedMotion: false,
};

function getInitialPreferences() {
  const systemReducedMotion = typeof window !== 'undefined'
    && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES, reducedMotion: systemReducedMotion };

  try {
    const stored = JSON.parse(window.localStorage.getItem('sightsteps.display-preferences.v1') || 'null');
    if (!stored || typeof stored !== 'object') {
      return { ...DEFAULT_PREFERENCES, reducedMotion: systemReducedMotion };
    }
    return {
      textScale: [100, 115, 130].includes(stored.textScale) ? stored.textScale : 100,
      highContrast: Boolean(stored.highContrast),
      largeTargets: Boolean(stored.largeTargets),
      reducedMotion: typeof stored.reducedMotion === 'boolean' ? stored.reducedMotion : systemReducedMotion,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES, reducedMotion: systemReducedMotion };
  }
}

export default function AccessibilityControls() {
  const { language } = useApp();
  const hi = language === 'hi';
  const [preferences, setPreferences] = useState(getInitialPreferences);
  const detailsRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--a11y-scale', String(preferences.textScale / 100));
    root.dataset.a11yContrast = preferences.highContrast ? 'high' : 'normal';
    root.dataset.a11yTargets = preferences.largeTargets ? 'large' : 'normal';
    root.dataset.a11yMotion = preferences.reducedMotion ? 'reduce' : 'normal';

    try {
      window.localStorage.setItem('sightsteps.display-preferences.v1', JSON.stringify(preferences));
    } catch {
      // Display preferences remain active for this visit when browser storage is unavailable.
    }
  }, [preferences]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape' || !detailsRef.current?.open) return;
      detailsRef.current.open = false;
      detailsRef.current.querySelector('summary')?.focus();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const update = (changes) => setPreferences((current) => ({ ...current, ...changes }));

  return (
    <>
      <a className="a11y-skip-link" href="#main-content">
        {hi ? 'मुख्य सामग्री पर जाएँ' : 'Skip to main content'}
      </a>
      <details className="a11y-controls" ref={detailsRef}>
        <summary aria-label={hi ? 'सुलभता और डिस्प्ले सेटिंग्स' : 'Accessibility and display settings'}>
          <span className="material-symbols-outlined" aria-hidden="true">accessibility_new</span>
        </summary>
        <div className="a11y-controls__panel" role="group" aria-labelledby="a11y-controls-title">
          <div className="a11y-controls__heading">
            <h2 id="a11y-controls-title">{hi ? 'सुलभता सेटिंग्स' : 'Accessibility settings'}</h2>
            <p>{hi ? 'पढ़ने और उपयोग करने का तरीका बदलें।' : 'Adjust how SightSteps looks and feels.'}</p>
          </div>

          <fieldset className="a11y-controls__fieldset">
            <legend>{hi ? 'पाठ का आकार' : 'Text size'}</legend>
            <div className="a11y-controls__size-options" role="group" aria-label={hi ? 'पाठ का आकार चुनें' : 'Choose text size'}>
              {[100, 115, 130].map((scale) => (
                <button
                  key={scale}
                  type="button"
                  className="a11y-controls__size-option"
                  aria-pressed={preferences.textScale === scale}
                  onClick={() => update({ textScale: scale })}
                >
                  {scale === 100 ? (hi ? 'सामान्य' : 'Normal') : scale === 115 ? (hi ? 'बड़ा' : 'Large') : (hi ? 'सबसे बड़ा' : 'Largest')}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="a11y-controls__toggles">
            <button type="button" className="a11y-controls__toggle" aria-pressed={preferences.highContrast} onClick={() => update({ highContrast: !preferences.highContrast })}>
              <span>{hi ? 'अधिक कंट्रास्ट' : 'High contrast'}</span>
              <span className="a11y-controls__state">{preferences.highContrast ? (hi ? 'चालू' : 'On') : (hi ? 'बंद' : 'Off')}</span>
            </button>
            <button type="button" className="a11y-controls__toggle" aria-pressed={preferences.largeTargets} onClick={() => update({ largeTargets: !preferences.largeTargets })}>
              <span>{hi ? 'बड़े बटन और टच क्षेत्र' : 'Larger buttons and touch targets'}</span>
              <span className="a11y-controls__state">{preferences.largeTargets ? (hi ? 'चालू' : 'On') : (hi ? 'बंद' : 'Off')}</span>
            </button>
            <button type="button" className="a11y-controls__toggle" aria-pressed={preferences.reducedMotion} onClick={() => update({ reducedMotion: !preferences.reducedMotion })}>
              <span>{hi ? 'कम एनिमेशन' : 'Reduce motion'}</span>
              <span className="a11y-controls__state">{preferences.reducedMotion ? (hi ? 'चालू' : 'On') : (hi ? 'बंद' : 'Off')}</span>
            </button>
          </div>

          <button type="button" className="a11y-controls__reset" onClick={() => update({ ...DEFAULT_PREFERENCES, reducedMotion: Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) })}>
            {hi ? 'डिफ़ॉल्ट सेटिंग्स पुनर्स्थापित करें' : 'Reset display settings'}
          </button>
        </div>
      </details>
    </>
  );
}

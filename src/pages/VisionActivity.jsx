import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import './VisionActivity.css';

// E-chart sizes in px (largest to smallest) — 7 levels
const E_SIZES = [80, 64, 48, 36, 28, 22, 16];
const DIRECTIONS = ['up', 'down', 'left', 'right'];
const ROTATION = { up: 270, down: 90, left: 180, right: 0 };
const ARROWS = { up: '↑', down: '↓', left: '←', right: '→' };
const TRIALS_PER_EYE = 7;

function randomDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

// Phases: intro → calibrate → testLeft → testRight → results
export default function VisionActivity() {
  const navigate = useNavigate();
  const { language, skipVision, setVisionResults, isDemo, demoPersona } = useApp();
  const lang = language || 'en';

  const [phase, setPhase] = useState('intro'); // intro | calibrate | testing | results
  const [currentEye, setCurrentEye] = useState('left'); // left | right
  const [trialIndex, setTrialIndex] = useState(0);
  const [direction, setDirection] = useState(randomDirection);
  const [results, setResults] = useState({ left: [], right: [] });
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [calibrated, setCalibrated] = useState(false);
  const [cardWidth, setCardWidth] = useState(85.6); // mm — standard credit card
  const [pxPerMm, setPxPerMm] = useState(null);
  const sliderRef = useRef(null);

  // Demo mode: auto-skip
  useEffect(() => {
    if (isDemo && demoPersona?.skipVision) {
      skipVision();
      navigate('/report', { replace: true });
    }
  }, [isDemo, demoPersona, skipVision, navigate]);

  if (isDemo && demoPersona?.skipVision) return null;

  const handleSkip = () => {
    skipVision();
    navigate('/report');
  };

  const handleStartCalibration = () => {
    setPhase('calibrate');
  };

  const handleCalibrationDone = () => {
    // Calculate px/mm from slider
    if (sliderRef.current) {
      const sliderPx = sliderRef.current.offsetWidth;
      setPxPerMm(sliderPx / cardWidth);
    }
    setCalibrated(true);
    setPhase('testing');
    setCurrentEye('left');
    setTrialIndex(0);
    setDirection(randomDirection());
  };

  const handleResponse = useCallback((chosenDir) => {
    const correct = chosenDir === direction;
    setFeedback(correct ? 'correct' : 'wrong');

    setResults(prev => ({
      ...prev,
      [currentEye]: [...prev[currentEye], {
        level: trialIndex,
        size: E_SIZES[trialIndex],
        expected: direction,
        answered: chosenDir,
        correct,
      }],
    }));

    setTimeout(() => {
      setFeedback(null);
      const nextTrial = trialIndex + 1;

      if (nextTrial >= TRIALS_PER_EYE) {
        if (currentEye === 'left') {
          // Switch to right eye
          setCurrentEye('right');
          setTrialIndex(0);
          setDirection(randomDirection());
        } else {
          // Both eyes done
          setPhase('results');
        }
      } else {
        setTrialIndex(nextTrial);
        setDirection(randomDirection());
      }
    }, 500);
  }, [direction, trialIndex, currentEye]);

  const handleFinish = () => {
    const leftCorrect = results.left.filter(r => r.correct).length;
    const rightCorrect = results.right.filter(r => r.correct).length;
    // Find smallest level correctly identified
    const leftSmallest = results.left.filter(r => r.correct).reduce((min, r) => Math.min(min, r.size), 999);
    const rightSmallest = results.right.filter(r => r.correct).reduce((min, r) => Math.min(min, r.size), 999);

    setVisionResults({
      completed: true,
      skipped: false,
      data: {
        left: { correct: leftCorrect, total: TRIALS_PER_EYE, smallestPx: leftSmallest, trials: results.left },
        right: { correct: rightCorrect, total: TRIALS_PER_EYE, smallestPx: rightSmallest, trials: results.right },
        pxPerMm,
        calibrated,
      },
    });
    navigate('/report');
  };

  // ─── INTRO PHASE ───
  if (phase === 'intro') {
    return (
      <div className="vision-activity">
        <header className="app-header">
          <button className="app-header__back" onClick={() => navigate(-1)} aria-label="Back"><span className="material-symbols-outlined">arrow_back</span></button>
          <span className="app-header__title">{t('vision.title', lang)}</span>
          <span className="app-header__action" />
        </header>

        <div className="vision-activity__content">
          <div className="vision-activity__hero">
            <div className="vision-activity__icon-ring">
              <div className="vision-activity__icon-inner">
                <span className="vision-activity__e-letter">E</span>
              </div>
            </div>
            <h2 className="vision-activity__title">
              {lang === 'hi' ? 'दृष्टि जागरूकता गतिविधि' : 'Vision Awareness Activity'}
            </h2>
            <p className="vision-activity__desc">
              {lang === 'hi'
                ? 'यह एक वैकल्पिक गतिविधि है। यह चिकित्सा परीक्षण नहीं है।'
                : 'Optional awareness activity — not a medical test.'}
            </p>
          </div>

          <div className="vision-activity__card">
            <h3 className="vision-activity__card-title">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>checklist</span> {lang === 'hi' ? 'इसमें क्या होगा' : 'What to expect'}
            </h3>
            <div className="vision-activity__steps">
              <div className="vision-activity__step">
                <div className="vision-activity__step-num">1</div>
                <div className="vision-activity__step-text">
                  <span className="vision-activity__step-label">{lang === 'hi' ? 'दूरी कैलिब्रेशन' : 'Distance Calibration'}</span>
                  <span className="vision-activity__step-desc">{lang === 'hi' ? 'कार्ड से स्क्रीन दूरी मापें' : 'Use a card to calibrate screen distance'}</span>
                </div>
              </div>
              <div className="vision-activity__step">
                <div className="vision-activity__step-num">2</div>
                <div className="vision-activity__step-text">
                  <span className="vision-activity__step-label">{lang === 'hi' ? 'दिशा पहचानें' : 'Identify Direction'}</span>
                  <span className="vision-activity__step-desc">{lang === 'hi' ? '"E" किधर देख रहा है बताएं' : 'Tap which way the "E" is pointing'}</span>
                </div>
              </div>
              <div className="vision-activity__step">
                <div className="vision-activity__step-num">3</div>
                <div className="vision-activity__step-text">
                  <span className="vision-activity__step-label">{lang === 'hi' ? 'दोनों आँखें' : 'Both Eyes'}</span>
                  <span className="vision-activity__step-desc">{lang === 'hi' ? 'बाईं और दाईं आँख अलग-अलग' : 'Test left eye, then right eye'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="vision-activity__actions">
            <button className="btn btn--primary btn--full btn--lg" onClick={handleStartCalibration}>
              <span className="material-symbols-outlined">play_arrow</span> {lang === 'hi' ? 'शुरू करें' : 'Start Activity'}
            </button>
            <button className="btn btn--ghost btn--full" onClick={handleSkip}>
              <span className="material-symbols-outlined">skip_next</span> {t('vision.skip', lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CALIBRATION PHASE ───
  if (phase === 'calibrate') {
    return (
      <div className="vision-activity">
        <header className="app-header">
          <button className="app-header__back" onClick={() => setPhase('intro')} aria-label="Back"><span className="material-symbols-outlined">arrow_back</span></button>
          <span className="app-header__title">{lang === 'hi' ? 'कैलिब्रेशन' : 'Calibration'}</span>
          <span className="app-header__action" />
        </header>

        <div className="va-calibrate">
          <div className="va-calibrate__instruction">
            <span className="va-calibrate__icon material-symbols-outlined" style={{ fontSize: '32px' }}>credit_card</span>
            <h2>{lang === 'hi' ? 'कार्ड कैलिब्रेशन' : 'Card Calibration'}</h2>
            <p>{lang === 'hi'
              ? 'कोई भी कार्ड (ATM/आधार) स्क्रीन पर रखें। नीचे की पट्टी को कार्ड की चौड़ाई से मिलाएं।'
              : 'Place any card (credit/ID) on screen. Drag the slider to match the card width exactly.'}</p>
          </div>

          <div className="va-calibrate__slider-area">
            <div className="va-calibrate__card-outline" ref={sliderRef}>
              <div className="va-calibrate__card-label">
                {lang === 'hi' ? 'कार्ड यहाँ रखें' : 'Place card here'}
              </div>
            </div>
            <input
              type="range"
              className="va-calibrate__range"
              min="60"
              max="120"
              step="0.5"
              value={cardWidth}
              onChange={(e) => {
                const w = parseFloat(e.target.value);
                setCardWidth(w);
                if (sliderRef.current) {
                  sliderRef.current.style.width = `${w * 3}px`;
                }
              }}
            />
            <p className="va-calibrate__value">{cardWidth.toFixed(1)} mm</p>
          </div>

          <div className="va-calibrate__tip">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lightbulb</span> {lang === 'hi'
              ? 'अगर कार्ड नहीं है तो सीधे आगे बढ़ें'
              : "No card? Skip calibration — it's optional"}
          </div>

          <div className="vision-activity__actions">
            <button className="btn btn--primary btn--full btn--lg" onClick={handleCalibrationDone}>
              <span className="material-symbols-outlined">check_circle</span> {lang === 'hi' ? 'हो गया, आगे बढ़ें' : 'Done, Continue'}
            </button>
            <button className="btn btn--ghost btn--full" onClick={() => { setCalibrated(false); setPhase('testing'); setDirection(randomDirection()); }}>
              {lang === 'hi' ? 'कैलिब्रेशन छोड़ें' : 'Skip Calibration'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── TESTING PHASE ───
  if (phase === 'testing') {
    const size = E_SIZES[trialIndex];
    const rot = ROTATION[direction];
    const eyeLabel = currentEye === 'left'
      ? (lang === 'hi' ? 'बाईं आँख' : 'Left Eye')
      : (lang === 'hi' ? 'दाईं आँख' : 'Right Eye');
    const coverLabel = currentEye === 'left'
      ? (lang === 'hi' ? 'दाईं आँख ढकें' : 'Cover your RIGHT eye')
      : (lang === 'hi' ? 'बाईं आँख ढकें' : 'Cover your LEFT eye');

    return (
      <div className="vision-activity">
        <header className="app-header">
          <span className="app-header__back" />
          <span className="app-header__title">{eyeLabel}</span>
          <span className="app-header__action">{trialIndex + 1}/{TRIALS_PER_EYE}</span>
        </header>

        <div className="va-progress">
          <div className="progress">
            <div className="progress__bar" style={{ width: `${((currentEye === 'right' ? TRIALS_PER_EYE : 0) + trialIndex) / (TRIALS_PER_EYE * 2) * 100}%` }} />
          </div>
        </div>

        <div className="va-test">
          <p className="va-test__cover">{coverLabel}</p>

          <div className="va-test__e-area">
            {feedback && (
              <div className={`va-test__feedback va-test__feedback--${feedback}`}>
                {feedback === 'correct' ? '✓' : '✗'}
              </div>
            )}
            <div
              className="va-test__e"
              style={{
                fontSize: `${size}px`,
                transform: `rotate(${rot}deg)`,
                opacity: feedback ? 0.3 : 1,
              }}
            >
              E
            </div>
          </div>

          <p className="va-test__hint">
            {lang === 'hi' ? '"E" किधर देख रहा है?' : 'Which way is the "E" pointing?'}
          </p>

          <div className="va-test__buttons">
            {DIRECTIONS.map((dir) => (
              <button
                key={dir}
                className="va-test__dir-btn"
                onClick={() => handleResponse(dir)}
                disabled={!!feedback}
              >
                <span className="va-test__dir-arrow">{ARROWS[dir]}</span>
                <span className="va-test__dir-label">
                  {dir === 'up' ? (lang === 'hi' ? 'ऊपर' : 'Up')
                    : dir === 'down' ? (lang === 'hi' ? 'नीचे' : 'Down')
                    : dir === 'left' ? (lang === 'hi' ? 'बाएं' : 'Left')
                    : (lang === 'hi' ? 'दाएं' : 'Right')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS PHASE ───
  if (phase === 'results') {
    const leftCorrect = results.left.filter(r => r.correct).length;
    const rightCorrect = results.right.filter(r => r.correct).length;
    const leftPct = Math.round((leftCorrect / TRIALS_PER_EYE) * 100);
    const rightPct = Math.round((rightCorrect / TRIALS_PER_EYE) * 100);

    return (
      <div className="vision-activity">
        <header className="app-header">
          <span className="app-header__back" />
          <span className="app-header__title">{lang === 'hi' ? 'परिणाम' : 'Results'}</span>
          <span className="app-header__action" />
        </header>

        <div className="va-results">
          <h2 className="va-results__title">
            {lang === 'hi' ? 'गतिविधि पूरी!' : 'Activity Complete!'}
          </h2>
          <p className="va-results__subtitle">
            {lang === 'hi' ? 'यह सिर्फ जागरूकता के लिए है — चिकित्सा परीक्षण नहीं' : 'For awareness only — not a medical test'}
          </p>

          <div className="va-results__eyes">
            <div className="va-results__eye-card">
              <span className="va-results__eye-label"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span> {lang === 'hi' ? 'बाईं' : 'Left'}</span>
              <span className="va-results__eye-score" style={{ color: leftPct >= 70 ? '#059669' : leftPct >= 40 ? '#D97706' : '#DC2626' }}>
                {leftCorrect}/{TRIALS_PER_EYE}
              </span>
              <div className="va-results__eye-bar">
                <div className="va-results__eye-bar-fill" style={{ width: `${leftPct}%`, background: leftPct >= 70 ? '#059669' : leftPct >= 40 ? '#D97706' : '#DC2626' }} />
              </div>
            </div>
            <div className="va-results__eye-card">
              <span className="va-results__eye-label"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span> {lang === 'hi' ? 'दाईं' : 'Right'}</span>
              <span className="va-results__eye-score" style={{ color: rightPct >= 70 ? '#059669' : rightPct >= 40 ? '#D97706' : '#DC2626' }}>
                {rightCorrect}/{TRIALS_PER_EYE}
              </span>
              <div className="va-results__eye-bar">
                <div className="va-results__eye-bar-fill" style={{ width: `${rightPct}%`, background: rightPct >= 70 ? '#059669' : rightPct >= 40 ? '#D97706' : '#DC2626' }} />
              </div>
            </div>
          </div>

          <div className="vision-activity__actions">
            <button className="btn btn--primary btn--full btn--lg" onClick={handleFinish}>
              <span className="material-symbols-outlined">bar_chart</span> {lang === 'hi' ? 'रिपोर्ट देखें' : 'View Report'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

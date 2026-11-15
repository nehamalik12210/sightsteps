import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import './VisionActivity.css';

const SYMBOL_SIZE = 88;
const DIRECTIONS = ['up', 'down', 'left', 'right'];
const ROTATION = { up: 270, down: 90, left: 180, right: 0 };
const TRIALS_PER_EYE = 5;
const TOTAL_TRIALS = TRIALS_PER_EYE * 2;

const DIR_ICONS = { up: 'arrow_upward', down: 'arrow_downward', left: 'arrow_back', right: 'arrow_forward' };

function randomDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

function dirLabel(dir, lang) {
  const map = {
    up: lang === 'hi' ? 'ऊपर' : 'Up',
    down: lang === 'hi' ? 'नीचे' : 'Down',
    left: lang === 'hi' ? 'बाएँ' : 'Left',
    right: lang === 'hi' ? 'दाएँ' : 'Right',
  };
  return map[dir];
}

export default function VisionActivity() {
  const navigate = useNavigate();
  const { language, skipVision, setVisionResults, isDemo, demoPersona } = useApp();
  const lang = language || 'en';

  const [phase, setPhase] = useState('intro');
  const [currentEye, setCurrentEye] = useState('left');
  const [trialIndex, setTrialIndex] = useState(0);
  const [direction, setDirection] = useState(randomDirection);
  const [results, setResults] = useState({ left: [], right: [] });
  const [feedback, setFeedback] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const timeoutRef = useRef(null);
  const demoSkipHandled = useRef(false);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (isDemo && demoPersona?.skipVision && !demoSkipHandled.current) {
      demoSkipHandled.current = true;
      skipVision();
      navigate('/report', { replace: true });
    }
  }, [isDemo, demoPersona, skipVision, navigate]);

  const handleSkip = () => { skipVision(); navigate('/report'); };

  const startActivity = () => {
    setResults({ left: [], right: [] });
    setCurrentEye('left');
    setTrialIndex(0);
    setDirection(randomDirection());
    setFeedback(null);
    setIsLocked(false);
    setPhase('testing');
  };

  const handleResponse = useCallback((chosen) => {
    if (isLocked || phase !== 'testing') return;
    setIsLocked(true);

    const correct = chosen === direction;
    setFeedback(correct ? 'correct' : 'wrong');

    setResults((prev) => ({
      ...prev,
      [currentEye]: [...prev[currentEye], {
        round: trialIndex + 1, expected: direction, answered: chosen, correct,
      }],
    }));

    timeoutRef.current = window.setTimeout(() => {
      setFeedback(null);
      const next = trialIndex + 1;

      if (next >= TRIALS_PER_EYE) {
        if (currentEye === 'left') {
          setCurrentEye('right');
          setTrialIndex(0);
          setDirection(randomDirection());
        } else {
          setPhase('results');
        }
      } else {
        setTrialIndex(next);
        setDirection(randomDirection());
      }
      setIsLocked(false);
    }, 420);
  }, [currentEye, direction, isLocked, phase, trialIndex]);

  const handleFinish = () => {
    const leftCorrect = results.left.filter((t) => t.correct).length;
    const rightCorrect = results.right.filter((t) => t.correct).length;
    setVisionResults({
      completed: true, skipped: false,
      data: {
        activityType: 'direction-awareness',
        left: { correct: leftCorrect, total: results.left.length, trials: results.left },
        right: { correct: rightCorrect, total: results.right.length, trials: results.right },
      },
    });
    navigate('/report');
  };

  if (isDemo && demoPersona?.skipVision) return null;

  /* ───── INTRO ───── */
  if (phase === 'intro') {
    return (
      <main className="va">
        <header className="va__topbar">
          <button className="va__back-btn" type="button" onClick={() => navigate(-1)} aria-label={t('common.back', lang)}>
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          </button>
          <span className="va__topbar-title">{t('vision.title', lang)}</span>
          <span className="va__topbar-spacer" />
        </header>

        <div className="va__intro animate-fade-in">
          {/* Hero E */}
          <div className="va__hero-ring" aria-hidden="true">
            <span className="va__hero-e">E</span>
          </div>

          <h1 className="va__intro-title">
            {lang === 'hi' ? 'दिशा पहचान गतिविधि' : 'Direction Awareness Activity'}
          </h1>

          <p className="va__intro-desc">
            {lang === 'hi'
              ? 'एक वैकल्पिक इंटरैक्टिव गतिविधि। यह आँखों की जाँच या दृष्टि की तीक्ष्णता मापने का तरीका नहीं है।'
              : 'An optional interactive activity. This is not an eye examination and does not measure visual acuity.'}
          </p>

          {/* Steps — inline, no card wrapper */}
          <ol className="va__steps">
            <li className="va__step">
              <span className="va__step-num">1</span>
              <span className="va__step-body">
                <strong>{lang === 'hi' ? 'स्क्रीन आराम से देखें' : 'Look at the screen comfortably'}</strong>
                <span>{lang === 'hi' ? 'फ़ोन को आरामदायक दूरी पर रखें।' : 'Hold your phone at a comfortable distance.'}</span>
              </span>
            </li>
            <li className="va__step">
              <span className="va__step-num">2</span>
              <span className="va__step-body">
                <strong>{lang === 'hi' ? 'E की दिशा पहचानें' : 'Identify the direction of E'}</strong>
                <span>{lang === 'hi' ? 'ऊपर, नीचे, बाएँ या दाएँ चुनें।' : 'Choose up, down, left, or right.'}</span>
              </span>
            </li>
            <li className="va__step">
              <span className="va__step-num">3</span>
              <span className="va__step-body">
                <strong>{lang === 'hi' ? 'दोनों आँखों के राउंड करें' : 'Complete rounds for each eye'}</strong>
                <span>{lang === 'hi' ? '5 प्रॉम्प्ट प्रति आँख। दूसरी आँख बिना दबाव डाले ढकें।' : '5 prompts per eye. Cover the other eye without pressing.'}</span>
              </span>
            </li>
          </ol>

          {/* Disclaimer */}
          <p className="va__notice" role="note">
            <span className="material-symbols-outlined" aria-hidden="true">info</span>
            {lang === 'hi'
              ? 'परिणाम केवल चुने गए उत्तरों की गिनती है। चश्मे का नंबर या आँखों की सेहत का निष्कर्ष नहीं निकाला जाता।'
              : 'The result only counts answers selected. It cannot determine a prescription or indicate eye health.'}
          </p>

          <div className="va__intro-actions">
            <button className="btn btn--primary btn--full btn--lg va__start-btn" type="button" onClick={startActivity}>
              {lang === 'hi' ? 'गतिविधि शुरू करें' : 'Start activity'}
              <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
            </button>
            <button className="btn btn--ghost btn--full" type="button" onClick={handleSkip}>
              <span className="material-symbols-outlined" aria-hidden="true">skip_next</span>
              {t('vision.skip', lang)}
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ───── TESTING ───── */
  if (phase === 'testing') {
    const eyeLabel = currentEye === 'left'
      ? (lang === 'hi' ? 'बाईं आँख' : 'Left eye')
      : (lang === 'hi' ? 'दाईं आँख' : 'Right eye');

    const coverLabel = currentEye === 'left'
      ? (lang === 'hi' ? 'दाईं आँख बिना दबाव डाले ढकें' : 'Cover your right eye gently')
      : (lang === 'hi' ? 'बाईं आँख बिना दबाव डाले ढकें' : 'Cover your left eye gently');

    const overallTrial = currentEye === 'left' ? trialIndex + 1 : TRIALS_PER_EYE + trialIndex + 1;
    const progressPct = ((overallTrial - 1) / TOTAL_TRIALS) * 100;

    return (
      <main className="va va--testing">
        {/* Topbar */}
        <header className="va__topbar">
          <span className="va__topbar-spacer" />
          <span className="va__topbar-title">{eyeLabel}</span>
          <span className="va__topbar-counter">{overallTrial}/{TOTAL_TRIALS}</span>
        </header>

        {/* Progress */}
        <div className="va__progress-bar-wrap">
          <div className="va__progress-track" role="progressbar"
            aria-label={lang === 'hi' ? 'गतिविधि प्रगति' : 'Activity progress'}
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)}
          >
            <div className="va__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Test area */}
        <section className="va__test" aria-labelledby="va-test-q">
          <p className="va__cover-hint">{coverLabel}</p>

          <div className="va__disclaimer-pill">
            {lang === 'hi' ? 'यह दृष्टि परीक्षण नहीं है' : 'Not a vision test'}
          </div>

          {/* E display */}
          <div className="va__e-zone" aria-live="off">
            {feedback && (
              <span className={`va__fb va__fb--${feedback}`} aria-hidden="true">
                <span className="material-symbols-outlined">
                  {feedback === 'correct' ? 'check' : 'close'}
                </span>
              </span>
            )}
            <span
              className="va__e-char"
              aria-label={lang === 'hi' ? 'घुमाया हुआ अक्षर E' : 'Rotated letter E'}
              style={{
                fontSize: `${SYMBOL_SIZE}px`,
                transform: `rotate(${ROTATION[direction]}deg)`,
                opacity: feedback ? 0.3 : 1,
              }}
            >E</span>
          </div>

          <h1 id="va-test-q" className="va__test-prompt">
            {lang === 'hi' ? 'E किस दिशा में खुला है?' : 'Which way is the E pointing?'}
          </h1>

          {/* Direction buttons — 2×2 grid */}
          <div className="va__dir-grid" role="group"
            aria-label={lang === 'hi' ? 'दिशा चुनें' : 'Choose a direction'}
          >
            {DIRECTIONS.map((d) => (
              <button
                key={d}
                type="button"
                className="va__dir-btn"
                onClick={() => handleResponse(d)}
                disabled={isLocked}
                aria-label={dirLabel(d, lang)}
              >
                <span className="material-symbols-outlined va__dir-icon" aria-hidden="true">
                  {DIR_ICONS[d]}
                </span>
                <span className="va__dir-label">{dirLabel(d, lang)}</span>
              </button>
            ))}
          </div>

          <p className="va__trial-count" aria-live="polite">
            {lang === 'hi'
              ? `प्रश्न ${overallTrial} / ${TOTAL_TRIALS}`
              : `Prompt ${overallTrial} of ${TOTAL_TRIALS}`}
          </p>

          <button className="btn btn--ghost va__skip-link" type="button" onClick={handleSkip}>
            {lang === 'hi' ? 'गतिविधि छोड़ें' : 'Skip activity'}
          </button>
        </section>
      </main>
    );
  }

  /* ───── RESULTS ───── */
  const leftCorrect = results.left.filter((t) => t.correct).length;
  const rightCorrect = results.right.filter((t) => t.correct).length;

  return (
    <main className="va">
      <header className="va__topbar">
        <span className="va__topbar-spacer" />
        <span className="va__topbar-title">{lang === 'hi' ? 'गतिविधि परिणाम' : 'Activity Results'}</span>
        <span className="va__topbar-spacer" />
      </header>

      <section className="va__results animate-fade-in" aria-labelledby="va-results-heading">
        <div className="va__results-header">
          <span className="material-symbols-outlined va__results-check" aria-hidden="true">check_circle</span>
          <h1 id="va-results-heading" className="va__results-title">
            {lang === 'hi' ? 'गतिविधि पूरी हुई' : 'Activity Complete'}
          </h1>
          <p className="va__results-sub">
            {lang === 'hi'
              ? 'ये केवल चुने गए उत्तरों की गिनती है।'
              : 'These numbers only count the answers you selected.'}
          </p>
        </div>

        <div className="va__results-grid" aria-live="polite">
          <div className="va__eye-card">
            <span className="va__eye-label">{lang === 'hi' ? 'बाईं आँख' : 'Left eye'}</span>
            <strong className="va__eye-score">{leftCorrect}/{results.left.length}</strong>
            <span className="va__eye-caption">
              {lang === 'hi' ? 'सही दिशा-चयन' : 'Matching directions'}
            </span>
          </div>
          <div className="va__eye-card">
            <span className="va__eye-label">{lang === 'hi' ? 'दाईं आँख' : 'Right eye'}</span>
            <strong className="va__eye-score">{rightCorrect}/{results.right.length}</strong>
            <span className="va__eye-caption">
              {lang === 'hi' ? 'सही दिशा-चयन' : 'Matching directions'}
            </span>
          </div>
        </div>

        <p className="va__notice" role="note">
          <span className="material-symbols-outlined" aria-hidden="true">info</span>
          {lang === 'hi'
            ? 'यह परिणाम दृष्टि की तीक्ष्णता, चश्मे के नंबर या नेत्र रोग का आकलन नहीं करता। किसी चिंता के लिए नेत्र-देखभाल पेशेवर से संपर्क करें।'
            : 'This result does not assess visual acuity, prescription, or eye disease. Contact an eye-care professional for any concern.'}
        </p>

        <button className="btn btn--primary btn--full btn--lg va__finish-btn" type="button" onClick={handleFinish}>
          {lang === 'hi' ? 'रिपोर्ट देखें' : 'View your report'}
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </section>
    </main>
  );
}

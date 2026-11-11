import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import './VisionActivity.css';

// This activity is not calibrated or suitable for measuring visual acuity.
const SYMBOL_SIZE = 88;
const DIRECTIONS = ['up', 'down', 'left', 'right'];

const ROTATION = {
  up: 270,
  down: 90,
  left: 180,
  right: 0,
};

const ARROWS = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

const TRIALS_PER_EYE = 5;
const TOTAL_TRIALS = TRIALS_PER_EYE * 2;

function randomDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

function directionLabel(direction, language) {
  const labels = {
    up: language === 'hi' ? 'ऊपर' : 'Up',
    down: language === 'hi' ? 'नीचे' : 'Down',
    left: language === 'hi' ? 'बाएँ' : 'Left',
    right: language === 'hi' ? 'दाएँ' : 'Right',
  };

  return labels[direction];
}

export default function VisionActivity() {
  const navigate = useNavigate();

  const {
    language,
    skipVision,
    setVisionResults,
    isDemo,
    demoPersona,
  } = useApp();

  const lang = language || 'en';

  const [phase, setPhase] = useState('intro');
  const [currentEye, setCurrentEye] = useState('left');
  const [trialIndex, setTrialIndex] = useState(0);

  const [direction, setDirection] = useState(randomDirection);

  const [results, setResults] = useState({
    left: [],
    right: [],
  });

  const [feedback, setFeedback] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  const timeoutRef = useRef(null);
  const demoSkipHandled = useRef(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      isDemo &&
      demoPersona?.skipVision &&
      !demoSkipHandled.current
    ) {
      demoSkipHandled.current = true;
      skipVision();
      navigate('/report', { replace: true });
    }
  }, [isDemo, demoPersona, skipVision, navigate]);

  const handleSkip = () => {
    skipVision();
    navigate('/report');
  };

  const startActivity = () => {
    setResults({
      left: [],
      right: [],
    });

    setCurrentEye('left');
    setTrialIndex(0);
    setDirection(randomDirection());
    setFeedback(null);
    setIsAnswerLocked(false);
    setPhase('testing');
  };

  const handleResponse = useCallback((chosenDirection) => {
    if (isAnswerLocked || phase !== 'testing') return;

    setIsAnswerLocked(true);

    const correct = chosenDirection === direction;

    setFeedback(correct ? 'correct' : 'wrong');

    setResults((previous) => ({
      ...previous,
      [currentEye]: [
        ...previous[currentEye],
        {
          round: trialIndex + 1,
          expected: direction,
          answered: chosenDirection,
          correct,
        },
      ],
    }));

    timeoutRef.current = window.setTimeout(() => {
      setFeedback(null);

      const nextTrial = trialIndex + 1;

      if (nextTrial >= TRIALS_PER_EYE) {
        if (currentEye === 'left') {
          // The global counter continues at 6/10 on the right eye.
          // trialIndex is reset only for eye-specific result storage.
          setCurrentEye('right');
          setTrialIndex(0);
          setDirection(randomDirection());
        } else {
          setPhase('results');
        }
      } else {
        setTrialIndex(nextTrial);
        setDirection(randomDirection());
      }

      setIsAnswerLocked(false);
    }, 450);
  }, [
    currentEye,
    direction,
    isAnswerLocked,
    phase,
    trialIndex,
  ]);

  const handleFinish = () => {
    const leftCorrect = results.left.filter(
      (trial) => trial.correct,
    ).length;

    const rightCorrect = results.right.filter(
      (trial) => trial.correct,
    ).length;

    setVisionResults({
      completed: true,
      skipped: false,
      data: {
        activityType: 'direction-awareness',

        left: {
          correct: leftCorrect,
          total: results.left.length,
          trials: results.left,
        },

        right: {
          correct: rightCorrect,
          total: results.right.length,
          trials: results.right,
        },
      },
    });

    navigate('/report');
  };

  if (isDemo && demoPersona?.skipVision) {
    return null;
  }

  if (phase === 'intro') {
    return (
      <main className="vision-activity">
        <header className="app-header">
          <button
            className="app-header__back"
            type="button"
            onClick={() => navigate(-1)}
            aria-label={
              lang === 'hi' ? 'वापस जाएँ' : 'Go back'
            }
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              arrow_back
            </span>
          </button>

          <span className="app-header__title">
            {t('vision.title', lang)}
          </span>

          <span className="app-header__action" />
        </header>

        <div className="vision-activity__content">
          <section
            className="vision-activity__hero"
            aria-labelledby="vision-activity-title"
          >
            <div
              className="vision-activity__icon-ring"
              aria-hidden="true"
            >
              <div className="vision-activity__icon-inner">
                <span className="vision-activity__e-letter">E</span>
              </div>
            </div>

            <h1
              id="vision-activity-title"
              className="vision-activity__title"
            >
              {lang === 'hi'
                ? 'दिशा पहचान गतिविधि'
                : 'Direction Awareness Activity'}
            </h1>

            <p className="vision-activity__desc">
              {lang === 'hi'
                ? 'यह एक वैकल्पिक इंटरैक्टिव गतिविधि है। यह आँखों की जाँच या दृष्टि की तीक्ष्णता मापने का तरीका नहीं है।'
                : 'An optional interactive activity. It is not an eye examination and does not measure visual acuity.'}
            </p>
          </section>

          <section
            className="vision-activity__card"
            aria-labelledby="vision-activity-steps-title"
          >
            <h2
              id="vision-activity-steps-title"
              className="vision-activity__card-title"
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                checklist
              </span>

              {lang === 'hi' ? 'क्या करना होगा' : 'What to do'}
            </h2>

            <ol className="vision-activity__steps">
              <li className="vision-activity__step">
                <span className="vision-activity__step-num">1</span>

                <span className="vision-activity__step-text">
                  <strong className="vision-activity__step-label">
                    {lang === 'hi'
                      ? 'स्क्रीन आराम से देखें'
                      : 'Look at the screen comfortably'}
                  </strong>

                  <span className="vision-activity__step-desc">
                    {lang === 'hi'
                      ? 'फ़ोन को आरामदायक दूरी पर रखें।'
                      : 'Hold your phone at a comfortable distance.'}
                  </span>
                </span>
              </li>

              <li className="vision-activity__step">
                <span className="vision-activity__step-num">2</span>

                <span className="vision-activity__step-text">
                  <strong className="vision-activity__step-label">
                    {lang === 'hi'
                      ? 'E की दिशा पहचानें'
                      : 'Identify the direction of E'}
                  </strong>

                  <span className="vision-activity__step-desc">
                    {lang === 'hi'
                      ? 'ऊपर, नीचे, बाएँ या दाएँ चुनें।'
                      : 'Choose up, down, left, or right.'}
                  </span>
                </span>
              </li>

              <li className="vision-activity__step">
                <span className="vision-activity__step-num">3</span>

                <span className="vision-activity__step-text">
                  <strong className="vision-activity__step-label">
                    {lang === 'hi'
                      ? 'दोनों आँखों के राउंड करें'
                      : 'Complete one round for each eye'}
                  </strong>

                  <span className="vision-activity__step-desc">
                    {lang === 'hi'
                      ? 'हर आँख के लिए पाँच सवाल होंगे। दूसरी आँख पर बिना दबाव डाले हाथ रखें; असुविधा हो तो गतिविधि छोड़ दें।'
                      : 'There are five prompts for each eye. Gently cover the other eye without pressing on it; skip if uncomfortable.'}
                  </span>
                </span>
              </li>
            </ol>
          </section>

          <p className="vision-activity__notice" role="note">
            {lang === 'hi'
              ? 'परिणाम केवल इस गतिविधि में चुने गए उत्तरों की गिनती है। इससे चश्मे का नंबर या आँखों की सेहत का निष्कर्ष नहीं निकाला जाता।'
              : 'The result only counts answers selected in this activity. It cannot determine a prescription or indicate eye health.'}
          </p>

          <div className="vision-activity__actions">
            <button
              className="btn btn--primary btn--full btn--lg"
              type="button"
              onClick={startActivity}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                play_arrow
              </span>

              {lang === 'hi'
                ? 'गतिविधि शुरू करें'
                : 'Start Activity'}
            </button>

            <button
              className="btn btn--ghost btn--full"
              type="button"
              onClick={handleSkip}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                skip_next
              </span>

              {t('vision.skip', lang)}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === 'testing') {
    const eyeLabel = currentEye === 'left'
      ? (lang === 'hi' ? 'बाईं आँख' : 'Left eye')
      : (lang === 'hi' ? 'दाईं आँख' : 'Right eye');

    const coverLabel = currentEye === 'left'
      ? (lang === 'hi'
          ? 'दाईं आँख को बिना दबाव डाले ढकें'
          : 'Cover your right eye without pressing on it')
      : (lang === 'hi'
          ? 'बाईं आँख को बिना दबाव डाले ढकें'
          : 'Cover your left eye without pressing on it');

    // Calculate one continuous count from 1/10 to 10/10.
    // trialIndex remains eye-local for storing each eye's results.
    const overallTrialNumber = currentEye === 'left'
      ? trialIndex + 1
      : TRIALS_PER_EYE + trialIndex + 1;

    const progress = (
      ((overallTrialNumber - 1) / TOTAL_TRIALS) * 100
    );

    return (
      <main className="vision-activity">
        <header className="app-header">
          <span className="app-header__back" />

          <span className="app-header__title">
            {eyeLabel}
          </span>

          <span className="app-header__action">
            {overallTrialNumber}/{TOTAL_TRIALS}
          </span>
        </header>

        <div className="va-progress">
          <div
            className="progress"
            role="progressbar"
            aria-label={
              lang === 'hi'
                ? 'गतिविधि की प्रगति'
                : 'Activity progress'
            }
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="progress__bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <section className="va-test" aria-labelledby="va-test-title">
          <p className="va-test__cover">
            {coverLabel}
          </p>

          <p className="va-test__round-note">
            {lang === 'hi'
              ? 'यह दृष्टि परीक्षण नहीं है'
              : 'This is not a vision test'}
          </p>

          <div className="va-test__e-area" aria-live="off">
            {feedback && (
              <span
                className={`va-test__feedback va-test__feedback--${feedback}`}
                aria-hidden="true"
              >
                {feedback === 'correct' ? '✓' : '×'}
              </span>
            )}

            <span
              className="va-test__e"
              aria-label={
                lang === 'hi'
                  ? 'घुमाया हुआ अंग्रेज़ी अक्षर E'
                  : 'Rotated letter E'
              }
              style={{
                fontSize: `${SYMBOL_SIZE}px`,
                transform: `rotate(${ROTATION[direction]}deg)`,
                opacity: feedback ? 0.35 : 1,
              }}
            >
              E
            </span>
          </div>

          <h1 id="va-test-title" className="va-test__hint">
            {lang === 'hi'
              ? 'E किस दिशा में खुला है?'
              : 'Which way is the E pointing?'}
          </h1>

          <div
            className="va-test__buttons"
            role="group"
            aria-label={
              lang === 'hi'
                ? 'दिशा चुनें'
                : 'Choose a direction'
            }
          >
            {DIRECTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className="va-test__dir-btn"
                onClick={() => handleResponse(item)}
                disabled={isAnswerLocked}
                aria-label={directionLabel(item, lang)}
              >
                <span
                  className="va-test__dir-arrow"
                  aria-hidden="true"
                >
                  {ARROWS[item]}
                </span>

                <span className="va-test__dir-label">
                  {directionLabel(item, lang)}
                </span>
              </button>
            ))}
          </div>

          <p className="va-test__round-count" aria-live="polite">
            {lang === 'hi'
              ? `प्रश्न ${overallTrialNumber} / ${TOTAL_TRIALS}`
              : `Prompt ${overallTrialNumber} of ${TOTAL_TRIALS}`}
          </p>

          <button
            className="btn btn--ghost va-test__skip"
            type="button"
            onClick={handleSkip}
          >
            {lang === 'hi'
              ? 'गतिविधि छोड़ें'
              : 'Skip this activity'}
          </button>
        </section>
      </main>
    );
  }

  const leftCorrect = results.left.filter(
    (trial) => trial.correct,
  ).length;

  const rightCorrect = results.right.filter(
    (trial) => trial.correct,
  ).length;

  return (
    <main className="vision-activity">
      <header className="app-header">
        <span className="app-header__back" />

        <span className="app-header__title">
          {lang === 'hi' ? 'गतिविधि परिणाम' : 'Activity Results'}
        </span>

        <span className="app-header__action" />
      </header>

      <section
        className="va-results"
        aria-labelledby="va-results-title"
      >
        <h1
          id="va-results-title"
          className="va-results__title"
        >
          {lang === 'hi'
            ? 'गतिविधि पूरी हुई'
            : 'Activity Complete'}
        </h1>

        <p className="va-results__subtitle">
          {lang === 'hi'
            ? 'ये केवल चुने गए उत्तरों की गिनती है।'
            : 'These numbers only count the answers selected.'}
        </p>

        <div className="va-results__summary" aria-live="polite">
          <div className="va-results__eye-card">
            <span className="va-results__eye-label">
              {lang === 'hi' ? 'बाईं आँख' : 'Left eye'}
            </span>

            <strong className="va-results__eye-score">
              {leftCorrect}/{results.left.length}
            </strong>

            <span className="va-results__eye-caption">
              {lang === 'hi'
                ? 'सही दिशा-चयन'
                : 'Matching direction choices'}
            </span>
          </div>

          <div className="va-results__eye-card">
            <span className="va-results__eye-label">
              {lang === 'hi' ? 'दाईं आँख' : 'Right eye'}
            </span>

            <strong className="va-results__eye-score">
              {rightCorrect}/{results.right.length}
            </strong>

            <span className="va-results__eye-caption">
              {lang === 'hi'
                ? 'सही दिशा-चयन'
                : 'Matching direction choices'}
            </span>
          </div>
        </div>

        <p className="vision-activity__notice" role="note">
          {lang === 'hi'
            ? 'यह परिणाम दृष्टि की तीक्ष्णता, चश्मे के नंबर या किसी नेत्र रोग का आकलन नहीं करता। किसी चिंता के लिए नेत्र-देखभाल पेशेवर से संपर्क करें।'
            : 'This result does not assess visual acuity, eyeglass prescription, or eye disease. Contact an eye-care professional about any concern.'}
        </p>

        <div className="vision-activity__actions">
          <button
            className="btn btn--primary btn--full btn--lg"
            type="button"
            onClick={handleFinish}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              description
            </span>

            {lang === 'hi'
              ? 'इनसाइट्स देखें'
              : 'View Insights'}
          </button>
        </div>
      </section>
    </main>
  );
}
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
  const { language, skipVision, setVisionResults, visionResults, isDemo, demoPersona } = useApp();
  const lang = language || 'en';
  const [phase, setPhase] = useState('intro');
  const [currentEye, setCurrentEye] = useState('left');
  const [trialIndex, setTrialIndex] = useState(0);
  const [direction, setDirection] = useState(randomDirection);
  const [results, setResults] = useState({ left: [], right: [] });
  const [feedback, setFeedback] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [reportPending, setReportPending] = useState(false);
  const timeoutRef = useRef(null);
  const demoSkipHandled = useRef(false);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (isDemo && demoPersona?.skipVision && !demoSkipHandled.current) {
      demoSkipHandled.current = true;
      setReportPending(true);
      skipVision();
    }
  }, [isDemo, demoPersona, skipVision]);

  useEffect(() => {
    if (reportPending && (visionResults?.completed || visionResults?.skipped)) {
      navigate('/report', { replace: true });
    }
  }, [reportPending, visionResults, navigate]);

  const handleSkip = () => {
    if (reportPending) return;
    setReportPending(true);
    skipVision();
  };

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
    if (isLocked || reportPending || phase !== 'testing') return;
    setIsLocked(true);
    const correct = chosen === direction;
    setFeedback(correct ? 'correct' : 'wrong');
    setResults((prev) => ({
      ...prev,
      [currentEye]: [...prev[currentEye], { round: trialIndex + 1, expected: direction, answered: chosen, correct }],
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
  }, [currentEye, direction, isLocked, phase, reportPending, trialIndex]);

  const handleFinish = () => {
    if (reportPending) return;
    setReportPending(true);
    const leftCorrect = results.left.filter((t) => t.correct).length;
    const rightCorrect = results.right.filter((t) => t.correct).length;
    setVisionResults({
      completed: true,
      skipped: false,
      data: {
        activityType: 'direction-awareness',
        left: { correct: leftCorrect, total: results.left.length, trials: results.left },
        right: { correct: rightCorrect, total: results.right.length, trials: results.right },
      },
    });
  };

  if (isDemo && demoPersona?.skipVision) return null;

  if (phase === 'intro') {
    return (
      <main className="va" id="main-content" tabIndex="-1">
        <header className="va__topbar">
          <button className="va__back-btn" type="button" onClick={() => navigate('/intake', { replace: true })} aria-label={t('common.back', lang)}>
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          </button>
          <span className="va__topbar-title">{t('vision.title', lang)}</span>
          <span className="va__topbar-spacer" />
        </header>
        <div className="va__intro animate-fade-in">
          <div className="va__hero-ring" aria-hidden="true"><span className="va__hero-e">E</span></div>
          <h1 className="va__intro-title">{lang === 'hi' ? 'दिशा पहचान गतिविधि' : 'Direction Awareness Activity'}</h1>
          <p className="va__intro-desc">
            {lang === 'hi' ? 'एक वैकल्पिक इंटरैक्टिव गतिविधि। यह आँखों की जाँच या दृष्टि की तीक्ष्णता मापने का तरीका नहीं है।' : 'An optional interactive activity. This is not an eye examination and does not measure visual acuity.'}
          </p>
          <ol className="va__steps">
            <li className="va__step"><span className="va__step-num">1</span><span className="va__step-body"><strong>{lang === 'hi' ? 'स्क्रीन आराम से देखें' : 'Look at the screen comfortably'}</strong><span>{lang === 'hi' ? 'फ़ोन को आरामदायक दूरी पर रखें।' : 'Hold your phone at a comfortable distance.'}</span></span></li>
            <li className="va__step"><span className="va__step-num">2</span><span className="va__step-body"><strong>{lang === 'hi' ? 'E की दिशा पहचानें' : 'Identify the direction of E'}</strong><span>{lang === 'hi' ? 'ऊपर, नीचे, बाएँ या दाएँ चुनें।' : 'Choose up, down, left, or right.'}</span></span></li>
            <li className="va__step"><span className="va__step-num">3</span><span className="va__step-body"><strong>{lang === 'hi' ? 'दो छोटे राउंड पूरे करें' : 'Complete both short rounds'}</strong><span>{lang === 'hi' ? 'हर राउंड में पाँच संकेत होंगे। दोनों आँखें सामान्य रूप से खुली रखें; यह गतिविधि आँखों की अलग-अलग जाँच नहीं करती।' : 'Each round has five prompts. Keep both eyes comfortably open; this activity does not assess either eye separately.'}</span></span></li>
          </ol>
          <p className="va__notice" role="note"><span className="material-symbols-outlined" aria-hidden="true">info</span>{lang === 'hi' ? 'परिणाम केवल चुने गए उत्तरों की गिनती है। चश्मे का नंबर या आँखों की सेहत का निष्कर्ष नहीं निकाला जाता।' : 'The result only counts answers selected. It cannot determine a prescription or indicate eye health.'}</p>
          <div className="va__intro-actions">
            <button className="btn btn--primary btn--full btn--lg va__start-btn" type="button" onClick={startActivity}>{lang === 'hi' ? 'गतिविधि शुरू करें' : 'Start activity'}<span className="material-symbols-outlined" aria-hidden="true">play_arrow</span></button>
            <button className="btn btn--ghost btn--full" type="button" onClick={handleSkip} disabled={reportPending}><span className="material-symbols-outlined" aria-hidden="true">skip_next</span>{t('vision.skip', lang)}</button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === 'testing') {
    const roundLabel = currentEye === 'left' ? (lang === 'hi' ? 'राउंड 1' : 'Round 1') : (lang === 'hi' ? 'राउंड 2' : 'Round 2');
    const overallTrial = currentEye === 'left' ? trialIndex + 1 : TRIALS_PER_EYE + trialIndex + 1;
    const progressPct = ((overallTrial - 1) / TOTAL_TRIALS) * 100;
    return (
      <main className="va va--testing" id="main-content" tabIndex="-1">
        <header className="va__topbar"><span className="va__topbar-spacer" /><span className="va__topbar-title">{roundLabel}</span><span className="va__topbar-counter">{overallTrial}/{TOTAL_TRIALS}</span></header>
        <div className="va__progress-bar-wrap"><div className="va__progress-track" role="progressbar" aria-label={lang === 'hi' ? 'गतिविधि प्रगति' : 'Activity progress'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)}><div className="va__progress-fill" style={{ width: `${progressPct}%` }} /></div></div>
        <section className="va__test" aria-labelledby="va-test-q">
          <p className="va__cover-hint">{lang === 'hi' ? 'दोनों आँखें खुली रखें · कोई अलग-अलग आँखों का आकलन नहीं' : 'Keep both eyes open · no separate eye assessment'}</p><div className="va__disclaimer-pill">{lang === 'hi' ? 'यह दृष्टि परीक्षण नहीं है' : 'Not a vision test'}</div>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {feedback ? (lang === 'hi' ? 'दिशा का जवाब दर्ज किया गया।' : 'Direction response recorded.') : ''}
          </p>
          <div className="va__e-zone" aria-live="off">{feedback && <span className={`va__fb va__fb--${feedback}`} aria-hidden="true"><span className="material-symbols-outlined">{feedback === 'correct' ? 'check' : 'close'}</span></span>}<span className="va__e-char" aria-label={lang === 'hi' ? 'घुमाया हुआ अक्षर E' : 'Rotated letter E'} style={{ fontSize: `${SYMBOL_SIZE}px`, transform: `rotate(${ROTATION[direction]}deg)`, opacity: feedback ? 0.3 : 1 }}>E</span></div>
          <h1 id="va-test-q" className="va__test-prompt">{lang === 'hi' ? 'E किस दिशा में खुला है?' : 'Which way is the E pointing?'}</h1>
          <div className="va__dir-grid" role="group" aria-label={lang === 'hi' ? 'दिशा चुनें' : 'Choose a direction'}>
            {DIRECTIONS.map((d) => <button key={d} type="button" className="va__dir-btn" onClick={() => handleResponse(d)} disabled={isLocked || reportPending} aria-label={dirLabel(d, lang)}><span className="material-symbols-outlined va__dir-icon" aria-hidden="true">{DIR_ICONS[d]}</span><span className="va__dir-label">{dirLabel(d, lang)}</span></button>)}
          </div>
          <p className="va__trial-count" aria-live="polite">{lang === 'hi' ? `प्रश्न ${overallTrial} / ${TOTAL_TRIALS}` : `Prompt ${overallTrial} of ${TOTAL_TRIALS}`}</p>
          <button className="btn btn--ghost va__skip-link" type="button" onClick={handleSkip} disabled={reportPending}>{lang === 'hi' ? 'गतिविधि छोड़ें' : 'Skip activity'}</button>
        </section>
      </main>
    );
  }

  const leftCorrect = results.left.filter((t) => t.correct).length;
  const rightCorrect = results.right.filter((t) => t.correct).length;
  return (
    <main className="va" id="main-content" tabIndex="-1">
      <header className="va__topbar"><span className="va__topbar-spacer" /><span className="va__topbar-title">{lang === 'hi' ? 'गतिविधि परिणाम' : 'Activity Results'}</span><span className="va__topbar-spacer" /></header>
      <section className="va__results animate-fade-in" aria-labelledby="va-results-heading">
        <div className="va__results-header"><span className="material-symbols-outlined va__results-check" aria-hidden="true">check_circle</span><h1 id="va-results-heading" className="va__results-title">{lang === 'hi' ? 'गतिविधि पूरी हुई' : 'Activity Complete'}</h1><p className="va__results-sub">{lang === 'hi' ? 'ये संख्याएँ केवल इस गतिविधि में चुनी गई दिशाओं की गिनती हैं।' : 'These numbers count direction selections in this interaction only.'}</p></div>
        <div className="va__results-grid" aria-live="polite">
          <div className="va__eye-card"><span className="va__eye-label">{lang === 'hi' ? 'राउंड 1' : 'Round 1'}</span><strong className="va__eye-score">{leftCorrect}/{results.left.length}</strong><span className="va__eye-caption">{lang === 'hi' ? 'दिखाई गई दिशा से मेल खाते चयन' : 'Selections matching the displayed orientation'}</span></div>
          <div className="va__eye-card"><span className="va__eye-label">{lang === 'hi' ? 'राउंड 2' : 'Round 2'}</span><strong className="va__eye-score">{rightCorrect}/{results.right.length}</strong><span className="va__eye-caption">{lang === 'hi' ? 'दिखाई गई दिशा से मेल खाते चयन' : 'Selections matching the displayed orientation'}</span></div>
        </div>
        <p className="va__notice" role="note"><span className="material-symbols-outlined" aria-hidden="true">info</span>{lang === 'hi' ? 'यह गतिविधि दृष्टि की तीक्ष्णता, दोनों आँखों के बीच अंतर, चश्मे के नंबर या नेत्र रोग का आकलन नहीं करती। किसी चिंता के लिए नेत्र-देखभाल पेशेवर से संपर्क करें।' : 'This interaction does not assess visual acuity, differences between your eyes, prescription or eye disease. Contact an eye-care professional for any concern.'}</p>
        <button className="btn btn--primary btn--full btn--lg va__finish-btn" type="button" onClick={handleFinish} disabled={reportPending}>{lang === 'hi' ? 'रिपोर्ट देखें' : 'View your report'}<span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>
        <div className="va__amsler-cta">
          <p className="va__amsler-cta-label">{lang === 'hi' ? 'एक और वैकल्पिक स्व-निगरानी गतिविधि आज़माएँ:' : 'Try another optional self-monitoring activity:'}</p>
          <button className="btn btn--outline btn--full" type="button" onClick={() => navigate('/amsler')}>
            <span className="material-symbols-outlined" aria-hidden="true">grid_on</span>
            {lang === 'hi' ? 'एम्सलर ग्रिड स्व-निगरानी गतिविधि' : 'Amsler Grid Self-Monitoring Activity'}
          </button>
        </div>
      </section>
    </main>
  );
}

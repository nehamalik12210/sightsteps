import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { getVisibleQuestions } from '../data/questions.js';
import { speakWhenReady, stopSpeaking } from '../utils/tts.js';
import './Intake.css';

/* Stage metadata for category badges */
const STAGE_META = {
  refractive: {
    en: 'Vision experience',
    hi: 'दृष्टि अनुभव',
    icon: 'visibility',
  },
  lifestyle: {
    en: 'Daily habits',
    hi: 'दैनिक आदतें',
    icon: 'self_improvement',
  },
  awareness: {
    en: 'Eye-care background',
    hi: 'आँखों की देखभाल',
    icon: 'health_and_safety',
  },
};

export default function Intake() {
  const navigate = useNavigate();

  const {
    language,
    answers,
    setAnswer,
    isDemo,
    demoPersona,
    demoNextStep,
    skipVision,
  } = useApp();

  const lang = language || 'en';

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [animDir, setAnimDir] = useState('in');
  const [waitingForDemoTap, setWaitingForDemoTap] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [hasSpokenCurrent, setHasSpokenCurrent] = useState(false);
  const [noteText, setNoteText] = useState('');

  const answerTimerRef = useRef(null);
  const playedQuestionsRef = useRef(new Set());
  const demoPrefillHandledRef = useRef(false);

  /* Visible questions (full conditional bank or demo subset) */
  const visibleQuestions = useMemo(() => {
    const questionsForAnswers = getVisibleQuestions(answers);

    if (!isDemo || !demoPersona?.demoQuestionIds?.length) {
      return questionsForAnswers;
    }

    const demoQuestionIds = new Set(demoPersona.demoQuestionIds);
    return questionsForAnswers.filter((q) => demoQuestionIds.has(q.id));
  }, [answers, isDemo, demoPersona]);

  /* Progress */
  const progress = useMemo(() => {
    const total = visibleQuestions.length;
    const answered = visibleQuestions.filter((q) => Boolean(answers[q.id])).length;
    return { answered, total, fraction: total > 0 ? answered / total : 0 };
  }, [answers, visibleQuestions]);

  /* Select next unanswered question */
  useEffect(() => {
    const nextQ = visibleQuestions.find((q) => !answers[q.id]) || null;

    if (!nextQ) {
      stopSpeaking();
      if (isDemo && demoPersona?.skipVision) {
        skipVision();
        navigate('/report', { replace: true });
      } else {
        navigate('/vision', { replace: true });
      }
      return;
    }

    setCurrentQuestion(nextQ);
    setAnimDir('in');
    setHasSpokenCurrent(playedQuestionsRef.current.has(nextQ.id));
  }, [answers, visibleQuestions, demoPersona, isDemo, navigate, skipVision]);

  /* Pre-fill hidden demo answers */
  useEffect(() => {
    if (!isDemo || !demoPersona || demoPrefillHandledRef.current) return;
    demoPrefillHandledRef.current = true;

    const visibleDemoIds = new Set(demoPersona.demoQuestionIds || []);
    Object.entries(demoPersona.answers || {}).forEach(([qId, preAns]) => {
      if (!visibleDemoIds.has(qId) && !answers[qId] && preAns) {
        setAnswer(qId, preAns.value, preAns.label);
      }
    });
  }, [isDemo, demoPersona, answers, setAnswer]);

  /* Demo: wait for explicit tap */
  useEffect(() => {
    if (!isDemo || !currentQuestion) {
      setWaitingForDemoTap(false);
      return;
    }
    setWaitingForDemoTap(Boolean(demoPersona?.answers?.[currentQuestion.id]));
  }, [isDemo, demoPersona, currentQuestion]);

  /* Cleanup */
  useEffect(() => () => {
    if (answerTimerRef.current) window.clearTimeout(answerTimerRef.current);
    stopSpeaking();
  }, []);

  /* TTS */
  const speakCurrentQuestion = useCallback(async () => {
    if (!currentQuestion || speaking) return;
    if (!isDemo || !demoPersona?.ttsQuestionIds?.includes(currentQuestion.id)) return;

    playedQuestionsRef.current.add(currentQuestion.id);
    setHasSpokenCurrent(true);
    setSpeaking(true);

    const spokenText = currentQuestion.text[lang] || currentQuestion.text.en;
    await speakWhenReady(spokenText, lang, {
      rate: lang === 'hi' ? 0.88 : 1,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [currentQuestion, demoPersona, isDemo, lang, speaking]);

  /* Answer handler */
  const handleAnswer = useCallback((option) => {
    if (!currentQuestion || animDir === 'out') return;

    setAnimDir('out');
    setWaitingForDemoTap(false);
    stopSpeaking();
    setSpeaking(false);

    if (answerTimerRef.current) window.clearTimeout(answerTimerRef.current);

    answerTimerRef.current = window.setTimeout(() => {
      setAnswer(currentQuestion.id, option.value, option.label);
      if (isDemo) demoNextStep();
    }, 200);
  }, [animDir, currentQuestion, demoNextStep, isDemo, setAnswer]);

  /* Demo next */
  const handleDemoNext = useCallback(() => {
    if (!currentQuestion || !demoPersona) return;
    const preAns = demoPersona.answers?.[currentQuestion.id];
    if (!preAns) return;
    handleAnswer({ value: preAns.value, label: preAns.label });
  }, [currentQuestion, demoPersona, handleAnswer]);

  /* Go back */
  const handleGoBack = useCallback(() => {
    if (!currentQuestion) return;
    stopSpeaking();

    const idx = visibleQuestions.findIndex((q) => q.id === currentQuestion.id);
    if (idx <= 0) {
      navigate(isDemo ? '/' : '/activities');
      return;
    }

    const prevQ = visibleQuestions[idx - 1];
    setAnswer(prevQ.id, undefined, undefined);

    visibleQuestions.slice(idx).forEach((q) => {
      if (answers[q.id]) setAnswer(q.id, undefined, undefined);
    });
  }, [currentQuestion, visibleQuestions, navigate, isDemo, setAnswer, answers]);

  /* Note submit */
  const handleNoteSubmit = useCallback(() => {
    if (!currentQuestion) return;
    setAnimDir('out');
    setTimeout(() => {
      setAnswer(currentQuestion.id, noteText || '', { en: noteText || '', hi: noteText || '' });
      if (isDemo) demoNextStep();
    }, 200);
  }, [currentQuestion, noteText, setAnswer, isDemo, demoNextStep]);

  /* Loading state */
  if (!currentQuestion) {
    return (
      <main className="iq iq--loading" aria-live="polite">
        <p>{t('common.loading', lang)}</p>
      </main>
    );
  }

  const questionIndex = Math.max(
    0,
    visibleQuestions.findIndex((q) => q.id === currentQuestion.id),
  );

  const demoAnswer = isDemo ? demoPersona?.answers?.[currentQuestion.id] : null;

  const isTTSQuestion = Boolean(
    isDemo && demoPersona?.ttsQuestionIds?.includes(currentQuestion.id),
  );

  const stage = STAGE_META[currentQuestion.category] || {
    en: 'Question', hi: 'सवाल', icon: 'help',
  };

  /* Is this a conditional question? */
  const isConditional = Boolean(currentQuestion.showIf);

  return (
    <main className="iq">
      {/* Demo banner */}
      {isDemo && (
        <div className="iq__demo-banner" role="status">
          <span className="material-symbols-outlined" aria-hidden="true">target</span>
          <span>{t('demo.banner', lang)}</span>
        </div>
      )}

      {/* Top bar */}
      <header className="iq__topbar">
        <button
          className="iq__back-btn"
          type="button"
          onClick={() => { stopSpeaking(); handleGoBack(); }}
          aria-label={t('common.back', lang)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>

        <div className="iq__progress-area">
          <div className="iq__progress-track" role="progressbar"
            aria-label={lang === 'hi' ? 'सवालों की प्रगति' : 'Question progress'}
            aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={Math.round(progress.fraction * 100)}
          >
            <div className="iq__progress-fill" style={{ width: `${progress.fraction * 100}%` }} />
          </div>
          <div className="iq__progress-meta">
            <span className="iq__progress-step">
              {t('intake.questionOf', lang, { current: questionIndex + 1, total: visibleQuestions.length })}
            </span>
            <span className="iq__progress-pct">
              {Math.round(progress.fraction * 100)}%
            </span>
          </div>
        </div>
      </header>

      {/* Question card */}
      <section
        className={`iq__card iq__card--${animDir}`}
        key={currentQuestion.id}
        aria-labelledby="iq-question-title"
      >
        {/* Category badge */}
        <div className="iq__stage-badge">
          <span className="material-symbols-outlined" aria-hidden="true">{stage.icon}</span>
          <span>{stage[lang] || stage.en}</span>
        </div>

        {/* Conditional explanation */}
        {isConditional && (
          <p className="iq__conditional-note">
            <span className="material-symbols-outlined" aria-hidden="true">subdirectory_arrow_right</span>
            {lang === 'hi'
              ? 'आपके पिछले जवाब के आधार पर यह सवाल दिखाया गया है।'
              : 'This question appeared based on your previous answer.'}
          </p>
        )}

        {/* TTS control */}
        {isTTSQuestion && (
          <button
            className="iq__tts-btn"
            type="button"
            onClick={speakCurrentQuestion}
            disabled={speaking}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {speaking ? 'graphic_eq' : 'volume_up'}
            </span>
            {speaking
              ? (lang === 'hi' ? 'बोल रहा है…' : 'Speaking…')
              : hasSpokenCurrent
                ? (lang === 'hi' ? 'फिर से सुनें' : 'Listen again')
                : (lang === 'hi' ? 'सवाल सुनें' : 'Listen to question')}
          </button>
        )}

        {speaking && (
          <p className="iq__speaking-status" role="status" aria-live="polite">
            {lang === 'hi' ? 'ऑडियो चल रहा है।' : 'Audio is playing.'}
          </p>
        )}

        {/* Question text */}
        <h1 id="iq-question-title" className="iq__question-text">
          {currentQuestion.text[lang] || currentQuestion.text.en}
        </h1>

        {/* Textarea (participant note) */}
        {currentQuestion.type === 'textarea' ? (
          <div className="iq__note-area">
            <textarea
              className="iq__note-input"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t('intake.note.placeholder', lang)}
              rows={4}
              maxLength={500}
            />
            <div className="iq__note-actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setAnimDir('out');
                  setTimeout(() => {
                    setAnswer(currentQuestion.id, '', { en: '', hi: '' });
                    if (isDemo) demoNextStep();
                  }, 200);
                }}
              >
                {t('intake.note.skip', lang)}
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleNoteSubmit}
              >
                <span className="material-symbols-outlined" aria-hidden="true">check</span>
                {t('intake.note.save', lang)}
              </button>
            </div>
          </div>
        ) : (
          /* Answer options */
          <div className="iq__options" role="group"
            aria-label={lang === 'hi' ? 'अपना उत्तर चुनें' : 'Choose your answer'}
          >
            {currentQuestion.options.map((option) => {
              const isPreselected = isDemo && demoAnswer?.value === option.value;
              const optionLabel = option.label[lang] || option.label.en;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`iq__option${isPreselected ? ' iq__option--demo' : ''}`}
                  onClick={() => handleAnswer(option)}
                  disabled={animDir === 'out'}
                  aria-pressed={false}
                >
                  {option.icon && (
                    <span className="iq__option-icon-wrap" aria-hidden="true">
                      <span className="material-symbols-outlined iq__option-icon">
                        {option.icon}
                      </span>
                    </span>
                  )}

                  <span className="iq__option-label">{optionLabel}</span>

                  {isPreselected && (
                    <span className="iq__option-demo-tag">
                      <span className="material-symbols-outlined" aria-hidden="true">person</span>
                      {lang === 'hi' ? 'रमेश' : 'Ramesh'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Demo mode: explicit continue control */}
      {isDemo && waitingForDemoTap && (
        <div className="iq__demo-footer">
          <button
            className="btn btn--primary btn--full btn--lg iq__demo-continue"
            type="button"
            onClick={handleDemoNext}
            disabled={!demoAnswer || animDir === 'out'}
          >
            <span className="material-symbols-outlined" aria-hidden="true">touch_app</span>
            {t('demo.next', lang)}
          </button>
          <p className="iq__demo-hint">
            {lang === 'hi'
              ? 'डेमो उत्तर चुनने के लिए आगे बढ़ें।'
              : 'Press to confirm the demo answer and continue.'}
          </p>
        </div>
      )}
    </main>
  );
}

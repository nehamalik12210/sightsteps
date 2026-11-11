import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { getVisibleQuestions } from '../data/questions.js';
import { speakWhenReady, stopSpeaking } from '../utils/tts.js';
import './Intake.css';

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

  const answerTimerRef = useRef(null);
  const playedQuestionsRef = useRef(new Set());
  const demoPrefillHandledRef = useRef(false);

  // Demo mode displays only Ramesh's six selected questions.
  // Normal mode continues to display the full conditional questionnaire.
  const visibleQuestions = useMemo(() => {
    const questionsForAnswers = getVisibleQuestions(answers);

    if (!isDemo || !demoPersona?.demoQuestionIds?.length) {
      return questionsForAnswers;
    }

    const demoQuestionIds = new Set(demoPersona.demoQuestionIds);

    return questionsForAnswers.filter((question) =>
      demoQuestionIds.has(question.id),
    );
  }, [answers, isDemo, demoPersona]);

  // Calculate progress using only the questions actually displayed.
  const progress = useMemo(() => {
    const total = visibleQuestions.length;

    const answered = visibleQuestions.filter(
      (question) => Boolean(answers[question.id]),
    ).length;

    return {
      answered,
      total,
      fraction: total > 0 ? answered / total : 0,
    };
  }, [answers, visibleQuestions]);

  // Always select the next unanswered question from the visible sequence.
  useEffect(() => {
    const nextQuestion =
      visibleQuestions.find((question) => !answers[question.id]) || null;

    if (!nextQuestion) {
      stopSpeaking();

      if (isDemo && demoPersona?.skipVision) {
        skipVision();
        navigate('/report', { replace: true });
      } else {
        navigate('/vision', { replace: true });
      }

      return;
    }

    setCurrentQuestion(nextQuestion);
    setAnimDir('in');

    setHasSpokenCurrent(
      playedQuestionsRef.current.has(nextQuestion.id),
    );
  }, [
    answers,
    visibleQuestions,
    demoPersona,
    isDemo,
    navigate,
    skipVision,
  ]);

  // Fill hidden persona answers for report insights.
  // These questions are never displayed or used to advance the visible demo.
  useEffect(() => {
    if (!isDemo || !demoPersona || demoPrefillHandledRef.current) {
      return;
    }

    demoPrefillHandledRef.current = true;

    const visibleDemoIds = new Set(
      demoPersona.demoQuestionIds || [],
    );

    Object.entries(demoPersona.answers || {}).forEach(
      ([questionId, predefinedAnswer]) => {
        if (
          !visibleDemoIds.has(questionId) &&
          !answers[questionId] &&
          predefinedAnswer
        ) {
          setAnswer(
            questionId,
            predefinedAnswer.value,
            predefinedAnswer.label,
          );
        }
      },
    );
  }, [isDemo, demoPersona, answers, setAnswer]);

  // Each visible demo question waits for an explicit Continue tap.
  useEffect(() => {
    if (!isDemo || !currentQuestion) {
      setWaitingForDemoTap(false);
      return;
    }

    const hasDemoAnswer = Boolean(
      demoPersona?.answers?.[currentQuestion.id],
    );

    setWaitingForDemoTap(hasDemoAnswer);
  }, [isDemo, demoPersona, currentQuestion]);

  useEffect(() => () => {
    if (answerTimerRef.current) {
      window.clearTimeout(answerTimerRef.current);
    }

    stopSpeaking();
  }, []);

  const speakCurrentQuestion = useCallback(async () => {
    if (!currentQuestion || speaking) return;

    if (
      !isDemo ||
      !demoPersona?.ttsQuestionIds?.includes(currentQuestion.id)
    ) {
      return;
    }

    playedQuestionsRef.current.add(currentQuestion.id);
    setHasSpokenCurrent(true);
    setSpeaking(true);

    const spokenText =
      currentQuestion.text[lang] || currentQuestion.text.en;

    await speakWhenReady(spokenText, lang, {
      rate: lang === 'hi' ? 0.88 : 1,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [currentQuestion, demoPersona, isDemo, lang, speaking]);

  const handleAnswer = useCallback((option) => {
    if (!currentQuestion || animDir === 'out') return;

    setAnimDir('out');
    setWaitingForDemoTap(false);

    stopSpeaking();
    setSpeaking(false);

    if (answerTimerRef.current) {
      window.clearTimeout(answerTimerRef.current);
    }

    answerTimerRef.current = window.setTimeout(() => {
      setAnswer(
        currentQuestion.id,
        option.value,
        option.label,
      );

      if (isDemo) {
        demoNextStep();
      }
    }, 180);
  }, [
    animDir,
    currentQuestion,
    demoNextStep,
    isDemo,
    setAnswer,
  ]);

  const handleDemoNext = useCallback(() => {
    if (!currentQuestion || !demoPersona) return;

    const predefinedAnswer =
      demoPersona.answers?.[currentQuestion.id];

    if (!predefinedAnswer) return;

    handleAnswer({
      value: predefinedAnswer.value,
      label: predefinedAnswer.label,
    });
  }, [currentQuestion, demoPersona, handleAnswer]);

  if (!currentQuestion) {
    return (
      <main className="intake intake--loading" aria-live="polite">
        <p>{t('common.loading', lang)}</p>
      </main>
    );
  }

  const questionIndex = Math.max(
    0,
    visibleQuestions.findIndex(
      (question) => question.id === currentQuestion.id,
    ),
  );

  const demoAnswer = isDemo
    ? demoPersona?.answers?.[currentQuestion.id]
    : null;

  const isTTSQuestion = Boolean(
    isDemo &&
    demoPersona?.ttsQuestionIds?.includes(currentQuestion.id),
  );

  const categoryLabels = {
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
      en: 'Eye-care history',
      hi: 'आँखों की देखभाल',
      icon: 'health_and_safety',
    },
  };

  const category = categoryLabels[currentQuestion.category] || {
    en: 'Question',
    hi: 'सवाल',
    icon: 'help',
  };

  return (
    <main className="intake">
      {isDemo && (
        <div className="demo-banner" role="status">
          <span
            className="demo-banner__icon material-symbols-outlined"
            aria-hidden="true"
          >
            target
          </span>
          <span>{t('demo.banner', lang)}</span>
        </div>
      )}

      <header className="app-header">
        <button
          className="app-header__back"
          type="button"
          onClick={() => {
            stopSpeaking();
            navigate('/');
          }}
          aria-label={
            lang === 'hi'
              ? 'मुख्य पृष्ठ पर वापस जाएँ'
              : 'Return to home'
          }
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_back
          </span>
        </button>

        <span className="app-header__title">
          {t('intake.title', lang)}
        </span>

        <span className="app-header__action" />
      </header>

      <div className="intake__progress">
        <div className="progress-label">
          <span>
            {t('intake.questionOf', lang, {
              current: questionIndex + 1,
              total: visibleQuestions.length,
            })}
          </span>

          <span className="intake__progress-pct">
            {Math.round(progress.fraction * 100)}%
          </span>
        </div>

        <div
          className="progress"
          role="progressbar"
          aria-label={
            lang === 'hi'
              ? 'सवालों की प्रगति'
              : 'Question progress'
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.fraction * 100)}
        >
          <div
            className="progress__bar"
            style={{
              width: `${progress.fraction * 100}%`,
            }}
          />
        </div>
      </div>

      <section
        className={`intake__question intake__question--${animDir}`}
        key={currentQuestion.id}
        aria-labelledby="intake-question-title"
      >
        <div className="intake__category-badge">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            {category.icon}
          </span>

          <span>{category[lang] || category.en}</span>
        </div>

        {isTTSQuestion && (
          <button
            className="intake__play-btn"
            type="button"
            onClick={speakCurrentQuestion}
            disabled={speaking}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              volume_up
            </span>

            {speaking
              ? (lang === 'hi' ? 'बोल रहा है…' : 'Speaking…')
              : hasSpokenCurrent
                ? (lang === 'hi' ? 'फिर से सुनें' : 'Listen again')
                : (lang === 'hi' ? 'सवाल सुनें' : 'Listen to question')}
          </button>
        )}

        {speaking && (
          <p
            className="intake__speaking"
            role="status"
            aria-live="polite"
          >
            {lang === 'hi'
              ? 'ऑडियो चल रहा है।'
              : 'Audio is playing.'}
          </p>
        )}

        <h1
          id="intake-question-title"
          className="intake__question-text"
        >
          {currentQuestion.text[lang] || currentQuestion.text.en}
        </h1>

        <div
          className="intake__options"
          role="group"
          aria-label={
            lang === 'hi'
              ? 'अपना उत्तर चुनें'
              : 'Choose your answer'
          }
        >
          {currentQuestion.options.map((option) => {
            const isPreselected =
              isDemo && demoAnswer?.value === option.value;

            const optionLabel =
              option.label[lang] || option.label.en;

            return (
              <button
                key={option.value}
                type="button"
                className={
                  `intake__option${isPreselected ? ' intake__option--demo' : ''}`
                }
                onClick={() => handleAnswer(option)}
                disabled={animDir === 'out'}
                aria-pressed={false}
              >
                {option.icon && (
                  <span
                    className="intake__option-icon"
                    aria-hidden="true"
                  >
                    {option.icon}
                  </span>
                )}

                <span className="intake__option-label">
                  {optionLabel}
                </span>

                {isPreselected && (
                  <span className="intake__option-demo-badge">
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      person
                    </span>

                    {lang === 'hi' ? 'रमेश' : 'Ramesh'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {isDemo && waitingForDemoTap && (
        <div className="intake__demo-control">
          <button
            className="btn btn--primary btn--full btn--lg"
            type="button"
            onClick={handleDemoNext}
            disabled={!demoAnswer || animDir === 'out'}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              touch_app
            </span>

            {t('demo.next', lang)}
          </button>

          <p className="intake__demo-hint">
            {lang === 'hi'
              ? 'डेमो उत्तर चुनने के लिए आगे बढ़ें।'
              : 'Continue to select the demo answer.'}
          </p>
        </div>
      )}
    </main>
  );
}
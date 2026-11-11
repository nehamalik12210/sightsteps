import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { getVisibleQuestions, getProgress, getNextQuestion } from '../data/questions.js';
import { speakWhenReady, stopSpeaking, initVoices } from '../utils/tts.js';
import './Intake.css';

export default function Intake() {
  const navigate = useNavigate();
  const {
    language, answers, setAnswer, isDemo, demoPersona,
    demoStepIndex, demoNextStep, skipVision
  } = useApp();
  const lang = language || 'en';

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [animDir, setAnimDir] = useState('in');
  const [waitingForDemoTap, setWaitingForDemoTap] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const hasSpokenQ = useRef(new Set());

  useEffect(() => { initVoices(); }, []);

  const visibleQuestions = getVisibleQuestions(answers);
  const progress = getProgress(answers);

  // Determine current question
  useEffect(() => {
    const next = getNextQuestion(answers);
    if (!next) {
      if (isDemo && demoPersona?.skipVision) {
        skipVision();
        navigate('/report', { replace: true });
      } else {
        navigate('/vision', { replace: true });
      }
      return;
    }
    setCurrentQuestion(next);
    setAnimDir('in');
  }, [answers, navigate, isDemo, demoPersona, skipVision]);

  // Demo: auto-answer non-visible questions silently
  useEffect(() => {
    if (!isDemo || !demoPersona || !currentQuestion) return;
    const isDemoQ = demoPersona.demoQuestionIds.includes(currentQuestion.id);
    if (!isDemoQ) {
      const timer = setTimeout(() => {
        const pre = demoPersona.answers[currentQuestion.id];
        if (pre) setAnswer(currentQuestion.id, pre.value, pre.label);
      }, 150);
      return () => clearTimeout(timer);
    }
    setWaitingForDemoTap(true);
  }, [isDemo, demoPersona, currentQuestion, setAnswer]);

  // Speak the current question — called from CLICK HANDLERS only
  const speakCurrentQuestion = useCallback(() => {
    if (!currentQuestion) return;
    if (!isDemo || !demoPersona) return;
    if (!demoPersona.ttsQuestionIds.includes(currentQuestion.id)) return;
    if (hasSpokenQ.current.has(currentQuestion.id)) return;

    hasSpokenQ.current.add(currentQuestion.id);
    setSpeaking(true);
    const text = currentQuestion.text[lang] || currentQuestion.text.en;
    speakWhenReady(text, lang, {
      rate: 0.85,
      pitch: 0.95,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [currentQuestion, isDemo, demoPersona, lang]);

  const handleAnswer = useCallback((option) => {
    if (animDir === 'out') return;
    setAnimDir('out');
    stopSpeaking();
    setSpeaking(false);

    setTimeout(() => {
      setAnswer(currentQuestion.id, option.value, option.label);
      if (isDemo) {
        setWaitingForDemoTap(false);
        demoNextStep();
      }
    }, 200);
  }, [currentQuestion, setAnswer, animDir, isDemo, demoNextStep]);

  // Demo "Next" button — auto-answer current, then speak next Q if it's a TTS question
  const handleDemoNext = useCallback(() => {
    if (!currentQuestion || !demoPersona) return;
    const pre = demoPersona.answers[currentQuestion.id];
    if (pre) {
      // After answering, the next question will mount and we check TTS via effect below
      handleAnswer({ value: pre.value, label: pre.label });
    }
  }, [currentQuestion, demoPersona, handleAnswer]);

  // Auto-speak TTS for new demo questions arriving from user gesture chain
  useEffect(() => {
    if (!isDemo || !demoPersona || !currentQuestion) return;
    if (!demoPersona.ttsQuestionIds.includes(currentQuestion.id)) return;
    if (hasSpokenQ.current.has(currentQuestion.id)) return;
    // Small delay to let animation settle, then speak
    const timer = setTimeout(() => {
      speakCurrentQuestion();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentQuestion?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentQuestion) return null;

  const questionIndex = visibleQuestions.findIndex((q) => q.id === currentQuestion.id);
  const demoAnswer = isDemo && demoPersona ? demoPersona.answers[currentQuestion.id] : null;
  const isTTSQuestion = isDemo && demoPersona?.ttsQuestionIds?.includes(currentQuestion.id);
  const hasSpoken = hasSpokenQ.current.has(currentQuestion.id);

  const categoryLabels = {
    refractive: { en: 'Refractive', hi: 'अपवर्तक', icon: 'visibility' },
    lifestyle: { en: 'Lifestyle', hi: 'जीवनशैली', icon: 'self_improvement' },
    awareness: { en: 'Awareness', hi: 'जागरूकता', icon: 'health_and_safety' },
  };
  const catLabel = categoryLabels[currentQuestion.category] || { en: 'Question', icon: 'help' };

  return (
    <div className="intake">
      {isDemo && (
        <div className="demo-banner">
          <span className="demo-banner__icon material-symbols-outlined">target</span>
          <span>{t('demo.banner', lang)}</span>
        </div>
      )}

      <header className="app-header">
        <button className="app-header__back" onClick={() => { stopSpeaking(); navigate('/'); }} aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="app-header__title">{t('intake.title', lang)}</span>
        <span className="app-header__action" />
      </header>

      <div className="intake__progress">
        <div className="progress-label">
          <span>{t('intake.questionOf', lang, { current: questionIndex + 1, total: visibleQuestions.length })}</span>
          <span className="intake__progress-pct">{Math.round(progress.fraction * 100)}%</span>
        </div>
        <div className="progress">
          <div className="progress__bar" style={{ width: `${progress.fraction * 100}%` }} />
        </div>
      </div>

      <div
        className={`intake__question intake__question--${animDir}`}
        key={currentQuestion.id}
      >
        <div className="intake__category-badge">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{catLabel.icon}</span>
          <span>{catLabel[lang] || catLabel.en}</span>
        </div>

        {speaking && (
          <div className="intake__speaking">
            <div className="intake__speaking-bars">
              <span className="intake__speaking-bar" />
              <span className="intake__speaking-bar" />
              <span className="intake__speaking-bar" />
              <span className="intake__speaking-bar" />
            </div>
            <span className="intake__speaking-label">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>volume_up</span> {lang === 'hi' ? 'हिंदी में बोल रहा है...' : 'Speaking in Hindi...'}
            </span>
          </div>
        )}

        {/* Play button for TTS questions — user gesture triggers speech */}
        {isTTSQuestion && !hasSpoken && !speaking && (
          <button className="intake__play-btn" onClick={speakCurrentQuestion}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>volume_up</span> {lang === 'hi' ? 'हिंदी में सुनें' : 'Listen in Hindi'}
          </button>
        )}

        <h2 className="intake__question-text">
          {currentQuestion.text[lang] || currentQuestion.text.en}
        </h2>

        <div className="intake__options">
          {currentQuestion.options.map((option, i) => {
            const isPreselected = isDemo && demoAnswer?.value === option.value;
            return (
              <button
                key={option.value}
                className={`intake__option ${isPreselected ? 'intake__option--demo' : ''}`}
                onClick={() => handleAnswer(option)}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {option.icon && <span className="intake__option-icon">{option.icon}</span>}
                <span className="intake__option-label">
                  {option.label[lang] || option.label.en}
                </span>
                {isPreselected && (
                  <span className="intake__option-demo-badge"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person</span> Ramesh</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isDemo && waitingForDemoTap && (
        <div className="intake__demo-control">
          <button className="btn btn--primary btn--full btn--lg" onClick={handleDemoNext}>
            <span className="material-symbols-outlined">touch_app</span> {t('demo.next', lang)}
          </button>
          <p className="intake__demo-hint">
            {lang === 'hi' ? 'डेमो: रमेश का उत्तर चुनने के लिए टैप करें' : "Tap to auto-select Ramesh's answer"}
          </p>
        </div>
      )}
    </div>
  );
}

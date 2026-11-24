import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { getQuestionCompletionProgress, getQuestionForActivities, getVisibleQuestions, isAnswerComplete } from '../data/questions.js';
import { speakWhenReady, stopSpeaking } from '../utils/tts.js';
import { getBackNavigationAnswerIds } from '../utils/sessionRouting.js';
import VoiceNoteField from '../components/VoiceNoteField.jsx';
import LocalSaveStatus from '../components/LocalSaveStatus.jsx';
import './Intake.css';

const STAGE_META = {
  refractive: { en: 'Vision experience', hi: 'दृष्टि अनुभव', icon: 'visibility' },
  lifestyle: { en: 'Daily habits', hi: 'दैनिक आदतें', icon: 'self_improvement' },
  awareness: { en: 'Eye-care background', hi: 'आँखों की देखभाल', icon: 'health_and_safety' },
};

function localizedLabel(label, language) {
  if (label && typeof label === 'object') return label[language] || label.en || '';
  return String(label ?? '');
}

export default function Intake() {
  const navigate = useNavigate();
  const {
    language,
    saveStatus,
    answers,
    activities,
    setAnswer,
    clearAnswers,
    setParticipantNote,
    isDemo,
    demoPersona,
    demoNextStep,
    skipVision,
    reset,
  } = useApp();

  const lang = language || 'en';
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [animDir, setAnimDir] = useState('in');
  const [waitingForDemoTap, setWaitingForDemoTap] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [hasSpokenCurrent, setHasSpokenCurrent] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [multiSelection, setMultiSelection] = useState([]);
  const [navigationError, setNavigationError] = useState('');

  const answerTimerRef = useRef(null);
  const questionHeadingRef = useRef(null);
  const playedQuestionsRef = useRef(new Set());
  const demoPrefillHandledRef = useRef(false);

  const visibleQuestions = useMemo(() => {
    const filtered = getVisibleQuestions(answers, activities);
    const demoFiltered = (!isDemo || !demoPersona?.demoQuestionIds?.length)
      ? filtered
      : filtered.filter((question) => demoPersona.demoQuestionIds.includes(question.id));

    return demoFiltered.map((question) => getQuestionForActivities(question, activities, answers));
  }, [answers, activities, isDemo, demoPersona]);

  const currentOptions = currentQuestion?.options || [];

  // Find the next unanswered question. Invalid legacy entries with value: undefined
  // are treated as unanswered, so older sessions recover from the previous back bug.
  useEffect(() => {
    const nextQuestion = visibleQuestions.find((question) => !isAnswerComplete(answers[question.id])) || null;

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
    setHasSpokenCurrent(playedQuestionsRef.current.has(nextQuestion.id));
  }, [answers, visibleQuestions, demoPersona, isDemo, navigate, skipVision]);

  // Move focus to the newly displayed question after an answer/back action.
  // This makes the one-question-at-a-time flow understandable to keyboard and
  // screen-reader users without changing the visual layout.
  useEffect(() => {
    if (!currentQuestion) return;
    questionHeadingRef.current?.focus({ preventScroll: true });
  }, [currentQuestion?.id]);

  // Seed only the hidden, scripted demo context. Visible demo answers are confirmed one at a time.
  useEffect(() => {
    if (!isDemo || !demoPersona || demoPrefillHandledRef.current) return;
    demoPrefillHandledRef.current = true;

    const visibleDemoIds = new Set(demoPersona.demoQuestionIds || []);
    Object.entries(demoPersona.answers || {}).forEach(([questionId, scriptedAnswer]) => {
      if (!visibleDemoIds.has(questionId) && !isAnswerComplete(answers[questionId]) && scriptedAnswer) {
        setAnswer(questionId, scriptedAnswer.value, scriptedAnswer.label);
      }
    });
  }, [isDemo, demoPersona, answers, setAnswer]);

  useEffect(() => {
    if (!isDemo || !currentQuestion) {
      setWaitingForDemoTap(false);
      return;
    }
    setWaitingForDemoTap(Boolean(demoPersona?.answers?.[currentQuestion.id]));
  }, [isDemo, demoPersona, currentQuestion]);

  useEffect(() => {
    if (currentQuestion?.id !== 'participant_note') return;
    const savedNote = answers.participant_note?.value;
    setNoteText(typeof savedNote === 'string' ? savedNote : '');
  }, [currentQuestion?.id, answers.participant_note?.value]);

  // Restore the multi-select's visible selection when returning to a question or resuming.
  useEffect(() => {
    if (!currentQuestion || currentQuestion.type !== 'multi') {
      setMultiSelection([]);
      return;
    }
    const savedValue = answers[currentQuestion.id]?.value;
    const demoValue = isDemo ? demoPersona?.answers?.[currentQuestion.id]?.value : null;
    const value = Array.isArray(savedValue) ? savedValue : (Array.isArray(demoValue) ? demoValue : []);
    setMultiSelection(value);
  }, [currentQuestion?.id, answers, isDemo, demoPersona]);

  useEffect(() => () => {
    if (answerTimerRef.current) window.clearTimeout(answerTimerRef.current);
    stopSpeaking();
  }, []);

  const speakCurrentQuestion = useCallback(async () => {
    if (!currentQuestion || speaking) return;

    playedQuestionsRef.current.add(currentQuestion.id);
    setHasSpokenCurrent(true);
    setSpeaking(true);

    const questionText = currentQuestion.text[lang] || currentQuestion.text.en;
    const optionText = currentQuestion.type === 'textarea' ? '' : currentOptions.map((option, index) => `${index + 1}. ${localizedLabel(option.label, lang)}`).join('. ');
    const spokenText = [questionText, optionText].filter(Boolean).join('. ');
    await speakWhenReady(spokenText, lang, {
      rate: lang === 'hi' ? 0.88 : 1,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [currentQuestion, currentOptions, lang, speaking]);

  const handleAnswer = useCallback((option) => {
    if (!currentQuestion || animDir === 'out') return;

    setAnimDir('out');
    setWaitingForDemoTap(false);
    stopSpeaking();
    setSpeaking(false);

    if (answerTimerRef.current) window.clearTimeout(answerTimerRef.current);
    answerTimerRef.current = window.setTimeout(() => {
      setAnswer(currentQuestion.id, option.value, option.label);
      if (currentQuestion.id === 'participant_note') setParticipantNote(option.value || '');
      if (isDemo) demoNextStep();
    }, 200);
  }, [animDir, currentQuestion, demoNextStep, isDemo, setAnswer, setParticipantNote]);

  const handleDemoNext = useCallback(() => {
    if (!currentQuestion || !demoPersona) return;
    const scriptedAnswer = demoPersona.answers?.[currentQuestion.id];
    if (!scriptedAnswer) return;
    handleAnswer({ value: scriptedAnswer.value, label: scriptedAnswer.label });
  }, [currentQuestion, demoPersona, handleAnswer]);

  const handleMultiToggle = useCallback((optionValue) => {
    if (isDemo) return;
    setMultiSelection((previous) => {
      const exclusive = ['none', 'unsure'].includes(optionValue) || (currentQuestion?.id === 'experience_context' && optionValue === 'varies');
      if (exclusive) return previous.includes(optionValue) ? [] : [optionValue];

      const withoutExclusive = previous.filter((value) => !['none', 'unsure'].includes(value) && !(currentQuestion?.id === 'experience_context' && value === 'varies'));
      return withoutExclusive.includes(optionValue)
        ? withoutExclusive.filter((value) => value !== optionValue)
        : [...withoutExclusive, optionValue];
    });
  }, [isDemo, currentQuestion]);

  const handleMultiContinue = useCallback(() => {
    if (!currentQuestion || currentQuestion.type !== 'multi' || multiSelection.length === 0) return;
    const selectedOptions = currentOptions.filter((option) => multiSelection.includes(option.value));
    const label = {
      en: selectedOptions.map((option) => localizedLabel(option.label, 'en')).join(', '),
      hi: selectedOptions.map((option) => localizedLabel(option.label, 'hi')).join(', '),
    };
    handleAnswer({ value: multiSelection, label });
  }, [currentQuestion, currentOptions, multiSelection, handleAnswer]);

  const handleGoBack = useCallback(async () => {
    if (!currentQuestion) return;

    // A pending answer animation must never commit after the participant has
    // navigated backward. Otherwise the old answer can overwrite the edit.
    if (answerTimerRef.current) {
      window.clearTimeout(answerTimerRef.current);
      answerTimerRef.current = null;
    }
    setAnimDir('in');
    stopSpeaking();
    setSpeaking(false);
    setNavigationError('');

    const idsToClear = getBackNavigationAnswerIds(visibleQuestions, currentQuestion.id, answers);
    if (idsToClear.length === 0) {
      if (isDemo) {
        const cleared = await reset();
        if (!cleared) {
          setNavigationError(lang === 'hi'
            ? 'स्थानीय डेटा साफ़ नहीं हो सका। कृपया फिर से प्रयास करें।'
            : 'Local session data could not be cleared. Please try again.');
          return;
        }
        navigate('/', { replace: true });
      } else {
        navigate('/activities');
      }
      return;
    }

    // Clear the revisited question and visible downstream branch only. Do not
    // erase unrelated earlier per-activity answers.
    clearAnswers(idsToClear);
    if (idsToClear.includes('participant_note')) setParticipantNote('');
    setNoteText('');
  }, [currentQuestion, visibleQuestions, navigate, isDemo, clearAnswers, setParticipantNote, reset, lang]);

  const handleNoteSubmit = useCallback(() => {
    if (!currentQuestion) return;
    handleAnswer({
      value: noteText.trim(),
      label: { en: noteText.trim(), hi: noteText.trim() },
    });
    setParticipantNote(noteText.trim());
  }, [currentQuestion, handleAnswer, noteText, setParticipantNote]);

  if (!currentQuestion) {
    return <main className="iq iq--loading" id="main-content" tabIndex="-1" aria-live="polite"><p>{t('common.loading', lang)}</p></main>;
  }

  const progress = getQuestionCompletionProgress(visibleQuestions, answers);
  const demoAnswer = isDemo ? demoPersona?.answers?.[currentQuestion.id] : null;
  const isTTSQuestion = typeof window !== 'undefined' && Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
  const stage = STAGE_META[currentQuestion.category] || { en: 'Question', hi: 'सवाल', icon: 'help' };
  const isConditional = Boolean(currentQuestion.showIf);

  return (
    <main className="iq" id="main-content" tabIndex="-1">
      {isDemo && (
        <div className="iq__demo-banner" role="status">
          <span className="material-symbols-outlined" aria-hidden="true">target</span>
          <span>{t('demo.banner', lang)}</span>
        </div>
      )}

      {navigationError && <p className="iq__conditional-note" role="alert">{navigationError}</p>}

      <LocalSaveStatus status={saveStatus} language={lang} />

      <header className="iq__topbar">
        <button className="iq__back-btn" type="button" onClick={handleGoBack} aria-label={t('common.back', lang)}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>
        <div className="iq__progress-area">
          <div className="iq__progress-track" role="progressbar"
            aria-label={lang === 'hi' ? 'सवालों की प्रगति' : 'Question progress'}
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
            <div className="iq__progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
          <div className="iq__progress-meta">
            <span className="iq__progress-step">
              {t('intake.questionOf', lang, { current: progress.completed, total: progress.total })}
            </span>
            <span className="iq__progress-pct">{progress.percent}%</span>
          </div>
        </div>
      </header>

      <section className={`iq__card iq__card--${animDir}`} key={currentQuestion.id} aria-labelledby="iq-question-title">
        <div className="iq__stage-badge">
          <span className="material-symbols-outlined" aria-hidden="true">{stage.icon}</span>
          <span>{stage[lang] || stage.en}</span>
        </div>

        {isConditional && (
          <p className="iq__conditional-note">
            <span className="material-symbols-outlined" aria-hidden="true">subdirectory_arrow_right</span>
            {lang === 'hi' ? 'आपके पिछले जवाब के आधार पर यह सवाल दिखाया गया है।' : 'This question appeared based on your previous answer.'}
          </p>
        )}

        {isTTSQuestion && (
          <button className="iq__tts-btn" type="button" onClick={() => { if (speaking) { stopSpeaking(); setSpeaking(false); } else { speakCurrentQuestion(); } }}>
            <span className="material-symbols-outlined" aria-hidden="true">{speaking ? 'graphic_eq' : 'volume_up'}</span>
            {speaking
              ? (lang === 'hi' ? 'बोल रहा है…' : 'Speaking…')
              : hasSpokenCurrent
                ? (lang === 'hi' ? 'फिर से सुनें' : 'Listen again')
                : (lang === 'hi' ? 'सवाल और विकल्प सुनें' : 'Listen to question and options')}
          </button>
        )}

        {speaking && <p className="iq__speaking-status" role="status" aria-live="polite">{lang === 'hi' ? 'ऑडियो चल रहा है।' : 'Audio is playing.'}</p>}

        <h1 id="iq-question-title" ref={questionHeadingRef} tabIndex={-1} className="iq__question-text">{currentQuestion.text[lang] || currentQuestion.text.en}</h1>

        {currentQuestion.type === 'textarea' ? (
          <div className="iq__note-area">
            <label className="sr-only" htmlFor="iq-participant-note">
              {lang === 'hi' ? 'दृष्टि के बारे में अतिरिक्त जानकारी' : 'Additional information about your vision'}
            </label>
            <VoiceNoteField
              id="iq-participant-note"
              value={noteText}
              onChange={setNoteText}
              placeholder={t('intake.note.placeholder', lang)}
              rows={4}
              maxLength={500}
              language={lang}
              label={lang === 'hi' ? 'अतिरिक्त जानकारी' : 'Additional information'}
            />
            <div className="iq__note-actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleAnswer({ value: '', label: { en: '', hi: '' } })}>
                {t('intake.note.skip', lang)}
              </button>
              <button type="button" className="btn btn--primary btn--sm" onClick={handleNoteSubmit} disabled={animDir === 'out'}>
                <span className="material-symbols-outlined" aria-hidden="true">check</span>
                {t('intake.note.save', lang)}
              </button>
            </div>
          </div>
        ) : currentQuestion.type === 'multi' ? (
          <>
            <p className="iq__conditional-note">
              <span className="material-symbols-outlined" aria-hidden="true">checklist</span>
              {lang === 'hi' ? 'लागू होने वाली सभी गतिविधियाँ चुनें। यदि कोई नहीं या निश्चित नहीं हैं, तो वह विकल्प चुनें।' : 'Select every activity that applies. Choose “None of these” or “Not sure” when appropriate.'}
            </p>
            <div className="iq__options" role="group" aria-label={lang === 'hi' ? 'प्रभावित गतिविधियाँ चुनें' : 'Select affected activities'}>
              {currentOptions.map((option) => {
                const selected = multiSelection.includes(option.value);
                const demoSelected = isDemo && Array.isArray(demoAnswer?.value) && demoAnswer.value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`iq__option${selected || demoSelected ? ' iq__option--demo' : ''}`}
                    onClick={() => handleMultiToggle(option.value)}
                    disabled={isDemo || animDir === 'out'}
                    aria-pressed={selected || demoSelected}
                  >
                    {option.icon && <span className="iq__option-icon-wrap" aria-hidden="true"><span className="material-symbols-outlined iq__option-icon">{option.icon}</span></span>}
                    <span className="iq__option-label">{localizedLabel(option.label, lang)}</span>
                    {(selected || demoSelected) && <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>}
                    {demoSelected && <span className="iq__option-demo-tag"><span className="material-symbols-outlined" aria-hidden="true">person</span>{lang === 'hi' ? 'रमेश' : 'Ramesh'}</span>}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="iq__options" role="group" aria-label={lang === 'hi' ? 'अपना उत्तर चुनें' : 'Choose your answer'}>
            {currentOptions.map((option) => {
              const isPreselected = isDemo && demoAnswer?.value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`iq__option${isPreselected ? ' iq__option--demo' : ''}`}
                  onClick={() => handleAnswer(option)}
                  disabled={isDemo || animDir === 'out'}
                  aria-pressed={Boolean(isPreselected)}
                >
                  {option.icon && <span className="iq__option-icon-wrap" aria-hidden="true"><span className="material-symbols-outlined iq__option-icon">{option.icon}</span></span>}
                  <span className="iq__option-label">{localizedLabel(option.label, lang)}</span>
                  {isPreselected && <span className="iq__option-demo-tag"><span className="material-symbols-outlined" aria-hidden="true">person</span>{lang === 'hi' ? 'रमेश' : 'Ramesh'}</span>}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {currentQuestion.type === 'multi' && (
        <div className="iq__demo-footer">
          <button
            className="btn btn--primary btn--full btn--lg iq__demo-continue"
            type="button"
            onClick={isDemo ? handleDemoNext : handleMultiContinue}
            disabled={animDir === 'out' || (!isDemo && multiSelection.length === 0)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">{isDemo ? 'touch_app' : 'arrow_forward'}</span>
            {isDemo ? t('demo.next', lang) : (lang === 'hi' ? 'जारी रखें' : 'Continue')}
          </button>
          <p className="iq__demo-hint">{isDemo
            ? (lang === 'hi' ? 'डेमो उत्तर की पुष्टि करने के लिए आगे बढ़ें।' : 'Confirm the scripted demo answer to continue.')
            : (lang === 'hi' ? `${multiSelection.length} चुनी गईं` : `${multiSelection.length} selected`)}</p>
        </div>
      )}

      {isDemo && waitingForDemoTap && currentQuestion.type !== 'multi' && (
        <div className="iq__demo-footer">
          <button className="btn btn--primary btn--full btn--lg iq__demo-continue" type="button" onClick={handleDemoNext} disabled={!demoAnswer || animDir === 'out'}>
            <span className="material-symbols-outlined" aria-hidden="true">touch_app</span>
            {t('demo.next', lang)}
          </button>
          <p className="iq__demo-hint">{lang === 'hi' ? 'डेमो उत्तर की पुष्टि करने के लिए आगे बढ़ें।' : 'Press to confirm the demo answer and continue.'}</p>
        </div>
      )}
    </main>
  );
}

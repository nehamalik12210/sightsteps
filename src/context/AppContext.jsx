import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { saveSession, clearLatestSession } from '../utils/storage.js';

const AppContext = createContext(null);

// --- Initial State ---
const initialState = {
  // Session
  language: null,         // 'en' | 'hi'
  consentGiven: false,

  // Demo mode
  isDemo: false,
  demoPersona: null,
  demoStepIndex: 0,

  // Intake answers: { questionId: { value, label, timestamp } }
  answers: {},

  // Vision activity results
  visionResults: null,    // { completed, skipped, data }

  // Report
  report: null,           // generated report object

  // Session metadata
  sessionId: null,
  startedAt: null,
};

// --- Reducer ---
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'GIVE_CONSENT':
      return { ...state, consentGiven: true };

    case 'START_SESSION':
      return {
        ...state,
        sessionId: crypto.randomUUID(),
        startedAt: new Date().toISOString(),
      };

    case 'START_DEMO':
      return {
        ...state,
        isDemo: true,
        demoPersona: action.payload,
        demoStepIndex: 0,
        sessionId: crypto.randomUUID(),
        startedAt: new Date().toISOString(),
        language: action.payload.language || 'hi',
        consentGiven: true,
      };

    case 'DEMO_NEXT_STEP':
      return { ...state, demoStepIndex: state.demoStepIndex + 1 };

    case 'SET_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: {
            value: action.payload.value,
            label: action.payload.label,
            timestamp: Date.now(),
          },
        },
      };

    case 'SET_VISION_RESULTS':
      return { ...state, visionResults: action.payload };

    case 'SKIP_VISION':
      return {
        ...state,
        visionResults: { completed: false, skipped: true, data: null },
      };

    case 'SET_REPORT':
      return { ...state, report: action.payload };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

// --- Provider ---
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const prevSessionId = useRef(null);

  // Auto-save to IndexedDB whenever answers, visionResults, or report change
  useEffect(() => {
    if (state.sessionId && Object.keys(state.answers).length > 0) {
      saveSession(state);
    }
  }, [state.answers, state.visionResults, state.report, state.sessionId]);

  const setLanguage = useCallback((lang) =>
    dispatch({ type: 'SET_LANGUAGE', payload: lang }), []);

  const giveConsent = useCallback(() =>
    dispatch({ type: 'GIVE_CONSENT' }), []);

  const startSession = useCallback(() =>
    dispatch({ type: 'START_SESSION' }), []);

  const startDemo = useCallback((persona) =>
    dispatch({ type: 'START_DEMO', payload: persona }), []);

  const demoNextStep = useCallback(() =>
    dispatch({ type: 'DEMO_NEXT_STEP' }), []);

  const setAnswer = useCallback((questionId, value, label) =>
    dispatch({ type: 'SET_ANSWER', payload: { questionId, value, label } }), []);

  const setVisionResults = useCallback((results) =>
    dispatch({ type: 'SET_VISION_RESULTS', payload: results }), []);

  const skipVision = useCallback(() =>
    dispatch({ type: 'SKIP_VISION' }), []);

  const setReport = useCallback((report) =>
    dispatch({ type: 'SET_REPORT', payload: report }), []);

  const reset = useCallback(() => {
    clearLatestSession();
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    ...state,
    setLanguage,
    giveConsent,
    startSession,
    startDemo,
    demoNextStep,
    setAnswer,
    setVisionResults,
    skipVision,
    setReport,
    reset,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

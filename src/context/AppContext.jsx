import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import {
  clearLatestSession,
  loadLatestSession,
  saveSession,
} from '../utils/storage.js';

const AppContext = createContext(null);

const initialState = {
  isHydrated: false,
  language: null,
  consentGiven: false,
  isDemo: false,
  demoPersona: null,
  demoStepIndex: 0,
  answers: {},
  visionResults: null,
  report: null,
  sessionId: null,
  startedAt: null,
};

function createSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `sightsteps-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function appReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...initialState,
        ...action.payload,
        isHydrated: true,
      };

    case 'HYDRATION_DONE':
      return { ...state, isHydrated: true };

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'GIVE_CONSENT':
      return { ...state, consentGiven: true };

    case 'START_SESSION':
      return {
        ...initialState,
        isHydrated: true,
        language: state.language || 'en',
        consentGiven: true,
        sessionId: createSessionId(),
        startedAt: new Date().toISOString(),
      };

    case 'START_DEMO':
      return {
        ...initialState,
        isHydrated: true,
        isDemo: true,
        demoPersona: action.payload,
        demoStepIndex: 0,
        sessionId: createSessionId(),
        startedAt: new Date().toISOString(),
        language: action.payload?.language || 'hi',
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
      return { ...initialState, isHydrated: true };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Restore the latest unfinished or completed local session on page reload.
  useEffect(() => {
    let active = true;

    loadLatestSession()
      .then((record) => {
        if (!active) return;

        if (record?.sessionId) {
          dispatch({
            type: 'HYDRATE',
            payload: {
              language: record.language || 'en',
              consentGiven: Boolean(record.consentGiven),
              isDemo: Boolean(record.isDemo),
              demoPersona: record.demoPersona || null,
              demoStepIndex: Number(record.demoStepIndex || 0),
              answers: record.answers || {},
              visionResults: (
                record.visionResults?.skipped ||
                record.visionResults?.data?.activityType === 'direction-awareness'
              )
                ? record.visionResults
                : null,
              // Rebuild insights from saved answers instead of trusting legacy scores.
              report: null,
              sessionId: record.sessionId,
              startedAt: record.startedAt || null,
            },
          });
        } else {
          dispatch({ type: 'HYDRATION_DONE' });
        }
      })
      .catch(() => {
        if (active) dispatch({ type: 'HYDRATION_DONE' });
      });

    return () => {
      active = false;
    };
  }, []);

  // Save all meaningful session changes locally. Storage failures never block the UI.
  useEffect(() => {
    if (!state.isHydrated || !state.sessionId) return;
    void saveSession(state);
  }, [state]);

  // Keep the document language aligned with the selected app language.
  useEffect(() => {
    if (typeof document !== 'undefined' && state.language) {
      document.documentElement.lang = state.language === 'hi' ? 'hi' : 'en';
    }
  }, [state.language]);

  const setLanguage = useCallback((language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  }, []);

  const giveConsent = useCallback(() => {
    dispatch({ type: 'GIVE_CONSENT' });
  }, []);

  const startSession = useCallback(() => {
    dispatch({ type: 'START_SESSION' });
  }, []);

  const startDemo = useCallback((persona) => {
    dispatch({ type: 'START_DEMO', payload: persona });
  }, []);

  const demoNextStep = useCallback(() => {
    dispatch({ type: 'DEMO_NEXT_STEP' });
  }, []);

  const setAnswer = useCallback((questionId, value, label) => {
    dispatch({
      type: 'SET_ANSWER',
      payload: { questionId, value, label },
    });
  }, []);

  const setVisionResults = useCallback((results) => {
    dispatch({ type: 'SET_VISION_RESULTS', payload: results });
  }, []);

  const skipVision = useCallback(() => {
    dispatch({ type: 'SKIP_VISION' });
  }, []);

  const setReport = useCallback((report) => {
    dispatch({ type: 'SET_REPORT', payload: report });
  }, []);

  const reset = useCallback(() => {
    const sessionId = state.sessionId;
    dispatch({ type: 'RESET' });
    void clearLatestSession(sessionId);
  }, [state.sessionId]);

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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
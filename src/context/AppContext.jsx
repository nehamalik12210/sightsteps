import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { clearAllSessions, loadLatestSession, saveSession } from '../utils/storage.js';
import { shouldDiscardKioskSessionOnRestore } from '../utils/kioskPolicy.js';
import { normalizeVisionTimelineEntries } from '../utils/visionTimeline.js';
import { normalizeDirectionAwarenessResult } from '../utils/visionActivity.js';

const AppContext = createContext(null);

const initialState = {
  isHydrated: false,
  storageAvailable: null,
  saveStatus: 'idle',
  language: null,
  consentGiven: false,
  isDemo: false,
  demoPersona: null,
  demoStepIndex: 0,
  activities: [],
  primaryActivity: null,
  participantNote: '',
  answers: {},
  visionResults: null,
  amslerResults: null,
  report: null,
  appointmentFollowUp: { appointmentDate: '', professionalNotes: '', followUpPlan: '', nextAppointmentDate: '' },
  visionTimelineEntries: [],
  discussionPriorities: [],
  questionsToAsk: '',
  conversationReview: { confirmed: false, correction: '' },
  assistedCompletion: false,
  kioskMode: false,
  kioskCleanupFailed: false,
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
        activities: Array.isArray(action.payload?.activities) ? action.payload.activities : [],
        answers: action.payload?.answers || {},
        appointmentFollowUp: { ...initialState.appointmentFollowUp, ...(action.payload?.appointmentFollowUp || {}) },
        visionTimelineEntries: normalizeVisionTimelineEntries(action.payload?.visionTimelineEntries),
        discussionPriorities: Array.isArray(action.payload?.discussionPriorities) ? action.payload.discussionPriorities : [],
        questionsToAsk: action.payload?.questionsToAsk || '',
        conversationReview: { ...initialState.conversationReview, ...(action.payload?.conversationReview || {}) },
        assistedCompletion: Boolean(action.payload?.assistedCompletion),
        kioskMode: Boolean(action.payload?.kioskMode),
        isHydrated: true,
      };

    case 'HYDRATION_DONE':
      return { ...state, isHydrated: true };

    case 'KIOSK_CLEANUP_FAILED':
      return { ...initialState, isHydrated: true, storageAvailable: false, kioskCleanupFailed: true };

    case 'SAVE_STARTED':
      return state.saveStatus === 'saving' ? state : { ...state, saveStatus: 'saving' };

    case 'SAVE_FINISHED':
      return {
        ...state,
        storageAvailable: Boolean(action.payload),
        saveStatus: action.payload ? 'saved' : 'error',
      };

    case 'SET_STORAGE_STATUS':
      return state.storageAvailable === action.payload
        ? state
        : { ...state, storageAvailable: action.payload };

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'GIVE_CONSENT':
      return { ...state, consentGiven: true };

    case 'START_SESSION':
      return {
        ...initialState,
        isHydrated: true,
        language: action.payload?.language || state.language || 'en',
        consentGiven: true,
        kioskMode: Boolean(state.kioskMode),
        assistedCompletion: Boolean(state.assistedCompletion),
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
        activities: Array.isArray(action.payload?.activities) ? action.payload.activities : [],
        primaryActivity: action.payload?.primaryActivity || null,
        visionTimelineEntries: normalizeVisionTimelineEntries(action.payload?.timelineEntries || []),
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

    case 'CLEAR_ANSWERS': {
      const nextAnswers = { ...state.answers };
      for (const questionId of action.payload || []) {
        delete nextAnswers[questionId];
      }
      return { ...state, answers: nextAnswers };
    }

    case 'SET_ACTIVITIES':
      return { ...state, activities: Array.isArray(action.payload) ? action.payload : [] };

    case 'SET_PRIMARY_ACTIVITY':
      return { ...state, primaryActivity: action.payload || null };

    case 'SET_PARTICIPANT_NOTE':
      return { ...state, participantNote: action.payload || '' };

    case 'SET_VISION_RESULTS':
      return { ...state, visionResults: normalizeDirectionAwarenessResult(action.payload) };

    case 'SET_AMSLER_RESULTS':
      return { ...state, amslerResults: action.payload };

    case 'SKIP_VISION':
      return { ...state, visionResults: { completed: false, skipped: true, data: null } };

    case 'SET_REPORT':
      return { ...state, report: action.payload };

    case 'SET_KIOSK_MODE':
      return { ...state, kioskMode: Boolean(action.payload) };

    case 'SET_ASSISTED_COMPLETION':
      return { ...state, assistedCompletion: Boolean(action.payload) };

    case 'SET_DISCUSSION_PRIORITIES':
      return { ...state, discussionPriorities: Array.isArray(action.payload) ? action.payload.slice(0, 2) : [] };

    case 'SET_QUESTIONS_TO_ASK':
      return { ...state, questionsToAsk: String(action.payload || '').slice(0, 1200) };

    case 'SET_CONVERSATION_REVIEW':
      return {
        ...state,
        conversationReview: {
          confirmed: Boolean(action.payload?.confirmed),
          correction: String(action.payload?.correction || '').slice(0, 500),
        },
      };

    case 'SET_APPOINTMENT_FOLLOW_UP':
      return { ...state, appointmentFollowUp: { ...state.appointmentFollowUp, ...(action.payload || {}) } };

    case 'SET_VISION_TIMELINE_ENTRIES':
      return { ...state, visionTimelineEntries: normalizeVisionTimelineEntries(action.payload) };

    case 'RESET':
      return { ...initialState, isHydrated: true };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const resettingRef = useRef(false);
  const resetPromiseRef = useRef(null);

  useEffect(() => {
    let active = true;

    loadLatestSession()
      .then(async (record) => {
        if (!active) return;

        if (record?.sessionId && shouldDiscardKioskSessionOnRestore(record)) {
          // A shared-device session is intentionally not restored after a reload or browser restart.
          // Do not silently continue if the local deletion fails: new sessions must
          // pass through KioskSetup and successfully retry cleanup first.
          const cleared = await clearAllSessions();
          if (!active) return;
          dispatch({ type: cleared ? 'HYDRATION_DONE' : 'KIOSK_CLEANUP_FAILED' });
        } else if (record?.sessionId) {
          dispatch({
            type: 'HYDRATE',
            payload: {
              language: record.language || 'en',
              consentGiven: Boolean(record.consentGiven),
              isDemo: Boolean(record.isDemo),
              demoPersona: record.demoPersona || null,
              demoStepIndex: Number(record.demoStepIndex || 0),
              activities: record.activities || record.demoPersona?.activities || [],
              primaryActivity: record.primaryActivity || record.demoPersona?.primaryActivity || null,
              participantNote: record.participantNote || '',
              answers: record.answers || {},
              visionResults: normalizeDirectionAwarenessResult(record.visionResults),
              amslerResults: record.amslerResults || null,
              // Rebuild report content from current rules instead of trusting saved output.
              report: null,
              appointmentFollowUp: { ...initialState.appointmentFollowUp, ...(record.appointmentFollowUp || {}) },
              visionTimelineEntries: normalizeVisionTimelineEntries(record.visionTimelineEntries),
              discussionPriorities: record.discussionPriorities || [],
              questionsToAsk: record.questionsToAsk || '',
              conversationReview: { ...initialState.conversationReview, ...(record.conversationReview || {}) },
              assistedCompletion: Boolean(record.assistedCompletion),
              kioskMode: false,
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

    return () => { active = false; };
  }, []);

  // Persist the complete participant journey, including the activity profile.
  // Storage status is deliberately excluded from the dependency list to avoid a save loop.
  useEffect(() => {
    if (!state.isHydrated || !state.sessionId || resettingRef.current) return undefined;
    let active = true;
    dispatch({ type: 'SAVE_STARTED' });
    saveSession(state).then((success) => {
      if (active) dispatch({ type: 'SAVE_FINISHED', payload: success });
    });
    return () => { active = false; };
  }, [
    state.isHydrated, state.sessionId, state.startedAt, state.language,
    state.consentGiven, state.isDemo, state.demoPersona, state.demoStepIndex,
    state.activities, state.primaryActivity, state.participantNote, state.answers,
    state.visionResults, state.amslerResults, state.report, state.appointmentFollowUp, state.visionTimelineEntries,
    state.discussionPriorities, state.questionsToAsk, state.conversationReview, state.assistedCompletion, state.kioskMode,
  ]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = state.language === 'hi' ? 'hi' : 'en';
    }
  }, [state.language]);

  const setLanguage = useCallback((language) => dispatch({ type: 'SET_LANGUAGE', payload: language }), []);
  const giveConsent = useCallback(() => dispatch({ type: 'GIVE_CONSENT' }), []);
  const startSession = useCallback((language) => dispatch({ type: 'START_SESSION', payload: { language } }), []);
  const startDemo = useCallback((persona) => dispatch({ type: 'START_DEMO', payload: persona }), []);
  const demoNextStep = useCallback(() => dispatch({ type: 'DEMO_NEXT_STEP' }), []);
  const setAnswer = useCallback((questionId, value, label) => {
    dispatch({ type: 'SET_ANSWER', payload: { questionId, value, label } });
  }, []);
  const clearAnswers = useCallback((questionIds) => {
    dispatch({ type: 'CLEAR_ANSWERS', payload: questionIds });
  }, []);
  const setActivities = useCallback((activities) => dispatch({ type: 'SET_ACTIVITIES', payload: activities }), []);
  const setPrimaryActivity = useCallback((activity) => dispatch({ type: 'SET_PRIMARY_ACTIVITY', payload: activity }), []);
  const setParticipantNote = useCallback((note) => dispatch({ type: 'SET_PARTICIPANT_NOTE', payload: note }), []);
  const setVisionResults = useCallback((results) => dispatch({ type: 'SET_VISION_RESULTS', payload: results }), []);
  const setAmslerResults = useCallback((results) => dispatch({ type: 'SET_AMSLER_RESULTS', payload: results }), []);
  const skipVision = useCallback(() => dispatch({ type: 'SKIP_VISION' }), []);
  const setReport = useCallback((report) => dispatch({ type: 'SET_REPORT', payload: report }), []);
  const setKioskMode = useCallback((enabled) => dispatch({ type: 'SET_KIOSK_MODE', payload: enabled }), []);
  const setAssistedCompletion = useCallback((enabled) => dispatch({ type: 'SET_ASSISTED_COMPLETION', payload: enabled }), []);
  const setDiscussionPriorities = useCallback((priorities) => dispatch({ type: 'SET_DISCUSSION_PRIORITIES', payload: priorities }), []);
  const setQuestionsToAsk = useCallback((questions) => dispatch({ type: 'SET_QUESTIONS_TO_ASK', payload: questions }), []);
  const setConversationReview = useCallback((review) => dispatch({ type: 'SET_CONVERSATION_REVIEW', payload: review }), []);
  const setAppointmentFollowUp = useCallback((updates) => dispatch({ type: 'SET_APPOINTMENT_FOLLOW_UP', payload: updates }), []);
  const setVisionTimelineEntries = useCallback((entries) => dispatch({ type: 'SET_VISION_TIMELINE_ENTRIES', payload: entries }), []);

  const reset = useCallback(() => {
    // Concurrent callers share one deletion operation rather than reporting a
    // false failure when two controls are activated close together.
    if (resetPromiseRef.current) return resetPromiseRef.current;

    resettingRef.current = true;
    resetPromiseRef.current = (async () => {
      try {
        // Existing writes finish before clearAllSessions because storage
        // serializes all IndexedDB writes through one queue.
        const cleared = await clearAllSessions();
        if (!cleared) return false;

        dispatch({ type: 'RESET' });
        return true;
      } finally {
        resettingRef.current = false;
        resetPromiseRef.current = null;
      }
    })();

    return resetPromiseRef.current;
  }, []);

  const value = {
    ...state,
    setLanguage,
    giveConsent,
    startSession,
    startDemo,
    demoNextStep,
    setAnswer,
    clearAnswers,
    setActivities,
    setPrimaryActivity,
    setParticipantNote,
    setVisionResults,
    setAmslerResults,
    skipVision,
    setReport,
    setKioskMode,
    setAssistedCompletion,
    setDiscussionPriorities,
    setQuestionsToAsk,
    setConversationReview,
    setAppointmentFollowUp,
    setVisionTimelineEntries,
    reset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

/**
 * Build a persisted result record for the optional E-orientation activity.
 * Reused by both "View your report" and "Try Amsler" so leaving for Amsler
 * cannot discard the completed direction-awareness interaction.
 */
const DIRECTIONS = new Set(['up', 'down', 'left', 'right']);

function normalizeRound(round) {
  const hasTrials = Array.isArray(round?.trials);
  const trials = (hasTrials ? round.trials : [])
    .slice(0, 5)
    .filter((trial) => trial
      && DIRECTIONS.has(trial.expected)
      && DIRECTIONS.has(trial.answered))
    .map((trial, index) => ({
      round: Number.isInteger(trial.round) && trial.round >= 1 && trial.round <= 5 ? trial.round : index + 1,
      expected: trial.expected,
      answered: trial.answered,
      correct: trial.expected === trial.answered,
    }));

  if (hasTrials) {
    return {
      correct: trials.filter((trial) => trial.correct).length,
      total: trials.length,
      trials,
    };
  }

  // Support older count-only records while keeping impossible values bounded.
  const rawTotal = Number.isInteger(round?.total) && round.total >= 0 ? round.total : 0;
  const total = Math.min(rawTotal, 5);
  const rawCorrect = Number.isInteger(round?.correct) && round.correct >= 0 ? round.correct : 0;
  return { correct: Math.min(rawCorrect, total), total, trials: [] };
}

/**
 * Validate persisted or in-memory E-orientation activity data before any
 * participant- or clinician-facing summary uses it. The two records represent
 * activity rounds, never separate eyes or a visual-acuity result.
 */
export function normalizeDirectionAwarenessResult(result) {
  if (result?.skipped === true) {
    return { completed: false, skipped: true, data: null };
  }
  if (result?.completed !== true || result?.data?.activityType !== 'direction-awareness') {
    return null;
  }
  return {
    completed: true,
    skipped: false,
    data: {
      activityType: 'direction-awareness',
      left: normalizeRound(result.data.left),
      right: normalizeRound(result.data.right),
    },
  };
}

export function buildDirectionAwarenessResult(results = {}) {
  const makeEyeResult = (eye) => {
    const trials = Array.isArray(results?.[eye]) ? results[eye] : [];
    return {
      correct: trials.filter((trial) => trial?.correct === true).length,
      total: trials.length,
      trials,
    };
  };

  return {
    completed: true,
    skipped: false,
    data: {
      activityType: 'direction-awareness',
      left: makeEyeResult('left'),
      right: makeEyeResult('right'),
    },
  };
}

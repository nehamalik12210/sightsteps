/**
 * Build a persisted result record for the optional E-orientation activity.
 * Reused by both "View your report" and "Try Amsler" so leaving for Amsler
 * cannot discard the completed direction-awareness interaction.
 */
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

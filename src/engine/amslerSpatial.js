/**
 * SightSteps — Amsler Grid Spatial Analysis
 *
 * Analyses the spatial distribution of flagged cells on the 20×20 Amsler grid.
 * Computes quadrant counts, centroid, spread (clustered vs scattered),
 * central vs peripheral distribution, and inter-eye asymmetry.
 *
 * All outputs are framed as "where you flagged" — never "where damage is."
 */

const GRID_SIZE = 20;
const CENTER_ZONE = { min: 7, max: 12 }; // rows/cols 7-12 = central 6×6

/**
 * Determine which quadrant a cell falls in.
 * UL = upper-left, UR = upper-right, LL = lower-left, LR = lower-right
 */
function getQuadrant(row, col) {
  const midR = GRID_SIZE / 2;
  const midC = GRID_SIZE / 2;
  if (row < midR && col < midC) return 'UL';
  if (row < midR && col >= midC) return 'UR';
  if (row >= midR && col < midC) return 'LL';
  return 'LR';
}

/**
 * Check if a cell is in the central zone (roughly the foveal area on the grid).
 */
function isCentral(row, col) {
  return row >= CENTER_ZONE.min && row <= CENTER_ZONE.max &&
         col >= CENTER_ZONE.min && col <= CENTER_ZONE.max;
}

/**
 * Compute spatial analysis for a single eye's flagged cells.
 *
 * @param {Array<{row: number, col: number}>} cells
 * @returns {object} spatial analysis result
 */
export function analyzeEye(cells) {
  if (!cells || cells.length === 0) {
    return {
      count: 0,
      quadrants: { UL: 0, UR: 0, LL: 0, LR: 0 },
      centroid: null,
      centralCount: 0,
      peripheralCount: 0,
      dominantQuadrant: null,
      spread: 'none',
      hasQuadrantConcentration: false,
    };
  }

  // Quadrant counts
  const quadrants = { UL: 0, UR: 0, LL: 0, LR: 0 };
  let centralCount = 0;
  let peripheralCount = 0;
  let sumRow = 0;
  let sumCol = 0;

  for (const { row, col } of cells) {
    quadrants[getQuadrant(row, col)] += 1;
    if (isCentral(row, col)) {
      centralCount += 1;
    } else {
      peripheralCount += 1;
    }
    sumRow += row;
    sumCol += col;
  }

  // Centroid
  const centroid = {
    row: sumRow / cells.length,
    col: sumCol / cells.length,
  };

  // Dominant quadrant (the one with the most flags, if it has >50% of all flags)
  const sortedQuadrants = Object.entries(quadrants).sort((a, b) => b[1] - a[1]);
  const dominantQuadrant = sortedQuadrants[0][1] > cells.length * 0.5
    ? sortedQuadrants[0][0]
    : null;

  // Describe quadrant concentration only; cells in one quadrant are not
  // necessarily physically adjacent, so this is not a spatial-cluster test.
  const maxQuadrantRatio = sortedQuadrants[0][1] / cells.length;
  let spread;
  if (cells.length === 1) {
    spread = 'single';
  } else if (maxQuadrantRatio >= 0.6) {
    spread = 'quadrant-concentrated';
  } else {
    spread = 'distributed';
  }

  // At least three flags, with 60% or more in a single quadrant.
  const hasQuadrantConcentration = cells.length >= 3 && maxQuadrantRatio >= 0.6;

  return {
    count: cells.length,
    quadrants,
    centroid,
    centralCount,
    peripheralCount,
    dominantQuadrant,
    spread,
    hasQuadrantConcentration,
  };
}

/**
 * Full spatial analysis for both eyes, including inter-eye comparison.
 *
 * @param {{right: Array<{row,col}>, left: Array<{row,col}>}} flaggedCells
 * @returns {object}
 */
export function analyzeSpatial(flaggedCells) {
  const right = analyzeEye(flaggedCells?.right || []);
  const left = analyzeEye(flaggedCells?.left || []);

  const totalRight = right.count;
  const totalLeft = left.count;
  const max = Math.max(totalRight, totalLeft);
  const min = Math.min(totalRight, totalLeft);
  const asymmetryRatio = min === 0 ? (max > 0 ? Infinity : 1) : max / min;
  const hasAsymmetry = asymmetryRatio >= 2 && max >= 3;

  return { right, left, asymmetryRatio, hasAsymmetry };
}

const QUADRANT_LABELS = {
  UL: { en: 'upper-left', hi: 'ऊपर-बाएँ' },
  UR: { en: 'upper-right', hi: 'ऊपर-दाएँ' },
  LL: { en: 'lower-left', hi: 'नीचे-बाएँ' },
  LR: { en: 'lower-right', hi: 'नीचे-दाएँ' },
};

/**
 * Generate accessible text descriptions for the spatial analysis.
 * Every description is framed as "where you flagged" — never clinical.
 *
 * @param {object} spatial - output of analyzeSpatial()
 * @param {string} lang - 'en' or 'hi'
 * @returns {{ right: string[], left: string[], comparison: string[], disclaimer: string }}
 */
export function describeSpatial(spatial, lang = 'en') {
  const result = { right: [], left: [], comparison: [], disclaimer: '' };

  result.disclaimer = lang === 'hi'
    ? 'यह दर्शाता है कि आपने ग्रिड पर कहाँ क्षेत्र चिह्नित किए — यह आपकी रेटिना का मानचित्र नहीं है।'
    : 'This shows where you flagged regions on the grid — not a map of your retina.';

  for (const eye of ['right', 'left']) {
    const analysis = spatial[eye];
    const eyeLabel = eye === 'right'
      ? (lang === 'hi' ? 'दाईं आँख' : 'right eye')
      : (lang === 'hi' ? 'बाईं आँख' : 'left eye');
    const lines = [];

    if (analysis.count === 0) {
      lines.push(lang === 'hi'
        ? `${eyeLabel}: कोई क्षेत्र चिह्नित नहीं किया गया।`
        : `${eyeLabel}: no regions flagged.`);
    } else if (analysis.spread === 'single') {
      lines.push(lang === 'hi'
        ? `${eyeLabel}: 1 क्षेत्र चिह्नित।`
        : `${eyeLabel}: 1 region flagged.`);
    } else if (analysis.spread === 'quadrant-concentrated' && analysis.dominantQuadrant) {
      const qLabel = QUADRANT_LABELS[analysis.dominantQuadrant][lang];
      lines.push(lang === 'hi'
        ? `${eyeLabel}: आपके अधिकतर चिह्न ${qLabel} क्वाड्रंट में हैं (${analysis.quadrants[analysis.dominantQuadrant]} / ${analysis.count})।`
        : `${eyeLabel}: most of your flags are within the ${qLabel} quadrant (${analysis.quadrants[analysis.dominantQuadrant]} of ${analysis.count}).`);
    } else {
      lines.push(lang === 'hi'
        ? `${eyeLabel}: आपके ${analysis.count} चिह्नित क्षेत्र ग्रिड पर फैले हुए हैं।`
        : `${eyeLabel}: your ${analysis.count} flagged regions are scattered across the grid.`);
    }

    if (analysis.count > 0 && analysis.centralCount > 0) {
      lines.push(lang === 'hi'
        ? `${analysis.centralCount} चिह्नित क्षेत्र केंद्रीय ज़ोन में हैं।`
        : `${analysis.centralCount} flagged region${analysis.centralCount > 1 ? 's are' : ' is'} in the central zone.`);
    }

    result[eye] = lines;
  }

  if (spatial.hasAsymmetry) {
    const moreEye = spatial.right.count > spatial.left.count ? 'right' : 'left';
    const lessEye = moreEye === 'right' ? 'left' : 'right';
    const moreLabel = moreEye === 'right'
      ? (lang === 'hi' ? 'दाईं आँख' : 'right eye')
      : (lang === 'hi' ? 'बाईं आँख' : 'left eye');

    if (spatial[lessEye].count === 0) {
      // One eye has flags, the other has none — don't show a ratio
      result.comparison.push(lang === 'hi'
        ? `केवल ${moreLabel} में क्षेत्र चिह्नित हैं।`
        : `Only the ${moreLabel} has flagged regions.`);
    } else {
      const ratio = lang === 'hi'
        ? ` (${Math.round(spatial.asymmetryRatio)}× अधिक)`
        : ` (${Math.round(spatial.asymmetryRatio)}× more)`;
      result.comparison.push(lang === 'hi'
        ? `${moreLabel} में अधिक क्षेत्र चिह्नित हैं${ratio}।`
        : `${moreLabel} has more flagged regions${ratio}.`);
    }
  }

  return result;
}

export default { analyzeEye, analyzeSpatial, describeSpatial };

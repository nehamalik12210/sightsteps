/**
 * SightSteps — One-page Clinician-Facing Brief
 *
 * A compact, printable summary designed for a clinician's two-minute scan.
 * Contains: disclaimer, inferred patterns, observation groups, Amsler results,
 * discussion prompts — all with source links and non-diagnostic framing.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { evaluateAnswers } from '../engine/ruleEngine.js';
import { evaluatePatterns } from '../engine/patternEngine.js';
import { evaluateClusters } from '../data/patternClusters.js';
import { analyzeSpatial, describeSpatial, getFlaggedCellCount } from '../engine/amslerSpatial.js';
import { normalizeDirectionAwarenessResult } from '../utils/visionActivity.js';
import { buildVisionExperienceProfile } from '../engine/visionExperienceProfile.js';
import { buildVisionEvidencePathways } from '../engine/visionEvidencePathways.js';
import VisionExperienceProfile from './VisionExperienceProfile.jsx';
import VisionEvidencePathways from './VisionEvidencePathways.jsx';
import { formatVisionTimelineDate } from '../utils/visionTimeline.js';
import './ClinicianBrief.css';

function localized(value, lang) {
  if (value && typeof value === 'object') return value[lang] || value.en || '';
  return value ?? '';
}

const DISCLAIMER = {
  en: 'Participant-reported information — not a diagnostic instrument.',
  hi: 'प्रतिभागी द्वारा बताई गई जानकारी ���q�^
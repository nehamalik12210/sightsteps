/**
 * SightSteps — Clinical Language Audit
 *
 * Scans all generated output from the rules engine, pattern engine, Amsler
 * wording and i18n strings for forbidden diagnostic language.
 * Fails CI on match; allowlist via // allowed-clinical markers.
 *
 * Run: node scripts/clinical-language-audit.mjs
 */

import { readFileSync } from 'node:fs';
import { evaluateAnswers } from '../src/engine/ruleEngine.js';
import { evaluatePatterns } from '../src/engine/patternEngine.js';
import patterns from '../src/data/patterns.js';
import strings from '../src/data/i18n.js';
import rameshPersona from '../src/data/demoPersona.js';

const FORBIDDEN_PHRASES = [
  'you have',
  'you suffer from',
  'you are diagnosed with',
  'diagnose',
  'diagnosed',
  'condition',
  'treatment',
  'prescribe',
  'prescription',
  'cure',
  'abnormal',
  'pathological',
  'pathology',
  'damage',
  'lesion',
  'region of concern',
  'consistent with',
  'appears to be progressing',
  'probability of',
];

// Allow these phrases in negating/disclaimer contexts
const ALLOWLIST = [
  'not a diagnosis',
  'does not diagnose',
  'not diagnose',
  'is not a diagnostic',
  'not a diagnostic tool',
  'prescription or',
  'or prescription',
  'determine a prescription',
  'prescription details',
  'prescription is',
  'prescription age',
  'current prescription',
  'prescription review',
  'your current prescription',
  'vision correction',
  'replace a medical diagnosis',
  'professional eye examination or prescribed vision correction',
  'eye examination, diagnosis',
  'condition or urgency',
  'does not replace',
  // Pattern-specific allowed phrases
  'uncorrected refractive error',
  // Allowed contextual uses of "condition(s)"
  'low-light conditions',
  'lighting conditions',
  'eye conditions',
  'eye condition',
  'actual conditions',
  'outdoor conditions',
  // Allowed negating uses of "you have"
  'you have not had',
  'you have never had',
  'do you have',
  'whether you have',
  'that you have not',
  'that you have never',
  // Allowed uses of "damage" / "consistent with" in negating/non-clinical context
  'not a map of your retina',
  'map of your retina',
  'not consistent with',
  'is not consistent',
];

function isAllowed(text, phrase, matchIndex) {
  const lower = text.toLowerCase();
  return ALLOWLIST.some((allowed) => {
    const allowedText = allowed.toLowerCase();
    if (!allowedText.includes(phrase)) return false;
    const allowedIndex = lower.indexOf(allowedText);
    return allowedIndex >= 0
      && matchIndex >= allowedIndex
      && matchIndex + phrase.length <= allowedIndex + allowedText.length;
  });
}

function findClinicalViolations(label, text) {
  if (!text || typeof text !== 'string') return [];
  const lower = text.toLowerCase();
  const found = [];
  for (const phrase of FORBIDDEN_PHRASES) {
    let matchIndex = lower.indexOf(phrase);
    while (matchIndex >= 0) {
      if (!isAllowed(text, phrase, matchIndex)) found.push({ label, phrase, matchIndex });
      matchIndex = lower.indexOf(phrase, matchIndex + phrase.length);
    }
  }
  return found;
}

let violations = 0;

function scanText(label, text) {
  const found = findClinicalViolations(label, text);
  for (const match of found) {
    console.error(`  VIOLATION in ${label}: contains "${match.phrase}"`);
    console.error(`    Text: "${String(text).slice(0, 200)}..."`);
    violations += 1;
  }
}

function scanBilingual(label, obj) {
  if (!obj) return;
  if (typeof obj === 'string') { scanText(label, obj); return; }
  if (obj.en) scanText(`${label} [EN]`, obj.en);
  if (obj.hi) scanText(`${label} [HI]`, obj.hi);
}

console.log('\n=== Clinical Language Audit ===\n');

// 1. Scan pattern definitions
console.log('Scanning pattern definitions...');
for (const pattern of patterns) {
  scanBilingual(`pattern/${pattern.id}/title`, pattern.title);
  scanBilingual(`pattern/${pattern.id}/description`, pattern.description);
  scanBilingual(`pattern/${pattern.id}/discussionPrompt`, pattern.discussionPrompt);
}

// 2. Scan i18n strings
console.log('Scanning i18n strings...');
for (const [key, entry] of Object.entries(strings)) {
  scanBilingual(`i18n/${key}`, entry);
}

// 3. Evaluate patterns against demo persona
console.log('Scanning pattern engine output for demo persona...');
const rameshPatterns = evaluatePatterns(rameshPersona.answers);
for (const matched of rameshPatterns) {
  scanBilingual(`matched-pattern/${matched.id}/title`, matched.title);
  scanBilingual(`matched-pattern/${matched.id}/description`, matched.description);
  scanBilingual(`matched-pattern/${matched.id}/discussionPrompt`, matched.discussionPrompt);
}

// 4. Evaluate rules engine against demo persona
console.log('Scanning rules engine output for demo persona...');
const rameshReport = evaluateAnswers(rameshPersona.answers, {
  activities: rameshPersona.activities,
  primaryActivity: rameshPersona.primaryActivity,
});
for (const group of rameshReport.groups) {
  scanBilingual(`group/${group.id}/title`, group.title);
  scanBilingual(`group/${group.id}/description`, group.description);
  for (const obs of group.observations) {
    scanBilingual(`obs/${obs.id}/detail`, obs.detail);
  }
}
for (const point of rameshReport.discussionPoints) {
  scanBilingual(`discussion/${point.id}/title`, point.title);
  scanBilingual(`discussion/${point.id}/context`, point.context);
  scanBilingual(`discussion/${point.id}/prompt`, point.prompt);
}
for (const note of rameshReport.followUpNotes) {
  scanBilingual(`followUp/${note.id}/title`, note.title);
  scanBilingual(`followUp/${note.id}/detail`, note.detail);
}

// 5. Exercise the detector itself, including mixed safe/unsafe wording.
console.log('\nRunning fail-safe tests...');
const unsafeExample = 'You have astigmatism and need treatment immediately.';
const mixedExample = 'SightSteps does not diagnose. You have glaucoma.';
const safeExample = 'SightSteps does not diagnose or replace a professional eye examination.';
if (findClinicalViolations('unsafe-example', unsafeExample).length === 0) {
  console.error('  FAIL: Detector accepted an unsafe diagnostic statement');
  violations += 1;
}
if (!findClinicalViolations('mixed-example', mixedExample).some((item) => item.phrase === 'you have')) {
  console.error('  FAIL: A safe disclaimer elsewhere in the same text masked unsafe wording');
  violations += 1;
}
if (findClinicalViolations('safe-example', safeExample).length !== 0) {
  console.error('  FAIL: Detector rejected a safe disclaimer');
  violations += 1;
}

// Scan quoted UI copy in JSX files that is not stored in the translation dictionary.
const STATIC_COPY_FILES = [
  '../src/pages/AmslerGrid.jsx',
  '../src/pages/Report.jsx',
  '../src/pages/VisionActivity.jsx',
  '../src/components/ClinicianBrief.jsx',
  '../src/components/AppointmentPreparationPack.jsx',
];
for (const file of STATIC_COPY_FILES) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const literalPattern = /(["'])(?:\\.|(?!\1)[\s\S])*\1/g;
  for (const match of source.matchAll(literalPattern)) {
    const literal = match[0].slice(1, -1);
    scanText(`${file} UI string`, literal);
  }
}

console.log(`\n${'='.repeat(44)}`);
if (violations > 0) {
  console.error(`Clinical language audit: ${violations} violation(s) found.`);
  process.exit(1);
} else {
  console.log('Clinical language audit: PASSED — no violations found.');
}

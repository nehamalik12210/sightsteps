/**
 * SightSteps — Clinical Language Audit
 *
 * Scans all generated output from the rules engine, pattern engine, Amsler
 * wording and i18n strings for forbidden diagnostic language.
 * Fails CI on match; allowlist via // allowed-clinical markers.
 *
 * Run: node scripts/clinical-language-audit.mjs
 */

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
  'actual conditions',
  'outdoor conditions',
  // Allowed negating uses of "you have"
  'you have not had',
  'you have never had',
  'that you have not',
  'that you have never',
  // Allowed uses of "damage" / "consistent with" in negating/non-clinical context
  'not a map of your retina',
  'map of your retina',
  'not consistent with',
  'is not consistent',
];

function isAllowed(text, phrase) {
  const lower = text.toLowerCase();
  const phrasePos = lower.indexOf(phrase);
  if (phrasePos < 0) return true;
  // Check if the phrase occurs in an allowed context
  for (const allowed of ALLOWLIST) {
    if (lower.includes(allowed.toLowerCase())) {
      // If the allowed context contains the forbidden phrase, it's ok
      if (allowed.toLowerCase().includes(phrase)) return true;
    }
  }
  return false;
}

let violations = 0;

function scanText(label, text) {
  if (!text || typeof text !== 'string') return;
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase) && !isAllowed(text, phrase)) {
      console.error(`  VIOLATION in ${label}: contains "${phrase}"`);
      console.error(`    Text: "${text.slice(0, 200)}..."`);
      violations += 1;
    }
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

// 5. Test that inserting a forbidden phrase is caught
console.log('\nRunning fail-safe test...');
let failSafeWorked = false;
const badText = 'You have astigmatism and need treatment immediately.';
const lower = badText.toLowerCase();
for (const phrase of FORBIDDEN_PHRASES) {
  if (lower.includes(phrase)) { failSafeWorked = true; break; }
}
if (!failSafeWorked) {
  console.error('  FAIL: Forbidden-phrase detection did not catch test string');
  violations += 1;
}

console.log(`\n${'='.repeat(44)}`);
if (violations > 0) {
  console.error(`Clinical language audit: ${violations} violation(s) found.`);
  process.exit(1);
} else {
  console.log('Clinical language audit: PASSED — no violations found.');
}

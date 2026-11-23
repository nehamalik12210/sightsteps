/**
 * SightSteps — Clinical Review Export Script
 *
 * Exports all generated discussion prompts, pattern descriptions, Amsler
 * wording and clinician brief text for expert review.
 *
 * Run: node scripts/export-prompts.mjs
 *
 * Output files are written to exports/ and can be sent to a clinical reviewer
 * alongside the demo persona walkthrough.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateAnswers } from '../src/engine/ruleEngine.js';
import { evaluatePatterns } from '../src/engine/patternEngine.js';
import patterns from '../src/data/patterns.js';
import strings from '../src/data/i18n.js';
import rameshPersona from '../src/data/demoPersona.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const exportDir = join(root, 'exports');
mkdirSync(exportDir, { recursive: true });

function loc(value, lang) {
  if (value && typeof value === 'object') return value[lang] || value.en || '';
  return value ?? '';
}

const lines = [];
function section(title) { lines.push('', `${'═'.repeat(60)}`, `  ${title}`, `${'═'.repeat(60)}`, ''); }
function sub(title) { lines.push('', `── ${title} ${'─'.repeat(50 - title.length)}`, ''); }
function row(label, en, hi) {
  lines.push(`  [EN] ${label}`);
  lines.push(`       ${en}`);
  lines.push(`  [HI] ${label}`);
  lines.push(`       ${hi}`);
  lines.push('');
}

// ─── 1. Pattern Definitions ───────────────────────────────────
section('1. PATTERN DEFINITIONS (src/data/patterns.js)');

for (const pattern of patterns) {
  sub(`Pattern: ${pattern.id}`);
  row('Title', loc(pattern.title, 'en'), loc(pattern.title, 'hi'));
  row('Description', loc(pattern.description, 'en'), loc(pattern.description, 'hi'));
  row('Discussion Prompt', loc(pattern.discussionPrompt, 'en'), loc(pattern.discussionPrompt, 'hi'));
  lines.push(`  Source keys: ${pattern.sourceKeys.join(', ')}`);
  lines.push('');
}

// ─── 2. Pattern Engine Output (Demo Persona) ─────────────────
section('2. MATCHED PATTERNS FOR DEMO PERSONA (Ramesh, 42, Tailor)');

const rameshPatterns = evaluatePatterns(rameshPersona.answers);
if (rameshPatterns.length === 0) {
  lines.push('  No patterns matched for the demo persona.');
} else {
  for (const matched of rameshPatterns) {
    sub(`Matched: ${matched.id}`);
    row('Title', loc(matched.title, 'en'), loc(matched.title, 'hi'));
    row('Description', loc(matched.description, 'en'), loc(matched.description, 'hi'));
    row('Discussion Prompt', loc(matched.discussionPrompt, 'en'), loc(matched.discussionPrompt, 'hi'));
    lines.push(`  Sources (${matched.sources.length}):`);
    for (const source of matched.sources) {
      lines.push(`    - ${loc(source.label, 'en')}: ${loc(source.answer, 'en')}`);
      lines.push(`      ${loc(source.label, 'hi')}: ${loc(source.answer, 'hi')}`);
    }
    lines.push('');
  }
}

// ─── 3. Rules Engine Discussion Prompts (Demo Persona) ────────
section('3. DISCUSSION PROMPTS FROM RULES ENGINE (Ramesh)');

const rameshReport = evaluateAnswers(rameshPersona.answers, {
  activities: rameshPersona.activities,
  primaryActivity: rameshPersona.primaryActivity,
});

for (const point of rameshReport.discussionPoints) {
  sub(`Discussion: ${point.id}`);
  row('Title', loc(point.title, 'en'), loc(point.title, 'hi'));
  row('Context', loc(point.context, 'en'), loc(point.context, 'hi'));
  row('Prompt', loc(point.prompt, 'en'), loc(point.prompt, 'hi'));
  if (point.sources?.length > 0) {
    lines.push(`  Sources (${point.sources.length}):`);
    for (const source of point.sources) {
      lines.push(`    - ${loc(source.label, 'en')}: ${loc(source.answer, 'en')}`);
    }
  }
  lines.push('');
}

// ─── 4. Follow-Up Notes ──────────────────────────────────────
section('4. FOLLOW-UP NOTES (Ramesh)');

for (const note of rameshReport.followUpNotes) {
  sub(`Note: ${note.id}`);
  row('Title', loc(note.title, 'en'), loc(note.title, 'hi'));
  row('Detail', loc(note.detail, 'en'), loc(note.detail, 'hi'));
  lines.push('');
}

// ─── 5. Amsler Grid Wording ──────────────────────────────────
section('5. AMSLER GRID WORDING');

const amslerStrings = {
  'Activity intro disclaimer': {
    en: 'This is a home screening activity, not a diagnosis. The Amsler grid is already recommended by optometrists for self-monitoring of macular changes. Show results to your eye-care professional at your next visit.',
    hi: 'यह एक होम स्क्रीनिंग गतिविधि है, निदान नहीं। एम्सलर ग्रिड का उपयोग नेत्र चिकित्सक पहले से मरीजों को मैक्युलर परिवर्तनों की स्व-निगरानी के लिए सुझाते हैं। परिणाम अपने अगले नेत्र देखभाल अपॉइंटमेंट में दिखाएँ।',
  },
  'Instructions disclaimer': {
    en: 'SightSteps is not a diagnostic tool. Amsler grid results are a home screening and do not replace a professional examination. Show these results to your eye-care professional at your next visit.',
    hi: 'SightSteps निदान उपकरण नहीं है। एम्सलर ग्रिड के परिणाम होम स्क्रीनिंग हैं और पेशेवर जाँच का विकल्प नहीं हैं। ये परिणाम अपने अगले नेत्र देखभाल अपॉइंटमेंट में दिखाएँ।',
  },
  'Result disclaimer': {
    en: 'This is a home screening result, not a diagnosis. Show these results to your optometrist at your next visit.',
    hi: 'यह एक होम स्क्रीनिंग परिणाम है, निदान नहीं। ये परिणाम अपने ऑप्टोमेट्रिस्ट को अपनी अगली मुलाक़ात में दिखाएँ।',
  },
  'Report Amsler disclaimer': {
    en: 'This is a home screening result, not a diagnosis. Participant used a calibrated grid on a phone/tablet screen. Show this to your optometrist at your next visit.',
    hi: 'यह एक होम स्क्रीनिंग परिणाम है, निदान नहीं। प्रतिभागी ने फ़ोन/टैबलेट स्क्रीन पर कैलिब्रेटेड ग्रिड का उपयोग किया। अपनी अगली मुलाक़ात में अपने ऑप्टोमेट्रिस्ट को यह दिखाएँ।',
  },
};

for (const [label, text] of Object.entries(amslerStrings)) {
  row(label, text.en, text.hi);
}

// ─── 6. Clinician Brief Wording ──────────────────────────────
section('6. CLINICIAN BRIEF WORDING');

const briefStrings = {
  'Main disclaimer': {
    en: 'SightSteps is not a diagnostic tool. The observations, patterns and screening results below are participant-reported and are intended only to support a conversation with an eye-care professional.',
    hi: 'SightSteps एक निदान उपकरण नहीं है। नीचे दिए गए अवलोकन, पैटर्न और स्क्रीनिंग परिणाम प्रतिभागी द्वारा बताए गए हैं और केवल नेत्र देखभाल पेशेवर के साथ बातचीत को सहायता देने के लिए हैं।',
  },
  'Amsler note in clinician brief': {
    en: 'Home screening result — not a diagnosis. Participant used a calibrated grid on a phone/tablet screen.',
    hi: 'होम स्क्रीनिंग परिणाम — निदान नहीं। प्रतिभागी ने फ़ोन/टैबलेट स्क्रीन पर कैलिब्रेटेड ग्रिड का उपयोग किया।',
  },
};

for (const [label, text] of Object.entries(briefStrings)) {
  row(label, text.en, text.hi);
}

// ─── 7. Report Notice Strings ────────────────────────────────
section('7. KEY i18n STRINGS');

const keyI18nKeys = [
  'disclaimer.full',
  'patterns.title',
  'patterns.subtitle',
  'patterns.whySuggesting',
  'clinicianBrief.title',
  'clinicianBrief.open',
  'amsler.title',
  'amsler.skip',
  'landing.notMedical',
  'onboarding.consent.text',
];

for (const key of keyI18nKeys) {
  const entry = strings[key];
  if (entry) row(key, entry.en, entry.hi);
}

// ─── Write output ────────────────────────────────────────────
const output = lines.join('\n');
const outputPath = join(exportDir, 'clinical-review-export.txt');
writeFileSync(outputPath, output, 'utf8');

console.log(`\nExported ${lines.length} lines to: ${outputPath}`);
console.log(`Pattern definitions: ${patterns.length}`);
console.log(`Matched patterns (Ramesh): ${rameshPatterns.length}`);
console.log(`Discussion prompts (Ramesh): ${rameshReport.discussionPoints.length}`);
console.log(`Follow-up notes (Ramesh): ${rameshReport.followUpNotes.length}`);
console.log('\nSend this file along with the demo persona walkthrough to the clinical reviewer.');

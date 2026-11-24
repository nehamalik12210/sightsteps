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
import clusters from '../src/data/patternClusters.js';
import strings from '../src/data/i18n.js';
import rameshPersona from '../src/data/demoPersona.js';
import { getVisibleQuestions } from '../src/data/questions.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const exportDir = join(root, 'exports');
mkdirSync(exportDir, { recursive: true });

function loc(value, lang) {
  if (value && typeof value === 'object') return value[lang] || value.en || '';
  return value ?? '';
}

const lines = [
  'SIGHTSTEPS — CLINICAL REVIEW DRAFT',
  '[EN] Document status: Draft for independent clinical review only. This export is not a diagnosis, clinical test result or prescription.',
  '[HI] दस्तावेज़ की स्थिति: केवल स्वतंत्र चिकित्सकीय समीक्षा के लिए मसौदा। यह निदान, चिकित्सकीय परीक्षण का परिणाम या प्रिस्क्रिप्शन नहीं है।',
  '[EN] Demo-data notice: The Ramesh profile and its matched patterns/discussion prompts are based on scripted demo data, not a real participant record.',
  '[HI] डेमो डेटा सूचना: रमेश की प्रोफ़ाइल, उससे मेल खाते पैटर्न और चर्चा के विषय निर्धारित डेमो डेटा पर आधारित हैं, किसी वास्तविक प्रतिभागी के रिकॉर्ड पर नहीं।',
  '',
];
function section(title) { lines.push('', `${'═'.repeat(60)}`, `  ${title}`, `${'═'.repeat(60)}`, ''); }
function sub(title) { lines.push('', `── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}`, ''); }
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

// ─── 2. Pattern Cluster Narratives ───────────────────────────
section('2. PATTERN CLUSTER NARRATIVES (src/data/patternClusters.js)');

for (const cluster of clusters) {
  sub('Cluster: ' + cluster.id);
  row('Title', loc(cluster.title, 'en'), loc(cluster.title, 'hi'));
  row('Summary', loc(cluster.summary, 'en'), loc(cluster.summary, 'hi'));
  lines.push('  Member pattern IDs: ' + cluster.memberIds.join(', '));
  lines.push('  Minimum matched patterns: ' + cluster.minMatch);
  lines.push('');
}

// ─── 3. Pattern Engine Output (Demo Persona) ─────────────────
section('3. MATCHED PATTERNS FOR DEMO PERSONA (Ramesh, 42, Tailor)');

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

// ─── 4. Rules Engine Discussion Prompts (Demo Persona) ────────
section('4. DISCUSSION PROMPTS FROM RULES ENGINE (Ramesh)');

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
      lines.push(`    - [EN] ${loc(source.label, 'en')}: ${loc(source.answer, 'en')}`);
      lines.push(`      [HI] ${loc(source.label, 'hi')}: ${loc(source.answer, 'hi')}`);
    }
  }
  lines.push('');
}

// ─── 5. Follow-Up Notes ──────────────────────────────────────
section('5. FOLLOW-UP NOTES (Ramesh)');

for (const note of rameshReport.followUpNotes) {
  sub(`Note: ${note.id}`);
  row('Title', loc(note.title, 'en'), loc(note.title, 'hi'));
  row('Detail', loc(note.detail, 'en'), loc(note.detail, 'hi'));
  lines.push('');
}

// ─── 6. Amsler Grid Wording ──────────────────────────────────
section('6. AMSLER GRID WORDING');

const amslerStrings = {
  'Intro notice': {
    en: 'Amsler grids are sometimes used for self-monitoring of central vision changes. SightSteps only records the areas you choose to flag; it does not test or interpret your vision. No areas flagged does not rule out a problem.',
    hi: 'एम्सलर ग्रिड का उपयोग कुछ लोग केंद्रीय दृष्टि में बदलाव की स्व-निगरानी के लिए करते हैं। SightSteps केवल आपके द्वारा चिह्नित क्षेत्रों को दर्ज करता है; यह आपकी दृष्टि की जाँच या व्याख्या नहीं करता। कोई क्षेत्र चिह्नित न होना समस्या को खारिज नहीं करता।',
  },
  'Activity description': {
    en: 'This grid is sometimes used to monitor changes in central vision. SightSteps records only the areas you choose to flag; it cannot detect or rule out an eye condition.',
    hi: 'यह ग्रिड केंद्रीय दृष्टि में बदलाव को स्वयं देखने के लिए उपयोग किया जाता है। SightSteps केवल आपके चिह्नित क्षेत्रों को दर्ज करता है; यह किसी नेत्र स्थिति का पता नहीं लगा सकता या उसे खारिज नहीं कर सकता।',
  },
  'Calibration instructions': {
    en: 'Place a standard credit card (85.6 mm wide) against the screen and match the slider to its full width exactly. The complete 10 cm square must fit within both the visible screen width and height, with room for the controls. A phone may still be too small in landscape; use a tablet or larger display, or skip this activity. Do not estimate or shrink the grid.',
    hi: 'एक मानक क्रेडिट कार्ड (85.6 mm चौड़ा) स्क्रीन पर रखें और स्लाइडर को कार्ड की पूरी चौड़ाई से बिल्कुल मिलाएँ। फ़ोन लैंडस्केप में होने पर भी पूरा 10 cm वर्ग स्क्रीन की चौड़ाई और ऊँचाई दोनों में, नियंत्रणों के लिए जगह छोड़कर, फिट होना चाहिए। ऐसा न हो तो टैबलेट या बड़ी स्क्रीन का उपयोग करें या गतिविधि छोड़ दें। अनुमान न लगाएँ और ग्रिड को छोटा न करें।',
  },
  'Testing instructions and safety note': {
    en: 'This activity records only the areas you choose to flag. It does not test or interpret vision or rule out a problem. Discuss any concern with an eye-care professional even when no areas are flagged. Contact one promptly for new distortion, blurred or missing areas.',
    hi: 'यह गतिविधि केवल आपके द्वारा चिह्नित क्षेत्रों को दर्ज करती है। यह दृष्टि की जाँच, व्याख्या या किसी समस्या को खारिज नहीं करती। कोई क्षेत्र चिह्नित न होने पर भी चिंता हो तो नेत्र-देखभाल पेशेवर से चर्चा करें। नई टेढ़ी, धुंधली या गायब रेखाएँ/क्षेत्र दिखें तो शीघ्र संपर्क करें।',
  },
  'Result safety note': {
    en: 'This records only the areas you chose to flag. No areas flagged does not rule out a vision problem, and this activity cannot detect every change. If you notice new distortion, blurred or missing areas, contact an eye-care professional promptly rather than waiting for a routine appointment.',
    hi: 'यह केवल आपके द्वारा चिह्नित क्षेत्रों का रिकॉर्ड है। कोई क्षेत्र चिह्नित न होना दृष्टि की समस्या को खारिज नहीं करता और यह गतिविधि सभी बदलाव नहीं पकड़ सकती। नई टेढ़ी, धुंधली या गायब रेखाएँ/क्षेत्र दिखें तो नियमित अपॉइंटमेंट की प्रतीक्षा किए बिना शीघ्र नेत्र-देखभाल पेशेवर से संपर्क करें।',
  },
  'Spatial summary disclaimer': strings['amsler.spatial.disclaimer'],
};

for (const [label, text] of Object.entries(amslerStrings)) {
  row(label, text.en, text.hi);
}

// ─── 7. Clinician Brief Wording ──────────────────────────────
section('7. CLINICIAN BRIEF WORDING');

const briefStrings = {
  'Main disclaimer': {
    en: 'SightSteps is not a diagnostic tool. The observations, patterns and self-monitoring activity records below are participant-reported and are intended only to support a conversation with an eye-care professional.',
    hi: 'SightSteps एक निदान उपकरण नहीं है। नीचे दिए गए अवलोकन, पैटर्न और स्व-निगरानी गतिविधि के रिकॉर्ड प्रतिभागी द्वारा बताए गए हैं और केवल नेत्र देखभाल पेशेवर के साथ बातचीत को सहायता देने के लिए हैं।',
  },
  'Amsler note in clinician brief': {
    en: 'Participant-entered grid observations — not a clinical test result. A blank grid does not rule out a vision problem.',
    hi: 'प्रतिभागी द्वारा ग्रिड पर चिह्नित क्षेत्र — यह चिकित्सकीय परीक्षण का परिणाम नहीं है। खाली ग्रिड दृष्टि की समस्या को खारिज नहीं करता।',
  },
};

for (const [label, text] of Object.entries(briefStrings)) {
  row(label, text.en, text.hi);
}


// ─── 8. Adaptive Additional-Experience Questions ─────────────
section('8. ADAPTIVE ADDITIONAL-EXPERIENCE QUESTIONS');

// Illustrative answer fixture: these are question templates, not a clinical case.
const secondaryQuestionFixture = {
  blurred_vision: { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } },
  headaches: { value: 'sometimes', label: { en: 'Sometimes', hi: 'कभी-कभी' } },
  night_vision: { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } },
  squinting: { value: 'no', label: { en: 'No', hi: 'नहीं' } },
  primary_concern: {
    value: 'blurred_vision',
    label: { en: 'Blurred or unclear vision', hi: 'धुंधला या अस्पष्ट दिखाई देना' },
  },
  additional_concerns: {
    value: ['headaches', 'night_vision'],
    label: { en: 'Headaches, Difficulty in low light', hi: 'सिरदर्द, कम रोशनी में कठिनाई' },
  },
};
const secondaryQuestions = getVisibleQuestions(secondaryQuestionFixture)
  .filter((question) => question.additionalExperienceId || question.id === 'additional_concerns');
for (const question of secondaryQuestions) {
  sub('Question: ' + question.id);
  row('Question text', loc(question.text, 'en'), loc(question.text, 'hi'));
  if (question.options?.length) {
    lines.push('  Options:');
    for (const option of question.options) {
      lines.push('    - [EN] ' + loc(option.label, 'en'));
      lines.push('      [HI] ' + loc(option.label, 'hi'));
    }
  }
  lines.push('');
}

// ─── 9. Custom Activity and Participant Review ───────────────
section('9. CUSTOM ACTIVITY AND PARTICIPANT REVIEW');
row(
  'Custom activity prompt',
  'What is your other everyday activity? Example participant entry: jewellery making.',
  'आपकी अन्य दैनिक गतिविधि क्या है? उदाहरण: गहने बनाना।',
);
row(
  'Custom activity use',
  'The participant-entered label is reused in impact questions and profile summaries. It is not inferred by the application.',
  'प्रतिभागी द्वारा लिखा गया नाम प्रभाव-संबंधी सवालों और प्रोफ़ाइल सारांश में उपयोग होता है। ऐप स्वयं गतिविधि का अनुमान नहीं लगाता।',
);
row(
  'Review heading',
  'Does this summary reflect what you wanted to share?',
  'क्या यह सारांश आपकी बात सही तरह बताता है?',
);
row(
  'Review confirmation',
  'Yes, this summary reflects what I wanted to share.',
  'हाँ, यह सारांश मेरी बात को सही तरह दर्शाता है।',
);
row(
  'Review correction',
  'Would you like to correct or add anything? (optional). Up to 500 characters, participant-authored.',
  'क्या कुछ सुधारना या जोड़ना चाहेंगे? (वैकल्पिक)। अधिकतम 500 अक्षर, प्रतिभागी द्वारा लिखा गया।',
);
row(
  'Review limitation',
  'The review is conversation context only. It does not alter original answers or clinical interpretation.',
  'यह समीक्षा केवल बातचीत का संदर्भ है। इससे मूल जवाब या चिकित्सकीय व्याख्या नहीं बदलती।',
);

// ─── 10. Source Provenance Labels ─────────────────────────────
section('10. SOURCE PROVENANCE LABELS');
row(
  'Report discussion topic',
  'Your responses linked to this topic:',
  'इस विषय से जुड़े आपके जवाब:',
);
row(
  'Report follow-up note',
  'Your responses linked to this follow-up note:',
  'इस फॉलो-अप नोट से जुड़े आपके जवाब:',
);
row(
  'Appointment preparation pack',
  'Your responses linked to this topic:',
  'इस विषय से जुड़े आपके जवाब:',
);

// ─── 11. Report Notice Strings ───────────────────────────────
section('11. KEY i18n STRINGS');
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

/**
 * SightSteps — Clinical Language Audit
 *
 * Audits bilingual clinical copy, question variants, generated rule/pattern
 * output, local-save messages, and rendered copy throughout every JSX source
 * file. The scan fails closed if a JSX file cannot be parsed.
 *
 * Run: node scripts/clinical-language-audit.mjs
 */

import { readdirSync, readFileSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import { evaluateAnswers } from '../src/engine/ruleEngine.js';
import { evaluatePatterns } from '../src/engine/patternEngine.js';
import { getVisibleQuestions } from '../src/data/questions.js';
import { evaluateClusters } from '../src/data/patternClusters.js';
import patterns from '../src/data/patterns.js';
import clusters from '../src/data/patternClusters.js';
import strings from '../src/data/i18n.js';
import rameshPersona from '../src/data/demoPersona.js';
import { getLocalSaveStatusCopy } from '../src/utils/saveStatus.js';

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

// Allow these phrases only when the forbidden match is inside the safe phrase.
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
  'prescription review',
  'your current prescription',
  'vision correction',
  'replace a medical diagnosis',
  'professional eye examination or prescribed vision correction',
  'eye examination, diagnosis',
  'condition or urgency',
  'does not replace',
  'uncorrected refractive error',
  'low-light conditions',
  'lighting conditions',
  'eye conditions',
  'eye condition',
  'actual conditions',
  'outdoor conditions',
  'you have not had',
  'you have never had',
  'do you have',
  'whether you have',
  'that you have not',
  'that you have never',
  'not a map of your retina',
  'map of your retina',
  'not consistent with',
  'is not consistent',
];

const TEXT_PROPERTY_KEYS = new Set([
  'text', 'title', 'label', 'description', 'prompt', 'discussionPrompt',
  'summary', 'detail', 'subtitle', 'context', 'impact', 'placeholder',
  'warning', 'message', 'note', 'question', 'helperText', 'emptyText',
]);

const VISIBLE_JSX_ATTRIBUTES = new Set([
  'aria-label', 'aria-description', 'aria-valuetext',
  'placeholder', 'title', 'alt', 'label', 'value',
  'data-tooltip', 'tooltip',
]);

const SKIP_AST_KEYS = new Set([
  'loc', 'start', 'end', 'extra', 'leadingComments',
  'trailingComments', 'innerComments', 'comments', 'tokens', 'errors',
]);

const SRC_DIR = fileURLToPath(new URL('../src/', import.meta.url));
const auditedCopy = [];
let violations = 0;

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
      if (!isAllowed(text, phrase, matchIndex)) {
        found.push({ label, phrase, matchIndex });
      }
      matchIndex = lower.indexOf(phrase, matchIndex + phrase.length);
    }
  }
  return found;
}

function scanText(label, text) {
  if (typeof text !== 'string' || !text.trim()) return;
  auditedCopy.push({ label, text });
  const found = findClinicalViolations(label, text);
  for (const match of found) {
    console.error('  VIOLATION in ' + label + ': contains "' + match.phrase + '"');
    console.error('    Text: "' + text.slice(0, 200) + '..."');
    violations += 1;
  }
}

function scanBilingual(label, obj) {
  if (!obj) return;
  if (typeof obj === 'string') {
    scanText(label, obj);
    return;
  }
  if (typeof obj.en === 'string') scanText(label + ' [EN]', obj.en);
  if (typeof obj.hi === 'string') scanText(label + ' [HI]', obj.hi);
}

function scanBilingualTree(label, value) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanBilingualTree(label + '[' + index + ']', item));
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === 'en' || key === 'hi') {
      if (typeof child === 'string') scanText(label + ' [' + key.toUpperCase() + ']', child);
      else scanBilingualTree(label + '/' + key, child);
      continue;
    }
    if (TEXT_PROPERTY_KEYS.has(key) && typeof child === 'string') {
      scanText(label + '/' + key, child);
      continue;
    }
    if (child && typeof child === 'object') {
      scanBilingualTree(label + '/' + key, child);
    }
  }
}

function discoverJsxFiles(directory = SRC_DIR) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = new URL('.', import.meta.url).pathname;
    void absolutePath;
    const childPath = directory + (directory.endsWith(sep) ? '' : sep) + entry.name;
    if (entry.isDirectory()) {
      files.push(...discoverJsxFiles(childPath));
    } else if (entry.isFile() && entry.name.endsWith('.jsx')) {
      files.push(childPath);
    }
  }
  return files.sort();
}

/**
 * Extract only user-visible JSX text, accessible labels, placeholders, and
 * string/template expressions rendered as children or visible attributes.
 * Class names, test IDs, route keys, and other implementation strings are
 * deliberately excluded to avoid treating code identifiers as UI copy.
 */
function extractVisibleCopy(ast, fileLabel) {
  const extracted = [];
  const add = (kind, text) => {
    if (typeof text === 'string' && text.trim()) {
      extracted.push({ label: fileLabel + ' ' + kind, text });
    }
  };

  function visitExpression(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'StringLiteral') {
      add('JSX expression', node.value);
      return;
    }
    if (node.type === 'TemplateLiteral') {
      node.quasis.forEach((quasi) => add('JSX template', quasi.value.cooked || quasi.value.raw));
      node.expressions.forEach(visitExpression);
      return;
    }
    if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
      visitJsx(node);
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (SKIP_AST_KEYS.has(key)) continue;
      if (Array.isArray(value)) {
        value.forEach(visitExpression);
      } else if (value && typeof value === 'object' && typeof value.type === 'string') {
        visitExpression(value);
      }
    }
  }

  function visitJsx(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'JSXText') {
      add('JSX text', node.value);
      return;
    }
    if (node.type === 'JSXAttribute') {
      const attributeName = node.name && node.name.type === 'JSXIdentifier'
        ? node.name.name
        : '';
      if (!VISIBLE_JSX_ATTRIBUTES.has(attributeName)) return;
      if (node.value && node.value.type === 'StringLiteral') {
        add('JSX attribute ' + attributeName, node.value.value);
      } else if (node.value && node.value.type === 'JSXExpressionContainer') {
        visitExpression(node.value.expression);
      } else if (node.value && (node.value.type === 'JSXElement' || node.value.type === 'JSXFragment')) {
        visitJsx(node.value);
      }
      return;
    }
    if (node.type === 'JSXSpreadAttribute') {
      visitExpression(node.argument);
      return;
    }
    if (node.type === 'JSXExpressionContainer') {
      visitExpression(node.expression);
      return;
    }
    if (node.type === 'JSXElement') {
      node.openingElement.attributes.forEach(visitJsx);
      node.children.forEach(visitJsx);
      return;
    }
    if (node.type === 'JSXFragment') {
      node.children.forEach(visitJsx);
    }
  }

  function visitAst(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
      visitJsx(node);
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (SKIP_AST_KEYS.has(key)) continue;
      if (Array.isArray(value)) {
        value.forEach(visitAst);
      } else if (value && typeof value === 'object' && typeof value.type === 'string') {
        visitAst(value);
      }
    }
  }

  visitAst(ast.program);
  return extracted;
}

console.log('\n=== Clinical Language Audit ===\n');

// 1. Audit all bilingual pattern and cluster definitions.
console.log('Scanning pattern and cluster definitions...');
scanBilingualTree('patterns', patterns);
scanBilingualTree('pattern-clusters', clusters);

// 2. Audit every translation string.
console.log('Scanning i18n strings...');
scanBilingualTree('i18n', strings);

// 3. Audit the full question bank and generated adaptive question variants.
console.log('Scanning base and adaptive question copy...');
const questionScenarios = [
  { id: 'base', answers: {}, activities: [] },
  { id: 'demo', answers: rameshPersona.answers, activities: rameshPersona.activities },
  {
    id: 'expanded-follow-ups',
    answers: {
      ...rameshPersona.answers,
      additional_concerns: { value: ['headaches', 'night_vision'] },
      affected_activities: { value: ['other'], label: { en: 'Other', hi: 'अन्य' } },
      custom_activity_name: {
        value: 'Jewellery making',
        label: { en: 'Jewellery making', hi: 'आभूषण बनाना' },
      },
    },
    activities: rameshPersona.activities,
  },
];
for (const scenario of questionScenarios) {
  const questions = getVisibleQuestions(scenario.answers, scenario.activities);
  scanBilingualTree('questions/' + scenario.id, questions);
}

// 4. Audit the demo persona's bilingual labels and participant-authored examples.
console.log('Scanning demo persona copy...');
scanBilingualTree('demo-persona', rameshPersona);

// 5. Audit local-save status copy, which is rendered through a shared component.
console.log('Scanning local-save status copy...');
for (const status of ['saving', 'saved', 'error']) {
  for (const language of ['en', 'hi']) {
    const copy = getLocalSaveStatusCopy(status, language);
    if (copy) scanText('save-status/' + status + '/' + language, copy.text);
  }
}

// 6. Evaluate pattern and cluster output for the demo persona.
console.log('Scanning pattern engine output for demo persona...');
const rameshPatterns = evaluatePatterns(rameshPersona.answers);
scanBilingualTree('matched-patterns', rameshPatterns);
const rameshClusters = evaluateClusters(rameshPatterns.map((item) => item.id));
scanBilingualTree('matched-clusters', rameshClusters);

// 7. Evaluate rule-engine output for the demo persona.
console.log('Scanning rules engine output for demo persona...');
const rameshReport = evaluateAnswers(rameshPersona.answers, {
  activities: rameshPersona.activities,
  primaryActivity: rameshPersona.primaryActivity,
});
scanBilingualTree('rules-report', rameshReport);

// 8. Parse and audit every JSX file under src, not a manually maintained list.
console.log('Discovering and scanning all JSX source files...');
const jsxFiles = discoverJsxFiles();
if (jsxFiles.length < 10) {
  console.error('  FAIL: JSX source discovery returned an unexpectedly small file set (' + jsxFiles.length + ').');
  violations += 1;
}
for (const filePath of jsxFiles) {
  const fileLabel = relative(SRC_DIR, filePath).split(sep).join('/');
  try {
    const source = readFileSync(filePath, 'utf8');
    const ast = parse(source, { sourceType: 'unambiguous', plugins: ['jsx'] });
    for (const copy of extractVisibleCopy(ast, fileLabel)) {
      scanText(copy.label, copy.text);
    }
  } catch (error) {
    console.error('  PARSE FAILURE in ' + fileLabel + ': ' + error.message);
    violations += 1;
  }
}

// 9. Exercise the detector and JSX extractor with unsafe and safe fixtures.
console.log('Running fail-safe detector and JSX extraction tests...');
const unsafeExample = 'You have astigmatism and need treatment immediately.';
const mixedExample = 'SightSteps does not diagnose. You have glaucoma.';
const safeExample = 'SightSteps does not diagnose or replace a professional eye examination.';

if (findClinicalViolations('unsafe-example', unsafeExample).length === 0) {
  console.error('  FAIL: Detector accepted an unsafe diagnostic statement.');
  violations += 1;
}
if (!findClinicalViolations('mixed-example', mixedExample).some((item) => item.phrase === 'you have')) {
  console.error('  FAIL: A safe disclaimer elsewhere in the same text masked unsafe wording.');
  violations += 1;
}
if (findClinicalViolations('safe-example', safeExample).length !== 0) {
  console.error('  FAIL: Detector rejected a safe disclaimer.');
  violations += 1;
}

const jsxFixture = 'const Example = () => (<section aria-label="You have glaucoma"><p>You have damage</p><p>{flag ? "You have lesion" : "Safe text"}</p></section>);';
const jsxFixtureAst = parse(jsxFixture, { sourceType: 'module', plugins: ['jsx'] });
const jsxFixtureCopy = extractVisibleCopy(jsxFixtureAst, 'fixture');
for (const expected of ['You have glaucoma', 'You have damage', 'You have lesion']) {
  if (!jsxFixtureCopy.some((item) => item.text.includes(expected))) {
    console.error('  FAIL: JSX extractor missed fixture copy: ' + expected);
    violations += 1;
  }
}
const fixtureViolations = jsxFixtureCopy.flatMap((item) => findClinicalViolations(item.label, item.text));
if (!fixtureViolations.some((item) => item.phrase === 'damage')
  || !fixtureViolations.some((item) => item.phrase === 'lesion')) {
  console.error('  FAIL: JSX extractor did not pass text-node/expression copy to the clinical detector.');
  violations += 1;
}

const templateDelimiter = String.fromCharCode(96);
const templateFixture = 'const Example = () => <p>{' + templateDelimiter + 'You have treatment' + templateDelimiter + '}</p>;';
const templateFixtureAst = parse(templateFixture, { sourceType: 'module', plugins: ['jsx'] });
const templateFixtureCopy = extractVisibleCopy(templateFixtureAst, 'template-fixture');
if (!templateFixtureCopy.some((item) => item.text.includes('You have treatment'))) {
  console.error('  FAIL: JSX extractor missed a template-literal UI string.');
  violations += 1;
}

// 10. Guard against known misleading reassurance and Amsler result labels.
console.log('Checking high-risk report wording...');
const allVisibleCopy = auditedCopy.map((item) => item.text).join('\n').toLowerCase();
for (const phrase of ['good sign', 'screening complete', 'screening results', 'screening result']) {
  if (allVisibleCopy.includes(phrase)) {
    console.error('  FAIL: UI copy still contains misleading phrase "' + phrase + '".');
    violations += 1;
  }
}

console.log('Scanned ' + jsxFiles.length + ' JSX files and ' + auditedCopy.length + ' copy fragments.');
console.log('\n' + '='.repeat(44));
if (violations > 0) {
  console.error('Clinical language audit: ' + violations + ' violation(s) found.');
  process.exit(1);
} else {
  console.log('Clinical language audit: PASSED — no violations found.');
}

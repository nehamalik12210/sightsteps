/**
 * Dependency-free project quality audit for SightSteps.
 * Run: npm run audit
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import questions from '../src/data/questions.js';
import translations from '../src/data/i18n.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
let failed = 0;
function check(ok, description) {
  if (ok) passed += 1;
  else {
    failed += 1;
    console.error(`FAIL: ${description}`);
  }
}
function read(path) {
  return readFileSync(join(root, path), 'utf8');
}
function collect(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? collect(path) : [path];
  });
}
function resolveLocalImport(fromFile, importPath) {
  const base = resolve(root, dirname(fromFile), importPath);
  const candidates = [base, ...['.js', '.jsx', '.mjs', '.css', '.json'].map((ext) => `${base}${ext}`),
    join(base, 'index.js'), join(base, 'index.jsx')];
  return candidates.find((candidate) => existsSync(candidate));
}
function luminance(hex) {
  const raw = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(raw)) return null;
  const channels = [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return 0;
  const [lighter, darker] = [la, lb].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

console.log('\nSightSteps quality audit');

// Resolve all relative JS/JSX/CSS imports before a user attempts a build.
const sourceFiles = collect('src').filter((path) => /\.(js|jsx|mjs)$/.test(path));
for (const file of sourceFiles) {
  const source = read(file);
  const importPattern = /(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g;
  for (const match of source.matchAll(importPattern)) {
    check(Boolean(resolveLocalImport(file, match[1])), `${file} import resolves: ${match[1]}`);
  }
}

// Bilingual question and translation data must be complete and stable.
const questionIds = questions.map((question) => question.id);
check(new Set(questionIds).size === questionIds.length, 'question IDs are unique');
for (const question of questions) {
  check(Boolean(question.text?.en?.trim() && question.text?.hi?.trim()), `${question.id} has EN + HI question copy`);
  if (question.type !== 'textarea') {
    check(question.options.length > 0, `${question.id} has answer options`);
    check(new Set(question.options.map((option) => option.value)).size === question.options.length, `${question.id} option values are unique`);
    for (const option of question.options) {
      check(Boolean(option.label?.en?.trim() && option.label?.hi?.trim()), `${question.id}/${option.value} has EN + HI labels`);
      check(Boolean(option.icon), `${question.id}/${option.value} has an icon name`);
    }
  }
}
for (const [key, entry] of Object.entries(translations)) {
  check(Boolean(entry.en?.trim() && entry.hi?.trim()), `translation ${key} has EN + HI copy`);
}

// Theme colour, contrast and font settings.
const html = read('index.html');
const baseCss = read('src/index.css');
const accessCss = read('src/accessibility.css');
const vite = read('vite.config.js');
const effectiveCss = `${baseCss}\n${accessCss}`;
const themeMeta = html.match(/name=["']theme-color["']\s+content=["']([^"']+)["']/i)?.[1];
const manifestTheme = vite.match(/theme_color:\s*["']([^"']+)["']/)?.[1];
const manifestBackground = vite.match(/background_color:\s*["']([^"']+)["']/)?.[1];
check(themeMeta === '#1769D2' && manifestTheme === themeMeta, 'browser chrome and PWA manifest use the approved cobalt theme');
check(manifestBackground === '#F4F2EC', 'PWA background uses the approved warm ivory');
check(vite.includes('fonts\\.googleapis\\.com') && vite.includes('fonts\\.gstatic\\.com'), 'Google Fonts stylesheet and font-file hosts have runtime caching');
check(/registerType:\s*["']autoUpdate["']/.test(vite), 'PWA uses automatic service-worker update registration');
check(/html:lang\(hi\)/.test(accessCss), 'Hindi language selects Devanagari-capable font family');
check(/:focus-visible/.test(accessCss) && /prefers-reduced-motion/.test(accessCss), 'global keyboard focus and reduced-motion support are present');

const tokens = {};
for (const match of effectiveCss.matchAll(/--(color-[a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)) tokens[match[1]] = match[2];
const foregrounds = [
  ['color-text', 'primary text'],
  ['color-text-secondary', 'secondary text'],
  ['color-text-muted', 'muted text'],
  ['color-primary', 'primary interactive text'],
  ['color-tertiary', 'teal interactive text'],
  ['color-warning', 'warning text'],
  ['color-danger', 'danger text'],
];
const surfaces = ['#F4F2EC', '#FFFFFF', '#F9F7F3', '#E8F2FC', '#FFF3E0', '#FEF3C7'];
for (const [token, label] of foregrounds) {
  check(Boolean(tokens[token]), `${label} token exists`);
  for (const surface of surfaces) {
    const value = tokens[token] ? contrast(tokens[token], surface) : 0;
    check(value >= 4.5, `${label} contrast on ${surface} is ${value.toFixed(2)}:1 (minimum 4.5:1)`);
  }
}

// Accessibility and clinical boundary checks at the interaction points.
const intake = read('src/pages/Intake.jsx');
const activity = read('src/pages/ActivityProfile.jsx');
const onboarding = read('src/pages/Onboarding.jsx');
const report = read('src/pages/Report.jsx');
const vision = read('src/pages/VisionActivity.jsx');
const engine = read('src/engine/ruleEngine.js');
check(/questionHeadingRef/.test(intake) && /tabIndex=\{-1\}/.test(intake), 'question changes move focus to the new question heading');
check(/aria-pressed=\{isOn\}/.test(activity) && /aria-pressed=\{isPrimary\}/.test(activity), 'activity selections expose pressed state');
check(/aria-label=\{t\('common\.back', lang\)\}/.test(onboarding), 'onboarding back control has a language-aware accessible name');
check(/aria-expanded=\{isOpen\}/.test(report) && /aria-controls=\{panelId\}/.test(report), 'report expanders expose expanded state and controlled panel');
check(/aria-live="polite"/.test(vision) && /aria-label=\{dirLabel/.test(vision), 'direction activity exposes announcements and named direction controls');
check(/does not diagnose, triage/.test(engine), 'rules engine explicitly states diagnostic and triage boundaries');
check(/cannot determine (their )?cause or urgency/.test(engine), 'reported experiences are not assigned cause or urgency');
check(/not an eye examination/.test(vision), 'direction activity explicitly states it is not an eye examination');
check(/Keep both eyes comfortably open/.test(vision) && !/Cover your (left|right) eye/.test(vision), 'direction interaction does not instruct users to cover an eye');
check(/Round 1/.test(vision) && /Round 2/.test(vision), 'direction interaction labels two non-eye-specific rounds');
check(/not an eye examination, diagnosis, visual acuity measurement or prescription/.test(report), 'report explicitly states its non-clinical scope');

// Product functionality: contextual questionnaire, impact detail, follow-up and kiosk controls.
const questionSource = read('src/data/questions.js');
const engineSource = read('src/engine/ruleEngine.js');
const activitySource = read('src/pages/ActivityProfile.jsx');
const appointmentSource = read('src/pages/AppointmentFollowUp.jsx');
const voiceSource = read('src/components/VoiceNoteField.jsx');
const kioskGuardSource = read('src/components/KioskGuard.jsx');
const kioskPolicySource = read('src/utils/kioskPolicy.js');
const appSource = read('src/App.jsx');
const contextSource = read('src/context/AppContext.jsx');
const storageSource = read('src/utils/storage.js');
check(/id: 'primary_concern'/.test(questionSource) && /id: 'experience_onset'/.test(questionSource) && /id: 'experience_change'/.test(questionSource), 'experience intelligence captures a participant-selected main concern and timeline');
check(/id: 'experience_context'/.test(questionSource) && /id: 'experience_frequency'/.test(questionSource), 'main experience asks about situations and frequency');
check(/activity_impact_frequency_/.test(questionSource) && /values\.some\(\(value\) => !\['none', 'unsure'\]/.test(questionSource), 'per-activity frequency is conditional on a positive impact response');
check(/getActivityDependentAnswerIds/.test(activitySource) && /clearAnswers\(staleActivityAnswers\)/.test(activitySource), 'editing the daily routine invalidates dependent activity-impact answers');
check(/experienceProfiles/.test(engineSource) && /activity_impact_frequency_/.test(engineSource), 'rules engine returns structured experience profiles and per-activity frequency');
check(/additional_experience_/.test(engineSource) && /makeQuestionSource\(experienceId, answers\)/.test(engineSource), 'secondary reported experiences receive traceable discussion prompts');
check(/rpt--brief-print/.test(report) && /printBrief\('brief'\)/.test(report) && /printBrief\('detail'\)/.test(report), 'report offers separate concise and detailed print modes');
check(/setDiscussionPriorities/.test(report) && /selectedIndex/.test(report) && /slice\(0, 2\)/.test(contextSource), 'participant-selected priorities are capped at two and influence report ordering');
check(/questionsToAsk/.test(report) && /setQuestionsToAsk/.test(contextSource), 'participant questions are captured and persisted');
check(/appointmentDate/.test(appointmentSource) && /professionalNotes/.test(appointmentSource) && /followUpPlan/.test(appointmentSource) && /nextAppointmentDate/.test(appointmentSource), 'post-appointment workflow records the appointment and participant notes');
check(/appointmentFollowUp/.test(storageSource) && /appointmentFollowUp/.test(contextSource), 'post-appointment notes persist in the local session record');
check(/\.\.\.initialState\.appointmentFollowUp/.test(contextSource), 'older partial appointment records are safely hydrated with current default fields');
check(/SpeechRecognition/.test(voiceSource) && /may process audio/.test(voiceSource), 'optional voice notes disclose possible browser/provider audio processing');
check(/valueRef\.current/.test(voiceSource), 'voice dictation appends to the latest text instead of overwriting edits made while listening');
check(/speechSynthesis/.test(intake) && /currentOptions\.map/.test(intake), 'question text and answer options can be read aloud');
check(/\/follow-up/.test(appSource) && /\/kiosk/.test(appSource), 'appointment follow-up and kiosk routes are registered');
check(/RouteGuard/.test(appSource) && /getProtectedRouteRedirect/.test(appSource) && /requireIntake/.test(appSource), 'deep links require a valid session and completed journey stages');
check(/NewSessionGuard/.test(appSource) && /getNewSessionRedirect/.test(appSource) && /allowNewSession/.test(appSource), 'onboarding distinguishes an intentional fresh journey from direct visits with an existing session');
check(/Navigate to=\{redirect\} replace/.test(appSource), 'route guard redirects replace invalid history entries instead of creating navigation loops');
check(/startPending/.test(onboarding) && /startSession\(selectedLang/.test(onboarding), 'consent navigation waits until the newly-created English or Hindi session is committed');
check(/allowNewSession: true/.test(read('src/pages/Landing.jsx')) && /allowNewSession: true/.test(read('src/pages/KioskSetup.jsx')), 'normal and kiosk fresh-session transitions explicitly authorize their onboarding route');
check(/handleExitLanguageStep/.test(onboarding) && /setLanguage\(null\)/.test(onboarding), 'abandoned onboarding clears the provisional language instead of leaking it to Landing');
check(/demoStartPending/.test(read('src/pages/Landing.jsx')) && /navigate\('\/intake', \{ replace: true \}\)/.test(read('src/pages/Landing.jsx')), 'demo navigation waits for its context state and replaces the old Landing history entry');
check(/pendingProfile/.test(activitySource) && /navigate\('\/intake', \{ replace: true \}\)/.test(activitySource), 'activity-profile navigation waits until selected activities and primary activity reach shared state');
check(/disabled=\{Boolean\(pendingProfile\)/.test(activitySource), 'activity-profile controls lock while the profile transition is being committed');
check(/reportPending/.test(vision) && /visionResults\?\.completed/.test(vision), 'vision completion and skip navigation wait until vision results are committed');
check(/disabled=\{reportPending\}/.test(vision), 'vision finish/skip controls prevent duplicate submission while routing');
check(/await reset\(\)/.test(intake) && intake.includes("navigate('/', { replace: true })"), 'leaving the first demo question clears the Ramesh session before returning home');
check(/document\.documentElement\.lang = state\.language === 'hi' \? 'hi' : 'en'/.test(contextSource), 'document language resets to English when a previous Hindi session is cleared');
check(/enqueueWrite/.test(storageSource) && /writeQueue/.test(storageSource), 'local writes are serialized so an in-flight save cannot recreate participant data after reset');
check(/Each kiosk participant chooses their own language/.test(read('src/pages/KioskSetup.jsx')), 'kiosk setup does not inherit the previous participant language');
check(/disabled=\{!isHydrated \|\| startPending\}/.test(read('src/pages/KioskSetup.jsx')), 'kiosk setup cannot start a participant before session hydration completes');
check(/await reset\(\)/.test(read('src/pages/KioskSetup.jsx')) && /clears any current saved SightSteps session/.test(read('src/pages/KioskSetup.jsx')), 'starting a kiosk session explicitly clears any previous local participant session');
check(/KIOSK_IDLE_LIMIT_MS/.test(kioskGuardSource) && /hasKioskSessionExpired/.test(kioskGuardSource), 'kiosk sessions clear after configured inactivity');
check(/Returning to a still-valid visible session counts as activity/.test(kioskGuardSource), 'returning to an unexpired kiosk tab restarts its inactivity window');
check(/shouldDiscardKioskSessionOnRestore/.test(contextSource) && /clearAllSessions\(\)/.test(contextSource), 'kiosk sessions are cleared rather than restored after a reload');
check(/not a complete security guarantee/.test(read('src/pages/KioskSetup.jsx')), 'kiosk setup explains that its privacy behavior is not a complete security guarantee');
check(/assistedCompletion/.test(report) && /setAssistedCompletion/.test(onboarding), 'assisted completion is disclosed in the report');

console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;

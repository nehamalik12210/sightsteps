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
const activityCss = read('src/pages/ActivityProfile.css');
const onboardingCss = read('src/pages/Onboarding.css');
const followUpCss = read('src/pages/AppointmentFollowUp.css');
const vite = read('vite.config.js');
const effectiveCss = `${baseCss}\n${accessCss}`;
const stylesheetFiles = collect('src').filter((path) => path.endsWith('.css'));
const allStylesheets = stylesheetFiles.map(read).join('\n');
const declaredCssProperties = new Set(
  [...allStylesheets.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g)].map((match) => match[1]),
);
for (const match of allStylesheets.matchAll(/var\(--([a-zA-Z0-9_-]+)/g)) {
  check(declaredCssProperties.has(match[1]), `CSS custom property --${match[1]} is defined`);
}
const themeMeta = html.match(/name=["']theme-color["']\s+content=["']([^"']+)["']/i)?.[1];
const manifestTheme = vite.match(/theme_color:\s*["']([^"']+)["']/)?.[1];
const manifestBackground = vite.match(/background_color:\s*["']([^"']+)["']/)?.[1];
check(themeMeta === '#1769D2' && manifestTheme === themeMeta, 'browser chrome and PWA manifest use the approved cobalt theme');
check(manifestBackground === '#F4F2EC', 'PWA background uses the approved warm ivory');
check(vite.includes('fonts\\.googleapis\\.com') && vite.includes('fonts\\.gstatic\\.com'), 'Google Fonts stylesheet and font-file hosts have runtime caching');
check(/registerType:\s*["']autoUpdate["']/.test(vite), 'PWA uses automatic service-worker update registration');
check(vite.includes('sightsteps_icon.png') && !/sightsteps-(?:logo|icon)\.svg/.test(vite), 'PWA manifest references the existing app icon asset');
check(existsSync(join(root, 'public/sightsteps_icon.png')) && existsSync(join(root, 'public/sightsteps_logo.png')), 'PWA and landing-page image assets exist');
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
const landingSource = read('src/pages/Landing.jsx');
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
check(/rpt__notice--compact/.test(report) && /rpt-full-disclaimer/.test(report) && /does not diagnose eye conditions/.test(translations['disclaimer.reportFull']?.en || '') && /निदान/.test(translations['disclaimer.reportFull']?.hi || ''), 'report presents its non-clinical scope in a short banner and full bilingual limitations statement');

// Product functionality: contextual questionnaire, impact detail, follow-up and kiosk controls.
const questionSource = read('src/data/questions.js');
const engineSource = read('src/engine/ruleEngine.js');
const activitySource = read('src/pages/ActivityProfile.jsx');
const appointmentSource = read('src/pages/AppointmentFollowUp.jsx');
const voiceSource = read('src/components/VoiceNoteField.jsx');
const localSaveStatusSource = read('src/components/LocalSaveStatus.jsx');
const localSaveStatusCssSource = read('src/components/LocalSaveStatus.css');
const saveStatusUtilitySource = read('src/utils/saveStatus.js');
const offlineStatusSource = read('src/components/OfflineStatus.jsx');
const kioskGuardSource = read('src/components/KioskGuard.jsx');
const kioskPolicySource = read('src/utils/kioskPolicy.js');
const kioskSetupSource = read('src/pages/KioskSetup.jsx');
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
check(/case 'SAVE_STARTED'/.test(contextSource) && /case 'SAVE_FINISHED'/.test(contextSource) && /saveSession\(state\)/.test(contextSource), 'visible save status follows actual IndexedDB write completion');
check(['ActivityProfile.jsx', 'Intake.jsx', 'VisionTimeline.jsx', 'AppointmentFollowUp.jsx', 'Report.jsx'].every((file) => read('src/pages/' + file).includes('<LocalSaveStatus status={saveStatus}')), 'key response and note-entry pages show the same local-save feedback');
check(localSaveStatusSource.includes("role={status === 'error' ? 'alert' : 'status'}") && localSaveStatusCssSource.includes('local-save-status--error'), 'save errors are announced and visually distinguished');
check(saveStatusUtilitySource.includes('इसी डिवाइस पर सहेजा गया') && saveStatusUtilitySource.includes('Saved on this device'), 'save status copy is available in Hindi and English');
check(appSource.includes('<OfflineStatus />') && offlineStatusSource.includes("addEventListener('offline'") && offlineStatusSource.includes("addEventListener('online'"), 'offline notice follows actual browser connection events');
check(/aria-describedby=\{\[countId, privacyId, status \? statusId : null\]/.test(voiceSource), 'voice fields describe the character count, privacy note and recognition status');
check(/aria-pressed=\{listening\}/.test(voiceSource) && /aria-controls=\{id\}/.test(voiceSource), 'microphone button exposes pressed state and its controlled field');
check(/No speech was captured/.test(voiceSource), 'empty speech capture ends with an explanatory message rather than stale listening status');
check(/speechSynthesis/.test(intake) && /currentOptions\.map/.test(intake), 'question text and answer options can be read aloud');
check(/\/follow-up/.test(appSource) && /\/kiosk/.test(appSource), 'appointment follow-up and kiosk routes are registered');
check(/RouteGuard/.test(appSource) && /getProtectedRouteRedirect/.test(appSource) && /requireIntake/.test(appSource), 'deep links require a valid session and completed journey stages');
check(/path="\*"/.test(appSource) && /Navigate to="\/" replace/.test(appSource), 'unknown application routes return safely to Landing');
check(/navigate\('\/intake', \{ replace: true \}\)/.test(vision), 'direction activity back navigation returns to the questionnaire even after a direct visit or refresh');
check(/getBackNavigationAnswerIds/.test(read('src/utils/sessionRouting.js')) && /getBackNavigationAnswerIds\(visibleQuestions, currentQuestion.id, answers\)/.test(intake), 'questionnaire backtracking clears downstream answers without wiping earlier work');
check(/clearAllSessions\(\)/.test(contextSource) && /if \(!cleared\) return false;/.test(contextSource), 'app reset preserves in-memory state when local deletion fails');
check(/resettingRef = useRef\(false\)/.test(contextSource) && /resettingRef\.current\) return undefined;/.test(contextSource), 'autosaves are blocked while session deletion is in progress');
check(/resetPromiseRef/.test(contextSource), 'concurrent reset requests share a single cleanup operation');
check(/db\.onversionchange/.test(storageSource) && /dbPromise = null/.test(storageSource), 'IndexedDB can be reopened after a schema-version change');
check(/--space-7:/.test(baseCss) && /\.btn--danger-outline/.test(baseCss), 'report spacing and destructive outline button styles are defined');
check(/\.btn\{[^}]*white-space:normal;[^}]*overflow-wrap:anywhere;[^}]*min-width:0;[^}]*max-width:100%;/.test(baseCss) && /\.btn \.material-symbols-outlined\{flex:0 0 auto;white-space:nowrap\}/.test(baseCss), 'shared buttons wrap long bilingual labels without shrinking or wrapping their icons');
check(
  activityCss.includes('repeat(2, minmax(0, 1fr))') &&
  activityCss.includes('repeat(3, minmax(0, 1fr))') &&
  onboardingCss.includes('repeat(2,minmax(0,1fr))') &&
  followUpCss.includes('40px minmax(0, 1fr) 40px'),
  'activity, language and follow-up layouts use shrink-safe grid tracks at narrow widths',
);
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

// Shared-device cleanup must fail closed; demo sessions also clear old participant data.
check(/case 'KIOSK_CLEANUP_FAILED'/.test(contextSource) && /kioskCleanupFailed: true/.test(contextSource), 'failed kiosk cleanup is retained as a blocking session state');
check(/kioskCleanupFailed/.test(appSource) && /\/kiosk\?clearError=1/.test(appSource), 'direct onboarding cannot bypass a failed kiosk cleanup');
check(/kioskCleanupFailed/.test(landingSource) && /\/kiosk\?clearError=1/.test(landingSource), 'Landing routes failed shared-device cleanup into the retry screen');
check(/kioskCleanupFailed/.test(kioskSetupSource) && /setClearError\(true\)/.test(kioskSetupSource), 'kiosk retry screen explains a failed cleanup even when opened directly');
check(/const handleDemo = async/.test(landingSource) && landingSource.indexOf('await reset();', landingSource.indexOf('const handleDemo')) < landingSource.indexOf('startDemo(rameshPersona)', landingSource.indexOf('const handleDemo')), 'demo start clears the previous local session before replacing it');

// Participant timeline and appointment preparation output.
const timelinePageSource = read('src/pages/VisionTimeline.jsx');
const timelineUtilitySource = read('src/utils/visionTimeline.js');
const appointmentPackSource = read('src/utils/appointmentPack.js');
const timelineCssSource = read('src/pages/VisionTimeline.css');
const reportCssSource = read('src/pages/Report.css');
check(appSource.includes('path="/timeline"') && appSource.includes('VisionTimeline'), 'participant timeline has a guarded application route');
check(contextSource.includes('visionTimelineEntries') && contextSource.includes('setVisionTimelineEntries'), 'timeline is part of shared application state');
check(storageSource.includes('visionTimelineEntries') && storageSource.includes('schemaVersion: 4'), 'timeline entries persist in the versioned local session record');
check(timelineUtilitySource.includes('normalizeVisionTimelineEntries') && timelineUtilitySource.includes('MAX_VISION_TIMELINE_ENTRIES'), 'timeline data is sanitized and record count is bounded');
check(/const seenIds = new Set\(\)/.test(timelineUtilitySource) && /normalizeVisionTimelineEntries\(timelineEntries\)/.test(appointmentPackSource), 'timeline IDs are deduplicated before they enter the report or appointment pack');
check(timelineUtilitySource.includes('validateVisionTimelineDraft') && timelineUtilitySource.includes('futureDate'), 'timeline validation rejects invalid and future dates');
check(timelinePageSource.includes('handleEdit') && timelinePageSource.includes('confirmDelete') && timelinePageSource.includes('setVisionTimelineEntries'), 'timeline supports editing and confirmed deletion');
check(timelinePageSource.includes('Participant-reported') && timelinePageSource.includes('not a test or clinical assessment'), 'timeline notes are explicitly participant-reported and non-clinical');
check(report.includes('My Vision Timeline') && report.includes('rpt__timeline-list'), 'detailed report includes participant-recorded timeline');
const reportStaticIds = [...report.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
check(new Set(reportStaticIds).size === reportStaticIds.length, 'report static HTML IDs are unique');
check(report.indexOf('rpt__timeline-section') > report.indexOf('aria-labelledby="rpt-activities"') && report.indexOf('rpt__timeline-section') < report.indexOf('aria-labelledby="rpt-responses"'), 'timeline follows routine context and precedes the detailed response breakdown');
check((report.match(/id="rpt-appointment-followup"/g) || []).length === 1 && report.indexOf('rpt__appointment-section') > report.indexOf('rpt-followup'), 'after-appointment notes appear once after pre-appointment discussion preparation');
check(reportCssSource.includes('.rpt__timeline-list'), 'report includes timeline presentation styles');
check(reportCssSource.includes('.rpt__priority-context') && reportCssSource.includes('.rpt__priority-context > .rpt__sec-intro'), 'priority context is grouped with consistent spacing');
check(
  reportCssSource.includes('grid-template-areas:') &&
  reportCssSource.includes('"copy print"') &&
  reportCssSource.includes('"includes print"') &&
  reportCssSource.includes('grid-area: includes') &&
  reportCssSource.includes('min-width: 0') &&
  !/@media\(min-width:600px\)\s*\{\s*\.rpt__export-card\s*\{\s*grid-template-columns: minmax\(0,1fr\) auto/.test(reportCssSource),
  'appointment export card assigns every content block to an explicit responsive grid area without intrinsic-width overflow',
);
check(timelineCssSource.includes('font-size: max(16px, var(--fs-sm))'), 'timeline inputs retain a mobile-friendly minimum text size');
check(timelineCssSource.includes('prefers-reduced-motion'), 'timeline respects reduced-motion preferences');

const reportPreferencesSource = read('src/utils/reportPreferences.js');
const appointmentPackComponentSource = read('src/components/AppointmentPreparationPack.jsx');
const appointmentPackCssSource = read('src/components/AppointmentPreparationPack.css');
const accessibilityControlsSource = read('src/components/AccessibilityControls.jsx');
const accessibilityControlsCssSource = read('src/components/AccessibilityControls.css');
check(report.includes('AppointmentPreparationPack') && report.includes("printBrief('brief')") && report.includes('Print appointment preparation pack'), 'report offers the appointment preparation pack as its primary print action');
check(report.includes('normalizeDiscussionPriorities') && reportPreferencesSource.includes('new Set') && reportPreferencesSource.includes('.slice(0, 2)'), 'report ignores stale or duplicate priorities that no longer match reported experiences');
check(/id="main-content" tabIndex="-1" aria-live="polite"/.test(appSource), 'route-guard loading state retains the global skip-navigation target');
check(/<main className="ap" id="main-content" tabIndex="-1" aria-live="polite">/.test(activitySource), 'activity-profile loading state retains the global skip-navigation target');
check(report.includes('buildAppointmentPreparationPack') && report.includes('setAppointmentPack'), 'appointment pack content is built from the current participant report state before printing');
check(appointmentPackSource.includes('slice(0, 2)') && appointmentPackSource.includes('slice(0, 3)') && appointmentPackSource.includes('slice(0, 5)'), 'appointment pack enforces two priorities, three discussion prompts and five recent timeline entries');
check(appointmentPackSource.includes('questionsToAsk') && appointmentPackSource.includes('preparedDate'), 'appointment pack includes participant questions and its preparation date');
check(appointmentPackComponentSource.includes('Appointment Preparation Pack') && appointmentPackComponentSource.includes('dateTime={entry.dateValue}'), 'print pack has a clear title and semantic timeline dates');
check(
  appointmentPackCssSource.includes('repeat(2, minmax(0, 1fr))') &&
  appointmentPackCssSource.includes('overflow-wrap: anywhere') &&
  /\.appointment-pack__top-grid,[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/.test(appointmentPackCssSource),
  'print pack inner grids constrain long text and collapse safely on narrow layouts',
);
check(appointmentPackComponentSource.includes('not an eye examination') && appointmentPackCssSource.includes('@media print'), 'print pack states its non-clinical scope and uses print-specific styling');
check(reportCssSource.includes(':not(.appointment-pack)') && reportCssSource.includes('rpt--brief-print'), 'brief printing isolates the pack rather than shrinking the detailed report');

check(accessibilityControlsSource.includes('href="#main-content"') && accessibilityControlsSource.includes('Skip to main content'), 'keyboard users can skip directly to the page main content');
check(accessibilityControlsSource.includes('sightsteps.display-preferences.v1') && accessibilityControlsSource.includes('localStorage'), 'display preferences persist locally and fail safely when storage is unavailable');
check(accessibilityControlsSource.includes('aria-pressed') && accessibilityControlsSource.includes('aria-labelledby'), 'display settings expose their state and labelled control group');

// Pattern detection, Amsler grid, clinician brief and clinical language audit.
check(existsSync(join(root, 'src/engine/patternEngine.js')), 'pattern detection engine exists');
check(existsSync(join(root, 'src/data/patterns.js')), 'pattern definitions exist');
const profileSource = read('src/components/VisionExperienceProfile.jsx');
const clinicianBriefSource = read('src/components/ClinicianBrief.jsx');
const reportSource = read('src/pages/Report.jsx');
const appContextSource = read('src/context/AppContext.jsx');
const demoPersonaSource = read('src/data/demoPersona.js');
check(/verbosity = 'full'/.test(profileSource) && /verbosity === 'brief'/.test(profileSource) && /verbosity === 'pack'/.test(profileSource), 'one reusable experience profile supports full, brief and pack presentations');
check(/verbosity="brief"/.test(clinicianBriefSource) && /verbosity="pack"/.test(appointmentPackComponentSource), 'clinician and appointment exports use compact profile variants');
check(/timelineEntries: normalizeVisionTimelineEntries\(action\.payload\?\.timelineEntries/.test(appContextSource) && /timelineEntries: \[/.test(demoPersonaSource), 'guided demo loads seeded participant timeline examples');
check(reportSource.indexOf('rpt__notice--compact') < reportSource.indexOf('<VisionExperienceProfile') && reportSource.indexOf('rpt-full-disclaimer') > reportSource.indexOf('rpt__privacy'), 'report places a short safety banner before the profile and full limitations after report content');
check(!appointmentPackComponentSource.includes('Other experiences:') && !appointmentPackComponentSource.includes('Activities reported as affected:'), 'appointment pack avoids duplicate secondary-experience and activity-impact summaries');
check(/group\.id === 'eyeCare'/.test(clinicianBriefSource), 'clinician brief avoids repeating the full reported-experience response table');
check(existsSync(join(root, 'src/components/ClinicianBrief.jsx')), 'clinician brief component exists');
check(existsSync(join(root, 'src/pages/AmslerGrid.jsx')), 'Amsler grid page exists');
check(existsSync(join(root, 'scripts/clinical-language-audit.mjs')), 'clinical language audit script exists');
check(existsSync(join(root, 'CLINICAL_REVIEW_PENDING.md')), 'clinical review framework document exists');
const patternEngineSource = read('src/engine/patternEngine.js');
check(patternEngineSource.includes('evaluatePatterns'), 'pattern engine exports evaluatePatterns');
check(report.includes('evaluatePatterns') && report.includes('matchedPatterns'), 'report integrates pattern detection engine');
check(report.includes('ClinicianBrief') && report.includes('showClinicianBrief'), 'report integrates clinician brief overlay');
check(report.includes('rpt__patterns-section') && report.includes('rpt__pattern-card'), 'report renders pattern cards with their own section');
check(report.includes('amslerResults') && report.includes('rpt__amsler-section'), 'report renders Amsler screening results');
const amslerGridSource = read('src/pages/AmslerGrid.jsx');
check(/id="main-content"/.test(amslerGridSource), 'Amsler grid page has a skip-navigation main landmark');
check(accessibilityControlsSource.includes("addEventListener('pointerdown', handleOutsidePointer)") && accessibilityControlsSource.includes("detailsRef.current.contains(event.target)"), 'accessibility settings close when a user taps outside the panel');
check(accessibilityControlsCssSource.includes('data-a11y-contrast') && accessibilityControlsCssSource.includes('data-a11y-targets') && accessibilityControlsCssSource.includes('data-a11y-motion'), 'display settings provide contrast, larger targets and reduced-motion modes');
check(baseCss.includes('var(--a11y-scale') && accessCss.includes('data-a11y-scale'), 'global typography can scale while preserving responsive rem sizing');
check(appSource.includes('RouteFocusManager') && appSource.includes("getElementById('main-content')?.focus"), 'route changes move keyboard focus to the new page main landmark');
for (const pagePath of [
  'src/pages/Landing.jsx', 'src/pages/Onboarding.jsx', 'src/pages/ActivityProfile.jsx',
  'src/pages/Intake.jsx', 'src/pages/VisionActivity.jsx', 'src/pages/Report.jsx',
  'src/pages/AppointmentFollowUp.jsx', 'src/pages/VisionTimeline.jsx', 'src/pages/KioskSetup.jsx',
  'src/pages/AmslerGrid.jsx',
]) {
  check(/id="main-content"/.test(read(pagePath)), `${pagePath} has a skip-navigation main landmark`);
}

console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;

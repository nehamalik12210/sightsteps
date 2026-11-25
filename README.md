# SightSteps

**SightSteps organises participant-reported vision experiences into traceable, non-diagnostic discussion patterns — without a camera or specialised hardware — and prepares a bilingual conversation brief for an eye-care professional.**

🔗 **Live:** [sightsteps.vercel.app](https://sightsteps.vercel.app/)

Built for **ZEISS Beyond Code 2026** under the theme *No-Device Vision Intelligence & Accessible Clinical UX*.

SightSteps helps people organise visual experiences they have noticed, understand how those experiences relate to everyday activities, and prepare a clearer conversation with an optician or eye-care professional. It runs on a smartphone or shared tablet and does not require dedicated vision-testing hardware.

> [!IMPORTANT]
> SightSteps is a conversation-preparation prototype. It is **not** an eye examination, visual-acuity test, screening or diagnostic system. It does not triage, determine urgency, assess clinical risk or prescribe lenses.

---


### Saved session history

For a regular consented participant session, SightSteps keeps up to **10** session records in the current browser's IndexedDB. The Landing page lists saved sessions so a participant can resume or delete an individual record. History is local to that browser/device; there are no accounts, cloud sync, identity matching, or cross-device profiles. Demo and kiosk sessions are excluded from the history list. Kiosk exit, inactivity cleanup, and kiosk setup clear the complete local session store rather than retaining another participant's data.


## Theme Alignment

| Theme Component | What It Demands | SightSteps Implementation |
|---|---|---|
| **No-Device** | No camera, no specialised hardware, works on ordinary phones/tablets | Browser-based PWA, runs on any phone or tablet with a browser |
| **Vision Intelligence** | The app must infer or compute something about vision beyond reorganising answers | Pattern engine organises 8 predefined discussion patterns from participant answers; grouping narratives organise related matches; Amsler self-monitoring activity records participant-flagged grid regions and describes their quadrant distribution |
| **Accessible Clinical UX** | Bilingual, voice, keyboard, screen-reader, kiosk privacy, clinical credibility | Bilingual EN/HI, TTS, STT, keyboard nav, kiosk mode, clinician brief, clinical language lint, WCAG-minded controls |

---

## Key Features

### 🧠 Pattern Detection Engine
A pattern engine (`src/engine/patternEngine.js`) evaluates predefined combinations of participant-reported answers and links each discussion prompt to the exact source responses. Pattern groupings organise overlapping matches; they are not independent confirmations, causal explanations or diagnoses.

**8 patterns:** `screen-strain` · `night-vision` · `close-work-headache` · `asymmetry` · `presbyopia` · `digital-eye-strain` · `low-light-contrast` · `overdue-exam`

### 🧭 Everyday Vision Experience Profile
A bilingual synthesis layer (`src/engine/visionExperienceProfile.js`) connects the participant's main and additional reported experiences with onset, change over time, frequency, contexts, eye involvement, activity-specific impacts and participant-recorded timeline entries. Participants may choose additional experiences for separate, optional follow-up questions; each profile section retains source answer IDs and displays the source responses on demand. The same profile is reused in the detailed report, clinician brief and compact appointment preparation pack. It does not score severity, measure visual performance, infer a diagnosis or determine urgency.

### 🔗 Vision Evidence Pathways
A deterministic explainability layer (`src/engine/visionEvidencePathways.js`) shows the participant-reported relationships that SightSteps can trace to their original answer IDs and timeline entries:
- **Experience → context:** where a separately reported experience was noticed.
- **Context + activity impact:** keeps the participant's activity and impact answers visible beside the main experience context, but does not assign the activity impact to one experience when the questionnaire did not capture that link.
- **Shared context across experiences:** the one new inference type — connects two separately reported experiences only when the participant selected the same specific context for each.
- **Timeline + onset:** presents a participant-authored dated entry beside the questionnaire onset response, explicitly distinguishing the entry date from a medically determined onset.
- **Information gaps:** identifies missing answers to follow-up fields the participant was actually asked.

The pathways appear in the detailed report, compact Clinician Brief and Appointment Preparation Pack, and are included in the clinical-review export. The output is bilingual, source-traceable and non-diagnostic; it does not add confidence, severity or risk scores.

### 🧩 Personalized Everyday Activities
Participants can describe an activity that is not covered by the preset categories (for example, jewellery making or repair work). Their own activity label is carried into impact questions, the experience profile and discussion prompts. Changing the custom label invalidates impact details tied to the old label so outdated wording is not reused.

### ✅ Participant-Reviewed Conversation Map
Before using the report, participants can confirm that the Conversation Map reflects what they intended to share or add a correction in their own words. The review and bounded correction are stored with the local session and carried into the Appointment Preparation Pack and Clinician Brief as participant-authored context. It never overwrites the original answers or changes a clinical interpretation.

### 🔲 Amsler Grid Self-Monitoring Activity
An optional, one-eye-at-a-time activity that records areas the participant chooses to flag on a 20×20 grid. A standard 85.6 mm card is used for on-screen size calibration; the activity is blocked unless the calibrated 10 cm square fits within both visible viewport dimensions with reserved space for controls. Wide but short landscape-phone viewports are blocked. This screen-fit guard does not validate physical display calibration. It does not test, interpret, diagnose or rule out vision changes. A result with no flagged areas is not evidence that vision is normal. Physical calibration on a range of real devices remains to be validated.

### 🩺 Clinician Brief
A compact, print-optimised summary designed for a clinician's two-minute scan, containing matched discussion patterns, observation groups, Amsler results, discussion prompts and source references. Actual page count remains subject to browser print-preview validation.

### 🌐 Bilingual Journey
Full English and Hindi support across onboarding, questions, patterns, discussion prompts, Amsler wording, clinician brief, and report content.

### ♿ Accessibility & Assisted Interaction
- Keyboard skip navigation and route focus management
- Adjustable text size, high contrast, larger touch targets, reduced-motion option
- Optional question read-aloud (TTS) and browser speech-to-text (STT)
- Assisted-completion disclosure; typed input always available
- Display preferences saved locally on the device

### 🔒 Shared-Device Kiosk Mode
Dedicated participant flow with a five-minute inactivity timeout and session clearing on reload/reopen.

### 📋 Two Report Formats
- **Appointment Preparation Pack** — Compact printable summary with personal priorities, questions, up to three discussion prompts and the five most recent timeline entries; actual page count still requires browser print-preview validation
- **Detailed Report** — Full observations, matched discussion patterns, Amsler results, complete participant-recorded timeline, and source references

### 📅 My Vision Timeline
Participants can record dated experiences, approximate times, activity context and personal notes. Entries can be edited or deleted and are stored with the local session.

### 📝 Appointment Follow-Up
Optional participant-written appointment notes, next steps and follow-up date.

---

## How the Experience Works

```
Landing ──▶ Onboarding ──▶ Activity Profile ──▶ Intake Questions
                                                      │
           Appointment   ◀── Vision Timeline ◀── Report  ◀──┐
           Follow-Up                              │         │
                                                  │    Amsler Grid
                                                  │    (optional)
                                                  │         │
                                                  └── Vision Activity ─┘
                                                      (optional)
```

1. Start a private session or open the clearly labelled **Ramesh demo**.
2. Choose English or Hindi, review purpose and consent information, indicate whether someone is assisting.
3. Select everyday activities that are part of the participant's routine, including a custom description when choosing **Other**.
4. Complete the guided questions, select any additional experiences to discuss, and answer only the follow-ups relevant to those selections.
5. Identify activities that feel affected and describe the impact.
6. Optionally try the **direction-awareness interaction** (uncalibrated, does not measure visual acuity).
7. Optionally try the **Amsler grid self-monitoring activity** — record any grid areas that appear distorted, blurred or missing, one eye at a time. It cannot detect or rule out an eye condition.
8. Review the **Vision Conversation Map**, confirm or correct its summary, choose conversation priorities, add personal questions, open the clinician brief, and print an Appointment Preparation Pack or the detailed report.
9. Optionally add dated entries to **My Vision Timeline**.
10. Optionally record appointment notes and follow-up steps.

---

## Technology

| Area | Implementation |
|---|---|
| Frontend | React 19 |
| Build | Vite 6 |
| Navigation | React Router 7 |
| Local storage | IndexedDB (including participant summary review and corrections) |
| Rules engine | Deterministic JS rules engine (`src/engine/ruleEngine.js`) |
| Pattern engine | Predefined response-pattern organiser (`src/engine/patternEngine.js`) |
| Evidence pathways | Deterministic bilingual relationship builder with source-answer and timeline traceability (`src/engine/visionEvidencePathways.js`) |\n| Clinical language lint | Automated forbidden-phrase scanner (`scripts/clinical-language-audit.mjs`) |
| PWA | vite-plugin-pwa, web app manifest & service worker |
| Voice | Browser Web Speech APIs where available |

The rules engine turns recorded answers into observation groups, activity context and discussion prompts. The pattern engine evaluates answer combinations to surface predefined discussion groupings. Both retain references to their source questions so the report can explain where each point came from. Neither uses a generative medical model or infers a diagnosis.

---

## Run Locally

**Requirements:** Node.js 20+ and npm.

```bash
git clone https://github.com/nehamalik12210/sightsteps.git
cd sightsteps
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

> [!TIP]
> Use `npm ci` for a clean install from the committed `package-lock.json`. Use `npm install` only when intentionally changing dependencies, then review and commit the lockfile changes.

---

## Project Checks

| Command | What it does |
|---|---|
| `npm run audit` | 2,555 static project, data and feature checks |
| `npm test` | 1,044 regression tests for rules, patterns, evidence pathways, adaptive follow-ups, custom activities, persistence, routing and Amsler spatial analysis |
| `npm run clinical-lint` | Clinical language audit — scans for forbidden diagnostic phrases |
| `npm run check` | Runs audit + test + clinical-lint together |
| `npm run build` | Runs check, then creates production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run export-review` | Generates `exports/clinical-review-export.txt` for clinical review |

---

## Clinical Review

```bash
npm run export-review
```

Generates `exports/clinical-review-export.txt` containing pattern definitions and sources, generated discussion prompts, bilingual adaptive follow-up questions and options, current Amsler instructions and safety wording, custom-activity examples, participant-review copy, five evidence-pathway relationship types with bilingual source answers, and clinician-brief text. Send this export to an optometrist or ophthalmologist with the demo walkthrough.

See [`CLINICAL_REVIEW_PENDING.md`](CLINICAL_REVIEW_PENDING.md) for the full review kit procedure, reviewer questions and change log.

> [!NOTE]
> The review kit is prepared, but independent review feedback has not yet been received. Clinical wording and new adaptive follow-ups still require review by a qualified optometrist or ophthalmologist. Existing content is grounded in published guidance (see [`CLINICAL_GROUNDING.md`](CLINICAL_GROUNDING.md)); automated language checks do not establish clinical suitability.

---

## Deploy

The project is configured for **Vercel**. Import `nehamalik12210/sightsteps` and use:

| Vercel Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | Repository root |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Production branch | `main` |

The root [`vercel.json`](vercel.json) rewrite sends application routes back to `index.html`, allowing the client-side router to handle direct visits and page refreshes.

---

## Project Structure

```
sightsteps/
├── public/
│   ├── favicon.svg
│   ├── sightsteps_icon.png
│   └── sightsteps_logo.png
├── scripts/
│   ├── clinical-language-audit.mjs   # Forbidden-phrase scanner (CI gate)
│   ├── export-prompts.mjs            # Clinical review export generator
│   └── quality-audit.mjs             # Static quality and dynamic-import checks (2,525)
├── src/
│   ├── components/
│   │   ├── AccessibilityControls.jsx  # Text size, contrast, motion, touch targets
│   │   ├── AppointmentPreparationPack.jsx  # Compact printable summary
│   │   ├── ClinicianBrief.jsx         # Print-optimised clinician overlay
│   │   ├── ConversationReview.jsx     # Participant confirmation and correction
│   │   ├── KioskGuard.jsx             # Shared-device inactivity timeout
│   │   ├── LocalSaveStatus.jsx        # IndexedDB save feedback
│   │   ├── OfflineStatus.jsx          # Offline detection banner
│   │   └── VoiceNoteField.jsx         # TTS / STT input field
│   ├── context/
│   │   └── AppContext.jsx             # useReducer state + IndexedDB persistence
│   ├── data/
│   │   ├── demoPersona.js             # Ramesh demo persona
│   │   ├── i18n.js                    # EN/HI translation dictionary
│   │   ├── patterns.js                # 8 clinically defensible pattern definitions
│   │   └── questions.js               # Bilingual question bank with branching
│   ├── engine/
│   │   ├── patternEngine.js           # Participant-response pattern organiser
│   │   ├── ruleEngine.js              # Deterministic rules engine
│   │   └── testEngine.mjs             # Engine and utility regression tests (980)
│   ├── pages/
│   │   ├── ActivityProfile.jsx        # Everyday activity selection
│   │   ├── AmslerGrid.jsx             # Amsler grid self-monitoring activity
│   │   ├── AppointmentFollowUp.jsx    # Post-appointment notes
│   │   ├── Intake.jsx                 # Guided vision questions
│   │   ├── KioskSetup.jsx             # Shared-device setup
│   │   ├── Landing.jsx                # Home / session start
│   │   ├── Onboarding.jsx             # Language, consent, disclosure
│   │   ├── Report.jsx                 # Conversation map + patterns + Amsler
│   │   ├── VisionActivity.jsx         # Direction awareness activity
│   │   └── VisionTimeline.jsx         # Dated experience entries
│   ├── utils/
│   │   ├── appointmentPack.js         # Pack generation helpers
│   │   ├── kioskPolicy.js             # Kiosk timeout / cleanup policy
│   │   ├── reportPreferences.js       # Priority ordering helpers
│   │   ├── saveStatus.js              # Save state management
│   │   ├── sessionRouting.js          # Route guards & session redirects
│   │   ├── storage.js                 # IndexedDB read/write layer
│   │   ├── tts.js                     # Text-to-speech utility
│   │   └── visionTimeline.js          # Timeline CRUD helpers
│   ├── accessibility.css              # Skip nav, focus, reduced-motion styles
│   ├── App.jsx                        # Routes, guards, layout
│   ├── index.css                      # Global styles
│   └── main.jsx                       # React root + router
├── exports/                           # Generated clinical review exports (gitignored)
├── CLINICAL_GROUNDING.md              # Published-source citations for all patterns + Amsler
├── CLINICAL_REVIEW_PENDING.md         # Review kit, questions, change log
├── LICENSE                            # MIT
├── index.html                         # Vite entry
├── package.json
├── package-lock.json
├── vercel.json                        # Vercel SPA rewrite
└── vite.config.js                     # Vite + React + PWA config
```

---

## Validation Status

The latest exact-source verification completed on application-code commit 088e3cd9bd610bc9fd1622bb22a00c97f13d4f16 in an isolated Node 22.23.5 / npm 10.9.9 sandbox with:

| Check | Result |
|---|---|
| Static quality audit | **2,525 passed**, 0 failed |
| Regression test suite | **980 passed**, 0 failed (incl. source-key resolver, symptom-context attribution, cluster membership and questionnaire deduplication) |
| Clinical language audit | **PASSED** — 0 violations; 22 JSX files / 2,629 copy fragments scanned, including a nested-new-component discovery fixture |
| Vite production build | 100 modules transformed; initial JS entry 345.09 kB minified (105.99 kB gzip) |
| Page chunks | All nine non-Landing pages lazy-loaded; largest route chunk is Report at 151.62 kB (33.11 kB gzip) |
| PWA service worker | 34 precache entries generated (980.63 KiB) |

These checks cover source structure, data validation, routing, persistence, pattern detection, clinical language safety, responsive-layout safeguards, appointment-pack output, save feedback and accessibility controls. They do **not** prove clinical suitability or complete accessibility. Real-device Amsler calibration, responsive visual/print testing, keyboard and screen-reader testing, participant usability sessions, and independent review by a qualified eye-care professional remain necessary before any clinical-context use.



The exact source revision above has passed these checks and npm run export-review (965 lines reported by the exporter). The overdue-exam discussion cites only symptom answers that contributed to its match. Amsler report and print-pack counts now use a shared normalizer that removes duplicate, out-of-range or malformed cells before summarising saved grid data. This application code is deployed in production: deployment dpl_BxHTVeosVERn2wpv8s7BQfh5qAU3 (READY, application commit 088e3cd9...). This does not replace browser interaction, visual, print-layout or real-device validation.

Route-level code splitting reduced the initial JavaScript entry from 581.00 kB to 345.09 kB minified (105.99 kB gzip); the largest route chunk is the Report page at 151.62 kB (33.11 kB gzip). The four moderate npm audit findings remain in the development-time PWA build chain (`vite-plugin-pwa` → `workbox-build` → `glob` / `minimatch`). See `BASELINE.md` for the advisory and upstream compatibility details; no dependency override or forced upgrade has been applied.

---

## Known Limitations

- **Clinical review pending.** The review kit is prepared (`CLINICAL_REVIEW_PENDING.md`), but First formal expert review pending; no formal feedback from a licensed optometrist or ophthalmologist has been received. All clinical content is grounded in published guidance (see [`CLINICAL_GROUNDING.md`](CLINICAL_GROUNDING.md)); independent expert review is planned as the next step.
- **Amsler calibration is not device-validated.** The credit-card calibration calculation and viewport-fit guard are implemented in code. Actual display scaling, physical card matching, viewing distance and finger tap accuracy have not been validated across phones/tablets.
- **Amsler grid keyboard navigation.** Grid cells are focusable buttons with `aria-label` and `aria-pressed` attributes, so Tab/Shift+Tab/Enter work for flagging cells. A keyboard fallback with row/column number inputs and an Add/Remove button is provided for users who cannot tap a grid. Arrow-key grid cursor navigation is not yet implemented.
- **Clinician brief one-page fit.** The brief uses compact font sizes (10–12px) and `break-inside: avoid` print rules targeting A4. Actual one-page fit depends on the number of matched patterns and observation groups for a given session; dense sessions may overflow to two pages. Actual browser print-preview/page-count verification remains outstanding.
- **No WCAG audit.** The app uses keyboard skip-nav, route focus management, `aria-*` attributes and high-contrast styles, but has not been audited against WCAG 2.1 AA by a third-party accessibility assessor.

## Privacy & Limitations

- **No backend.** No user accounts, no cloud sync. Sessions are stored in the browser's IndexedDB.
- **No encryption.** Data is stored locally but not encrypted by SightSteps. Anyone with access to the same browser profile may access it. Do not use this prototype to store sensitive clinical records.
- **"Clear my data"** clears local session records, timeline entries and the latest-session pointer. It cannot remove browser downloads, printed PDFs, screenshots, OS backups or copies made outside the app.
- **Timeline entries** are participant-written notes, not measurements or clinical interpretations.
- **Kiosk mode** is a privacy aid, not a security guarantee. Its timeout and reload behavior should be tested on the actual managed device.
- **Speech features** depend on browser and device support. Speech recognition audio may be processed by a browser-configured or external provider; SightSteps does not guarantee on-device processing.
- **PWA caching:** App assets are precached by the service worker. External fonts may require an online fetch before cache availability. Offline behavior should be tested on the target device.

---

## Responsible Use

SightSteps is intended only to help people organise their own observations and prepare for a conversation with a qualified professional. It must **not** be used to diagnose, screen, triage, determine urgency, reassure someone that care is unnecessary, prescribe correction or replace a professional eye examination. Do not test minors without an appropriate guardian and ethics process.

---

## License

This project is available under the [MIT License](LICENSE).

## Current Pre-submission Verification — 25 November 2026

Exact repository source reviewed: main at fbc57865af97fc606ed0a2d139d4662428e8e1bc. The previous application-code revision is READY in Vercel deployment dpl_B6cJn68sqAv3uGAvd9HuAjQSexe3; the latest Amsler limitation/audit change is a new source delta and must be redeployed before it can be called live.

A clean npm ci completed on Node v24.22.3 / npm 11.19.1 (349 packages installed; four moderate advisories remain in the existing dependency tree).

| Check | Result |
|---|---|
| Static quality audit | **2,588 passed, 0 failed** |
| Regression suite | **1,064 passed, 0 failed** |
| Clinical-language audit | **Passed** — 23 JSX files / 2,777 copy fragments |
| Production build | **104 Vite modules transformed** |
| PWA | **34 precache entries (1,016.82 KiB)** |
| Clinical-review export | **1,192 lines** |

Headless Chromium smoke testing reached the Report through all seven Ramesh demo questions, verified the shared-context explanation and source answer IDs, opened the Clinician Brief modal, checked a 390 px report viewport for horizontal overflow, and confirmed Appointment Pack print-mode invocation under interception. This does not establish physical-device accessibility, actual printer output or print page count.

Still pending: first formal optometrist/ophthalmologist review; physical Amsler scale, zoom and viewing-distance validation on real devices; screen-reader/assistive-technology testing; actual print preview/page count; and a real five-minute kiosk idle/failure-injection test. Ramesh’s guided demo skips optional E Direction Awareness and Amsler activities; show those separately.

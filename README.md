# SightSteps

**SightSteps infers clinically grounded vision patterns from self-reported experiences — without a camera, specialised hardware, or diagnostic claims — and prepares a bilingual, accessible conversation brief for an eye-care professional.**

🔗 **Live:** [sightsteps.vercel.app](https://sightsteps.vercel.app/)

Built for **ZEISS Beyond Code 2026** under the theme *No-Device Vision Intelligence & Accessible Clinical UX*.

SightSteps helps people organise visual experiences they have noticed, understand how those experiences relate to everyday activities, and prepare a clearer conversation with an optician or eye-care professional. It runs on a smartphone or shared tablet and does not require dedicated vision-testing hardware.

> [!IMPORTANT]
> SightSteps is a conversation-preparation prototype. It is **not** an eye examination, visual-acuity test, screening or diagnostic system. It does not triage, determine urgency, assess clinical risk or prescribe lenses.

---

## Theme Alignment

| Theme Component | What It Demands | SightSteps Implementation |
|---|---|---|
| **No-Device** | No camera, no specialised hardware, works on ordinary phones/tablets | Browser-based PWA, runs on any phone or tablet with a browser |
| **Vision Intelligence** | The app must infer or compute something about vision beyond reorganising answers | Pattern detection engine infers 8 discussion patterns from answer combinations; grouping narratives surface relationships between matched patterns; Amsler self-monitoring activity records participant-flagged grid regions and describes their quadrant distribution |
| **Accessible Clinical UX** | Bilingual, voice, keyboard, screen-reader, kiosk privacy, clinical credibility | Bilingual EN/HI, TTS, STT, keyboard nav, kiosk mode, clinician brief, clinical language lint, WCAG-minded controls |

---

## Key Features

### 🧠 Pattern Detection Engine
A pattern engine (`src/engine/patternEngine.js`) evaluates combinations of participant answers to infer clinically meaningful observations the participant did not explicitly state — such as screen-related strain, presbyopia-related changes, or asymmetric symptoms. When multiple patterns co-fire, cluster narratives surface relationships between them. Every inference is framed as a discussion prompt with traceable participant-answer inputs, never a conclusion.

**8 patterns:** `screen-strain` · `night-vision` · `close-work-headache` · `asymmetry` · `presbyopia` · `digital-eye-strain` · `low-light-contrast` · `overdue-exam`

### 🧭 Everyday Vision Experience Profile
A bilingual synthesis layer (`src/engine/visionExperienceProfile.js`) connects the participant's main and additional reported experiences with onset, change over time, frequency, contexts, eye involvement, activity-specific impacts and participant-recorded timeline entries. Each profile section retains source answer IDs and displays the source responses on demand. The same profile is reused in the detailed report, clinician brief and compact appointment preparation pack. It does not score severity, measure visual performance, infer a diagnosis or determine urgency.

### 🔲 Amsler Grid Self-Monitoring Activity
An optional, one-eye-at-a-time activity that records areas the participant chooses to flag on a 20×20 grid. A standard 85.6 mm card is used for on-screen size calibration; the activity is blocked unless the calibrated 10 cm square fits within both visible viewport dimensions with reserved space for controls. Wide but short landscape-phone viewports are blocked. This screen-fit guard does not validate physical display calibration. It does not test, interpret, diagnose or rule out vision changes. A result with no flagged areas is not evidence that vision is normal. Physical calibration on a range of real devices remains to be validated.

### 🩺 Clinician Brief
A one-page, print-optimised summary designed for a clinician's two-minute scan, containing inferred patterns, observation groups, Amsler results, discussion prompts and source references.

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
- **Appointment Preparation Pack** — One-page printable with personal priorities, questions, up to three discussion prompts and the five most recent timeline entries
- **Detailed Report** — Full observations, inferred patterns, Amsler results, complete participant-recorded timeline, and source references

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
3. Select everyday activities that are part of the participant's routine.
4. Complete the guided questions and describe visual experiences noticed.
5. Identify activities that feel affected and describe the impact.
6. Optionally try the **direction-awareness interaction** (uncalibrated, does not measure visual acuity).
7. Optionally try the **Amsler grid self-monitoring activity** — record any grid areas that appear distorted, blurred or missing, one eye at a time. It cannot detect or rule out an eye condition.
8. Review the **Vision Conversation Map** with inferred patterns, choose conversation priorities, add personal questions, open the clinician brief, and print an Appointment Preparation Pack or the detailed report.
9. Optionally add dated entries to **My Vision Timeline**.
10. Optionally record appointment notes and follow-up steps.

---

## Technology

| Area | Implementation |
|---|---|
| Frontend | React 19 |
| Build | Vite 6 |
| Navigation | React Router 7 |
| Local storage | IndexedDB |
| Rules engine | Deterministic JS rules engine (`src/engine/ruleEngine.js`) |
| Pattern engine | Inference engine for answer-combination patterns (`src/engine/patternEngine.js`) |
| Clinical language lint | Automated forbidden-phrase scanner (`scripts/clinical-language-audit.mjs`) |
| PWA | vite-plugin-pwa, web app manifest & service worker |
| Voice | Browser Web Speech APIs where available |

The rules engine turns recorded answers into observation groups, activity context and discussion prompts. The pattern engine evaluates answer combinations to surface inferred observations. Both retain references to their source questions so the report can explain where each point came from. Neither uses a generative medical model or infers a diagnosis.

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
| `npm run audit` | 2,230+ static project, data and feature checks |
| `npm test` | Regression tests for rules, patterns, branching, persistence, routing and Amsler spatial analysis |
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

Generates `exports/clinical-review-export.txt` containing all pattern descriptions, discussion prompts, Amsler wording and clinician brief text in both English and Hindi. Send this to a clinical reviewer along with the demo walkthrough.

See [`CLINICAL_REVIEW_PENDING.md`](CLINICAL_REVIEW_PENDING.md) for the full review kit procedure, reviewer questions and change log.

> [!NOTE]
> Expert review kit is prepared and ready to send; reviewer feedback is the immediate next step. Clinical content is grounded in published guidance (see [`CLINICAL_GROUNDING.md`](CLINICAL_GROUNDING.md)); no pattern or activity introduces a novel clinical claim.

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
│   └── quality-audit.mjs             # 2,230+ static checks
├── src/
│   ├── components/
│   │   ├── AccessibilityControls.jsx  # Text size, contrast, motion, touch targets
│   │   ├── AppointmentPreparationPack.jsx  # One-page printable summary
│   │   ├── ClinicianBrief.jsx         # Print-optimised clinician overlay
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
│   │   ├── patternEngine.js           # Pattern detection / inference engine
│   │   ├── ruleEngine.js              # Deterministic rules engine
│   │   └── testEngine.mjs             # 634+ regression tests
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

The latest verified build completed with:

| Check | Result |
|---|---|
| Static quality audit | **2,387 passed**, 0 failed |
| Regression test suite | **781 passed**, 0 failed (incl. profile synthesis, two-dimensional calibration fit, pattern engine and Amsler spatial tests) |
| Clinical language audit | **PASSED** — 0 violations |
| Vite production build | 96 modules transformed |
| PWA service worker | 11 precache entries generated |

These checks cover source structure, data validation, routing, persistence, pattern detection, clinical language safety, responsive-layout safeguards, appointment-pack output, save feedback and accessibility controls. They do **not** prove clinical suitability or complete accessibility. Real-device/browser testing, keyboard and screen-reader testing, participant usability sessions, and independent review by a qualified eye-care professional remain necessary before any clinical-context use.

---

## Known Limitations

- **Clinical review pending.** The review kit is prepared (`CLINICAL_REVIEW_PENDING.md`), but no formal feedback from a licensed optometrist or ophthalmologist has been received yet. All clinical content is grounded in published guidance (see [`CLINICAL_GROUNDING.md`](CLINICAL_GROUNDING.md)); independent expert review is planned as the next step.
- **Amsler calibration: desktop-validated only.** The credit-card calibration and grid rendering have been validated in desktop browser emulation. Physical-device calibration testing (actual phone, actual credit card, tap accuracy with a finger) is planned before clinical use.
- **Amsler grid keyboard navigation.** Grid cells are focusable buttons with `aria-label` and `aria-pressed` attributes, so Tab/Shift+Tab/Enter work for flagging cells. A keyboard fallback with row/column number inputs and an Add/Remove button is provided for users who cannot tap a grid. Arrow-key grid cursor navigation is not yet implemented.
- **Clinician brief one-page fit.** The brief uses compact font sizes (10–12px) and `break-inside: avoid` print rules targeting A4. Actual one-page fit depends on the number of matched patterns and observation groups for a given session; dense sessions may overflow to two pages. Physical print-preview verification is recommended.
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

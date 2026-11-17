# SightSteps

**A bilingual, mobile-first vision-awareness and eye-care conversation companion.**

Live Application link : [SightSteps](https://sightsteps.vercel.app/) 

Built for **ZEISS Beyond Code 2026** under the theme *No-Device Vision Intelligence & Accessible Clinical UX*.

SightSteps helps people organise visual experiences they have noticed, understand how those experiences relate to everyday activities, and prepare a clearer conversation with an optician or eye-care professional. It runs on a smartphone or shared tablet and does not require dedicated vision-testing hardware.

> **Important:** SightSteps is a conversation-preparation prototype. It is not an eye examination, visual-acuity test, screening or diagnostic system. It does not triage, determine urgency, assess clinical risk or prescribe lenses.

## What it does

- **Bilingual guided journey:** English and Hindi onboarding, questions and report content.
- **Experience intelligence:** Participants choose from experiences they actually reported and can describe onset, changes over time, context and frequency.
- **My Vision Timeline:** Participants can optionally record dated experiences, approximate times, activity context and personal notes. Entries can be edited or deleted and are stored with the local session.
- **Everyday activity impact:** Participants identify which selected activities feel affected and describe the kind and frequency of the impact. Follow-up questions depend on their answers.
- **Explainable conversation brief:** A deterministic rules engine groups self-reported information and creates discussion prompts with references to the source answers. Participants can bring up to two priorities to the front; this is a personal preference, not a clinical ranking.
- **Appointment preparation pack:** A compact printable brief brings together participant priorities, discussion questions and the five most recent timeline entries; the detailed report includes the full timeline and source references.
- **Two report formats:** A concise, printable appointment-preparation pack and a detailed report with observations and source references.
- **Appointment continuity:** Optional participant-written appointment notes, next steps and follow-up date.
- **Shared-device kiosk mode:** A dedicated participant flow with a five-minute inactivity timeout and session clearing on reload/reopen.
- **Assisted and voice interaction:** Optional assisted-completion disclosure, question read-aloud and browser speech-to-text where supported. Typed input is always available.
- **Installable PWA:** App manifest and service worker support installation and asset caching.

## How the experience works

1. Start a private session or open the clearly labelled Ramesh demo.
2. Choose English or Hindi, review the purpose and consent information, and indicate whether someone is assisting.
3. Select everyday activities that are part of the participant's routine.
4. Complete the guided questions and describe the visual experiences they have noticed.
5. Identify activities that feel affected and describe the impact.
6. Optionally try the direction-awareness interaction. It is uncalibrated and does not measure visual acuity.
7. Review the Vision Conversation Map, choose conversation priorities and print a brief or detailed report.
8. Optionally add dated entries to My Vision Timeline, including the experience noticed, activity context and a personal note.
9. Prepare the appointment pack or print the detailed report, including the full participant-recorded timeline.
10. Optionally record what was discussed at the appointment and any follow-up steps in the participant's own words.

## Technology

| Area | Implementation |
|---|---|
| Frontend | React 19 |
| Build tooling | Vite 6 |
| Navigation | React Router 7 |
| Local session storage | IndexedDB |
| Explainable logic | Deterministic JavaScript rules engine |
| PWA | vite-plugin-pwa, web app manifest and service worker |
| Voice features | Browser Web Speech APIs where available |

The rules engine is implemented in `src/engine/ruleEngine.js`. It turns recorded answers into observation groups, activity context and discussion prompts. Prompts retain references to their source questions so the report can explain where each point came from. It does not use a generative medical model or infer a diagnosis.

## Run locally

**Requirements:** Node.js 20 or later and npm.

```bash
git clone https://github.com/nehamalik12210/sightsteps.git
cd sightsteps
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

### Project checks

```bash
npm run audit   # Static project, data and feature checks
npm test        # Rules-engine, branching, persistence and routing tests
npm run check   # Runs the audit and regression tests
npm run build   # Creates the production build in dist/
npm run preview # Serves the production build locally
```

Use `npm ci` for a clean install from the committed `package-lock.json`. Use `npm install` when intentionally changing dependencies, then review and commit the lockfile changes.

## Deploy

The project is configured for Vercel. Import `nehamalik12210/sightsteps` and use:

| Vercel setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | Repository root |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Production branch | `main` |

The root `vercel.json` rewrite sends application routes back to `index.html`, allowing the client-side router to handle direct visits and page refreshes.

## Privacy and limitations

- SightSteps has no user account, application backend or cloud session synchronisation. Participant sessions are stored in the current browser's IndexedDB.
- Data is stored locally and is not encrypted by SightSteps. Anyone with sufficient access to the same browser profile may be able to access it. Do not use this prototype to store sensitive clinical records.
- **Clear my data** clears the app's local session records, timeline entries and latest-session pointer. It cannot remove browser downloads, printed or saved PDFs, screenshots, operating-system backups or copies made outside the app.
- Timeline entries are participant-written notes, not measurements or clinical interpretations. They are stored locally with the active session and are not encrypted by SightSteps.
- Kiosk mode is a privacy aid, not a security guarantee. Its timeout and reload behavior should be tested on the actual managed device and combined with the device owner's normal security controls.
- Speech synthesis and speech recognition depend on browser and device support. Speech recognition audio may be processed by a browser-configured or external provider; SightSteps does not claim that microphone processing always happens on-device.
- App assets are precached by the service worker. External fonts may require a successful online fetch before they are available from cache. Offline behavior should be tested on the target browser and device.

## Validation status

The last previously recorded local verification completed during project preparation reported:

- **423 passed, 0 failed** in the static quality audit.
- **542 passed, 0 failed** in the regression test suite.
- `npm run check` completed successfully.
- `npm run build` completed and generated the Vite production bundle and PWA service-worker assets.

**Verification note:** These historical counts and build results refer to an earlier revision. They are not validation of the timeline and appointment-pack changes. Run `npm run check` and `npm run build` on the current `main` revision before relying on this release.

These are code-side and build checks, not proof of clinical suitability or full accessibility. Real-device/browser testing, keyboard and screen-reader testing, participant usability sessions, and independent review by a qualified eye-care professional have not been established by these automated checks. Complete the relevant reviews before any clinical-context use.

## Responsible use

SightSteps is intended only to help people organise their own observations and prepare for a conversation with a qualified professional. It must not be used to diagnose, screen, triage, determine urgency, reassure someone that care is unnecessary, prescribe correction or replace a professional eye examination. Do not test minors without an appropriate guardian and ethics process.

## License

This project is available under the [MIT License](LICENSE).

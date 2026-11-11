# SightSteps

**A bilingual, smartphone-first vision-support experience for more informed conversations at optical shops.**

> **ZEISS Beyond Code 2026 · Mid-progress prototype**  
> **Chosen theme:** No-Device Vision Intelligence & Accessible Clinical UX  
> **College:** National Institute of Technology Rourkela  
> **Group:** 

SightSteps is a lightweight web app/PWA concept that helps a person organise self-reported vision experiences, everyday habits and eye-care background before speaking with an optician or eye-care professional. It is designed for a smartphone-based, low-friction interaction and does not require a dedicated vision-testing device.

**Important scope note:** SightSteps is an awareness and conversation-support prototype. It is not a medical device, eye examination, visual-acuity test, diagnostic system or source of lens prescriptions.

---

## What the prototype does

- **English and Hindi experience:** The onboarding flow lets the participant choose a language.
- **Guided questionnaire:** Questions cover reported vision experiences, daily habits and eye-care background. Some questions are shown conditionally based on earlier answers.
- **Guided demo:** A scripted Ramesh persona demonstrates a six-question journey, including the conditional near/far-vision question. Optional question narration uses the browser's speech-synthesis support when an appropriate voice is available.
- **Answer-based insights:** A transparent rules module organises the answers into groups, then surfaces neutral conversation prompts and follow-up topics where relevant.
- **Optional direction-awareness activity:** A large rotated letter “E” is shown for five prompts per eye. The activity records the participant's direction selections; it does not measure visual acuity.
- **Local session continuity:** Session details are stored in the browser using IndexedDB so a participant can resume on the same device when browser storage is available.
- **Installable PWA foundation:** The Vite PWA plugin generates a web app manifest and service worker. The build precaches the configured app assets; Google Fonts use a cache-first runtime strategy.

## Participant journey

1. Open SightSteps and start a new session or try the guided demo.
2. Choose English or Hindi and review the consent information.
3. Answer the relevant questionnaire prompts.
4. Review the answer-based summary, optician discussion topics and any follow-up notes.
5. Optionally complete the direction-awareness activity and view the recorded selections.
6. Start a new assessment when finished.

## How the insights are produced

The report is generated locally from the stored answers by `src/engine/ruleEngine.js`:

- **Vision experiences** — for example, reported blur, headaches, squinting or low-light difficulty.
- **Daily habits** — for example, reported screen use, outdoor time and close-up activities.
- **Eye-care background** — for example, current vision correction and examination history.

The engine produces observations that map back to the participant's actual answers. It can also create neutral discussion prompts based on selected answers. It does **not** calculate a clinical score, diagnose a condition, assign medical urgency, determine a prescription or recommend a specific lens as a clinical outcome.

## Technology

| Area | Implementation |
|---|---|
| UI | React 19 |
| Build and development server | Vite 6 |
| Navigation | React Router 7 |
| Installable web app | `vite-plugin-pwa` (manifest and service worker generation) |
| Local session persistence | Browser IndexedDB |
| Optional voice | Browser Web Speech API (`speechSynthesis`) |
| Language content | English and Hindi strings in the app data modules |
| Insights | Local, transparent JavaScript rules in `src/engine/ruleEngine.js` |

## Project structure

```text
sightsteps/
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── context/       # App state and session lifecycle
│   ├── data/          # Question bank, demo persona and translations
│   ├── engine/        # Transparent answer-to-insight rules
│   ├── pages/         # Landing, onboarding, intake, activity and report
│   ├── utils/         # IndexedDB persistence and speech helpers
│   ├── App.jsx
│   ├── accessibility.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## Run locally

### Requirements

- Node.js and npm
- A modern browser

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite prints the local address in the terminal (by default, `http://localhost:5173/`).

### Create and preview a production build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Privacy and practical limitations

- The current prototype has no account system, application backend or cloud session-sync feature.
- Questionnaire sessions are written to browser IndexedDB on the current device. If IndexedDB is unavailable or blocked, the app continues without persistence.
- The app loads Google Fonts from external font services; those font requests are separate from local questionnaire persistence. The PWA configuration caches Google Fonts after they are requested.
- Speech output depends on browser support and installed system voices. Voice availability and pronunciation can vary by device.
- Offline behaviour should be validated on the target browsers and devices before relying on it in a live setting.
- The direction-awareness activity is a simple interaction exercise, not a calibrated or standardised vision test.

## Current progress and next validation

This repository represents a working prototype and a mid-progress build, not a clinically validated product. The next development checks should focus on:

1. Usability feedback from intended participants and optical-shop staff.
2. Accessibility checks for keyboard use, screen readers, contrast and Hindi text rendering.
3. PWA installation and offline behaviour across target browsers/devices.
4. Hindi and English speech availability and the questionnaire experience on lower-end phones.
5. Review of the language used in insights and disclaimers with appropriate domain experts.

## Responsible-use statement

SightSteps is intended to support awareness and prepare a person for a conversation with an optician or qualified eye-care professional. It must not be used to diagnose, triage, prescribe or replace a professional eye examination. A participant should seek qualified care for vision concerns.

---

**Repository:** https://github.com/nehamalik12210/sightsteps  
**Event:** ZEISS Beyond Code 2026  
**Submission type:** Mid-progress update

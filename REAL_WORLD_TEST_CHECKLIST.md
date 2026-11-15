# Real-world readiness checklist

Mark a row only after it has been performed on the actual release build. The source audit does not replace these checks.

## Build and release

- [ ] Run `npm install` from the project root.
- [ ] Run `npm run check` and retain terminal output.
- [ ] Run `npm run build` and retain terminal output.
- [ ] Inspect the production build and service-worker registration.
- [ ] Deploy to the actual HTTPS environment and record build/version/date.

## Participant journey and data correctness

- [ ] Complete the entire normal journey in English and Hindi.
- [ ] Complete the Ramesh demo; verify scripted data disclosure and seven visible guided questions.
- [ ] Report more than one experience; verify primary concern options only contain reported experiences.
- [ ] Test onset, change, context, frequency and the eye-side branch (including headache where eye-side is omitted).
- [ ] Select multiple daily activities, mark a subset as affected, and verify impact follow-ups only apply to selected affected activities.
- [ ] Select a positive activity impact and verify a frequency question appears; choose none/unsure and confirm the frequency question stays hidden.
- [ ] Change an earlier answer and verify downstream answers are removed/re-asked.
- [ ] Return to the Activity Profile, change the selected routine, and verify old affected-activity and impact/frequency answers are cleared.
- [ ] Select up to two conversation priorities; verify matching discussion prompts are brought forward and no clinical ranking is implied.
- [ ] Add participant questions and verify they appear in both print modes.
- [ ] Print the one-page priority handoff and detailed report in English and Hindi.
- [ ] Add appointment notes and dates, refresh/resume and confirm all values persist.
- [ ] Toggle assisted completion and confirm the report disclosure is clear.

## Navigation, accessibility and privacy

- [ ] Open `/intake`, `/vision`, `/report` and `/follow-up` directly with no session; verify redirect behavior.
- [ ] Use Back at each questionnaire stage and confirm the correct preceding question and dynamic branches.
- [ ] Refresh and reopen a normal partial session; verify next-question restore.
- [ ] Disable IndexedDB and confirm storage warnings with no false claim of saving.
- [ ] Clear my data and confirm no prior session is offered.
- [ ] Navigate all screens using keyboard only; no focus trap or lost focus.
- [ ] Test NVDA/VoiceOver and 200%/400% zoom.
- [ ] Test reduced-motion preference and visible focus.
- [ ] Test question-and-choice read-aloud in Hindi/English, stop/replay and missing voice behavior.
- [ ] Test speech recognition permission, denial, transcript correction and no-support fallback; verify provider/audio privacy disclosure.

## Kiosk and PWA

- [ ] Start kiosk mode and verify standard demo/new-session controls are hidden during an active participant session.
- [ ] Verify the 5-minute idle timeout and that normal user interaction resets it.
- [ ] Refresh from Landing, Intake, Report and Appointment Follow-up during kiosk mode; confirm participant data is discarded.
- [ ] Confirm End session and clear data removes local SightSteps records.
- [ ] Confirm browser print/PDF exports, downloads and OS-level copies are handled by the device operator; the app cannot clear them.
- [ ] Install the PWA online, then test cold start and reload while offline.
- [ ] Check 360px, 375px, 390px and 430px mobile widths, tablet and desktop.

## Independent review

- [ ] Obtain qualified eye-care professional review of all questions, Hindi copy, rules, prompts, direction activity and driving wording.
- [ ] Run supervised adult participant usability sessions with consent; record issues without treating responses as clinical evidence.
- [ ] Re-test changes and record exact build/version, device, browser, language and test date.

A checklist entry is not passed merely because corresponding code exists.

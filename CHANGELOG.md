# SightSteps functional upgrade

The current mobile-first Optical Editorial design system and existing screen layout are retained. This update builds functionality on the existing participant journey.

## Pass 1 — navigation and persistence

- Saved records include activity profile, answers, notes, direction interaction state, priorities and appointment follow-up.
- Corrected resume order, stale answer clearing, report hydration handling and storage-failure messaging.
- Added protected route checks: a direct URL or refreshed kiosk route cannot reopen intake/report screens without a valid participant session and completed preceding stages.
- Changing the activity profile clears affected-activity and per-activity impact answers so old choices are not carried into a changed routine.
- Clear my data removes all SightSteps IndexedDB session rows and the latest-session pointer.

## Pass 2 — Experience Intelligence and Activity Impact Mapping

- Added main-concern selection limited to reported experiences.
- Added onset, change-over-time, context and frequency questions for the selected main concern; eye-side follow-up is omitted for headaches.
- Added separate discussion prompts for additional reported experiences.
- Added a per-activity impact follow-up for every activity the participant identifies as affected.
- Added a conditional per-activity impact-frequency question. It appears only after a positive impact response and stays hidden for none/unsure.
- Extended structured experience profiles, report observations and traceable sources to include activity-impact frequency.
- Preserved the distinction between daily routine and self-reported affected activities.

## Pass 3 — Conversation Brief 2.0

- Participants can select up to two conversation priorities; corresponding discussion prompts are moved forward without assigning clinical importance.
- Added participant-authored questions to ask the professional.
- Added separate one-page priority brief and detailed report print modes.
- The detailed report continues to show generated discussion prompts and their source answers.

## Pass 4 — Appointment Continuity

- Added optional appointment date, notes from the participant's conversation, next steps they were told about and next appointment date.
- Follow-up content is stored in the current local session and is clearly labelled as participant-recorded information, not a clinical record.

## Pass 5 — Shared-device Kiosk Mode

- Added a dedicated kiosk setup and active-participant landing state.
- Kiosk sessions clear after five minutes of inactivity and are discarded rather than restored after reload/reopen.
- Added explicit clear-and-finish actions. Documentation notes that print/PDF files and OS-level data are outside the app's control.

## Pass 6 — Assisted and Voice Interaction

- Added an assisted-completion flag and report disclosure.
- Question read-aloud now includes answer options as well as question text, subject to browser speech-synthesis support.
- Added optional browser speech-to-text for notes, participant questions and appointment notes, with transcript review/editing and disclosure that browser/provider audio processing may be remote.

## Pass 7 — Accessibility and validation readiness

- Preserved keyboard focus management, visible focus, reduced-motion support, selected-state semantics, bilingual text and Hindi-capable font.
- Adjusted direction activity wording and round presentation to avoid an implied eye-specific clinical test.
- Expanded the dependency-free quality audit and regression suite for the new conditional branches, data shapes and route protection.
- Added manual protocols for keyboard, assistive technology, offline PWA, kiosk timeout, participant usability and qualified eye-care professional review.

**Validation boundary:** code-side regression/audit and syntax checks are run in the preparation environment. The production Vite build, real browser/device testing, participant usability and independent eye-care professional review must be completed on the target release environment.

## Home navigation language isolation
- Returning home from the Ramesh Hindi demo now clears the demo session before navigation.
- Both the report header back control and the report's "Back to home" action use the same handler.
- Normal participant sessions retain their chosen language when navigating home; kiosk sessions still end and clear through the kiosk flow.


## Fresh-session onboarding and navigation reliability

- Replaced the component-mount timing heuristic in the onboarding guard with an explicit `allowNewSession` navigation-state marker. Normal and kiosk entry points set this marker only after their reset operation completes.
- Direct visits to `/onboarding` with an existing participant session still return to Landing, while a session created after the consent action can continue to Activity Profile.
- Abandoning the language-selection step clears the provisional language so a participant who chose Hindi but did not begin a session does not leave the home screen in Hindi.
- Prevented duplicate activity-profile and direction-activity submissions while state transitions are pending.
- Kiosk setup cannot start before storage hydration completes; returning to a kiosk tab within the idle window restarts the idle timer, while an actually expired session is still cleared.
- Voice dictation now appends to the latest text value and does not overwrite edits made while microphone recognition is active.
- Older partial appointment records are hydrated with current default fields.

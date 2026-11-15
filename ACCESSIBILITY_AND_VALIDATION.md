# Accessibility, device, PWA and real-world validation

This document separates source-code checks from checks requiring a real browser, assistive technology, a managed device, a participant or a qualified eye-care professional. Do not mark a manual test passed until it has actually been performed on the intended release build.

## Code-side work included

- Questionnaire changes move keyboard focus to the new question heading.
- Answer options, activity selections, language selectors and report expanders expose selected/expanded state through accessible semantics.
- Direction responses use a polite status announcement and do not announce a clinical score.
- The question read-aloud action speaks both the question and its answer choices in the selected language where Web Speech synthesis is available.
- Optional speech recognition is disclosed as browser/provider processed; typing remains available.
- Assisted completion is recorded and disclosed in the resulting report.
- Hindi uses a Devanagari-capable font while preserving Material Symbols.
- Global visible focus, disabled states, reduced-motion overrides and safe-area-aware layouts are retained.
- Muted and warning text colours were adjusted to meet the normal-text contrast target on the app's principal surfaces.
- Browser theme colour and PWA manifest colours are synchronised. Google Fonts CSS and font files have runtime caching after first successful retrieval.
- Protected routes require a valid, consented participant session and relevant completed journey stages.
- The kiosk policy clears after five minutes of no interaction and discards kiosk session data on reload/reopen.
- `npm run audit` checks local imports, bilingual data, core contrast tokens, feature hooks, routes and non-diagnostic wording.
- `npm test` exercises questionnaire branching, per-activity impact/frequency rules, session record shape, route protection, kiosk timeout rules, demo handling and source traceability.

## Device and browser test plan

| Test | Procedure | Record |
|---|---|---|
| Keyboard-only | Use Tab, Shift+Tab, Enter and Space through every screen, including multi-select and report priorities. Confirm visible focus and no trap. | Pass/Fail, browser/version |
| Screen reader | Test NVDA with Firefox/Chrome on Windows and VoiceOver with Safari on iOS. Verify question headings, selected states, progress, warnings, question/options read-aloud status, expanders and deletion controls. | Pass/Fail, AT/version |
| 200% and 400% zoom | Exercise all steps, dynamic questions, voice fields, report sections and appointment notes. Check clipping and horizontal scrolling. | Pass/Fail, viewport |
| Mobile/tablet/desktop | Test 360×800, 375×812, 390×844, 430×932, a tablet and desktop. Test portrait/landscape and safe areas. | Pass/Fail, device |
| Hindi | Complete the entire workflow in Hindi. Check Devanagari rendering, string wrapping, spoken Hindi quality and screen-reader pronunciation. | Pass/Fail, device/browser |
| Reduced motion | Enable OS/browser reduced-motion preference and verify transitions and animation are suppressed. | Pass/Fail, OS |
| Speech synthesis | Listen to question and every answer option in English and Hindi. Test stop/replay, missing voices and navigation while speech is active. | Pass/Fail, browser/voice |
| Speech recognition | Test permission grant, denial, unsupported browser, empty transcript, noisy room, partial recognition and transcript editing before saving. Confirm privacy caveat is understood. | Pass/Fail, browser/provider |
| IndexedDB unavailable | Disable/block IndexedDB. Complete the flow and verify the app remains usable while clearly warning that refresh may lose answers. | Pass/Fail, browser |
| Session persistence | Complete a partial normal session, refresh/reopen and verify the exact next question, selected activities, notes and dynamic activity follow-ups. | Pass/Fail, browser |
| Direct-route protection | Open `/intake`, `/vision`, `/report` and `/follow-up` in a clean profile with no session. Confirm redirect to the correct starting step. Repeat with partial and complete sessions. | Pass/Fail, browser |
| Kiosk timeout | Start kiosk, interact, wait 5 minutes without interaction, confirm reset and return to kiosk setup. Confirm interaction resets the idle timer. | Pass/Fail, managed device |
| Kiosk reload | Start kiosk, enter participant information, reload on several routes and confirm previous participant data is discarded. Check that browser history does not expose old report content. | Pass/Fail, managed device |
| Clear data | Complete a normal and a kiosk session, clear them, reopen and verify no prior session is available. Inspect the app's IndexedDB records and pointer. | Pass/Fail, browser |
| PWA offline | Install online, open once, go offline, reload and navigate. Record which assets work; test first-use font fallback and cached font behavior. | Pass/Fail, device |
| One-page print | Print the priority brief in both languages. Confirm only the concise summary prints and that participant questions are visible. | Pass/Fail, browser |
| Detailed print | Print the detailed report in both languages. Confirm all answer observations, impacts, frequencies and source references are included; controls are hidden. | Pass/Fail, browser |
| Appointment continuity | Enter appointment date, notes, next steps and next date. Refresh, resume, confirm all fields and check date handling. | Pass/Fail, browser |

## Participant usability validation

1. Recruit consenting adults representative of the intended optical-shop context. Do not start with minors.
2. Explain that SightSteps organises self-reported experiences and does not perform an eye examination, diagnose, triage or prescribe.
3. Observe participants completing the journey without coaching. Record confusion, drop-off, skipped questions and use of voice/typing.
4. Ask whether the main-concern and activity-impact questions accurately represent their experiences, whether "none"/"unsure" are clear, and whether the report distinguishes daily routine from affected activities.
5. Ask whether participants understand the two report modes, priority selection, question list, after-appointment notes and kiosk privacy limitations.
6. Record completion rates, misunderstood copy and accessibility barriers without interpreting participant answers as clinical evidence.
7. Repeat after revisions, recording the exact build, device, browser, language and date.

## Eye-care professional review

Before public or clinical-context deployment, a qualified eye-care professional should review every English/Hindi question, conditional branch, generated prompt, report disclaimer, driving wording and optional direction interaction. Review whether the interface could imply screening, diagnosis, urgency or reassurance. Record reviewer role, date, version and written feedback separately. The automated source audit is not clinical approval.

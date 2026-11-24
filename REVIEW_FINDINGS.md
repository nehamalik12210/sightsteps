# SightSteps — Review Findings and Priorities

**Last reviewed:** 25 November 2026  
**Scope:** Eight original reviewer concerns plus provenance and dependency-audit issues discovered during implementation.

## Findings

| ID | Finding | Status | Priority / next action |
|---|---|---|---|
| F-01 | No matched patterns must not reassure participants or imply absence of a problem. | Source wording inspected; EN/HI both state that the engine covers limited patterns and cannot rule out a problem. | Keep regression protection. |
| F-02 | Amsler completion language must not imply a screening result. | UI says “Activity Complete”; no-flags warning and prompt to contact an eye-care professional for new distortion/blur/missing areas are present. | Keep language and test. |
| F-03 | Amsler physical calibration/device fit. | Code uses a standard-card width and viewport-fit guard. Real display scale, zoom, viewing distance and tap accuracy are not validated across devices. | High; obtain device testing and optometrist review. Do not claim calibration is clinically validated. |
| F-04 | Amsler centre marker alignment. | CSS uses 50% positioning with negative 50% translation. | Browser geometry/responsive visual validation still needed. |
| F-05 | Low-light pattern context. | Rule requires reported night-vision difficulty, explicit low-light context and squinting; it does not use outdoor-time as a substitute for context. | Keep regression protection; include in expert review. |
| F-06 | Clinical-language allowlist may be too coarse. | Detector retains phrase-level exceptions; mixed safe/unsafe text fixture protects against a disclaimer masking unsafe text elsewhere. Additional safe-context fixtures added. | Continue reviewing exceptions; avoid broad allowlist entries. |
| F-07 | Clinical copy coverage was incomplete. | Replaced six-file hardcoded JSX list with recursive discovery and Babel JSX parsing. Audit covers visible JSX text, visible attributes, expressions/templates, bilingual data, base/adaptive questions, demo persona, clusters and engine output. Added a temporary nested-component fixture that proves a new JSX file is discovered and its text reaches the detector. | Implemented; preserve coverage tests. |
| F-08 | Discussion-source provenance was ambiguous and omitted from appointment pack. | Report labels now identify responses linked to each topic/follow-up. Appointment pack retains up to eight localized source IDs, labels and answers per discussion topic; display and regression tests added. | Implemented; visual print inspection still pending. |
| F-09 | Exported discussion-source provenance was English-only. | The generated artifact initially exposed English-only rule-engine source rows. Export renderer now emits adjacent EN/HI source labels and answers. Latest artifact has 57 EN/HI source pairs and no missing or blank Hindi rows; cover identifies review-draft status and scripted demo data. | Implemented and artifact inspected; keep regression check when export format changes. |
| F-10 | Participant-entered “Other” activity wording lacked explicit answer provenance. | `custom_activity_name` is now included as a source for primary/affected-activity discussion points and experience-profile source IDs. Its label is localized while the participant's free-text answer is preserved verbatim. Regression tests cover source IDs, bilingual labels, both topics and Hindi appointment-pack serialization. | Implemented; verify visually in printed pack. |
| F-11 | npm audit reported four moderate transitive PWA build-tool findings. | npm audit artifact identifies the chain `vite-plugin-pwa@2.0.0` → `workbox-build@7.4.1` → `glob@11.1.0` / `minimatch@10.2.6`, with GHSA-3g3m-2fjr-6pw4 and GHSA-g3hv-75wg-m249. Suggested npm remediation is a major-change replacement that appears to downgrade the direct PWA plugin; no forced update applied. | Keep open; evaluate upstream compatible Workbox/plugin releases or test a controlled override. Do not run `npm audit fix --force`. |

## Additional engineering observations

- The audit now scans 22 JSX files and over 2,600 copy fragments on the verified build.
- Latest build emits a 581.00 kB minified JavaScript chunk above Vite's 500 kB warning threshold (158.01 kB gzip).
- npm audit report contains 4 moderate findings in the build-time PWA toolchain; see F-11 and `BASELINE.md` for advisory/version detail.
- Clinical review export includes pattern clusters, source traceability and the synthetic Other-activity example. Latest inspected artifact: 954 lines / 68,713 bytes, 12 sections, 57 bilingual source pairs, explicit review-draft and demo-data notices.

## Outstanding release gates

1. Independent optometrist/ophthalmologist review and recorded feedback.
2. Amsler calibration and responsive geometry validation on real devices.
3. Browser print-preview and page-count/visual review of appointment packs in English and Hindi, including dense data and custom “Other” activity.
4. Reduce the production JavaScript chunk after reviewing route-level splitting and actual bundle composition.
5. Resolve the four moderate PWA build-tool advisories using compatible upstream versions or a fully tested override; do not force a major downgrade.

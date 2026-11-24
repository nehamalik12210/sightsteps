# SightSteps — Review Findings and Priorities

**Last reviewed:** 25 November 2026  
**Scope:** Baseline and the eight reviewer concerns carried into this audit.

## Findings

| ID | Finding | Status | Priority / next action |
|---|---|---|---|
| F-01 | No matched patterns must not reassure participants or imply absence of a problem. | Source wording inspected; EN/HI both state that the engine covers limited patterns and cannot rule out a problem. | Keep regression protection. |
| F-02 | Amsler completion language must not imply a screening result. | UI says “Activity Complete”; no-flags warning and prompt to contact an eye-care professional for new distortion/blur/missing areas are present. | Keep language and test. |
| F-03 | Amsler physical calibration/device fit. | Code uses a standard-card width and viewport-fit guard. Real display scale, zoom, viewing distance and tap accuracy are not validated across devices. | High; obtain device testing and optometrist review. Do not claim calibration is clinically validated. |
| F-04 | Amsler centre marker alignment. | CSS uses 50% positioning with negative 50% translation. | Browser geometry/responsive visual validation still needed. |
| F-05 | Low-light pattern context. | Rule requires reported night-vision difficulty, explicit low-light context and squinting; it does not use outdoor-time as a substitute for context. | Keep regression protection; include in expert review. |
| F-06 | Clinical-language allowlist may be too coarse. | Detector retains phrase-level exceptions; mixed safe/unsafe text fixture protects against a disclaimer masking unsafe text elsewhere. Additional safe-context fixtures added. | Continue reviewing exceptions; avoid broad allowlist entries. |
| F-07 | Clinical copy coverage was incomplete. | Replaced six-file hardcoded JSX list with recursive discovery and Babel JSX parsing. Audit covers visible JSX text, visible attributes, expressions/templates, bilingual data, base/adaptive questions, demo persona, clusters and engine output. | Implemented; preserve coverage tests. |
| F-08 | Discussion-source provenance was ambiguous and omitted from appointment pack. | Report labels now identify responses linked to each topic/follow-up. Appointment pack retains up to eight localized source IDs, labels and answers per discussion topic; display and regression tests added. | Implemented; visual print inspection still pending. |
| F-09 | Exported discussion-source provenance was English-only. | The generated artifact initially exposed English-only rule-engine source rows. Export renderer now emits adjacent EN/HI source labels and answers. Latest artifact has 53 EN/HI source pairs and no missing or blank Hindi rows. | Implemented and artifact inspected; keep regression check when export format changes. |

## Additional engineering observations

- The audit now scans 22 JSX files and over 2,600 copy fragments on the verified build.
- Current build emits a main JavaScript chunk above 500 kB.
- npm reports 4 moderate vulnerabilities; inspect `npm audit` output before changing dependency versions. Do not apply `npm audit fix --force` blindly.
- Clinical review export includes pattern clusters and explicit source-provenance labels. GitHub Actions generates the artifact; latest export was inspected (893 lines / 63,996 bytes, 53 bilingual source pairs).

## Outstanding release gates

1. Independent optometrist/ophthalmologist review and recorded feedback.
2. Amsler calibration and responsive geometry validation on real devices.
3. Printed appointment-pack visual review in English and Hindi.
4. Complete printed appointment-pack visual/page-count review in English and Hindi.
5. Address bundle-size and dependency audit warnings after assessing actual dependency paths and compatibility.

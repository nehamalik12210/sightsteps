# SightSteps — Implementation Log

## 25 November 2026

### Change 1 — Clinical-language audit coverage
- Replaced a manually maintained six-file JSX list with recursive discovery of all JSX files under `src`.
- Added Babel parser as a development dependency and lockfile entry.
- Parses JSX and checks visible text nodes, visible/accessibility attributes, expression strings and template literals.
- Added bilingual structured-copy traversal for patterns, clusters, questions and demo persona; includes adaptive-question scenarios and generated rules/pattern output.
- Added fixture checks for unsafe copy, safe disclaimer handling, mixed safe/unsafe text, JSX text, JSX attributes, expressions and template literals.
- Initial expanded scan revealed eight false positives. Narrow contextual exceptions and regression examples were added; no blanket allowlist relaxation.
- Verified: 22 JSX files, 2,618 fragments; audit passed.

### Change 2 — Discussion-source provenance
- Report discussion and follow-up labels now explain that the displayed answers are linked to that topic, replacing the ambiguous “Based on” label.
- Appointment pack serialization now preserves bounded source IDs, localized labels and answers.
- Appointment pack renders the source details below the associated discussion topic.
- Added two regression assertions for source identity and localized source content.
- Verified on Vercel: 844 engine tests passed, 2,519 quality checks passed, clinical audit passed (22 JSX files, 2,622 fragments), Vite build and PWA generation completed.
- Commit: `cfdd32bec6125c2c64e887df3b79c9cf257a811e`.

### Change 3 — Clinical review export coverage
- Added bilingual pattern-cluster title/summary and member IDs to the review export.
- Added report, follow-up and appointment-pack source-provenance labels to the export.
- Corrected the export section ordering and ensured the provenance section is actually inserted.
- Commits: `ba59301bf1b0eb1a9cc973c2171f5857616702fe`, `03f5a499e8891c9f2f9f5c34ae9badae19909ebd`, `87794fde5d8bd893ac9037eb4e93088eb6da6a94`.
- The generated export is inspected and has 53 bilingual source pairs; visual print-layout review remains outstanding. The normal Vercel build does not run `npm run export-review`.

## Verification notes
- All changes were committed directly to `main`; no feature branches were created.
- The first expanded clinical audit correctly exposed safe contextual wording that the original six-file audit did not see. Those false positives were narrowed by explicit contextual phrases and tests.
- A deployment attempt using an incorrect custom output-directory configuration failed and was canceled; it did not replace the production deployment.
- Production deployment for `e355deab` is READY at `https://sightsteps.vercel.app`.
- No local browser/device test was run. Do not treat automated checks as clinical validation.

### Change 4 — Reproducible clinical-review export
- Added `.github/workflows/clinical-review-export.yml` to run on relevant source/data changes or manual dispatch.
- Workflow installs locked dependencies, runs `npm run export-review`, and uploads `exports/clinical-review-export.txt` as a 14-day artifact.
- Run `45486764134` for commit `e355deabfc4bc0b0fa679af3f5795f61c5154956` completed SUCCESS; artifact ID `14963749045`.

### Change 5 — Bilingual provenance in exported discussion prompts
- First inspection of the generated export found rules-engine discussion sources printed only in English; this was not visible from the pattern-source export.
- Updated the export renderer to print both EN and HI source labels/answers for each discussion prompt.
- Regenerated and re-inspected the export: 893 lines / 63,996 bytes, 11 sections, 53 EN source rows each followed by a non-empty HI row, zero missing Hindi pairs.
- Commit: `e355deabfc4bc0b0fa679af3f5795f61c5154956`.
- The generated text file is available as a GitHub Actions artifact; it was also retrieved and inspected in this work session.

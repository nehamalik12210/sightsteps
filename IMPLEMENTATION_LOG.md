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
- Production deployment for `a83de54` is READY at `https://sightsteps.vercel.app`.
- No local browser/device test was run. Do not treat automated checks as clinical validation.

### Change 4 — Reproducible clinical-review export
- Added `.github/workflows/clinical-review-export.yml` to run on relevant source/data changes or manual dispatch.
- Workflow installs locked dependencies, runs `npm run export-review`, and uploads `exports/clinical-review-export.txt` as a 14-day artifact.
- Run `45486764134` for commit `e355deabfc4bc0b0fa679af3f5795f61c5154956` completed SUCCESS; artifact ID `14963749045`.

### Change 5 — Bilingual provenance in exported discussion prompts
- First inspection of the generated export found rules-engine discussion sources printed only in English; this was not visible from the pattern-source export.
- Updated the export renderer to print both EN and HI source labels/answers for each discussion prompt.
- Regenerated and re-inspected the earlier export: 893 lines / 63,996 bytes, 11 sections, 53 EN source rows each followed by a non-empty HI row, zero missing Hindi pairs. Later export versions add the Other-activity example and are recorded below.
- Commit: `e355deabfc4bc0b0fa679af3f5795f61c5154956`.
- The generated text file is available as a GitHub Actions artifact; it was also retrieved and inspected in this work session.

### Change 6 — Clinical-language scanner discovery regression
- Added a temporary nested `NewFeature.jsx` fixture to verify recursive JSX discovery finds newly added components and sends their visible text to the clinical detector.
- Fixture is created under the OS temporary directory and removed in a `finally` block; no test files remain in the repository.
- Verified by Vercel on commit `4b5ebcf6793fbcf3e439a8264f9fa118a85201f0`: fixture executed, clinical-language audit passed, 22 JSX files / 2,622 copy fragments scanned, build READY.

### Change 7 — Clinical export draft and demo-data notice
- Added bilingual document-status and demo-data notices at the top of the generated export.
- Labels the export as a draft for independent clinical review, not a diagnosis/test result/prescription, and explicitly identifies the Ramesh example as scripted demo data.
- Workflow run `45487346824` completed SUCCESS; artifact ID `14964129797`.
- Inspected regenerated export at this stage: 899 lines / 65,087 bytes; all 53 source-answer rows have non-empty English and Hindi pairs; the opening notices are present. Superseded by the 12-section export recorded in Change 9.
- Commit: `01f969f64b8f66bf47b93ee9b8a7979fd9805586`.

### Change 8 — Participant-entered “Other” activity provenance
- Added `custom_activity_name` as an explicit source to primary and affected-activity discussion topics when the participant selects “Other”.
- Added the same answer ID to activity-impact source IDs in the everyday experience profile; localized the source label in the profile component while preserving the participant's free-text answer verbatim.
- Added regression assertions for affected/primary discussion topics, bilingual source labels, raw participant wording and Hindi appointment-pack serialization.
- First Vercel test run exposed a fixture mismatch: the test expected translated free text although the app contract preserves participant-entered wording verbatim. Corrected the fixture/assertion; verified on commit `723c3c5a29abf31295fb77e8083564b48a53c156`: 849 passed, 0 failed; 2,519 quality checks; clinical audit passed; Vite build and PWA generation passed.

### Change 9 — Synthetic custom-activity scenario in clinical review export
- Added a separate, clearly labelled synthetic “Other” activity scenario to the export so reviewers can inspect how participant-entered text is sourced in both primary and affected-activity discussion topics.
- Explicitly identifies this example as synthetic test data in the English/Hindi cover notice.
- Corrected later-section numbering to 1–12 and re-generated/inspected export: 954 lines / 68,713 bytes; 57 EN source rows each immediately followed by a non-empty HI source row; zero mispaired rows.
- Workflow run `45489986192` completed SUCCESS; artifact ID `14966680846`.

### Change 10 — Dependency audit artifact
- Extended the clinical-review workflow to include an `npm audit --json` report alongside the export artifact.
- Corrected an initial YAML `path` formatting mistake before accepting the successful run; the malformed run failed before starting a job and did not affect the app deployment.
- Workflow run `45490205104` completed SUCCESS; artifact ID `14964948536` contains both the 68,713-byte export and npm audit JSON.
- Audit reports four moderate findings in the development-time PWA dependency chain; no forced fix or version downgrade was applied pending compatibility review.

### Change 11 — Route-level code splitting
- Replaced static imports for nine non-Landing page routes with `React.lazy` and a shared `Suspense` boundary; Landing remains statically loaded.
- Added a bilingual loading fallback with a `main-content` landmark, `tabIndex=-1` and polite live announcement.
- Added a post-mount animation-frame focus handoff so keyboard focus moves from the fallback to the loaded page landmark.
- Vercel production deployment `dpl_FJdRtfhg8nUfoJdymcfCDSag4cUo` (commit `38b7e7132593d72fa64be23a303a312a2a3697a2`) reached READY.
- Build output: initial JS entry fell from 581.00 kB / 158.01 kB gzip to 344.80 kB / 105.91 kB gzip. Report route: 147.38 kB / 32.22 kB gzip; Amsler route: 21.91 kB / 5.69 kB gzip. PWA precache: 34 entries / 975.74 KiB.
- Review note: the first build showed eight fewer static quality checks because the import resolver only recognised static import syntax. The app build itself succeeded, but the missing checks were treated as a test-coverage regression and corrected before closing the task.

### Change 12 — Dynamic-import path audit and route-load regression checks
- Updated `scripts/quality-audit.mjs` to resolve literal relative dynamic `import()` calls as well as static imports.
- Added explicit assertions that all nine lazy page imports resolve and that the shared Suspense fallback and post-load focus handoff exist.
- Verified on production deployment `dpl_BxnNfeW8HBBhuXxQrg7UQTzoJDQf` (commit `5d964fc5ab2311e612a2ffe0c1db1bf65b131cf0`): **2,522 quality checks passed, 0 failed; 849 engine tests passed, 0 failed; clinical-language audit passed** (22 JSX files / 2,625 copy fragments). Build completed; 100 modules transformed.
- Direct production requests to `/`, `/activities`, `/report`, `/amsler` and `/kiosk` returned HTTP 200 with the SPA shell. This verifies the server-side fallback response only, not client rendering or browser interaction.

### Change 13 — Questionnaire duplicate-question cleanup
- Removed the separate main and secondary headache-frequency follow-up because the initial headache question already records frequency; the original response is reused in the structured experience profile and rule-engine profile.
- Removed near-task and distance-task choices from blurred-vision context follow-ups because blur distance is already collected separately. Removed the repeated low-light context choice for night-vision follow-ups because the initial night-vision response already establishes that context.
- Clarified the close-up-work question and the activity-avoidance option. Corrected secondary follow-up ordering so it no longer depends on the headache-frequency question being present.
- Added regression checks for main/secondary headache frequency reuse, removed context options and secondary-follow-up ordering.
- A representative single-experience path exposes 21 visible questions; a representative multiple-experience/activity path exposes 30. The additional conditional questions collect separate onset/context/activity-impact details; they are not identical copies of earlier answers.
- Source commits: dc0bcc6970fb82c1becc2f921d3a478126f5dfdc, 6773924f0a6ad95de4bc53c1f4f716e0dad01bdb, e6ecbdf7ef34069f0887b4ae3904ac933f505ebe, 81270320a2bd63d2b80448b6722232913c22bf26, 2a4fdaf427c18d81732a3e101eca46972a8f2983.

### Change 14 — Pattern context attribution and cluster membership
- Pattern triggers now verify that the corresponding experience is actually reported before using its distance, eye-side, onset or context details. Driving/screen context is attributed to the relevant main or selected additional experience rather than borrowed from a different symptom.
- Pattern descriptions and discussion prompts were made more explicit about what was separately reported and avoid implying an established cause. Dynamic pattern source keys preserve the actual context-answer ID for secondary experiences.
- Removed generic overdue-exam membership from the near-vision and low-light clusters. A cluster now requires its two specific member patterns; generic examination history cannot fill a missing member. Cluster text explains that overlapping matches are not independent confirmations.
- Regression coverage includes stale answers, unrelated primary experiences, borrowed context, dynamic source provenance, cluster membership and incomplete pattern triggers.
- Source commits: a887d2b6cd3a6b248e24f29f2df34e284a5602f3, 579e73de69ec338aab7a532befb92ee765d38f22, ee2dd6b36303ad6292dc6d1eb2cde40307aa4fdc, 1d8905272a79d7be0548e4bb862d8c36f6b28dff, 9b5febd7c1e4266b77aa38ec4c81aef6b2724620, f85d2ae7beb706b20e039eeb19b922c010c77b05, cc676978124d061abdc5fe1ec931bd158112fbe3, af2f541371317b4f5814146a98749e72fa27360a, c2f3a5f3a8c539e84f7446399ff47d9db648f688, 7224c5c8b59a402a8e7fbc97893a55fc00914f0d, 343c986a04df184e0882ff8fe3eb8516685e4a63, 1c43e08d76342020474a96b22a265b5d5e3bb228.

### Change 15 — Dynamic pattern source-key export compatibility
- A separate npm run export-review run exposed that scripts/export-prompts.mjs assumed every sourceKeys value was a static array and crashed when a pattern used a participant-context function.
- Added shared resolvePatternSourceKeys logic in src/engine/patternEngine.js; runtime pattern evaluation and the clinical-review exporter now use the same resolver. The exporter labels function-based keys as resolved for the scripted Ramesh answers.
- Added a regression assertion for source-key resolution across every pattern definition.
- Source commits: 9fa332a13135b6bc35cf280406cdbcac34e706bd, d82f18a094a44ac49274884df11c471c13b2aef1, 7224c5c8b59a402a8e7fbc97893a55fc00914f0d.
- Verified on exact main revision ae31b03... before the final cluster-copy audit correction; the final complete rerun is recorded in Change 16.: 961 engine tests, 2,524 quality checks, clinical-language audit passed (22 JSX / 2,629 fragments), production build passed (100 modules), and review export completed (965 lines reported by the exporter; 8 patterns, 4 Ramesh matches, 10 discussion prompts, 2 follow-up notes).
- Vercel has not deployed this source revision: the current status check reports a build-rate-limit. The latest READY production deployment remains the older 92a4d0da... revision. Browser rendering, print preview, real-device and independent clinical review remain outstanding.

### Change 16 — Near-vision cluster wording aligned with clinical-language audit
- The revised near-vision grouping originally used the phrase “medical condition” in a negated sentence. The clinical-language audit correctly flagged the term, so the copy was changed to state the narrower point: grouping does not say that one experience explains the other.
- Final re-verification on main commit c1936631a3eb93e4b025d50afe8659e7df11132f: 961 regression tests passed; 2,524 quality checks passed; clinical-language audit passed (22 JSX / 2,629 fragments); Vite build passed (100 modules; initial JS 345.09 kB / 106.00 kB gzip; Report 151.87 kB / 33.15 kB gzip; 34 precache entries / 980.40 KiB); clinical-review export generated successfully (965 lines reported by the exporter, 8 patterns, 4 Ramesh matches, 10 prompts, 2 follow-up notes).
- This exact source has not been deployed because Vercel reports a build-rate-limit. The latest READY production deployment remains commit 92a4d0da...; production is not confirmed to contain this work.


### Change 17 — Final symptom-language precision
- Removed timing-oriented wording (“raise soon”) from the one-eye/recent-onset discussion pattern so the app does not imply a clinical urgency assessment.
- Reworded the low-light discussion prompt to ask participants to describe each experience and its own context separately, rather than implying squinting occurred in low light.
- Regression, quality, clinical-language, production-build and review-export checks were rerun on c1936631a3eb93e4b025d50afe8659e7df11132f and all passed (961 tests, 2,524 checks, 22 JSX files / 2,629 fragments; 100 modules; 34 precache entries / 980.40 KiB; export 965 lines).
- Vercel deployment remains blocked by its build-rate-limit status; current production remains the older READY 92a4d0da... deployment.


### Change 18 — Overdue-exam source attribution
- The overdue-exam trigger counted only positively reported experiences, but its static source list also cited every symptom answer, including negative replies. This made the provenance list broader than the evidence used by the trigger.
- Replaced the static list with a resolver that includes the examination-history answer and only symptom answers whose values contributed to the positive experience count.
- Added two regression scenarios using different positive symptom pairs; each asserts that both supporting answers are cited and that negative answers are excluded.
- Verified on exact main commit 8f44a9ccbfb8ff7d1b424b07153daf7878dbb681: **967 regression tests, 2,524 quality checks, clinical-language audit passed (22 JSX / 2,629 fragments), production build passed (100 modules; initial JS 345.09 kB / 105.99 kB gzip; Report 151.94 kB / 33.18 kB gzip; Amsler 21.91 kB / 5.69 kB gzip; PWA 34 entries / 980.47 KiB), and review export passed (965 lines reported, 8 pattern definitions, 4 Ramesh matches, 10 discussion prompts, 2 follow-up notes).**
- This exact source revision is verified in an isolated sandbox. Vercel production deployment remains subject to its build-rate-limit status; do not claim this revision is live until a READY deployment exists.


### Change 19 — Production deployment recovered
- Vercel's earlier build-rate-limit cleared. Application-code commit `8f44a9ccbfb8ff7d1b424b07153daf7878dbb681` reached READY in deployment `dpl_Fi9MYjTSrgSNTXw8WpAkqNitpRpd`.
- The subsequent documentation commit `4d09c8be02d84e4399c02b4a601290723fe575bb` also reached READY in production deployment `dpl_4hPiACBGmQzwxDpji7azb2fnQHa2`; this deployment includes the application code from `8f44a9cc...`.
- GitHub Vercel status for `4d09c8be...` is SUCCESS. Deployment build logs show `npm run build` -> `npm run check`, quality audit 2,524 passed, clinical-language audit passed, 100 modules transformed, Vite build completed, and PWA generated 34 entries / 980.47 KiB. The exact-source isolated run at `8f44a9cc...` confirms 967 engine tests and review export success.
- Live production requests to `/`, `/report`, `/activities` and `/amsler` return HTTP 200; the SPA HTML references `/assets/index-B73cZCMz.js`, confirming the new entry bundle is served. This is not a browser-interaction, screenshot, print-layout or clinical validation pass.
- This supersedes the earlier entries noting that the new code had not yet deployed or that Vercel remained build-rate-limited.


### Change 20 — Final deployment and baseline metric reconciliation
- Updated the baseline, README and review findings to use the exact final Vite gzip metrics (entry 345.09 kB / 105.99 kB gzip; Report 151.94 kB / 33.18 kB gzip) and the latest READY production deployment.
- Latest READY production deployment is `dpl_BULeMmr3mi7Byqr39j2aezTwaiUn`, main commit `f4aa4ef6...`, a documentation-only commit that follows application-code commit `8f44a9cc...`. GitHub Vercel status is SUCCESS. This supersedes `dpl_4hPi...` as the latest deployment record; both contain the same verified app code.


### Change 22 — Amsler saved-cell normalization
- A review of the evidence pathways found that spatial analysis assumed every saved Amsler cell was a valid object with integer row/column coordinates. Malformed local-session data could throw during analysis; duplicate or out-of-range records could also make counts disagree between the report and appointment pack.
- Added `normalizeFlaggedCells` to retain only unique integer coordinates inside the 20×20 grid. Added `getFlaggedCellCount` so the detailed report, spatial analysis and printable pack use the same validated cells. Count-only records from older saved sessions remain supported only when no `flaggedCells` field exists.
- Added regression checks for null/non-array collections, duplicate cells, negative and out-of-range coordinates, fractional/NaN coordinates, stale counts, malformed left-eye data in the appointment pack, and spatial text/count consistency.
- Verified exact main commit `088e3cd9bd610bc9fd1622bb22a00c97f13d4f16`: **980 regression tests, 2,525 quality checks, clinical-language audit passed (22 JSX / 2,629 fragments), production build passed (100 modules; entry 345.09 kB / 105.99 kB gzip; Report 151.62 kB / 33.11 kB gzip; Amsler 21.91 kB / 5.69 kB gzip; 34 PWA precache entries / 980.63 KiB), and review export passed (965 lines reported; 8 pattern definitions; 4 Ramesh matches; 10 prompts; 2 follow-up notes).**
- Application commit `088e3cd9...` reached READY in Vercel deployment `dpl_BxHTVeosVERn2wpv8s7BQfh5qAU3`; GitHub Vercel status SUCCESS. This is deployment evidence, not a browser/print/device validation pass.

### Change 23 — Vision Evidence Pathways (Phase 3)
- Added `src/engine/visionEvidencePathways.js`, a deterministic bilingual layer that constructs source-traceable Relationships A–E from current participant answers and participant-authored timeline entries.
- Relationship A records each selected experience and its own specific context. Relationship B displays the main reported experience/context and separately reported activity-impact evidence with original answer IDs; it explicitly states that the questionnaire does not establish a one-to-one mapping from activity impact to a particular experience/context.
- Relationship C adds the single new inference type: two distinct selected experiences are connected only when each has the same concrete, participant-selected context. The non-specific `varies` value cannot create an experience-context or shared-context relationship.
- Relationship D pairs a participant timeline entry with its matching questionnaire onset answer, while explaining that the timeline date is the date the participant entered the record, not a medically determined onset date.
- Relationship E identifies unanswered follow-up fields only when the current questionnaire actually asks them. It does not ask for eye-side on headaches or a separate headache frequency answer, and it does not produce gaps for unselected experiences.
- Added the bilingual responsive/print component `VisionEvidencePathways.jsx` to the detailed Report, Clinician Brief and Appointment Preparation Pack. Pathway cards expose the source answer labels/values/IDs and timeline record IDs. No numeric confidence, severity or risk scores are introduced.
- Updated the scripted Ramesh demo (not real participant data) to demonstrate blurred vision and low-light difficulty sharing a driving context, with selected secondary details left unanswered to demonstrate Relationship E. The night-vision pattern uses the secondary experience's own context answer rather than borrowing the primary context.
- Extended `scripts/export-prompts.mjs` with bilingual relationship explanations, exact source IDs, timeline IDs, missing-field lists and explicit limitations for clinical review.
- Added regression coverage for all relationship types, source-ID validity, match/no-match, distinct experience selection, non-specific contexts, asked-vs-unasked gaps, bilingual wording, activity impact caveats, timeline/onset distinction and stable activity IDs.
- **Exact tested application commit:** `636ae40629e2017373d330b18b0b836a8e59174d`. Full clean-sandbox verification: **1,044 regression tests**, **2,555 quality checks**, clinical-language audit passed (**23 JSX files / 2,767 fragments**), production build passed (**103 modules; entry 346.46 kB / 106.33 kB gzip; Report 174.63 kB / 38.73 kB gzip; 34 PWA entries / 1,007.61 KiB**), review export passed (**1,187 lines; 8 patterns; 5 Ramesh matches; 10 prompts; 2 follow-ups**).
- **Not yet deployed:** Vercel's GitHub check on this source revision reports a build-rate-limit failure. The latest READY production deployment is still the earlier Phase 2 application revision. Browser screenshots, visual print-preview, real-device and independent clinical review remain release gates.



### Change 12 — Scope Clinician Brief print-page settings
- Source review found the component stylesheet declared an unqualified `@page` rule, which unintentionally applied its A4 size and 6 mm margins to other report print paths when the stylesheet was imported.
- Replaced the global rule with named `@page clinicianBrief` and assigned that named page to the brief's print `<main>` only.
- Added two quality-audit assertions for named-page scoping and absence of a global `@page` declaration.
- Browser walkthrough: Ramesh demo progressed through seven guided answers to Report; no console/page errors. Clinician Brief opened, focus moved to Close, body print class applied, Chromium generated a one-page A4 PDF, Escape closed the modal and restored the body class. Real-device/print-preview checks remain pending.
- Verification on local sandbox checkout of main `ab9734412c2b85ea8c2d84906f1619f6176df34d` plus uncommitted correction: `npm run audit` 2,558 passed; `npm test` 1,044 passed; `npm run clinical-lint` 23 JSX files / 2,771 fragments passed; `npm run build` 103 modules passed; `npm run export-review` 1,187 lines passed; `git diff --check` passed.
- Dependency installation: `npm ci` passed (349 packages added / 350 audited); four moderate dependency advisories remain in the PWA toolchain.
- Initial upload commit: `983520c6ee403e981a451da0953791784cd4ed04` was superseded after its remote review-file blob was corrupted. Corrective commit: `3983af07d0a6a1bb5796b2146b4702b66adce108` restores complete source and documentation.


### Phase 4 initial fix — close accessibility panel on navigation
- Source inspection confirmed the global accessibility `<details>` panel persisted across route changes because it is mounted outside the route tree and only closed on Escape or outside pointer input.
- Added a React Router location-key effect that closes the panel after navigation, preventing it from covering a newly opened page.
- Added a static quality-audit regression assertion. A direct browser interaction test for this specific change is pending because the Vercel sandbox quota prevented creating another sandbox; production build logs will be checked.


### Phase 4 verification update — F-20
- Vercel production build for `d61758b944ff36c5fba3b7f3577f368449f7b1fa` reached READY (deployment `dpl_G5LazPYhmWy3kCPHMziLMSPdnJU6`, aliased to `sightsteps.vercel.app`).
- Build checks: quality audit **2,559 passed**; regression tests **1,044 passed**; clinical-language audit passed (**23 JSX files / 2,771 fragments**); Vite **103 modules transformed**; PWA **34 precache entries (1,013.43 KiB)**.
- The live production URL returned HTTP 200 after deployment. This validates deployment and the SPA shell, not the route-panel interaction itself.
- Direct browser test of F-20 remains pending due sandbox snapshot-storage limit; no claim of visual or interaction validation is made for that change.


### Phase 4 — F-21 Amsler grid keyboard navigation
- Confirmed that the 20 × 20 Amsler region selection exposed 400 tab stops; this made keyboard traversal unnecessarily long and made the dedicated row/column fallback difficult to reach.
- Added roving focus to keep exactly one grid cell in the tab sequence. Arrow keys move between adjacent cells without wrapping; Home and End move to the first and last cell of the current row. The active cell retains native button behavior for Space/Enter and its pressed state.
- The grid now announces its 20 × 20 structure and movement keys, restores focus on test entry and eye change, and retains the existing row/column input method.
- Added pure navigation helper `src/utils/gridNavigation.js`, ten regression assertions, and three quality-audit checks.
- Commit: `06a7fa0ae3419c3a8565f83fae35f44632198855`.
- Vercel verification: quality audit **2,563 passed**; regression suite **1,054 passed**; clinical-language scan **23 JSX files / 2,774 fragments** with no violations; production build **104 modules**; PWA **34 precache entries (1,014.73 KiB)**. Production deployment `dpl_HVN2rqsztHG8JoGCBeVE7ZhYLvTD` reached READY and `https://sightsteps.vercel.app` returned HTTP 200 with the new asset.
- Limit: the sandbox snapshot quota prevented direct browser/assistive-technology verification of arrow-key navigation. This remains a device-level validation item; automated helper tests and production build passed.


### Phase 4 — F-22 and F-23 verification
- F-22: Keep the ruler slider enabled when the selected calibration width does not fit, provided the minimum supported slider width does fit. Continue remains gated by the selected width. Added a viewport regression assertion for 600 × 450 px (150 px fits, 300 px does not).
- F-23: Reserve the accessibility control's 52 px header space for `.amsler__topbar-counter` as well as questionnaire and direction-activity counters. Added a quality-audit assertion for the selector.
- Commit: `d05387b6e1bdc28599f16f4d4b8327bb964ed4ef`.
- Production deployment: `dpl_9uZwVLLNcJHVu1xuhjHEcmzPeQoR` — READY, aliased to `sightsteps.vercel.app`.
- Verification on that exact deployment: quality audit **2,565 passed**; regression tests **1,055 passed**; clinical-language scan **23 JSX files / 2,774 fragments** passed; Vite **104 modules transformed**; PWA **34 precache entries (1,014.77 KiB)**. Live root HTTP 200; production CSS asset confirmed to contain the new Amsler counter selector.
- Remaining verification boundary: no direct browser/device check was possible for F-22/F-23 because the Vercel Sandbox Snapshot Storage quota was exceeded. The slider recovery and header spacing are source-checked and automated-build-checked, but not visually validated on physical mobile devices.


### Phase 4 — F-24 pointer/keyboard focus continuity and F-25 kiosk cleanup hardening
- F-24: pointer taps now update the Amsler roving-focus cell even on touch browsers that do not automatically focus the clicked native button. Added a quality-audit assertion. Deployment `dpl_5dXbj8NcyYG1fVvEHAfEZsdeBLA6` (commit `44c1ed1f65bb49cfdc70adcfa9eafc9f9c5403e6`) reached READY; quality **2,566 passed**, regression **1,055 passed**, clinical scan **23 JSX / 2,774 fragments**, Vite **104 modules**, PWA **34 entries (1,014.79 KiB)**.
- F-25: cleanup failure in shared-device mode previously left old participant data in memory in several exit paths. A reusable `markKioskCleanupFailed` action now clears the in-memory participant and sets the existing blocking cleanup flag. It is invoked by KioskGuard timeout, KioskSetup start, Landing's end-kiosk flow, and Report's finish/reset flow when in kiosk mode. All protected participant routes now redirect to `/kiosk?clearError=1` if cleanup has failed.
- Added one regression test: an otherwise complete, consented participant session with profile/answers/vision results cannot reopen Report once `kioskCleanupFailed` is true. Added quality-audit assertions for the four failure paths and protected-route enforcement.
- F-25 commit: `86ab9d8d45e5731d8a6d03b5fd4f2f96021417d3`.
- Production deployment `dpl_Bj3i3UT1agdAdsgqieM9EhxBDJ4b` reached READY and is aliased to `https://sightsteps.vercel.app`. Exact checks: quality **2,568 passed**; regression tests **1,056 passed**; clinical-language scan **23 JSX files / 2,774 fragments**, no violations; Vite **104 modules**; PWA **34 precache entries (1,015.05 KiB)**. Production root returned **HTTP 200** and serves `index-DBJQfr6s.js`.
- Browser failure-injection test for an IndexedDB deletion failure remains pending due Vercel Sandbox Snapshot Storage quota. Automated routing regression, static audit and production build passed; no manual browser/assistive-technology claim is made.


### Phase 4 — F-26 voice-note asynchronous lifecycle hardening
- Guarded all four browser speech-recognition lifecycle callbacks (`onstart`, `onresult`, `onerror`, `onend`) against stale recognizer instances, preventing an older capture from overwriting the current one after a rapid stop/restart.
- Manual text edits now clear stale voice status. On unmount, the component first invalidates the current recognition reference and then stops it, ensuring the browser's delayed `onend` cannot update an unmounted component.
- Added three source-audit assertions for stale-callback checks, manual-edit status reset, and unmount invalidation.
- Final application commit: `fc2408ad1cacb2959f12520c50dc2654738e3500`.
- Vercel production deployment `dpl_4yACz5HTwWWnkE2qF5imqteVRM4K` reached READY and is aliased to `sightsteps.vercel.app`. Exact checks: quality **2,571 passed**; regression **1,056 passed**; clinical language **23 JSX / 2,774 fragments** passed; Vite **104 modules**; PWA **34 precache entries (1,015.19 KiB)**. Live root HTTP **200** and served `index-BhcLV8q3.js`.
- Direct microphone permission/device testing remains pending due Vercel Sandbox Snapshot Storage quota. No browser-level voice test is claimed for F-26.


### Phase 4 — F-27 Clinician Brief modal isolation
- Source review found the Brief overlay at z-index 200 underneath the fixed skip link (2000) and Accessibility settings (1500). The old inert scope covered only local Report siblings, not app-level global controls.
- Increased modal stacking to z-index 2200. On open, the effect now gathers local siblings plus `.app` children outside the branch containing the dialog, stores each element's original `inert` and `aria-hidden` state, and restores those values on close. Focus trap, Escape handling, previous-focus restoration and named print-page behavior remain unchanged.
- Added two quality-audit assertions for the modal stacking order and the app-level inert background.
- Commit: `e6148c7101d27b9b28e3b0608fb3dbb95e026510`.
- Vercel deployment `dpl_BYn8DmR9VaMXuMFbS1DU7CEyqfdh` reached READY, production alias `sightsteps.vercel.app`. Exact checks: quality **2,573 passed**; regression **1,056 passed**; clinical language **23 JSX / 2,774 fragments** passed; Vite **104 modules**. Live root **HTTP 200**, serving `index-5HL5_vzL.js`.
- Direct browser/keyboard/screen-reader test remains outstanding because Vercel Sandbox Snapshot Storage is over the Hobby limit. The modal is source- and build-verified, not visually or assistive-technology validated after this change.


### Phase 4 — F-28 custom activity relabeling
- Fixed the Activity Profile edit path for participants who rename `Other` after already marking it as an affected activity. Previously the `affected_activities` values remained correct, but the saved answer label was regenerated from static option strings and could display “Other” instead of the participant's new name.
- Added `getAffectedActivityLabels(activityIds, customActivityName)` as the single bilingual label helper. The profile calls it with the updated local custom name before persisting the revised answer label.
- Added two regression assertions for bilingual combined labels and one static audit assertion for the profile integration.
- Commit `bd3c16c6f7be7656e1a729afa934a0474485413e`; Vercel deployment `dpl_HfnXD5Tz6Jtj3G7iMUFxwxRKrh8c` READY and aliased to `sightsteps.vercel.app`.
- Verification: quality **2,574 passed**; regression **1,058 passed**; clinical language **23 JSX / 2,774 fragments** passed; Vite **104 modules**; live root **HTTP 200** with `index-CFKY3dkv.js`.


### Phase 4 — F-29 to F-31 follow-through
- F-29: Added explicit regression coverage for secondary-experience backtracking in both main-concern arrangements (eye-question anchor and headaches/context anchor). The tests prove downstream secondary onset/context answers clear together when returning to the anchor, while already-completed secondary answers remain intact when navigating within later static questions. Production deployment `dpl_6uf1UaVbVeedwULoC4k23qx3aHGy` for commit `396542711925e74d18419902059cff4effa09486` reached READY; quality 2,574, tests 1,064, clinical 23 JSX / 2,774 fragments, 104 modules, PWA 34 entries.
- F-30: `VisionTimeline` now focuses the editor heading when an existing entry is selected for editing. The focus heading is programmatically focusable (`tabIndex="-1"`). Draft reset also clears stale status and delete-confirmation state. The first quality assertion failed because it expected `tabIndex={-1}` rather than the actual JSX string attribute `tabIndex="-1"`; corrected in commit `16b52f1f12e069c908d942d2835e314c64dd9393`.
- F-31: Broadened GitHub Actions clinical-review verification triggers to all `src/**` and `scripts/**`, plus package, Vite and entry HTML changes. This closes the gap where UI-only changes were not running the same audit/test/build/export gate. Commit `f677b1845614604f7872634ddc16f70634b0fb71` triggered GitHub Actions run `45630774512`, conclusion SUCCESS.
- Exact successful CI output for `f677b1845614604f7872634ddc16f70634b0fb71`: **2,577 quality checks**, **1,064 engine tests**, clinical-language audit **23 JSX / 2,774 fragments**, Vite **104 modules**, PWA **34 entries (1,015.65 KiB)**, review export **1,187 lines**. Artifact ID `15029149424`.
- Production deployment clarification: the manual Vercel deployment API hit its daily quota, but the Git-connected pipeline automatically deployed application commit `16b52f1f12e069c908d942d2835e314c64dd9393` as `dpl_B6cJn68sqAv3uGAvd9HuAjQSexe3` — READY, alias `sightsteps.vercel.app`; live root serves `index-BYhLY47v.js`. Exact Vercel checks: quality **2,577**, regression **1,064**, clinical **23 JSX / 2,774 fragments**, Vite **104 modules**, PWA **34 entries (1,015.65 KiB)**. Subsequent `f677b184...` and `98854457...` commits change only CI configuration and documentation, so deployed application code matches current `main`. Direct browser interaction testing remains pending due sandbox quota.

### Final pre-submission close-out — 25 November 2026

- Exact revision inspected: fbc57865af97fc606ed0a2d139d4662428e8e1bc on main. Working tree was clean before the Amsler close-out changes. Node v24.22.3, npm 11.19.1; npm ci passed (349 packages; four moderate dependency advisories remain).
- Phase 0 — Baseline/source inventory: COMPLETE. Verified actual package scripts, project structure, CI workflow and deployment history. Baseline commands ran on the exact main checkout.
- Phase 1 — Safety and clinical credibility: TECHNICAL WORK COMPLETE; EXTERNAL VALIDATION OPEN. Rechecked the eight reviewer findings. Added a bilingual Amsler participant notice explaining that card matching is an approximate setup aid and does not independently verify physical screen scale, browser zoom or screen viewing setup. Added Hindi unsafe-claim, uppercase and punctuation-separated mixed-copy fixtures without broadening the clinical-language allowlist.
- Phase 2 — Pattern/reasoning correctness: COMPLETE FOR AUTOMATED SOURCE VALIDATION. Eight patterns and three clusters remain bounded; context is tied to the relevant reported experience; source IDs, missing/no-match handling and cluster membership safeguards remain regression covered. No confidence, probability, severity or risk scores were added.
- Phase 3 — Vision Evidence Pathways: IMPLEMENTED AND SMOKE VERIFIED. Five pathway types A–E appear in Report, Clinician Brief, Appointment Preparation Pack and review export. Ramesh demonstrates blurred-vision and low-light experiences connected only by the participant-selected driving/travel context. Original source answer IDs are displayed and the copy explicitly says this is not a shared cause or clinical conclusion.
- Phase 4 — Application flow/design/accessibility: AUTOMATED + HEADLESS SMOKE VERIFIED; FULL ACCESSIBILITY VALIDATION OPEN. Headless Chromium checked Landing, the seven-question Ramesh flow, Report, source-linked pathway, Clinician Brief dialog semantics/focus/inert background and no horizontal overflow at 390 px. Appointment Pack print mode and window.print invocation were intercepted. Actual printer output, page count and screen-reader testing remain open.
- Phase 5 — Kiosk/data safety: IMPLEMENTATION + REGRESSION VERIFIED; REAL IDLE-TIME EXERCISE OPEN. Five-minute timeout, reload cleanup and cleanup-failure blocking paths remain covered by code and regression tests. This session did not wait five real minutes or inject IndexedDB deletion failure in a physical browser.
- Phase 6 — Demo/submission evidence: PARTIALLY VERIFIED. Ramesh’s guided flow successfully reached Report through all seven answers. Review export contains five Ramesh pattern matches, ten discussion prompts and two follow-up notes. Ramesh skips optional vision activities, so E Direction Awareness and Amsler must be demonstrated separately.
- Phase 7 — Participant continuity expansion: initially deferred during the first baseline pass; the bounded local session-history slice was subsequently implemented on 25 November 2026. See the Phase 7 implementation section below. Identity-linked profiles, cloud sync, cross-device history and clinician document storage remain out of scope.
- Final exact-source checks: quality 2,588, regression 1,064, clinical-language audit 23 JSX / 2,777 fragments, Vite 104 modules, PWA 34 entries / 1,016.82 KiB, review export 1,192 lines. Full npm run build passed.
- Remaining release gates: first formal expert review; real-device Amsler scale/viewing validation; assistive-technology testing; actual print preview/page count; real five-minute kiosk idle and IndexedDB failure injection. None is represented as completed.


## Phase 7 — Bounded local participant session continuity (25 November 2026)

- Reused the existing IndexedDB `sessions` store and `sessionId` key path; no database-version migration was required.
- `saveSession` now retains the newest 10 records rather than deleting every superseded session. History summaries include only consented, non-demo, non-kiosk participant records.
- Landing now lists saved sessions, supports resuming a selected record and deleting an individual record, and states clearly that the history is local to the current browser/device.
- Ordinary session reset archives the latest-session pointer while retaining the record. Selecting a history record restores the pointer. Individual deletion removes only the selected record. Kiosk setup, kiosk exit and kiosk cleanup failure paths explicitly clear all session records and metadata.
- Updated the bilingual consent text to disclose the 10-record local retention behavior, lack of encryption/account sync, and how records can be deleted.
- Added bounded-history policy tests and `fake-indexeddb` transaction tests for 12-record retention, pruning, load by ID, latest-pointer behavior, archive, resume selection, demo exclusion, individual deletion, and write-queue/full-wipe ordering.
- Automated implementation and code gates pass; browser interaction testing could not run in this environment because the installed `chromium-browser` command is only a Snap launcher and the Snap browser is absent.
- Scope remains local session continuity, not identity-linked multi-person profiles, cloud sync, clinician document storage, or cross-device accounts.


## Current phase disposition — 25 November 2026

- Phase 0: COMPLETE.
- Phase 1: IMPLEMENTATION COMPLETE; external clinical review and real-device/clinical sign-off remain OPEN.
- Phase 2: COMPLETE FOR AUTOMATED SOURCE VALIDATION.
- Phase 3: IMPLEMENTED; source-linked evidence pathways and exports remain non-diagnostic by design.
- Phase 4: IMPLEMENTED AND AUTOMATED-VERIFIED; full screen-reader/assistive-technology and physical print checks remain OPEN.
- Phase 5: IMPLEMENTED AND REGRESSION-VERIFIED; an actual five-minute physical-device idle exercise and injected real-browser IndexedDB deletion failure remain OPEN.
- Phase 6: RAMESH GUIDED DEMO AND REVIEW EXPORT VERIFIED; separately demonstrating E Direction Awareness and Amsler in the live UI remains to be recorded.
- Phase 7: BOUNDED LOCAL SESSION HISTORY IMPLEMENTED AND FAKE-INDEXEDDB TRANSACTION-TESTED; identity-linked profiles, cloud sync, and cross-device history remain OUT OF SCOPE.

A passing build or automated test is not a substitute for the listed clinical, screen-reader, printer, or physical-kiosk exercises.

## Ordered continuation and Phase 7 privacy close-out — 26 November 2026

### Confirmed Phase 7 regression: history-consent hydration

- Source review found that HYDRATE restored consentGiven but omitted historyConsentGiven. The subsequent autosave could therefore overwrite an explicit saved-history choice as false; ending the session could then delete an otherwise consented history record.
- Fixed in commit a458ca128bee5ad41daef0b75eb0295bd0aab6ed: restore historyConsentGiven from IndexedDB and include it in autosave dependencies.
- Added a persisted-record regression assertion and two quality-audit assertions.
- CI run 45686246249 completed SUCCESS on that exact commit: quality audit 2,609; engine tests 1,064; session-history policy 10; IndexedDB 42; clinical-language audit 23 JSX / 2,807 copy fragments; Vite production build 105 modules; PWA precache 34 entries.

### Explicit opt-in for completed-session retention

- The previous onboarding accepted the main consent action while automatically enabling history retention. Updated onboarding to present a separate, optional, unchecked-by-default history checkbox in English and Hindi.
- Active-session saving for resume remains disclosed. Only completed-session retention requires the explicit history opt-in. If declined, the active record is removed when the participant starts a new journey. Kiosk mode does not display the history option and continues to clear the complete store.
- The app state now defaults new sessions to historyConsentGiven: false; onboarding passes the participant's explicit choice, and storage/history filters retain the existing 10-record limit.
- Added a storage assertion for a session that opts out: it can be resumed while active, is not exposed in saved history, cannot be selected from the saved-history list, and is deleted when ended.
- Updated consent copy, accessible description, onboarding styles and README.
- Commits: 22e494c1ba5592f6d08e1ac769f223c5d76b0a43, 44aafd041bca7adef3fcf32e3a3197ab7f454b9b, 634d5d1a72abe2584162e000effacd713f541971, and documentation update 58abb9c68d77294c7f88966b908130bb19b195c5.
- The first two CI attempts exposed issues in the new audit assertion itself (declaration order, then stale copy expectation). Both were corrected; the final workflow run 45686841938 completed SUCCESS on 634d5d1a72abe2584162e000effacd713f541971.
- Final successful CI result: quality audit 2,631 passed / 0 failed; engine regression suite 1,068 passed / 0 failed; session-history policy 10 passed / 0 failed; IndexedDB 42 checks passed / 0 failed; clinical-language audit 23 JSX files / 2,816 fragments, no violations; Vite production build 105 modules; PWA precache 34 entries (1,030.31 KiB); bilingual clinical-review export 1,192 lines, with 8 pattern definitions, 5 Ramesh matches, 10 discussion prompts and 2 follow-up notes.

### Deployment and remaining release gates

- Latest production deployment: dpl_2J13SKRPTqy5FGHfR7tytcizWSt3, READY, associated with current main commit 58abb9c68d77294c7f88966b908130bb19b195c5; production alias https://sightsteps.vercel.app.
- Live root request returned HTTP 200 and served the updated Vite asset bundle. This validates the deployed SPA shell, not browser-level interaction of the new consent checkbox.
- Browser desktop verification could not be performed because Vercel Sandbox creation returned HTTP 402: Hobby plan snapshot-storage quota exceeded. No browser/visual test is claimed for the newly added consent checkbox.
- Still open: real-device Amsler physical scale/viewing-distance/tap validation; full screen-reader/assistive-technology review; real printer/page-count check; a real five-minute kiosk idle exercise; browser-level IndexedDB deletion-failure injection; separate E Direction and Amsler walkthrough evidence; and first formal optometrist/ophthalmologist review.
- Phase 7 remains deliberately bounded to consent-based, local, 10-record session history. Identity-linked profiles, cross-device accounts, cloud sync and a clinician document repository were not added because the handoff requires an explicit data model and participant/kiosk separation before such an expansion.

### Dependency-audit limitation

- The CI artifact reports four moderate findings in the development/build-time PWA toolchain: glob@11.1.0, minimatch@10.2.6, workbox-build@7.4.1, and vite-plugin-pwa@2.0.0. No high or critical findings were reported.
- The advisories currently identify fixes at glob@14.0.2 and minimatch@11.0.1; current Workbox build dependency ranges still resolve the older major lines. A forced transitive override or PWA-plugin downgrade was not applied because compatibility was not proven. References: https://github.com/advisories/GHSA-3g3m-2fjr-6pw4 and https://github.com/advisories/GHSA-g3hv-75wg-m249.
- Treat this as a pending build-toolchain dependency update, not as a verified production-runtime exploit. Reassess when compatible Workbox/PWA releases are available.

## Phase 6 — Separate activity-inclusive demonstration path (26 November 2026)

- The original seven-question Ramesh demo intentionally sets skipVision=true and proceeds directly to the report. To avoid implying that this short walkthrough demonstrates optional activities, Landing now exposes a second scripted Ramesh variant that shares the same seven questions, participant answers, activity profile and timeline but continues into Direction Awareness.
- The Direction Awareness flow retains its existing Amsler continuation action. Participants/evaluators can now select the activity-inclusive demo, complete the E activity, and open the optional Amsler flow without changing the original short report-first demo.
- Both variants continue to use scripted demo data and remain excluded from participant saved history. No activity result is represented as a real measurement or clinical validation.
- Added scripts/demo-flow-test.mjs with 9 checks for unique guided questions, both demo modes, shared answers/activity/timeline data and the intended skip/continue distinction. Added quality-audit checks for Landing's two paths and the E-to-Amsler navigation; added the new test to npm test and described both demo modes in README.
- Final workflow run 45688025235 on commit 7e59c9c289150d3e1943c9836268f10ecaa44b56 completed SUCCESS: quality 2,634 passed / 0 failed; engine tests 1,068 passed / 0 failed; session-history policy 10 passed / 0 failed; IndexedDB 42 passed / 0 failed; demo walkthrough policy 9 passed / 0 failed; clinical-language audit 23 JSX files / 2,824 fragments, no violations; production build passed; PWA precache 34 entries (1,031.17 KiB); clinical review export 1,192 lines with 8 patterns, 5 Ramesh matches, 10 discussion prompts and 2 follow-up notes.
- Production deployment dpl_HU1UcU3nvVpRr9jDMaRAGkATHwWu is READY for the exact source commit and aliased to https://sightsteps.vercel.app. Live root returned HTTP 200; the deployed main bundle includes the English and Hindi activity-inclusive demo labels.
- Browser interaction testing of the new selection and completing E/Amsler remains pending. The desktop/browser environment could not be started because Vercel Sandbox returned HTTP 402 for the Hobby snapshot-storage quota, and the local container could not resolve github.com to clone the repository. Do not claim a manual UI walkthrough for the new path.

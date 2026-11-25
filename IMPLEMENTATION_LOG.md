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

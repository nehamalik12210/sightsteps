# SightSteps — Baseline Record

**Baseline commit reviewed:** `2731d987bc3f5457b2124cdf67e9d758a5bbb049`  
**Historical application-code verification commit:** `723c3c5a29abf31295fb77e8083564b48a53c156`  
**Route-splitting application commit:** `38b7e7132593d72fa64be23a303a312a2a3697a2`  
**Latest verified application-code commit:** `636ae40629e2017373d330b18b0b836a8e59174d`  
**Latest READY production deployment containing a previously verified application revision:** `dpl_BxHTVeosVERn2wpv8s7BQfh5qAU3` (READY; `main`; application-code commit `088e3cd9...`; production alias `https://sightsteps.vercel.app`). The Phase 3 source commit below is newer and is **not yet deployed**; its Vercel status currently reports a build-rate-limit failure.  
**Branch:** `main`  
**Date:** 25 November 2026

## Project shape

- React 19 + Vite 6 PWA; React Router 7.
- Source areas: pages, components, context, data, engine and utils.
- Core domains: participant questionnaire, response/rule summaries, inferred discussion patterns, Amsler self-monitoring activity, vision-experience timeline, appointment preparation pack, clinician brief, bilingual English/Hindi UI, local persistence, kiosk mode, accessibility and offline status.
- Assets include app icon/logo and PWA manifest/service-worker configuration.

## Commands

- `npm run audit`: dependency-free quality checks.
- `npm test`: deterministic engine and utility regression tests.
- `npm run clinical-lint`: clinical-language and rendered-copy audit.
- `npm run check`: audit + tests + clinical lint.
- `npm run build`: check + Vite production build.
- `npm run export-review`: writes `exports/clinical-review-export.txt`.

## Historical route-splitting production build evidence (commit 5d964fc5...)

The figures in this section are from the earlier route-splitting deployment. They are retained as a historical comparison; the latest verified application build and metrics are in the section below.

Vercel deployment `dpl_BxnNfeW8HBBhuXxQrg7UQTzoJDQf` for commit `5d964fc5ab2311e612a2ffe0c1db1bf65b131cf0` completed READY:
- Quality audit: **2,522 passed, 0 failed**. The audit now resolves relative paths from both static imports and literal dynamic `import()` calls; explicit checks cover all nine lazy-loaded page routes and the loading/focus handoff.
- Engine regression suite: **849 passed, 0 failed**.
- Clinical-language audit: passed; **22 JSX files and 2,625 copy fragments** scanned. The nested-component discovery fixture executed and passed.
- Vite: **100 modules transformed**.
- Route splitting reduced the initial JavaScript chunk from 581.00 kB minified (158.01 kB gzip) to **344.80 kB (105.91 kB gzip)**, a 40.6% reduction in minified entry size. The largest page chunk is Report at 147.38 kB (32.22 kB gzip); AmslerGrid is 21.91 kB (5.69 kB gzip). No emitted JavaScript chunk exceeds Vite's 500 kB warning threshold.
- PWA service worker generated **34 precache entries (975.74 KiB)**. The split assets remain included in the precache, preserving the existing precache-based offline strategy; this does not mean the initial page downloads every page chunk at runtime.

## Previous Phase 2 source checks — 25 November 2026

**Exact application-code revision:** 088e3cd9bd610bc9fd1622bb22a00c97f13d4f16 on main. The repository was checked out at this SHA in an isolated Vercel sandbox; the same application commit is READY in production.

**Execution environment:** Node.js v22.23.5; npm 10.9.9. npm ci completed successfully (349 packages added; 350 audited). npm reported four moderate dependency advisories in the existing PWA build chain; they remain tracked above.

- git diff --check: passed; checkout was clean after resetting to the exact main SHA.
- npm test: **980 passed, 0 failed**.
- npm run audit: **2,525 passed, 0 failed**.
- npm run clinical-lint: passed; **22 JSX files / 2,629 copy fragments**, no violations.
- npm run build: passed; 100 modules transformed. Initial JS entry **345.09 kB (105.99 kB gzip)**; Report chunk **151.62 kB (33.11 kB gzip)**; Amsler chunk **21.91 kB (5.69 kB gzip)**. PWA generated **34 precache entries (980.63 KiB)**. The build reruns the three checks above.
- npm run export-review: passed; exporter reports **965 lines**, 8 pattern definitions, 4 matches for scripted Ramesh, 10 discussion prompts and 2 follow-up notes. The exporter now resolves function-based source keys using the same helper as runtime pattern evaluation.

**Deployment status:** the build-rate-limit cleared. The latest production deployment is READY as dpl_BxHTVeosVERn2wpv8s7BQfh5qAU3 for application commit 088e3cd9...; the GitHub Vercel status is SUCCESS. The deployment includes the Amsler grid normalization, report-count consistency and regression tests described above. A READY state confirms deployment completion, not a browser-interaction or visual-validation pass. The Phase 2 provenance regression also verifies that overdue-exam only cites the positive symptom answers that actually satisfied its trigger.

## Latest Phase 3 source verification — 25 November 2026

**Exact application-code revision:** `636ae40629e2017373d330b18b0b836a8e59174d` on `main`. A clean isolated Node.js 22.23.5 / npm 10.9.9 Vercel sandbox checkout ran the full validation and evidence-export pipeline.

- `npm ci`: passed; 349 packages installed, 350 audited. Four moderate dependency advisories remain in the existing PWA build toolchain; no forced override was applied.
- `git diff --check`: passed.
- `npm run audit`: **2,555 passed, 0 failed**.
- `npm test`: **1,044 passed, 0 failed**. Includes all five Evidence Pathways relationship types, source IDs, shared-context match/no-match, specific-context handling, temporal/onset links, missing-field logic, bilingual output, stable activity IDs and appointment-pack parity.
- `npm run clinical-lint`: passed; **23 JSX files / 2,767 copy fragments**, no violations.
- `npm run build`: passed; **103 modules transformed**. Initial JS entry **346.46 kB (106.33 kB gzip)**; Report chunk **174.63 kB (38.73 kB gzip)**; Amsler chunk **21.91 kB (5.69 kB gzip)**; PWA generated **34 precache entries (1,007.61 KiB)**.
- `npm run export-review`: passed; **1,187 lines**, 8 pattern definitions, **5 Ramesh matches**, 10 discussion prompts and 2 follow-up notes. The export includes bilingual relationship explanations, exact answer/timeline IDs and information-gap fields. An explicit sanity check confirmed there is no `activity-impact:undefined` ID.

**Phase 3 implementation summary:** Added the deterministic `visionEvidencePathways` engine, bilingual source-traceable output component and responsive/print styles. The full pathways are computed in the detailed Report; compact pathways appear in the Clinician Brief and Appointment Preparation Pack. The Ramesh demo now shows two distinct experiences (blurred vision and difficulty in low light) sharing the participant-selected driving context, plus unanswered secondary follow-up fields. Activity impacts are shown as separate participant evidence; the UI explicitly avoids assigning them to a particular symptom/context because the questionnaire does not collect that relationship. Timeline entries are shown beside their onset answer, with a clear distinction between participant entry date and medical onset.

**Deployment and visual-verification limits:** The GitHub Vercel status for `636ae406...` currently reports `build-rate-limit`; no READY deployment for this Phase 3 code has been verified. The latest READY deployment recorded above predates Phase 3. Browser-interaction screenshots, bilingual print-preview inspection, assistive-technology testing and independent clinical review remain outstanding. Do not describe Phase 3 as live or visually validated until those checks are completed.

## Clinical review export verification

- Added `.github/workflows/clinical-review-export.yml` to generate the review export from locked dependencies and upload it as a 14-day GitHub Actions artifact.
- Latest workflow run for commit `a83de5439cd04facbb3c967919c741373bfe8760`: run `45490205104`, conclusion SUCCESS.
- Generated export: 954 lines, 68,713 bytes, 12 correctly numbered sections.
- Export inspection verified 57 English source rows, each immediately paired with a non-empty Hindi source row; zero missing/mispaired/blank source pairs.
- Includes the bilingual draft/non-diagnostic cover notice, scripted Ramesh demo-data notice, synthetic custom “Other” activity scenario, bilingual source labels and answers, eight pattern descriptions, pattern clusters, rule-engine prompts, follow-up notes, Amsler wording, clinician brief, adaptive questions and participant-review copy.
- The same artifact contains `npm-audit.json`. Artifact ID: `14964948536`; retention 14 days (expires 8 December 2026).

## Verification limits

- Earlier repository work was inspected through GitHub's connected repository interface after a local clone attempt failed due to DNS/network resolution. The later exact-source verification recorded above used an isolated Vercel sandbox clone; it was not a production deployment.
- No local browser automation, printed-PDF page-count/visual inspection, responsive screenshot review, or physical Amsler device-calibration validation was completed in this work session. The available Vercel desktop sandbox did not include an installed browser, so it was not used to claim a visual pass.
- Production HTTP checks for `/`, `/activities`, `/report`, `/amsler` and `/kiosk` returned HTTP 200 and the Vite SPA shell. This confirms the Vercel rewrite responds for direct route requests; it does not execute the client-side app or verify interactive route behavior.
- The clinical review export and npm audit were generated and inspected as GitHub Actions artifacts, not as part of the Vercel app bundle.
- Historical deployments: route-splitting `dpl_FJdRtfhg8nUfoJdymcfCDSag4cUo` (commit `38b7e713...`), instrumented verification `dpl_BxnNfeW8HBBhuXxQrg7UQTzoJDQf` (commit `5d964fc5...`) and prior documentation build `dpl_Avq3t47vhCwKjqnVEofiGRxvK9pb` (commit `92a4d0da...`) reached READY. The current deployment is recorded at the top of this baseline. The latest deployment logs reconfirmed 2,522 quality checks and 849 regression tests with zero failures; the 5d964 verification logs also confirm the 22-file / 2,625-fragment clinical-language scan.

## Dependency audit details

The `npm audit` artifact reports four moderate findings, all in the development-time PWA build chain:
- `vite-plugin-pwa@2.0.0` (direct dev dependency) → `workbox-build@7.4.1` → `glob@11.1.0` → `minimatch@10.2.6`.
- `GHSA-3g3m-2fjr-6pw4` affects glob `>=9.0.0 <=14.0.1`; the advisory reports a fix in glob 14.0.2.
- `GHSA-g3hv-75wg-m249` affects minimatch `>=7.0.0 <11.0.1`; the advisory reports a fix in minimatch 11.0.1.
- The current Workbox dependency ranges require glob `^11.0.1` and minimatch `^10.1.1`, so the advisory fixed versions are outside the declared ranges. npm's `fixAvailable` suggestion points to `vite-plugin-pwa@1.1.0` and marks it as a major change even though the lockfile has 2.0.0; this appears to be a downgrade and has not been applied.
- Upstream Workbox issue [#3599](https://github.com/GoogleChrome/workbox/issues/3599) documents the same semver-range blocker for `workbox-build@7.4.1`; it was open when checked on 25 November 2026, and the discussion does not establish a released compatible fix for the complete dependency tree.
- Do not force `minimatch@11` into the current `glob@11` tree: Workbox issue [#3594](https://github.com/GoogleChrome/workbox/issues/3594) reports that this unsupported override can make `glob@11.1.0` return no matches and cause Workbox to generate an empty precache manifest on Linux. This is a separate compatibility report, not a failure of Workbox's default supported dependency tree.
- No `npm audit fix`, forced upgrade or dependency override was applied. Wait for compatible upstream dependency ranges or a properly tested supported release path; do not mask these advisories with a forced major downgrade or an unsupported minimatch override.

The dependency report is a build/development dependency audit, not evidence that these packages execute in the deployed browser bundle. Treat it as an outstanding supply-chain maintenance item, not as zero-risk.

## Safety boundary

SightSteps is a participant-reported conversation aid. Automated tests and wording lint do not establish clinical validity. Independent review by a licensed optometrist or ophthalmologist remains outstanding, especially for the Amsler activity, physical calibration, patterns and follow-up prompts.


## Latest source-review verification — 25 November 2026

- Checkout revision inspected: `ab9734412c2b85ea8c2d84906f1619f6176df34d` (main; clean before review changes).
- Dependencies installed in an isolated Vercel sandbox with Node 22 / npm 10: `npm ci` passed (349 packages; 350 audited; four moderate dependency advisories).
- After the Clinician Brief print-scope correction: quality audit **2,558 passed**; regression tests **1,044 passed**; clinical-language audit **23 JSX files / 2,771 fragments passed**; production build **103 modules passed**; review export **1,187 lines passed**; `git diff --check` passed.
- Browser verification (Chromium headless): Landing loaded without console/page errors; Ramesh demo advanced through seven guided answers to Report; Clinician Brief opened and focus moved to Close; print body class was set; PDF generation produced one A4 page; Escape closed modal and restored the body class. This is a scripted browser check, not cross-browser, assistive-technology, physical-device, or printer validation.
- Confirmed and fixed F-19: unscoped `@page` in the Clinician Brief CSS affected all print paths. The A4 page rule is now named and applied only to the brief container.
- Corrective commit `3983af07d0a6a1bb5796b2146b4702b66adce108` restores complete files after a remote upload truncation was detected. Deployment/live-commit verification is pending.


## Phase 4 — initial navigation UX fix (25 November 2026)

- Confirmed source issue F-20: global accessibility settings could remain open over a destination page after route navigation.
- Fixed with `useLocation` + location-key effect in `AccessibilityControls`; added a quality-audit assertion.
- Source diff review and automated deployment verification pending.


## Phase 4 initial navigation UX fix — verified deployment

- Fix: accessibility settings panel closes on route navigation (F-20).
- Commit: `d61758b944ff36c5fba3b7f3577f368449f7b1fa`.
- Vercel deployment: `dpl_G5LazPYhmWy3kCPHMziLMSPdnJU6` — READY, production aliases include `sightsteps.vercel.app`.
- Automated verification: quality audit **2,559 passed**; engine tests **1,044 passed**; clinical-language audit **23 JSX files / 2,771 fragments passed**; Vite **103 modules**; PWA **34 precache entries (1,013.43 KiB)**.
- Production root HTTP check: **200 OK**.
- Limit: direct browser interaction test for this new panel-close behavior remains pending because Vercel Sandbox Snapshot Storage is over the Hobby plan limit.


## Phase 4 — Amsler keyboard navigation fix (25 November 2026)

- Finding F-21: the 20 × 20 selection grid exposed 400 separate tab stops, forcing keyboard users to traverse each cell sequentially.
- Fix committed as `06a7fa0ae3419c3a8565f83fae35f44632198855`: roving `tabIndex` keeps one cell in the tab order; arrow keys move cell focus; Home/End move to the first/last cell in the current row; focus is placed in the grid when testing starts and when switching eyes. The existing row/column keyboard fallback and Space/Enter activation remain available.
- Added bounded-navigation unit tests and source-level quality-audit assertions.
- Vercel production deployment `dpl_HVN2rqsztHG8JoGCBeVE7ZhYLvTD` reached READY and is aliased to `sightsteps.vercel.app`.
- Deployment checks: quality audit **2,563 passed, 0 failed**; regression tests **1,054 passed, 0 failed**; clinical-language audit **23 JSX files / 2,774 fragments, no violations**; Vite **104 modules transformed**; PWA **34 precache entries (1,014.73 KiB)**.
- Live production root returned **HTTP 200** with the new JS asset. Automated and build validation passed. Direct browser interaction testing for arrow-key behavior remains pending because the Vercel Sandbox Snapshot Storage limit prevented provisioning another browser sandbox.


## Phase 4 Amsler follow-up fixes — 25 November 2026

- F-22: The calibration slider could disable itself when the current ruler width made the 10 cm grid too tall for the visible viewport, preventing the participant from reducing the ruler to a valid physical size. The slider now remains adjustable whenever the minimum supported slider size fits; the Continue action still requires the currently selected size to fit. A regression assertion covers a 600 × 450 viewport where the 150 px minimum fits but a 300 px selection does not.
- F-23: The fixed accessibility control reserved 52 px in the questionnaire and direction-activity headers but not the Amsler round counter. Added `.amsler__topbar-counter` to the same reserved-space selector and a quality-audit assertion.
- Combined production deployment: commit `d05387b6e1bdc28599f16f4d4b8327bb964ed4ef`, deployment `dpl_9uZwVLLNcJHVu1xuhjHEcmzPeQoR`, READY and aliased to `https://sightsteps.vercel.app`.
- Verification for this exact deployment: quality audit **2,565 passed, 0 failed**; regression tests **1,055 passed, 0 failed**; clinical-language audit **23 JSX files / 2,774 fragments, no violations**; Vite **104 modules transformed**; PWA **34 precache entries (1,014.77 KiB)**.
- Live root returned **HTTP 200** and the production CSS asset was fetched and verified to contain `.amsler__topbar-counter`.
- Browser/device verification of the calibration recovery and header overlap remains pending because the Vercel Sandbox Snapshot Storage limit prevented creating another browser sandbox. Do not treat the automated build as a visual or physical-device test.


## Phase 4 kiosk cleanup failure hardening — 25 November 2026

- Finding F-25: when `reset()` failed in kiosk timeout, kiosk setup, Landing's end-session control, or Report's finish action, several handlers only displayed a warning and left the previous participant in memory. A user could potentially return to Landing or a protected participant route and continue the old session even though deletion had failed.
- Added `markKioskCleanupFailed()` in `AppContext`, reusing the existing `KIOSK_CLEANUP_FAILED` reducer action to reset all in-memory participant state and set a blocking cleanup flag.
- Applied the failure action to all kiosk cleanup exit paths: `KioskGuard`, `KioskSetup`, Landing's `handleEndKiosk`, and Report's reset-and-navigate helper whenever `kioskMode` is active.
- Hardened `getProtectedRouteRedirect`: a cleanup-failed session is redirected to `/kiosk?clearError=1` before the normal session/profile/intake/vision route checks. NewSessionGuard already blocked onboarding; this extends the block to every protected participant route.
- Added a regression test using a complete/consented session with saved answers and vision results, proving it still redirects to the kiosk retry screen when `kioskCleanupFailed` is true. Added two quality-audit assertions covering all reset exit callers and protected-route enforcement.
- Commit: `86ab9d8d45e5731d8a6d03b5fd4f2f96021417d3`.
- Production deployment: `dpl_Bj3i3UT1agdAdsgqieM9EhxBDJ4b` — READY, aliased to `https://sightsteps.vercel.app`.
- Exact deployment verification: quality audit **2,568 passed, 0 failed**; engine regression tests **1,056 passed, 0 failed**; clinical-language audit **23 JSX files / 2,774 fragments**, no violations; Vite **104 modules transformed**; PWA **34 precache entries (1,015.05 KiB)**. Production root HTTP **200 OK** and served `index-DBJQfr6s.js`.
- Direct browser interaction verification of a simulated IndexedDB deletion failure remains pending because the Vercel Sandbox Snapshot Storage limit prevented provisioning another browser sandbox. The new failure route is covered by the automated routing regression and source audit; deployment READY is not presented as manual visual validation.


## Phase 4 voice-note lifecycle hardening — 25 November 2026

- Finding F-26: `VoiceNoteField` used asynchronous browser speech-recognition callbacks. A recognizer that had already been stopped could deliver a late `onstart`, `onresult`, `onerror` or `onend` event and overwrite the state of a newer capture. Manual edits also left an outdated voice-status message visible. Navigating away while recognition was running could allow the old `onend` handler to update an unmounted component.
- Fixed by checking the callback's `recognition` instance against `recognitionRef.current` before handling start/result/error/end events; clearing voice status when the participant manually edits the text; and invalidating the active recognizer reference before calling `stop()` during component unmount so its eventual events are ignored.
- Added three source-audit assertions covering stale callback guards, manual-edit status clearing, and unmount invalidation.
- Final implementation commit: `fc2408ad1cacb2959f12520c50dc2654738e3500` (the voice callback/status fix was introduced in `985b8ad36ece222339fbd4dbe67d243a741896f1`, followed by unmount invalidation in `7d78cdfe6858598ef036208912249ea84385b638`, then an additional `onstart` guard and stricter audit threshold in the final commit).
- Production deployment: `dpl_4yACz5HTwWWnkE2qF5imqteVRM4K` — READY, aliased to `https://sightsteps.vercel.app`.
- Verification for the exact final commit: quality audit **2,571 passed, 0 failed**; engine regression tests **1,056 passed, 0 failed**; clinical-language audit **23 JSX files / 2,774 fragments**, no violations; Vite **104 modules transformed**; PWA **34 precache entries (1,015.19 KiB)**. Production root returned **HTTP 200** and serves `index-BhcLV8q3.js`.
- No live microphone/permission/device browser test was possible because the Vercel Sandbox Snapshot Storage limit prevented provisioning another browser sandbox. Automated static checks and production build passed; real browser microphone behavior remains a device-level validation item.


## Phase 4 Clinician Brief modal isolation — 25 November 2026

- Finding F-27: the global Accessibility controls and skip link used z-index 1500/2000, above the Clinician Brief overlay's z-index 200. The Brief's inert logic only disabled siblings within its Report container; app-level global controls remained outside the modal's inert background.
- Raised `.clinician-brief` to z-index **2200**, above the global accessibility elements.
- Expanded modal background isolation to include siblings of the app root that do not contain the dialog, in addition to local Report siblings. Existing inert and `aria-hidden` values are saved and restored on close; previous focus restoration and Escape/Tab handling remain intact.
- Added two quality-audit checks for stacking level and app-level inert background coverage.
- Commit: `e6148c7101d27b9b28e3b0608fb3dbb95e026510`.
- Vercel deployment: `dpl_BYn8DmR9VaMXuMFbS1DU7CEyqfdh` — **READY**, production alias `https://sightsteps.vercel.app`.
- Exact deployment checks: quality audit **2,573 passed, 0 failed**; regression suite **1,056 passed, 0 failed**; clinical-language audit **23 JSX files / 2,774 fragments**, no violations; Vite **104 modules transformed**. Production root returned **HTTP 200** and serves `index-5HL5_vzL.js`.
- Direct browser keyboard and screen-reader validation for the new global inert scope remains pending: the Vercel Sandbox Snapshot Storage quota prevented provisioning another browser sandbox. Build/audit success is not presented as manual modal interaction verification.


## Phase 4 custom activity label consistency — 25 November 2026

- Finding F-28: When a participant edited their custom `Other` activity name after it had already been selected as affected, `ActivityProfile.jsx` rebuilt the stored `affected_activities.label` with the static option labels. The selected value remained `other`, but the participant's new wording was replaced by generic “Other” in the answer label.
- Added `getAffectedActivityLabels()` in `src/data/questions.js` to build a bilingual affected-activity label from the selected IDs and current participant-entered custom name. Activity Profile now uses it when a renamed custom activity affects an already recorded selection.
- Added two engine regression assertions for English and Hindi labels with a regular activity plus renamed custom activity, and a quality-audit assertion that the profile handler uses the helper.
- Commit: `bd3c16c6f7be7656e1a729afa934a0474485413e`.
- Production deployment: `dpl_HfnXD5Tz6Jtj3G7iMUFxwxRKrh8c` — **READY**, production alias `https://sightsteps.vercel.app`.
- Exact checks: quality audit **2,574 passed, 0 failed**; engine regression suite **1,058 passed, 0 failed**; clinical-language audit **23 JSX files / 2,774 fragments**, no violations; Vite **104 modules transformed**. Live production root returned **HTTP 200** and serves `index-CFKY3dkv.js`.


## Phase 4 additions — backtracking, timeline editor focus and CI coverage (25 November 2026)

- F-29: Back-navigation regression coverage now includes both primary pathways. Returning to the main eye/context section clears dynamic secondary-experience follow-ups; moving backward within later static questions preserves already-completed secondary answers. The headaches-primary path (dynamic insertion after `experience_context`) now has explicit two-answer clearing tests as well. Implementation commit `396542711925e74d18419902059cff4effa09486`; production deployment `dpl_6uf1UaVbVeedwULoC4k23qx3aHGy` READY. Earlier verification for this app commit: quality **2,574**, regression **1,064**, clinical **23 JSX / 2,774 fragments**, Vite **104 modules**, PWA **34 entries (1,015.44 KiB)**.
- F-30: Editing a timeline entry now moves focus to the timeline editor heading (`tabIndex="-1"`) so keyboard and screen-reader users are taken to the form that changed. `resetDraft()` also clears stale save/delete status and the delete confirmation state, preventing an old success message from carrying into a new draft. Initial audit assertion used a JSX integer form that did not match the source's quoted `tabIndex="-1"`; corrected in commit `16b52f1f12e069c908d942d2835e314c64dd9393`. Focus behavior and status-reset source assertions were then verified in the CI build.
- F-31: Existing GitHub Actions path filters skipped application-only changes such as `src/pages/VisionTimeline.jsx` and `scripts/quality-audit.mjs`. Expanded the `clinical-review-export` workflow to run for `src/**`, `scripts/**`, package files, Vite configuration and `index.html`, in addition to workflow changes. Commit `f677b1845614604f7872634ddc16f70634b0fb71` triggered run `45630774512` — **SUCCESS**.
- Exact CI result for `f677b1845614604f7872634ddc16f70634b0fb71`: quality audit **2,577 passed, 0 failed**; engine regression suite **1,064 passed, 0 failed**; clinical-language audit **23 JSX files / 2,774 fragments**, no violations; Vite **104 modules transformed**; PWA **34 precache entries (1,015.65 KiB)**; review export **1,187 lines**. Workflow artifact ID `15029149424` (`clinical-review-export`).
- Deployment caveat and correction: the manual Vercel deployment API hit its daily rate limit, but the Git-connected deployment completed automatically. Application commit `16b52f1f12e069c908d942d2835e314c64dd9393` is READY as `dpl_B6cJn68sqAv3uGAvd9HuAjQSexe3`, aliased to `sightsteps.vercel.app`; the live root serves `index-BYhLY47v.js`. Exact Vercel checks: quality **2,577**, regression **1,064**, clinical **23 JSX / 2,774 fragments**, Vite **104 modules**, PWA **34 entries (1,015.65 KiB)**. Current `main` adds the CI workflow path-filter commit and documentation-only commits after the same application code. Direct browser interaction testing remains pending because Vercel Sandbox Snapshot Storage is over the Hobby limit; no manual visual pass is claimed.

## Final current-source verification — 25 November 2026

- Exact main revision inspected and tested: fbc57865af97fc606ed0a2d139d4662428e8e1bc.
- Environment: Node v24.22.3, npm 11.19.1. npm ci completed successfully (349 packages installed). npm reported four moderate advisories in the existing dependency tree; no forced dependency change was applied.
- Final direct checks after the Amsler and audit changes: quality 2,588 passed, 0 failed; regression 1,064 passed, 0 failed; clinical-language audit 23 JSX files / 2,777 fragments, passed; Vite 104 modules; PWA 34 entries (1,016.82 KiB); clinical-review export 1,192 lines. npm run build reran the check suite and passed.
- Headless Chromium smoke: Landing to Ramesh guided demo to all seven guided answers to Report; shared-context pathway and original answer IDs visible; Clinician Brief opened with role=dialog, aria-modal=true, focus on Close, and inert background; Report showed no horizontal overflow at 390 px. Appointment Pack switched to brief-print mode and invoked window.print under interception. This did not measure physical printed page count.
- Previously deployed application-code revision: 16b52f1f12e069c908d942d2835e314c64dd9393, READY deployment dpl_B6cJn68sqAv3uGAvd9HuAjQSexe3. The present Amsler wording/audit changes are new source changes and must not be considered live until their own commit has a READY deployment.
- Remaining validation: first formal optometrist/ophthalmologist review; physical Amsler display/zoom/viewing-distance/tap validation on real devices; assistive-technology testing; actual print-preview/page-count check; and a real five-minute kiosk idle/failure-injection exercise.

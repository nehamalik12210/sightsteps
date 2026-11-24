# SightSteps — Baseline Record

**Baseline commit reviewed:** `2731d987bc3f5457b2124cdf67e9d758a5bbb049`  
**Historical application-code verification commit:** `723c3c5a29abf31295fb77e8083564b48a53c156`  
**Route-splitting application commit:** `38b7e7132593d72fa64be23a303a312a2a3697a2`  
**Latest verified source commit:** `5d964fc5ab2311e612a2ffe0c1db1bf65b131cf0`  
**Latest verified production deployment:** `dpl_BxnNfeW8HBBhuXxQrg7UQTzoJDQf` (READY; `main`; production alias `https://sightsteps.vercel.app`)  
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

## Verified build evidence

Vercel deployment `dpl_BxnNfeW8HBBhuXxQrg7UQTzoJDQf` for commit `5d964fc5ab2311e612a2ffe0c1db1bf65b131cf0` completed READY:
- Quality audit: **2,522 passed, 0 failed**. The audit now resolves relative paths from both static imports and literal dynamic `import()` calls; explicit checks cover all nine lazy-loaded page routes and the loading/focus handoff.
- Engine regression suite: **849 passed, 0 failed**.
- Clinical-language audit: passed; **22 JSX files and 2,625 copy fragments** scanned. The nested-component discovery fixture executed and passed.
- Vite: **100 modules transformed**.
- Route splitting reduced the initial JavaScript chunk from 581.00 kB minified (158.01 kB gzip) to **344.80 kB (105.91 kB gzip)**, a 40.6% reduction in minified entry size. The largest page chunk is Report at 147.38 kB (32.22 kB gzip); AmslerGrid is 21.91 kB (5.69 kB gzip). No emitted JavaScript chunk exceeds Vite's 500 kB warning threshold.
- PWA service worker generated **34 precache entries (975.74 KiB)**. The split assets remain included in the precache, preserving the existing precache-based offline strategy; this does not mean the initial page downloads every page chunk at runtime.

## Clinical review export verification

- Added `.github/workflows/clinical-review-export.yml` to generate the review export from locked dependencies and upload it as a 14-day GitHub Actions artifact.
- Latest workflow run for commit `a83de5439cd04facbb3c967919c741373bfe8760`: run `45490205104`, conclusion SUCCESS.
- Generated export: 954 lines, 68,713 bytes, 12 correctly numbered sections.
- Export inspection verified 57 English source rows, each immediately paired with a non-empty Hindi source row; zero missing/mispaired/blank source pairs.
- Includes the bilingual draft/non-diagnostic cover notice, scripted Ramesh demo-data notice, synthetic custom “Other” activity scenario, bilingual source labels and answers, eight pattern descriptions, pattern clusters, rule-engine prompts, follow-up notes, Amsler wording, clinician brief, adaptive questions and participant-review copy.
- The same artifact contains `npm-audit.json`. Artifact ID: `14964948536`; retention 14 days (expires 8 December 2026).

## Verification limits

- The repository was inspected through GitHub's connected repository interface because a local clone attempt failed due to DNS/network resolution.
- No local browser automation, printed-PDF page-count/visual inspection, responsive screenshot review, or physical Amsler device-calibration validation was completed in this work session. The available Vercel desktop sandbox did not include an installed browser, so it was not used to claim a visual pass.
- Production HTTP checks for `/`, `/activities`, `/report`, `/amsler` and `/kiosk` returned HTTP 200 and the Vite SPA shell. This confirms the Vercel rewrite responds for direct route requests; it does not execute the client-side app or verify interactive route behavior.
- The clinical review export and npm audit were generated and inspected as GitHub Actions artifacts, not as part of the Vercel app bundle.
- The route-splitting deployment `dpl_FJdRtfhg8nUfoJdymcfCDSag4cUo` (commit `38b7e713...`) and latest verified deployment `dpl_BxnNfeW8HBBhuXxQrg7UQTzoJDQf` (commit `5d964fc5...`) both reached READY on the production target. The latest logs contain the full quality/test/lint/build evidence above.

## Dependency audit details

The `npm audit` artifact reports four moderate findings, all in the development-time PWA build chain:
- `vite-plugin-pwa@2.0.0` (direct dev dependency) → `workbox-build@7.4.1` → `glob@11.1.0` → `minimatch@10.2.6`.
- `GHSA-3g3m-2fjr-6pw4` affects glob `>=9.0.0 <=14.0.1`; the advisory reports a fix in glob 14.0.2.
- `GHSA-g3hv-75wg-m249` affects minimatch `>=7.0.0 <11.0.1`; the advisory reports a fix in minimatch 11.0.1.
- The current Workbox dependency ranges require glob `^11.0.1` and minimatch `^10.1.1`, so the advisory fixed versions are outside the declared ranges. npm's `fixAvailable` suggestion points to `vite-plugin-pwa@1.1.0` and marks it as a major change even though the lockfile has 2.0.0; this appears to be a downgrade and has not been applied.
- Upstream Workbox issue [GoogleChrome/workbox#3599](https://github.com/GoogleChrome/workbox/issues/3599) documents the same semver-range blocker for `workbox-build@7.4.1`; the issue was still open when checked on 25 November 2026. Its discussion describes candidate upstream work but does not establish a released compatible fix for the complete dependency tree.
- No `npm audit fix`, forced upgrade or dependency override was applied. A compatible Workbox/plugin release or a deliberately tested override needs evaluation before remediation.

The dependency report is a build/development dependency audit, not evidence that these packages execute in the deployed browser bundle. Treat it as an outstanding supply-chain maintenance item, not as zero-risk.

## Safety boundary

SightSteps is a participant-reported conversation aid. Automated tests and wording lint do not establish clinical validity. Independent review by a licensed optometrist or ophthalmologist remains outstanding, especially for the Amsler activity, physical calibration, patterns and follow-up prompts.

# SightSteps — Baseline Record

**Baseline commit reviewed:** `2731d987bc3f5457b2124cdf67e9d758a5bbb049`  
**Application-code verification commit:** `723c3c5a29abf31295fb77e8083564b48a53c156`  
**Latest full deployment checked:** `60d3b768ddb192c30c1adec413aabaea5aae1ea1`  
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

Vercel deployment for commit `645f8783547e9f20cfaa32033d3ef4cf6348a394` completed READY:
- Quality audit: 2,519 passed, 0 failed.
- Engine regression suite: 849 passed, 0 failed on code commit `723c3c5a29abf31295fb77e8083564b48a53c156`.
- Clinical-language audit: passed; 22 JSX files and 2,622 copy fragments scanned. The nested-component discovery fixture executed and passed.
- Vite: 99 modules transformed; PWA generated 11 precache entries.
- Latest deployment chunk: 581.00 kB minified (158.01 kB gzip), above Vite's 500 kB warning threshold.

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
- The clinical review export and npm audit were generated and inspected as GitHub Actions artifacts, not as part of the Vercel app bundle.
- Latest Vercel production deployment after documentation synchronization is READY at `https://sightsteps.vercel.app` (deployment `dpl_7zyFuStdgD1pocUKs8hKyDeTJuVs`, main commit `60d3b76`). Its app-code set is the same as the fully counted `723c3c5` build: 849 engine tests passed, 0 failed. The latest deployment build logs reconfirm 2,519 quality checks, clinical-language audit success (22 JSX files / 2,622 fragments; nested discovery fixture executed), 99 Vite modules transformed and 11 PWA precache entries.

## Dependency audit details

The `npm audit` artifact reports four moderate findings, all in the development-time PWA build chain:
- `vite-plugin-pwa@2.0.0` (direct dev dependency) → `workbox-build@7.4.1` → `glob@11.1.0` → `minimatch@10.2.6`.
- `GHSA-3g3m-2fjr-6pw4` affects glob `>=9.0.0 <=14.0.1`; the advisory reports a fix in glob 14.0.2.
- `GHSA-g3hv-75wg-m249` affects minimatch `>=7.0.0 <11.0.1`; the advisory reports a fix in minimatch 11.0.1.
- The current Workbox dependency ranges require glob `^11.0.1` and minimatch `^10.1.1`, so the advisory fixed versions are outside the declared ranges. npm's `fixAvailable` suggestion points to `vite-plugin-pwa@1.1.0` and marks it as a major change even though the lockfile has 2.0.0; this appears to be a downgrade and has not been applied.
- No `npm audit fix`, forced upgrade or dependency override was applied. A compatible Workbox/plugin release or a deliberately tested override needs evaluation before remediation.

The dependency report is a build/development dependency audit, not evidence that these packages execute in the deployed browser bundle. Treat it as an outstanding supply-chain maintenance item, not as zero-risk.

## Safety boundary

SightSteps is a participant-reported conversation aid. Automated tests and wording lint do not establish clinical validity. Independent review by a licensed optometrist or ophthalmologist remains outstanding, especially for the Amsler activity, physical calibration, patterns and follow-up prompts.

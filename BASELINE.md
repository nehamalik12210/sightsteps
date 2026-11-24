# SightSteps — Baseline Record

**Baseline commit reviewed:** `2731d987bc3f5457b2124cdf67e9d758a5bbb049`  
**Current verified code commit:** `4b5ebcf6793fbcf3e439a8264f9fa118a85201f0`  
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
- Engine regression suite: 842 passed, 0 failed.
- Clinical-language audit: passed; 22 JSX files and 2,618 copy fragments scanned.
- Vite: 99 modules transformed; PWA generated 11 precache entries.
- Bundle warning: main JS chunk approximately 580.50 kB (157.88 kB gzip), above Vite's 500 kB warning threshold.
- npm install reported 4 moderate vulnerabilities and existing environment/deprecation/install-script warnings.

Vercel deployment for current code commit `cfdd32bec6125c2c64e887df3b79c9cf257a811e` completed READY:
- Quality audit: 2,519 passed, 0 failed.
- Engine regression suite: 844 passed, 0 failed (two new source-provenance assertions included).
- Clinical-language audit: passed; 22 JSX files and 2,622 copy fragments scanned.
- Vite: 99 modules transformed; PWA generated 11 precache entries.

## Clinical review export verification

- Added `.github/workflows/clinical-review-export.yml` to generate the review export from locked dependencies and upload it as a 14-day GitHub Actions artifact.
- Latest workflow run for commit `01f969f64b8f66bf47b93ee9b8a7979fd9805586`: run `45487346824`, conclusion SUCCESS.
- Generated export: 899 lines, 65,087 bytes, 11 sections. The opening English/Hindi notice marks the document as a draft for independent clinical review and identifies the Ramesh profile as scripted demo data, not a real participant record.
- Export inspection verified 53 English source rows, each immediately paired with a Hindi source row; no source row was missing its Hindi partner and no Hindi source value was blank.
- Export covers bilingual pattern definitions, clusters, demo-matched patterns and sources, rules-engine discussion prompts and source links, follow-up notes, Amsler wording, clinician brief wording, adaptive questions, participant-review copy, source-provenance labels and selected i18n strings.
- Artifact ID: `14964129797`; GitHub Actions artifact retention is 14 days (expires 8 December 2026).

## Verification limits

- The repository was inspected through GitHub's connected repository interface because a local clone attempt failed due to DNS/network resolution.
- No local `npm ci`, local browser automation, printed-PDF page-count/visual inspection, responsive visual inspection, or physical Amsler device-calibration validation was performed in this work session.
- The clinical review export was executed and inspected as a GitHub Actions artifact, not as part of the Vercel app build.
- Latest Vercel production deployment for code commit `4b5ebcf` is READY at `https://sightsteps.vercel.app` (deployment `dpl_ExV6kMDmCbPX1rQe8imuzDeDgwE2`). The Vercel build logs visibly confirm 2,519 quality checks passed, clinical-language audit passed (22 JSX files / 2,622 fragments), 99 Vite modules transformed and 11 PWA precache entries. The engine test command ran as part of `npm run build`; the build continued through clinical lint and Vite and finished READY. The previous fully visible run on `cfdd32b` recorded 844 engine tests passed. The new nested-component discovery fixture executed during the latest clinical-language audit and the audit passed.

## Safety boundary

SightSteps is a participant-reported conversation aid. Automated tests and wording lint do not establish clinical validity. Independent review by a licensed optometrist or ophthalmologist remains outstanding, especially for the Amsler activity, physical calibration, patterns and follow-up prompts.

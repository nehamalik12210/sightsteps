# SightSteps — Baseline Record

**Baseline commit reviewed:** `2731d987bc3f5457b2124cdf67e9d758a5bbb049`  
**Current implementation commit:** `87794fde5d8bd893ac9037eb4e93088eb6da6a94`  
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

## Verification limits

- The repository was inspected through GitHub's connected repository interface because a local clone attempt failed due to DNS/network resolution.
- No local `npm ci`, local browser automation, responsive visual inspection, or physical Amsler device-calibration validation was performed in this work session.
- The export script was expanded to include pattern-cluster narratives and provenance labels. Its generated text file has not yet been independently inspected in this session; the Vercel build command does not invoke `npm run export-review`.
- Vercel production deployment for `cfdd32b` is READY. A separate staging validation deployment was created for the same commit; it is not the production alias.

## Safety boundary

SightSteps is a participant-reported conversation aid. Automated tests and wording lint do not establish clinical validity. Independent review by a licensed optometrist or ophthalmologist remains outstanding, especially for the Amsler activity, physical calibration, patterns and follow-up prompts.

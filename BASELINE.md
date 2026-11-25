# SightSteps â€” Baseline Record

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
- `npm run clinical-lint`: clinical-language and rendered-copy a¶»§q«^
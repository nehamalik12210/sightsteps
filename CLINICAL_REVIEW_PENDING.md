# Clinical Review Record

## Review Status
**Status:** First formal expert review pending.

In the absence of a completed review, every pattern and the Amsler activity is anchored to published clinical guidance — see [CLINICAL_GROUNDING.md](CLINICAL_GROUNDING.md). No pattern or activity introduces a novel clinical claim.

**Last updated:** 2026-11-25

## Reviewer Information
Formal clinical review should be conducted by a licensed optometrist or ophthalmologist before public deployment.

| Field | Value |
|---|---|
| Reviewer name | _To be completed_ |
| Credentials | _Licensed optometrist / ophthalmologist_ |
| Review date | _To be completed_ |
| Contact | _To be completed_ |

## Content Requiring Review

### 1. Pattern Descriptions (8 patterns in `src/data/patterns.js`)
Each pattern infers a clinically meaningful combination from participant-reported answers:
- **screen-strain**: Screen work + blurred distance vision + infrequent eye exams
- **night-vision**: Low-light difficulty + driving context + age > 40
- **close-work-headache**: Headaches + close work + squinting
- **asymmetry**: One-eye symptoms + recent onset
- **presbyopia**: Near-vision difficulty + age > 40 + worsening trend
- **digital-eye-strain**: High screen use + headaches
- **low-light-contrast**: Night/low-light difficulty + explicitly selected low-light context + squinting
- **overdue-exam**: No recent exam + multiple reported experiences

**Review question:** Are these pattern descriptions clinically defensible?

### 2. Amsler Grid Self-Monitoring Activity (`src/pages/AmslerGrid.jsx`)
The activity records only regions a participant manually flags; it must not be described as a diagnostic test or as ruling out disease. Key points for review:
- No flagged regions must never be presented as a normal or reassuring result.
- New distortion, blurred or missing areas should prompt advice to contact an eye-care professional promptly rather than wait for a routine appointment.
- Calibration uses an 85.6 mm standard card to target a 100 mm grid; the activity blocks calibration unless the complete square fits both visible viewport dimensions with room for controls, including wide but short landscape-phone screens.
- The center marker is positioned at the exact geometric center of the grid.
- Participants cover one eye at a time (right eye first, then left).
- Physical calibration, device fit, browser zoom, display density, viewing distance and tap accuracy have not yet been independently validated across real devices.

**Review questions:** Is the wording and participant guidance appropriate? Is this implementation appropriate for home self-monitoring? What additional device and viewing-condition validation is required before any clinical-context use?

### 3. Adaptive Additional-Experience Follow-Ups and Custom Activity Wording

The questionnaire allows a participant to select additional experiences they would also like to discuss. Each selected experience has its own follow-up questions for:
- When it was first noticed
- How often it is noticed
- Situations in which it is noticed
- Eye-side, except for the headache experience

The participant can select “No other experience to add” or “Not sure”. These follow-ups are optional to the extent allowed by the guided question flow and remain linked to their own answer IDs.

Participants can also enter a custom name when choosing the “Other” everyday activity option. That text is reused in follow-up questions and summaries as participant-authored wording.

**Review questions:**
- Are the follow-up questions clear, neutral and proportionate for additional experiences?
- Is the question wording suitable in both English and Hindi?
- Does the optional nature of these questions remain clear, without implying that selection or answers establish a clinical relationship?
- Is reuse of participant-entered activity names understandable and safe in the report?

### 4. Participant Review and Correction

Before using the Conversation Map, participants can confirm that the summary reflects what they wanted to share or enter an optional correction/addition (up to 500 characters). This review is stored separately from original questionnaire answers and is included in the Appointment Preparation Pack and Clinician Brief as participant-authored context.

**Review questions:**
- Is it clear that this is a communication/accuracy check, not a clinical sign-off?
- Does the correction field give participants enough control without implying that their correction changes a clinical interpretation?
- Is the confirmation wording neutral and understandable in both languages?

### 5. Discussion Prompts (all generated output)
Every pattern and discussion point uses non-diagnostic language:
- "Your responses suggest..." (never "You have...")
- "Worth discussing with an eye-care professional" (never "You need treatment")
- All output passes the clinical language lint (`scripts/clinical-language-audit.mjs`)

**Review question:** Are any prompts or patterns misleading, redundant, or alarming? Would you reword any?

### 6. Vision Evidence Pathways (`src/engine/visionEvidencePathways.js`)

The report, Clinician Brief and Appointment Preparation Pack now include a structured explanation layer with five relationship types:
- **A — Experience to context:** repeats the situations the participant selected for a separately reported experience.
- **B — Context to activity impact:** displays experience/context answers beside separately captured everyday-activity impact answers. The questionnaire does not identify which specific experience/context an activity impact belongs to, so the application explicitly avoids a one-to-one assignment.
- **C — Shared context across experiences:** the one new inference type. Two distinct participant-reported experiences are linked only when the participant selected the same specific context for both. The Ramesh demo shows blurred vision and difficulty in low light sharing a driving context.
- **D — Timeline and onset:** presents a participant-entered timeline record beside the matching onset answer. The entry date is not represented as a medically determined onset date.
- **E — Information gaps:** identifies missing follow-up answers only when that field was actually asked for the selected experience.

Every pathway retains source answer IDs and/or participant timeline-entry IDs. The output is bilingual and non-diagnostic. No confidence, probability, severity or risk score is calculated. The Ramesh fixture is synthetic demo data; its unanswered secondary onset/frequency/eye fields deliberately demonstrate the information-gap output and do not represent a real participant.

**Review questions:**
- Is the shared-context relationship (two separately reported experiences selected in the same context) understandable and appropriately cautious, without suggesting shared cause?
- Is it clear to the participant and clinician that a shared context is a connection between answers, not a clinical conclusion?
- Is the activity-impact presentation sufficiently transparent about the absence of a one-to-one experience-to-activity mapping?
- Does the timeline/onset presentation clearly distinguish participant entry date from reported onset?
- Are the information-gap labels neutral and useful, and do they avoid implying that unanswered optional fields indicate a health problem?
- Are the bilingual relationship explanations and source labels clear, proportionate and suitable for a clinical conversation?

## Review Kit

To prepare a review package for the clinical expert:

### Step 1: Generate the export
```bash
node scripts/export-prompts.mjs
```
This creates `exports/clinical-review-export.txt` containing:
- All 8 pattern descriptions (EN + HI), including source keys
- Pattern engine output for the scripted demo persona (Ramesh, 42, tailor)
- Vision Evidence Pathways A–E, including shared-context inference, activity-impact caveat, temporal/onset link, missing fields and bilingual answer/timeline provenance
- Rules-engine discussion prompts and follow-up notes (EN + HI), with paired source answers
- A separate synthetic “Other” activity scenario showing participant-entered activity-name provenance
- Dynamically generated secondary-experience questions and answer options (EN + HI)
- Current Amsler introduction, calibration, use instructions and result safety wording (EN + HI)
- Participant-defined activity wording examples
- Conversation Map confirmation and correction wording
- Clinician brief wording and key translated disclaimers

### Step 2: Run the demo
```bash
npm run dev
```
Open the app and use "Explore Ramesh's demo" to walk through the full journey. The demo uses a pre-scripted Hindi-speaking persona.

### Step 3: Send the reviewer
1. The exported `exports/clinical-review-export.txt` file
2. A link to the running demo (or deployed app)
3. These review questions:
   - **Are the pattern descriptions and discussion prompts clinically defensible and appropriately cautious?**
   - **Are the additional-experience follow-ups clear, neutral, proportionate and suitable in both English and Hindi?**
   - **Does the Amsler framing match how you instruct patients, including the no-flags warning and device-calibration limitations?**
   - **Is the participant-defined activity wording clear and suitable for use in summaries?**
   - **Is the Conversation Map confirmation/correction clearly a communication check rather than clinical sign-off?**
   - **Are any questions or prompts misleading, redundant, alarming or too burdensome? What would you reword?**

### Step 4: Record feedback
Update the "Reviewer Feedback" section below with the reviewer's responses. Apply accepted changes to `patterns.js`, `questions.js`, `ruleEngine.js`, and Amsler wording. Document any changes or justified no-changes in the Changes Log.

## Automated Safeguards
- **Clinical language lint** (`npm run clinical-lint`): Recursively scans all JSX files under `src`, bilingual structured copy, questions, patterns, clusters, persona copy and generated engine output. A nested-component fixture proves new JSX components are discovered and their visible text is checked. Fails CI on violation.
- **Disclaimer constant**: Rendered at the top of Detailed Report, Preparation Pack, Clinician Brief, Amsler activity page, and Amsler result.
- **Pattern engine guardrail**: Patterns require ≥2 satisfied source links before they appear. No pattern fires on empty or partial answers.

## Changes Log
| Date | Change | Reason |
|------|--------|--------|
| 2026-11-24 | Initial pattern set (8 patterns) created | Phase 1 roadmap |
| 2026-11-24 | Amsler grid self-monitoring activity added | Phase 2 roadmap |
| 2026-11-24 | Clinical language lint implemented | Phase 4 roadmap |
| 2026-11-24 | Clinician Brief component added | Phase 5 roadmap |
| 2026-11-24 | Export script and review kit created | Phase 3 roadmap |
| 2026-11-24 | Report integrated: patterns, Amsler, clinician brief | Integration |
| 2026-11-24 | README updated with new features | Phase 6 hygiene |
| 2026-11-24 | Adaptive follow-ups added for selected additional experiences | Improve participant-specific context without clinical scoring |
| 2026-11-24 | Participant-defined activity wording added to impact questions and summaries | Preserve the participant's own everyday context |
| 2026-11-24 | Participant review and correction added to Conversation Map and exports | Allow participants to correct their communication summary |
| 2026-11-24 | Clinical review export expanded for adaptive questions and participant review | Ensure the independent reviewer sees current bilingual UI copy |
| 2026-11-25 | Discussion-source provenance added to report and appointment pack | Make it clear which participant responses are linked to each topic |
| 2026-11-25 | Export expanded with paired EN/HI source answers and scripted “Other” activity example | Let reviewers inspect traceability, free-text preservation and bilingual labels |
| 2026-11-25 | Export marked as a review draft with explicit synthetic-demo notice | Prevent demo data being mistaken for participant data |
| 2026-11-25 | GitHub Actions export and npm audit artifact workflow added | Reproduce the review pack and retain dependency-audit evidence |
| 2026-11-25 | Vision Evidence Pathways A–E added to participant and clinician outputs and clinical-review export | Review traceability, shared-context inference and missing-information handling |

## Reviewer Feedback
_To be completed after formal clinical review._


## Additional review item — local session history (25 November 2026)

The prototype now retains up to 10 consented participant session records in the current browser's IndexedDB. Records are not encrypted, do not sync to accounts or other devices, and are individually deletable from the Landing page. Demo/kiosk sessions are excluded from the participant history list; kiosk cleanup clears the complete local session store. Please review whether this retention period/count and the consent wording are appropriate before any real-world participant use. This implementation is not an identity-linked clinical record system.

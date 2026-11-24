# Clinical Review Record

## Review Status
**Status:** Expert review is planned.

In the absence of a completed review, every pattern and the Amsler activity is anchored to published clinical guidance — see [CLINICAL_GROUNDING.md](CLINICAL_GROUNDING.md). No pattern or activity introduces a novel clinical claim.

**Last updated:** 2026-11-24

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

## Review Kit

To prepare a review package for the clinical expert:

### Step 1: Generate the export
```bash
node scripts/export-prompts.mjs
```
This creates `exports/clinical-review-export.txt` containing:
- All 8 pattern descriptions (EN + HI)
- Pattern engine output for the demo persona (Ramesh, 42, tailor)
- All generated discussion prompts (EN + HI)
- All follow-up notes (EN + HI)
- Amsler grid wording at every touchpoint (EN + HI)
- Clinician brief wording (EN + HI)
- Key i18n disclaimer strings

### Step 2: Run the demo
```bash
npm run dev
```
Open the app and use "Explore Ramesh's demo" to walk through the full journey. The demo uses a pre-scripted Hindi-speaking persona.

### Step 3: Send the reviewer
1. The exported `exports/clinical-review-export.txt` file
2. A link to the running demo (or deployed app)
3. These three review questions:
   - **Are the pattern descriptions clinically defensible?**
   - **Does the Amsler framing match how you instruct patients?**
   - **Are any prompts or patterns misleading, redundant, or alarming? Would you reword any?**

### Step 4: Record feedback
Update the "Reviewer Feedback" section below with the reviewer's responses. Apply accepted changes to `patterns.js`, `questions.js`, `ruleEngine.js`, and Amsler wording. Document any changes or justified no-changes in the Changes Log.

## Automated Safeguards
- **Clinical language lint** (`npm run clinical-lint`): Scans all patterns, i18n strings, and engine output for forbidden diagnostic phrases. Fails CI on violation.
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

## Reviewer Feedback
_To be completed after formal clinical review._

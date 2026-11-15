# Clinical wording and scope review

## Product boundary

SightSteps organises participant-reported visual experiences, daily activities and eye-care background into a conversation-preparation brief. Its rules engine is deterministic and explainable. It does not diagnose, triage, determine urgency, calculate clinical risk, measure visual acuity, prescribe vision correction or recommend a particular lens as a clinical outcome.

## Current safeguards

- Landing, consent, direction-activity and report copy identify SightSteps as a conversation-support tool, not an eye examination, diagnosis, visual-acuity test or prescription.
- Main-concern, onset, change, context and frequency answers are described as information the participant reported.
- Activity-impact choices describe perceived everyday impact (for example, takes longer, discomfort or adjustments). They are not visual-performance measurements.
- Per-activity frequency is only asked after a participant selects a positive impact. "None" and "unsure" do not imply a problem.
- The detailed report shows source answers behind generated prompts. Participant priority selection changes presentation order only; it is not a clinical ranking.
- Secondary reported experiences are presented as additional topics to discuss, not interpreted as a diagnosis.
- Appointment follow-up fields are the participant's own notes about what they recall being told. SightSteps does not create a professional clinical record or advice.
- Speech recognition includes a warning that the browser or its speech provider may process audio. The prototype does not claim audio processing is local.
- The direction activity uses two rounds without eye-specific scoring, asks users to keep both eyes comfortably open and states it does not measure visual acuity.
- Kiosk mode is described as a privacy aid, not a complete security guarantee.

## Items requiring independent sign-off

- Review English and Hindi question copy, translation fidelity, context choices and cultural clarity.
- Review the main-concern branching, headache wording, affected-activity mapping and frequency choices for unintended clinical implications.
- Review all deterministic discussion prompts and source displays.
- Review driving, low-light, glare and outdoor wording so it does not imply a fitness-to-drive determination or clinical recommendation.
- Confirm participants are directed to qualified professional care for concerns without the app offering an urgency classification or reassurance.
- Confirm audio/privacy disclosures are understandable in both supported languages and match the actual target browser behavior.
- Confirm shared-device kiosk wording is accurate for the deployed device/browser management policy.
- Confirm whether additional guardian/ethics handling is needed. The prototype includes an under-18 age option and is not validated for independent use by minors; do not test minors without an approved guardian/ethics process.

**Status:** safeguards are implemented in source. No independent eye-care professional has reviewed or approved this bundle. Do not present this document as clinical approval.

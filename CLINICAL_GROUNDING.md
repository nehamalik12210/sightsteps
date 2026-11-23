# Clinical Grounding

Every pattern and self-monitoring activity in SightSteps is anchored to published guidance. No pattern or activity introduces a novel clinical claim. This document cites the established source for each.

> [!IMPORTANT]
> SightSteps operationalises published guidance as discussion prompts. It does not diagnose, screen for specific conditions, or replace professional examination. Every output is framed as "worth discussing with an eye-care professional," never as a conclusion.

---

## Amsler Grid Self-Monitoring Activity

**Grounding:** The Amsler grid is recommended as a home self-monitoring tool for macular changes by the American Academy of Ophthalmology (AAO). The AAO advises patients with or at risk of age-related macular degeneration to test their vision daily using an Amsler grid, one eye at a time, wearing reading glasses at 30–40 cm viewing distance, and to contact their ophthalmologist if lines appear wavy, blurred, or missing.

**Sources:**
- American Academy of Ophthalmology. "How to Use the Amsler Grid." — [aao.org/eye-health/tips-prevention/facts-about-amsler-grid-daily-vision-test](https://www.aao.org/eye-health/tips-prevention/facts-about-amsler-grid-daily-vision-test)
- American Academy of Ophthalmology. "Amsler Grid Test for Macular Degeneration." — [aao.org/eye-health/tips-prevention/amsler-grid-test](https://www.aao.org/eye-health/tips-prevention/amsler-grid-test)
- Crossland M, Rubin G. "The Amsler chart: absence of evidence is not evidence of absence." *British Journal of Ophthalmology* 2007;91(3):391–393 — [doi:10.1136/bjo.2006.095315](https://doi.org/10.1136/bjo.2006.095315)

**SightSteps implementation and limitations:** SightSteps records only the grid regions a participant manually flags; it does not measure visual function, interpret a visual-field defect, identify a disease or rule out a problem when no regions are flagged. The interface uses an attempted 85.6 mm card calibration to target a 100 mm grid and blocks calibration on narrow viewports where that grid cannot fit. This software calibration is not yet validated across real phones, tablets, browser zoom settings or display densities. It must be independently tested on physical devices and reviewed by a qualified eye-care professional before clinical-context use. Results are participant-entered observations, not a clinical screening result.

---

## Pattern: `screen-strain`

**Trigger:** Heavy screen use + blurred distance vision + no recent eye examination.

**Grounding:** The association between prolonged screen work and accommodative or refractive symptoms is well-documented as Computer Vision Syndrome (CVS), also called Digital Eye Strain. The American Optometric Association (AOA) defines CVS as "a group of eye- and vision-related problems that result from prolonged computer, tablet, e-reader and cell phone use," listing blurred vision and headaches among its primary symptoms.

**Sources:**
- American Optometric Association. "Computer Vision Syndrome." — [aoa.org/healthy-eyes/eye-and-vision-conditions/computer-vision-syndrome](https://www.aoa.org/healthy-eyes/eye-and-vision-conditions/computer-vision-syndrome)
- Sheppard AL, Wolffsohn JS. "Digital eye strain: prevalence, measurement and amelioration." *BMJ Open Ophthalmology* 2018;3(1):e000146 — [doi:10.1136/bmjophth-2018-000146](https://doi.org/10.1136/bmjophth-2018-000146)

---

## Pattern: `night-vision`

**Trigger:** Low-light difficulty + driving context + age > 40.

**Grounding:** Age-related changes in night vision and contrast sensitivity are well-documented in clinical literature. Research demonstrates that contrast sensitivity begins measurable decline in the 40–50 age bracket, and that mesopic (dim light) visual performance declines earlier than photopic (bright light) acuity. Senile miosis, early lens changes, and reduced rod photoreceptor density all contribute to night-vision complaints.

**Sources:**
- Owsley C. "Aging and vision." *Vision Research* 2011;51(13):1610–1622 — [doi:10.1016/j.visres.2010.10.020](https://doi.org/10.1016/j.visres.2010.10.020)
- Haegerstrom-Portnoy G, Schneck ME, Brabyn JA. "Seeing into old age: vision function beyond acuity." *Optometry and Vision Science* 1999;76(3):141–158 — [doi:10.1097/00006324-199903000-00014](https://doi.org/10.1097/00006324-199903000-00014)
- Wood JM, Owens DA. "Standard measures of visual acuity do not predict drivers' recognition performance under day or night conditions." *Optometry and Vision Science* 2005;82(8):698–705

---

## Pattern: `close-work-headache`

**Trigger:** Headaches around visual activities + daily close-up work + squinting.

**Grounding:** Headaches associated with sustained near work, particularly when combined with squinting, are a recognised clinical presentation of uncorrected refractive error and accommodative strain. The American Academy of Ophthalmology notes that uncorrected refractive errors can cause eye strain and headaches, especially with prolonged close work.

**Sources:**
- American Academy of Ophthalmology. "Refractive Errors." — [aao.org/eye-health/diseases/what-are-refractive-errors](https://www.aao.org/eye-health/diseases/what-are-refractive-errors)
- Rosenfield M. "Computer vision syndrome (a.k.a. digital eye strain)." *Ophthalmic and Physiological Optics* 2016;36(5):453–455 — [doi:10.1111/opo.12346](https://doi.org/10.1111/opo.12346)

---

## Pattern: `asymmetry`

**Trigger:** One-eye symptoms + recent onset.

**Grounding:** Sudden or recent-onset monocular symptoms are considered clinically significant in optometric and ophthalmological triage. Unilateral onset can indicate conditions ranging from refractive asymmetry to retinal or optic nerve pathology. Standard clinical guidance classifies new monocular visual symptoms as warranting prompt evaluation — the RCOphth Emergency Eye Care framework classifies sudden monocular vision changes as requiring same-day or urgent referral, and NICE NG81 includes monocular visual field changes in its referral criteria.

**Sources:**
- Royal College of Ophthalmologists. *Emergency Eye Care Commissioning Guidance.* — [rcophth.ac.uk/standards-and-guidance/guidance-listing](https://www.rcophth.ac.uk/standards-and-guidance/guidance-listing/)
- National Institute for Health and Care Excellence. *Glaucoma: diagnosis and management* (NG81), §1.1 Referral. — [nice.org.uk/guidance/ng81](https://www.nice.org.uk/guidance/ng81)
- Bowling B. *Kanski's Clinical Ophthalmology: A Systematic Approach.* 9th ed., Ch. 1 "Ophthalmic assessment." Elsevier; 2020.

---

## Pattern: `presbyopia`

**Trigger:** Near-vision difficulty + age > 40 + worsening trend over time.

**Grounding:** Presbyopia is the progressive, age-related loss of accommodation that becomes clinically noticeable between ages 40–45. It is the most common eye condition globally, affecting over 1.8 billion people. Near-vision difficulty that worsens over time in this age group is the textbook presentation.

**Sources:**
- World Health Organization. *World Report on Vision.* Geneva: WHO; 2019 — [who.int/publications/i/item/9789241516570](https://www.who.int/publications/i/item/9789241516570)
- Fricke TR et al. "Global prevalence of presbyopia and vision impairment from uncorrected presbyopia." *Ophthalmology* 2018;125(10):1492–1499 — [doi:10.1016/j.ophtha.2018.04.013](https://doi.org/10.1016/j.ophtha.2018.04.013)
- Mayo Clinic. "Presbyopia — Symptoms and causes." — [mayoclinic.org/diseases-conditions/presbyopia](https://www.mayoclinic.org/diseases-conditions/presbyopia/symptoms-causes/syc-20363328)

---

## Pattern: `digital-eye-strain`

**Trigger:** High screen use + headaches.

**Grounding:** Digital eye strain (Computer Vision Syndrome) is a recognised clinical entity defined by the American Optometric Association. High screen use combined with headaches is among the defining symptom clusters.

**Sources:**
- American Optometric Association. "Computer Vision Syndrome." — [aoa.org/healthy-eyes/eye-and-vision-conditions/computer-vision-syndrome](https://www.aoa.org/healthy-eyes/eye-and-vision-conditions/computer-vision-syndrome)
- Sheppard AL, Wolffsohn JS. "Digital eye strain: prevalence, measurement and amelioration." *BMJ Open Ophthalmology* 2018;3(1):e000146 — [doi:10.1136/bmjophth-2018-000146](https://doi.org/10.1136/bmjophth-2018-000146)
- Coles-Brennan C, Sulley A, Young G. "Management of digital eye strain." *Clinical and Experimental Optometry* 2019;102(1):18–29 — [doi:10.1111/cxo.12798](https://doi.org/10.1111/cxo.12798)

---

## Pattern: `low-light-contrast`

**Trigger:** The participant reports difficulty seeing in low light, explicitly selects low-light situations as a context, and reports squinting.

**Grounding:** Clinical literature discusses the role of lighting and contrast in visual performance. These background sources do not establish the cause of an individual participant's symptoms and do not justify inferring reduced contrast sensitivity from questionnaire answers alone.

**SightSteps implementation:** This pattern surfaces only the participant's reported low-light difficulty and squinting as a topic to describe to an eye-care professional. It does not label the experience as a measured contrast-sensitivity change or infer an underlying cause.

**Sources:**
- Owsley C. "Contrast sensitivity." *Ophthalmology Clinics of North America* 2003;16(2):171–177 — [doi:10.1016/S0896-1549(03)00003-8](https://doi.org/10.1016/S0896-1549(03)00003-8)
- Haegerstrom-Portnoy G, Schneck ME, Brabyn JA. "Seeing into old age: vision function beyond acuity." *Optometry and Vision Science* 1999;76(3):141–158

---

---

## Pattern: `overdue-exam`

**Trigger:** No recent professional examination + two or more reported vision-related experiences.

**Grounding:** Routine comprehensive eye examinations are recommended by the American Academy of Ophthalmology, the American Optometric Association, and the World Health Organization. The AOA recommends comprehensive eye exams at least every two years for adults aged 18–64 and annually for those 65+, or more frequently when symptoms are present.

**Sources:**
- American Optometric Association. "Comprehensive Eye Exams." — [aoa.org/healthy-eyes/caring-for-your-eyes/eye-exams](https://www.aoa.org/healthy-eyes/caring-for-your-eyes/eye-exams)
- American Academy of Ophthalmology. "Eye Exam and Vision Testing Basics." — [aao.org/eye-health/tips-prevention/eye-exams-101](https://www.aao.org/eye-health/tips-prevention/eye-exams-101)
- World Health Organization. *World Report on Vision.* Geneva: WHO; 2019

---

## Summary

| Pattern / Activity | Primary Source | Novel Clinical Claim? |
|---|---|---|
| Amsler grid | AAO home screening recommendation | No |
| `screen-strain` | AOA Computer Vision Syndrome definition | No |
| `night-vision` | Age-related contrast sensitivity literature | No |
| `close-work-headache` | AAO refractive error guidance | No |
| `asymmetry` | RCOphth Emergency Eye Care; NICE NG81 referral criteria | No |
| `presbyopia` | WHO World Report on Vision; Mayo Clinic | No |
| `digital-eye-strain` | AOA Computer Vision Syndrome definition | No |
| `low-light-contrast` | Contrast sensitivity clinical literature | No |
| `overdue-exam` | AOA/AAO routine examination guidelines | No |

Every pattern operationalises existing guidance as a discussion prompt. No pattern claims to diagnose, screen, or determine urgency.

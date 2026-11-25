# SightSteps ‚Äî Review Findings and Priorities

**Last reviewed:** 25 November 2026  
**Scope:** Eight original reviewer concerns plus provenance, dependency-audit and Evidence Pathways findings discovered during implementation.

## Findings

| ID | Finding | Status | Priority / next action |
|---|---|---|---|
| F-01 | No matched patterns must not reassure participants or imply absence of a problem. | Source wording inspected; EN/HI both state that the engine covers limited patterns and cannot rule out a problem. | Keep regression protection. |
| F-02 | Amsler completion language must not imply a screening result. | UI says ‚ÄúActivity Complete‚Äù; no-flags warning and prompt to contact an eye-care professional for new distortion/blur/missing areas are present. | Keep language and test. |
| F-03 | Amsler physical calibration/device fit. | Code uses a standard-card width and viewport-fit guard. Real display scale, zoom, viewing distance and tap accuracy are not validated across devices. | High; obtain device testing and optometrist review. Do not claim calibration is clinically validated. |
| F-04 | Amsler centre marker alignment. | CSS uses 50% positioning with negative 50% translation. | Browser geometry/responsive visual validation still needed. |
| F-05 | Low-light pattern and outdoor_time | outdoor_time is not used as evidence for low-light difficulty. The co-report pattern requires reported night-vision difficulty and separately reported squinting, and explicitly does n∂ªßq´^
---
name: B2B Quiz Recommendation Rules
description: P.A.T.H.finder Quiz B2B track recommends Workshops + Blue Door + Speaking only. Labs are B2C unless the user signals individual focus.
type: feature
---

For the P.A.T.H.finder Quiz B2B track (`src/data/pathFinderQuiz.ts`, `b2bResult`):

- **Primary recommendations:** Workshops only (no Labs in any RT-A/B/C/D/E primary slate).
- **Deeper option:** Always include Blue Door Organizational Appraisal. Narrative must name Blue Door as the prerequisite for any deeper engagement.
- **Custom workshops:** Surface via the workshops-page fallout pointing to `/speaking` (speaking topics double as workshops). Do not use the word "custom."
- **Labs:** Reserved for the B2C track. The only allowed B2B Lab reference is a conditional crossover note when answers signal an individual leader's development need (e.g., RT-C with Q1Cap=Strategic + Q2Cap=Individual+Team). That note must redirect the individual leader to retake the quiz on the B2C track.

**Why:** Labs are individual peer cohorts. Recommending them to org buyers misaligns the engagement model.

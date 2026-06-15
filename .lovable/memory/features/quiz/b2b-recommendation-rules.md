---
name: B2B Quiz Recommendation Rules
description: P.A.T.H.finder Quiz B2B recommends up to 3 Workshops + Blue Door + up to 3 Speaking topics + up to 2 Free Resources. Labs are B2C unless individual focus signaled.
type: feature
---

For the P.A.T.H.finder Quiz B2B track (`src/data/pathFinderQuiz.ts`, `b2bResult`):

- **Primary recommendations:** Up to 3 Workshops (no Labs in any RT-A/B/C/D/E primary slate).
- **Deeper option:** Always include Blue Door Organizational Appraisal. Narrative must name Blue Door as the prerequisite for any deeper engagement.
- **Speaking Topics:** Up to 3 admin-eligible keynotes per RT via `SPEAKING_BY_RT`.
- **Free Resources:** Up to 2 admin-eligible resources per RT via `FREE_RESOURCES_BY_RT` (Strategic Change Canvas, Change Comms Workbook, Stractical Mini, Burnout Resources, 52 Weeks of Stoicism).
- **Additional sessions note:** The renderer already surfaces a `topicArea` note inviting users to ask about additional workshop/speaking sessions in their topic area.
- **Custom workshops:** Surface via the workshops-page fallout pointing to `/speaking`. Do not use the word "custom."
- **Labs:** Reserved for the B2C track. The only allowed B2B Lab reference is a conditional crossover note when answers signal an individual leader's development need.

**Why:** Labs are individual peer cohorts. Recommending them to org buyers misaligns the engagement model. Free Resources give B2B buyers a low-friction starting point alongside the deeper engagement options.

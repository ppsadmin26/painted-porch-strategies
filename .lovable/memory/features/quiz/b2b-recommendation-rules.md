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
- **Labs:** Reserved for the B2C track. Allowed B2B Lab references:
  1. The conditional crossover **note** on RT-C when Q1Cap=B + Q2Cap=C.
  2. **Scout reroute (`applyScoutReroute`)** when Q4DM="A" ("Just me — exploring before bringing a recommendation to others"). This is an explicit individual-focus signal, so the result is reframed as "Scout Mode": primary becomes one mapped AMPLIFY Lab (picked from the branch Q1) + a free/micro starter (`stracticalMini`, `stoicLeaderFieldGuide`). Workshops demote to "When You're Ready to Bring Your Team — Workshops to Pitch." Blue Door reframes to "When You're Ready to Go Deeper." Track stays `b2b` so contact prefill + topic area still reflect org-level intent.

**Lab pick map (scout):** RT-A → conflictToConnection (or goldilocks for Q1Team=C, leadingChange for Q1Team=D). RT-B → leadingChange (or aiEiOh for Q1Change=D). RT-C → stractical (Q1Cap=B), stoicism (A/D), goldilocks (C). RT-D → stractical (default), stoicism (Q1Strategic=A), aiEiOh (Q1Strategic=C). RT-E → stractical.

**Why:** Labs are individual peer cohorts. Recommending them to org buyers misaligns the engagement model — except when the buyer explicitly says they're individually scouting, in which case the lab is exactly what lets them experience the work firsthand before pitching the team. Free Resources give B2B buyers a low-friction starting point alongside deeper engagement options.

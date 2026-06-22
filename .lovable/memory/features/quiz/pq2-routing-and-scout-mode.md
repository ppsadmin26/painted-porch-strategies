---
name: PQ2 Routing & Scout-Mode Exception
description: P.A.T.H.finder quiz has 8 B2C questions (PQ1 + PQ2 + Q1-Q6) and 7 B2B questions (PQ1 + OrgPQ2 + branch Q1/Q2/Q3 + Q4DM + OrgPQ3). PQ2 (current vs aspiring) drives B2C narrative variants. Q4DM=A triggers B2B → Scout-Mode reroute (Lab primary). Both must be enumerated dimensions in any routing report.
type: feature
---

# Quiz Question Structure (canonical)

**B2C track (8 questions):** PQ1=A → **PQ2** (current/aspiring) → Q1 → Q2 → Q3 → Q4 → Q5 → Q6
**B2B track (7 questions):** PQ1=B → OrgPQ2 (A/B/C/D = team/change/cap/strategic) → branch Q1 + Q2 + Q3 → **Q4DM** (A/B/C/D = scope of decision) → OrgPQ3 (A/B/C)

# PQ2 (B2C) — Current vs. Aspiring Leader

`PQ2` is **not** scored against result type — it modifies **narrative copy only** inside each B2C result. Both `current` and `aspiring` produce the same primary/secondary/free recommendations for a given Q1-Q6 slate, but the result narrative shifts framing (e.g., "you've built capacity, now lead a team" vs. "you're building toward leading others").

**Implication for reports:** PQ2 doubles the number of distinct B2C variants. Any routing report MUST enumerate `["current", "aspiring"]` as an outer loop and include PQ2 in the variant fingerprint, otherwise current/aspiring narrative variants collapse into one row and the report under-represents B2C variation by 2×.

# Q4DM=A (B2B) — Scout-Mode Exception

When a B2B respondent picks `Q4DM="A"` ("Just me — exploring before bringing a recommendation to others"), `applyScoutReroute` rewrites the result:

- **Primary group** → one mapped AMPLIFY Lab (picked from branch Q1, see lab map in `b2b-recommendation-rules`) + `stracticalMini`
- **Workshops** → demoted to "When You're Ready to Bring Your Team — Workshops to Pitch"
- **Blue Door** → reframed as "When You're Ready to Go Deeper — Blue Door (for the org)"
- **Strongest next step** → the Lab, labeled "Try the Lab Yourself"
- **Subhead** → "Scout Mode — Start Solo, Bring the Team Later"
- **Track / contactPrefill / topicArea** → unchanged (preserves org-level intent signal)

**This is the only Q4DM value that rewrites the recommendation slate.** Q4DM=B/C/D keep the standard B2B output and only affect Blue Door urgency framing inside the narrative.

# Report Generator Requirements

Any script generating a P.A.T.H.finder routing report (current: `scripts/generate-quiz-report-v2.mts`) MUST:

1. **B2C loop:** enumerate `PQ2 ∈ {current, aspiring}` × `Q1-Q6 ∈ {A,B,C,D}^6` = 8,192 combinations.
2. **B2B loop:** enumerate every branch with **all four `Q4DM` values** (A/B/C/D), not just C. Otherwise scout-mode variants never appear.
3. **Fingerprint:** include `PQ2` (B2C) and `Q4DM` (B2B) in the variant fingerprint so narrative/structural variants don't collapse.
4. **Variant label:** surface `_Current Leader_` / `_Aspiring Leader_` tag on B2C variants and `_Scout Mode (Q4DM=A)_` tag on B2B variants in the report header.

# Test Coverage

- `src/data/__tests__/pathFinderQuiz.b2c.test.ts` — exhaustive 4,096-combo enumeration of Q1-Q6 (PQ2 doesn't change recommendations so it's not multiplied here).
- `src/data/__tests__/pathFinderQuiz.b2b.test.ts` — Labs guardrail excludes Q4DM=A (scout exception); separate `describe` block asserts scout reroute produces the expected Lab + structural rewrites per branch.

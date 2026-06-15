## Goal

Replace the hardcoded "viewable" allowlist with a single admin-driven rule that controls both B2B and B2C P.A.T.H.finder recommendations:

> An offering is recommendable **only if** `is_live = true` AND at least one of `current_url`, `dedicated_url`, or `anchor_id` is set in `/admin/path-finder-offerings`.

Also add visible speaking topics to the B2B recommendation pool, deep-linked to topic cards on each speaker page.

## Changes

### 1. Quiz engine (`src/data/pathFinderQuiz.ts`)
- Remove the hardcoded `VIEWABLE_B2B_KEYS` constant.
- Rename `BuildResultOptions.featuredKeys` → `viewableKeys` (semantic shift: "what the admin has marked clickable").
- Apply the eligibility filter to **both** B2C and B2B primary picks. Same graceful fallback: if filtering empties a pick, fall back to the unfiltered list so a result never goes blank.
- Add new `OFFERINGS` entries for speaking topics, tier `"Speaking"`, blurbs sourced from each speaker page. Examples:
  - `speakingHeroesAssemble`, `speakingShIFtHappens`, `speakingAlicePrinciples`, `speakingDontPanic`, `speakingAiEiOh` (Amy)
  - `speakingHighFidelity`, `speakingPowerOfStory`, `speakingGetClear`, `speakingBorderless`, `speaking88`, `speakingCommStyle` (Rob)
  - `speakingRadicallyMindful`, `speakingReignitingResilience`, `speakingFindingJoy`, `speakingMoveShakeInnovate`, `speakingPassengerToPilot` (Sierra)
- Add speaking keys to the appropriate RT candidate pools (RT-A team/people, RT-B change, RT-C capability, RT-E exploring). They naturally fall out of recommendations if the admin hasn't marked the row Live.

### 2. Speaker detail page (`SpeakerDetailPage.tsx` + 3 speaker data files)
- Add optional `slug` to `SpeakingTopic`.
- Render each topic card with `id={`topic-${topic.slug}`}` and `scroll-mt-24`.
- Backfill `slug` on every topic in `AmySpeaker.tsx`, `RobSpeaker.tsx`, `SierraSpeaker.tsx` (kebab-case from title).

### 3. Quiz dialog (`PathFinderQuizDialog.tsx`)
- Replace the `featuredKeys` fetch with a `viewableKeys` fetch:
  ```
  is_live = true AND (current_url <> '' OR dedicated_url IS NOT NULL OR anchor_id IS NOT NULL)
  ```
- Pass `viewableKeys` to `buildResult` (used for both tracks now).

### 4. Admin UI (`/admin/path-finder-offerings`)
- Show a "Quiz eligible" indicator badge on each row, computed live as `is_live && (current_url || dedicated_url || anchor_id)`. Green check when eligible, gray dash when not, with hover text explaining why.
- Update the helper text under the `is_featured_in_quiz` toggle: clarify it now only **prioritizes** an already-eligible offering (it no longer gates eligibility).
- Add `Speaking` to the tier color map.

### 5. Database (migration via insert tool, since it's data)
- Insert ~16 `path_finder_offerings` rows for the speaking topics:
  - `tier = 'Speaking'`, `facilitator` set to speaker, `is_live = true`
  - `current_url = '/speaking/amy' | '/speaking/rob' | '/speaking/sierra'`
  - `anchor_id = 'topic-{slug}'`
  - `is_featured_in_quiz = false` (admin can promote later)
  - `include_in_workshops = false`

### 6. Tests
- Update `pathFinderQuiz.b2b.test.ts` (and add b2c coverage) to use `viewableKeys` and verify:
  - With an empty eligible set, results fall back rather than going blank.
  - With only Blue Door + one workshop eligible, B2B narrows to those.
  - Speaking topics appear only when their key is in the eligible set.

### 7. Memory updates
- Update `mem://features/quiz/viewable-recommendation-rule` to describe the new admin-driven rule.
- Update `mem://features/quiz/b2b-recommendation-rules` to add "visible Speaking topics" as a third allowed category.

## Out of scope
- No new admin columns or schema changes (the existing `is_live`, `current_url`, `dedicated_url`, `anchor_id` already encode the rule).
- No changes to result narrative copy, scoring math, or B2C result groupings beyond the filter.
- No visible UI badge on speaker cards calling them "quiz-eligible".

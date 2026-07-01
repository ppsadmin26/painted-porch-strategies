
# /admin/offerings cleanup

## Problem

The card has grown to ~10 stacked blocks with overlapping purposes. Registry data (from the Op Platform) is interleaved with PPS-owned quiz/website controls, so it's hard to answer either "what's in the register?" or "how does this show up on the quiz?" at a glance.

## Target structure — two sections per card

Every offering card collapses to a header + two labeled sections. Nothing else floats between them.

```text
┌─ Card header ────────────────────────────────────────────────┐
│ [Tier chip] key · [Quiz eligible?] [Launch badge]  [Save]    │
└──────────────────────────────────────────────────────────────┘

┌─ 1. Registry (PPS Op Platform · read-only) ──── Edit in Ops ─┐
│  Thumbnail │ Name                                            │
│   16:10    │ Short blurb                                     │
│            │ Speaker(s): full names                          │
│            │ Category chips: Tier · Topic tag · Workshop ·   │
│            │                Keynote · Blue Door required     │
└──────────────────────────────────────────────────────────────┘

┌─ 2. PPS Controls ────────────────────────────────────────────┐
│  Quiz                                                         │
│   • Published [switch]  Pin to top [switch]                  │
│   • Routing rules summary (auto)  →  Full rules              │
│   • RT mapping checkboxes  ← ONLY if tier ∈ {Free, Speaking} │
│   • Linked launch [select]                                    │
│                                                               │
│  Website                                                      │
│   • Show on Speaker page [switch]                            │
│   • Hub URL / Dedicated URL / Anchor  (3 inputs)             │
│   • Quiz will link to: /resolved/url                          │
└──────────────────────────────────────────────────────────────┘
```

## What changes concretely

**Header (unchanged behavior, tightened):** tier chip, offering key, Quiz-eligible badge, Launch badge, Published switch, Save. Remove the standalone speaker chip (already done).

**Section 1 · Registry (read-only, one block instead of three):**
- Merge current "Display name / Short blurb / Topic tag" row + "Topic card" block + Workshop/Keynote/Blue-Door chip strip into a single card with a thumbnail on the left and text on the right.
- Category chips render inline: Tier · Topic tag · Workshop · Keynote · Blue Door required. All read-only, all show `· canonical` treatment, single "Edit in PPS Op Platform" link in the section header (not one per field).
- Show the thumbnail image itself, not the raw URL string.

**Section 2 · PPS Controls (all editable things in one place):**
- Sub-heading "Quiz" groups: Pin to top, Routing-rules summary (kept — it's the plain-English explainer), the RT checkbox grid **only** for Free + Speaking tiers, and Linked launch.
- Sub-heading "Website" groups: Show on Speaker page, the three URL inputs, and the "Quiz will link to:" resolved preview.
- Published stays in the header since it gates everything.

**Removals / consolidations:**
- Drop the `<details>` "How this page actually drives the quiz" at the page top — its content now lives contextually in each card's Routing-rules block, and `/admin/quiz-rules` is one click away.
- Drop the per-field "Edit in PPS Op Platform" repetition inside the Registry section; one link at the section header.
- The RT checkbox editor stays but is section-scoped and only rendered for Free/Speaking (already the case — we're just making that placement obvious under the "Quiz" sub-heading).

**Untouched:** filter/search bar, top Phase-C banner, broken-launch alert, resync panel, New-offering dialog, save/dirty logic, all data fields, all DB writes.

## Files

- `src/pages/pps/admin/PathFinderOfferings.tsx` — restructure card JSX (~lines 573–898) into header + Registry section + PPS Controls section; remove the top `<details>` block.
- No schema changes, no changes to `OpPlatformResyncPanel`, `QuizRoutingRules`, or `quizRoutingSummary`.

## Out of scope

- Renaming fields or changing what syncs from the Op Platform.
- Bulk-edit / inline table view (can be a follow-up if the card view still feels heavy after this pass).

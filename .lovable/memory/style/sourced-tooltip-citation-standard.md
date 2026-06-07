---
name: Sourced Tooltip Citation Standard
description: Site-wide pattern for source citations using info-icon hover tooltip instead of footnote+sources-list
type: preference
---

**Standard:** All source citations across the site use the `<SourcedTooltip>` component (`src/components/pps/SourcedTooltip.tsx`) — a small info icon next to the stat, hover/focus reveals source name + clickable "View source →" link.

**Replaces:** Footnote superscripts (¹²³) + separate bottom "Sources" list. The legacy `StatSources` export in `StatCard.tsx` is `@deprecated` and kept only for backward compatibility with archived pages.

**How to apply:**
- New stat: `<SourcedTooltip source="McKinsey, 2024" sourceUrl="https://..." year="2024" />`
- `StatCard` auto-renders the tooltip via `showSourceTooltip` (default true). Don't set `footnoteNumber` on new code.
- When migrating an existing page, delete the "Sources" `<ol>` block and any `<sup>` markers.

**Reference impl:** `src/pages/pps/partner/AmplifyPathAlt.tsx` Cost-of-Skipping table; `src/components/pps/partner/ArchitectureGapSection.tsx`.

**Why:** Lower cognitive load, no page chrome dedicated to citations, scales as we add more stats.

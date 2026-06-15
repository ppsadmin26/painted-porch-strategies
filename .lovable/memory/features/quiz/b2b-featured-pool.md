---
name: B2B Quiz Featured Pool
description: B2B P.A.T.H.finder narrows recommendations to a curated "featured" pool (anchor_id OR is_featured_in_quiz on path_finder_offerings), shows up to 3 picks + topic note + Contact CTA
type: feature
---

The B2B P.A.T.H.finder quiz no longer dumps the full workshop catalog in results. It surfaces **up to 3 featured picks** per result type, then nudges the user toward a discovery conversation.

## Eligibility ("featured" set)
An offering is eligible for B2B quiz recommendations when **either**:
- `path_finder_offerings.is_featured_in_quiz = true` (manual admin toggle), OR
- `path_finder_offerings.anchor_id IS NOT NULL` (has a card/anchor on a public page)

Admin toggle lives on `/admin/offerings` next to the "Show in Browse All Workshop Topics" switch.

## Resolver behavior
- `buildResult(track, answers, { featuredKeys })` accepts an optional Set of allowed offering keys.
- `b2bResult` filters `primaryKeys` to the allowlist, then caps at 3.
- **Fallback safety:** if filtering would leave zero picks (admin curation gap), it falls back to the unfiltered top 3 so results never go blank.
- B2C track is unaffected.

## Results UI (PathFinderQuizDialog)
For B2B results, below the picks the dialog shows:
- A topic note: "We also offer additional speaking and workshop sessions in **{topicArea}**. Let's discuss on a quick call."
- A primary "Contact Us to Learn More" CTA → `/contact?...` deep link.

## Contact handoff
`buildContactHref` builds a `/contact?scope=...&interest=...&message=...&firstName=...&email=...` URL. The `message` packs:
- Result headline + topic area
- Strongest next step
- Top 3 picks (bullet list)
- Ask for "right fit in {topicArea}"

Contact page prefills scope/interest/message via existing URL-param logic. On submit, `submit-ghl-lead` already creates a GHL Opportunity ("New Lead" → "New/Interested") with the message as the `contact_form_details` custom field, so the quiz context flows through to the opportunity automatically — no new edge function or pipeline secrets needed.

## Per-result mapping (B2B_RESULT_META in pathFinderQuiz.ts)
| Result | Topic Area | Scope | Interests |
|---|---|---|---|
| RT-A | Team Dynamics & People | Team / Department | workshops |
| RT-B | Change & Transformation | Company | workshops |
| RT-C | Leadership Capability | Team / Department | workshops |
| RT-D | Strategic / Architectural Work | Company | blue-door, strategic-partnership |
| RT-E | Organizational Development | Team / Department | workshops |

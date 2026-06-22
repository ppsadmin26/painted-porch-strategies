## Objective
Extend the P.A.T.H. Finder quiz results to include 1-2 related content recommendations (blog posts and/or media appearances) based on the quiz result type. These appear as a "Related Reading" section in the result dialog and optionally in the results email.

## Scope
- B2C result types RT1-RT6 and B2B result types RT-A through RT-E
- 1-2 items max per result (blog post, media appearance, or one of each)
- Rendered in the quiz result dialog as a distinct group below offering recommendations
- Optionally included in the `path-finder-results` email template
- Graceful empty-state handling (section hidden if no matches)

## Out of Scope
- No new admin UI for curating quiz-related content
- No ML/semantic matching — deterministic category mapping only

## Decision Needed Before Implementation
**Category-to-Result mapping:** Provide the 1-3 blog category slugs and/or media types that should map to each result type. Example:
```
RT1 (B2C mindfulness)  -> blog categories: mindfulness, stoicism, burnout
RT-B (B2B change)      -> blog categories: change-leadership, resilience
RT-A (B2B team)        -> media types: podcast, video
```
If you don't have existing categories that align, we can use keyword filtering against post titles/excerpts as a fallback.

---

## Implementation Steps

### 1. DB Schema Discovery & Category Mapping (15 min)
- Confirm exact column names in `blog_categories` and `media_appearance_categories`
- Build static `RT_TO_CONTENT_CATEGORIES` map in `src/data/pathFinderQuiz.ts`
- If no clean category alignment exists, define keyword-based fallback filters

### 2. Type & Data Layer (30 min)
- Add `ContentItem` interface:
  ```ts
  interface ContentItem {
    kind: "blog" | "media";
    title: string;
    url: string;
    thumbnail?: string;
    excerpt?: string;
    date?: string;
  }
  ```
- Extend `QuizResult` with optional `relatedContent?: ContentItem[]`
- Add `relatedContent` to the `submit-path-finder-quiz` edge function payload shape

### 3. DB Query Hook in Dialog (45 min)
- After `buildResult` returns, fire 2 parallel Supabase queries in `PathFinderQuizDialog`:
  - `blog_posts`: join `blog_post_categories` -> `blog_categories`, filter by mapped slugs, `status='published'`, order by `publish_date DESC`, limit 2
  - `media_appearances`: join `media_appearance_categories`, filter by mapped types/categories, order by `appearance_date DESC`, limit 2
- Merge results, cap at 2 total items, and attach to the result object
- Handle loading state (show skeleton or delay section until loaded)

### 4. UI Rendering (45 min)
- Add a "Related Reading" or "From the Porch" group in the result dialog
- Layout: horizontal cards (thumbnail + title + excerpt) or compact list
- Respect brand tokens: teal links, navy headings, generous whitespace
- Hidden entirely when `relatedContent` is empty

### 5. Email Template Update (30 min)
- Add a "Related Reading" section to the `path-finder-results` transactional email template
- Same 1-2 items, rendered as linked titles with short excerpts
- If email scope feels like scope creep, this can be deferred to a follow-up

### 6. Tests (30 min)
- Add 1-2 cases in `pathFinderQuiz.viewable.test.ts` verifying `relatedContent` population
- Add Playwright assertion confirming the "Related Reading" section renders when content exists and hides when empty

---

## Total Estimated Time
2.5 - 3.5 hours (closer to 2.5 if email template is deferred)

## Risk & Fallback
- **Risk:** No published blog posts or media appearances match a given result type's mapped categories.
- **Fallback:** Section simply does not render. No broken UI. Admin can adjust mappings later or publish aligned content.

## Approval Needed
Please confirm:
1. Do you want the email template updated in this scope, or deferred?
2. Can you provide (or point me to) the blog category slugs that align with each quiz result type? Or should I derive keyword filters from the result headlines/narratives instead?